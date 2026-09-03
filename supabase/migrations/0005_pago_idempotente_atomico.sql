-- Hace atómico el "marcar pago como procesado" + "extender Premium" del
-- webhook de Mercado Pago.
--
-- Antes (mercadopago-webhook/index.ts), el webhook insertaba el payment_id
-- en mp_pagos_procesados (para idempotencia) y RECIÉN DESPUÉS leía la
-- suscripción y hacía el upsert que extiende premiumHasta, como dos pasos
-- separados. Si el paso de extender fallaba por cualquier motivo transitorio
-- (timeout, error de red, etc.) después de que el insert de idempotencia ya
-- había tenido éxito, el pago quedaba marcado como "procesado" para siempre
-- sin que el usuario hubiera recibido los 30 días: como la función siempre
-- responde 200 (para no entrar en loop de reintentos de Mercado Pago) y el
-- payment_id ya estaba en mp_pagos_procesados, ni un reintento del lado de
-- Mercado Pago podía recuperar esos días ya cobrados.
--
-- Esta función hace ambos pasos en una sola transacción de Postgres: si
-- extender falla, el insert de idempotencia también se revierte, así un
-- reintento (manual o de Mercado Pago) puede procesar el pago de nuevo en
-- vez de perderlo en silencio. Devuelve true si extendió Premium ahora,
-- false si el pago ya estaba procesado antes (nada que hacer).
--
-- Corré esto en el SQL Editor de Supabase después de las migraciones
-- anteriores.

create or replace function public.procesar_pago_mercadopago(p_payment_id text, p_user_id uuid, p_dias int default 30)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_filas int;
begin
  insert into public.mp_pagos_procesados (payment_id, user_id)
  values (p_payment_id, p_user_id)
  on conflict (payment_id) do nothing;
  get diagnostics v_filas = row_count;

  if v_filas = 0 then
    -- Ya se había procesado este payment_id antes (reenvío de Mercado Pago).
    return false;
  end if;

  perform public._extender_premium(p_user_id, p_dias);
  return true;
end;
$$;
