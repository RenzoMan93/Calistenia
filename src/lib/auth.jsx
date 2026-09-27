import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import App from "../App.jsx";

const C = {
  bg: "#0F1712",
  panel: "#16211B",
  panelAlt: "#1E2C24",
  border: "#2B3B32",
  text: "#F2EEE3",
  muted: "#8FA396",
  train: "#FF6B4A",
  food: "#FFC145",
  danger: "#E8503A",
};

function LoginScreen({ soloLogin = false, onCerrar }) {
  const [modo, setModo] = useState("login"); // "login" | "signup" | "recuperar"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (cargando) return;
    setMensaje(null);
    setCargando(true);
    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (modo === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMensaje({ ok: true, texto: "¡Cuenta creada! Si tu proyecto pide confirmación, revisa tu email." });
      } else if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMensaje({ ok: true, texto: "Te mandamos un email para restablecer tu contraseña." });
      }
    } catch (err) {
      setMensaje({ ok: false, texto: err.message || "Algo salió mal. Prueba de nuevo." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        .display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
      `}</style>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, position: "relative" }} className="rounded-md p-6 w-full max-w-sm">
        {onCerrar && (
          <button onClick={onCerrar} style={{ position: "absolute", top: 12, right: 14, color: C.muted }} aria-label="Cerrar">
            ✕
          </button>
        )}
        <h1 className="display text-xl font-bold text-center mb-1">
          CALISTENIA <span style={{ color: C.train }}>/</span> NUTRICIÓN
        </h1>
        <p className="text-xs text-center mb-5" style={{ color: C.muted }}>
          {modo === "login" && "Inicia sesión para ver tu progreso"}
          {modo === "signup" && "Crea tu cuenta para empezar tu prueba gratis"}
          {modo === "recuperar" && "Te mandamos un link para recuperar tu contraseña"}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded px-3 py-2 text-sm"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          {modo !== "recuperar" && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded px-3 py-2 text-sm"
              style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
            />
          )}
          <button
            type="submit"
            disabled={cargando}
            className="py-2 rounded font-medium mt-1"
            style={{ background: C.train, color: C.panel, opacity: cargando ? 0.6 : 1 }}
          >
            {cargando
              ? "Un momento..."
              : modo === "login"
              ? "Iniciar sesión"
              : modo === "signup"
              ? "Crear cuenta"
              : "Enviar link"}
          </button>
        </form>

        {mensaje && (
          <p className="text-xs mt-3" style={{ color: mensaje.ok ? C.food : C.danger }}>
            {mensaje.texto}
          </p>
        )}

        <div className="flex flex-col items-center gap-1 mt-4 text-xs" style={{ color: C.muted }}>
          {modo === "login" && (
            <>
              {!soloLogin && (
                <button onClick={() => setModo("signup")} className="underline">
                  ¿No tienes cuenta? Crea una
                </button>
              )}
              <button onClick={() => setModo("recuperar")} className="underline">
                Olvidé mi contraseña
              </button>
            </>
          )}
          {modo !== "login" && (
            <button onClick={() => setModo("login")} className="underline">
              Volver a iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NuevaContrasenaScreen({ onListo }) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (cargando) return;
    setMensaje(null);
    if (password !== confirmacion) {
      setMensaje({ ok: false, texto: "Las contraseñas no coinciden." });
      return;
    }
    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onListo();
    } catch (err) {
      setMensaje({ ok: false, texto: err.message || "No se pudo cambiar la contraseña. Prueba de nuevo." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-6 w-full max-w-sm">
        <h1 className="display text-xl font-bold text-center mb-1">
          CALISTENIA <span style={{ color: C.train }}>/</span> NUTRICIÓN
        </h1>
        <p className="text-xs text-center mb-5" style={{ color: C.muted }}>Elige tu nueva contraseña</p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña nueva"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded px-3 py-2 text-sm"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Repite la contraseña nueva"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            className="rounded px-3 py-2 text-sm"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <button
            type="submit"
            disabled={cargando}
            className="py-2 rounded font-medium mt-1"
            style={{ background: C.train, color: C.panel, opacity: cargando ? 0.6 : 1 }}
          >
            {cargando ? "Un momento..." : "Guardar contraseña"}
          </button>
        </form>

        {mensaje && (
          <p className="text-xs mt-3" style={{ color: mensaje.ok ? C.food : C.danger }}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = cargando, null = sin sesión (ni anónima)
  const [recuperando, setRecuperando] = useState(false);
  const [mostrarLoginExistente, setMostrarLoginExistente] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      if (data.session) {
        setSession(data.session);
        return;
      }
      // Nadie inició sesión todavía: se crea una cuenta anónima sola, sin
      // pedirle nada, para que pueda probar la app (entrenar, cargar
      // comidas) antes de registrarse. El aviso para crear la cuenta real
      // (y no perder ese progreso) se muestra desde dentro de la app —
      // ver BannerCuentaAnonima en App.jsx.
      const { data: anon, error } = await supabase.auth.signInAnonymously();
      if (cancelado) return;
      if (error) {
        // Puede pasar si el proyecto de Supabase no tiene habilitado el
        // inicio de sesión anónimo: se cae al login/registro de siempre.
        console.error("signInAnonymously error", error);
        setSession(null);
        return;
      }
      setSession(anon.session);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nuevaSesion) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecuperando(true);
      }
      if (event === "SIGNED_IN") {
        setMostrarLoginExistente(false);
      }
      setSession(nuevaSesion);
    });
    return () => {
      cancelado = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <div style={{ background: C.bg, color: C.muted }} className="min-h-screen flex items-center justify-center font-sans">
        Cargando...
      </div>
    );
  }

  if (recuperando) {
    return <NuevaContrasenaScreen onListo={() => setRecuperando(false)} />;
  }

  if (mostrarLoginExistente) {
    return <LoginScreen soloLogin onCerrar={() => setMostrarLoginExistente(false)} />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <App session={session} onIniciarSesionExistente={() => setMostrarLoginExistente(true)} />;
}
