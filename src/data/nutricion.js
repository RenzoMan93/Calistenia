export const ALIMENTOS = [
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

export const HELADERA_ITEMS = [
  "Huevo", "Pollo", "Carne picada", "Carne de cerdo", "Atún", "Pescado", "Queso", "Queso untable", "Yogur", "Leche",
  "Arroz", "Fideos", "Quinoa", "Pan", "Avena", "Batata", "Choclo", "Zapallo", "Lentejas", "Garbanzos",
  "Palta", "Tomate", "Lechuga", "Zanahoria", "Espinaca", "Cebolla", "Champiñones",
  "Banana", "Manzana", "Frutos secos", "Miel",
];

export const RECETAS = [
  { nombre: "Tortilla de huevo con tomate", ingredientes: ["Huevo", "Tomate"], kcal: 220, prot: 16, carb: 4, grasa: 15, preparacion: "Bate los huevos, agrega el tomate picado y vuelca en una sartén con un poco de aceite a fuego medio hasta que cuaje de los dos lados." , tipo: "desayuno" },
  { nombre: "Pollo con arroz y lechuga", ingredientes: ["Pollo", "Arroz", "Lechuga"], kcal: 420, prot: 42, carb: 45, grasa: 8, preparacion: "Cocina el pollo a la plancha con sal y limón, hierve el arroz aparte, y sirve todo junto con la lechuga fresca." , tipo: "almuerzo" },
  { nombre: "Ensalada de atún con palta", ingredientes: ["Atún", "Palta", "Tomate"], kcal: 310, prot: 26, carb: 8, grasa: 20, preparacion: "Mezcla el atún escurrido con la palta en cubos y el tomate picado; condimenta con sal, limón y un chorrito de aceite de oliva." , tipo: "almuerzo" },
  { nombre: "Bowl de avena, banana y yogur", ingredientes: ["Avena", "Banana", "Yogur"], kcal: 340, prot: 14, carb: 55, grasa: 7, preparacion: "Cocina la avena con un poco de agua o leche, déjala entibiar y agrega la banana en rodajas y el yogur arriba." , tipo: "desayuno" },
  { nombre: "Carne picada con batata al horno", ingredientes: ["Carne picada", "Batata"], kcal: 460, prot: 30, carb: 40, grasa: 20, preparacion: "Dora la carne picada en una sartén con sal y condimentos, y hornea la batata en rodajas hasta que esté tierna." , tipo: "cena" },
  { nombre: "Sandwich de pollo y queso", ingredientes: ["Pollo", "Pan", "Queso"], kcal: 380, prot: 32, carb: 30, grasa: 14, preparacion: "Arma el sandwich con el pollo cocido (desmenuzado o en fetas) y el queso; puedes tostarlo si quieres." , tipo: "almuerzo" },
  { nombre: "Lentejas con arroz", ingredientes: ["Lentejas", "Arroz"], kcal: 350, prot: 18, carb: 60, grasa: 3, preparacion: "Cocina las lentejas hasta que estén tiernas y mezcla con el arroz ya hervido; puedes sumar un sofrito de cebolla." , tipo: "cena" },
  { nombre: "Huevos revueltos con palta", ingredientes: ["Huevo", "Palta"], kcal: 300, prot: 18, carb: 6, grasa: 24, preparacion: "Bate los huevos y cocina revolviendo a fuego bajo hasta que cuajen; sirve con la palta en rodajas o pisada." , tipo: "desayuno" },
  { nombre: "Ensalada de pollo, lechuga y tomate", ingredientes: ["Pollo", "Lechuga", "Tomate"], kcal: 260, prot: 38, carb: 6, grasa: 8, preparacion: "Cocina el pollo a la plancha, córtalo en tiras y mezcla con la lechuga y el tomate; condimenta a gusto." , tipo: "almuerzo" },
  { nombre: "Yogur con banana", ingredientes: ["Yogur", "Banana"], kcal: 205, prot: 7, carb: 35, grasa: 5, preparacion: "Corta la banana en rodajas y mézclala con el yogur. Así de simple." , tipo: "colacion" },
  { nombre: "Atún con arroz", ingredientes: ["Atún", "Arroz"], kcal: 290, prot: 28, carb: 35, grasa: 4, preparacion: "Hierve el arroz y mézclalo con el atún escurrido; puedes sumar un chorrito de aceite de oliva." , tipo: "almuerzo" },
  { nombre: "Tostadas con queso y tomate", ingredientes: ["Pan", "Queso", "Tomate"], kcal: 270, prot: 14, carb: 28, grasa: 11, preparacion: "Tosta el pan y agrega el queso y el tomate en rodajas encima." , tipo: "merienda" },
  { nombre: "Cerdo salteado con zanahoria y cebolla", ingredientes: ["Carne de cerdo", "Zanahoria", "Cebolla"], kcal: 400, prot: 34, carb: 12, grasa: 22, preparacion: "Corta la carne de cerdo en tiras y saltéala en una sartén con la zanahoria y la cebolla cortadas finas." , tipo: "cena" },
  { nombre: "Pescado al horno con zapallo", ingredientes: ["Pescado", "Zapallo"], kcal: 280, prot: 32, carb: 14, grasa: 9, preparacion: "Hornea el pescado con sal y limón junto con el zapallo en cubos, unos 20-25 minutos a fuego medio." , tipo: "cena" },
  { nombre: "Fideos con champiñones y queso", ingredientes: ["Fideos", "Champiñones", "Queso"], kcal: 430, prot: 18, carb: 55, grasa: 15, preparacion: "Hierve los fideos, saltea los champiñones aparte y mezcla todo con el queso rallado." , tipo: "cena" },
  { nombre: "Quinoa con garbanzos y espinaca", ingredientes: ["Quinoa", "Garbanzos", "Espinaca"], kcal: 380, prot: 16, carb: 58, grasa: 8, preparacion: "Cocina la quinoa según el paquete y mézclala con los garbanzos y la espinaca salteada." , tipo: "almuerzo" },
  { nombre: "Tostadas con queso untable y manzana", ingredientes: ["Pan", "Queso untable", "Manzana"], kcal: 260, prot: 9, carb: 38, grasa: 8, preparacion: "Unta el pan con el queso untable y agrega láminas finas de manzana arriba." , tipo: "merienda" },
  { nombre: "Choclo con pollo y espinaca", ingredientes: ["Choclo", "Pollo", "Espinaca"], kcal: 350, prot: 34, carb: 30, grasa: 9, preparacion: "Cocina el pollo a la plancha, saltea la espinaca, y mezcla todo con el choclo (fresco, en lata o hervido)." , tipo: "almuerzo" },
  { nombre: "Yogur con frutos secos y miel", ingredientes: ["Yogur", "Frutos secos", "Miel"], kcal: 280, prot: 10, carb: 30, grasa: 13, preparacion: "Mezcla el yogur con un puñado de frutos secos y un chorrito de miel arriba." , tipo: "colacion" },
  { nombre: "Omelette de queso, cebolla y champiñones", ingredientes: ["Huevo", "Queso", "Cebolla", "Champiñones"], kcal: 340, prot: 22, carb: 6, grasa: 25, preparacion: "Saltea la cebolla y los champiñones, bate los huevos con el queso y vuelca todo en la sartén hasta que cuaje." , tipo: "desayuno" },
  { nombre: "Licuado de banana, leche y avena", ingredientes: ["Banana", "Leche", "Avena"], kcal: 290, prot: 11, carb: 50, grasa: 6, preparacion: "Licua la banana con la leche y la avena hasta que quede cremoso." , tipo: "colacion" },
  { nombre: "Ensalada de garbanzos, tomate y cebolla", ingredientes: ["Garbanzos", "Tomate", "Cebolla"], kcal: 250, prot: 12, carb: 38, grasa: 6, preparacion: "Mezcla los garbanzos cocidos con el tomate y la cebolla picados finos; condimenta con aceite, sal y limón." , tipo: "almuerzo" },
];

// Orden y "fotito" (emoji, ante la falta de fotos reales) de cada momento del día.
export const TIPOS_COMIDA = [
  { id: "desayuno", label: "Desayuno", emoji: "🍳" },
  { id: "almuerzo", label: "Almuerzo", emoji: "🍽️" },
  { id: "merienda", label: "Merienda", emoji: "🥪" },
  { id: "cena", label: "Cena", emoji: "🍲" },
  { id: "colacion", label: "Colación", emoji: "🍎" },
];

export function sugerirDesdeHeladera(seleccion, misMenus = []) {
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

// Cuando ninguna receta de la base combina 2 o más de los ingredientes
// elegidos, la lista de "casiCompletas" termina mostrando recetas que apenas
// coinciden en 1 ingrediente cada una (y parece que ignora el resto de lo
// que elegiste). Para esos casos armamos una sugerencia genérica que sí usa
// TODO lo seleccionado, a modo de idea rápida (sin macros exactos, así que
// no se puede registrar como una comida con calorías precisas).
//
// Cada ingrediente de HELADERA_ITEMS (salvo "Pan", que se trata aparte) cae
// en exactamente una categoría, para que el texto generado sea consistente
// sin importar la combinación: nunca decimos "cocina" algo que se come
// crudo, ni "ponlo arriba del pan" algo que no funciona como relleno.
export const HELADERA_DULCE = new Set(["Avena", "Banana", "Manzana", "Yogur", "Leche", "Miel", "Frutos secos"]);

export const HELADERA_SALADO_FRIO = new Set(["Palta", "Queso", "Queso untable", "Tomate", "Lechuga", "Atún"]);

export const HELADERA_PROTEINA_COCIDA = new Set(["Huevo", "Pollo", "Carne picada", "Carne de cerdo", "Pescado"]);

// Todo lo que no cae en las tres categorías de arriba (arroz, fideos, avena
// ya está en dulce, choclo, lentejas, garbanzos, verduras, etc.) se considera
// "cocinable": necesita cocción y no funciona como relleno de sandwich.
export function categoriaIngrediente(item) {
  if (HELADERA_DULCE.has(item)) return "dulce";
  if (HELADERA_SALADO_FRIO.has(item)) return "salado_frio";
  if (HELADERA_PROTEINA_COCIDA.has(item)) return "proteina_cocida";
  return "cocinable";
}

export function sugerirCombinacionLibre(seleccion) {
  if (seleccion.length < 2) return null;
  const lista = seleccion.join(", ");
  const cierre = "No tiene calorías exactas (no es una receta de la base), pero es una forma rápida de aprovechar justo lo que elegiste.";

  const tienePan = seleccion.includes("Pan");
  const otros = seleccion.filter((i) => i !== "Pan");
  const categorias = otros.map(categoriaIngrediente);
  const hayCocinable = categorias.includes("cocinable");
  const hayProteina = categorias.includes("proteina_cocida");
  const haySaladoFrio = categorias.includes("salado_frio");

  if (tienePan) {
    if (!hayCocinable && !hayProteina) {
      return `Con ${lista} arma un sandwich o unas tostadas: no hace falta cocinar nada, solo tostar el pan y poner el resto arriba o adentro. ${cierre}`;
    }
    if (!hayCocinable) {
      const aCocinar = otros.filter((i) => categoriaIngrediente(i) === "proteina_cocida").join(" y ");
      return `Con ${lista} arma un sandwich: cocina primero ${aCocinar}, tosta el pan, y ármalo con el resto arriba o adentro. ${cierre}`;
    }
    const paraCocinar = otros.filter((i) => categoriaIngrediente(i) === "cocinable" || categoriaIngrediente(i) === "proteina_cocida");
    const fresco = otros.filter((i) => categoriaIngrediente(i) === "dulce" || categoriaIngrediente(i) === "salado_frio");
    const extra = fresco.length > 0 ? ` Sumale ${fresco.join(" y ")} fresco, sin cocinar.` : "";
    return `El pan te sirve de acompañamiento; con ${paraCocinar.join(", ")} arma un salteado, guiso o ensalada tibia, cocinando todo junto con un poco de aceite, sal y las especias que tengas.${extra} ${cierre}`;
  }

  if (!hayCocinable && !hayProteina && !haySaladoFrio) {
    return `Con ${lista} arma un bowl o licuado dulce: mezcla todo (puedes licuar lo líquido junto con el resto, o servirlo en capas). ${cierre}`;
  }
  if (!hayCocinable && !hayProteina) {
    return `Con ${lista} arma una ensalada o plato frío: mezcla todo y condimenta con sal, limón y un chorrito de aceite de oliva. ${cierre}`;
  }
  const paraCocinar = otros.filter((i) => categoriaIngrediente(i) === "cocinable" || categoriaIngrediente(i) === "proteina_cocida");
  const fresco = otros.filter((i) => categoriaIngrediente(i) === "dulce" || categoriaIngrediente(i) === "salado_frio");
  const extra = fresco.length > 0 ? ` Sumale ${fresco.join(" y ")} fresco, sin cocinar.` : "";
  return `Con ${paraCocinar.join(", ")} puedes armar un salteado, guiso o ensalada tibia: cocina todo junto con un poco de aceite, sal y las especias que tengas.${extra} ${cierre}`;
}

export const CONSEJOS_BASE = [
  "Toma al menos 2 litros de agua por día, más si entrenas fuerte o hace calor.",
  "No saltees comidas para 'ahorrar' calorías: llegas con más hambre y comes peor a la noche.",
  "Un plato equilibrado: mitad vegetales, un cuarto proteína, un cuarto carbohidrato.",
  "Duerme bien: la falta de sueño afecta tanto la recuperación muscular como el apetito.",
];

export const CONSEJOS_POR_OBJETIVO = {
  bajar: [
    "Prioriza alimentos que dan saciedad con pocas calorías: vegetales, proteína magra, legumbres.",
    "No bajes de golpe muchas calorías: un déficit moderado se sostiene, uno extremo te hace comer mal a los pocos días.",
    "El hambre entre comidas suele ser sed o ansiedad, no siempre calorías de menos: toma agua antes de sumar un snack.",
  ],
  mantener: [
    "Prioriza proteína en cada comida (carne, pollo, huevo, yogur) para acompañar la calistenia.",
    "Elige carbohidratos con fibra (arroz, batata, avena, frutas) en vez de harinas refinadas.",
    "Deja espacio para grasas buenas: palta, frutos secos, aceite de oliva.",
  ],
  subir: [
    "No le tengas miedo a las calorías extra: suma un puñado de frutos secos o una fruta más si te cuesta llegar al objetivo.",
    "Prioriza carbohidratos y grasas de calidad para llegar a las calorías sin sentirte 'lleno' todo el día.",
    "Come más seguido en el día (5 comidas chicas) si te cuesta llegar al objetivo en 3 comidas grandes.",
  ],
};

export const NOMBRE_OBJETIVO = { bajar: "bajar de peso", mantener: "mantener tu peso", subir: "subir de peso" };

export function consejosPersonalizados(objetivo) {
  const especificos = CONSEJOS_POR_OBJETIVO[objetivo] || CONSEJOS_POR_OBJETIVO.mantener;
  return [...especificos, ...CONSEJOS_BASE];
}

export const COMIDAS_DEL_DIA = [
  { nombre: "Desayuno", pct: 0.25 },
  { nombre: "Almuerzo", pct: 0.35 },
  { nombre: "Merienda", pct: 0.1 },
  { nombre: "Cena", pct: 0.3 },
];

export function recomendarComida(totales, perfil) {
  const objetivo = perfil.objetivo || "mantener";
  const restanteKcal = perfil.kcal - totales.kcal;
  if (restanteKcal <= 50) {
    const mensajeLimite =
      objetivo === "subir"
        ? "Ya llegaste a tu objetivo de calorías de hoy. Si te queda margen, sumar algo más te ayuda a subir de peso más rápido."
        : "Ya llegaste a tu objetivo de calorías de hoy. Si tienes hambre, prioriza algo liviano en vegetales o proteína magra.";
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
      ? `Te quedan ${Math.round(restanteKcal)} kcal para llegar a tu objetivo de subir de peso. Suma algo con energía:`
      : objetivo === "bajar"
      ? `Te quedan ${Math.round(restanteKcal)} kcal hoy y estás más atrasado en ${etiqueta}. Opciones livianas que suman lo que falta:`
      : `Te quedan ${Math.round(restanteKcal)} kcal hoy y estás más atrasado en ${etiqueta}. Buenas opciones:`;
  return { mensaje: intro, sugerencias: candidatos };
}

export const NIVELES_ACTIVIDAD = [
  { id: "sedentario", label: "Sedentario (poco o nada de ejercicio)", factor: 1.2 },
  { id: "ligero", label: "Ligero (1-3 días/semana)", factor: 1.375 },
  { id: "moderado", label: "Moderado (3-5 días/semana)", factor: 1.55 },
  { id: "activo", label: "Activo (6-7 días/semana)", factor: 1.725 },
];

export const OBJETIVOS = [
  { id: "bajar", label: "Bajar de peso", ajuste: -0.15 },
  { id: "mantener", label: "Mantener peso", ajuste: 0 },
  { id: "subir", label: "Subir de peso / ganar músculo", ajuste: 0.15 },
];

export function calcularObjetivoDiario({ peso, altura, edad, sexo, actividad, objetivo }) {
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

export const NIVELES_ACTIVIDAD_MAP = NIVELES_ACTIVIDAD;

// ---------- NUTRICION ----------
export function ordenarRecetasPorObjetivo(objetivo) {
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
