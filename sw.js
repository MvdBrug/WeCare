// WeCare 2.0 — Service Worker
// Caches all app assets for full offline use

const CACHE_NAME = 'wecare-v1';

// All files to cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './app.css',
  './app.js',
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

// ── Font cache (separate from app cache) ───────────────────────────────────
const FONT_CACHE = 'wecare-fonts-v1';

// ── Activate: delete old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first strategy ────────────────────────────────────────────
// Serve from cache if available; fall back to network and cache the response.
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin or Google Fonts
  if (event.request.method !== 'GET') return;

  // Cache Google Fonts separately with a long-lived cache
  if (event.request.url.startsWith('https://fonts.')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

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
