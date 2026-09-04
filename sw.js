/* ══════════════════════════════════════════════════════
   R25 회차 2026-09-04 — 자기 접두어 캐시 조회 · cors 프리캐시 · opaque 가드 · 캐시명 v5.0.3 (S10)
   건축물 우수관경 산정 시스템 — Service Worker v3.0
   MANMIN Architecture · KDS 31 30 35 : 2021
   ══════════════════════════════════════════════════════ */

/* §17-1 — 도구 고유 접두어. 'manmin-' 공통 접두어는 같은 origin 의 01~07·46 캐시까지 지운다 */
const PREFIX       = 'usu-';
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const SW_VERSION   = 'usu-v5.0.3';
/* 종전 접두어 잔재 — 한 번 지우고 나면 무해하다 */
const ORPHAN       = ['manmin-v5.0.1-static','manmin-v5.0.1-fonts','manmin-v5.0.1-dynamic','manmin-v5.0.0-static','manmin-v5.0.0-fonts','manmin-v5.0.0-dynamic'];
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
  './offline.html',
  /* v5.0 — 로컬 폴백 폰트. CDN 차단·오프라인 시 한글 깨짐 방지 (§4-4) */
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2'
];

/* ── 폰트 캐시 URL 패턴 ── */
const FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
  /* v5.0 — Pretendard(jsdelivr) 제거. 본문 폰트를 Noto Sans KR 로 교체했다 */
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
            cache.add(mmReq(url)).catch(err =>
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
            (mmOwn(key) || ORPHAN.includes(key)) &&
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
