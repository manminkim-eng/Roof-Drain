/* ══════════════════════════════════════════════════════
   건축물 우수관경 산정 시스템 — Service Worker v3.0
   MANMIN Architecture · KDS 31 30 35 : 2021
   ══════════════════════════════════════════════════════ */

const SW_VERSION   = 'manmin-v3.0.0';
const CACHE_STATIC = `${SW_VERSION}-static`;
const CACHE_FONTS  = `${SW_VERSION}-fonts`;
const CACHE_DYNAMIC= `${SW_VERSION}-dynamic`;

/* ── 정적 캐시 목록 (반드시 사전 캐싱) ── */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/brand-icon.jpg',
  './offline.html'
];

/* ── 폰트 캐시 URL 패턴 ── */
const FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net'
];

/* ── CDN 스크립트 패턴 ── */
const CDN_ORIGINS = [
  'https://cdnjs.cloudflare.com'
];

/* ════════════ INSTALL ════════════ */
self.addEventListener('install', event => {
  console.log(`[SW] Installing ${SW_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Precaching static assets...');
        /* 각 URL 개별 처리 — 실패해도 전체 중단 방지 */
        return Promise.allSettled(
          PRECACHE_URLS.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Precache failed: ${url}`, err)
            )
          )
        );
      })
      .then(() => {
        console.log('[SW] Precache complete');
        return self.skipWaiting(); /* 즉시 활성화 */
      })
  );
});

/* ════════════ ACTIVATE ════════════ */
self.addEventListener('activate', event => {
  console.log(`[SW] Activating ${SW_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('manmin-') &&
            ![CACHE_STATIC, CACHE_FONTS, CACHE_DYNAMIC].includes(key)
          )
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) /* 즉시 페이지 제어 */
  );
});

/* ════════════ FETCH ════════════ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* ── 비-GET 요청 무시 ── */
  if (request.method !== 'GET') return;

  /* ── chrome-extension 등 무시 ── */
  if (!request.url.startsWith('http')) return;

  /* ── 전략 분기 ── */
  if (isFontRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_FONTS));
  } else if (isCdnRequest(url)) {
    event.respondWith(cacheFirst(request, CACHE_DYNAMIC, 7 * 24 * 60 * 60));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNav(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC, 24 * 60 * 60));
  } else {
    event.respondWith(networkFirst(request));
  }
});

/* ════════════ 전략 함수들 ════════════ */

/* Cache-First: CDN/정적 파일용 */
async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const dateHeader = cached.headers.get('date');
    if (dateHeader && maxAgeSeconds) {
      const age = (Date.now() - new Date(dateHeader).getTime()) / 1000;
      if (age < maxAgeSeconds) return cached;
    } else {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached || createOfflineResponse(request);
  }
}

/* Network-First: 동적 콘텐츠용 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_DYNAMIC);
    const cached = await cache.match(request);
    return cached || createOfflineResponse(request);
  }
}

/* Network-First (Navigation): HTML 페이지용 */
async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /* 오프라인: 캐시된 index.html 반환 */
    const cache = await caches.open(CACHE_STATIC);
    const cached =
      await cache.match(request) ||
      await cache.match('./index.html') ||
      await cache.match('./offline.html');
    return cached || new Response('<h1>오프라인 상태입니다</h1>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

/* Stale-While-Revalidate: 폰트용 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

/* ════════════ 판별 함수들 ════════════ */

function isFontRequest(url) {
  return FONT_ORIGINS.some(origin => url.href.startsWith(origin));
}

function isCdnRequest(url) {
  return CDN_ORIGINS.some(origin => url.href.startsWith(origin));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isStaticAsset(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|css|js|json)$/i.test(url.pathname);
}

function createOfflineResponse(request) {
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(request.url);
  if (isImage) {
    /* 1x1 투명 PNG */
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
  }
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}

/* ════════════ MESSAGE 핸들러 ════════════ */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received');
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.ports[0]?.postMessage({ success: true }));
  }
});

/* ════════════ SYNC (Background Sync) ════════════ */
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
  }
});

/* ════════════ PUSH (향후 알림용) ════════════ */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || '건물우수', {
      body: data.body || '업데이트가 있습니다.',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-96x96.png',
      tag: 'manmin-update',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('./index.html');
      })
  );
});

console.log(`[SW] ${SW_VERSION} loaded`);
