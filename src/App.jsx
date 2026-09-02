import React, { useState, useEffect, useCallback, useRef } from "react";
import { Home, Dumbbell, Apple, TrendingUp, Plus, X, Flame, Settings, Check, Lock, Crown, MessageCircle, Send, Lightbulb, HelpCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from "recharts";
import {
  safeGet,
  safeSet,
  verificarStorage,
  listRegistroKeysForMonth,
  obtenerHistorialEjercicio,
  ensureReferralCode,
  redeemReferralCode,
  claimReferralBonus,
  soyAdmin,
  crearCodigoPremium,
  listarCodigosPremium,
  adminListarUsuarios,
  adminActivarPremium,
  redeemPremiumCode,
  crearPreferenciaPago,
  llamarCoach,
} from "./lib/storage";
import { cerrarSesion } from "./lib/auth.jsx";

// ---------- tokens ----------
const C = {
  bg: "#0F1712",
  panel: "#16211B",
  panelAlt: "#1E2C24",
  border: "#2B3B32",
  text: "#F2EEE3",
  muted: "#8FA396",
  train: "#FF6B4A",
  trainDim: "#4A2C22",
  food: "#FFC145",
  foodDim: "#4A3D1E",
  danger: "#E8503A",
};

const TRACKS = {
  empuje: {
    nombre: "Empuje",
    ejercicios: [
      { nombre: "Flexiones de rodillas", tip: "Apoyá las rodillas, espalda recta y bajá el pecho cerca del piso sin arquear la zona lumbar.", figura: ["empuje_rodillas_bajo", "empuje_rodillas_arriba"] },
      { nombre: "Flexiones completas", tip: "Cuerpo en línea recta de cabeza a talones, codos a 45° del torso, no dejes caer la cadera.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexiones con manos juntas", tip: "Manos juntas formando un diamante bajo el pecho; sumás trabajo de tríceps, controlá la bajada.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Fondos en banco o paralelas", tip: "Bajá hasta que los hombros queden a la altura de los codos, no más, para cuidar el hombro.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexiones con un brazo extendido", tip: "Un brazo se extiende al costado mientras el otro empuja; alterná lados en cada repetición.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexión a un solo brazo (asistida)", tip: "La mano libre apoya solo de sostén, el peso real lo lleva el brazo de trabajo.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexión pike (pica)", tip: "Cadera elevada formando una V invertida, bajá la cabeza hacia el piso entre las manos: empieza a preparar el hombro para el pino.", figura: ["empuje_pike"] },
      { nombre: "Flexión pike con pies elevados", tip: "Pies apoyados en una silla o banco, cuanto más elevados más peso llevan los hombros.", figura: ["empuje_pike"] },
      { nombre: "Flexión en pino asistida (contra la pared)", tip: "Apoyate en la pared con los pies, bajá la cabeza controlado hasta rozar el piso y empujá de nuevo arriba.", figura: ["empuje_pino"] },
      { nombre: "Flexión a un solo brazo (completa)", tip: "Pies bien separados para dar base, empujá con todo el cuerpo tenso como una tabla, sin rotar la cadera.", figura: ["empuje_bajo", "empuje_arriba"] },
    ],
  },
  traccion: {
    nombre: "Tracción",
    ejercicios: [
      { nombre: "Remo con el cuerpo inclinado", tip: "Cuerpo recto, tirá con los codos pegados al torso y apretá los omóplatos arriba.", figura: ["remo_bajo", "remo_arriba"] },
      { nombre: "Dominadas asistidas (con banda)", tip: "Usá banda o apoyo en los pies, priorizá el rango completo antes que la velocidad.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Dominadas completas", tip: "Arrancá desde brazos extendidos, subí hasta que el mentón pase la barra, sin hamacarte.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Dominadas con peso extra", tip: "Sumá peso extra solo cuando puedas hacer 8-10 dominadas limpias sin lastre.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Subida completa a la barra, asistida", tip: "Usá banda para el impulso; practicá primero el tirón alto y el agarre girado.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Subida completa a la barra", tip: "Sin impulso de piernas: tirón explosivo y transición rápida de muñeca sobre la barra.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Muscle-up con peso extra", tip: "Sumá peso solo cuando el muscle-up de barra te salga limpio y controlado varias veces seguidas.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Dominada arquero (archer)", tip: "Un brazo casi extendido al costado, el otro hace casi todo el trabajo de tracción; alterná lados.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Dominada a un brazo, asistida (con banda)", tip: "La banda saca peso del brazo de trabajo; enfocate en no rotar el torso durante la subida.", figura: ["traccion_colgado", "traccion_arriba"] },
      { nombre: "Dominada a un solo brazo (completa)", tip: "Agarrate la muñeca del brazo libre para dar algo de estabilidad al principio; tirá parejo, sin tirones bruscos.", figura: ["traccion_colgado", "traccion_arriba"] },
    ],
  },
  piernas: {
    nombre: "Piernas",
    ejercicios: [
      { nombre: "Sentadilla con las dos piernas", tip: "Rodillas en línea con los pies, bajá hasta que los muslos queden paralelos al piso.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla con una pierna atrás elevada", tip: "Pie trasero elevado, bajá recto, sin que la rodilla delantera pase mucho la punta del pie.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Zancada con salto", tip: "Aterrizá suave, controlá la rodilla y alterná piernas en el aire.", figura: ["piernas_de_pie", "piernas_salto"] },
      { nombre: "Sentadilla a una pierna, asistida", tip: "Sostenete de algo (marco de puerta, barra) para trabajar equilibrio y rango completo.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla a una pierna completa", tip: "Pierna libre extendida al frente, bajá controlado, sin rebotar abajo.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla a una pierna con peso", tip: "Sumá una mancuerna solo cuando te salga limpia varias veces seguidas sin peso.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla búlgara con salto", tip: "Pie trasero elevado como en la búlgara, pero salta y aterrizá suave con la misma pierna adelante.", figura: ["piernas_de_pie", "piernas_salto"] },
      { nombre: "Sentadilla a una pierna en déficit", tip: "Parate sobre un cajón o escalón para bajar más profundo de lo normal; exige más movilidad de tobillo.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Shrimp squat asistido", tip: "Sostenete el pie trasero con la mano del mismo lado y ayudate con la otra mano en algo fijo para bajar controlado.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Shrimp squat completo", tip: "Sin apoyo de manos: bajá la rodilla trasera casi hasta tocar el talón, manteniendo el torso erguido.", figura: ["piernas_de_pie", "piernas_abajo"] },
    ],
  },
  core: {
    nombre: "Core",
    ejercicios: [
      { nombre: "Plancha abdominal", tip: "Cuerpo en línea recta, abdomen contraído, no dejes caer la cadera.", porTiempo: true, figura: ["core_plancha"] },
      { nombre: "Subir las piernas colgado de la barra", tip: "Colgado de la barra, subí las piernas sin balancearte, controlá la bajada.", figura: ["traccion_colgado", "core_colgado_arriba"] },
      { nombre: "Sostenerse con las piernas rectas al frente", tip: "Piernas extendidas al frente en forma de L, hombros activos empujando hacia abajo.", porTiempo: true, figura: ["core_lsit"] },
      { nombre: "Rueda abdominal desde rodillas", tip: "Rodillas apoyadas, extendé controlado y sin arquear la zona lumbar.", figura: ["core_rueda"] },
      { nombre: "Bajada controlada del cuerpo, recto", tip: "Solo los hombros apoyados, bajá el cuerpo recto lo más lento posible.", porTiempo: true, figura: ["core_negativa"] },
      { nombre: "Cuerpo horizontal colgado, piernas encogidas", tip: "Colgado, llevá las rodillas al pecho con el cuerpo horizontal, activando dorsales y core.", porTiempo: true, figura: ["core_frontlever"] },
      { nombre: "Rueda abdominal de pie", tip: "Arrancás parado en vez de arrodillado: mucho más exigente, controlá la zona lumbar en todo momento.", figura: ["core_rueda"] },
      { nombre: "V-sit", tip: "Piernas y torso forman una V, más cerrada que el L-sit; hombros activos y abdomen bien contraído.", porTiempo: true, figura: ["core_lsit"] },
      { nombre: "Front lever con una pierna extendida", tip: "Cuerpo horizontal colgado, una pierna estirada y la otra encogida; alterná para trabajar parejo.", porTiempo: true, figura: ["core_frontlever"] },
      { nombre: "Front lever completo", tip: "Cuerpo totalmente horizontal y recto, colgado de la barra; apretá dorsales, glúteos y abdomen a la vez.", porTiempo: true, figura: ["core_frontlever"] },
    ],
  },
};

// Coordenadas (viewBox 0-100) de figuras tipo pictograma: cabeza/hombro/codo/
// mano forman el brazo en dos tramos, cadera/rodilla/pie la pierna en dos
// tramos (así se ve la "quiebra" del codo o la rodilla en vez de una línea
// recta), más una línea de piso o de barra opcional para dar contexto.
const FIGURAS = {
  empuje_bajo: { cabeza: [24, 80], hombro: [30, 74], codo: [42, 66], mano: [38, 90], cadera: [62, 70], rodilla: [77, 78], pie: [92, 86], pisoY: 90 },
  empuje_arriba: { cabeza: [24, 52], hombro: [30, 56], codo: [34, 73], mano: [38, 90], cadera: [62, 58], rodilla: [77, 72], pie: [92, 86], pisoY: 90 },
  // Flexiones de rodillas: la rodilla queda apoyada y fija en el piso (pivote),
  // y lo que sube y baja es el torso, con el pie/canilla levantado atrás.
  empuje_rodillas_bajo: { cabeza: [26, 80], hombro: [32, 74], codo: [42, 66], mano: [38, 90], cadera: [56, 76], rodilla: [68, 90], pie: [82, 82], pisoY: 90 },
  empuje_rodillas_arriba: { cabeza: [26, 54], hombro: [32, 58], codo: [36, 75], mano: [38, 90], cadera: [56, 62], rodilla: [68, 90], pie: [82, 84], pisoY: 90 },
  empuje_pike: { cabeza: [58, 72], hombro: [52, 62], codo: [44, 76], mano: [38, 90], cadera: [42, 32], rodilla: [65, 60], pie: [88, 86], pisoY: 90 },
  empuje_pino: { cabeza: [50, 86], hombro: [50, 72], codo: [50, 81], mano: [50, 90], cadera: [50, 42], rodilla: [50, 25], pie: [50, 10], pisoY: 90 },
  traccion_colgado: { cabeza: [50, 42], hombro: [50, 32], codo: [50, 23], mano: [50, 15], cadera: [50, 68], rodilla: [50, 82], pie: [50, 96], barraY: 15 },
  traccion_arriba: { cabeza: [50, 18], hombro: [50, 24], codo: [44, 19], mano: [50, 15], cadera: [50, 58], rodilla: [50, 76], pie: [50, 92], barraY: 15 },
  remo_bajo: { cabeza: [18, 48], hombro: [26, 51], codo: [28, 40], mano: [30, 30], cadera: [74, 64], rodilla: [84, 74], pie: [95, 80], barraY: 30 },
  remo_arriba: { cabeza: [24, 32], hombro: [29, 36], codo: [22, 33], mano: [30, 30], cadera: [74, 58], rodilla: [84, 70], pie: [95, 78], barraY: 30 },
  piernas_de_pie: { cabeza: [50, 18], hombro: [50, 28], codo: [46, 42], mano: [42, 56], cadera: [50, 54], rodilla: [50, 72], pie: [50, 90], pisoY: 90 },
  piernas_abajo: { cabeza: [50, 42], hombro: [50, 50], codo: [40, 60], mano: [32, 68], cadera: [50, 68], rodilla: [62, 80], pie: [50, 90], pisoY: 90 },
  piernas_salto: { cabeza: [50, 20], hombro: [50, 28], codo: [42, 36], mano: [36, 42], cadera: [50, 46], rodilla: [60, 54], pie: [64, 66], pisoY: 90 },
  core_plancha: { cabeza: [18, 55], hombro: [26, 58], codo: [30, 70], mano: [32, 80], cadera: [64, 58], rodilla: [78, 66], pie: [90, 72], pisoY: 80 },
  core_colgado_arriba: { cabeza: [50, 18], hombro: [50, 24], codo: [50, 19], mano: [50, 15], cadera: [50, 54], rodilla: [58, 48], pie: [64, 44], barraY: 15 },
  core_lsit: { cabeza: [26, 32], hombro: [33, 38], codo: [42, 55], mano: [52, 70], cadera: [55, 55], rodilla: [72, 52], pie: [88, 50], pisoY: 75 },
  core_frontlever: { cabeza: [86, 44], hombro: [78, 44], codo: [78, 30], mano: [78, 15], cadera: [40, 44], rodilla: [28, 44], pie: [15, 44], barraY: 15 },
  core_negativa: { cabeza: [72, 58], hombro: [63, 56], codo: [58, 50], mano: [58, 48], cadera: [50, 68], rodilla: [40, 72], pie: [28, 72], pisoY: 80 },
  core_rueda: { cabeza: [82, 68], hombro: [73, 63], codo: [76, 58], mano: [75, 53], cadera: [50, 72], rodilla: [35, 77], pie: [20, 80], pisoY: 80 },
};

function FiguraTecnica({ figura, size = 56, color }) {
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

      {/* cabeza, con un pequeño resalte para que no quede plana */}
      <circle cx={f.cabeza[0]} cy={f.cabeza[1]} r="11" fill={trazo} />
      <circle cx={f.cabeza[0] - 3} cy={f.cabeza[1] - 3} r="3.5" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

function GuiaTecnica({ figuras, size = 56, color }) {
  if (!figuras || figuras.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-0.5">
        <FiguraTecnica figura={figuras[0]} size={size} color={color} />
        {figuras.length > 1 && <span className="text-[8px]" style={{ color: C.muted }}>INICIO</span>}
      </div>
      {figuras.length > 1 && (
        <>
          <span style={{ color: C.muted }}>→</span>
          <div className="flex flex-col items-center gap-0.5">
            <FiguraTecnica figura={figuras[1]} size={size} color={color} />
            <span className="text-[8px]" style={{ color: C.muted }}>FINAL</span>
          </div>
        </>
      )}
    </div>
  );
}

// Versión animada tipo "GIF" de la figura de técnica: si el ejercicio tiene
// posición inicial y final, la anima en loop entre las dos (SVG nativo, sin
// video ni imágenes reales). Si es un ejercicio de sostener (una sola
// posición), muestra la figura fija.
function FiguraAnimada({ figuras, size = 84, color }) {
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

      <circle r="11" fill={trazo}>
        <animate attributeName="cx" values={`${a.cabeza[0]};${b.cabeza[0]};${a.cabeza[0]}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values={`${a.cabeza[1]};${b.cabeza[1]};${a.cabeza[1]}`} dur={dur} repeatCount="indefinite" />
      </circle>
      <circle r="3.5" fill="rgba(255,255,255,0.25)">
        <animate attributeName="cx" values={`${a.cabeza[0] - 3};${b.cabeza[0] - 3};${a.cabeza[0] - 3}`} dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values={`${a.cabeza[1] - 3};${b.cabeza[1] - 3};${a.cabeza[1] - 3}`} dur={dur} repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

const ALIMENTOS = [
  { nombre: "Milanesa (150g)", kcal: 380, prot: 32, carb: 12, grasa: 22 },
  { nombre: "Arroz cocido (100g)", kcal: 130, prot: 2.7, carb: 28, grasa: 0.3 },
  { nombre: "Pollo a la plancha (150g)", kcal: 248, prot: 46, carb: 0, grasa: 6 },
  { nombre: "Huevo (1 unidad)", kcal: 78, prot: 6, carb: 0.6, grasa: 5 },
  { nombre: "Banana", kcal: 105, prot: 1.3, carb: 27, grasa: 0.4 },
  { nombre: "Yogur natural (1 pote)", kcal: 100, prot: 6, carb: 8, grasa: 5 },
  { nombre: "Pan (1 rebanada)", kcal: 80, prot: 3, carb: 15, grasa: 1 },
  { nombre: "Ensalada mixta", kcal: 60, prot: 2, carb: 10, grasa: 1.5 },
  { nombre: "Asado (150g)", kcal: 400, prot: 35, carb: 0, grasa: 28 },
  { nombre: "Batata al horno (150g)", kcal: 150, prot: 2, carb: 35, grasa: 0.2 },
];

const HELADERA_ITEMS = [
  "Huevo", "Pollo", "Carne picada", "Carne de cerdo", "Atún", "Pescado", "Queso", "Queso untable", "Yogur", "Leche",
  "Arroz", "Fideos", "Quinoa", "Pan", "Avena", "Batata", "Choclo", "Zapallo", "Lentejas", "Garbanzos",
  "Palta", "Tomate", "Lechuga", "Zanahoria", "Espinaca", "Cebolla", "Champiñones",
  "Banana", "Manzana", "Frutos secos", "Miel",
];

const RECETAS = [
  { nombre: "Tortilla de huevo con tomate", ingredientes: ["Huevo", "Tomate"], kcal: 220, prot: 16, carb: 4, grasa: 15, preparacion: "Batí los huevos, agregá el tomate picado y volcá en una sartén con un poco de aceite a fuego medio hasta que cuaje de los dos lados." , tipo: "desayuno" },
  { nombre: "Pollo con arroz y lechuga", ingredientes: ["Pollo", "Arroz", "Lechuga"], kcal: 420, prot: 42, carb: 45, grasa: 8, preparacion: "Cociná el pollo a la plancha con sal y limón, herví el arroz aparte, y serví todo junto con la lechuga fresca." , tipo: "almuerzo" },
  { nombre: "Ensalada de atún con palta", ingredientes: ["Atún", "Palta", "Tomate"], kcal: 310, prot: 26, carb: 8, grasa: 20, preparacion: "Mezclá el atún escurrido con la palta en cubos y el tomate picado; condimentá con sal, limón y un chorrito de aceite de oliva." , tipo: "almuerzo" },
  { nombre: "Bowl de avena, banana y yogur", ingredientes: ["Avena", "Banana", "Yogur"], kcal: 340, prot: 14, carb: 55, grasa: 7, preparacion: "Cociná la avena con un poco de agua o leche, dejala entibiar y agregá la banana en rodajas y el yogur arriba." , tipo: "desayuno" },
  { nombre: "Carne picada con batata al horno", ingredientes: ["Carne picada", "Batata"], kcal: 460, prot: 30, carb: 40, grasa: 20, preparacion: "Dorá la carne picada en una sartén con sal y condimentos, y horneá la batata en rodajas hasta que esté tierna." , tipo: "cena" },
  { nombre: "Sandwich de pollo y queso", ingredientes: ["Pollo", "Pan", "Queso"], kcal: 380, prot: 32, carb: 30, grasa: 14, preparacion: "Armá el sandwich con el pollo cocido (desmenuzado o en fetas) y el queso; podés tostarlo si querés." , tipo: "almuerzo" },
  { nombre: "Lentejas con arroz", ingredientes: ["Lentejas", "Arroz"], kcal: 350, prot: 18, carb: 60, grasa: 3, preparacion: "Cociná las lentejas hasta que estén tiernas y mezclá con el arroz ya hervido; podés sumar un sofrito de cebolla." , tipo: "cena" },
  { nombre: "Huevos revueltos con palta", ingredientes: ["Huevo", "Palta"], kcal: 300, prot: 18, carb: 6, grasa: 24, preparacion: "Batí los huevos y cociná revolviendo a fuego bajo hasta que cuajen; serví con la palta en rodajas o pisada." , tipo: "desayuno" },
  { nombre: "Ensalada de pollo, lechuga y tomate", ingredientes: ["Pollo", "Lechuga", "Tomate"], kcal: 260, prot: 38, carb: 6, grasa: 8, preparacion: "Cociná el pollo a la plancha, cortalo en tiras y mezclá con la lechuga y el tomate; condimentá a gusto." , tipo: "almuerzo" },
  { nombre: "Yogur con banana", ingredientes: ["Yogur", "Banana"], kcal: 205, prot: 7, carb: 35, grasa: 5, preparacion: "Cortá la banana en rodajas y mezclala con el yogur. Así de simple." , tipo: "colacion" },
  { nombre: "Atún con arroz", ingredientes: ["Atún", "Arroz"], kcal: 290, prot: 28, carb: 35, grasa: 4, preparacion: "Herví el arroz y mezclalo con el atún escurrido; podés sumar un chorrito de aceite de oliva." , tipo: "almuerzo" },
  { nombre: "Tostadas con queso y tomate", ingredientes: ["Pan", "Queso", "Tomate"], kcal: 270, prot: 14, carb: 28, grasa: 11, preparacion: "Tostá el pan y agregá el queso y el tomate en rodajas encima." , tipo: "merienda" },
  { nombre: "Cerdo salteado con zanahoria y cebolla", ingredientes: ["Carne de cerdo", "Zanahoria", "Cebolla"], kcal: 400, prot: 34, carb: 12, grasa: 22, preparacion: "Cortá la carne de cerdo en tiras y salteala en una sartén con la zanahoria y la cebolla cortadas finas." , tipo: "cena" },
  { nombre: "Pescado al horno con zapallo", ingredientes: ["Pescado", "Zapallo"], kcal: 280, prot: 32, carb: 14, grasa: 9, preparacion: "Horneá el pescado con sal y limón junto con el zapallo en cubos, unos 20-25 minutos a fuego medio." , tipo: "cena" },
  { nombre: "Fideos con champiñones y queso", ingredientes: ["Fideos", "Champiñones", "Queso"], kcal: 430, prot: 18, carb: 55, grasa: 15, preparacion: "Herví los fideos, salteá los champiñones aparte y mezclá todo con el queso rallado." , tipo: "cena" },
  { nombre: "Quinoa con garbanzos y espinaca", ingredientes: ["Quinoa", "Garbanzos", "Espinaca"], kcal: 380, prot: 16, carb: 58, grasa: 8, preparacion: "Cociná la quinoa según el paquete y mezclala con los garbanzos y la espinaca salteada." , tipo: "almuerzo" },
  { nombre: "Tostadas con queso untable y manzana", ingredientes: ["Pan", "Queso untable", "Manzana"], kcal: 260, prot: 9, carb: 38, grasa: 8, preparacion: "Untá el pan con el queso untable y agregá láminas finas de manzana arriba." , tipo: "merienda" },
  { nombre: "Choclo con pollo y espinaca", ingredientes: ["Choclo", "Pollo", "Espinaca"], kcal: 350, prot: 34, carb: 30, grasa: 9, preparacion: "Cociná el pollo a la plancha, salteá la espinaca, y mezclá todo con el choclo (fresco, en lata o hervido)." , tipo: "almuerzo" },
  { nombre: "Yogur con frutos secos y miel", ingredientes: ["Yogur", "Frutos secos", "Miel"], kcal: 280, prot: 10, carb: 30, grasa: 13, preparacion: "Mezclá el yogur con un puñado de frutos secos y un chorrito de miel arriba." , tipo: "colacion" },
  { nombre: "Omelette de queso, cebolla y champiñones", ingredientes: ["Huevo", "Queso", "Cebolla", "Champiñones"], kcal: 340, prot: 22, carb: 6, grasa: 25, preparacion: "Salteá la cebolla y los champiñones, batí los huevos con el queso y volcá todo en la sartén hasta que cuaje." , tipo: "desayuno" },
  { nombre: "Licuado de banana, leche y avena", ingredientes: ["Banana", "Leche", "Avena"], kcal: 290, prot: 11, carb: 50, grasa: 6, preparacion: "Licuá la banana con la leche y la avena hasta que quede cremoso." , tipo: "colacion" },
  { nombre: "Ensalada de garbanzos, tomate y cebolla", ingredientes: ["Garbanzos", "Tomate", "Cebolla"], kcal: 250, prot: 12, carb: 38, grasa: 6, preparacion: "Mezclá los garbanzos cocidos con el tomate y la cebolla picados finos; condimentá con aceite, sal y limón." , tipo: "almuerzo" },
];

// Orden y "fotito" (emoji, ante la falta de fotos reales) de cada momento del día.
const TIPOS_COMIDA = [
  { id: "desayuno", label: "Desayuno", emoji: "🍳" },
  { id: "almuerzo", label: "Almuerzo", emoji: "🍽️" },
  { id: "merienda", label: "Merienda", emoji: "🥪" },
  { id: "cena", label: "Cena", emoji: "🍲" },
  { id: "colacion", label: "Colación", emoji: "🍎" },
];

function sugerirDesdeHeladera(seleccion, misMenus = []) {
  const todasRecetas = [...RECETAS, ...misMenus];
  const set = new Set(seleccion);
  if (set.size === 0) return { completas: [], casiCompletas: [] };

  const completas = todasRecetas.filter((r) => r.ingredientes.every((i) => set.has(i)));
  if (completas.length > 0) return { completas, casiCompletas: [] };

  // Sin match perfecto: mostramos las que mejor se arman con lo que elegiste,
  // aunque falte más de un ingrediente, priorizando las que más coinciden.
  const casiCompletas = todasRecetas
    .map((r) => ({ ...r, tenes: r.ingredientes.filter((i) => set.has(i)), falta: r.ingredientes.filter((i) => !set.has(i)) }))
    .filter((r) => r.tenes.length > 0)
    .sort((a, b) => b.tenes.length - a.tenes.length || a.falta.length - b.falta.length)
    .slice(0, 3);

  return { completas: [], casiCompletas };
}

const CONSEJOS_BASE = [
  "Tomá al menos 2 litros de agua por día, más si entrenás fuerte o hace calor.",
  "No saltees comidas para 'ahorrar' calorías: llegás con más hambre y comés peor a la noche.",
  "Un plato equilibrado: mitad vegetales, un cuarto proteína, un cuarto carbohidrato.",
  "Dormí bien: la falta de sueño afecta tanto la recuperación muscular como el apetito.",
];

const CONSEJOS_POR_OBJETIVO = {
  bajar: [
    "Priorizá alimentos que dan saciedad con pocas calorías: vegetales, proteína magra, legumbres.",
    "No bajes de golpe muchas calorías: un déficit moderado se sostiene, uno extremo te hace comer mal a los pocos días.",
    "El hambre entre comidas suele ser sed o ansiedad, no siempre calorías de menos: tomá agua antes de sumar un snack.",
  ],
  mantener: [
    "Priorizá proteína en cada comida (carne, pollo, huevo, yogur) para acompañar la calistenia.",
    "Elegí carbohidratos con fibra (arroz, batata, avena, frutas) en vez de harinas refinadas.",
    "Dejá espacio para grasas buenas: palta, frutos secos, aceite de oliva.",
  ],
  subir: [
    "No le tengas miedo a las calorías extra: sumá un puñado de frutos secos o una fruta más si te cuesta llegar al objetivo.",
    "Priorizá carbohidratos y grasas de calidad para llegar a las calorías sin sentirte 'lleno' todo el día.",
    "Comé más seguido en el día (5 comidas chicas) si te cuesta llegar al objetivo en 3 comidas grandes.",
  ],
};

const NOMBRE_OBJETIVO = { bajar: "bajar de peso", mantener: "mantener tu peso", subir: "subir de peso" };

function consejosPersonalizados(objetivo) {
  const especificos = CONSEJOS_POR_OBJETIVO[objetivo] || CONSEJOS_POR_OBJETIVO.mantener;
  return [...especificos, ...CONSEJOS_BASE];
}

const COMIDAS_DEL_DIA = [
  { nombre: "Desayuno", pct: 0.25 },
  { nombre: "Almuerzo", pct: 0.35 },
  { nombre: "Merienda", pct: 0.1 },
  { nombre: "Cena", pct: 0.3 },
];

function recomendarComida(totales, perfil) {
  const objetivo = perfil.objetivo || "mantener";
  const restanteKcal = perfil.kcal - totales.kcal;
  if (restanteKcal <= 50) {
    const mensajeLimite =
      objetivo === "subir"
        ? "Ya llegaste a tu objetivo de calorías de hoy. Si te queda margen, sumar algo más te ayuda a subir de peso más rápido."
        : "Ya llegaste a tu objetivo de calorías de hoy. Si tenés hambre, priorizá algo liviano en vegetales o proteína magra.";
    return { mensaje: mensajeLimite, sugerencias: [] };
  }
  const pctCubierto = {
    prot: totales.prot / perfil.prot,
    carb: totales.carb / perfil.carb,
    grasa: totales.grasa / perfil.grasa,
  };
  const macroFaltante = Object.keys(pctCubierto).sort((a, b) => pctCubierto[a] - pctCubierto[b])[0];
  let candidatos = ALIMENTOS.filter((a) => a.kcal <= restanteKcal * 1.3);
  if (objetivo === "subir") {
    candidatos = candidatos.sort((a, b) => b.kcal - a.kcal);
  } else if (objetivo === "bajar") {
    candidatos = candidatos.sort(
      (a, b) => b[macroFaltante] / b.kcal - a[macroFaltante] / a.kcal || a.kcal - b.kcal
    );
  } else {
    candidatos = candidatos.sort((a, b) => b[macroFaltante] / b.kcal - a[macroFaltante] / a.kcal);
  }
  candidatos = candidatos.slice(0, 3);
  const etiqueta = { prot: "proteína", carb: "carbohidratos", grasa: "grasas" }[macroFaltante];
  const intro =
    objetivo === "subir"
      ? `Te quedan ${Math.round(restanteKcal)} kcal para llegar a tu objetivo de subir de peso. Sumá algo con energía:`
      : objetivo === "bajar"
      ? `Te quedan ${Math.round(restanteKcal)} kcal hoy y estás más atrasado en ${etiqueta}. Opciones livianas que suman lo que falta:`
      : `Te quedan ${Math.round(restanteKcal)} kcal hoy y estás más atrasado en ${etiqueta}. Buenas opciones:`;
  return { mensaje: intro, sugerencias: candidatos };
}

const DIAS_PRUEBA = 7;
const NIVEL_LIMITE_FREE = 3;
const UMBRAL_SUBIR_NIVEL = 8;
const PRECIO_PREMIUM = "$250";
const WHATSAPP_CONTACTO = "59892778233";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_CONTACTO}`;
const BONUS_DIAS_REFERIDO = 3;

const PLAN_FREE = [
  "Registro diario de entrenamiento y comidas",
  "Progresión de calistenia hasta el nivel 3 de cada grupo",
  "Alimentos rápidos y barras de macros",
  "Consejos saludables generales",
];
const PREMIUM_TITULO = "Dejá de entrenar a ciegas";
const PREMIUM_SUBTITULO = "Progresión guiada, comida resuelta y tu progreso real a la vista — no solo una lista de ejercicios.";

const PLAN_PREMIUM = [
  "Llegá a movimientos avanzados de verdad (muscle-up, pistol squat, front lever) con progresión guiada paso a paso, sin quemar etapas",
  "Nunca te quedás sin saber qué comer: recetas armadas con lo que ya tenés en la heladera",
  "Sabé exactamente qué comer en cada momento del día para llegar justo a tus macros",
  "Resolvé cualquier duda de técnica o nutrición al instante, como tener un coach en el bolsillo",
  "Registrá cualquier comida que hagas, sin límites",
  "Viví tu progreso real: gráfico de peso corporal y tu mejor marca en cada ejercicio",
  "Logros e insignias que te mantienen constante",
  "Racha semanal para no perder el ritmo",
];

const diasEntre = (desde, hasta) => Math.floor((new Date(hasta) - new Date(desde)) / 86400000);

// El acceso Premium se calcula comparando la fecha de vencimiento con hoy,
// nunca queda "activado para siempre": cada pago o código extiende
// premiumHasta 30 días (ver _extender_premium en el backend).
const premiumActivo = (suscripcion, fecha) => Boolean(suscripcion?.premiumHasta) && suscripcion.premiumHasta >= fecha;

// Mismo cálculo que arriba pero para una fila del listado de admin (que trae
// los campos en snake_case desde la función admin_listar_usuarios).
function estadoUsuarioAdmin(u, fecha) {
  if (u.premium_hasta && u.premium_hasta >= fecha) {
    return { texto: `Premium (${diasEntre(fecha, u.premium_hasta)}d)`, color: C.food };
  }
  if (u.trial_start) {
    const usados = diasEntre(u.trial_start, fecha);
    const restantes = Math.max(DIAS_PRUEBA + (u.dias_bonus || 0) - usados, 0);
    if (restantes > 0) return { texto: `Prueba (${restantes}d)`, color: C.muted };
  }
  return { texto: "Sin acceso", color: C.danger };
}

const NIVELES_ACTIVIDAD = [
  { id: "sedentario", label: "Sedentario (poco o nada de ejercicio)", factor: 1.2 },
  { id: "ligero", label: "Ligero (1-3 días/semana)", factor: 1.375 },
  { id: "moderado", label: "Moderado (3-5 días/semana)", factor: 1.55 },
  { id: "activo", label: "Activo (6-7 días/semana)", factor: 1.725 },
];
const OBJETIVOS = [
  { id: "bajar", label: "Bajar de peso", ajuste: -0.15 },
  { id: "mantener", label: "Mantener peso", ajuste: 0 },
  { id: "subir", label: "Subir de peso / ganar músculo", ajuste: 0.15 },
];

function calcularObjetivoDiario({ peso, altura, edad, sexo, actividad, objetivo }) {
  const p = Number(peso), a = Number(altura), e = Number(edad);
  if (!p || !a || !e) return null;
  const bmr = sexo === "mujer" ? 10 * p + 6.25 * a - 5 * e - 161 : 10 * p + 6.25 * a - 5 * e + 5;
  const factorAct = NIVELES_ACTIVIDAD.find((n) => n.id === actividad)?.factor || 1.375;
  const ajusteObj = OBJETIVOS.find((o) => o.id === objetivo)?.ajuste || 0;
  const kcal = Math.round(bmr * factorAct * (1 + ajusteObj));
  const prot = Math.round(p * 2);
  const grasa = Math.round(p * 0.8);
  const carb = Math.max(Math.round((kcal - prot * 4 - grasa * 9) / 4), 0);
  return { kcal, prot, carb, grasa };
}

const NIVELES_ACTIVIDAD_MAP = NIVELES_ACTIVIDAD;

const hoy = () => new Date().toISOString().slice(0, 10);

const fechaLegible = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-UY", { weekday: "short", day: "2-digit", month: "short" });
};
const ultimosDias = (n) => {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
};
const pad2 = (n) => String(n).padStart(2, "0");
const NOMBRES_MES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Split semanal sugerido: cada grupo se entrena 2 veces por semana con al
// menos 2-3 días de por medio para recuperar, y quedan días de descanso.
const PLAN_SEMANAL = {
  0: { descanso: true },
  1: { tracks: ["empuje", "core"] },
  2: { tracks: ["traccion", "piernas"] },
  3: { descanso: true },
  4: { tracks: ["empuje", "piernas"] },
  5: { tracks: ["traccion", "core"] },
  6: { descanso: true },
};

function planDeHoy() {
  return PLAN_SEMANAL[new Date().getDay()];
}

const uid = () => Math.random().toString(36).slice(2, 9);

export default function App() {
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
  const [mostrarChat, setMostrarChat] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [tapsLogo, setTapsLogo] = useState(0);
  const [referido, setReferido] = useState(null);
  const [progresoSeries, setProgresoSeries] = useState({ empuje: 0, traccion: 0, piernas: 0, core: 0 });
  const [sugerenciaNivel, setSugerenciaNivel] = useState(null);
  const [storageDisponible, setStorageDisponible] = useState(null);
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

      const [p, pr, reg, sus, onb, ps, refLocal] = await Promise.all([
        safeGet("perfil"),
        safeGet("progresion"),
        safeGet(`registro:${fecha}`),
        safeGet("suscripcion"),
        safeGet("onboarding"),
        safeGet("progresoSeries"),
        safeGet("referido"),
      ]);
      if (p) setPerfil(p);
      if (pr) setProgresion(pr);
      if (reg) setRegistro(reg);
      if (ps) setProgresoSeries(ps);

      let susActual = sus;
      if (!susActual) {
        susActual = { trialStart: fecha, diasBonus: 0, premiumHasta: null };
        await safeSet("suscripcion", susActual);
      }
      setSuscripcion(susActual);
      setOnboarding(onb || { completo: false });

      const miCodigo = await ensureReferralCode();
      setReferido({ miCodigo, codigoUsado: refLocal?.codigoUsado || null });

      const nuevosCanjes = await claimReferralBonus();
      if (nuevosCanjes > 0) {
        const susFresca = await safeGet("suscripcion");
        if (susFresca) setSuscripcion(susFresca);
      }

      setCargando(false);
    })();
  }, []);

  const completarOnboarding = async ({ perfilNuevo, progresionNueva, codigoInvitacion }) => {
    setPerfil(perfilNuevo);
    safeSet("perfil", perfilNuevo);
    setProgresion(progresionNueva);
    safeSet("progresion", progresionNueva);
    const onb = { completo: true };
    setOnboarding(onb);
    safeSet("onboarding", onb);

    if (codigoInvitacion && codigoInvitacion.trim()) {
      const res = await redeemReferralCode(codigoInvitacion);
      if (res.ok) {
        const refNuevo = { ...referido, codigoUsado: codigoInvitacion.trim().toUpperCase() };
        setReferido(refNuevo);
        safeSet("referido", { codigoUsado: refNuevo.codigoUsado });
        const susFresca = await safeGet("suscripcion");
        if (susFresca) setSuscripcion(susFresca);
      }
    }
  };

  const diasTrialUsados = suscripcion ? diasEntre(suscripcion.trialStart, fecha) : 0;
  const diasTrialRestantes = Math.max(DIAS_PRUEBA + (suscripcion?.diasBonus || 0) - diasTrialUsados, 0);
  const esPremiumActivo = premiumActivo(suscripcion, fecha);
  const diasPremiumRestantes = esPremiumActivo ? diasEntre(fecha, suscripcion.premiumHasta) : null;
  const enTrial = !esPremiumActivo && diasTrialRestantes > 0;
  const accesoPremium = esPremiumActivo || enTrial;

  // Vuelve a leer la suscripción desde el servidor: la usan tanto el canje de
  // código como el botón "Ya pagué, verificar" (el webhook de Mercado Pago
  // extiende premiumHasta del lado del servidor, no hay push al cliente).
  const revisarSuscripcion = async () => {
    const fresca = await safeGet("suscripcion");
    if (fresca) setSuscripcion(fresca);
    return premiumActivo(fresca, fecha);
  };

  const canjearInvitacion = async (codigoIngresado) => {
    const res = await redeemReferralCode(codigoIngresado);
    if (res.ok) {
      const refNuevo = { ...referido, codigoUsado: codigoIngresado.trim().toUpperCase() };
      setReferido(refNuevo);
      safeSet("referido", { codigoUsado: refNuevo.codigoUsado });
      await revisarSuscripcion();
    }
    return res;
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
    if (tab === "progreso" && !semana) cargarSemana();
  }, [tab, semana, cargarSemana]);

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

      <header className="px-4 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div onClick={tocarLogo}>
          <div className="display text-xs uppercase" style={{ color: C.muted, letterSpacing: "0.15em" }}>Rutina + Plato</div>
          <h1 className="display text-2xl font-bold" style={{ color: C.text }}>CALISTENIA <span style={{ color: C.train }}>/</span> NUTRICIÓN</h1>
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
            referido={referido}
            onCanjearInvitacion={canjearInvitacion}
            planHoy={planDeHoy()}
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
        {tab === "consejos" && <VistaConsejos perfil={perfil} />}
      </main>

      {editandoPerfil && (
        <ModalPerfil
          perfil={perfil}
          onGuardar={guardarPerfil}
          onCerrar={() => setEditandoPerfil(false)}
          onVerTerminos={() => setMostrarTerminos(true)}
          onVerAyuda={() => setMostrarAyuda(true)}
        />
      )}
      {mostrarPlanes && (
        <ModalPlanes
          esPremium={esPremiumActivo}
          diasPremiumRestantes={diasPremiumRestantes}
          diasTrialRestantes={diasTrialRestantes}
          onPagoConfirmado={revisarSuscripcion}
          onCerrar={() => setMostrarPlanes(false)}
          onVerTerminos={() => setMostrarTerminos(true)}
        />
      )}
      {mostrarTerminos && <ModalTerminos onCerrar={() => setMostrarTerminos(false)} />}
      {mostrarAyuda && <ModalAyuda onCerrar={() => setMostrarAyuda(false)} />}
      {mostrarChat && (
        <ChatCoach
          accesoPremium={accesoPremium}
          onBloqueado={() => {
            setMostrarChat(false);
            setMostrarPlanes(true);
          }}
          onCerrar={() => setMostrarChat(false)}
        />
      )}

      {mostrarAdmin && <AdminCodigos onCerrar={() => setMostrarAdmin(false)} />}
      {sugerenciaNivel && (
        <ModalSugerenciaNivel
          track={sugerenciaNivel.track}
          nivelActual={sugerenciaNivel.nivelActual}
          onAceptar={aceptarSugerenciaNivel}
          onDescartar={descartarSugerenciaNivel}
        />
      )}

      <button
        onClick={() => setMostrarChat(true)}
        aria-label="Consultar al coach"
        className="fixed flex items-center justify-center"
        style={{
          bottom: 74,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: C.train,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 40,
        }}
      >
        <MessageCircle size={22} color={C.panel} />
      </button>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around py-2"
        style={{ background: C.panel, borderTop: `1px solid ${C.border}` }}
      >
        <NavBtn icon={Home} label="Hoy" activo={tab === "hoy"} onClick={() => setTab("hoy")} />
        <NavBtn icon={Dumbbell} label="Entreno" activo={tab === "entrenamiento"} onClick={() => setTab("entrenamiento")} color={C.train} />
        <NavBtn icon={Apple} label="Nutrición" activo={tab === "nutricion"} onClick={() => setTab("nutricion")} color={C.food} />
        <NavBtn icon={TrendingUp} label="Progreso" activo={tab === "progreso"} onClick={() => setTab("progreso")} />
        <NavBtn icon={Lightbulb} label="Consejos" activo={tab === "consejos"} onClick={() => setTab("consejos")} color={C.food} />
      </nav>
    </div>
  );
}

