// WeCare 2.0 — Service Worker
// Works fully offline, while online users always get the latest content.
//
// Strategy:
//   • HTML / JS / CSS / manifest → network-first (fresh when online, cached copy when offline)
//   • Fonts / images             → cache-first (they rarely change)
//
// Bump CACHE_NAME whenever files change so old caches are cleaned up.

const CACHE_NAME = 'wecare-v10';

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
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png',
];

// ── Install: pre-cache everything ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches and take control immediately ──────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Helpers ────────────────────────────────────────────────────────────────
function putInCache(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
  }
  return response;
}

function networkFirst(request) {
  return fetch(request)
    .then(response => putInCache(request, response))
    .catch(() =>
      caches.match(request, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
    );
}

function cacheFirst(request) {
  return caches.match(request).then(cached =>
    cached || fetch(request).then(response => putInCache(request, response))
  );
}

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let the browser handle it

  const isAppShell =
    request.mode === 'navigate' ||
    /\.(html|js|css|json)$/.test(url.pathname) ||
    url.pathname.endsWith('/');

  event.respondWith(isAppShell ? networkFirst(request) : cacheFirst(request));
});
