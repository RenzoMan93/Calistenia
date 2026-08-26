// Edge Function: mercadopago-create-preference
//
// Crea una preferencia de pago (Checkout Pro) para el usuario autenticado y
// devuelve la URL de pago. El external_reference queda con el user_id de
// Supabase para que el webhook sepa a quién activarle Premium.
//
// Deploy: supabase functions deploy mercadopago-create-preference
// Secrets necesarios: MP_ACCESS_TOKEN
// Variable opcional: APP_URL (para las back_urls y notification_url), si no
// se define se usa un valor genérico que conviene ajustar en producción.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRECIO_PREMIUM_UYU = 250;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const appUrl = Deno.env.get("APP_URL") || "https://tu-app.vercel.app";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    const preference = {
      items: [
        {
          title: "Calistenia + Nutrición — Premium (1 mes)",
          quantity: 1,
          currency_id: "UYU",
          unit_price: PRECIO_PREMIUM_UYU,
        },
      ],
      external_reference: userData.user.id,
      back_urls: {
        success: appUrl,
        pending: appUrl,
        failure: appUrl,
      },
      auto_return: "approved",
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();
    if (!mpRes.ok) {
      console.error("Error de Mercado Pago:", data);
      return new Response(JSON.stringify({ error: "No se pudo crear el pago" }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
