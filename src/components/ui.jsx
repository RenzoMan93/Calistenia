import React from "react";
import { X, Lock, Crown, Star } from "lucide-react";
import { C } from "../tema";

export function NavBtn({ icon: Icon, label, activo, onClick, color }) {
  const c = activo ? color || C.text : C.muted;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-3 py-1">
      <Icon size={20} color={c} />
      <span className="text-[10px] mono" style={{ color: c }}>{label.toUpperCase()}</span>
    </button>
  );
}

export function Panel({ children, style }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
        ...style,
      }}
      className="rounded-lg p-4 mb-4"
    >
      {children}
    </div>
  );
}

export function Locked({ titulo, onBloqueado }) {
  return (
    <button onClick={onBloqueado} className="w-full flex flex-col items-center gap-2 py-6 rounded" style={{ background: C.panelAlt, border: `1px dashed ${C.food}` }}>
      <Lock size={20} color={C.muted} />
      <span className="text-sm" style={{ color: C.text }}>{titulo}</span>
      <ChipPro texto="Desbloquear con Premium" />
    </button>
  );
}

export function ChipPro({ texto = "PREMIUM" }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] mono px-2 py-0.5 rounded-full"
      style={{ background: C.food, color: C.bg }}
    >
      <Crown size={10} /> {texto}
    </span>
  );
}

export function FilaItem({ texto, sub, onQuitar }) {
  return (
    <div className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
      <div>
        <div className="text-sm">{texto}</div>
        <div className="text-xs mono" style={{ color: C.muted }}>{sub}</div>
      </div>
      <button onClick={onQuitar}><X size={16} color={C.muted} /></button>
    </div>
  );
}

export function FilaColapsable({ icon: Icon, color, titulo, abierto, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-md px-4 py-3 mb-4"
      style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
    >
      <span className="text-sm font-medium flex items-center gap-2" style={{ color: C.text }}>
        <Icon size={16} color={color} /> {titulo}
      </span>
      <span className="text-xs mono" style={{ color: C.muted }}>{abierto ? "▲" : "▾"}</span>
    </button>
  );
}

export function SelectorEstrellas({ valor, onCambiar }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onCambiar(n)}>
          <Star size={24} color={C.food} fill={n <= valor ? C.food : "none"} />
        </button>
      ))}
    </div>
  );
}

export function Estrellas({ cantidad, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} color={C.food} fill={n <= cantidad ? C.food : "none"} />
      ))}
    </div>
  );
}
