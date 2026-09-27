// Service worker mínimo: solo existe para que el navegador ofrezca "instalar"
// la app (PWA). No precachea nada (así nunca sirve JS/CSS viejo después de un
// deploy): siempre pide primero a la red, y solo si no hay conexión devuelve
// lo último que haya quedado guardado en caché de una visita anterior.
//
// Solo se guardan archivos de la propia app (mismo origen) y respuestas OK:
// antes se cacheaba todo, incluidas las respuestas de Supabase con los datos
// personales del usuario (quedaban en el celular aunque cerrara sesión) y las
// respuestas de error.
const CACHE = "calistenia-runtime-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copia));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
