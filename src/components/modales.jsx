import React, { useState } from "react";
import { X, Check, Crown } from "lucide-react";
import { redeemPremiumCode, crearPreferenciaPago, crearCuentaDesdeAnonimo } from "../lib/storage";
import { C } from "../tema";
import { DIAS_PRUEBA, PLAN_FREE, PLAN_PREMIUM, PRECIO_PREMIUM, PREMIUM_SUBTITULO, PREMIUM_TITULO, UMBRAL_SUBIR_NIVEL, WHATSAPP_LINK } from "../data/planes";
import { TRACKS } from "../data/entrenamiento";

export function ModalCrearCuenta({ onCerrar }) {
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
      await crearCuentaDesdeAnonimo({ email, password });
      setMensaje({ ok: true, texto: "¡Listo! Revisa tu email para confirmar la cuenta. Tu progreso ya quedó guardado ahí." });
    } catch (err) {
      setMensaje({ ok: false, texto: err.message || "No se pudo crear la cuenta. Prueba de nuevo." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", zIndex: 90 }} onClick={onCerrar}>
      <div
        className="w-full max-w-sm rounded-lg p-5"
        style={{ background: C.panel, border: `1px solid ${C.food}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="display text-sm" style={{ color: C.muted }}>CREAR TU CUENTA</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.muted }}>
          Le sumamos un email y contraseña a lo que ya veniste haciendo: tu progreso, tus comidas y tu entreno no se tocan.
        </p>
        {mensaje?.ok ? (
          <p className="text-sm" style={{ color: C.food }}>{mensaje.texto}</p>
        ) : (
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
            <button
              type="submit"
              disabled={cargando}
              className="py-2 rounded font-medium mt-1"
              style={{ background: C.food, color: C.bg, opacity: cargando ? 0.6 : 1 }}
            >
              {cargando ? "Un momento..." : "Crear cuenta"}
            </button>
            {mensaje && !mensaje.ok && (
              <p className="text-xs" style={{ color: C.danger }}>{mensaje.texto}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export function ModalRecordatorioRenovacion({ esPremiumActivo, diasPremiumRestantes, diasTrialRestantes, onVerPlanes, onCerrar }) {
  const dias = esPremiumActivo ? diasPremiumRestantes : diasTrialRestantes;
  const cuando = dias <= 0 ? "hoy" : dias === 1 ? "mañana" : `en ${dias} días`;
  const titulo = esPremiumActivo ? "Tu Premium está por vencer" : "Tu prueba gratis está por terminar";
  const texto = esPremiumActivo
    ? `Vence ${cuando}. Si no vuelves a pagar, pasas al plan gratis y pierdes los niveles avanzados, las recetas y tu historial de progreso.`
    : `Termina ${cuando}. Después pasas al plan gratis (niveles 1 a 3). Activa Premium por ${PRECIO_PREMIUM}/mes para seguir con todo.`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", zIndex: 90 }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm rounded-lg p-5"
        style={{ background: C.panel, border: `1px solid ${C.train}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <Crown size={18} color={C.food} />
          <span className="display text-sm" style={{ color: C.text }}>{titulo}</span>
        </div>
        <p className="text-sm mb-4" style={{ color: C.muted }}>{texto}</p>
        <div className="flex gap-2">
          <button
            onClick={onCerrar}
            className="flex-1 py-2 rounded text-sm"
            style={{ background: C.panelAlt, color: C.muted, border: `1px solid ${C.border}` }}
          >
            Ahora no
          </button>
          <button
            onClick={onVerPlanes}
            className="flex-1 py-2 rounded text-sm font-medium"
            style={{ background: C.train, color: C.panel }}
          >
            Ver planes
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalSugerenciaNivel({ track, nivelActual, onAceptar, onDescartar }) {
  const trackInfo = TRACKS[track];
  const siguiente = trackInfo.ejercicios[nivelActual];
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", zIndex: 65 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.food}` }} className="rounded-md p-5 w-full max-w-sm text-center">
        <div className="text-4xl mb-2">🎉</div>
        <div className="display text-lg font-bold mb-1">¡Nivel superado!</div>
        <p className="text-sm mb-4" style={{ color: C.muted }}>
          Ya hiciste {UMBRAL_SUBIR_NIVEL} series de {trackInfo.ejercicios[nivelActual - 1].nombre} en {trackInfo.nombre}. Estás listo para el siguiente paso:
        </p>
        <div className="rounded-md p-3 mb-4" style={{ background: C.panelAlt }}>
          <div className="text-xs mb-1" style={{ color: C.muted }}>Nivel {nivelActual + 1}</div>
          <div className="text-sm font-medium">{siguiente.nombre}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDescartar} className="flex-1 py-2 rounded text-sm" style={{ background: C.panelAlt, color: C.muted, border: `1px solid ${C.border}` }}>
            Seguir en este nivel
          </button>
          <button onClick={onAceptar} className="flex-1 py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg }}>
            Subir de nivel
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalPlanes({ esPremium, diasPremiumRestantes, diasTrialRestantes, esAnonimo, onCrearCuenta, onPagoConfirmado, onCerrar, onVerTerminos }) {
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState(null);
  const [canjeando, setCanjeando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [avisoVerificacion, setAvisoVerificacion] = useState(null);

  const enviarCodigo = async () => {
    if (!codigo.trim() || canjeando) return;
    setCanjeando(true);
    const res = await redeemPremiumCode(codigo);
    setEstado(res);
    setCanjeando(false);
    if (res.ok) {
      await onPagoConfirmado();
      setTimeout(() => onCerrar(), 900);
    }
  };

  const irAPagar = async () => {
    setPagando(true);
    setAvisoVerificacion(null);
    try {
      const url = await crearPreferenciaPago();
      if (!url) throw new Error("Sin link de pago");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      setAvisoVerificacion({ ok: false, texto: "No pudimos iniciar el pago. Prueba de nuevo en un momento." });
    } finally {
      setPagando(false);
    }
  };

  const verificarPago = async () => {
    setVerificando(true);
    const yaEsPremium = await onPagoConfirmado();
    setVerificando(false);
    if (yaEsPremium) {
      setAvisoVerificacion({ ok: true, texto: "¡Pago confirmado! Premium activado." });
      setTimeout(() => onCerrar(), 900);
    } else {
      setAvisoVerificacion({ ok: false, texto: "Todavía no detectamos el pago. Espera unos segundos después de pagar y vuelve a intentar." });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", zIndex: 50 }}>
      <div
        style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}
        className="rounded-lg p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>PLANES</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        <div className="mb-4">
          <div className="display text-xl font-bold" style={{ letterSpacing: "0.01em" }}>{PREMIUM_TITULO}</div>
          <p className="text-xs mt-1" style={{ color: C.muted }}>{PREMIUM_SUBTITULO}</p>
        </div>

        <div className="rounded-lg p-3 mb-3" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
          <div className="display text-sm mb-2" style={{ color: C.muted, letterSpacing: "0.05em" }}>GRATIS</div>
          <div className="flex flex-col gap-1">
            {PLAN_FREE.map((f) => (
              <div key={f} className="flex gap-2 text-xs" style={{ color: C.muted }}>
                <Check size={13} color={C.muted} className="flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative rounded-lg p-4 mb-4 mt-5"
          style={{
            background: `linear-gradient(160deg, ${C.foodDim}, ${C.panel} 65%)`,
            border: `1.5px solid ${C.food}`,
            boxShadow: "0 10px 30px rgba(255,193,69,0.16)",
          }}
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap"
            style={{ background: C.food, color: C.bg, letterSpacing: "0.08em" }}
          >
            Recomendado
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} color={C.food} />
            <span className="display text-base font-bold" style={{ color: C.food, letterSpacing: "0.02em" }}>PREMIUM</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="mono font-bold" style={{ fontSize: 38, color: C.text, lineHeight: 1 }}>{PRECIO_PREMIUM}</span>
            <span className="text-sm" style={{ color: C.muted }}>/mes</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {PLAN_PREMIUM.map((f) => (
              <div key={f} className="flex gap-2 text-xs" style={{ color: C.text }}>
                <Check size={13} color={C.food} className="flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-3" style={{ color: C.muted }}>
            {DIAS_PRUEBA} días de prueba gratis para usuarios nuevos, después se factura mensual. Cancelas cuando quieras.
          </p>
        </div>

        {esPremium && (
          <div className="text-center text-sm mb-3" style={{ color: C.food }}>
            Ya tienes Premium activo — vence en {diasPremiumRestantes} día{diasPremiumRestantes !== 1 ? "s" : ""} ✓
          </div>
        )}
        {(!esPremium || diasPremiumRestantes <= 7) && (
          <div className="flex flex-col gap-3">
            {esPremium && (
              <div className="text-center text-[10px]" style={{ color: C.muted }}>Puedes renovar antes de que venza:</div>
            )}
            {esAnonimo ? (
              <div className="flex flex-col gap-2 rounded-md px-3 py-3" style={{ background: C.panelAlt, border: `1px solid ${C.food}` }}>
                <span className="text-xs" style={{ color: C.text }}>
                  Antes de pagar, crea tu cuenta (con email y contraseña) para poder asociar el pago y recuperar tu acceso si cambias de celular.
                </span>
                <button
                  onClick={onCrearCuenta}
                  className="py-2 rounded-md font-medium text-sm"
                  style={{ background: C.food, color: C.bg }}
                >
                  Crear cuenta
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={irAPagar}
                  disabled={pagando}
                  className="block text-center w-full py-3.5 rounded-md font-bold uppercase tracking-wide active:scale-[0.98] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${C.food}, #E0A83A)`,
                    color: C.bg,
                    opacity: pagando ? 0.6 : 1,
                    boxShadow: "0 8px 22px rgba(255,193,69,0.3)",
                  }}
                >
                  {pagando ? "Generando link de pago..." : "Pagar con Mercado Pago"}
                </button>
                <button onClick={verificarPago} disabled={verificando} className="text-xs mono underline" style={{ color: C.muted }}>
                  {verificando ? "Verificando..." : "Ya pagué, verificar estado"}
                </button>
              </>
            )}
            {avisoVerificacion && (
              <p className="text-xs" style={{ color: avisoVerificacion.ok ? C.food : C.danger }}>{avisoVerificacion.texto}</p>
            )}
            {avisoVerificacion && !avisoVerificacion.ok && (
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: C.food }}>
                ¿Sigues con problemas para pagar? Escríbenos por WhatsApp
              </a>
            )}

            <div className="text-center text-[10px] mt-1" style={{ color: C.muted }}>— ¿Tienes un código de activación? —</div>
            <div className="flex gap-2">
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ingresa tu código"
                className="flex-1 rounded px-3 py-2 text-sm mono"
                style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
              />
              <button onClick={enviarCodigo} disabled={canjeando} className="px-4 py-2 rounded text-sm font-medium" style={{ background: C.train, color: C.panel, opacity: canjeando ? 0.5 : 1 }}>
                Canjear
              </button>
            </div>
            {estado && (
              <p className="text-xs" style={{ color: estado.ok ? C.food : C.danger }}>{estado.mensaje}</p>
            )}
          </div>
        )}
        <button onClick={onVerTerminos} className="w-full text-center text-[10px] mt-3 underline" style={{ color: C.muted }}>
          Términos y Privacidad
        </button>
      </div>
    </div>
  );
}

// Festejo en el momento de desbloquear un logro (en vez de que el usuario lo
// descubra solo si entra a Progreso) — ver el useEffect en App que arma la
// cola de logros nuevos.
export function ModalLogro({ logro, onCerrar }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", zIndex: 95 }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm rounded-lg p-6 text-center"
        style={{
          background: `linear-gradient(160deg, ${C.foodDim}, ${C.panel})`,
          border: `1px solid ${C.food}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "popIn 0.35s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-3 flex items-center justify-center"
          style={{ width: 64, height: 64, borderRadius: "50%", background: C.food }}
        >
          <Crown size={32} color={C.bg} />
        </div>
        <div className="display text-xs mb-1" style={{ color: C.food }}>¡LOGRO DESBLOQUEADO!</div>
        <div className="text-lg font-bold mb-1">{logro.nombre}</div>
        <p className="text-sm mb-5" style={{ color: C.muted }}>{logro.desc}</p>
        <button
          onClick={onCerrar}
          className="w-full py-2.5 rounded-md font-medium"
          style={{ background: C.food, color: C.bg }}
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
