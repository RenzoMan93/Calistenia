// Edge Function: coach
//
// Proxy hacia la API de Anthropic para el coach virtual. La key de Anthropic
// vive como secreto del lado del servidor (nunca llega al navegador). Solo
// responde a usuarios autenticados con acceso Premium activo (suscripción
// paga o dentro de los 7 días de prueba), para no gastar créditos con
// cualquiera que llame a la función.
//
// Deploy: supabase functions deploy coach
// Secrets necesarios: ANTHROPIC_API_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4?target=deno";

const DIAS_PRUEBA = 7;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COACH_SYSTEM_PROMPT = `Sos el coach virtual de una app que combina calistenia y nutrición, hablás en español rioplatense (Uruguay/Argentina), tono cercano y directo. Respondé cualquier pregunta relacionada con entrenamiento de calistenia (técnica, progresiones de empuje/tracción/piernas/core, movilidad, frecuencia de entrenamiento), nutrición (macros, qué comer, calorías, hidratación) y hábitos saludables en general (descanso, motivación, constancia). Nunca digas que un tema "no te corresponde" si tiene que ver con entrenamiento, alimentación o bienestar: siempre das una respuesta útil, aunque sea general. Respuestas cortas (máximo 5-6 líneas), prácticas, sin relleno. No sos médico ni nutricionista con matrícula: si preguntan por dolor persistente, lesiones, o piden un diagnóstico o plan médico específico, dale una orientación general breve y recomendale consultar a un profesional para eso puntual, pero no dejes la pregunta sin responder.`;

function diasEntre(desde: string, hasta: string) {
  return Math.floor((new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000);
}

function tieneAccesoPremium(suscripcion: any) {
  if (!suscripcion) return false;
  if (suscripcion.premium) return true;
  const hoy = new Date().toISOString().slice(0, 10);
  const usados = diasEntre(suscripcion.trialStart, hoy);
  const restantes = DIAS_PRUEBA + (suscripcion.diasBonus || 0) - usados;
  return restantes > 0;
}

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

    const { data: susRow } = await supabase
      .from("user_data")
      .select("value")
      .eq("user_id", userData.user.id)
      .eq("key", "suscripcion")
      .maybeSingle();

    if (!tieneAccesoPremium(susRow?.value)) {
      return new Response(JSON.stringify({ error: "Requiere Premium" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Falta el historial de mensajes" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: COACH_SYSTEM_PROMPT,
        messages: messages.slice(-20),
      }),
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok) {
      console.error("Error de Anthropic:", data);
      return new Response(JSON.stringify({ error: data?.error?.message || "Error del coach" }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const texto = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    return new Response(JSON.stringify({ texto }), {
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
