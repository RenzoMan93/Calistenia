// Edge Function: mercadopago-webhook
//
// Recibe la notificación (IPN / webhook) de Mercado Pago cuando el estado de
// un pago cambia. Si el pago está aprobado, activa Premium automáticamente
// para el usuario indicado en external_reference (ver mercadopago-create-preference).
//
// Configurá esta URL como "notification_url" en tu cuenta de Mercado Pago:
//   https://<tu-proyecto>.supabase.co/functions/v1/mercadopago-webhook
//
// Deploy: supabase functions deploy mercadopago-webhook --no-verify-jwt
// (--no-verify-jwt porque Mercado Pago llama a esta URL sin un JWT de Supabase)
//
// Secrets necesarios: MP_ACCESS_TOKEN, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4?target=deno";

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
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: existing } = await supabaseAdmin
        .from("user_data")
        .select("value")
        .eq("user_id", userId)
        .eq("key", "suscripcion")
        .maybeSingle();

      const nuevaSuscripcion = {
        trialStart: existing?.value?.trialStart || new Date().toISOString().slice(0, 10),
        diasBonus: existing?.value?.diasBonus || 0,
        premium: true,
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
