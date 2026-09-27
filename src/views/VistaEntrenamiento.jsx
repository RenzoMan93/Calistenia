import React, { useState, useEffect, useRef } from "react";
import { Dumbbell, X, Check, Lock, Lightbulb, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { safeGet, safeSet, obtenerHistorialEjercicio } from "../lib/storage";
import { C } from "../tema";
import { ChipPro, FilaItem, Panel } from "../components/ui.jsx";
import { DURACIONES_DESCANSO, ORDEN_TRACKS, TRACKS, franjaEtaria, objetivoRepsRonda, sugerirDescanso } from "../data/entrenamiento";
import { FRASES_ANIMO_REP, FRASES_ARRANQUE, FRASES_REANUDAR, FRASES_SERIE_COMPLETA, elegirAlAzar, fijarVozManual, hablar, listarVocesEspanol, reproducirBeep } from "../lib/voz";
import { FiguraAnimada, IconoEjercicio } from "../components/figuras.jsx";
import { NIVEL_LIMITE_FREE, UMBRAL_SUBIR_NIVEL } from "../data/planes";
import { fechaLegible, pad2 } from "../lib/fechas";

export function SelectorVozCoach({ voces, vozElegidaNombre, onElegir, onCerrar }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", zIndex: 90 }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm rounded-lg p-4 max-h-[80vh] overflow-y-auto"
        style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="display text-sm" style={{ color: C.muted }}>ELEGIR VOZ DEL COACH</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        <button
          onClick={() => onElegir({ name: "" })}
          className="w-full text-left rounded px-3 py-2 mb-2 text-sm"
          style={{
            background: !vozElegidaNombre ? C.foodDim : C.panelAlt,
            border: `1px solid ${!vozElegidaNombre ? C.food : C.border}`,
            color: !vozElegidaNombre ? C.food : C.text,
          }}
        >
          Automática (elegida por la app)
        </button>

        {voces.length === 0 ? (
          <p className="text-xs" style={{ color: C.muted }}>
            Este dispositivo no ofrece más de una voz en español, o todavía no terminó de cargarlas — probá cerrar y volver a abrir esta lista en unos segundos.
          </p>
        ) : (
          voces.map((v) => (
            <button
              key={v.name}
              onClick={() => onElegir(v)}
              className="w-full text-left rounded px-3 py-2 mb-2 text-sm"
              style={{
                background: vozElegidaNombre === v.name ? C.foodDim : C.panelAlt,
                border: `1px solid ${vozElegidaNombre === v.name ? C.food : C.border}`,
                color: vozElegidaNombre === v.name ? C.food : C.text,
              }}
            >
              {v.name}
              <span className="block text-[10px] mt-0.5" style={{ color: C.muted }}>{v.lang}</span>
            </button>
          ))
        )}
        <p className="text-[10px] mt-1" style={{ color: C.muted }}>Al elegir una, la escuchás enseguida para confirmar.</p>
      </div>
    </div>
  );
}

