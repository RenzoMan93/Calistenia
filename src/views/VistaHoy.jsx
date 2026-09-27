import React, { useState, useEffect, useRef } from "react";
import { Dumbbell, Apple, Plus, X, Flame, Check, Crown } from "lucide-react";
import { ALIMENTOS } from "../data/nutricion";
import { C } from "../tema";
import { FiguraAnimada } from "../components/figuras.jsx";
import { FilaColapsable, FilaItem, Panel } from "../components/ui.jsx";
import { TRACKS } from "../data/entrenamiento";
import { pad2 } from "../lib/fechas";

// ---------- HOY ----------
export function VistaHoy({ totales, perfil, registro, onQuitarComida, onQuitarEjercicio, onAgregarComida, onAgregarEjercicio, progresion, accesoPremium, onBloqueado, planHoy, diasSinEntrenar, rachaActual, proximoLogro, onIrAEntrenar }) {
  const pct = Math.min(totales.kcal / perfil.kcal, 1) * 360;
  const restante = Math.max(perfil.kcal - totales.kcal, 0);
  const [quickComida, setQuickComida] = useState(false);
  const [quickEjercicio, setQuickEjercicio] = useState(false);
  const [verEntrenoHoy, setVerEntrenoHoy] = useState(false);
  const [verComidasHoy, setVerComidasHoy] = useState(false);
  const yaEntrenoHoy = registro.entrenamiento.length > 0;
  const gruposHechosHoy = planHoy.tracks
    ? planHoy.tracks.filter((t) => registro.entrenamiento.some((e) => e.track === t))
    : [];
  const planCompleto = planHoy.tracks && gruposHechosHoy.length >= planHoy.tracks.length;
  const siguienteGrupo = planHoy.tracks?.find((t) => !gruposHechosHoy.includes(t)) || planHoy.tracks?.[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-semibold">Hola{perfil.nombre ? `, ${perfil.nombre}` : ""} 👋</span>
      </div>

      {!yaEntrenoHoy && diasSinEntrenar > 0 && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 mb-3"
          style={{ background: C.trainDim, border: `1px solid ${C.train}` }}
        >
          <Flame size={16} color={C.train} className="flex-shrink-0" />
          <span className="text-xs" style={{ color: C.text }}>
            {diasSinEntrenar === 1
              ? "Ayer no entrenaste. ¡Arranca hoy y no pierdas el ritmo!"
              : `Hace ${diasSinEntrenar} días que no entrenas. Tu racha se cortó, pero puedes arrancar de nuevo ahora mismo.`}
          </span>
        </div>
      )}

      {planHoy.descanso ? (
        <Panel style={{ textAlign: "center" }}>
          <div className="display text-sm mb-1" style={{ color: C.muted }}>PLAN DE HOY</div>
          <div className="text-base font-semibold mb-1">Día de descanso 😌</div>
          <p className="text-xs mb-3" style={{ color: C.muted }}>
            Tu cuerpo también progresa recuperándose. Aprovecha para estirar o simplemente descansar.
          </p>
          <button onClick={() => onIrAEntrenar(Object.keys(TRACKS)[0])} className="text-xs mono underline" style={{ color: C.food }}>
            Igual quiero entrenar
          </button>
        </Panel>
      ) : (
        <Panel style={{ borderColor: C.train }}>
          <div className="flex items-center justify-between mb-1">
            <div className="display text-sm" style={{ color: C.muted }}>PLAN DE HOY</div>
            {rachaActual > 0 && (
              <span className="flex items-center gap-1 text-xs mono" style={{ color: C.train }}>
                <Flame size={13} color={C.train} /> {rachaActual} día{rachaActual !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="text-base font-semibold mb-3">Cuerpo completo</div>

          <div className="flex gap-2 mb-3">
            {planHoy.tracks.map((t) => {
              const hecho = gruposHechosHoy.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onIrAEntrenar(t)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-md active:scale-95 transition-transform"
                  style={{ background: hecho ? C.trainDim : C.panelAlt, border: `1px solid ${hecho ? C.train : C.border}` }}
                >
                  {hecho ? (
                    <Check size={15} color={C.train} />
                  ) : (
                    <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1.5px solid ${C.muted}` }} />
                  )}
                  <span className="text-[10px]" style={{ color: hecho ? C.text : C.muted }}>{TRACKS[t].nombre}</span>
                </button>
              );
            })}
          </div>

          {proximoLogro && (
            <div className="flex items-center gap-2 rounded px-3 py-2 mb-3" style={{ background: C.panelAlt, border: `1px dashed ${C.food}` }}>
              <Crown size={13} color={C.food} className="flex-shrink-0" />
              <span className="text-[11px]" style={{ color: C.text }}>
                A <b>{proximoLogro.falta}</b> de "{proximoLogro.nombre}"
              </span>
            </div>
          )}

          {planCompleto ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: C.food }}>
              <Check size={16} /> ¡Completaste los 4 grupos de hoy!
            </div>
          ) : (
            <button
              onClick={() => onIrAEntrenar(siguienteGrupo)}
              className="w-full py-3 rounded-md font-bold uppercase tracking-wide active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, ${C.train}, #7ED321)`, color: C.panel, boxShadow: "0 8px 20px rgba(179,242,61,0.32)" }}
            >
              {gruposHechosHoy.length > 0 ? "Seguir entrenando" : "Empezar mi entrenamiento"}
            </button>
          )}

          <button
            onClick={() => setQuickEjercicio(true)}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-md font-medium text-xs mt-2"
            style={{ background: "transparent", color: C.train, border: `1px solid ${C.train}` }}
          >
            <Plus size={13} /> Agregar un ejercicio puntual
          </button>

          {registro.entrenamiento.length > 0 && (
            <>
              <FilaColapsable icon={Dumbbell} color={C.train} titulo="Ver entrenamiento de hoy" abierto={verEntrenoHoy} onClick={() => setVerEntrenoHoy((v) => !v)} />
              {verEntrenoHoy && (
                <div className="flex flex-col gap-2 -mt-2 mb-1">
                  {registro.entrenamiento.map((e) => (
                    <FilaItem key={e.id} texto={`${e.ejercicio}`} sub={e.tipo === "tiempo" ? `${e.segundos}s sostenidos` : `${e.series}x${e.reps}`} onQuitar={() => onQuitarEjercicio(e.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>
      )}

      <Panel style={{ borderColor: C.food }}>
        <div className="flex items-center mb-3" style={{ gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: `conic-gradient(${C.food} ${pct}deg, ${C.panelAlt} 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: C.panel }} className="flex flex-col items-center justify-center">
              <span className="mono text-lg font-semibold">{Math.round(totales.kcal)}</span>
              <span className="text-[9px]" style={{ color: C.muted }}>kcal</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="display text-sm" style={{ color: C.muted }}>CALORÍAS DE HOY</div>
            <div className="text-lg font-semibold mt-1">
              {restante > 0 ? `Quedan ${Math.round(restante)} kcal` : "Objetivo alcanzado"}
            </div>
            {totales.kcal === 0 ? (
              <p className="text-xs mt-2" style={{ color: C.muted }}>
                Todavía no cargaste nada hoy.
              </p>
            ) : (
              <div className="flex gap-3 mt-2 text-xs mono" style={{ color: C.muted }}>
                <span>P {Math.round(totales.prot)}/{perfil.prot}g</span>
                <span>C {Math.round(totales.carb)}/{perfil.carb}g</span>
                <span>G {Math.round(totales.grasa)}/{perfil.grasa}g</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setQuickComida(true)}
          className="w-full flex items-center justify-center gap-1 py-2 rounded-md font-medium text-xs"
          style={{ background: "transparent", color: C.food, border: `1px solid ${C.food}` }}
        >
          <Plus size={13} /> Anotar una comida
        </button>

        {registro.comidas.length > 0 && (
          <>
            <FilaColapsable icon={Apple} color={C.food} titulo="Ver comidas de hoy" abierto={verComidasHoy} onClick={() => setVerComidasHoy((v) => !v)} />
            {verComidasHoy && (
              <div className="flex flex-col gap-2 -mt-2 mb-1">
                {registro.comidas.map((c) => (
                  <FilaItem key={c.id} texto={c.nombre} sub={`${c.kcal} kcal`} onQuitar={() => onQuitarComida(c.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </Panel>

      {quickEjercicio && (
        <QuickAddEjercicio progresion={progresion} onAgregar={onAgregarEjercicio} onCerrar={() => setQuickEjercicio(false)} />
      )}
      {quickComida && (
        <QuickAddComida onAgregar={onAgregarComida} onCerrar={() => setQuickComida(false)} />
      )}
    </div>
  );
}

export function QuickAddEjercicio({ progresion, onAgregar, onCerrar }) {
  const [trackSel, setTrackSel] = useState("empuje");
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(10);
  const ejercicioActual = TRACKS[trackSel].ejercicios[progresion[trackSel] - 1];

  const [modoTiempo, setModoTiempo] = useState(Boolean(ejercicioActual.porTiempo));
  const [segundosEj, setSegundosEj] = useState(0);
  const [cronoCorriendo, setCronoCorriendo] = useState(false);
  const cronoRef = useRef(null);

  useEffect(() => {
    setModoTiempo(Boolean(ejercicioActual.porTiempo));
    setSegundosEj(0);
    setCronoCorriendo(false);
  }, [ejercicioActual.nombre]);

  useEffect(() => {
    if (cronoCorriendo) {
      cronoRef.current = setInterval(() => setSegundosEj((s) => s + 1), 1000);
    }
    return () => clearInterval(cronoRef.current);
  }, [cronoCorriendo]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 55 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }} className="rounded-lg p-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>REGISTRAR EJERCICIO</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {Object.entries(TRACKS).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTrackSel(key)}
              className="px-3 py-1 rounded text-xs mono"
              style={{ background: trackSel === key ? C.train : C.panelAlt, color: trackSel === key ? C.panel : C.muted }}
            >
              {t.nombre}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <FiguraAnimada figuras={ejercicioActual.figura} size={64} />
          <div className="text-sm">{ejercicioActual.nombre}</div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setModoTiempo(false)}
            className="px-3 py-1 rounded text-xs"
            style={{ background: !modoTiempo ? C.train : C.panelAlt, color: !modoTiempo ? C.panel : C.muted }}
          >
            Repeticiones
          </button>
          <button
            onClick={() => setModoTiempo(true)}
            className="px-3 py-1 rounded text-xs"
            style={{ background: modoTiempo ? C.train : C.panelAlt, color: modoTiempo ? C.panel : C.muted }}
          >
            Por tiempo
          </button>
        </div>

        {!modoTiempo ? (
          <>
            <div className="flex gap-3 items-end mb-4">
              <label className="flex flex-col text-xs" style={{ color: C.muted }}>
                Series
                <input type="number" min={1} value={series} onChange={(e) => setSeries(e.target.value)} className="mt-1 w-16 rounded px-2 py-1 mono" style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }} />
              </label>
              <label className="flex flex-col text-xs" style={{ color: C.muted }}>
                Reps
                <input type="number" min={1} value={reps} onChange={(e) => setReps(e.target.value)} className="mt-1 w-16 rounded px-2 py-1 mono" style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }} />
              </label>
            </div>
            <button
              onClick={() => {
                onAgregar({ track: trackSel, ejercicio: ejercicioActual.nombre, series, reps });
                onCerrar();
              }}
              className="w-full py-2 rounded font-medium"
              style={{ background: C.train, color: C.panel }}
            >
              Agregar
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="mono text-2xl font-semibold" style={{ minWidth: 64 }}>
                {Math.floor(segundosEj / 60)}:{pad2(segundosEj % 60)}
              </div>
              <button
                onClick={() => setCronoCorriendo((c) => !c)}
                className="flex-1 py-2 rounded text-sm font-medium"
                style={{ background: cronoCorriendo ? C.panelAlt : C.train, color: cronoCorriendo ? C.text : C.panel, border: cronoCorriendo ? `1px solid ${C.border}` : "none" }}
              >
                {cronoCorriendo ? "Pausar" : segundosEj > 0 ? "Reanudar" : "Iniciar"}
              </button>
            </div>
            <button
              onClick={() => {
                if (segundosEj <= 0) return;
                onAgregar({ track: trackSel, ejercicio: ejercicioActual.nombre, tipo: "tiempo", segundos: segundosEj });
                onCerrar();
              }}
              disabled={segundosEj <= 0}
              className="w-full py-2 rounded font-medium disabled:opacity-40"
              style={{ background: C.food, color: C.bg }}
            >
              Agregar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function QuickAddComida({ onAgregar, onCerrar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 55 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }} className="rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>REGISTRAR COMIDA</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALIMENTOS.map((a) => (
            <button
              key={a.nombre}
              onClick={() => {
                onAgregar(a);
                onCerrar();
              }}
              className="text-left p-2 rounded"
              style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
            >
              <div className="text-xs">{a.nombre}</div>
              <div className="text-[10px] mono" style={{ color: C.food }}>{a.kcal} kcal</div>
            </button>
          ))}
        </div>
        <p className="text-[10px] mt-3 text-center" style={{ color: C.muted }}>¿No está lo que buscas? Cárgalo desde la pestaña Nutrición.</p>
      </div>
    </div>
  );
}
