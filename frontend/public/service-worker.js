// public/service-worker.js
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/favicon.ico',
          '/static/js/bundle.js',
          '/static/js/main.chunk.js',
          '/static/js/0.chunk.js',
          '/static/css/main.chunk.css',
          // add other assets as needed
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  