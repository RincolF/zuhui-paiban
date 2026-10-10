const CACHE = 'zuhui-paiban-shell';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  e.respondWith((async () => {
    if (!isDoc) {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
    }
    try {
      const res = await fetch(req, isDoc ? { cache: 'no-cache' } : undefined);
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    } catch (err) {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      const shell = await caches.match('./index.html');
      if (shell && isDoc) return shell;
      return new Response('当前没有网络，请先联网打开一次。', {
        status: 503,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });
    }
  })());
});
