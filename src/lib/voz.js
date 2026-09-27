export function reproducirBeep() {
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

// Coach por voz: usa la síntesis de voz del navegador (sin costo, sin API
// externa) para poder entrenar sin mirar ni tocar la pantalla. Cancela lo que
// esté diciendo antes de hablar de nuevo para no acumular frases atrasadas
// cuando el ritmo de repeticiones es rápido.

// Busca entre las voces en español que ofrece el navegador/celular una que
// suene masculina por nombre (varía según el dispositivo: "Jorge", "Pablo",
// "Diego", "Carlos"...). Si no encuentra ninguna, se usa la voz por defecto
// pero igual se le baja el tono (ver utt.pitch en hablar()) para que suene
// más grave.
export let vozCoach = null;

export function elegirVozCoach() {
  try {
    if (!("speechSynthesis" in window)) return null;
    const voces = window.speechSynthesis.getVoices();
    if (!voces.length) return null;
    const esVoces = voces.filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
    const candidatas = esVoces.length ? esVoces : voces;
    const nombreMasculino = /jorge|pablo|diego|carlos|miguel|raul|raúl|juan|male|hombre/i;
    return candidatas.find((v) => nombreMasculino.test(v.name)) || candidatas[0] || null;
  } catch {
    return null;
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // Dispara la carga de voces del navegador apenas arranca la app: si se
  // llama a speak() antes de que las voces terminen de cargar (algo
  // frecuente en Chrome de escritorio), la primera frase se pierde en
  // silencio. La lista suele llegar de forma asíncrona (evento
  // "voiceschanged"), por eso se vuelve a elegir voz cuando eso pasa.
  window.speechSynthesis.getVoices();
  vozCoach = elegirVozCoach();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    vozCoach = elegirVozCoach();
  });
}

// Todas las voces en español que ofrece el navegador/celular, para el
// selector de "Cambiar voz". Varía mucho según el dispositivo: algunos
// tienen una sola, otros varias con distinto acento.
export function listarVocesEspanol() {
  try {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
  } catch {
    return [];
  }
}

// Voz elegida a mano por el usuario desde el selector: si está definida,
// gana por sobre la automática (vozCoach).
export let vozCoachManual = null;

export function fijarVozManual(voz) {
  vozCoachManual = voz || null;
}

export function hablar(texto) {
  try {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const decir = () => {
      const utt = new SpeechSynthesisUtterance(texto);
      utt.lang = "es-ES";
      utt.rate = 1.05;
      utt.pitch = 0.75;
      const voz = vozCoachManual || vozCoach;
      if (voz) utt.voice = voz;
      synth.speak(utt);
    };
    // Cancelar y hablar en el mismo instante deja la síntesis de voz
    // trabada en varios navegadores (sobre todo Chrome de escritorio): si
    // hay algo sonando o encolado, cancela y espera un toque antes de
    // decir la frase nueva.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(decir, 50);
    } else {
      decir();
    }
  } catch {
    // sin soporte de voz en el navegador; no rompe el resto del entrenamiento
  }
}

// Frases variadas para que el coach no diga siempre lo mismo en los mismos
// momentos (arranque, fin de serie, fin de descanso) — no cambia la voz en
// sí (eso depende del dispositivo), pero ayuda a que se sienta menos
// robótico y más como alguien alentando de verdad.
export const FRASES_ARRANQUE = ["¡A entrenar!", "¡Vamos!", "¡Dale que se puede!", "¡A darle!"];

export const FRASES_SERIE_COMPLETA = ["¡Bien ahí!", "¡Así se hace!", "¡Excelente serie!", "¡Vamos bien!"];

export const FRASES_REANUDAR = ["¡Comienza de nuevo!", "¡Dale, arrancamos!", "¡Vamos con todo!", "¡Una vuelta más!"];

export const FRASES_ANIMO_REP = ["¡vamos!", "¡dale!", "¡así!", "¡fuerza!", "¡seguí!"];

export function elegirAlAzar(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}