export function PanelDescanso({ total, restante, corriendo, onElegirDuracion, onIniciar, onPausarReanudar, onReiniciar }) {
  const min = Math.floor(restante / 60);
  const seg = restante % 60;
  const pct = total > 0 ? ((total - restante) / total) * 360 : 0;
  const terminado = restante === 0 && total > 0;

  return (
    <Panel>
      <div className="display text-sm mb-3" style={{ color: C.muted }}>DESCANSO ENTRE SERIES</div>
      <div className="flex items-center gap-5">
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: `conic-gradient(${terminado ? C.food : C.train} ${pct}deg, ${C.panelAlt} 0deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ width: 66, height: 66, borderRadius: "50%", background: C.panel }} className="flex items-center justify-center">
            <span className="mono text-lg font-semibold">{min}:{pad2(seg)}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-1 flex-wrap">
            {DURACIONES_DESCANSO.map((d) => (
              <button
                key={d}
                onClick={() => onElegirDuracion(d)}
                className="px-2 py-1 rounded text-xs mono"
                style={{ background: total === d ? C.train : C.panelAlt, color: total === d ? C.panel : C.muted }}
              >
                {d}s
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {!corriendo && restante === total ? (
              <button onClick={onIniciar} className="flex-1 py-2 rounded text-sm font-medium" style={{ background: C.train, color: C.panel }}>
                Iniciar
              </button>
            ) : (
              <button onClick={onPausarReanudar} className="flex-1 py-2 rounded text-sm font-medium" style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}>
                {corriendo ? "Pausar" : "Reanudar"}
              </button>
            )}
            <button onClick={onReiniciar} className="px-3 py-2 rounded text-sm" style={{ background: C.panelAlt, color: C.muted, border: `1px solid ${C.border}` }}>
              Reiniciar
            </button>
          </div>
        </div>
      </div>
      {terminado && <p className="text-xs mt-2" style={{ color: C.food }}>¡Descanso terminado! A la próxima serie.</p>}
      <p className="text-[10px] mt-2" style={{ color: C.muted }}>Se inicia solo cada vez que registras una serie más abajo.</p>
    </Panel>
  );
}

export function CuentaRegresiva({ onTerminar, vozActiva }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    if (vozActiva) hablar(n > 0 ? String(n) : elegirAlAzar(FRASES_ARRANQUE));
    if (n <= 0) {
      const t = setTimeout(onTerminar, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v - 1), 800);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: C.bg, zIndex: 90 }}>
      <div
        key={n}
        className="display font-bold"
        style={{ fontSize: n > 0 ? 160 : 64, color: n > 0 ? C.train : C.food, animation: "popIn 0.3s ease-out" }}
      >
        {n > 0 ? n : "¡A ENTRENAR!"}
      </div>
    </div>
  );
}

// ---------- ENTRENAMIENTO ----------
export function VistaEntrenamiento({ progresion, progresoSeries, setNivel, registro, onAgregar, onQuitar, accesoPremium, onBloqueado, trackInicial, perfil }) {
  const esVeterano = franjaEtaria(perfil?.edad) === "veterano";
  const [trackSel, setTrackSel] = useState(trackInicial || "empuje");
  const [series, setSeries] = useState(3);
  const [tipsAbiertos, setTipsAbiertos] = useState({});
  const [sesionActiva, setSesionActiva] = useState(false);
  const [contando, setContando] = useState(false);
  const nivelActual = progresion[trackSel];
  const ejercicioActual = TRACKS[trackSel].ejercicios[nivelActual - 1];
  // Próximo grupo muscular según el orden del plan de cuerpo completo, para
  // ofrecer un botón directo al terminar un ejercicio (no cambia de grupo
  // solo, el usuario decide si lo toca).
  const siguienteTrack = ORDEN_TRACKS[ORDEN_TRACKS.indexOf(trackSel) + 1] || null;

  const toggleTips = (key) => setTipsAbiertos((prev) => ({ ...prev, [key]: !prev[key] }));

  const [modoTiempo, setModoTiempo] = useState(Boolean(ejercicioActual.porTiempo));
  const [segundosEj, setSegundosEj] = useState(0);
  const [cronoCorriendo, setCronoCorriendo] = useState(false);
  const cronoRef = useRef(null);
  const [contadorReps, setContadorReps] = useState(0);
  const [serieActual, setSerieActual] = useState(1);
  const [historialEj, setHistorialEj] = useState(null);
  // Conteo automático: al no tener las manos libres para tocar la pantalla en
  // cada repetición (empuje, flexiones, dominadas, etc.), por defecto la app
  // suma sola a un ritmo elegido; "Manual" queda como alternativa para quien
  // prefiera tocar cada rep.
  const [modoAuto, setModoAuto] = useState(true);
  const [cadenciaSeg, setCadenciaSeg] = useState(2);
  const [autoCorriendo, setAutoCorriendo] = useState(false);
  const [verMasConsejos, setVerMasConsejos] = useState(false);
  // Refs "espejo" de series/modoTiempo/modoAuto para que el intervalo de
  // descanso (más abajo) siempre lea el valor más reciente: ese efecto solo
  // se vuelve a crear cuando cambian "corriendo" o "vozActiva", así que si
  // leyera estos valores directo del closure quedarían pegados a como
  // estaban cuando arrancó el descanso, aunque el usuario cambie de modo o
  // de cantidad de series mientras descansa.
  const seriesRef = useRef(series);
  const modoTiempoRef = useRef(modoTiempo);
  const modoAutoRef = useRef(modoAuto);
  const serieActualRef = useRef(serieActual);
  useEffect(() => { seriesRef.current = series; }, [series]);
  useEffect(() => { modoTiempoRef.current = modoTiempo; }, [modoTiempo]);
  useEffect(() => { modoAutoRef.current = modoAuto; }, [modoAuto]);
  useEffect(() => { serieActualRef.current = serieActual; }, [serieActual]);
  // Evita cerrar la misma serie dos veces: el cierre automático (al llegar
  // al objetivo de reps) queda encolado 900ms antes de aplicarse para dejar
  // terminar de hablar el último número; si en ese margen el usuario toca
  // "Serie terminada" a mano, sin esta guarda se agregaba el ejercicio dos
  // veces y se saltaba una ronda entera.
  const cierreEnCursoRef = useRef(false);
  const cierreAutoTimeoutRef = useRef(null);
  useEffect(() => {
    cierreEnCursoRef.current = false;
  }, [serieActual, ejercicioActual.nombre]);
  // Coach por voz: cuenta las repeticiones y avisa en voz alta para poder
  // entrenar sin tener que mirar el celular en el piso.
  const [vozActiva, setVozActiva] = useState(true);
  const [vocesDisponibles, setVocesDisponibles] = useState([]);
  const [vozElegidaNombre, setVozElegidaNombre] = useState(null);
  const [mostrarSelectorVoz, setMostrarSelectorVoz] = useState(false);

  // Carga la lista de voces en español del dispositivo (puede tardar en
  // aparecer, por eso también se escucha "voiceschanged") y la preferencia
  // guardada, si eligió una antes.
  useEffect(() => {
    const cargarVoces = () => setVocesDisponibles(listarVocesEspanol());
    cargarVoces();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", cargarVoces);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", cargarVoces);
    }
  }, []);

  useEffect(() => {
    safeGet("vozCoachElegida").then((nombre) => {
      if (nombre) setVozElegidaNombre(nombre);
    });
  }, []);

  useEffect(() => {
    if (!vozElegidaNombre) {
      fijarVozManual(null);
      return;
    }
    fijarVozManual(vocesDisponibles.find((v) => v.name === vozElegidaNombre) || null);
  }, [vozElegidaNombre, vocesDisponibles]);

  const elegirVoz = (voz) => {
    // Aplica el cambio ya mismo (no esperar al useEffect, que corre recién
    // en el próximo render) para que la frase de confirmación se escuche
    // con la voz nueva y no con la anterior.
    fijarVozManual(voz.name ? voz : null);
    setVozElegidaNombre(voz.name || "");
    safeSet("vozCoachElegida", voz.name || "");
    hablar("Hola, soy tu coach.");
  };

  useEffect(() => {
    setModoTiempo(Boolean(ejercicioActual.porTiempo));
    setSegundosEj(0);
    setCronoCorriendo(false);
    setContadorReps(0);
    setSerieActual(1);
    setAutoCorriendo(false);
    setVerMasConsejos(false);
  }, [ejercicioActual.nombre]);

  useEffect(() => {
    if (!autoCorriendo) return;
    // Se frena solo al llegar a las repeticiones objetivo de esta ronda (ej.
    // 12 en la primera vuelta) y cierra la serie sin que haya que tocar nada.
    const objetivo = objetivoRepsRonda(nivelActual, serieActual);
    const id = setInterval(() => {
      setContadorReps((r) => {
        const nuevo = r + 1;
        if (vozActiva) {
          if (nuevo >= objetivo) hablar(`${nuevo}, ¡última!`);
          else if (nuevo % 3 === 0) hablar(`${nuevo}, ${elegirAlAzar(FRASES_ANIMO_REP)}`);
          else hablar(String(nuevo));
        }
        if (nuevo >= objetivo) {
          clearInterval(id);
          // Espera a que termine de decir "N, ¡última!" antes de avisar
          // "Serie completa": hablar() cancela lo que esté sonando apenas se
          // le pide una frase nueva, así que un margen corto cortaba la
          // frase final a mitad de camino.
          cierreAutoTimeoutRef.current = setTimeout(() => {
            cierreAutoTimeoutRef.current = null;
            completarSerieReps(nuevo);
          }, 1400);
        }
        return nuevo;
      });
      try { navigator.vibrate?.(15); } catch {}
    }, cadenciaSeg * 1000);
    return () => clearInterval(id);
  }, [autoCorriendo, cadenciaSeg, vozActiva, nivelActual, serieActual]);

  useEffect(() => {
    let cancelado = false;
    setHistorialEj(null);
    obtenerHistorialEjercicio(ejercicioActual.nombre).then((h) => {
      if (!cancelado) setHistorialEj(h);
    });
    return () => {
      cancelado = true;
    };
  }, [ejercicioActual.nombre]);

  useEffect(() => {
    if (cronoCorriendo) {
      cronoRef.current = setInterval(() => setSegundosEj((s) => s + 1), 1000);
    }
    return () => clearInterval(cronoRef.current);
  }, [cronoCorriendo]);

  const reiniciarCronoEj = () => {
    setCronoCorriendo(false);
    setSegundosEj(0);
  };

  const [descansoTotal, setDescansoTotal] = useState(60);
  const [descansoRestante, setDescansoRestante] = useState(60);
  const [corriendo, setCorriendo] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (corriendo) return;
    const sugerido = sugerirDescanso(nivelActual).segundos;
    setDescansoTotal(sugerido);
    setDescansoRestante(sugerido);
  }, [ejercicioActual.nombre]);

  useEffect(() => {
    if (corriendo) {
      intervalRef.current = setInterval(() => {
        setDescansoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCorriendo(false);
            try { navigator.vibrate?.(300); } catch {}
            reproducirBeep();
            if (vozActiva) hablar(elegirAlAzar(FRASES_REANUDAR));
            // Si todavía quedan series, arranca solo la próxima (conteo
            // automático de reps o el cronómetro, según el modo) sin que
            // haya que tocar nada. Lee los refs (no el closure) porque este
            // efecto solo se recrea con "corriendo"/"vozActiva": si el
            // usuario cambia de modo o de cantidad de series mientras
            // descansa, serieActual/series/modoTiempo/modoAuto de acá
            // quedarían pegados a como estaban cuando arrancó el descanso.
            if (serieActualRef.current <= Number(seriesRef.current)) {
              if (!modoTiempoRef.current && modoAutoRef.current) setAutoCorriendo(true);
              else if (modoTiempoRef.current) setCronoCorriendo(true);
            }
            return 0;
          }
          const restanteNuevo = prev - 1;
          // Cuenta en voz alta los últimos segundos del descanso para no
          // tener que mirar la pantalla y saber justo cuándo arrancar.
          if (vozActiva && restanteNuevo <= 5) hablar(String(restanteNuevo));
          return restanteNuevo;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [corriendo, vozActiva]);

  const elegirDuracion = (seg) => {
    setDescansoTotal(seg);
    setDescansoRestante(seg);
    setCorriendo(false);
  };
  const iniciarDescanso = (seg) => {
    const duracion = seg || descansoTotal;
    setDescansoTotal(duracion);
    setDescansoRestante(duracion);
    setCorriendo(true);
    if (vozActiva) hablar(`${elegirAlAzar(FRASES_SERIE_COMPLETA)} Descansa ${duracion} segundos.`);
  };

  // Cierra la serie de repeticiones (a mano con "Serie terminada" o sola
  // cuando el conteo automático llega al objetivo de la ronda) y arranca el
  // descanso.
  const completarSerieReps = (repsFinal) => {
    if (repsFinal <= 0) return;
    if (cierreEnCursoRef.current) return;
    cierreEnCursoRef.current = true;
    if (cierreAutoTimeoutRef.current) {
      clearTimeout(cierreAutoTimeoutRef.current);
      cierreAutoTimeoutRef.current = null;
    }
    onAgregar({ track: trackSel, ejercicio: ejercicioActual.nombre, series: 1, reps: repsFinal });
    setContadorReps(0);
    setSerieActual((s) => s + 1);
    setAutoCorriendo(false);
    iniciarDescanso();
  };
  const pausarReanudar = () => setCorriendo((c) => !c);
  const reiniciarDescanso = () => {
    setCorriendo(false);
    setDescansoRestante(descansoTotal);
  };
  // Al terminar la sesión hay que frenar todo lo que siga corriendo en
  // segundo plano (conteo automático de reps, cronómetro, descanso): si no,
  // el coach por voz sigue contando y anunciando series aunque el panel ya
  // esté oculto, y podía terminar registrando un ejercicio solo.
  const terminarSesion = () => {
    setSesionActiva(false);
    setAutoCorriendo(false);
    setCronoCorriendo(false);
    setCorriendo(false);
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        {vozActiva && (
          <button
            onClick={() => setMostrarSelectorVoz(true)}
            className="text-[11px] mono px-2 py-1 rounded"
            style={{ background: C.panelAlt, color: C.muted, border: `1px solid ${C.border}` }}
          >
            Cambiar voz
          </button>
        )}
        <button
          onClick={() => setVozActiva((v) => !v)}
          className="flex items-center gap-1 text-[11px] mono px-2 py-1 rounded"
          style={{ background: C.panelAlt, color: vozActiva ? C.food : C.muted, border: `1px solid ${C.border}` }}
        >
          {vozActiva ? <Volume2 size={12} /> : <VolumeX size={12} />}
          {vozActiva ? "Coach con voz" : "Sin voz"}
        </button>
      </div>

      {mostrarSelectorVoz && (
        <SelectorVozCoach
          voces={vocesDisponibles}
          vozElegidaNombre={vozElegidaNombre}
          onElegir={elegirVoz}
          onCerrar={() => setMostrarSelectorVoz(false)}
        />
      )}

      {contando && (
        <CuentaRegresiva
          vozActiva={vozActiva}
          onTerminar={() => {
            setContando(false);
            setSesionActiva(true);
          }}
        />
      )}

      {!sesionActiva && (
        <Panel style={{ borderColor: C.train, textAlign: "center" }}>
          <Dumbbell size={28} color={C.train} style={{ margin: "0 auto 8px" }} />
          <div className="display text-base font-bold mb-1">¿Listo para entrenar?</div>
          <p className="text-xs mb-4" style={{ color: C.muted }}>
            Elige el grupo muscular de hoy y arranca con una cuenta regresiva para prepararte.
          </p>
          <button
            onClick={() => setContando(true)}
            className="w-full py-4 rounded-md font-bold text-lg tracking-wide active:scale-[0.98] transition-transform"
            style={{ background: `linear-gradient(135deg, ${C.train}, #7ED321)`, color: C.panel, boxShadow: "0 8px 24px rgba(179,242,61,0.35)" }}
          >
            INICIAR ENTRENAMIENTO
          </button>
        </Panel>
      )}

      {sesionActiva && (
      <Panel style={{ borderColor: C.train }}>
        <div className="flex items-center justify-between mb-3">
          <span className="display text-sm" style={{ color: C.train }}>ENTRENAMIENTO EN CURSO</span>
          <button onClick={terminarSesion} className="text-xs mono underline" style={{ color: C.muted }}>
            Terminar
          </button>
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
        <div className="flex items-center gap-3 mb-1">
          <FiguraAnimada figuras={ejercicioActual.figura} size={84} />
          <div>
            <div className="text-sm font-medium">{ejercicioActual.nombre}</div>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{ejercicioActual.tip}</p>
            {!modoTiempo && (
              <p className="text-xs mt-1 font-medium" style={{ color: C.train }}>
                {serieActual === 1
                  ? `${objetivoRepsRonda(nivelActual, 1)} repeticiones en la primera vuelta`
                  : `Ronda ${serieActual}: apunta a ${objetivoRepsRonda(nivelActual, serieActual)} repeticiones`}
              </p>
            )}
          </div>
        </div>

        {ejercicioActual.sinEquipo && (
          <div className="flex items-start gap-2 rounded px-3 py-2 mb-3" style={{ background: C.panelAlt, border: `1px dashed ${C.muted}` }}>
            <HelpCircle size={14} color={C.muted} className="flex-shrink-0 mt-0.5" />
            <span className="text-[11px]" style={{ color: C.text }}>
              <b>¿No tienes el equipo?</b> {ejercicioActual.sinEquipo}
            </span>
          </div>
        )}

        <button
          onClick={() => setVerMasConsejos((v) => !v)}
          className="flex items-center gap-1 text-[11px] mono mb-3 mt-2"
          style={{ color: C.food }}
        >
          {verMasConsejos ? "▲ Ocultar consejos" : "▾ Más consejos"}
        </button>

        {verMasConsejos && (
          <>
            <div className="flex items-start gap-2 rounded px-3 py-2 mb-3" style={{ background: C.panelAlt, border: `1px dashed ${C.food}` }}>
              <Lightbulb size={14} color={C.food} className="flex-shrink-0 mt-0.5" />
              <span className="text-[11px]" style={{ color: C.text }}>{sugerirDescanso(nivelActual).texto}</span>
            </div>

            {esVeterano && ejercicioActual.adaptacionVeterano && (
              <div className="flex items-start gap-2 rounded px-3 py-2 mb-3" style={{ background: C.panelAlt, border: `1px dashed ${C.train}` }}>
                <Lightbulb size={14} color={C.train} className="flex-shrink-0 mt-0.5" />
                <span className="text-[11px]" style={{ color: C.text }}>
                  <b>Cuidando las articulaciones:</b> {ejercicioActual.adaptacionVeterano}
                </span>
              </div>
            )}
          </>
        )}

        {historialEj !== null && (
          <div className="mb-3">
            {historialEj.length === 0 ? (
              <p className="text-xs" style={{ color: C.muted }}>Todavía no tienes marcas en este ejercicio. ¡Esta va a ser tu primera! 💪</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: C.muted }}>PROGRESO EN ESTE EJERCICIO</span>
                  <span className="text-xs mono" style={{ color: C.food }}>
                    Mejor marca: {Math.max(...historialEj.map((h) => h.valor))}{historialEj[0].tipo === "tiempo" ? "s" : " reps"}
                  </span>
                </div>
                {historialEj.length >= 2 && (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={historialEj.map((h) => ({ ...h, dia: fechaLegible(h.fecha).split(" ")[0] }))}>
                      <XAxis dataKey="dia" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 11 }} labelStyle={{ color: C.text }} />
                      <Line type="monotone" dataKey="valor" stroke={C.train} strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setModoTiempo(false)}
            className="px-3 py-1 rounded text-xs"
            style={{ background: !modoTiempo ? C.train : C.panelAlt, color: !modoTiempo ? C.panel : C.muted }}
          >
            Repeticiones
          </button>
          <button
            onClick={() => { setModoTiempo(true); setAutoCorriendo(false); }}
            className="px-3 py-1 rounded text-xs"
            style={{ background: modoTiempo ? C.train : C.panelAlt, color: modoTiempo ? C.panel : C.muted }}
          >
            Por tiempo
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs mono" style={{ color: C.muted }}>
            Serie <span style={{ color: C.train }}>{Math.min(serieActual, Number(series) || serieActual)}</span> de{" "}
            <input
              type="number"
              min={1}
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="w-10 rounded px-1 py-0.5 mono text-center"
              style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
            />
          </span>
          {serieActual > Number(series) && (
            <span className="text-[10px]" style={{ color: C.food }}>¡Series completadas! 💪</span>
          )}
        </div>

        {serieActual > Number(series) ? (
          <div className="flex flex-col items-center gap-2 py-6 mb-3 text-center">
            <Check size={28} color={C.food} />
            <p className="text-sm font-medium">¡Terminaste este ejercicio!</p>
            <p className="text-xs" style={{ color: C.muted }}>
              O sube el número de series arriba si quieres hacer una más.
            </p>
            {siguienteTrack && (
              <button
                onClick={() => setTrackSel(siguienteTrack)}
                className="mt-2 px-5 py-2.5 rounded-md font-medium text-sm"
                style={{ background: C.train, color: C.panel }}
              >
                Siguiente: {TRACKS[siguienteTrack].nombre} →
              </button>
            )}
          </div>
        ) : !modoTiempo ? (
          <div className="flex flex-col items-center gap-3 mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => { setModoAuto(true); setAutoCorriendo(false); }}
                className="px-3 py-1 rounded text-xs"
                style={{ background: modoAuto ? C.food : C.panelAlt, color: modoAuto ? C.bg : C.muted }}
              >
                Automático
              </button>
              <button
                onClick={() => { setModoAuto(false); setAutoCorriendo(false); }}
                className="px-3 py-1 rounded text-xs"
                style={{ background: !modoAuto ? C.food : C.panelAlt, color: !modoAuto ? C.bg : C.muted }}
              >
                Manual
              </button>
            </div>

            <div
              key={contadorReps}
              className="mono font-bold"
              style={{ fontSize: 72, color: C.train, animation: "popIn 0.2s ease-out", lineHeight: 1 }}
            >
              {contadorReps}
            </div>
            <span className="text-[10px]" style={{ color: C.muted }}>REPETICIONES</span>

            {modoAuto ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: C.muted }}>RITMO</span>
                  {[1.5, 2, 2.5, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => setCadenciaSeg(s)}
                      className="px-2 py-1 rounded text-xs mono"
                      style={{ background: cadenciaSeg === s ? C.train : C.panelAlt, color: cadenciaSeg === s ? C.panel : C.muted }}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-center" style={{ color: C.muted }}>
                  Suma sola a ese ritmo, no hace falta tocar la pantalla en cada repetición. Aprieta Iniciar y arranca a entrenar.
                </p>
                <button
                  onClick={() => setAutoCorriendo((c) => !c)}
                  className="w-full py-8 rounded-md font-bold text-2xl active:scale-95"
                  style={{ background: autoCorriendo ? C.panelAlt : C.train, color: autoCorriendo ? C.text : C.panel, border: autoCorriendo ? `1px solid ${C.border}` : "none" }}
                >
                  {autoCorriendo ? "PAUSAR" : "INICIAR"}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setContadorReps((r) => r + 1);
                  try { navigator.vibrate?.(20); } catch {}
                }}
                className="w-full py-8 rounded-md font-bold text-2xl active:scale-95"
                style={{ background: C.train, color: C.panel }}
              >
                + REP
              </button>
            )}

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setContadorReps((r) => Math.max(0, r - 1))}
                className="flex-1 py-2 rounded text-sm"
                style={{ background: C.panelAlt, color: C.muted, border: `1px solid ${C.border}` }}
              >
                -1
              </button>
              <button
                onClick={() => completarSerieReps(contadorReps)}
                disabled={contadorReps <= 0}
                className="flex-[2] flex items-center justify-center gap-1 py-2 rounded font-medium disabled:opacity-40"
                style={{ background: C.food, color: C.bg }}
              >
                <Check size={16} /> Serie terminada
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 mb-3">
            <div className="mono font-bold" style={{ fontSize: 56, color: C.train, lineHeight: 1 }}>
              {Math.floor(segundosEj / 60)}:{pad2(segundosEj % 60)}
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setCronoCorriendo((c) => !c)}
                className="flex-1 py-4 rounded-md text-lg font-bold"
                style={{ background: cronoCorriendo ? C.panelAlt : C.train, color: cronoCorriendo ? C.text : C.panel, border: cronoCorriendo ? `1px solid ${C.border}` : "none" }}
              >
                {cronoCorriendo ? "Pausar" : segundosEj > 0 ? "Reanudar" : "Iniciar"}
              </button>
            </div>
            <button
              onClick={() => {
                if (segundosEj <= 0) return;
                onAgregar({ track: trackSel, ejercicio: ejercicioActual.nombre, tipo: "tiempo", segundos: segundosEj });
                reiniciarCronoEj();
                setSerieActual((s) => s + 1);
                iniciarDescanso();
              }}
              disabled={segundosEj <= 0}
              className="w-full flex items-center justify-center gap-1 py-2 rounded font-medium disabled:opacity-40"
              style={{ background: C.food, color: C.bg }}
            >
              <Check size={16} /> Serie terminada
            </button>
          </div>
        )}

        {registro.entrenamiento.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {registro.entrenamiento.map((e) => (
              <FilaItem
                key={e.id}
                texto={e.ejercicio}
                sub={e.tipo === "tiempo" ? `${e.segundos}s sostenidos` : `${e.series}x${e.reps}`}
                onQuitar={() => onQuitar(e.id)}
              />
            ))}
          </div>
        )}
      </Panel>
      )}

      <PanelDescanso
        total={descansoTotal}
        restante={descansoRestante}
        corriendo={corriendo}
        onElegirDuracion={elegirDuracion}
        onIniciar={() => iniciarDescanso()}
        onPausarReanudar={pausarReanudar}
        onReiniciar={reiniciarDescanso}
      />

      {Object.entries(TRACKS).map(([key, track]) => (
        <Panel key={key}>
          <div className="flex items-center justify-between mb-1">
            <span className="display text-sm" style={{ color: C.text }}>{track.nombre.toUpperCase()}</span>
            <div className="flex items-center gap-2">
              {registro.entrenamiento.some((e) => e.track === key) && (
                <span className="flex items-center gap-1 text-[10px] mono" style={{ color: C.food }}>
                  <Check size={11} /> Hoy
                </span>
              )}
              <span className="text-xs mono" style={{ color: C.muted }}>Nivel {progresion[key]}/{track.ejercicios.length}</span>
            </div>
          </div>
          {progresion[key] < track.ejercicios.length && (
            <div className="mb-3">
              <div style={{ height: 4, background: C.panelAlt, borderRadius: 2 }}>
                <div
                  style={{
                    width: `${Math.min(((progresoSeries?.[key] || 0) / UMBRAL_SUBIR_NIVEL) * 100, 100)}%`,
                    height: 4,
                    background: C.train,
                    borderRadius: 2,
                  }}
                />
              </div>
              <span className="text-[9px] mono" style={{ color: C.muted }}>
                {Math.min(progresoSeries?.[key] || 0, UMBRAL_SUBIR_NIVEL)}/{UMBRAL_SUBIR_NIVEL} series para el próximo nivel
              </span>
            </div>
          )}
          <div className="flex overflow-x-auto gap-0 pb-1 items-center">
            {track.ejercicios.map((ej, i) => {
              const nivel = i + 1;
              const activo = nivel === progresion[key];
              const hecho = nivel < progresion[key];
              const bloqueado = nivel > NIVEL_LIMITE_FREE && !accesoPremium;
              const esCorteFreePremium = i === NIVEL_LIMITE_FREE && !accesoPremium;
              return (
                <div key={ej.nombre} className="flex items-center flex-shrink-0">
                  {i > 0 && !esCorteFreePremium && (
                    <div style={{ width: 16, height: 2, background: hecho || activo ? C.train : C.border }} />
                  )}
                  {esCorteFreePremium && (
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 34 }}>
                      <ChipPro texto="PRO" />
                      <div style={{ width: "100%", height: 0, borderTop: `2px dashed ${C.food}`, marginTop: 4 }} />
                    </div>
                  )}
                  <button
                    onClick={() => (bloqueado ? onBloqueado() : setNivel(key, nivel))}
                    className="flex flex-col items-center gap-1"
                    style={{ width: 76 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: hecho ? C.train : activo ? C.panelAlt : "transparent",
                        border: `2px solid ${bloqueado ? C.border : hecho || activo ? C.train : C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {bloqueado ? (
                        <Lock size={12} color={C.muted} />
                      ) : hecho ? (
                        <Check size={14} color={C.panel} />
                      ) : (
                        <span className="mono text-[10px]" style={{ color: activo ? C.train : C.muted }}>{nivel}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-center leading-tight" style={{ color: bloqueado ? C.muted : activo ? C.text : C.muted, height: 26 }}>{ej.nombre}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => toggleTips(key)}
            className="text-xs mono mt-2"
            style={{ color: C.food }}
          >
            {tipsAbiertos[key] ? "Ocultar consejos de técnica ▲" : "Ver consejos de técnica ▼"}
          </button>
          {tipsAbiertos[key] && (
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
        </Panel>
      ))}

    </div>
  );
}
