import React, { useState } from "react";
import { Dumbbell } from "lucide-react";
import { BannerStorage } from "../components/banners.jsx";
import { C } from "../tema";
import { DIAS_PRUEBA, PRECIO_PREMIUM } from "../data/planes";
import { NIVELES_ACTIVIDAD, OBJETIVOS, calcularObjetivoDiario } from "../data/nutricion";
import { NIVEL_OPCIONES } from "../data/entrenamiento";

// ---------- ONBOARDING ----------
export function Onboarding({ onCompletar, storageDisponible }) {
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("mantener");
  const [datos, setDatos] = useState({ peso: "", altura: "", edad: "", sexo: "hombre", actividad: "ligero" });
  const [nivel, setNivelElegido] = useState("principiante");

  const totalPasos = 4;

  const finalizar = () => {
    const calculado = calcularObjetivoDiario({ ...datos, objetivo });
    const base = calculado || { kcal: 2200, prot: 150, carb: 220, grasa: 70 };
    const perfilNuevo = { ...base, objetivo, nombre: nombre.trim(), ...datos };
    const progresionNueva = NIVEL_OPCIONES.find((n) => n.id === nivel)?.progresion || NIVEL_OPCIONES[0].progresion;
    onCompletar({ perfilNuevo, progresionNueva });
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }} className="min-h-screen flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <div className="flex gap-2 px-4 pt-6">
        {Array.from({ length: totalPasos }).map((_, i) => (
          <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= paso ? C.train : C.border }} />
        ))}
      </div>

      {storageDisponible === false && paso === 0 && (
        <div className="px-5 pt-3">
          <BannerStorage />
        </div>
      )}

      <div className="flex-1 px-5 pt-8 pb-4 flex flex-col">
        {paso === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center text-center gap-3">
            <Dumbbell size={40} color={C.train} />
            <h1 className="display text-2xl font-bold">CALISTENIA <span style={{ color: C.train }}>/</span> NUTRICIÓN</h1>
            <p className="text-sm" style={{ color: C.muted }}>
              Entrena con progresiones de peso corporal y come en base a tus calorías, todo en una sola app. Vamos a hacerte unas preguntas rápidas para armar tu plan.
            </p>
            <div className="rounded-full px-3 py-1.5 mono text-[11px]" style={{ background: C.foodDim, color: C.food, border: `1px solid ${C.food}` }}>
              {DIAS_PRUEBA} días gratis · después {PRECIO_PREMIUM}/mes
            </div>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿Cómo te llamamos?"
              className="w-full max-w-xs rounded px-3 py-2 text-sm text-center mt-2"
              style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
            />
          </div>
        )}

        {paso === 1 && (
          <div className="flex-1">
            <div className="display text-sm mb-1" style={{ color: C.muted }}>PASO 1 DE 3</div>
            <h2 className="text-lg font-semibold mb-4">¿Cuál es tu objetivo?</h2>
            <div className="flex flex-col gap-2">
              {OBJETIVOS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setObjetivo(o.id)}
                  className="text-left px-4 py-3 rounded-md"
                  style={{ background: objetivo === o.id ? C.trainDim : C.panel, border: `1px solid ${objetivo === o.id ? C.train : C.border}` }}
                >
                  <span className="text-sm" style={{ color: objetivo === o.id ? C.text : C.muted }}>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="flex-1">
            <div className="display text-sm mb-1" style={{ color: C.muted }}>PASO 2 DE 3</div>
            <h2 className="text-lg font-semibold mb-1">Cuéntanos de ti</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>Con esto calculamos tu objetivo de calorías y macros (puedes ajustarlo cuando quieras).</p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input type="number" placeholder="Peso (kg)" value={datos.peso} onChange={(e) => setDatos({ ...datos, peso: e.target.value })} className="rounded px-3 py-2 text-sm w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
                <input type="number" placeholder="Altura (cm)" value={datos.altura} onChange={(e) => setDatos({ ...datos, altura: e.target.value })} className="rounded px-3 py-2 text-sm w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
              </div>
              <input type="number" placeholder="Edad" value={datos.edad} onChange={(e) => setDatos({ ...datos, edad: e.target.value })} className="rounded px-3 py-2 text-sm w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
              <div className="flex gap-2">
                {["hombre", "mujer"].map((s) => (
                  <button key={s} onClick={() => setDatos({ ...datos, sexo: s })} className="flex-1 text-sm py-2 rounded" style={{ background: datos.sexo === s ? C.train : C.panel, color: datos.sexo === s ? C.panel : C.muted, border: `1px solid ${C.border}` }}>
                    {s === "hombre" ? "Hombre" : "Mujer"}
                  </button>
                ))}
              </div>
              <select value={datos.actividad} onChange={(e) => setDatos({ ...datos, actividad: e.target.value })} className="rounded px-3 py-2 text-sm" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}>
                {NIVELES_ACTIVIDAD.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
            <button onClick={() => setPaso(3)} className="text-xs mt-3 underline" style={{ color: C.muted }}>
              Prefiero completarlo después
            </button>
          </div>
        )}

        {paso === 3 && (
          <div className="flex-1">
            <div className="display text-sm mb-1" style={{ color: C.muted }}>PASO 3 DE 3</div>
            <h2 className="text-lg font-semibold mb-4">¿Cómo te describes hoy?</h2>
            <div className="flex flex-col gap-2">
              {NIVEL_OPCIONES.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNivelElegido(n.id)}
                  className="text-left px-4 py-3 rounded-md"
                  style={{ background: nivel === n.id ? C.trainDim : C.panel, border: `1px solid ${nivel === n.id ? C.train : C.border}` }}
                >
                  <div className="text-sm font-medium" style={{ color: nivel === n.id ? C.text : C.muted }}>{n.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted }}>{n.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 flex gap-2">
        {paso > 0 && (
          <button onClick={() => setPaso(paso - 1)} className="px-4 py-3 rounded-md text-sm" style={{ background: C.panel, color: C.muted, border: `1px solid ${C.border}` }}>
            Atrás
          </button>
        )}
        {paso < totalPasos - 1 ? (
          <button onClick={() => setPaso(paso + 1)} className="flex-1 py-3 rounded-md font-medium" style={{ background: C.train, color: C.panel }}>
            Continuar
          </button>
        ) : (
          <button onClick={finalizar} className="flex-1 py-3 rounded-md font-medium" style={{ background: C.food, color: C.bg }}>
            Empezar mi prueba gratis de 7 días
          </button>
        )}
      </div>
    </div>
  );
}
