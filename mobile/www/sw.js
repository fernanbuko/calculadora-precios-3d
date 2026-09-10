// Service Worker de "Calculadora de precios · Impresión 3D"
// Guarda una copia de la app para que abra sin internet una vez instalada/visitada.

const CACHE_NAME = 'calculadora-precios-3d-v1';
const ARCHIVOS_A_GUARDAR = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ARCHIVOS_A_GUARDAR.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estrategia "network first, cache fallback": intenta traer la versión más
// nueva de internet; si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const esMismoOrigen = url.origin === self.location.origin;
  const esGet = event.request.method === 'GET';
  if(!esMismoOrigen || !esGet){
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});
