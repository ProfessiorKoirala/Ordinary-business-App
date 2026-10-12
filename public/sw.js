// Service Worker Kill Switch - v3
// This version is designed to clear all caches and bypass caching for all requests
// to resolve blank screen issues caused by aggressive caching in previous versions.

self.addEventListener('install', (event) => {
  console.log('[SW] Install: Skipping waiting');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate: Clearing all caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All caches cleared, claiming clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch from network, do not use cache
  event.respondWith(fetch(event.request).catch(() => {
    // Fallback for offline if absolutely necessary, but for a kill switch, 
    // we prefer network-only to ensure the latest version is always served.
    return caches.match(event.request);
  }));
});
