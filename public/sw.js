// Service Worker: Offline-Nutzung + Push-Erinnerungen.
// Bei größeren Änderungen die Versionsnummer erhöhen (v2 -> v3).
const CACHE = 'fit45-next-v2';
// Beim lokalen Testen (localhost / WLAN-IP) nichts zwischenspeichern
const LOCAL = /^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)$/.test(self.location.hostname);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (LOCAL || req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match('/')))
  );
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { /* egal */ }
  e.waitUntil(self.registration.showNotification(d.title || 'Mein 45-Tage-Weg', {
    body: d.body || 'Zeit für dein Training.',
    icon: '/icons/icon-192.png',
    badge: '/icons/favicon-32.png',
    tag: 'daily-reminder',
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
