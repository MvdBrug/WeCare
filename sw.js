// WeCare 2.0 — Service Worker
// Caches all app assets for full offline use

const CACHE_NAME = 'wecare-v5';

// All files to cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './fonts.css',
  './fonts/blinker-400.woff2',
  './fonts/blinker-600.woff2',
  './fonts/blinker-700.woff2',
  './fonts/ibm-300.woff2',
  './fonts/ibm-400.woff2',
  './fonts/ibm-400i.woff2',
  './fonts/ibm-500.woff2',
  './fonts/ibm-600.woff2',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png',
];

// ── Install: pre-cache everything ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Fonts are now served locally — no special handling needed

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        // Not in cache — fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache successful responses (not opaque/error)
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            // Don't cache chrome-extension or other non-http(s) requests
            if (!event.request.url.startsWith('http')) return response;

            const toCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, toCache);
            });
            return response;
          })
          .catch(() => {
            // Offline and not cached — return offline page if it's a navigation
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
