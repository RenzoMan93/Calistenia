// Service worker mínimo: solo existe para que el navegador ofrezca "instalar"
// la app (PWA). No precachea nada (así nunca sirve JS/CSS viejo después de un
// deploy): siempre pide primero a la red, y solo si no hay conexión devuelve
// lo último que haya quedado guardado en caché de una visita anterior.
const CACHE = "calistenia-runtime-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copia));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
