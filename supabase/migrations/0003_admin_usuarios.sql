-- Panel de administración: ver usuarios registrados y activarles Premium a mano.
-- Corré esto en el SQL Editor de Supabase (después de 0001_init.sql y 0002_premium_mensual.sql).

-- Lista todos los usuarios registrados con su estado de suscripción.
-- Solo accesible para cuentas en la tabla admins (ver soy_admin()).
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
      u.email,
      u.created_at,
      (perfil.value->>'nombre')::text,
      (sus.value->>'trialStart')::date,
      coalesce((sus.value->>'diasBonus')::int, 0),
      (sus.value->>'premiumHasta')::date
    from auth.users u
    left join public.user_data sus on sus.user_id = u.id and sus.key = 'suscripcion'
    left join public.user_data perfil on perfil.user_id = u.id and perfil.key = 'perfil'
    order by u.created_at desc;
end;
$$;

-- Activa (o extiende) Premium para el usuario con ese email, buscándolo por
-- email en vez de necesitar su user_id. Devuelve 'ok' | 'not_found'.
create or replace function public.admin_activar_premium(p_email text, p_dias int default 30)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
begin
  if not public.soy_admin() then
    raise exception 'No autorizado';
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email));
  if v_user_id is null then
    return 'not_found';
  end if;

  perform public._extender_premium(v_user_id, p_dias);
  return 'ok';
end;
$$;
