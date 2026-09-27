export const TRACKS = {
  empuje: {
    nombre: "Empuje",
    ejercicios: [
      { nombre: "Flexiones de rodillas", tip: "Apoya las rodillas, espalda recta y baja el pecho cerca del piso sin arquear la zona lumbar.", figura: ["empuje_rodillas_bajo", "empuje_rodillas_arriba"] },
      { nombre: "Flexiones completas", tip: "Cuerpo en línea recta de cabeza a talones, codos a 45° del torso, no dejes caer la cadera.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexiones con manos juntas", tip: "Manos juntas formando un diamante bajo el pecho; sumas trabajo de tríceps, controla la bajada.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Fondos en banco o paralelas", tip: "Baja hasta que los hombros queden a la altura de los codos, no más, para cuidar el hombro.", figura: ["empuje_bajo", "empuje_arriba"], sinEquipo: "Sin banco ni paralelas, usa dos sillas resistentes de la misma altura, o el borde firme de una cama o sofá bajo." },
      { nombre: "Flexiones con un brazo extendido", tip: "Un brazo se extiende al costado mientras el otro empuja; alterna lados en cada repetición.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexión a un solo brazo (asistida)", tip: "La mano libre apoya solo de sostén, el peso real lo lleva el brazo de trabajo.", figura: ["empuje_bajo", "empuje_arriba"] },
      { nombre: "Flexión pike (pica)", tip: "Cadera elevada formando una V invertida, baja la cabeza hacia el piso entre las manos: empieza a preparar el hombro para el pino.", figura: ["empuje_pike", "empuje_pike_arriba"] },
      { nombre: "Flexión pike con pies elevados", tip: "Pies apoyados en una silla o banco, cuanto más elevados más peso llevan los hombros.", figura: ["empuje_pike", "empuje_pike_arriba"] },
      { nombre: "Flexión en pino asistida (contra la pared)", tip: "Apóyate en la pared con los pies, baja la cabeza controlado hasta rozar el piso y empuja de nuevo arriba.", figura: ["empuje_pino", "empuje_pino_arriba"] },
      { nombre: "Flexión a un solo brazo (completa)", tip: "Pies bien separados para dar base, empuja con todo el cuerpo tenso como una tabla, sin rotar la cadera.", figura: ["empuje_bajo", "empuje_arriba"] },
    ],
  },
  traccion: {
    nombre: "Tracción",
    ejercicios: [
      { nombre: "Remo con el cuerpo inclinado", tip: "Cuerpo recto, tira con los codos pegados al torso y aprieta los omóplatos arriba.", figura: ["remo_bajo", "remo_arriba"], sinEquipo: "Si no tienes una barra baja, usa el borde de una mesa resistente, un escritorio firme, o dos sillas fuertes con un palo de escoba apoyado entre los respaldos a la altura justa." },
      { nombre: "Dominadas asistidas (con banda)", tip: "Usa banda o apoyo en los pies, prioriza el rango completo antes que la velocidad.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Sin barra fija funciona igual una barra de dominadas para marco de puerta (no hace falta atornillarla) o una rama gruesa y firme si entrenas al aire libre." },
      { nombre: "Dominadas completas", tip: "Arranca desde brazos extendidos, sube hasta que el mentón pase la barra, sin hamacarte.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Mismo reemplazo: barra de marco de puerta, estructura de juegos en una plaza, o una rama gruesa y firme." },
      { nombre: "Dominadas con peso extra", tip: "Suma peso extra solo cuando puedas hacer 8-10 dominadas limpias sin lastre.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Usa el mismo reemplazo de barra (marco de puerta o plaza) y suma peso con una mochila cargada." },
      { nombre: "Subida completa a la barra, asistida", tip: "Usa banda para el impulso; practica primero el tirón alto y el agarre girado.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Una barra de marco de puerta o los juegos de una plaza sirven igual para practicar la subida." },
      { nombre: "Subida completa a la barra", tip: "Sin impulso de piernas: tirón explosivo y transición rápida de muñeca sobre la barra.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Barra de marco de puerta o una plaza con barras firmes." },
      { nombre: "Muscle-up con peso extra", tip: "Suma peso solo cuando el muscle-up de barra te salga limpio y controlado varias veces seguidas.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Este necesita una barra bien firme y alta por la transición: mejor en una plaza con barras o en un gimnasio, no en el marco de una puerta común." },
      { nombre: "Dominada arquero (archer)", tip: "Un brazo casi extendido al costado, el otro hace casi todo el trabajo de tracción; alterna lados.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Barra de marco de puerta o plaza, igual que las dominadas normales." },
      { nombre: "Dominada a un brazo, asistida (con banda)", tip: "La banda saca peso del brazo de trabajo; enfócate en no rotar el torso durante la subida.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Barra de marco de puerta o plaza; ata la banda arriba de la misma forma." },
      { nombre: "Dominada a un solo brazo (completa)", tip: "Agárrate la muñeca del brazo libre para dar algo de estabilidad al principio; tira parejo, sin tirones bruscos.", figura: ["traccion_colgado", "traccion_arriba"], sinEquipo: "Barra de marco de puerta bien firme, o plaza con barras." },
    ],
  },
  piernas: {
    nombre: "Piernas",
    ejercicios: [
      { nombre: "Sentadilla con las dos piernas", tip: "Rodillas en línea con los pies, baja hasta que los muslos queden paralelos al piso.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla con una pierna atrás elevada", tip: "Pie trasero elevado, baja recto, sin que la rodilla delantera pase mucho la punta del pie.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Zancada con salto", tip: "Aterriza suave, controla la rodilla y alterna piernas en el aire.", figura: ["piernas_de_pie", "piernas_salto"], adaptacionVeterano: "Para cuidar las rodillas puedes hacerla sin el salto: bajas y subes controlado alternando piernas, con casi el mismo trabajo muscular y mucho menos impacto." },
      { nombre: "Sentadilla a una pierna, asistida", tip: "Sostente de algo (marco de puerta, barra) para trabajar equilibrio y rango completo.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla a una pierna completa", tip: "Pierna libre extendida al frente, baja controlado, sin rebotar abajo.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla a una pierna con peso", tip: "Suma una mancuerna solo cuando te salga limpia varias veces seguidas sin peso.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Sentadilla búlgara con salto", tip: "Pie trasero elevado como en la búlgara, pero salta y aterriza suave con la misma pierna adelante.", figura: ["piernas_de_pie", "piernas_salto"], adaptacionVeterano: "Puedes sacarle el salto y hacerla controlada, sin despegar los pies del piso, para cuidar rodillas y tobillos." },
      { nombre: "Sentadilla a una pierna en déficit", tip: "Párate sobre un cajón o escalón para bajar más profundo de lo normal; exige más movilidad de tobillo.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Shrimp squat asistido", tip: "Sostente el pie trasero con la mano del mismo lado y ayúdate con la otra mano en algo fijo para bajar controlado.", figura: ["piernas_de_pie", "piernas_abajo"] },
      { nombre: "Shrimp squat completo", tip: "Sin apoyo de manos: baja la rodilla trasera casi hasta tocar el talón, manteniendo el torso erguido.", figura: ["piernas_de_pie", "piernas_abajo"] },
    ],
  },
  core: {
    nombre: "Core",
    ejercicios: [
      { nombre: "Plancha abdominal", tip: "Cuerpo en línea recta, abdomen contraído, no dejes caer la cadera.", porTiempo: true, figura: ["core_plancha"] },
      { nombre: "Subir las piernas colgado de la barra", tip: "Colgado de la barra, sube las piernas sin balancearte, controla la bajada.", figura: ["traccion_colgado", "core_colgado_arriba"], sinEquipo: "Mismo reemplazo que las dominadas: barra de marco de puerta o plaza." },
      { nombre: "Sostenerse con las piernas rectas al frente", tip: "Piernas extendidas al frente en forma de L, hombros activos empujando hacia abajo.", porTiempo: true, figura: ["core_lsit"] },
      { nombre: "Rueda abdominal desde rodillas", tip: "Rodillas apoyadas, extiende controlado y sin arquear la zona lumbar.", figura: ["core_rueda_inicio", "core_rueda"] },
      { nombre: "Bajada controlada del cuerpo, recto", tip: "Solo los hombros apoyados, baja el cuerpo recto lo más lento posible.", porTiempo: true, figura: ["core_negativa"] },
      { nombre: "Cuerpo horizontal colgado, piernas encogidas", tip: "Colgado, lleva las rodillas al pecho con el cuerpo horizontal, activando dorsales y core.", porTiempo: true, figura: ["core_frontlever"], sinEquipo: "Necesitas algo bien firme para colgarte: barra de marco de puerta reforzada o plaza con barras." },
      { nombre: "Rueda abdominal de pie", tip: "Arrancas parado en vez de arrodillado: mucho más exigente, controla la zona lumbar en todo momento.", figura: ["core_rueda_inicio", "core_rueda"] },
      { nombre: "V-sit", tip: "Piernas y torso forman una V, más cerrada que el L-sit; hombros activos y abdomen bien contraído.", porTiempo: true, figura: ["core_lsit"] },
      { nombre: "Front lever con una pierna extendida", tip: "Cuerpo horizontal colgado, una pierna estirada y la otra encogida; alterna para trabajar parejo.", porTiempo: true, figura: ["core_frontlever"], sinEquipo: "Mismo reemplazo: barra de marco de puerta reforzada o plaza." },
      { nombre: "Front lever completo", tip: "Cuerpo totalmente horizontal y recto, colgado de la barra; aprieta dorsales, glúteos y abdomen a la vez.", porTiempo: true, figura: ["core_frontlever"], sinEquipo: "Barra de marco de puerta bien firme o plaza; este exige mucho agarre, asegúrate que no se mueva." },
    ],
  },
};

