// ==========================================
// SERVICE WORKER (sw.js) - Complete Code
// ==========================================

// കാഷെ വേർഷൻ മാറ്റുമ്പോൾ പഴയ കാഷെ ക്ലിയർ ചെയ്യപ്പെടും
const CACHE_NAME = 'smart-madrasa-v2';

// കാഷെ ചെയ്യേണ്ട പ്രധാന ഫയലുകൾ
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './images.png',
  './manifest.json'
];

// 1. Install Event: ഫയലുകൾ പുതിയ കാഷെയിലേക്ക് മാറ്റുന്നു
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // പുതിയ സർവീസ് വർക്കർ ഉടൻ തന്നെ ആക്റ്റീവ് ആകാൻ
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: പഴയ വേർഷൻ കാഷെകൾ (v1 പോലെയുള്ളവ) നീക്കം ചെയ്യുന്നു
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // നിലവിലുള്ള പേജുകളിലെല്ലാം പുതിയ സർവീസ് വർക്കർ ഉടൻ കൺട്രോൾ എടുക്കാൻ
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: നെറ്റ്‌വർക്കിൽ നിന്ന് പുതിയ ഫയലുകൾ ലഭിക്കുമെങ്കിൽ അത് ഉപയോഗിക്കുന്നു (Network First / Cache Fallback Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // നെറ്റ്‌വർക്കിൽ നിന്ന് പുതിയ ഡാറ്റ ലഭിച്ചാൽ അത് ബ്രൗസറിലേക്ക് കൊടുക്കുകയും കാഷെ അപ്ഡേറ്റ് ചെയ്യുകയും ചെയ്യുന്നു
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // ഇൻ്റർനെറ്റ് ഇല്ലെങ്കിൽ മാത്രം കാഷെയിലുള്ള ഡാറ്റ കാണിക്കുന്നു
        return caches.match(event.request);
      })
  );
});
