const CACHE_NAME = 'control-voley-v1';
const ASSETS = [
  './',
  './index.html',
  './index_menu.html',
  './index_atletas.html',
  './index_datos.html',
  './index_ficha.html',
  './index_cumple.html',
  './index_estad.html',
  './img/banner.png'
];

// Instalación: Guardar archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Estrategia de carga: Primero caché, luego red
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
