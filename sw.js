const CACHE = 'rehabflow-v3.7.6';
const ASSETS = [
  './',
  './index.html',
  './core.js',
  './i18n.js',
  './exdb.js',
  './sync.js',
  './fizjo.html',
  './prywatnosc.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// stale-while-revalidate: szybki start z cache, ciche odświeżenie w tle
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // ignoreSearch: skróty PWA (?action=...) muszą trafiać w cache index.html offline
  const sameOrigin = e.request.url.startsWith(self.location.origin);
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: sameOrigin }).then(cached => {
        const fetched = fetch(e.request).then(resp => {
          if (resp && resp.ok && (e.request.url.startsWith(self.location.origin) || resp.type === 'cors')) {
            cache.put(e.request, resp.clone());
          }
          return resp;
        }).catch(() => cached);
        return cached || fetched;
      })
    )
  );
});

// Powiadomienia push
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(data.title || '🏃 RehabFlow', {
      body: data.body || 'Czas na ćwiczenia!',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'rehabflow-reminder',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
