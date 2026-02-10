const CACHE_NAME = 'control-voley-v7';

// Lista de archivos basada en tu versión estable [cite: 2025-12-04]
const ASSETS = [
  './',
  './index.html',
  './index_estad.html',
  './index_menu.html',
  './index_atletas.html',
  './index_datos.html',
  './index_ficha.html',
  './index_cumple.html',
  './manifest.json',
  './libs/tailwind.js',
  './libs/charts.js',
  './img/logo.png'
];

// 1. INSTALACIÓN: Guarda los archivos en el dispositivo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Instalando archivos en caché...');
      // Intentamos guardar cada archivo; si uno falla (404), no bloquea a los demás
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.warn('Archivo no encontrado, saltando:', url));
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. ACTIVACIÓN: Limpia versiones antiguas de la App
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. INTERCEPCIÓN (FETCH): El motor para el funcionamiento offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el archivo está en el caché del dispositivo, lo entrega de inmediato
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está, intenta buscarlo en internet
      return fetch(event.request).catch(() => {
        // Si no hay internet y es una página (navegación), entrega el index.html por defecto
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
