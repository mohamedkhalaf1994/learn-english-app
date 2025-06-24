const cacheName = 'learn-english-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/translation.html',
  '/archive.html',
  '/test.css',
  '/script.js',
  '/manifest.json',
  '/imges/colorful-owl-holding-open-book-represents-education-wisdom-joy-learning-great-educational-platforms-375961856.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
