import React, { useState } from "react";
import { Dumbbell, Lightbulb } from "lucide-react";
import { C } from "../tema";
import { IconoEjercicio } from "../components/figuras.jsx";
import { NOMBRE_OBJETIVO, consejosPersonalizados } from "../data/nutricion";
import { Panel } from "../components/ui.jsx";
import { TRACKS } from "../data/entrenamiento";

// ---------- PROGRESO ----------
// ---------- CONSEJOS ----------
export function VistaConsejos({ perfil, progresion }) {
  const [trackAbierto, setTrackAbierto] = useState(null);
  return (
    <div>
      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={16} color={C.food} />
          <span className="display text-sm" style={{ color: C.food }}>CONSEJOS SALUDABLES</span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: C.muted }}>
          Personalizados para tu objetivo: <span style={{ color: C.food }}>{NOMBRE_OBJETIVO[perfil.objetivo] || NOMBRE_OBJETIVO.mantener}</span>
        </p>
        <div className="flex flex-col gap-2">
          {consejosPersonalizados(perfil.objetivo).map((c, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="mono" style={{ color: C.food }}>{String(i + 1).padStart(2, "0")}</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell size={16} color={C.train} />
          <span className="display text-sm" style={{ color: C.train }}>TÉCNICA POR GRUPO MUSCULAR</span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: C.muted }}>Toca un grupo para ver el consejo de cada ejercicio.</p>
        <div className="flex flex-col gap-2">
          {Object.entries(TRACKS).map(([key, track]) => (
            <div key={key}>
              <button
                onClick={() => setTrackAbierto(trackAbierto === key ? null : key)}
                className="w-full flex items-center justify-between rounded px-3 py-2"
                style={{ background: C.panelAlt }}
              >
                <span className="text-sm font-medium">{track.nombre}</span>
                <span className="text-xs mono" style={{ color: C.muted }}>{trackAbierto === key ? "▲" : "▼"}</span>
              </button>
              {trackAbierto === key && (
                <div className="flex flex-col gap-2 mt-2">
                  {track.ejercicios.map((ej, i) => (
                    <div key={ej.nombre} className="rounded px-3 py-2 flex items-center gap-3" style={{ background: C.panelAlt }}>
                      <IconoEjercicio figuras={ej.figura} size={56} />
                      <div>
                        <div className="text-xs font-medium mb-0.5">{i + 1}. {ej.nombre}</div>
                        <div className="text-[11px]" style={{ color: C.muted }}>{ej.tip}</div>
                        {ej.sinEquipo && (
                          <div className="text-[11px] mt-1" style={{ color: C.food }}>
                            <b>Sin equipo:</b> {ej.sinEquipo}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
