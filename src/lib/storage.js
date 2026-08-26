import { supabase } from "./supabaseClient";

// Reemplazo de window.storage.get/set (artefactos de Claude) por Postgres vía
// Supabase, con los datos de cada usuario aislados por Row Level Security.
// Las claves ("perfil", "progresion", "registro:YYYY-MM-DD", etc.) son las
// mismas que ya usaba la app; solo cambia dónde viven.

async function currentUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.user) {
    throw new Error("No hay sesión activa");
  }
  return data.session.user.id;
}

export async function safeGet(key) {
  try {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("user_data")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return data ? data.value : null;
  } catch (e) {
    console.error("storage get error", key, e);
    return null;
  }
}

export async function safeSet(key, value) {
  try {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: userId, key, value }, { onConflict: "user_id,key" });
    if (error) throw error;
  } catch (e) {
    console.error("storage set error", key, e);
  }
}

// Equivalente a window.storage.list("registro:2026-08") del código original:
// devuelve el set de fechas (YYYY-MM-DD) que tienen registro guardado en ese mes.
export async function listRegistroKeysForMonth(monthKey) {
  try {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("user_data")
      .select("key")
      .eq("user_id", userId)
      .like("key", `registro:${monthKey}-%`);
    if (error) throw error;
    return new Set((data || []).map((r) => r.key.replace("registro:", "")));
  } catch (e) {
    console.error("storage list error", monthKey, e);
    return new Set();
  }
}

export async function verificarStorage() {
  try {
    const marca = String(Date.now());
    await safeSet("__test_storage__", { marca });
    const leido = await safeGet("__test_storage__");
    return Boolean(leido && leido.marca === marca);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Referidos — todo pasa por funciones RPC (SECURITY DEFINER) para que nadie
// pueda fabricar canjes o días de bono editando datos directamente.
// ---------------------------------------------------------------------------

export async function ensureReferralCode() {
  const { data, error } = await supabase.rpc("ensure_referral_code");
  if (error) {
    console.error("ensure_referral_code error", error);
    return null;
  }
  return data;
}

const MENSAJES_REFERIDO = {
  empty: "Ingresá un código.",
  not_found: "Ese código no existe.",
  self: "No podés usar tu propio código.",
  already_used: "Ya usaste un código de invitación.",
  ok: "¡Listo! Sumaste 3 días extra de prueba.",
};

export async function redeemReferralCode(codigoIngresado) {
  const { data, error } = await supabase.rpc("redeem_referral_code", { p_codigo: codigoIngresado });
  if (error) {
    console.error("redeem_referral_code error", error);
    return { ok: false, mensaje: "No se pudo canjear el código. Probá de nuevo." };
  }
  return { ok: data === "ok", mensaje: MENSAJES_REFERIDO[data] || "No se pudo canjear el código." };
}

export async function claimReferralBonus() {
  const { data, error } = await supabase.rpc("claim_referral_bonus");
  if (error) {
    console.error("claim_referral_bonus error", error);
    return 0;
  }
  return data || 0;
}

// ---------------------------------------------------------------------------
// Códigos Premium (panel oculto de administración)
// ---------------------------------------------------------------------------

export async function soyAdmin() {
  const { data, error } = await supabase.rpc("soy_admin");
  if (error) {
    console.error("soy_admin error", error);
    return false;
  }
  return Boolean(data);
}

export async function crearCodigoPremium() {
  const { data, error } = await supabase.rpc("crear_codigo_premium");
  if (error) throw error;
  return data;
}

export async function listarCodigosPremium() {
  const { data, error } = await supabase.rpc("listar_codigos_premium");
  if (error) throw error;
  return data || [];
}

const MENSAJES_PREMIUM = {
  not_found: "Ese código no existe. Revisá que esté bien escrito.",
  already_used: "Ese código ya fue usado.",
  ok: "¡Código válido! Premium activado.",
};

export async function redeemPremiumCode(codigoIngresado) {
  const { data, error } = await supabase.rpc("redeem_premium_code", { p_codigo: codigoIngresado });
  if (error) {
    console.error("redeem_premium_code error", error);
    return { ok: false, mensaje: "No se pudo canjear el código. Probá de nuevo." };
  }
  return { ok: data === "ok", mensaje: MENSAJES_PREMIUM[data] || "Código inválido." };
}

// ---------------------------------------------------------------------------
// Mercado Pago y coach con IA — funciones del lado del servidor (Edge Functions)
// ---------------------------------------------------------------------------

export async function crearPreferenciaPago() {
  const { data, error } = await supabase.functions.invoke("mercadopago-create-preference");
  if (error) throw error;
  return data?.init_point;
}

export async function llamarCoach(messages) {
  const { data, error } = await supabase.functions.invoke("coach", { body: { messages } });
  if (error) throw error;
  if (!data?.texto) throw new Error("Respuesta vacía del coach");
  return data.texto;
}
