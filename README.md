# 건물우수 — 건축물 우수관경 산정 PWA

> **Architect KIM MANMIN** — MANMIN-Ver2.0  
> KDS 31 30 35 : 2021 기반 건축물 옥상 우수관경 산정 시스템

## 🔗 바로 실행

👉 **[https://[your-username].github.io/[repo-name]/]()**

---

## 📲 PWA 설치 방법

| 플랫폼 | 방법 |
|--------|------|
| Android Chrome | 상단 `📲 설치` 버튼 또는 하단 배너 클릭 |
| iOS Safari | 공유 버튼(□↑) → "홈 화면에 추가" |
| PC Chrome/Edge | 주소창 우측 ⊕ 아이콘 클릭 |

설치 후 앱 이름: **건물우수**

---

## 📂 파일 구성

```
.
├── index.html              # 메인 앱
├── manifest.json           # PWA 매니페스트
├── sw.js                   # 서비스 워커 (오프라인 지원)
├── offline.html            # 오프라인 fallback 페이지
├── .nojekyll               # GitHub Pages Jekyll 비활성화
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-maskable-512x512.png
    └── apple-touch-icon.png
```

---

## 🚀 GitHub Pages 배포

1. 이 레포지토리를 **public** 으로 설정
2. `Settings → Pages → Source: main / root`
3. 저장 후 몇 분 뒤 URL 활성화
4. **HTTPS** 환경에서만 PWA 설치 가능 (GitHub Pages는 자동 HTTPS ✅)

---

## ⚙️ 기술 스택

- Vanilla HTML/CSS/JS (프레임워크 없음)
- PWA: Web App Manifest + Service Worker
- 오프라인 캐싱: Cache Storage API (stale-while-revalidate)
- 적용 기준: KDS 31 30 35 : 2021, 기상청 시간최대강우량

---

© Architect KIM MANMIN
