const CACHE_NAME = 'mipha-companion-rc5-network-first-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css?v=rc5',
  './theme-light.css?v=rc5',
  './app.js?v=rc5',
  './styles-mobile.css',
  './firebase-init.js?v=rc5',
  './attendance-engine.js?v=rc5',
  './config.js?v=rc5',
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
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isCoreAppRequest = event.request.mode === 'navigate' ||
    ['/', '/index.html', '/app.js', '/config.js', '/firebase-init.js', '/attendance-engine.js', '/styles.css', '/theme-light.css', '/styles-mobile.css', '/sw.js'].includes(url.pathname);

  if (isCoreAppRequest) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.ok && url.pathname !== '/sw.js') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }
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
