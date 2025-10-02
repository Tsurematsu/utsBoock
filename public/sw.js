const CACHE_NAME = "mi-app-cache-v1";

// Instalación inicial: guardamos la página principal
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.add("/"); // al menos cachea el index.html
    })
  );
});

// Interceptar peticiones y cachearlas dinámicamente
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(respuesta => {
      if (respuesta) {
        return respuesta; // si ya está cacheado
      }
      return fetch(event.request).then(res => {
        // evitar cachear cosas raras (peticiones externas, etc.)
        if (!res || res.status !== 200 || res.type !== "basic") {
          return res;
        }
        // clonar la respuesta
        const resClonada = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClonada);
        });
        return res;
      }).catch(() => {
        // Si falla la red y no está cacheado
        return caches.match("/"); // devolvemos index.html como fallback
      });
    })
  );
});

// Activación: borrar cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
