const CACHE_NAME = "oba-intranet-v222";

// Instalación instantánea: sin APP_SHELL, el caché se llena en runtime.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim()).then(() => {
      // Tell all open tabs to reload so they get fresh assets
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "SW_UPDATED" }));
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// Estrategia:
// - HTML (navegación): red primero con no-store (siempre fresco; decide qué
//   versiones de app.js/styles.css se cargan), caché solo como fallback offline.
// - Todo lo demás: stale-while-revalidate — se sirve al instante desde caché
//   y se actualiza en segundo plano. Los assets propios van versionados con
//   ?v=, así que servir caché nunca mezcla versiones: el index.html fresco
//   referencia URLs nuevas que aún no están cacheadas y van a red.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isHTML = event.request.mode === "navigate" ||
    url.pathname.endsWith(".html") || url.pathname.endsWith("/");

  if (isHTML) {
    event.respondWith(
      fetch(event.request.url, { cache: "no-store", credentials: "same-origin" })
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        // Las respuestas opacas (CDNs sin CORS: Firebase SDK, fuentes, iconos)
        // también se cachean: se revalidan en cada visita, así que un error
        // cacheado se autocorrige en la siguiente carga.
        if (response && (response.status === 200 || response.type === "opaque")) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
