import React from "react";
import { Home, Dumbbell, Apple, TrendingUp, X, Crown, MessageCircle, Lightbulb, Star, Cast } from "lucide-react";
import { C } from "../tema";
import { DIAS_PRUEBA, PRECIO_PREMIUM, WHATSAPP_LINK } from "../data/planes";

export const AYUDA_SECCIONES = [
  {
    icon: Home,
    color: null,
    titulo: "Hoy",
    puntos: [
      "Calorías del día, plan de entrenamiento sugerido y lo que ya cargaste.",
      "\"+ Ejercicio\" / \"+ Comida\" cargan algo puntual sin cambiar de pestaña.",
    ],
  },
  {
    icon: Dumbbell,
    color: "train",
    titulo: "Entreno",
    puntos: [
      "Elige el grupo muscular y toca \"Iniciar entrenamiento\" (cuenta regresiva 3-2-1).",
      "El contador de repeticiones suma solo al ritmo que elijas; \"Serie terminada\" la guarda y arranca el descanso.",
      "Niveles 1 a 3 de cada grupo son gratis; del 4 en adelante, Premium.",
    ],
  },
  {
    icon: Apple,
    color: "food",
    titulo: "Nutrición",
    puntos: [
      "Macros del día y accesos rápidos para cargar comidas o buscar alimentos.",
      "\"Qué comer ahora\" recomienda según lo que te falta de macros hoy (Premium).",
      "\"En la heladera tengo...\": marca ingredientes y te sugiere qué recetas armar (Premium).",
      "Edita cómo repartes las calorías entre desayuno, almuerzo, merienda y cena.",
    ],
  },
  {
    icon: TrendingUp,
    color: null,
    titulo: "Progreso",
    puntos: ["Racha, logros, calendario, peso corporal y gráfico semanal de calorías (Premium)."],
  },
  {
    icon: Lightbulb,
    color: "food",
    titulo: "Consejos",
    puntos: [
      "Consejos de nutrición según tu objetivo (bajar, mantener o subir de peso).",
      "Técnica animada de cada ejercicio, con posición inicial y final.",
    ],
  },
  {
    icon: Star,
    color: "food",
    titulo: "Sugerir",
    puntos: ["Deja tu opinión con estrellas: la ven todos los usuarios, con tu nombre. Puedes borrar la tuya cuando quieras."],
  },
  {
    icon: Crown,
    color: "food",
    titulo: "Premium y prueba gratis",
    puntos: [
      `${DIAS_PRUEBA} días de prueba gratis con acceso completo.`,
      `Después, ${PRECIO_PREMIUM}/mes vía Mercado Pago (se renueva solo cada 30 días), o con un código de activación.`,
    ],
  },
  {
    icon: Cast,
    color: "food",
    titulo: "¿Cómo la veo en la tele?",
    puntos: [
      "Celular Android: desliza hacia abajo la barra de notificaciones y toca \"Transmitir\" (o en Chrome, los tres puntos → \"Transmitir\"). Necesitas un Chromecast o Smart TV con Chromecast en la misma wifi.",
      "iPhone: Centro de Control (desliza desde arriba a la derecha) → \"Duplicar pantalla\" (AirPlay), con Apple TV o una tele compatible.",
      "Computadora con Chrome: los tres puntos → \"Transmitir...\" (o clic derecho en la página). No está disponible en Chrome para Linux.",
    ],
  },
];

export function ModalAyuda({ onCerrar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", zIndex: 80 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }} className="rounded-lg p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="display text-sm" style={{ color: C.muted }}>¿CÓMO USAR LA APP?</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <p className="text-[11px] mb-4" style={{ color: C.muted }}>
          Una guía rápida de qué encuentras en cada pestaña.
        </p>
        <div className="flex flex-col gap-4">
          {AYUDA_SECCIONES.map((s) => {
            const Icon = s.icon;
            const tinte = s.color === "train" ? C.train : s.color === "food" ? C.food : C.text;
            return (
              <div key={s.titulo}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={15} color={tinte} />
                  <span className="text-sm font-medium" style={{ color: tinte }}>{s.titulo}</span>
                </div>
                <div className="flex flex-col gap-1.5 pl-1">
                  {s.puntos.map((p, i) => (
                    <p key={i} className="text-xs" style={{ color: C.muted }}>{p}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full text-center text-[10px] mt-4 underline"
          style={{ color: C.food }}
        >
          <MessageCircle size={11} /> ¿Sigues con dudas? Escríbenos por WhatsApp
        </a>
      </div>
    </div>
  );
}
