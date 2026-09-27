import { C } from "../tema";
import { diasEntre } from "../lib/fechas";

export const DIAS_PRUEBA = 7;

export const NIVEL_LIMITE_FREE = 3;

export const UMBRAL_SUBIR_NIVEL = 8;

export const PRECIO_PREMIUM = "$250";

export const WHATSAPP_CONTACTO = "59892778233";

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_CONTACTO}`;

export const PLAN_FREE = [
  "Registro diario de entrenamiento y comidas",
  "Progresión de calistenia hasta el nivel 3 de cada grupo",
  "Alimentos rápidos y barras de macros",
  "Consejos saludables generales",
];

export const PREMIUM_TITULO = "Deja de entrenar a ciegas";

export const PREMIUM_SUBTITULO = "Progresión guiada, comida resuelta y tu progreso real a la vista — no solo una lista de ejercicios.";

export const PLAN_PREMIUM = [
  "Llega a movimientos avanzados de verdad (muscle-up, pistol squat, front lever) con progresión guiada paso a paso, sin quemar etapas",
  "Nunca te quedas sin saber qué comer: recetas armadas con lo que ya tienes en la heladera",
  "Sabe exactamente qué comer en cada momento del día para llegar justo a tus macros",
  "Registra cualquier comida que hagas, sin límites",
  "Vive tu progreso real: gráfico de peso corporal y tu mejor marca en cada ejercicio",
  "Logros e insignias que te mantienen constante",
  "Racha semanal para no perder el ritmo",
];

// El acceso Premium se calcula comparando la fecha de vencimiento con hoy,
// nunca queda "activado para siempre": cada pago o código extiende
// premiumHasta 30 días (ver _extender_premium en el backend).
export const premiumActivo = (suscripcion, fecha) => Boolean(suscripcion?.premiumHasta) && suscripcion.premiumHasta >= fecha;

// Mismo cálculo que arriba pero para una fila del listado de admin (que trae
// los campos en snake_case desde la función admin_listar_usuarios).
export function estadoUsuarioAdmin(u, fecha) {
  if (u.premium_hasta && u.premium_hasta >= fecha) {
    return { texto: `Premium (${diasEntre(fecha, u.premium_hasta)}d)`, color: C.food };
  }
  if (u.trial_start) {
    const usados = diasEntre(u.trial_start, fecha);
    const restantes = Math.max(DIAS_PRUEBA + (u.dias_bonus || 0) - usados, 0);
    if (restantes > 0) return { texto: `Prueba (${restantes}d)`, color: C.muted };
  }
  return { texto: "Sin acceso", color: C.danger };
}
