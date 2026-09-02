// Edge Function: mercadopago-webhook
//
// Recibe la notificación (IPN / webhook) de Mercado Pago cuando el estado de
// un pago cambia. Si el pago está aprobado, extiende 30 días el vencimiento
// de Premium (premiumHasta) para el usuario indicado en external_reference
// (ver mercadopago-create-preference). Si ya tenía Premium activo, extiende
// desde la fecha de vencimiento actual, no desde hoy, para no perder días.
//
// Configurá esta URL como "notification_url" en tu cuenta de Mercado Pago:
//   https://<tu-proyecto>.supabase.co/functions/v1/mercadopago-webhook
//
// Deploy: supabase functions deploy mercadopago-webhook --no-verify-jwt
// (--no-verify-jwt porque Mercado Pago llama a esta URL sin un JWT de Supabase)
//
// Secrets necesarios: MP_ACCESS_TOKEN, PROJECT_SERVICE_KEY
// (PROJECT_SERVICE_KEY = la "Secret key" de Project Settings > API Keys, la
// que empieza con sb_secret_... No usamos el secreto reservado
// SUPABASE_SERVICE_ROLE_KEY porque en proyectos con el sistema nuevo de
// claves aparece deprecado.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4?target=deno";

const DIAS_PREMIUM = 30;

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    let paymentId =
      url.searchParams.get("data.id") || url.searchParams.get("id");
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");

    if (!paymentId && req.method === "POST") {
      try {
        const body = await req.json();
        paymentId = body?.data?.id || body?.id || null;
      } catch {
        // cuerpo vacío o no-JSON, seguimos con lo que haya en query params
      }
    }

    if (!paymentId || (topic && topic !== "payment")) {
      // Mercado Pago manda otros tipos de eventos (merchant_order, etc.) que ignoramos.
      return new Response("ok", { status: 200 });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}` },
    });
    const payment = await mpRes.json();

    if (!mpRes.ok) {
      console.error("No se pudo leer el pago en Mercado Pago:", payment);
      return new Response("ok", { status: 200 });
    }

    if (payment.status === "approved" && payment.external_reference) {
      const userId = payment.external_reference;
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("PROJECT_SERVICE_KEY")!
      );

      // Idempotencia: si Mercado Pago reenvía esta misma notificación, el
      // insert falla por PK duplicada y no volvemos a sumar 30 días.
      const { error: yaProcesado } = await supabaseAdmin
        .from("mp_pagos_procesados")
        .insert({ payment_id: String(paymentId), user_id: userId });
      if (yaProcesado) {
        console.log(`Pago ${paymentId} ya procesado antes, no se vuelve a extender.`);
        return new Response("ok", { status: 200 });
      }

      const hoy = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabaseAdmin
        .from("user_data")
        .select("value")
        .eq("user_id", userId)
        .eq("key", "suscripcion")
        .maybeSingle();

      const vencimientoActual: string | undefined = existing?.value?.premiumHasta;
      const base = vencimientoActual && vencimientoActual > hoy ? vencimientoActual : hoy;
      const fechaBase = new Date(`${base}T00:00:00Z`);
      fechaBase.setUTCDate(fechaBase.getUTCDate() + DIAS_PREMIUM);
      const premiumHasta = fechaBase.toISOString().slice(0, 10);

      const nuevaSuscripcion = {
        trialStart: existing?.value?.trialStart || hoy,
        diasBonus: existing?.value?.diasBonus || 0,
        premiumHasta,
      };

      await supabaseAdmin
        .from("user_data")
        .upsert({ user_id: userId, key: "suscripcion", value: nuevaSuscripcion }, { onConflict: "user_id,key" });
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    // Devolvemos 200 igual: si contestamos error, Mercado Pago reintenta en loop.
    return new Response("ok", { status: 200 });
  }
});
