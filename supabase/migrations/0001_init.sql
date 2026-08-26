-- Calistenia + Nutrición — esquema inicial
-- Reemplaza window.storage (artefactos de Claude) por Postgres + Supabase Auth.
-- Corré esto una sola vez en tu proyecto Supabase (SQL editor o `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Datos por usuario, en formato clave/valor (mapea 1 a 1 con las claves que
--    ya usa la app: perfil, progresion, progresoSeries, registro:YYYY-MM-DD,
--    suscripcion, onboarding, referido, peso, metaPeso, planComidas, misMenus)
-- ---------------------------------------------------------------------------
create table if not exists public.user_data (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

create policy "user_data: dueño puede leer" on public.user_data
  for select using (auth.uid() = user_id);
create policy "user_data: dueño puede insertar" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "user_data: dueño puede actualizar" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_data: dueño puede borrar" on public.user_data
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_data_updated_at on public.user_data;
create trigger trg_user_data_updated_at
  before update on public.user_data
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2) Administradores de la app (para el panel oculto de códigos premium).
--    Después de crear tu cuenta, insertá tu user_id acá (ver README).
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
-- Sin policies: solo accesible por el service role o funciones SECURITY DEFINER.

-- ---------------------------------------------------------------------------
-- 3) Códigos de activación Premium (generados a mano por el admin, o por el
--    webhook de Mercado Pago en el futuro si se prefiere ese camino).
-- ---------------------------------------------------------------------------
create table if not exists public.premium_codes (
  codigo         text primary key,
  usado          boolean not null default false,
  creado_por     uuid references auth.users(id),
  fecha_creacion date not null default current_date,
  usado_por      uuid references auth.users(id),
  fecha_uso      date
);
alter table public.premium_codes enable row level security;
-- Sin policies: todo el acceso pasa por las funciones de abajo.

-- ---------------------------------------------------------------------------
-- 4) Sistema de referidos: un código propio por usuario + registro de canjes.
-- ---------------------------------------------------------------------------
create table if not exists public.referral_codes (
  codigo     text primary key,
  owner_id   uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.referral_codes enable row level security;

create table if not exists public.referral_redemptions (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null references public.referral_codes(codigo),
  redeemed_by uuid not null unique references auth.users(id) on delete cascade,
  fecha       date not null default current_date,
  notified    boolean not null default false
);
alter table public.referral_redemptions enable row level security;
-- Sin policies en ninguna de las dos: todo el acceso pasa por las funciones.

-- ---------------------------------------------------------------------------
-- Funciones auxiliares
-- ---------------------------------------------------------------------------

create or replace function public.soy_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Suma días extra a la suscripción del usuario indicado (crea el registro si
-- todavía no existe, aunque en el flujo normal siempre existe desde el alta).
create or replace function public._sumar_dias_bonus(p_user_id uuid, p_dias int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_data (user_id, key, value)
  values (
    p_user_id,
    'suscripcion',
    jsonb_build_object('trialStart', current_date, 'premium', false, 'diasBonus', p_dias)
  )
  on conflict (user_id, key) do update
    set value = jsonb_set(
      public.user_data.value,
      '{diasBonus}',
      to_jsonb(coalesce((public.user_data.value->>'diasBonus')::int, 0) + p_dias),
      true
    );
end;
$$;

create or replace function public._marcar_premium(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_data (user_id, key, value)
  values (p_user_id, 'suscripcion', jsonb_build_object('trialStart', current_date, 'premium', true, 'diasBonus', 0))
  on conflict (user_id, key) do update
    set value = jsonb_set(public.user_data.value, '{premium}', 'true'::jsonb, true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Referidos: obtener/crear el código propio
-- ---------------------------------------------------------------------------
create or replace function public.ensure_referral_code()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_codigo text;
  v_intentos int := 0;
begin
  select codigo into v_codigo from public.referral_codes where owner_id = auth.uid();
  if v_codigo is not null then
    return v_codigo;
  end if;

  loop
    v_codigo := 'AMI-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    begin
      insert into public.referral_codes (codigo, owner_id) values (v_codigo, auth.uid());
      return v_codigo;
    exception when unique_violation then
      v_intentos := v_intentos + 1;
      if v_intentos > 10 then
        raise exception 'No se pudo generar un código de referido único';
      end if;
    end;
  end loop;
end;
$$;

-- Canjea el código de invitación de otro usuario. Devuelve un status:
-- 'ok' | 'empty' | 'not_found' | 'self' | 'already_used'
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

-- El dueño de un código revisa si le canjearon el código desde su último
-- login y suma los días de bono correspondientes. Devuelve cuántos canjes
-- nuevos encontró.
create or replace function public.claim_referral_bonus()
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_mi_codigo text;
  v_count int;
begin
  select codigo into v_mi_codigo from public.referral_codes where owner_id = auth.uid();
  if v_mi_codigo is null then
    return 0;
  end if;

  with pendientes as (
    update public.referral_redemptions
      set notified = true
      where codigo = v_mi_codigo and notified = false
      returning 1
  )
  select count(*) into v_count from pendientes;

  if v_count > 0 then
    perform public._sumar_dias_bonus(auth.uid(), v_count * 3);
  end if;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Códigos Premium (panel de administración manual)
-- ---------------------------------------------------------------------------
create or replace function public.crear_codigo_premium()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_codigo text;
  v_intentos int := 0;
begin
  if not public.soy_admin() then
    raise exception 'No autorizado';
  end if;

  loop
    v_codigo := 'CALI-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    begin
      insert into public.premium_codes (codigo, creado_por) values (v_codigo, auth.uid());
      return v_codigo;
    exception when unique_violation then
      v_intentos := v_intentos + 1;
      if v_intentos > 10 then
        raise exception 'No se pudo generar un código único';
      end if;
    end;
  end loop;
end;
$$;

create or replace function public.listar_codigos_premium()
returns table (codigo text, usado boolean, fecha_creacion date, fecha_uso date)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.soy_admin() then
    raise exception 'No autorizado';
  end if;
  return query
    select p.codigo, p.usado, p.fecha_creacion, p.fecha_uso
    from public.premium_codes p
    order by p.fecha_creacion desc, p.codigo desc;
end;
$$;

-- Canjea un código de activación Premium. Devuelve 'ok' | 'not_found' | 'already_used'
create or replace function public.redeem_premium_code(p_codigo text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_codigo text := upper(trim(coalesce(p_codigo, '')));
  v_usado boolean;
begin
  if v_codigo = '' then
    return 'not_found';
  end if;

  select usado into v_usado from public.premium_codes where codigo = v_codigo for update;
  if not found then
    return 'not_found';
  end if;
  if v_usado then
    return 'already_used';
  end if;

  update public.premium_codes
    set usado = true, usado_por = auth.uid(), fecha_uso = current_date
    where codigo = v_codigo;

  perform public._marcar_premium(auth.uid());
  return 'ok';
end;
$$;
