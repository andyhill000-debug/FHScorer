const CACHE_NAME = 'hillfred-500-scorer-v3.11.1';
const urlsToCache = [
  '/FHScorer/',
  '/FHScorer/index.html',
  '/FHScorer/manifest.json',
  '/FHScorer/Icons/icon-32.png',
  '/FHScorer/Icons/icon-76.png',
  '/FHScorer/Icons/icon-120.png',
  '/FHScorer/Icons/icon-152.png',
  '/FHScorer/Icons/icon-180.png',
  '/FHScorer/Icons/icon-192.png',
  '/FHScorer/Icons/icon-512.png'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // Network failed, return cached index.html as fallback
          return caches.match('/FHScorer/index.html');
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
