import React from "react";
import { C } from "../tema";
import { FIGURAS } from "../data/entrenamiento";

export function FiguraTecnica({ figura, size = 56, color }) {
  const f = FIGURAS[figura];
  if (!f) return null;
  const trazo = color || C.train;
  const brazo = `${f.hombro[0]},${f.hombro[1]} ${f.codo[0]},${f.codo[1]} ${f.mano[0]},${f.mano[1]}`;
  const pierna = `${f.cadera[0]},${f.cadera[1]} ${f.rodilla[0]},${f.rodilla[1]} ${f.pie[0]},${f.pie[1]}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }}>
      {f.pisoY != null && <line x1="0" y1={f.pisoY} x2="100" y2={f.pisoY} stroke={C.border} strokeWidth="2" />}
      {f.barraY != null && <line x1="18" y1={f.barraY} x2="82" y2={f.barraY} stroke={C.border} strokeWidth="4" strokeLinecap="round" />}

      {/* piernas: trazo grueso de base + resalte más claro encima para dar volumen */}
      <polyline points={pierna} fill="none" stroke={trazo} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pierna} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      {/* torso */}
      <line x1={f.hombro[0]} y1={f.hombro[1]} x2={f.cadera[0]} y2={f.cadera[1]} stroke={trazo} strokeWidth="19" strokeLinecap="round" />
      <line x1={f.hombro[0]} y1={f.hombro[1]} x2={f.cadera[0]} y2={f.cadera[1]} stroke="rgba(255,255,255,0.18)" strokeWidth="7" strokeLinecap="round" />

      {/* brazos, van adelante del torso */}
      <polyline points={brazo} fill="none" stroke={trazo} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={brazo} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* cabeza en color claro, bien distinta del cuerpo: es lo que hace que
          la figura se lea como "una persona" de un vistazo en vez de un
          garabato de un solo color */}
      <circle cx={f.cabeza[0]} cy={f.cabeza[1]} r="11" fill={C.text} />
      <circle cx={f.cabeza[0] - 3} cy={f.cabeza[1] - 3} r="3.5" fill="rgba(0,0,0,0.1)" />
    </svg>
  );
}

// Ícono de la lista de técnica: la figura de trazos (persona real haciendo
// el ejercicio) dentro de un cuadrado con marco, en el color fuerte de la
// app y más grande que antes, para que se lea bien y no quede como una
// mancha gris. Muestra la posición más reconocible del movimiento (la
// segunda, si el ejercicio tiene dos).
export function IconoEjercicio({ figuras, size = 56 }) {
  // De las dos posiciones del ejercicio, se elige la que se lee mejor como
  // "una persona": en empuje (flexiones) es la de abajo, con el codo bien
  // flexionado; en el resto suele ser la de arriba (dominada arriba, sentadilla
  // abajo), que muestra el cuerpo más "trabajado" en vez de la posición neutra.
  const esEmpuje = figuras?.[0]?.startsWith("empuje_");
  const indice = esEmpuje ? 0 : figuras?.length > 1 ? 1 : 0;
  const figuraKey = figuras?.[indice];
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: C.panelAlt,
        border: `1px solid ${C.border}`,
      }}
    >
      <FiguraTecnica figura={figuraKey} size={size * 0.8} color={C.train} />
    </div>
  );
}

// Versión animada tipo "GIF" de la figura de técnica: si el ejercicio tiene
// posición inicial y final, la anima en loop entre las dos (SVG nativo, sin
// video ni imágenes reales). Si es un ejercicio de sostener (una sola
// posición), muestra la figura fija.
export function FiguraAnimada({ figuras, size = 84, color }) {
  if (!figuras || figuras.length === 0) return null;
  if (figuras.length === 1) return <FiguraTecnica figura={figuras[0]} size={size} color={color} />;

  const a = FIGURAS[figuras[0]];
  const b = FIGURAS[figuras[1]];
  if (!a || !b) return null;
  const trazo = color || C.train;
  const dur = "1.3s";
  const puntos = (f) => `${f.hombro[0]},${f.hombro[1]} ${f.codo[0]},${f.codo[1]} ${f.mano[0]},${f.mano[1]}`;
  const puntosPierna = (f) => `${f.cadera[0]},${f.cadera[1]} ${f.rodilla[0]},${f.rodilla[1]} ${f.pie[0]},${f.pie[1]}`;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }}>
      {a.pisoY != null && <line x1="0" y1={a.pisoY} x2="100" y2={a.pisoY} stroke={C.border} strokeWidth="2" />}
      {a.barraY != null && <line x1="18" y1={a.barraY} x2="82" y2={a.barraY} stroke={C.border} strokeWidth="4" strokeLinecap="round" />}

      <polyline fill="none" stroke={trazo} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="points" values={`${puntosPierna(a)};${puntosPierna(b)};${puntosPierna(a)}`} dur={dur} repeatCount="indefinite" />
      </polyline>
      <polyline fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="points" values={`${puntosPierna(a)};${puntosPierna(b)};${puntosPierna(a)}`} dur={dur} repeatCount="indefinite" />
      </polyline>

      <line stroke={trazo} strokeWidth="19" strokeLinecap="round">
        <animate attributeName="x1" values={`${a.hombro[0]};${b.hombro[0]};${a.hombro[0]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values={`${a.hombro[1]};${b.hombro[1]};${a.hombro[1]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values={`${a.cadera[0]};${b.cadera[0]};${a.cadera[0]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values={`${a.cadera[1]};${b.cadera[1]};${a.cadera[1]}`} dur={dur} repeatCount="indefinite" />
      </line>
      <line stroke="rgba(255,255,255,0.18)" strokeWidth="7" strokeLinecap="round">
        <animate attributeName="x1" values={`${a.hombro[0]};${b.hombro[0]};${a.hombro[0]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values={`${a.hombro[1]};${b.hombro[1]};${a.hombro[1]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values={`${a.cadera[0]};${b.cadera[0]};${a.cadera[0]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values={`${a.cadera[1]};${b.cadera[1]};${a.cadera[1]}`} dur={dur} repeatCount="indefinite" />
      </line>

      <polyline fill="none" stroke={trazo} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="points" values={`${puntos(a)};${puntos(b)};${puntos(a)}`} dur={dur} repeatCount="indefinite" />
      </polyline>
      <polyline fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="points" values={`${puntos(a)};${puntos(b)};${puntos(a)}`} dur={dur} repeatCount="indefinite" />
      </polyline>

      <circle r="11" fill={C.text}>
        <animate attributeName="cx" values={`${a.cabeza[0]};${b.cabeza[0]};${a.cabeza[0]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values={`${a.cabeza[1]};${b.cabeza[1]};${a.cabeza[1]}`} dur={dur} repeatCount="indefinite" />
      </circle>
      <circle r="3.5" fill="rgba(0,0,0,0.1)">
        <animate attributeName="cx" values={`${a.cabeza[0] - 3};${b.cabeza[0] - 3};${a.cabeza[0] - 3}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values={`${a.cabeza[1] - 3};${b.cabeza[1] - 3};${a.cabeza[1] - 3}`} dur={dur} repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
