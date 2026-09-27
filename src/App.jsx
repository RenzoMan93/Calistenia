import React, { useState, useEffect, useCallback } from "react";
import { Home, Dumbbell, Apple, TrendingUp, Settings, Lightbulb, HelpCircle, Star } from "lucide-react";
import { safeGet, safeSet, verificarStorage, iniciarSuscripcion } from "./lib/storage";
import { AdminCodigos } from "./views/AdminCodigos.jsx";
import { BannerCuentaAnonima, BannerPlan, BannerStorage } from "./components/banners.jsx";
import { C } from "./tema";
import { DIAS_PRUEBA, NIVEL_LIMITE_FREE, UMBRAL_SUBIR_NIVEL, premiumActivo } from "./data/planes";
import { LOGROS_DEF, TRACKS, planDeHoy } from "./data/entrenamiento";
import { ModalAyuda } from "./views/ModalAyuda.jsx";
import { ModalCrearCuenta, ModalLogro, ModalPlanes, ModalRecordatorioRenovacion, ModalSugerenciaNivel } from "./components/modales.jsx";
import { ModalPerfil } from "./views/ModalPerfil.jsx";
import { ModalTerminos } from "./views/ModalTerminos.jsx";
import { NavBtn } from "./components/ui.jsx";
import { Onboarding } from "./views/Onboarding.jsx";
import { VistaConsejos } from "./views/VistaConsejos.jsx";
import { VistaEntrenamiento } from "./views/VistaEntrenamiento.jsx";
import { VistaHoy } from "./views/VistaHoy.jsx";
import { VistaNutricion } from "./views/VistaNutricion.jsx";
import { VistaProgreso } from "./views/VistaProgreso.jsx";
import { VistaSugerencias } from "./views/VistaSugerencias.jsx";
import { diasEntre, fechaLegible, hoy, uid, ultimosDias } from "./lib/fechas";