// Coordenadas (viewBox 0-100) de figuras tipo pictograma: cabeza/hombro/codo/
// mano forman el brazo en dos tramos, cadera/rodilla/pie la pierna en dos
// tramos (así se ve la "quiebra" del codo o la rodilla en vez de una línea
// recta), más una línea de piso o de barra opcional para dar contexto.
export const FIGURAS = {
  empuje_bajo: { cabeza: [24, 80], hombro: [30, 74], codo: [42, 66], mano: [38, 90], cadera: [62, 70], rodilla: [77, 78], pie: [92, 86], pisoY: 90 },
  empuje_arriba: { cabeza: [24, 52], hombro: [30, 56], codo: [34, 73], mano: [38, 90], cadera: [62, 58], rodilla: [77, 72], pie: [92, 86], pisoY: 90 },
  // Flexiones de rodillas: la rodilla queda apoyada y fija en el piso (pivote),
  // y lo que sube y baja es el torso, con el pie/canilla levantado atrás.
  empuje_rodillas_bajo: { cabeza: [26, 80], hombro: [32, 74], codo: [42, 66], mano: [38, 90], cadera: [56, 76], rodilla: [68, 90], pie: [82, 82], pisoY: 90 },
  empuje_rodillas_arriba: { cabeza: [26, 54], hombro: [32, 58], codo: [36, 75], mano: [38, 90], cadera: [56, 62], rodilla: [68, 90], pie: [82, 84], pisoY: 90 },
  empuje_pike: { cabeza: [58, 72], hombro: [52, 62], codo: [44, 76], mano: [38, 90], cadera: [42, 32], rodilla: [65, 60], pie: [88, 86], pisoY: 90 },
  empuje_pike_arriba: { cabeza: [54, 50], hombro: [50, 54], codo: [44, 72], mano: [38, 90], cadera: [42, 32], rodilla: [65, 60], pie: [88, 86], pisoY: 90 },
  empuje_pino: { cabeza: [50, 86], hombro: [50, 72], codo: [50, 81], mano: [50, 90], cadera: [50, 42], rodilla: [50, 25], pie: [50, 10], pisoY: 90 },
  empuje_pino_arriba: { cabeza: [50, 55], hombro: [50, 60], codo: [50, 75], mano: [50, 90], cadera: [50, 42], rodilla: [50, 25], pie: [50, 10], pisoY: 90 },
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
  core_rueda_inicio: { cabeza: [55, 50], hombro: [52, 56], codo: [50, 64], mano: [48, 72], cadera: [50, 72], rodilla: [35, 77], pie: [20, 80], pisoY: 80 },
};

