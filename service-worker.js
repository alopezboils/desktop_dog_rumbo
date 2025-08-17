const CACHE_NAME = 'rumbo-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-72.png',
  './icon-192.png',
  './icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepción de requests
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - devolver respuesta del cache
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          function(response) {
            // Verificar si recibimos una respuesta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clonar la respuesta para cache
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
    );
});

// Manejar notificaciones push (opcional)
self.addEventListener('push', function(event) {
  if (event.data) {
    const title = 'Rumbo te extraña';
    const options = {
      body: '¡Tu mascota virtual quiere jugar contigo!',
      icon: './icon-192.png',
      badge: './icon-72.png',
      tag: 'rumbo-notification'
    };
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});
