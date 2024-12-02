const CACHE_NAME = 'moms-games-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/sounds/click.mp3',
  '/sounds/success.mp3',
  '/icon.png',
  'https://cdn.jsdelivr.net/npm/pinyin-pro@3.18.5/dist/index.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 