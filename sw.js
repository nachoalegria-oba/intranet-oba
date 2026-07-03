const CACHE_NAME = "oba-intranet-v203";

// Empty APP_SHELL so install completes instantly and skipWaiting() always fires.
// All caching happens at runtime via the fetch handler (network-first).
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => caches.delete(key))
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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // HTML/JS/CSS must always bypass the browser HTTP cache: stale heuristic
  // cache entries (from before no-cache headers existed) can pin clients
  // to old versions forever. Icons/fonts/images keep the default cache mode.
  const url = new URL(event.request.url);
  const isAppAsset = url.origin === location.origin &&
    (event.request.mode === "navigate" || /\.(?:html|js|css)$/.test(url.pathname) || url.pathname.endsWith("/"));
  const req = isAppAsset ? new Request(event.request, { cache: "no-store" }) : event.request;
  event.respondWith(
    fetch(req).then((response) => {
      if (!response || response.status !== 200 || response.type === "opaque") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
