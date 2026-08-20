// اسم ذاكرة التخزين المؤقت
const CACHE_NAME = 'successtime-v1.0.0';

// الملفات التي سيتم تخزينها للعمل بدون إنترنت
const urlsToCache = [
  '/Time-of-success/',
  '/Time-of-success/index.html',
  '/Time-of-success/manifest.json',
  'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/svg/1f4c8.svg'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker وحذف التخزين المؤقت القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف التخزين المؤقت القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استرجاع الملفات من التخزين المؤقت أو من الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/Time-of-success/index.html');
        }
      })
  );
});

// تحديث التخزين المؤقت تلقائياً
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
