const CACHE_NAME = 'mipha-companion-rc4-firebase-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css?v=rc4',
  './theme-light.css?v=rc4',
  './app.js?v=rc4',
  './styles-mobile.css',
  './firebase-init.js?v=rc4',
  './attendance-engine.js?v=rc4',
  './config.js?v=rc4',
  './manifest.json',
  './logo.png',
  './moncer-white.png',
  './moncer-blue.png',
  './moncer-grey.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
