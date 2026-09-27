-- Cierra varias formas de conseguir Premium (o días de prueba) gratis
-- desde el navegador, sin pagar.
--
-- 1) Funciones internas llamables por cualquiera. En Supabase, toda función
--    del schema public se puede llamar por RPC con la anon key
--    (supabase.rpc("...")). Como _extender_premium, _sumar_dias_bonus y
--    procesar_pago_mercadopago son SECURITY DEFINER y reciben el user_id
--    por parámetro, cualquier usuario podía hacer
--      supabase.rpc("_extender_premium", { p_user_id: <su id>, p_dias: 3650 })
--    y quedar Premium 10 años. Ahora solo las puede ejecutar el servidor
--    (las otras funciones SECURITY DEFINER que las usan, y el webhook con la
--    service key).
--
-- 2) La clave "suscripcion" de user_data se podía escribir desde el cliente
--    (RLS dejaba al dueño insertar/actualizar/borrar cualquier clave), así
--    que alcanzaba con un upsert de { premiumHasta: "2099-12-31" }, o con
--    borrar la fila para reiniciar la prueba gratis. Ahora esa clave es de
--    solo lectura para el usuario, y la prueba la arranca
--    iniciar_suscripcion() del lado del servidor.
--
-- 3) Cuentas anónimas (las que se crean solas para probar la app sin
--    registrarse): cada una podía canjear un código de referido, así que
--    creando cuentas anónimas en loop el dueño del código sumaba 3 días
--    infinitas veces. Tampoco pueden publicar en la pizarra de sugerencias
--    (spam sin cuenta). Y se ocultan del listado de usuarios del admin.
--
-- Corré esto en el SQL Editor de Supabase después de las migraciones
-- anteriores.

-- ---------------------------------------------------------------------------
-- 1) Funciones internas: sin acceso por RPC
-- ---------------------------------------------------------------------------
revoke execute on function public._extender_premium(uuid, int) from public, anon, authenticated;
revoke execute on function public._sumar_dias_bonus(uuid, int) from public, anon, authenticated;
revoke execute on function public.procesar_pago_mercadopago(text, uuid, int) from public, anon, authenticated;
grant execute on function public.procesar_pago_mercadopago(text, uuid, int) to service_role;

-- ---------------------------------------------------------------------------
-- 2) "suscripcion" de solo lectura para el usuario
-- ---------------------------------------------------------------------------
drop policy if exists "user_data: dueño puede insertar" on public.user_data;
drop policy if exists "user_data: dueño puede actualizar" on public.user_data;
drop policy if exists "user_data: dueño puede borrar" on public.user_data;

create policy "user_data: dueño puede insertar" on public.user_data
  for insert with check (auth.uid() = user_id and key <> 'suscripcion');
create policy "user_data: dueño puede actualizar" on public.user_data
  for update using (auth.uid() = user_id and key <> 'suscripcion')
  with check (auth.uid() = user_id and key <> 'suscripcion');
create policy "user_data: dueño puede borrar" on public.user_data
  for delete using (auth.uid() = user_id and key <> 'suscripcion');

-- Arranca la prueba gratis del usuario actual (si todavía no tenía
-- suscripción) y devuelve la suscripción guardada. Si ya existía, no la toca.
create or replace function public.iniciar_suscripcion()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_value jsonb;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  insert into public.user_data (user_id, key, value)
  values (
    auth.uid(),
    'suscripcion',
    jsonb_build_object(
      'trialStart', (now() at time zone 'America/Montevideo')::date,
      'diasBonus', 0,
      'premiumHasta', null
    )
  )
  on conflict (user_id, key) do nothing;

  select value into v_value from public.user_data
    where user_id = auth.uid() and key = 'suscripcion';
  return v_value;
end;
$$;

revoke execute on function public.iniciar_suscripcion() from public, anon;
grant execute on function public.iniciar_suscripcion() to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Cuentas anónimas
-- ---------------------------------------------------------------------------
create or replace function public.es_anonimo()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt()->>'is_anonymous')::boolean, false);
$$;

create or replace function public.redeem_referral_code(p_codigo text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_codigo text := upper(trim(coalesce(p_codigo, '')));
  v_owner uuid;
begin
  if auth.uid() is null or public.es_anonimo() then
    return 'not_found';
  end if;
  if v_codigo = '' then
    return 'empty';
  end if;

  select owner_id into v_owner from public.referral_codes where codigo = v_codigo;
  if v_owner is null then
    return 'not_found';
  end if;
  if v_owner = auth.uid() then
    return 'self';
  end if;
  if exists (select 1 from public.referral_redemptions where redeemed_by = auth.uid()) then
    return 'already_used';
  end if;

  insert into public.referral_redemptions (codigo, redeemed_by) values (v_codigo, auth.uid());
  perform public._sumar_dias_bonus(auth.uid(), 3);
  return 'ok';
end;
$$;

drop policy if exists "sugerencias: cada usuario postea las suyas" on public.sugerencias;
create policy "sugerencias: cada usuario postea las suyas" on public.sugerencias
  for insert with check (auth.uid() = user_id and not public.es_anonimo());

create or replace function public.admin_listar_usuarios()
returns table (
  user_id uuid,
  email text,
  creado timestamptz,
  nombre text,
  trial_start date,
  dias_bonus int,
  premium_hasta date
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.soy_admin() then
    raise exception 'No autorizado';
  end if;
  return query
    select
      u.id,
      u.email::text,
      u.created_at,
      (perfil.value->>'nombre')::text,
      (sus.value->>'trialStart')::date,
      coalesce((sus.value->>'diasBonus')::int, 0),
      (sus.value->>'premiumHasta')::date
    from auth.users u
    left join public.user_data sus on sus.user_id = u.id and sus.key = 'suscripcion'
    left join public.user_data perfil on perfil.user_id = u.id and perfil.key = 'perfil'
    where not coalesce(u.is_anonymous, false)
    order by u.created_at desc;
end;
$$;
