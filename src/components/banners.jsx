import React from "react";
import { Crown } from "lucide-react";
import { C } from "../tema";
import { PRECIO_PREMIUM } from "../data/planes";

// Se muestra mientras la cuenta es anónima (creada sola al abrir la app por
// primera vez, sin pedir registro, para que se pueda probar todo antes de
// comprometerse). El progreso ya se está guardando igual que con una cuenta
// real, pero queda ligado a este navegador/dispositivo hasta que se confirme
// un email — si se borran los datos del sitio antes de eso, se pierde.
export function BannerCuentaAnonima({ onCrearCuenta, onIniciarSesionExistente }) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-md px-3 py-2 mt-3 text-xs"
      style={{ background: C.foodDim, border: `1px solid ${C.food}`, color: C.text }}
    >
      <span>Estás probando la app sin cuenta. Crea una para no perder tu progreso.</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onIniciarSesionExistente && (
          <button onClick={onIniciarSesionExistente} className="underline" style={{ color: C.muted }}>
            Ya tengo cuenta
          </button>
        )}
        <button onClick={onCrearCuenta} className="px-2 py-1 rounded font-medium" style={{ background: C.food, color: C.bg }}>
          Crear cuenta
        </button>
      </div>
    </div>
  );
}

export function BannerStorage() {
  return (
    <div className="rounded-md px-3 py-2 mt-3 text-xs" style={{ background: C.trainDim, border: `1px solid ${C.train}`, color: C.text }}>
      <span style={{ color: C.train }}>⚠ Tu progreso no se está guardando.</span> Revisa tu conexión a internet. Si el problema sigue, cierra sesión y vuelve a entrar.
    </div>
  );
}

export function BannerPlan({ suscripcion, esPremiumActivo, diasPremiumRestantes, enTrial, diasTrialRestantes, onVerPlanes }) {
  if (!suscripcion) return null;
  if (esPremiumActivo) {
    const porVencer = diasPremiumRestantes <= 5;
    if (porVencer) {
      return (
        <button
          onClick={onVerPlanes}
          className="w-full flex items-center justify-between rounded-lg px-4 py-3 mt-4"
          style={{ background: C.trainDim, border: `1px solid ${C.train}` }}
        >
          <span className="text-xs" style={{ color: C.text }}>
            Tu Premium vence en <span style={{ color: C.food }}>{diasPremiumRestantes} día{diasPremiumRestantes !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-xs mono" style={{ color: C.food }}>Renovar</span>
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-lg px-4 py-3 mt-4" style={{ background: C.foodDim, border: `1px solid ${C.food}` }}>
        <Crown size={14} color={C.food} />
        <span className="text-xs" style={{ color: C.food }}>
          Premium activo · vence en {diasPremiumRestantes} día{diasPremiumRestantes !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }
  if (enTrial) {
    const porVencer = diasTrialRestantes <= 2;
    return (
      <button
        onClick={onVerPlanes}
        className="w-full flex items-center justify-between rounded-lg px-4 py-3 mt-4"
        style={{
          background: porVencer ? C.trainDim : C.panelAlt,
          border: `1px solid ${porVencer ? C.train : C.border}`,
        }}
      >
        <span className="text-xs" style={{ color: porVencer ? C.text : C.muted }}>
          Prueba gratis: te quedan <span style={{ color: C.food }}>{diasTrialRestantes} día{diasTrialRestantes !== 1 ? "s" : ""}</span>
          <span className="mono" style={{ color: porVencer ? C.text : C.muted }}> · después {PRECIO_PREMIUM}/mes</span>
        </span>
        <span className="text-xs mono font-medium flex items-center gap-0.5" style={{ color: C.food }}>Ver planes ›</span>
      </button>
    );
  }
  return (
    <button
      onClick={onVerPlanes}
      className="w-full flex items-center justify-between rounded-lg px-4 py-3 mt-4"
      style={{ background: C.trainDim, border: `1px solid ${C.train}` }}
    >
      <span className="text-xs" style={{ color: C.text }}>Tu prueba gratis terminó</span>
      <span className="text-xs mono" style={{ color: C.train }}>Activar Premium</span>
    </button>
  );
}