export default function App({ session, onIniciarSesionExistente }) {
  const esAnonimo = session?.user?.is_anonymous === true;
  const [mostrarCrearCuenta, setMostrarCrearCuenta] = useState(false);
  const [tab, setTab] = useState("hoy");
  const [trackSugerido, setTrackSugerido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState({ kcal: 2200, prot: 150, carb: 220, grasa: 70, objetivo: "mantener", nombre: "" });
  const [progresion, setProgresion] = useState({ empuje: 1, traccion: 1, piernas: 1, core: 1 });
  const [registro, setRegistro] = useState({ entrenamiento: [], comidas: [] });
  const [semana, setSemana] = useState(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [suscripcion, setSuscripcion] = useState(null);
  const [mostrarPlanes, setMostrarPlanes] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [tapsLogo, setTapsLogo] = useState(0);
  const [progresoSeries, setProgresoSeries] = useState({ empuje: 0, traccion: 0, piernas: 0, core: 0 });
  const [sugerenciaNivel, setSugerenciaNivel] = useState(null);
  const [storageDisponible, setStorageDisponible] = useState(null);
  const [mostrarRecordatorio, setMostrarRecordatorio] = useState(false);
  const [logrosVistos, setLogrosVistos] = useState(undefined); // undefined = todavía no se cargó de Supabase
  const [colaLogros, setColaLogros] = useState([]);
  const fecha = hoy();

  const tocarLogo = () => {
    const n = tapsLogo + 1;
    setTapsLogo(n);
    if (n >= 5) {
      setMostrarAdmin(true);
      setTapsLogo(0);
    } else {
      setTimeout(() => setTapsLogo(0), 1500);
    }
  };

  useEffect(() => {
    (async () => {
      const disponible = await verificarStorage();
      setStorageDisponible(disponible);

      const [p, pr, reg, sus, onb, ps, lv] = await Promise.all([
        safeGet("perfil"),
        safeGet("progresion"),
        safeGet(`registro:${fecha}`),
        safeGet("suscripcion"),
        safeGet("onboarding"),
        safeGet("progresoSeries"),
        safeGet("logrosVistos"),
      ]);
      if (p) setPerfil(p);
      if (pr) setProgresion(pr);
      if (reg) setRegistro(reg);
      if (ps) setProgresoSeries(ps);
      // null (clave nunca guardada, usuario nuevo o ya existente de antes de
      // esta función) se deja tal cual en vez de convertirlo en [] acá: el
      // useEffect de más abajo necesita distinguir ese caso para no festejar
      // de una logros que ya tenía cumplidos hace rato.
      setLogrosVistos(lv);

      // La suscripción ya no se puede escribir desde el cliente (si no,
      // cualquiera podía ponerse premiumHasta a mano): la prueba gratis la
      // arranca el servidor (ver 0006_blindar_suscripcion.sql).
      let susActual = sus;
      if (!susActual) {
        susActual = (await iniciarSuscripcion()) || { trialStart: fecha, diasBonus: 0, premiumHasta: null };
      }
      setSuscripcion(susActual);
      setOnboarding(onb || { completo: false });

      setCargando(false);
    })();
  }, []);

  const completarOnboarding = async ({ perfilNuevo, progresionNueva }) => {
    setPerfil(perfilNuevo);
    safeSet("perfil", perfilNuevo);
    setProgresion(progresionNueva);
    safeSet("progresion", progresionNueva);
    const onb = { completo: true };
    setOnboarding(onb);
    safeSet("onboarding", onb);
  };

  const diasTrialUsados = suscripcion ? diasEntre(suscripcion.trialStart, fecha) : 0;
  const diasTrialRestantes = Math.max(DIAS_PRUEBA + (suscripcion?.diasBonus || 0) - diasTrialUsados, 0);
  const esPremiumActivo = premiumActivo(suscripcion, fecha);
  const diasPremiumRestantes = esPremiumActivo ? diasEntre(fecha, suscripcion.premiumHasta) : null;
  const enTrial = !esPremiumActivo && diasTrialRestantes > 0;
  const accesoPremium = esPremiumActivo || enTrial;

  // Recordatorio de renovación: un aviso que se muestra una sola vez por día
  // (no en cada apertura de la app) cuando quedan 2 días o menos para que
  // venza el Premium o la prueba gratis. No hay cobro automático (Mercado
  // Pago Checkout Pro no es una suscripción recurrente): esto es lo que le
  // avisa al usuario que tiene que volver a pagar para no perder el acceso.
  useEffect(() => {
    if (cargando || !suscripcion || !onboarding?.completo) return;
    const diasParaVencer = esPremiumActivo ? diasPremiumRestantes : enTrial ? diasTrialRestantes : null;
    if (diasParaVencer === null || diasParaVencer > 2) return;
    (async () => {
      const visto = await safeGet("recordatorioRenovacionVisto");
      if (visto?.fecha === fecha) return;
      setMostrarRecordatorio(true);
      safeSet("recordatorioRenovacionVisto", { fecha });
    })();
  }, [cargando, suscripcion, onboarding, esPremiumActivo, diasPremiumRestantes, enTrial, diasTrialRestantes, fecha]);

  // Vuelve a leer la suscripción desde el servidor: la usan tanto el canje de
  // código Premium como el botón "Ya pagué, verificar" (el webhook de
  // Mercado Pago extiende premiumHasta del lado del servidor, no hay push al cliente).
  const revisarSuscripcion = async () => {
    const fresca = await safeGet("suscripcion");
    if (fresca) setSuscripcion(fresca);
    return premiumActivo(fresca, fecha);
  };

  const guardarRegistro = useCallback(
    (nuevo) => {
      setRegistro(nuevo);
      safeSet(`registro:${fecha}`, nuevo);
    },
    [fecha]
  );

  const agregarComida = (comida) => {
    guardarRegistro({ ...registro, comidas: [...registro.comidas, { ...comida, id: uid() }] });
  };
  const quitarComida = (id) => {
    guardarRegistro({ ...registro, comidas: registro.comidas.filter((c) => c.id !== id) });
  };
  const agregarEjercicio = (ej) => {
    guardarRegistro({ ...registro, entrenamiento: [...registro.entrenamiento, { ...ej, id: uid() }] });
    // Marca hoy como entrenado en "semana" al toque, sin esperar a recargar:
    // así la racha (y los logros que dependen de ella) reaccionan enseguida.
    setSemana((prev) => {
      if (!prev || prev.length === 0 || prev[prev.length - 1].entreno) return prev;
      const copia = [...prev];
      copia[copia.length - 1] = { ...copia[copia.length - 1], entreno: true };
      return copia;
    });
    const nuevoConteo = { ...progresoSeries, [ej.track]: (progresoSeries[ej.track] || 0) + Number(ej.series || 1) };
    setProgresoSeries(nuevoConteo);
    safeSet("progresoSeries", nuevoConteo);
    const nivelActualTrack = progresion[ej.track];
    if (nuevoConteo[ej.track] >= UMBRAL_SUBIR_NIVEL && nivelActualTrack < TRACKS[ej.track].ejercicios.length) {
      setSugerenciaNivel({ track: ej.track, nivelActual: nivelActualTrack });
    }
  };
  const quitarEjercicio = (id) => {
    guardarRegistro({ ...registro, entrenamiento: registro.entrenamiento.filter((e) => e.id !== id) });
  };
  const setNivel = (track, nivel) => {
    const nueva = { ...progresion, [track]: nivel };
    setProgresion(nueva);
    safeSet("progresion", nueva);
    const nuevoConteo = { ...progresoSeries, [track]: 0 };
    setProgresoSeries(nuevoConteo);
    safeSet("progresoSeries", nuevoConteo);
  };
  const aceptarSugerenciaNivel = () => {
    const { track, nivelActual } = sugerenciaNivel;
    const siguienteNivel = nivelActual + 1;
    if (siguienteNivel > NIVEL_LIMITE_FREE && !accesoPremium) {
      setSugerenciaNivel(null);
      setMostrarPlanes(true);
      return;
    }
    setNivel(track, siguienteNivel);
    setSugerenciaNivel(null);
  };
  const descartarSugerenciaNivel = () => {
    const { track } = sugerenciaNivel;
    const nuevoConteo = { ...progresoSeries, [track]: 0 };
    setProgresoSeries(nuevoConteo);
    safeSet("progresoSeries", nuevoConteo);
    setSugerenciaNivel(null);
  };
  const guardarPerfil = (nuevo) => {
    setPerfil(nuevo);
    safeSet("perfil", nuevo);
    setEditandoPerfil(false);
  };

  const cargarSemana = useCallback(async () => {
    const dias = ultimosDias(7);
    const regs = await Promise.all(dias.map((d) => safeGet(`registro:${d}`)));
    setSemana(
      dias.map((d, i) => {
        const r = regs[i] || { entrenamiento: [], comidas: [] };
        const kcal = r.comidas.reduce((s, c) => s + Number(c.kcal || 0), 0);
        return { fecha: d, dia: fechaLegible(d), kcal, entreno: r.entrenamiento.length > 0 };
      })
    );
  }, []);

  useEffect(() => {
    if (!semana) cargarSemana();
  }, [semana, cargarSemana]);

  // Días seguidos sin entrenar (sin contar hoy, que recién está por decidirse)
  // hasta el más reciente en que sí entrenó. Se usa para el aviso en Hoy que
  // invita a volver en vez de arrancar como si no hubiera pasado nada.
  const diasSinEntrenar = (() => {
    if (!semana || !suscripcion) return 0;
    let dias = 0;
    for (let i = semana.length - 2; i >= 0; i--) {
      if (semana[i].fecha < suscripcion.trialStart) break;
      if (semana[i].entreno) break;
      dias++;
    }
    return dias;
  })();

  // Racha actual (incluye hoy si ya entrenaste), para mostrarla también en
  // Hoy y no solo en Progreso.
  const rachaActual = (() => {
    if (!semana) return 0;
    let racha = 0;
    for (let i = semana.length - 1; i >= 0; i--) {
      if (semana[i].entreno) racha++;
      else break;
    }
    return racha;
  })();

  // El logro incompleto más cercano a desbloquearse, para mostrar un
  // empujón concreto en Hoy ("A 1 día de...") en vez de que los logros solo
  // se vean festejados o escondidos en Progreso.
  const proximoLogro = (() => {
    if (!semana) return null;
    const diasEntrenados = semana.filter((d) => d.entreno).length;
    const nivelMaximo = Math.max(...Object.values(progresion || {}));
    const ctx = { racha: rachaActual, diasEntrenados, nivelMaximo, progresion };
    const incompletos = LOGROS_DEF.filter((l) => !l.cumple(ctx));
    if (incompletos.length === 0) return null;
    const mejor = [...incompletos].sort((a, b) => b.progreso(ctx) - a.progreso(ctx))[0];
    return { nombre: mejor.nombre, falta: mejor.falta(ctx) };
  })();

  // Detecta logros recién desbloqueados (racha, nivel, etc.) para festejarlos
  // en el momento en vez de que el usuario los descubra solo si entra a
  // Progreso. "logrosVistos" (persistido) evita festejar de nuevo algo que
  // ya se mostró antes.
  useEffect(() => {
    if (!semana || logrosVistos === undefined) return;
    let racha = 0;
    for (let i = semana.length - 1; i >= 0; i--) {
      if (semana[i].entreno) racha++;
      else break;
    }
    const diasEntrenados = semana.filter((d) => d.entreno).length;
    const nivelMaximo = Math.max(...Object.values(progresion || {}));
    const ctx = { racha, diasEntrenados, nivelMaximo, progresion };
    const cumplidosAhora = LOGROS_DEF.filter((l) => l.cumple(ctx)).map((l) => l.id);

    if (logrosVistos === null) {
      // Primera vez que existe "logrosVistos" para esta cuenta (usuario
      // nuevo, o alguien que ya usaba la app de antes de que existiera este
      // festejo): se guardan como ya vistos los logros que ya tenía
      // cumplidos sin festejarlos, para no bombardear con popups de "¡logro
      // desbloqueado!" cosas que en realidad logró hace tiempo. De acá en
      // más sí se festeja cualquier logro nuevo.
      setLogrosVistos(cumplidosAhora);
      safeSet("logrosVistos", cumplidosAhora);
      return;
    }

    const nuevos = cumplidosAhora.filter((id) => !logrosVistos.includes(id));
    if (nuevos.length === 0) return;
    const vistosNuevo = [...logrosVistos, ...nuevos];
    setLogrosVistos(vistosNuevo);
    safeSet("logrosVistos", vistosNuevo);
    setColaLogros((cola) => [...cola, ...LOGROS_DEF.filter((l) => nuevos.includes(l.id))]);
  }, [semana, progresion, logrosVistos]);

  const totales = registro.comidas.reduce(
    (acc, c) => ({
      kcal: acc.kcal + Number(c.kcal || 0),
      prot: acc.prot + Number(c.prot || 0),
      carb: acc.carb + Number(c.carb || 0),
      grasa: acc.grasa + Number(c.grasa || 0),
    }),
    { kcal: 0, prot: 0, carb: 0, grasa: 0 }
  );

  if (cargando) {
    return (
      <div style={{ background: C.bg, color: C.muted }} className="min-h-screen flex items-center justify-center font-sans">
        Cargando...
      </div>
    );
  }

  if (onboarding && !onboarding.completo) {
    return <Onboarding onCompletar={completarOnboarding} storageDisponible={storageDisponible} />;
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }} className="min-h-screen pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="max-w-2xl mx-auto">
      <header
        className="px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 z-30"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.bg, boxShadow: "0 6px 16px rgba(0,0,0,0.28)" }}
      >
        <div onClick={tocarLogo} className="flex items-center gap-2.5">
          <svg viewBox="0 0 100 100" width="28" height="28" style={{ flexShrink: 0 }}>
            <rect x="34.4" y="46.1" width="31.2" height="7.8" rx="3.9" fill={C.train} />
            <rect x="16.8" y="32.4" width="12.5" height="35.2" rx="3.5" fill={C.train} />
            <rect x="70.7" y="32.4" width="12.5" height="35.2" rx="3.5" fill={C.train} />
            <circle cx="50" cy="50" r="2.2" fill={C.food} />
          </svg>
          <div>
            <div className="display text-xs uppercase" style={{ color: C.muted, letterSpacing: "0.15em" }}>Rutina + Plato</div>
            <h1 className="display text-2xl font-bold" style={{ color: C.text, letterSpacing: "0.01em" }}>CALISTENIA <span style={{ color: C.train }}>/</span> NUTRICIÓN</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setMostrarAyuda(true)} aria-label="Cómo usar la app" className="flex items-center gap-1">
            <HelpCircle size={18} color={C.food} />
            <span className="text-[11px] mono" style={{ color: C.food }}>¿Cómo funciona?</span>
          </button>
          <button onClick={() => setEditandoPerfil(true)} aria-label="Configurar objetivos">
            <Settings size={20} color={C.muted} />
          </button>
        </div>
      </header>

      <div className="px-4">
        {storageDisponible === false && <BannerStorage />}
        {esAnonimo && (
          <BannerCuentaAnonima
            onCrearCuenta={() => setMostrarCrearCuenta(true)}
            onIniciarSesionExistente={onIniciarSesionExistente}
          />
        )}
        <BannerPlan
          suscripcion={suscripcion}
          esPremiumActivo={esPremiumActivo}
          diasPremiumRestantes={diasPremiumRestantes}
          enTrial={enTrial}
          diasTrialRestantes={diasTrialRestantes}
          onVerPlanes={() => setMostrarPlanes(true)}
        />
      </div>

      <main className="px-4 mt-4">
        {tab === "hoy" && (
          <VistaHoy
            totales={totales}
            perfil={perfil}
            registro={registro}
            onQuitarComida={quitarComida}
            onQuitarEjercicio={quitarEjercicio}
            onAgregarComida={agregarComida}
            onAgregarEjercicio={agregarEjercicio}
            progresion={progresion}
            accesoPremium={accesoPremium}
            onBloqueado={() => setMostrarPlanes(true)}
            planHoy={planDeHoy()}
            diasSinEntrenar={diasSinEntrenar}
            rachaActual={rachaActual}
            proximoLogro={proximoLogro}
            onIrAEntrenar={(track) => {
              setTrackSugerido(track);
              setTab("entrenamiento");
            }}
          />
        )}
        {tab === "entrenamiento" && (
          <VistaEntrenamiento
            progresion={progresion}
            progresoSeries={progresoSeries}
            setNivel={setNivel}
            registro={registro}
            onAgregar={agregarEjercicio}
            onQuitar={quitarEjercicio}
            accesoPremium={accesoPremium}
            onBloqueado={() => setMostrarPlanes(true)}
            trackInicial={trackSugerido}
            perfil={perfil}
          />
        )}
        {tab === "nutricion" && (
          <VistaNutricion
            totales={totales}
            perfil={perfil}
            registro={registro}
            onAgregar={agregarComida}
            onQuitar={quitarComida}
            accesoPremium={accesoPremium}
            onBloqueado={() => setMostrarPlanes(true)}
          />
        )}
        {tab === "progreso" && (
          <VistaProgreso
            semana={semana}
            perfil={perfil}
            progresion={progresion}
            accesoPremium={accesoPremium}
            onBloqueado={() => setMostrarPlanes(true)}
            onEditarObjetivo={() => setEditandoPerfil(true)}
          />
        )}
        {tab === "consejos" && <VistaConsejos perfil={perfil} progresion={progresion} />}
        {tab === "sugerencias" && (
          <VistaSugerencias perfil={perfil} esAnonimo={esAnonimo} onCrearCuenta={() => setMostrarCrearCuenta(true)} />
        )}
      </main>
      </div>

      {editandoPerfil && (
        <ModalPerfil
          perfil={perfil}
          onGuardar={guardarPerfil}
          onCerrar={() => setEditandoPerfil(false)}
          onVerTerminos={() => setMostrarTerminos(true)}
          onVerAyuda={() => setMostrarAyuda(true)}
          esAnonimo={esAnonimo}
          onCrearCuenta={() => {
            setEditandoPerfil(false);
            setMostrarCrearCuenta(true);
          }}
        />
      )}
      {mostrarPlanes && (
        <ModalPlanes
          esPremium={esPremiumActivo}
          diasPremiumRestantes={diasPremiumRestantes}
          diasTrialRestantes={diasTrialRestantes}
          esAnonimo={esAnonimo}
          onCrearCuenta={() => {
            setMostrarPlanes(false);
            setMostrarCrearCuenta(true);
          }}
          onPagoConfirmado={revisarSuscripcion}
          onCerrar={() => setMostrarPlanes(false)}
          onVerTerminos={() => setMostrarTerminos(true)}
        />
      )}
      {mostrarTerminos && <ModalTerminos onCerrar={() => setMostrarTerminos(false)} />}
      {mostrarAyuda && <ModalAyuda onCerrar={() => setMostrarAyuda(false)} />}
      {mostrarRecordatorio && (
        <ModalRecordatorioRenovacion
          esPremiumActivo={esPremiumActivo}
          diasPremiumRestantes={diasPremiumRestantes}
          diasTrialRestantes={diasTrialRestantes}
          onVerPlanes={() => {
            setMostrarRecordatorio(false);
            setMostrarPlanes(true);
          }}
          onCerrar={() => setMostrarRecordatorio(false)}
        />
      )}
      {colaLogros.length > 0 && (
        <ModalLogro logro={colaLogros[0]} onCerrar={() => setColaLogros((cola) => cola.slice(1))} />
      )}
      {mostrarCrearCuenta && <ModalCrearCuenta onCerrar={() => setMostrarCrearCuenta(false)} />}

      {mostrarAdmin && <AdminCodigos onCerrar={() => setMostrarAdmin(false)} />}
      {sugerenciaNivel && (
        <ModalSugerenciaNivel
          track={sugerenciaNivel.track}
          nivelActual={sugerenciaNivel.nivelActual}
          onAceptar={aceptarSugerenciaNivel}
          onDescartar={descartarSugerenciaNivel}
        />
      )}

      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl flex justify-around py-2"
        style={{ background: C.panel, borderTop: `1px solid ${C.border}` }}
      >
        <NavBtn icon={Home} label="Hoy" activo={tab === "hoy"} onClick={() => setTab("hoy")} />
        <NavBtn icon={Dumbbell} label="Entreno" activo={tab === "entrenamiento"} onClick={() => setTab("entrenamiento")} color={C.train} />
        <NavBtn icon={Apple} label="Nutrición" activo={tab === "nutricion"} onClick={() => setTab("nutricion")} color={C.food} />
        <NavBtn icon={TrendingUp} label="Progreso" activo={tab === "progreso"} onClick={() => setTab("progreso")} />
        <NavBtn icon={Lightbulb} label="Consejos" activo={tab === "consejos"} onClick={() => setTab("consejos")} color={C.food} />
        <NavBtn icon={Star} label="Sugerir" activo={tab === "sugerencias"} onClick={() => setTab("sugerencias")} color={C.food} />
      </nav>
    </div>
  );
}