// Plan semanal sugerido: cuerpo completo (los 4 grupos musculares) de lunes
// a viernes, en vez de repartir 1-2 grupos por día. Con un solo ejercicio
// por grupo la sesión quedaba muy corta (3-8 minutos); entrenando los 4
// grupos cada día se arma una sesión completa (15-25 minutos según el
// nivel), sin perder el enfoque de progresión por grupo. Es solo una guía
// — el usuario puede entrenar el grupo que quiera cualquier día desde la
// pestaña Entreno.
export const ORDEN_TRACKS = ["empuje", "traccion", "piernas", "core"];

export const PLAN_SEMANAL = {
  0: { descanso: true },
  1: { tracks: ORDEN_TRACKS },
  2: { tracks: ORDEN_TRACKS },
  3: { tracks: ORDEN_TRACKS },
  4: { tracks: ORDEN_TRACKS },
  5: { tracks: ORDEN_TRACKS },
  6: { descanso: true },
};

export function planDeHoy() {
  return PLAN_SEMANAL[new Date().getDay()];
}

export const NIVEL_OPCIONES = [
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

export const DURACIONES_DESCANSO = [15, 30, 45, 60, 90, 120];

// Repeticiones sugeridas por ronda: arranca más alto en la primera serie y
// baja un poco en las siguientes (fatiga normal), sin bajar de un mínimo.
export function sugerirRepeticiones(nivel) {
  if (nivel <= 2) return 12;
  if (nivel <= 4) return 10;
  if (nivel <= 6) return 8;
  if (nivel <= 8) return 6;
  return 5;
}

export function objetivoRepsRonda(nivel, ronda) {
  const base = sugerirRepeticiones(nivel);
  return Math.max(3, base - (ronda - 1) * 2);
}

// Franja etaria a partir de la edad cargada en el perfil, para adaptar
// avisos puntuales (ej. cuidado articular en ejercicios de salto).
export function franjaEtaria(edad) {
  const e = Number(edad);
  if (!e) return null;
  if (e < 30) return "joven";
  if (e < 50) return "adulto";
  return "veterano";
}

export function sugerirDescanso(nivel) {
  if (nivel <= 2) return { segundos: 15, texto: "Es un ejercicio de base, más de resistencia: con 15 segundos de descanso alcanza para seguir con buen ritmo." };
  if (nivel <= 4) return { segundos: 30, texto: "Nivel intermedio: 30 segundos de descanso son un buen equilibrio entre esfuerzo y recuperación." };
  if (nivel <= 6) return { segundos: 45, texto: "Ejercicio más exigente: dale 45 segundos para llegar fresco a la próxima serie." };
  if (nivel <= 8) return { segundos: 60, texto: "Movimiento avanzado: descansa 60 segundos para mantener la técnica en la próxima serie." };
  return { segundos: 90, texto: "Es un movimiento de fuerza máxima o de habilidad avanzada: descansa 90 segundos para recuperar bien antes de ir de nuevo." };
}

// Cada logro suma, además del chequeo booleano ("cumple"), qué tan cerca
// está (0 a 1, "progreso") y una frase corta de cuánto falta ("falta") — se
// usa para mostrar en Hoy el logro más próximo a desbloquear, no solo
// festejar los que ya se cumplieron.
export const LOGROS_DEF = [
  {
    id: "racha3", nombre: "Racha de 3 días", desc: "Entrenaste 3 días seguidos", cumple: (ctx) => ctx.racha >= 3,
    progreso: (ctx) => Math.min(ctx.racha / 3, 1),
    falta: (ctx) => `${3 - ctx.racha} día${3 - ctx.racha !== 1 ? "s" : ""}`,
  },
  {
    id: "semana", nombre: "Semana perfecta", desc: "Entrenaste los 7 días de la semana", cumple: (ctx) => ctx.diasEntrenados >= 7,
    progreso: (ctx) => Math.min(ctx.diasEntrenados / 7, 1),
    falta: (ctx) => `${7 - ctx.diasEntrenados} día${7 - ctx.diasEntrenados !== 1 ? "s" : ""}`,
  },
  {
    id: "nivel3", nombre: "Salió de principiante", desc: "Llegaste al nivel 3 en algún grupo", cumple: (ctx) => ctx.nivelMaximo >= 3,
    progreso: (ctx) => Math.min(ctx.nivelMaximo / 3, 1),
    falta: (ctx) => `${3 - ctx.nivelMaximo} nivel${3 - ctx.nivelMaximo !== 1 ? "es" : ""}`,
  },
  {
    id: "nivel5", nombre: "Nivel avanzado", desc: "Llegaste al nivel 5 en algún grupo", cumple: (ctx) => ctx.nivelMaximo >= 5,
    progreso: (ctx) => Math.min(ctx.nivelMaximo / 5, 1),
    falta: (ctx) => `${5 - ctx.nivelMaximo} nivel${5 - ctx.nivelMaximo !== 1 ? "es" : ""}`,
  },
  {
    id: "nivel8", nombre: "Casi experto", desc: "Llegaste al nivel 8 en algún grupo", cumple: (ctx) => ctx.nivelMaximo >= 8,
    progreso: (ctx) => Math.min(ctx.nivelMaximo / 8, 1),
    falta: (ctx) => `${8 - ctx.nivelMaximo} nivel${8 - ctx.nivelMaximo !== 1 ? "es" : ""}`,
  },
  {
    id: "nivel10", nombre: "Nivel máximo", desc: "Llegaste al nivel 10 en algún grupo", cumple: (ctx) => ctx.nivelMaximo >= 10,
    progreso: (ctx) => Math.min(ctx.nivelMaximo / 10, 1),
    falta: (ctx) => `${10 - ctx.nivelMaximo} nivel${10 - ctx.nivelMaximo !== 1 ? "es" : ""}`,
  },
  {
    id: "todoterreno", nombre: "Todo terreno", desc: "Nivel 2 o más en los 4 grupos", cumple: (ctx) => Object.values(ctx.progresion || {}).every((n) => n >= 2),
    progreso: (ctx) => {
      const niveles = Object.values(ctx.progresion || {});
      return niveles.length ? niveles.filter((n) => n >= 2).length / niveles.length : 0;
    },
    falta: (ctx) => {
      const faltantes = Object.values(ctx.progresion || {}).filter((n) => n < 2).length;
      return `${faltantes} grupo${faltantes !== 1 ? "s" : ""}`;
    },
  },
];