function NavBtn({ icon: Icon, label, activo, onClick, color }) {
  const c = activo ? color || C.text : C.muted;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-3 py-1">
      <Icon size={20} color={c} />
      <span className="text-[10px] mono" style={{ color: c }}>{label.toUpperCase()}</span>
    </button>
  );
}

function Panel({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, ...style }} className="rounded-md p-4 mb-4">
      {children}
    </div>
  );
}

function BannerStorage() {
  return (
    <div className="rounded-md px-3 py-2 mt-3 text-xs" style={{ background: C.trainDim, border: `1px solid ${C.train}`, color: C.text }}>
      <span style={{ color: C.train }}>⚠ Tu progreso no se está guardando.</span> Revisá tu conexión a internet. Si el problema sigue, cerrá sesión y volvé a entrar.
    </div>
  );
}

function BannerPlan({ suscripcion, esPremiumActivo, diasPremiumRestantes, enTrial, diasTrialRestantes, onVerPlanes }) {
  if (!suscripcion) return null;
  if (esPremiumActivo) {
    const porVencer = diasPremiumRestantes <= 5;
    if (porVencer) {
      return (
        <button
          onClick={onVerPlanes}
          className="w-full flex items-center justify-between rounded-md px-3 py-2 mt-3"
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
      <div className="flex items-center gap-2 rounded-md px-3 py-2 mt-3" style={{ background: C.foodDim, border: `1px solid ${C.food}` }}>
        <Crown size={14} color={C.food} />
        <span className="text-xs" style={{ color: C.food }}>
          Premium activo · vence en {diasPremiumRestantes} día{diasPremiumRestantes !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }
  if (enTrial) {
    return (
      <button
        onClick={onVerPlanes}
        className="w-full flex items-center justify-between rounded-md px-3 py-2 mt-3"
        style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
      >
        <span className="text-xs" style={{ color: C.muted }}>
          Prueba gratis: te quedan <span style={{ color: C.food }}>{diasTrialRestantes} día{diasTrialRestantes !== 1 ? "s" : ""}</span>
        </span>
        <span className="text-xs mono" style={{ color: C.food }}>Ver planes</span>
      </button>
    );
  }
  return (
    <button
      onClick={onVerPlanes}
      className="w-full flex items-center justify-between rounded-md px-3 py-2 mt-3"
      style={{ background: C.trainDim, border: `1px solid ${C.train}` }}
    >
      <span className="text-xs" style={{ color: C.text }}>Tu prueba gratis terminó</span>
      <span className="text-xs mono" style={{ color: C.train }}>Activar Premium</span>
    </button>
  );
}

function Locked({ titulo, onBloqueado }) {
  return (
    <button onClick={onBloqueado} className="w-full flex flex-col items-center gap-2 py-6 rounded" style={{ background: C.panelAlt, border: `1px dashed ${C.food}` }}>
      <Lock size={20} color={C.muted} />
      <span className="text-sm" style={{ color: C.text }}>{titulo}</span>
      <ChipPro texto="Desbloquear con Premium" />
    </button>
  );
}

function ChipPro({ texto = "PREMIUM" }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] mono px-2 py-0.5 rounded-full"
      style={{ background: C.food, color: C.bg }}
    >
      <Crown size={10} /> {texto}
    </span>
  );
}

function ModalSugerenciaNivel({ track, nivelActual, onAceptar, onDescartar }) {
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

function ModalPlanes({ esPremium, diasPremiumRestantes, diasTrialRestantes, onPagoConfirmado, onCerrar, onVerTerminos }) {
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
      setAvisoVerificacion({ ok: false, texto: "No pudimos iniciar el pago. Probá de nuevo en un momento." });
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
      setAvisoVerificacion({ ok: false, texto: "Todavía no detectamos el pago. Esperá unos segundos después de pagar y volvé a intentar." });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 50 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>PLANES</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        <div className="mb-4">
          <div className="display text-lg font-bold">{PREMIUM_TITULO}</div>
          <p className="text-xs mt-1" style={{ color: C.muted }}>{PREMIUM_SUBTITULO}</p>
        </div>

        <div className="rounded-md p-3 mb-3" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
          <div className="display text-sm mb-2">Gratis</div>
          <div className="flex flex-col gap-1">
            {PLAN_FREE.map((f) => (
              <div key={f} className="flex gap-2 text-xs" style={{ color: C.muted }}>
                <Check size={13} color={C.muted} className="flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md p-3 mb-4" style={{ background: C.foodDim, border: `1px solid ${C.food}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Crown size={14} color={C.food} />
              <span className="display text-sm" style={{ color: C.food }}>Premium</span>
            </div>
            <span className="mono text-sm" style={{ color: C.food }}>{PRECIO_PREMIUM}/mes</span>
          </div>
          <div className="flex flex-col gap-1">
            {PLAN_PREMIUM.map((f) => (
              <div key={f} className="flex gap-2 text-xs" style={{ color: C.text }}>
                <Check size={13} color={C.food} className="flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-2" style={{ color: C.muted }}>
            {DIAS_PRUEBA} días de prueba gratis para usuarios nuevos, después se factura mensual. Cancelás cuando quieras.
          </p>
        </div>

        {esPremium && (
          <div className="text-center text-sm mb-3" style={{ color: C.food }}>
            Ya tenés Premium activo — vence en {diasPremiumRestantes} día{diasPremiumRestantes !== 1 ? "s" : ""} ✓
          </div>
        )}
        {(!esPremium || diasPremiumRestantes <= 7) && (
          <div className="flex flex-col gap-3">
            {esPremium && (
              <div className="text-center text-[10px]" style={{ color: C.muted }}>Podés renovar antes de que venza:</div>
            )}
            <button
              onClick={irAPagar}
              disabled={pagando}
              className="block text-center w-full py-2 rounded font-medium"
              style={{ background: C.food, color: C.bg, opacity: pagando ? 0.6 : 1 }}
            >
              {pagando ? "Generando link de pago..." : "Pagar con Mercado Pago"}
            </button>
            <button onClick={verificarPago} disabled={verificando} className="text-xs mono underline" style={{ color: C.muted }}>
              {verificando ? "Verificando..." : "Ya pagué, verificar estado"}
            </button>
            {avisoVerificacion && (
              <p className="text-xs" style={{ color: avisoVerificacion.ok ? C.food : C.danger }}>{avisoVerificacion.texto}</p>
            )}
            {avisoVerificacion && !avisoVerificacion.ok && (
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: C.food }}>
                ¿Seguís con problemas para pagar? Escribinos por WhatsApp
              </a>
            )}

            <div className="text-center text-[10px] mt-1" style={{ color: C.muted }}>— ¿Tenés un código de activación? —</div>
            <div className="flex gap-2">
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ingresá tu código"
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

const NIVEL_OPCIONES = [
  {
    id: "principiante",
    label: "Principiante",
    desc: "Recién arranco o hago poco entrenamiento de fuerza",
    progresion: { empuje: 1, traccion: 1, piernas: 1, core: 1 },
  },
  {
    id: "intermedio",
    label: "Intermedio",
    desc: "Entreno hace un tiempo, hago flexiones y algo de dominadas",
    progresion: { empuje: 3, traccion: 2, piernas: 3, core: 2 },
  },
  {
    id: "avanzado",
    label: "Avanzado",
    desc: "Domino los básicos y busco progresiones más difíciles",
    progresion: { empuje: 5, traccion: 4, piernas: 5, core: 4 },
  },
];

// ---------- HOY ----------
function VistaHoy({ totales, perfil, registro, onQuitarComida, onQuitarEjercicio, onAgregarComida, onAgregarEjercicio, progresion, accesoPremium, onBloqueado, referido, onCanjearInvitacion, planHoy, onIrAEntrenar }) {
  const pct = Math.min(totales.kcal / perfil.kcal, 1) * 360;
  const restante = Math.max(perfil.kcal - totales.kcal, 0);
  const [quickComida, setQuickComida] = useState(false);
  const [quickEjercicio, setQuickEjercicio] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-semibold">Hola{perfil.nombre ? `, ${perfil.nombre}` : ""} 👋</span>
      </div>

      {planHoy.descanso ? (
        <Panel style={{ textAlign: "center" }}>
          <div className="display text-sm mb-1" style={{ color: C.muted }}>PLAN DE HOY</div>
          <div className="text-base font-semibold mb-1">Día de descanso 😌</div>
          <p className="text-xs mb-3" style={{ color: C.muted }}>
            Tu cuerpo también progresa recuperándose. Aprovechá para estirar o simplemente descansar.
          </p>
          <button onClick={() => onIrAEntrenar(Object.keys(TRACKS)[0])} className="text-xs mono underline" style={{ color: C.food }}>
            Igual quiero entrenar
          </button>
        </Panel>
      ) : (
        <Panel style={{ borderColor: C.train }}>
          <div className="display text-sm mb-1" style={{ color: C.muted }}>PLAN DE HOY</div>
          <div className="text-base font-semibold mb-3">{planHoy.tracks.map((t) => TRACKS[t].nombre).join(" + ")}</div>
          {registro.entrenamiento.length > 0 ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: C.food }}>
              <Check size={16} /> ¡Ya entrenaste hoy!
            </div>
          ) : (
            <button
              onClick={() => onIrAEntrenar(planHoy.tracks[0])}
              className="w-full py-2 rounded-md font-bold"
              style={{ background: C.train, color: C.panel }}
            >
              Empezar mi entrenamiento
            </button>
          )}
        </Panel>
      )}

      <Panel style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: `conic-gradient(${C.train} ${pct}deg, ${C.panelAlt} 0deg)`,
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
          <div className="display text-sm" style={{ color: C.muted }}>COMBUSTIBLE DE HOY</div>
          <div className="text-lg font-semibold mt-1">
            {restante > 0 ? `Quedan ${Math.round(restante)} kcal` : "Objetivo alcanzado"}
          </div>
          <div className="flex gap-3 mt-2 text-xs mono" style={{ color: C.muted }}>
            <span>P {Math.round(totales.prot)}/{perfil.prot}g</span>
            <span>C {Math.round(totales.carb)}/{perfil.carb}g</span>
            <span>G {Math.round(totales.grasa)}/{perfil.grasa}g</span>
          </div>
        </div>
      </Panel>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setQuickEjercicio(true)}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-md font-medium text-sm"
          style={{ background: C.trainDim, color: C.train, border: `1px solid ${C.train}` }}
        >
          <Plus size={14} /> Ejercicio
        </button>
        <button
          onClick={() => setQuickComida(true)}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-md font-medium text-sm"
          style={{ background: C.foodDim, color: C.food, border: `1px solid ${C.food}` }}
        >
          <Plus size={14} /> Comida
        </button>
      </div>

      <Panel>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={16} color={C.train} />
          <span className="display text-sm" style={{ color: C.muted }}>ENTRENAMIENTO DE HOY</span>
        </div>
        {registro.entrenamiento.length === 0 ? (
          <p className="text-sm" style={{ color: C.muted }}>Todavía no registraste ejercicios. Usá el botón "+ Ejercicio" de arriba.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registro.entrenamiento.map((e) => (
              <FilaItem key={e.id} texto={`${e.ejercicio}`} sub={e.tipo === "tiempo" ? `${e.segundos}s sostenidos` : `${e.series}x${e.reps}`} onQuitar={() => onQuitarEjercicio(e.id)} />
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="flex items-center gap-2 mb-3">
          <Apple size={16} color={C.food} />
          <span className="display text-sm" style={{ color: C.muted }}>COMIDAS DE HOY</span>
        </div>
        {registro.comidas.length === 0 ? (
          <p className="text-sm" style={{ color: C.muted }}>Todavía no cargaste comidas. Usá el botón "+ Comida" de arriba.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registro.comidas.map((c) => (
              <FilaItem key={c.id} texto={c.nombre} sub={`${c.kcal} kcal`} onQuitar={() => onQuitarComida(c.id)} />
            ))}
          </div>
        )}
      </Panel>

      <PanelHeladera restanteKcal={restante} onAgregarComida={onAgregarComida} accesoPremium={accesoPremium} onBloqueado={onBloqueado} />

      <PanelReferidos referido={referido} onCanjear={onCanjearInvitacion} />

      {quickEjercicio && (
        <QuickAddEjercicio progresion={progresion} onAgregar={onAgregarEjercicio} onCerrar={() => setQuickEjercicio(false)} />
      )}
      {quickComida && (
        <QuickAddComida onAgregar={onAgregarComida} onCerrar={() => setQuickComida(false)} />
      )}
    </div>
  );
}

function QuickAddEjercicio({ progresion, onAgregar, onCerrar }) {
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
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm">
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

function QuickAddComida({ onAgregar, onCerrar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 55 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto">
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
        <p className="text-[10px] mt-3 text-center" style={{ color: C.muted }}>¿No está lo que buscás? Cargalo desde la pestaña Nutrición.</p>
      </div>
    </div>
  );
}

function PanelReferidos({ referido, onCanjear }) {
  const [codigoInput, setCodigoInput] = useState("");
  const [estado, setEstado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  if (!referido) return null;

  const mensaje = `Estoy usando esta app de calistenia + nutrición 💪🥗 Sumate con mi código ${referido.miCodigo} y los dos ganamos ${BONUS_DIAS_REFERIDO} días gratis de Premium.`;
  const linkWhatsapp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(referido.miCodigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // silencioso: si el navegador no permite clipboard, el usuario puede copiarlo a mano
    }
  };

  const canjear = async () => {
    if (!codigoInput.trim() || enviando) return;
    setEnviando(true);
    const res = await onCanjear(codigoInput);
    setEstado(res);
    setEnviando(false);
  };

  return (
    <Panel>
      <div className="flex items-center gap-2 mb-1">
        <Flame size={16} color={C.train} />
        <span className="display text-sm" style={{ color: C.muted }}>INVITÁ Y GANÁ DÍAS GRATIS</span>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>
        Compartí tu código. Cuando alguien lo use, ambos suman {BONUS_DIAS_REFERIDO} días extra de Premium.
      </p>

      <div className="flex items-center justify-between rounded px-3 py-2 mb-2" style={{ background: C.panelAlt }}>
        <span className="mono text-lg" style={{ color: C.food }}>{referido.miCodigo}</span>
        <button onClick={copiar} className="text-xs mono px-2 py-1 rounded" style={{ background: C.border, color: C.text }}>
          {copiado ? "Copiado ✓" : "Copiar"}
        </button>
      </div>

      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center w-full py-2 rounded font-medium mb-3"
        style={{ background: C.food, color: C.bg }}
      >
        Compartir por WhatsApp
      </a>

      {referido.codigoUsado ? (
        <p className="text-xs" style={{ color: C.food }}>Ya usaste un código de invitación ✓</p>
      ) : (
        <div className="flex gap-2">
          <input
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
            placeholder="¿Alguien te invitó? Ingresá su código"
            className="flex-1 rounded px-3 py-2 text-xs mono"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <button onClick={canjear} disabled={enviando} className="px-3 py-2 rounded text-xs font-medium" style={{ background: C.train, color: C.panel, opacity: enviando ? 0.5 : 1 }}>
            Canjear
          </button>
        </div>
      )}
      {estado && <p className="text-xs mt-2" style={{ color: estado.ok ? C.food : C.danger }}>{estado.mensaje}</p>}
    </Panel>
  );
}

function PanelHeladera({ restanteKcal, onAgregarComida, accesoPremium, onBloqueado }) {
  const [seleccion, setSeleccion] = useState([]);
  const [agregado, setAgregado] = useState(null);
  const [misMenus, setMisMenus] = useState(null);
  const [creando, setCreando] = useState(false);
  const [nuevoMenu, setNuevoMenu] = useState({ nombre: "", ingredientes: [], kcal: "", prot: "", carb: "", grasa: "" });

  const toggle = (item) => {
    setSeleccion((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  useEffect(() => {
    if (!accesoPremium) return;
    (async () => {
      const guardados = await safeGet("misMenus");
      setMisMenus(guardados || []);
    })();
  }, [accesoPremium]);

  if (!accesoPremium) {
    return (
      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>EN LA HELADERA TENGO...</div>
        <Locked titulo="Recetas armadas con lo que tenés en tu heladera" onBloqueado={onBloqueado} />
      </Panel>
    );
  }

  const { completas, casiCompletas } = sugerirDesdeHeladera(seleccion, misMenus || []);

  const agregar = (r) => {
    onAgregarComida({ nombre: r.nombre, kcal: r.kcal, prot: r.prot, carb: r.carb, grasa: r.grasa });
    setAgregado(r.nombre);
    setTimeout(() => setAgregado(null), 2000);
  };

  const toggleIngredienteNuevo = (item) => {
    setNuevoMenu((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.includes(item) ? prev.ingredientes.filter((x) => x !== item) : [...prev.ingredientes, item],
    }));
  };

  const guardarMenu = async () => {
    if (!nuevoMenu.nombre.trim() || nuevoMenu.ingredientes.length === 0 || !nuevoMenu.kcal) return;
    const menu = {
      nombre: nuevoMenu.nombre.trim(),
      ingredientes: nuevoMenu.ingredientes,
      kcal: Number(nuevoMenu.kcal) || 0,
      prot: Number(nuevoMenu.prot) || 0,
      carb: Number(nuevoMenu.carb) || 0,
      grasa: Number(nuevoMenu.grasa) || 0,
    };
    const nuevaLista = [...(misMenus || []), menu];
    setMisMenus(nuevaLista);
    await safeSet("misMenus", nuevaLista);
    setNuevoMenu({ nombre: "", ingredientes: [], kcal: "", prot: "", carb: "", grasa: "" });
    setCreando(false);
  };

  const borrarMenu = async (nombre) => {
    const nuevaLista = (misMenus || []).filter((m) => m.nombre !== nombre);
    setMisMenus(nuevaLista);
    await safeSet("misMenus", nuevaLista);
  };

  return (
    <Panel style={{ borderColor: C.food }}>
      <div className="flex items-center gap-2 mb-1">
        <Apple size={16} color={C.food} />
        <span className="display text-sm" style={{ color: C.food }}>EN LA HELADERA TENGO...</span>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>Marcá lo que tenés y te digo qué podés preparar sin pasarte de tus calorías de hoy.</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {HELADERA_ITEMS.map((item) => {
          const activo = seleccion.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: activo ? C.food : C.panelAlt,
                color: activo ? C.bg : C.muted,
                border: `1px solid ${activo ? C.food : C.border}`,
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      {seleccion.length === 0 && (
        <p className="text-xs" style={{ color: C.muted }}>Elegí al menos un ingrediente para ver sugerencias.</p>
      )}

      {completas.length > 0 && (
        <div className="flex flex-col gap-2">
          {completas.map((r) => {
            const cabe = r.kcal <= restanteKcal;
            return (
              <div key={r.nombre} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{r.nombre}</span>
                  <span className="text-xs mono" style={{ color: cabe ? C.food : C.danger }}>{r.kcal} kcal</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px]" style={{ color: cabe ? C.muted : C.danger }}>
                    {cabe ? "Entra en tus calorías de hoy" : "Se pasa de lo que te queda hoy"}
                  </span>
                  <button onClick={() => agregar(r)} className="text-[10px] mono px-2 py-1 rounded" style={{ background: C.food, color: C.bg }}>
                    {agregado === r.nombre ? "Agregado ✓" : "Agregar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completas.length === 0 && casiCompletas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: C.muted }}>No llega a ninguna receta completa, pero estas son las que mejor podés armar con lo que tenés:</p>
          {casiCompletas.map((r) => (
            <div key={r.nombre} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{r.nombre}</span>
                <span className="text-[10px] mono" style={{ color: C.muted }}>{r.tenes.length}/{r.ingredientes.length}</span>
              </div>
              <div className="text-[10px]" style={{ color: C.food }}>Te falta: {r.falta.join(", ")}</div>
            </div>
          ))}
        </div>
      )}

      {seleccion.length > 0 && completas.length === 0 && casiCompletas.length === 0 && (
        <p className="text-xs" style={{ color: C.muted }}>No encontré una receta con esa combinación. Probá agregar algún ingrediente más.</p>
      )}

      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: C.muted }}>MIS MENÚS</span>
          <button onClick={() => setCreando(!creando)} className="text-xs mono" style={{ color: C.food }}>
            {creando ? "Cancelar" : "+ Crear menú"}
          </button>
        </div>

        {misMenus && misMenus.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {misMenus.map((m) => (
              <div key={m.nombre} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
                <div>
                  <div className="text-sm">{m.nombre}</div>
                  <div className="text-[10px]" style={{ color: C.muted }}>{m.ingredientes.join(", ")} · {m.kcal} kcal</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => agregar(m)} className="text-[10px] mono px-2 py-1 rounded" style={{ background: C.food, color: C.bg }}>
                    Agregar
                  </button>
                  <button onClick={() => borrarMenu(m.nombre)}><X size={14} color={C.muted} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {creando && (
          <div className="rounded-md p-3 flex flex-col gap-2" style={{ background: C.panelAlt }}>
            <input
              value={nuevoMenu.nombre}
              onChange={(e) => setNuevoMenu({ ...nuevoMenu, nombre: e.target.value })}
              placeholder="Nombre del menú"
              className="rounded px-2 py-2 text-xs"
              style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
            />
            <div className="flex flex-wrap gap-1">
              {HELADERA_ITEMS.map((item) => {
                const activo = nuevoMenu.ingredientes.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleIngredienteNuevo(item)}
                    className="px-2 py-1 rounded-full text-[10px]"
                    style={{
                      background: activo ? C.food : C.panel,
                      color: activo ? C.bg : C.muted,
                      border: `1px solid ${activo ? C.food : C.border}`,
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              {["kcal", "prot", "carb", "grasa"].map((campo) => (
                <input
                  key={campo}
                  type="number"
                  placeholder={campo}
                  value={nuevoMenu[campo]}
                  onChange={(e) => setNuevoMenu({ ...nuevoMenu, [campo]: e.target.value })}
                  className="rounded px-2 py-2 text-xs w-full mono"
                  style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
                />
              ))}
            </div>
            <button
              onClick={guardarMenu}
              disabled={!nuevoMenu.nombre.trim() || nuevoMenu.ingredientes.length === 0 || !nuevoMenu.kcal}
              className="py-2 rounded text-sm font-medium disabled:opacity-40"
              style={{ background: C.food, color: C.bg }}
            >
              Guardar menú
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}

function FilaItem({ texto, sub, onQuitar }) {
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

function reproducirBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // el navegador puede bloquear audio sin interacción previa; no rompe el resto del timer
  }
}

const DURACIONES_DESCANSO = [15, 30, 45, 60, 90, 120];

// Repeticiones sugeridas por ronda: arranca más alto en la primera serie y
// baja un poco en las siguientes (fatiga normal), sin bajar de un mínimo.
function sugerirRepeticiones(nivel) {
  if (nivel <= 2) return 12;
  if (nivel <= 4) return 10;
  if (nivel <= 6) return 8;
  if (nivel <= 8) return 6;
  return 5;
}

function objetivoRepsRonda(nivel, ronda) {
  const base = sugerirRepeticiones(nivel);
  return Math.max(3, base - (ronda - 1) * 2);
}

function sugerirDescanso(nivel) {
  if (nivel <= 2) return { segundos: 15, texto: "Es un ejercicio de base, más de resistencia: con 15 segundos de descanso alcanza para seguir con buen ritmo." };
  if (nivel <= 4) return { segundos: 30, texto: "Nivel intermedio: 30 segundos de descanso son un buen equilibrio entre esfuerzo y recuperación." };
  if (nivel <= 6) return { segundos: 45, texto: "Ejercicio más exigente: dale 45 segundos para llegar fresco a la próxima serie." };
  if (nivel <= 8) return { segundos: 60, texto: "Movimiento avanzado: descansá 60 segundos para mantener la técnica en la próxima serie." };
  return { segundos: 90, texto: "Es un movimiento de fuerza máxima o de habilidad avanzada: descansá 90 segundos para recuperar bien antes de ir de nuevo." };
}

function PanelDescanso({ total, restante, corriendo, onElegirDuracion, onIniciar, onPausarReanudar, onReiniciar }) {
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
      <p className="text-[10px] mt-2" style={{ color: C.muted }}>Se inicia solo cada vez que registrás una serie más abajo.</p>
    </Panel>
  );
}

function CuentaRegresiva({ onTerminar }) {
  const [n, setN] = useState(3);

  useEffect(() => {
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
function VistaEntrenamiento({ progresion, progresoSeries, setNivel, registro, onAgregar, onQuitar, accesoPremium, onBloqueado, trackInicial }) {
  const [trackSel, setTrackSel] = useState(trackInicial || "empuje");
  const [series, setSeries] = useState(3);
  const [tipsAbiertos, setTipsAbiertos] = useState({});
  const [sesionActiva, setSesionActiva] = useState(false);
  const [contando, setContando] = useState(false);
  const nivelActual = progresion[trackSel];
  const ejercicioActual = TRACKS[trackSel].ejercicios[nivelActual - 1];

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

  useEffect(() => {
    setModoTiempo(Boolean(ejercicioActual.porTiempo));
    setSegundosEj(0);
    setCronoCorriendo(false);
    setContadorReps(0);
    setSerieActual(1);
    setAutoCorriendo(false);
  }, [ejercicioActual.nombre]);

  useEffect(() => {
    if (!autoCorriendo) return;
    const id = setInterval(() => {
      setContadorReps((r) => r + 1);
      try { navigator.vibrate?.(15); } catch {}
    }, cadenciaSeg * 1000);
    return () => clearInterval(id);
  }, [autoCorriendo, cadenciaSeg]);

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
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [corriendo]);

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
  };
  const pausarReanudar = () => setCorriendo((c) => !c);
  const reiniciarDescanso = () => {
    setCorriendo(false);
    setDescansoRestante(descansoTotal);
  };

  return (
    <div>
      {contando && (
        <CuentaRegresiva
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
            Elegí el grupo muscular de hoy y arrancá con una cuenta regresiva para prepararte.
          </p>
          <button
            onClick={() => setContando(true)}
            className="w-full py-3 rounded-md font-bold text-lg"
            style={{ background: C.train, color: C.panel }}
          >
            INICIAR ENTRENAMIENTO
          </button>
        </Panel>
      )}

      {sesionActiva && (
      <Panel style={{ borderColor: C.train }}>
        <div className="flex items-center justify-between mb-3">
          <span className="display text-sm" style={{ color: C.train }}>ENTRENAMIENTO EN CURSO</span>
          <button onClick={() => setSesionActiva(false)} className="text-xs mono underline" style={{ color: C.muted }}>
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
                  : `Ronda ${serieActual}: apuntá a ${objetivoRepsRonda(nivelActual, serieActual)} repeticiones`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded px-3 py-2 mb-3 mt-2" style={{ background: C.panelAlt, border: `1px dashed ${C.food}` }}>
          <Lightbulb size={14} color={C.food} className="flex-shrink-0 mt-0.5" />
          <span className="text-[11px]" style={{ color: C.text }}>{sugerirDescanso(nivelActual).texto}</span>
        </div>

        {historialEj !== null && (
          <div className="mb-3">
            {historialEj.length === 0 ? (
              <p className="text-xs" style={{ color: C.muted }}>Todavía no tenés marcas en este ejercicio. ¡Esta va a ser tu primera! 💪</p>
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
            Serie <span style={{ color: C.train }}>{serieActual}</span> de{" "}
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

        {!modoTiempo ? (
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
                  Suma sola a ese ritmo, no hace falta tocar la pantalla en cada repetición. Apretá Iniciar y arrancá a entrenar.
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
                onClick={() => {
                  if (contadorReps <= 0) return;
                  onAgregar({ track: trackSel, ejercicio: ejercicioActual.nombre, series: 1, reps: contadorReps });
                  setContadorReps(0);
                  setSerieActual((s) => s + 1);
                  setAutoCorriendo(false);
                  iniciarDescanso();
                }}
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
            <span className="text-xs mono" style={{ color: C.muted }}>Nivel {progresion[key]}/{track.ejercicios.length}</span>
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
                  <GuiaTecnica figuras={ej.figura} size={44} color={C.muted} />
                  <div>
                    <div className="text-xs font-medium mb-0.5">{i + 1}. {ej.nombre}</div>
                    <div className="text-[11px]" style={{ color: C.muted }}>{ej.tip}</div>
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

function PanelComidasDia({ perfil }) {
  const [plan, setPlan] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    (async () => {
      const guardado = await safeGet("planComidas");
      setPlan(guardado || COMIDAS_DEL_DIA.map((m) => ({ ...m })));
    })();
  }, []);

  if (!plan) return null;

  const totalPct = plan.reduce((s, m) => s + Number(m.pct || 0), 0);

  const actualizar = (i, campo, valor) => {
    const nuevo = plan.map((m, idx) => (idx === i ? { ...m, [campo]: campo === "pct" ? Number(valor) / 100 : valor } : m));
    setPlan(nuevo);
  };

  const agregarComidaPlan = () => setPlan([...plan, { nombre: "Nueva comida", pct: 0 }]);
  const quitarComidaPlan = (i) => setPlan(plan.filter((_, idx) => idx !== i));

  const guardar = async () => {
    await safeSet("planComidas", plan);
    setEditando(false);
  };

  const restablecer = async () => {
    const sugerido = COMIDAS_DEL_DIA.map((m) => ({ ...m }));
    setPlan(sugerido);
    await safeSet("planComidas", sugerido);
  };

  return (
    <Panel>
      <div className="flex items-center justify-between mb-1">
        <div className="display text-sm" style={{ color: C.muted }}>CUÁNTO DEBÉS COMER POR DÍA</div>
        <button onClick={() => setEditando(!editando)} className="text-xs mono" style={{ color: C.food }}>
          {editando ? "Listo" : "Editar"}
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>
        Objetivo diario: {perfil.kcal} kcal · P{perfil.prot}g · C{perfil.carb}g · G{perfil.grasa}g. Esto es una sugerencia, repartila como te quede más cómoda.
      </p>

      {!editando ? (
        <div className="flex flex-col gap-2">
          {plan.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
              <span className="text-sm">{m.nombre}</span>
              <span className="text-xs mono" style={{ color: C.muted }}>
                {Math.round(perfil.kcal * m.pct)} kcal · P{Math.round(perfil.prot * m.pct)}g
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {plan.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded px-2 py-2" style={{ background: C.panelAlt }}>
              <input
                value={m.nombre}
                onChange={(e) => actualizar(i, "nombre", e.target.value)}
                className="flex-1 rounded px-2 py-1 text-xs"
                style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
              />
              <input
                type="number"
                value={Math.round(m.pct * 100)}
                onChange={(e) => actualizar(i, "pct", e.target.value)}
                className="w-14 rounded px-2 py-1 text-xs mono text-right"
                style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
              />
              <span className="text-xs" style={{ color: C.muted }}>%</span>
              <button onClick={() => quitarComidaPlan(i)}><X size={14} color={C.muted} /></button>
            </div>
          ))}
          <div className="text-[10px]" style={{ color: totalPct === 1 ? C.muted : C.danger }}>
            Total: {Math.round(totalPct * 100)}%{totalPct !== 1 ? " (debería sumar 100%)" : ""}
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={agregarComidaPlan} className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs" style={{ background: C.panel, color: C.muted, border: `1px solid ${C.border}` }}>
              <Plus size={12} /> Agregar comida
            </button>
            <button onClick={restablecer} className="flex-1 py-2 rounded text-xs" style={{ background: C.panel, color: C.muted, border: `1px solid ${C.border}` }}>
              Usar sugerencia
            </button>
          </div>
          <button onClick={guardar} className="w-full py-2 rounded font-medium mt-1" style={{ background: C.food, color: C.bg }}>
            Guardar
          </button>
        </div>
      )}
    </Panel>
  );
}

// ---------- NUTRICION ----------
function ordenarRecetasPorObjetivo(objetivo) {
  const copia = [...RECETAS];
  if (objetivo === "bajar") {
    // Más saciedad por caloría: prioriza proteína alta relativa a las kcal.
    return copia.sort((a, b) => b.prot / b.kcal - a.prot / a.kcal);
  }
  if (objetivo === "subir") {
    // Más densidad calórica primero, para sumar energía más fácil.
    return copia.sort((a, b) => b.kcal - a.kcal);
  }
  // Mantener: prioriza proteína en términos absolutos, buen default general.
  return copia.sort((a, b) => b.prot - a.prot);
}

function PanelRecetas({ onAgregar, objetivo }) {
  const [abierta, setAbierta] = useState(null);
  const [agregada, setAgregada] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("todas");
  const ordenadas = ordenarRecetasPorObjetivo(objetivo);
  const recetas = tipoFiltro === "todas" ? ordenadas : ordenadas.filter((r) => r.tipo === tipoFiltro);

  const agregar = (r) => {
    onAgregar({ nombre: r.nombre, kcal: r.kcal, prot: r.prot, carb: r.carb, grasa: r.grasa });
    setAgregada(r.nombre);
    setTimeout(() => setAgregada(null), 2000);
  };

  return (
    <Panel>
      <div className="flex items-center gap-2 mb-1">
        <Apple size={16} color={C.food} />
        <span className="display text-sm" style={{ color: C.food }}>RECETAS SALUDABLES</span>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>
        Ideas simples y rápidas, ordenadas para tu objetivo de {NOMBRE_OBJETIVO[objetivo] || NOMBRE_OBJETIVO.mantener}. Tocá una para ver los ingredientes y cómo prepararla.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setTipoFiltro("todas")}
          className="px-3 py-1 rounded-full text-xs"
          style={{
            background: tipoFiltro === "todas" ? C.food : C.panelAlt,
            color: tipoFiltro === "todas" ? C.bg : C.muted,
            border: `1px solid ${tipoFiltro === "todas" ? C.food : C.border}`,
          }}
        >
          Todas
        </button>
        {TIPOS_COMIDA.map((t) => (
          <button
            key={t.id}
            onClick={() => setTipoFiltro(t.id)}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: tipoFiltro === t.id ? C.food : C.panelAlt,
              color: tipoFiltro === t.id ? C.bg : C.muted,
              border: `1px solid ${tipoFiltro === t.id ? C.food : C.border}`,
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {recetas.map((r) => {
          const abiertaAhora = abierta === r.nombre;
          const tipoInfo = TIPOS_COMIDA.find((t) => t.id === r.tipo);
          return (
            <div key={r.nombre} className="rounded" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
              <button
                onClick={() => setAbierta(abiertaAhora ? null : r.nombre)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left"
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 36, height: 36, borderRadius: 8, background: C.panel, fontSize: 18 }}
                >
                  {tipoInfo?.emoji || "🍽️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{r.nombre}</div>
                  <div className="text-[9px]" style={{ color: C.muted }}>{tipoInfo?.label || "Comida"}</div>
                </div>
                <span className="text-xs mono flex-shrink-0" style={{ color: C.food }}>{r.kcal} kcal</span>
              </button>
              {abiertaAhora && (
                <div className="px-3 pb-3">
                  <div className="text-[10px] mb-1" style={{ color: C.muted }}>Ingredientes: {r.ingredientes.join(", ")}</div>
                  <div className="text-[11px] mb-2" style={{ color: C.text }}>{r.preparacion}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] mono" style={{ color: C.muted }}>P{r.prot}g · C{r.carb}g · G{r.grasa}g</span>
                    <button
                      onClick={() => agregar(r)}
                      className="text-[10px] mono px-2 py-1 rounded"
                      style={{ background: C.food, color: C.bg }}
                    >
                      {agregada === r.nombre ? "Agregado ✓" : "Agregar a mis comidas"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function VistaNutricion({ totales, perfil, registro, onAgregar, onQuitar, accesoPremium, onBloqueado }) {
  const [custom, setCustom] = useState({ nombre: "", kcal: "", prot: "", carb: "", grasa: "" });

  const barra = (valor, objetivo, color) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mono mb-1" style={{ color: C.muted }}>
        <span>{Math.round(valor)}g</span>
        <span>{objetivo}g</span>
      </div>
      <div style={{ height: 6, background: C.panelAlt, borderRadius: 3 }}>
        <div style={{ width: `${Math.min((valor / objetivo) * 100, 100)}%`, height: 6, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );

  const rec = recomendarComida(totales, perfil);

  return (
    <div>
      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>MACROS DE HOY</div>
        <div className="text-xs mb-1" style={{ color: C.muted }}>Proteína</div>
        {barra(totales.prot, perfil.prot, C.food)}
        <div className="text-xs mb-1" style={{ color: C.muted }}>Carbohidratos</div>
        {barra(totales.carb, perfil.carb, C.train)}
        <div className="text-xs mb-1" style={{ color: C.muted }}>Grasas</div>
        {barra(totales.grasa, perfil.grasa, "#C9A24B")}
      </Panel>

      <Panel style={{ borderColor: accesoPremium ? C.food : C.border }}>
        <div className="flex items-center gap-2 mb-2">
          <Apple size={16} color={C.food} />
          <span className="display text-sm" style={{ color: C.food }}>QUÉ COMER AHORA</span>
        </div>
        {accesoPremium ? (
          <>
            <p className="text-sm mb-2">{rec.mensaje}</p>
            {rec.sugerencias.length > 0 && (
              <div className="flex flex-col gap-2">
                {rec.sugerencias.map((a) => (
                  <div key={a.nombre} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
                    <span className="text-sm">{a.nombre}</span>
                    <span className="text-xs mono" style={{ color: C.food }}>{a.kcal} kcal · P{a.prot}g</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <Locked titulo="Recomendación personalizada según tus macros" onBloqueado={onBloqueado} />
        )}
      </Panel>

      <PanelRecetas onAgregar={onAgregar} objetivo={perfil.objetivo} />

      <PanelComidasDia perfil={perfil} />

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>AGREGAR RÁPIDO</div>
        <div className="grid grid-cols-2 gap-2">
          {ALIMENTOS.map((a) => (
            <button
              key={a.nombre}
              onClick={() => onAgregar(a)}
              className="text-left p-2 rounded"
              style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
            >
              <div className="text-xs">{a.nombre}</div>
              <div className="text-[10px] mono" style={{ color: C.food }}>{a.kcal} kcal</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>CARGAR ALIMENTO PERSONALIZADO</div>
        {accesoPremium ? (
          <div className="flex flex-col gap-2">
            <input placeholder="Nombre" value={custom.nombre} onChange={(e) => setCustom({ ...custom, nombre: e.target.value })} className="rounded px-2 py-2 text-sm" style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }} />
            <div className="flex gap-2">
              {["kcal", "prot", "carb", "grasa"].map((campo) => (
                <input
                  key={campo}
                  type="number"
                  placeholder={campo}
                  value={custom[campo]}
                  onChange={(e) => setCustom({ ...custom, [campo]: e.target.value })}
                  className="rounded px-2 py-2 text-sm w-full mono"
                  style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
                />
              ))}
            </div>
            <button
              disabled={!custom.nombre || !custom.kcal}
              onClick={() => {
                onAgregar({
                  nombre: custom.nombre,
                  kcal: Number(custom.kcal) || 0,
                  prot: Number(custom.prot) || 0,
                  carb: Number(custom.carb) || 0,
                  grasa: Number(custom.grasa) || 0,
                });
                setCustom({ nombre: "", kcal: "", prot: "", carb: "", grasa: "" });
              }}
              className="flex items-center justify-center gap-1 py-2 rounded font-medium disabled:opacity-40"
              style={{ background: C.food, color: C.bg }}
            >
              <Plus size={16} /> Agregar
            </button>
          </div>
        ) : (
          <Locked titulo="Alimentos personalizados ilimitados" onBloqueado={onBloqueado} />
        )}
      </Panel>

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>COMIDAS CARGADAS</div>
        {registro.comidas.length === 0 ? (
          <p className="text-sm" style={{ color: C.muted }}>Sin comidas todavía.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registro.comidas.map((c) => (
              <FilaItem key={c.id} texto={c.nombre} sub={`${c.kcal} kcal · P${c.prot} C${c.carb} G${c.grasa}`} onQuitar={() => onQuitar(c.id)} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------- PROGRESO ----------
// ---------- CONSEJOS ----------
function VistaConsejos({ perfil }) {
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
        <p className="text-[10px] mb-3" style={{ color: C.muted }}>Tocá un grupo para ver el consejo de cada ejercicio.</p>
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
                      <GuiaTecnica figuras={ej.figura} size={44} color={C.muted} />
                      <div>
                        <div className="text-xs font-medium mb-0.5">{i + 1}. {ej.nombre}</div>
                        <div className="text-[11px]" style={{ color: C.muted }}>{ej.tip}</div>
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

function VistaProgreso({ semana, perfil, progresion, accesoPremium, onBloqueado, onEditarObjetivo }) {
  if (!accesoPremium) {
    return (
      <Panel>
        <Locked titulo="Racha, gráfico semanal, peso corporal y logros" onBloqueado={onBloqueado} />
      </Panel>
    );
  }
  if (!semana) {
    return <p className="text-sm" style={{ color: C.muted }}>Cargando semana...</p>;
  }
  const diasEntrenados = semana.filter((d) => d.entreno).length;
  let racha = 0;
  for (let i = semana.length - 1; i >= 0; i--) {
    if (semana[i].entreno) racha++;
    else break;
  }
  const nivelMaximo = Math.max(...Object.values(progresion || {}));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Panel style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-2">
            <Flame size={16} color={C.train} />
            <span className="text-xs" style={{ color: C.muted }}>Racha actual</span>
          </div>
          <div className="display text-2xl mt-1">{racha} día{racha !== 1 ? "s" : ""}</div>
        </Panel>
        <Panel style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-2">
            <Dumbbell size={16} color={C.train} />
            <span className="text-xs" style={{ color: C.muted }}>Días entrenados (7d)</span>
          </div>
          <div className="display text-2xl mt-1">{diasEntrenados}/7</div>
        </Panel>
      </div>

      <PanelLogros racha={racha} diasEntrenados={diasEntrenados} nivelMaximo={nivelMaximo} />

      <PanelCalendario />

      <PanelPeso objetivo={perfil.objetivo} onEditarObjetivo={onEditarObjetivo} />

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>CALORÍAS ÚLTIMOS 7 DÍAS</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={semana}>
            <XAxis dataKey="dia" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 12 }} labelStyle={{ color: C.text }} />
            <ReferenceLine y={perfil.kcal} stroke={C.food} strokeDasharray="4 4" />
            <Bar dataKey="kcal" fill={C.train} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>ENTRENO POR DÍA</div>
        <div className="flex justify-between">
          {semana.map((d) => (
            <div key={d.fecha} className="flex flex-col items-center gap-1">
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: d.entreno ? C.train : C.panelAlt,
                  border: `1px solid ${d.entreno ? C.train : C.border}`,
                }}
                className="flex items-center justify-center"
              >
                {d.entreno && <Check size={12} color={C.panel} />}
              </div>
              <span className="text-[9px]" style={{ color: C.muted }}>{d.dia.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const LOGROS_DEF = [
  { id: "racha3", nombre: "Racha de 3 días", desc: "Entrenaste 3 días seguidos", cumple: (ctx) => ctx.racha >= 3 },
  { id: "semana", nombre: "Semana perfecta", desc: "Entrenaste los 7 días de la semana", cumple: (ctx) => ctx.diasEntrenados >= 7 },
  { id: "nivel3", nombre: "Salió de principiante", desc: "Llegaste al nivel 3 en algún grupo", cumple: (ctx) => ctx.nivelMaximo >= 3 },
  { id: "nivel5", nombre: "Nivel avanzado", desc: "Llegaste al nivel 5 en algún grupo", cumple: (ctx) => ctx.nivelMaximo >= 5 },
];

function PanelLogros({ racha, diasEntrenados, nivelMaximo }) {
  const ctx = { racha, diasEntrenados, nivelMaximo };
  return (
    <Panel>
      <div className="display text-sm mb-3" style={{ color: C.muted }}>LOGROS</div>
      <div className="grid grid-cols-2 gap-2">
        {LOGROS_DEF.map((l) => {
          const conseguido = l.cumple(ctx);
          return (
            <div
              key={l.id}
              className="rounded-md p-2 flex flex-col items-center text-center gap-1"
              style={{ background: conseguido ? C.foodDim : C.panelAlt, border: `1px solid ${conseguido ? C.food : C.border}`, opacity: conseguido ? 1 : 0.5 }}
            >
              <Crown size={16} color={conseguido ? C.food : C.muted} />
              <span className="text-[11px] font-medium">{l.nombre}</span>
              <span className="text-[9px]" style={{ color: C.muted }}>{l.desc}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function PanelCalendario() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [diasConDatos, setDiasConDatos] = useState(null);
  const [diaSel, setDiaSel] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const monthKey = `${cursor.y}-${pad2(cursor.m + 1)}`;

  useEffect(() => {
    (async () => {
      setDiasConDatos(null);
      setDiaSel(null);
      setDetalle(null);
      const dias = await listRegistroKeysForMonth(monthKey);
      setDiasConDatos(dias);
    })();
  }, [monthKey]);

  const verDia = async (fechaStr) => {
    setDiaSel(fechaStr);
    setCargandoDetalle(true);
    const data = await safeGet(`registro:${fechaStr}`);
    setDetalle(data || { entrenamiento: [], comidas: [] });
    setCargandoDetalle(false);
  };

  const cambiarMes = (delta) => {
    let m = cursor.m + delta;
    let y = cursor.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCursor({ y, m });
  };

  const diasEnMes = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const primerDiaSemana = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // 0 = lunes
  const celdas = [...Array(primerDiaSemana).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];
  const hoyStr = hoy();

  return (
    <Panel>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => cambiarMes(-1)} className="px-3 py-1 rounded" style={{ background: C.panelAlt, color: C.muted }}>‹</button>
        <span className="display text-sm" style={{ color: C.muted }}>{NOMBRES_MES[cursor.m].toUpperCase()} {cursor.y}</span>
        <button onClick={() => cambiarMes(1)} className="px-3 py-1 rounded" style={{ background: C.panelAlt, color: C.muted }}>›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[9px]" style={{ color: C.muted }}>{d}</div>
        ))}
      </div>

      {diasConDatos === null ? (
        <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((dia, i) => {
            if (!dia) return <div key={i} />;
            const fechaStr = `${monthKey}-${pad2(dia)}`;
            const tieneDatos = diasConDatos.has(fechaStr);
            const esHoy = fechaStr === hoyStr;
            const seleccionado = diaSel === fechaStr;
            return (
              <button
                key={i}
                onClick={() => tieneDatos && verDia(fechaStr)}
                disabled={!tieneDatos}
                className="aspect-square rounded flex flex-col items-center justify-center text-[10px]"
                style={{
                  background: seleccionado ? C.train : C.panelAlt,
                  border: `1px solid ${esHoy ? C.train : C.border}`,
                  opacity: tieneDatos ? 1 : 0.35,
                  color: seleccionado ? C.panel : C.text,
                }}
              >
                {dia}
                {tieneDatos && <div style={{ width: 4, height: 4, borderRadius: 2, background: seleccionado ? C.panel : C.food, marginTop: 2 }} />}
              </button>
            );
          })}
        </div>
      )}

      {diaSel && (
        <div className="mt-3 rounded-md p-3" style={{ background: C.panelAlt }}>
          <div className="text-xs mono mb-2" style={{ color: C.food }}>{fechaLegible(diaSel)}</div>
          {cargandoDetalle ? (
            <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
          ) : (
            <>
              {detalle.entrenamiento.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] mb-1" style={{ color: C.muted }}>Entrenamiento</div>
                  {detalle.entrenamiento.map((e) => (
                    <div key={e.id} className="text-xs">{e.ejercicio} — {e.tipo === "tiempo" ? `${e.segundos}s sostenidos` : `${e.series}x${e.reps}`}</div>
                  ))}
                </div>
              )}
              {detalle.comidas.length > 0 && (
                <div>
                  <div className="text-[10px] mb-1" style={{ color: C.muted }}>Comidas</div>
                  {detalle.comidas.map((c) => (
                    <div key={c.id} className="text-xs">{c.nombre} — {c.kcal} kcal</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Panel>
  );
}

function PanelPeso({ objetivo, onEditarObjetivo }) {
  const [historial, setHistorial] = useState(null);
  const [pesoHoy, setPesoHoy] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [metaPeso, setMetaPeso] = useState(null);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaInput, setMetaInput] = useState("");

  useEffect(() => {
    (async () => {
      const h = (await safeGet("peso")) || [];
      setHistorial(h);
      const m = await safeGet("metaPeso");
      setMetaPeso(m);
      if (m) setMetaInput(String(m.kg));
    })();
  }, []);

  const registrar = async () => {
    const kg = Number(pesoHoy);
    if (!kg || guardando) return;
    setGuardando(true);
    const otros = (historial || []).filter((p) => p.fecha !== hoy());
    const nuevo = [...otros, { fecha: hoy(), kg }].sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
    setHistorial(nuevo);
    await safeSet("peso", nuevo);
    setPesoHoy("");
    setGuardando(false);
  };

  const guardarMeta = async () => {
    const kg = Number(metaInput);
    if (!kg) return;
    const nueva = { kg };
    setMetaPeso(nueva);
    await safeSet("metaPeso", nueva);
    setEditandoMeta(false);
  };

  if (historial === null) return null;

  const ultimos = historial.slice(-10).map((p) => ({ ...p, dia: fechaLegible(p.fecha).split(" ")[0] }));
  const diferencia = historial.length >= 2 ? historial[historial.length - 1].kg - historial[0].kg : 0;
  const ultimoPeso = historial.length > 0 ? historial[historial.length - 1].kg : null;

  let mensajeMeta = null;
  let yaLlegoMeta = false;
  if (metaPeso && ultimoPeso !== null) {
    const faltante = ultimoPeso - metaPeso.kg;
    yaLlegoMeta = objetivo === "subir" ? faltante >= 0 : objetivo === "bajar" ? faltante <= 0 : Math.abs(faltante) < 0.5;
    if (yaLlegoMeta) {
      mensajeMeta = "¡Llegaste a tu meta de peso! 🎉";
    } else {
      mensajeMeta = `Te ${Math.abs(faltante) === 1 ? "falta" : "faltan"} ${Math.abs(faltante).toFixed(1)} kg para llegar a tu meta de ${metaPeso.kg} kg.`;
    }
  }

  return (
    <Panel>
      <div className="flex items-center justify-between mb-1">
        <span className="display text-sm" style={{ color: C.muted }}>PESO CORPORAL</span>
        {historial.length >= 2 && (
          <span className="text-xs mono" style={{ color: diferencia <= 0 ? C.food : C.train }}>
            {diferencia > 0 ? "+" : ""}{diferencia.toFixed(1)} kg desde el registro
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        {metaPeso && !editandoMeta ? (
          <button onClick={() => setEditandoMeta(true)} className="text-xs mono" style={{ color: C.food }}>
            Meta: {metaPeso.kg} kg (editar)
          </button>
        ) : !editandoMeta ? (
          <button onClick={() => setEditandoMeta(true)} className="text-xs mono underline" style={{ color: C.muted }}>
            Definir meta de peso
          </button>
        ) : null}
      </div>

      {editandoMeta && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            step="0.1"
            placeholder="Meta (kg)"
            value={metaInput}
            onChange={(e) => setMetaInput(e.target.value)}
            className="flex-1 rounded px-3 py-2 text-sm mono"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <button onClick={guardarMeta} className="px-4 py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg }}>
            Guardar
          </button>
        </div>
      )}

      {mensajeMeta && (
        <p className="text-xs mb-2" style={{ color: C.food }}>{mensajeMeta}</p>
      )}
      {yaLlegoMeta && (
        <button
          onClick={onEditarObjetivo}
          className="w-full flex items-center justify-center gap-1 py-2 rounded text-xs font-medium mb-3"
          style={{ background: C.foodDim, color: C.food, border: `1px solid ${C.food}` }}
        >
          <Crown size={12} /> ¿Y ahora? Cambiar mi objetivo
        </button>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          step="0.1"
          placeholder="Peso de hoy (kg)"
          value={pesoHoy}
          onChange={(e) => setPesoHoy(e.target.value)}
          className="flex-1 rounded px-3 py-2 text-sm mono"
          style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
        />
        <button onClick={registrar} disabled={guardando} className="px-4 py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg, opacity: guardando ? 0.5 : 1 }}>
          Registrar
        </button>
      </div>
      {ultimos.length < 2 ? (
        <p className="text-xs" style={{ color: C.muted }}>Registrá tu peso un par de veces para ver la evolución.</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={ultimos}>
            <XAxis dataKey="dia" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[
                (dataMin) => Math.min(dataMin - 1, metaPeso ? metaPeso.kg - 1 : dataMin - 1),
                (dataMax) => Math.max(dataMax + 1, metaPeso ? metaPeso.kg + 1 : dataMax + 1),
              ]}
            />
            <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 12 }} labelStyle={{ color: C.text }} />
            {metaPeso && <ReferenceLine y={metaPeso.kg} stroke={C.food} strokeDasharray="4 4" label={{ value: "Meta", fill: C.food, fontSize: 10, position: "insideTopRight" }} />}
            <Line type="monotone" dataKey="kg" stroke={C.train} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

const SINONIMOS_TRACK = {
  empuje: ["empuje", "pecho", "flexion", "flexiones", "triceps", "hombro", "hombros", "fondos"],
  traccion: ["traccion", "tracción", "espalda", "dominada", "dominadas", "biceps", "remo", "muscle"],
  piernas: ["pierna", "piernas", "sentadilla", "cuadriceps", "gluteo", "gluteos", "pistol", "zancada"],
  core: ["core", "abdominal", "abdominales", "abs", "plancha", "dragon", "lever", "l-sit", "lsit"],
};

const KEYWORDS_CONSEJOS_LOCAL = [
  { palabras: ["agua", "hidrat", "tomar liquido"], texto: "Tomá al menos 2 litros de agua por día, más si entrenás fuerte o hace calor." },
  { palabras: ["dormir", "sueno", "sueño", "descanso", "descansar"], texto: "Dormí bien: la falta de sueño afecta tanto la recuperación muscular como el apetito." },
  { palabras: ["proteina", "proteína"], texto: "Priorizá proteína en cada comida (carne, pollo, huevo, yogur) para acompañar la calistenia." },
  { palabras: ["carbohidrato", "carbo"], texto: "Elegí carbohidratos con fibra (arroz, batata, avena, frutas) en vez de harinas refinadas." },
  { palabras: ["grasa"], texto: "Dejá espacio para grasas buenas: palta, frutos secos, aceite de oliva." },
  { palabras: ["bajar de peso", "adelgazar", "perder peso"], texto: "Para bajar de peso, priorizá alimentos que dan saciedad con pocas calorías: vegetales, proteína magra, legumbres, y un déficit moderado (no extremo)." },
  { palabras: ["subir de peso", "engordar", "ganar musculo", "ganar masa"], texto: "Para subir de peso, no le tengas miedo a sumar calorías extra: frutos secos, más comidas en el día, carbohidratos y grasas de calidad." },
  { palabras: ["dolor", "lesion", "lesión", "molestia"], texto: "Si tenés dolor persistente o una molestia que no baja, mejor consultá a un profesional de la salud antes de seguir entrenando esa zona." },
];

function buscarTrackPorTexto(texto) {
  for (const [track, palabras] of Object.entries(SINONIMOS_TRACK)) {
    if (palabras.some((p) => texto.includes(p))) return track;
  }
  return null;
}

function responderLocal(pregunta) {
  const texto = pregunta.toLowerCase();

  for (const track of Object.values(TRACKS)) {
    for (const ej of track.ejercicios) {
      const palabrasEj = ej.nombre.toLowerCase().split(" ").filter((w) => w.length > 3);
      if (palabrasEj.some((w) => texto.includes(w))) {
        return `${ej.nombre}: ${ej.tip}`;
      }
    }
  }

  for (const a of ALIMENTOS) {
    const nombreSimple = a.nombre.toLowerCase().split("(")[0].trim();
    if (nombreSimple.length > 3 && texto.includes(nombreSimple)) {
      return `${a.nombre} tiene aproximadamente ${a.kcal} kcal, ${a.prot}g de proteína, ${a.carb}g de carbohidratos y ${a.grasa}g de grasas.`;
    }
  }

  const track = buscarTrackPorTexto(texto);
  if (track) {
    const info = TRACKS[track];
    const ejemplos = info.ejercicios.slice(0, 3).map((e) => `• ${e.nombre}: ${e.tip}`).join("\n");
    return `Para ${info.nombre.toLowerCase()} podés progresar así:\n${ejemplos}`;
  }

  for (const k of KEYWORDS_CONSEJOS_LOCAL) {
    if (k.palabras.some((p) => texto.includes(p))) return k.texto;
  }

  return null;
}

function ChatCoach({ accesoPremium, onBloqueado, onCerrar }) {
  const [mensajes, setMensajes] = useState([
    { rol: "assistant", texto: "Hola, soy tu coach de calistenia. Contame qué duda tenés sobre algún ejercicio o progresión.", saludo: true },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);

  if (!accesoPremium) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 60 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="display text-sm" style={{ color: C.muted }}>COACH VIRTUAL</span>
            <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
          </div>
          <Locked titulo="Consultas ilimitadas a un coach de calistenia" onBloqueado={onBloqueado} />
        </div>
      </div>
    );
  }

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    const nuevos = [...mensajes, { rol: "user", texto }];
    setMensajes(nuevos);
    setInput("");
    setCargando(true);

    // La API exige que la conversación arranque con un turno "user": el saludo
    // inicial es solo de la interfaz, no se manda como historial. Además se
    // recortan los últimos 20 mensajes para no arrastrar conversaciones enormes.
    const historial = nuevos
      .filter((m) => !m.saludo)
      .slice(-20)
      .map((m) => ({ role: m.rol, content: m.texto }));

    try {
      const texto2 = await llamarCoach(historial);
      setMensajes((prev) => [...prev, { rol: "assistant", texto: texto2 }]);
    } catch (e) {
      console.warn("El coach con IA no está disponible, uso el modo básico:", e);
      const respuestaLocal = responderLocal(texto);
      const texto2 = respuestaLocal
        ? `${respuestaLocal}\n\n(Modo básico: en este momento no pudimos conectar con el coach con IA.)`
        : "No tengo una respuesta puntual para eso en modo básico. Probá preguntar por un ejercicio o alimento específico.";
      setMensajes((prev) => [...prev, { rol: "assistant", texto: texto2 }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", zIndex: 60 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-t-md sm:rounded-md w-full max-w-sm h-[75vh] flex flex-col">
        <div className="flex justify-between items-center p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} color={C.train} />
            <span className="display text-sm" style={{ color: C.muted }}>COACH VIRTUAL</span>
          </div>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className="max-w-[85%] rounded-md px-3 py-2 text-sm"
              style={{
                alignSelf: m.rol === "user" ? "flex-end" : "flex-start",
                background: m.rol === "user" ? C.train : C.panelAlt,
                color: m.rol === "user" ? C.panel : C.text,
              }}
            >
              {m.texto}
            </div>
          ))}
          {cargando && (
            <div className="text-xs mono" style={{ color: C.muted }}>El coach está escribiendo...</div>
          )}
        </div>

        <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Ej: ¿cómo mejoro mi dominada?"
            className="flex-1 rounded px-3 py-2 text-sm"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <button onClick={enviar} disabled={cargando} className="flex items-center justify-center rounded px-3" style={{ background: C.train, color: C.panel, opacity: cargando ? 0.5 : 1 }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminCodigos({ onCerrar }) {
  const [autorizado, setAutorizado] = useState(null);
  const [seccion, setSeccion] = useState("usuarios");
  const [codigos, setCodigos] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [usuarios, setUsuarios] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [activandoEmail, setActivandoEmail] = useState(null);

  const cargarCodigos = useCallback(async () => {
    try {
      const lista = await listarCodigosPremium();
      setCodigos(lista);
    } catch (e) {
      console.error(e);
      setCodigos([]);
    }
  }, []);

  const [errorUsuarios, setErrorUsuarios] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setErrorUsuarios(null);
    try {
      const lista = await adminListarUsuarios();
      setUsuarios(lista);
    } catch (e) {
      console.error(e);
      setErrorUsuarios(e?.message || "Error desconocido");
      setUsuarios([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await soyAdmin();
      setAutorizado(ok);
      if (ok) {
        cargarUsuarios();
        cargarCodigos();
      }
    })();
  }, [cargarUsuarios, cargarCodigos]);

  const generar = async () => {
    setGenerando(true);
    try {
      await crearCodigoPremium();
      await cargarCodigos();
    } catch (e) {
      console.error(e);
    }
    setGenerando(false);
  };

  const activarPremiumA = async (email) => {
    setActivandoEmail(email);
    try {
      await adminActivarPremium(email, 30);
      await cargarUsuarios();
    } catch (e) {
      console.error(e);
    }
    setActivandoEmail(null);
  };

  const hoyStr = hoy();
  const usuariosFiltrados = (usuarios || []).filter((u) => {
    const q = filtro.trim().toLowerCase();
    if (!q) return true;
    return (u.email || "").toLowerCase().includes(q) || (u.nombre || "").toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 70 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="display text-sm" style={{ color: C.muted }}>PANEL DE ADMINISTRACIÓN</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        {autorizado === null && <p className="text-xs" style={{ color: C.muted }}>Verificando permisos...</p>}
        {autorizado === false && (
          <p className="text-xs" style={{ color: C.danger }}>Esta cuenta no tiene permisos de administrador.</p>
        )}

        {autorizado && (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSeccion("usuarios")}
                className="flex-1 py-2 rounded text-xs mono"
                style={{ background: seccion === "usuarios" ? C.train : C.panelAlt, color: seccion === "usuarios" ? C.panel : C.muted }}
              >
                Usuarios
              </button>
              <button
                onClick={() => setSeccion("codigos")}
                className="flex-1 py-2 rounded text-xs mono"
                style={{ background: seccion === "codigos" ? C.train : C.panelAlt, color: seccion === "codigos" ? C.panel : C.muted }}
              >
                Códigos
              </button>
            </div>

            {seccion === "usuarios" && (
              <div>
                <p className="text-[10px] mb-3" style={{ color: C.muted }}>
                  Todos los que se registraron en la app, con su estado actual. "+30 días" le activa o extiende
                  Premium a esa cuenta puntual, sin necesidad de código ni pago.
                </p>
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar por email o nombre..."
                  className="w-full rounded px-3 py-2 text-xs mb-3"
                  style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
                />
                {errorUsuarios ? (
                  <p className="text-xs" style={{ color: C.danger }}>Error al cargar: {errorUsuarios}</p>
                ) : usuarios === null ? (
                  <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
                ) : usuariosFiltrados.length === 0 ? (
                  <p className="text-xs" style={{ color: C.muted }}>No hay usuarios que coincidan.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {usuariosFiltrados.map((u) => {
                      const estado = estadoUsuarioAdmin(u, hoyStr);
                      return (
                        <div key={u.user_id} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs truncate">{u.email}</span>
                            <span className="text-[10px] mono flex-shrink-0" style={{ color: estado.color }}>{estado.texto}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 gap-2">
                            <span className="text-[9px]" style={{ color: C.muted }}>
                              {u.nombre ? `${u.nombre} · ` : ""}Alta: {new Date(u.creado).toLocaleDateString("es-UY")}
                            </span>
                            <button
                              onClick={() => activarPremiumA(u.email)}
                              disabled={activandoEmail === u.email}
                              className="text-[10px] mono px-2 py-1 rounded flex-shrink-0"
                              style={{ background: C.food, color: C.bg, opacity: activandoEmail === u.email ? 0.5 : 1 }}
                            >
                              {activandoEmail === u.email ? "..." : "+30 días"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {seccion === "codigos" && (
              <div>
                <p className="text-[10px] mb-3" style={{ color: C.muted }}>
                  Mercado Pago activa Premium automáticamente al confirmar el pago. Usá esto solo para casos manuales
                  (promociones, cortesías). Cada código es de un solo uso.
                </p>
                <button onClick={generar} disabled={generando} className="w-full py-2 rounded font-medium mb-3" style={{ background: C.food, color: C.bg, opacity: generando ? 0.5 : 1 }}>
                  {generando ? "Generando..." : "Generar código nuevo"}
                </button>
                {codigos === null ? (
                  <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
                ) : codigos.length === 0 ? (
                  <p className="text-xs" style={{ color: C.muted }}>Todavía no generaste códigos.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {codigos.map((c) => (
                      <div key={c.codigo} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
                        <span className="mono text-sm">{c.codigo}</span>
                        <span className="text-[10px]" style={{ color: c.usado ? C.muted : C.food }}>{c.usado ? `Usado (${c.fecha_uso})` : "Disponible"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- ONBOARDING ----------
function Onboarding({ onCompletar, storageDisponible }) {
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState("");
  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [objetivo, setObjetivo] = useState("mantener");
  const [datos, setDatos] = useState({ peso: "", altura: "", edad: "", sexo: "hombre", actividad: "ligero" });
  const [nivel, setNivelElegido] = useState("principiante");

  const totalPasos = 4;

  const finalizar = () => {
    const calculado = calcularObjetivoDiario({ ...datos, objetivo });
    const base = calculado || { kcal: 2200, prot: 150, carb: 220, grasa: 70 };
    const perfilNuevo = { ...base, objetivo, nombre: nombre.trim(), ...datos };
    const progresionNueva = NIVEL_OPCIONES.find((n) => n.id === nivel)?.progresion || NIVEL_OPCIONES[0].progresion;
    onCompletar({ perfilNuevo, progresionNueva, codigoInvitacion });
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
              Entrená con progresiones de peso corporal y comé en base a tus calorías, todo en una sola app. Vamos a hacerte unas preguntas rápidas para armar tu plan.
            </p>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿Cómo te llamamos?"
              className="w-full max-w-xs rounded px-3 py-2 text-sm text-center mt-2"
              style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
            />
            <input
              value={codigoInvitacion}
              onChange={(e) => setCodigoInvitacion(e.target.value)}
              placeholder="¿Alguien te invitó? Código (opcional)"
              className="w-full max-w-xs rounded px-3 py-2 text-sm text-center mono"
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
            <h2 className="text-lg font-semibold mb-1">Contanos de vos</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>Con esto calculamos tu objetivo de calorías y macros (podés ajustarlo cuando quieras).</p>
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
            <h2 className="text-lg font-semibold mb-4">¿Cómo te describís hoy?</h2>
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

// ---------- MODAL PERFIL ----------
function ModalPerfil({ perfil, onGuardar, onCerrar, onVerTerminos, onVerAyuda }) {
  const [form, setForm] = useState(perfil);
  const [datos, setDatos] = useState({
    peso: perfil.peso || "",
    altura: perfil.altura || "",
    edad: perfil.edad || "",
    sexo: perfil.sexo || "hombre",
    actividad: perfil.actividad || "ligero",
    objetivo: perfil.objetivo || "mantener",
  });
  const [mostrarCalc, setMostrarCalc] = useState(false);
  const [avisoObjetivo, setAvisoObjetivo] = useState(null);
  const datosCompletos = Boolean(datos.peso && datos.altura && datos.edad);

  const calcular = () => {
    const res = calcularObjetivoDiario(datos);
    if (res) setForm({ ...form, ...res, objetivo: datos.objetivo });
  };

  const cambiarObjetivo = (nuevoObjetivo) => {
    const nuevosDatos = { ...datos, objetivo: nuevoObjetivo };
    setDatos(nuevosDatos);
    if (datosCompletos) {
      const res = calcularObjetivoDiario(nuevosDatos);
      if (res) {
        setForm({ ...form, ...res, objetivo: nuevoObjetivo });
        setAvisoObjetivo({ ok: true, texto: "Recalculamos tus calorías y macros para el nuevo objetivo." });
        return;
      }
    }
    setForm({ ...form, objetivo: nuevoObjetivo });
    setAvisoObjetivo({ ok: false, texto: "Completá tu peso, altura y edad en la calculadora de abajo para recalcular tus calorías automáticamente." });
    setMostrarCalc(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 50 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>OBJETIVOS DIARIOS</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        <div className="mb-4">
          <div className="text-xs mb-2" style={{ color: C.muted }}>Tu objetivo</div>
          <div className="flex gap-2">
            {OBJETIVOS.map((o) => (
              <button
                key={o.id}
                onClick={() => cambiarObjetivo(o.id)}
                className="flex-1 text-xs py-2 rounded text-center"
                style={{
                  background: form.objetivo === o.id ? C.train : C.panelAlt,
                  color: form.objetivo === o.id ? C.panel : C.muted,
                  border: `1px solid ${form.objetivo === o.id ? C.train : C.border}`,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          {avisoObjetivo ? (
            <p className="text-[9px] mt-1" style={{ color: avisoObjetivo.ok ? C.food : C.train }}>{avisoObjetivo.texto}</p>
          ) : (
            <p className="text-[9px] mt-1" style={{ color: C.muted }}>
              ¿Ya llegaste a tu meta? Cambiá el objetivo cuando quieras: si ya cargaste tu peso, altura y edad, recalculamos tus calorías solas.
            </p>
          )}
        </div>

        <button
          onClick={() => setMostrarCalc(!mostrarCalc)}
          className="w-full text-left text-xs mono mb-3 px-3 py-2 rounded"
          style={{ background: C.panelAlt, color: C.food, border: `1px solid ${C.border}` }}
        >
          {mostrarCalc ? "Ocultar calculadora automática" : "¿No sabés cuántas calorías necesitás? Calculalo acá"}
        </button>

        {mostrarCalc && (
          <div className="rounded-md p-3 mb-4 flex flex-col gap-2" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
            <div className="flex gap-2">
              <input type="number" placeholder="Peso (kg)" value={datos.peso} onChange={(e) => setDatos({ ...datos, peso: e.target.value })} className="rounded px-2 py-2 text-xs w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
              <input type="number" placeholder="Altura (cm)" value={datos.altura} onChange={(e) => setDatos({ ...datos, altura: e.target.value })} className="rounded px-2 py-2 text-xs w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
              <input type="number" placeholder="Edad" value={datos.edad} onChange={(e) => setDatos({ ...datos, edad: e.target.value })} className="rounded px-2 py-2 text-xs w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div className="flex gap-2">
              {["hombre", "mujer"].map((s) => (
                <button key={s} onClick={() => setDatos({ ...datos, sexo: s })} className="flex-1 text-xs py-2 rounded" style={{ background: datos.sexo === s ? C.food : C.panel, color: datos.sexo === s ? C.bg : C.muted, border: `1px solid ${C.border}` }}>
                  {s === "hombre" ? "Hombre" : "Mujer"}
                </button>
              ))}
            </div>
            <select value={datos.actividad} onChange={(e) => setDatos({ ...datos, actividad: e.target.value })} className="rounded px-2 py-2 text-xs" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}>
              {NIVELES_ACTIVIDAD.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <select value={datos.objetivo} onChange={(e) => setDatos({ ...datos, objetivo: e.target.value })} className="rounded px-2 py-2 text-xs" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}>
              {OBJETIVOS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <button onClick={calcular} className="py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg }}>
              Calcular y completar
            </button>
            <p className="text-[9px]" style={{ color: C.muted }}>Estimación orientativa (fórmula Mifflin-St Jeor). Ajustala si tenés indicación de un profesional.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {[
            ["kcal", "Calorías"],
            ["prot", "Proteína (g)"],
            ["carb", "Carbohidratos (g)"],
            ["grasa", "Grasas (g)"],
          ].map(([campo, label]) => (
            <label key={campo} className="flex flex-col text-xs" style={{ color: C.muted }}>
              {label}
              <input
                type="number"
                value={form[campo]}
                onChange={(e) => setForm({ ...form, [campo]: Number(e.target.value) })}
                className="mt-1 rounded px-2 py-2 mono"
                style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
              />
            </label>
          ))}
        </div>
        <button
          onClick={() =>
            onGuardar({
              ...form,
              peso: datos.peso,
              altura: datos.altura,
              edad: datos.edad,
              sexo: datos.sexo,
              actividad: datos.actividad,
            })
          }
          className="w-full mt-4 py-2 rounded font-medium"
          style={{ background: C.train, color: C.panel }}
        >
          Guardar
        </button>
        <button
          onClick={onVerAyuda}
          className="flex items-center justify-center gap-1 w-full text-center text-[10px] mt-3 underline"
          style={{ color: C.muted }}
        >
          <HelpCircle size={11} /> ¿Cómo usar la app?
        </button>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full text-center text-[10px] mt-3 underline"
          style={{ color: C.food }}
        >
          <MessageCircle size={11} /> ¿Necesitás ayuda? Escribinos por WhatsApp
        </a>
        <button onClick={onVerTerminos} className="w-full text-center text-[10px] mt-3 underline" style={{ color: C.muted }}>
          Términos y Privacidad
        </button>
        <button onClick={cerrarSesion} className="w-full text-center text-[10px] mt-2 underline" style={{ color: C.danger }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

const AYUDA_SECCIONES = [
  {
    icon: Home,
    color: null,
    titulo: "Hoy",
    puntos: [
      "Tu resumen del día: calorías consumidas, plan de entrenamiento sugerido, y lo que ya cargaste de comida y ejercicio.",
      "Los botones \"+ Ejercicio\" y \"+ Comida\" son para cargar algo rápido sin cambiar de pestaña.",
      "\"En la heladera tengo...\" te sugiere recetas con lo que marques que tenés a mano (Premium).",
      "Más abajo podés compartir tu código de invitación y ganar días gratis cuando alguien lo use.",
    ],
  },
  {
    icon: Dumbbell,
    color: "train",
    titulo: "Entreno",
    puntos: [
      "Elegí el grupo muscular y tocá \"Iniciar entrenamiento\": arranca una cuenta regresiva 3-2-1.",
      "Mientras entrenás, tocá \"+ REP\" en cada repetición y \"Serie terminada\" para guardar la serie — ahí arranca el descanso solo.",
      "Al completar suficientes series de un ejercicio, la app te va a sugerir subir de nivel.",
      "Los primeros 3 niveles de cada grupo son gratis; del nivel 4 en adelante es Premium.",
    ],
  },
  {
    icon: Apple,
    color: "food",
    titulo: "Nutrición",
    puntos: [
      "Tus macros del día, y accesos rápidos para cargar comidas comunes o buscar alimentos personalizados.",
      "\"Qué comer ahora\" te recomienda algo según lo que te falta de macros hoy (Premium).",
      "En \"Cuánto debés comer por día\" podés ver y editar cómo repartís tus calorías entre desayuno, almuerzo, merienda y cena.",
    ],
  },
  {
    icon: TrendingUp,
    color: null,
    titulo: "Progreso",
    puntos: [
      "Racha de entrenamiento, logros, calendario con tu historial, seguimiento de peso corporal y gráfico de calorías de la semana (todo Premium).",
    ],
  },
  {
    icon: Lightbulb,
    color: "food",
    titulo: "Consejos",
    puntos: [
      "Consejos generales de nutrición según tu objetivo (bajar, mantener o subir de peso).",
      "La técnica de cada ejercicio de todos los grupos, con dibujos de la posición inicial y final.",
    ],
  },
  {
    icon: MessageCircle,
    color: "train",
    titulo: "Coach virtual",
    puntos: [
      "El botón naranja flotante abre el coach: preguntale dudas de técnica o nutrición cuando quieras (Premium).",
    ],
  },
  {
    icon: Crown,
    color: "food",
    titulo: "Premium y prueba gratis",
    puntos: [
      `Arrancás con ${DIAS_PRUEBA} días de prueba gratis con acceso completo a todo.`,
      `Después, ${PRECIO_PREMIUM}/mes vía Mercado Pago (se renueva solo cada 30 días), o con un código de activación si te lo pasaron.`,
      "Invitando amigos con tu código (panel \"Invitá y ganá días gratis\" en Hoy), ambos suman días extra de prueba.",
    ],
  },
];

function ModalAyuda({ onCerrar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", zIndex: 80 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="display text-sm" style={{ color: C.muted }}>¿CÓMO USAR LA APP?</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <p className="text-[11px] mb-4" style={{ color: C.muted }}>
          Una guía rápida de qué encontrás en cada pestaña.
        </p>
        <div className="flex flex-col gap-4">
          {AYUDA_SECCIONES.map((s) => {
            const Icon = s.icon;
            const tinte = s.color === "train" ? C.train : s.color === "food" ? C.food : C.text;
            return (
              <div key={s.titulo}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={15} color={tinte} />
                  <span className="text-sm font-medium" style={{ color: tinte }}>{s.titulo}</span>
                </div>
                <div className="flex flex-col gap-1.5 pl-1">
                  {s.puntos.map((p, i) => (
                    <p key={i} className="text-xs" style={{ color: C.muted }}>{p}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full text-center text-[10px] mt-4 underline"
          style={{ color: C.food }}
        >
          <MessageCircle size={11} /> ¿Seguís con dudas? Escribinos por WhatsApp
        </a>
      </div>
    </div>
  );
}

function ModalTerminos({ onCerrar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", zIndex: 80 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="rounded-md p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>TÉRMINOS Y PRIVACIDAD</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>
        <div className="flex flex-col gap-4 text-xs" style={{ color: C.text }}>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Qué es esta app</div>
            <p style={{ color: C.muted }}>
              Calistenia + Nutrición es una herramienta de entrenamiento y registro alimentario. No reemplaza el asesoramiento de un médico, nutricionista o entrenador con matrícula. Si tenés una condición de salud preexistente, consultá a un profesional antes de empezar cualquier rutina.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Coach virtual</div>
            <p style={{ color: C.muted }}>
              Las respuestas del coach (con IA o en modo básico) son orientación general, no un diagnóstico ni una indicación médica. Ante dolor persistente o una lesión, consultá a un profesional de la salud.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Qué datos guardamos</div>
            <p style={{ color: C.muted }}>
              Guardamos lo que cargás vos: perfil (objetivo, peso, altura, calorías), tus registros de entrenamiento y comidas, y tu código de referido. Esta información se guarda asociada a tu cuenta y no se comparte ni se vende a terceros.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Suscripción Premium</div>
            <p style={{ color: C.muted }}>
              Incluye {DIAS_PRUEBA} días de prueba gratis. Pasado ese período, el plan Premium se cobra por mes a través de Mercado Pago. Podés dejar de usarla cuando quieras: no se renueva sola sin que actives un nuevo pago.
            </p>
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: C.food }}>Borrar tus datos o contactarnos</div>
            <p style={{ color: C.muted }}>
              Si en algún momento querés que borremos tu información, o tenés cualquier duda, escribinos por WhatsApp al{" "}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: C.food }}>
                +598 92 778 233
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
