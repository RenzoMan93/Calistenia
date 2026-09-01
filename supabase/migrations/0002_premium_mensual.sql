-- Vencimiento mensual real de Premium.
-- Antes: redeem_premium_code marcaba premium=true para siempre (nunca se vencía).
-- Ahora: cada pago o código canjeado extiende "premiumHasta" 30 días desde la
-- fecha de hoy o desde el vencimiento actual (lo que sea más tarde), así
-- renovar antes de que venza no hace perder días. El acceso premium se
-- calcula comparando premiumHasta con la fecha de hoy (sin necesidad de un
-- cron que "apague" nada).
--
-- Corré esto en el SQL Editor de Supabase (una sola vez, después de 0001_init.sql).

create or replace function public._extender_premium(p_user_id uuid, p_dias int default 30)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actual date;
  v_base date;
  v_nueva date;
begin
  select (value->>'premiumHasta')::date into v_actual
    from public.user_data where user_id = p_user_id and key = 'suscripcion';

  v_base := greatest(coalesce(v_actual, current_date), current_date);
  v_nueva := v_base + p_dias;

  insert into public.user_data (user_id, key, value)
  values (
    p_user_id,
    'suscripcion',
    jsonb_build_object('trialStart', current_date, 'diasBonus', 0, 'premiumHasta', to_jsonb(v_nueva))
  )
  on conflict (user_id, key) do update
    set value = jsonb_set(public.user_data.value, '{premiumHasta}', to_jsonb(v_nueva), true);
end;
$$;

-- redeem_premium_code ahora extiende 30 días en vez de marcar premium=true para siempre.
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

  perform public._extender_premium(auth.uid(), 30);
  return 'ok';
end;
$$;

-- _marcar_premium queda obsoleta (la reemplaza _extender_premium).
drop function if exists public._marcar_premium(uuid);

-- Idempotencia del webhook de Mercado Pago: MP puede reenviar la misma
-- notificación más de una vez (reintentos). Como ahora cada pago SUMA 30
-- días (en vez de solo poner premium=true), hay que asegurarse de procesar
-- cada payment_id una sola vez, o un reenvío duplicado sumaría días de más.
create table if not exists public.mp_pagos_procesados (
  payment_id  text primary key,
  user_id     uuid references auth.users(id),
  procesado_en timestamptz not null default now()
);
alter table public.mp_pagos_procesados enable row level security;
-- Sin policies: solo lo usa el webhook con el service role key.
