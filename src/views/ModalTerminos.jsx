import React from "react";
import { X } from "lucide-react";
import { C } from "../tema";
import { DIAS_PRUEBA, WHATSAPP_LINK } from "../data/planes";

export function ModalTerminos({ onCerrar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", zIndex: 80 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }} className="rounded-lg p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>TÉRMINOS Y PRIVACIDAD</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <div className="flex flex-col gap-4 text-xs" style={{ color: C.text }}>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Qué es esta app</div>
            <p style={{ color: C.muted }}>
              Calistenia + Nutrición es una herramienta de entrenamiento y registro alimentario. No reemplaza el asesoramiento de un médico, nutricionista o entrenador con matrícula. Si tienes una condición de salud preexistente, consulta a un profesional antes de empezar cualquier rutina.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Qué datos guardamos</div>
            <p style={{ color: C.muted }}>
              Guardamos lo que cargas tú: perfil (objetivo, peso, altura, calorías) y tus registros de entrenamiento y comidas. Esta información se guarda asociada a tu cuenta y no se comparte ni se vende a terceros.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Suscripción Premium</div>
            <p style={{ color: C.muted }}>
              Incluye {DIAS_PRUEBA} días de prueba gratis. Pasado ese período, el plan Premium se cobra por mes a través de Mercado Pago. Puedes dejar de usarla cuando quieras: no se renueva sola sin que actives un nuevo pago.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Borrar tus datos o contactarnos</div>
            <p style={{ color: C.muted }}>
              Si en algún momento quieres que borremos tu información, o tienes cualquier duda, escríbenos por WhatsApp al{" "}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: C.food }}>
                +598 92 778 233
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
