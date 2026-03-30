# 🏗️ 건축물 우수관경 산정 시스템 MANMIN-Ver2.0

> KDS 31 30 35 : 2021 기준 · 기상청 시간최대강우량 적용

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deployed-green)](https://pages.github.com/)

## 📲 설치 방법

### Android / PC (Chrome · Edge)
1. 브라우저에서 앱 열기
2. **"앱 설치"** 배너 → **설치하기** 클릭
3. 또는 주소창 오른쪽 **⊕** 아이콘 클릭

### iOS (Safari)
1. Safari에서 앱 열기
2. 하단 **공유 버튼** (□↑) 탭
3. **홈 화면에 추가** 탭
4. 오른쪽 상단 **추가** 탭

---

## 📁 파일 구조

```
/
├── index.html          # 메인 앱
├── sw.js               # Service Worker v3.0
├── manifest.json       # PWA 매니페스트
├── offline.html        # 오프라인 폴백 페이지
├── favicon.ico         # 파비콘
├── .nojekyll           # GitHub Pages Jekyll 비활성화
├── _config.yml         # GitHub Pages 설정
└── icons/
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-48x48.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png       # MS Tile
    ├── icon-152x152.png       # iOS iPad
    ├── icon-192x192.png       # Android
    ├── icon-384x384.png
    ├── icon-512x512.png       # Splash
    ├── icon-maskable-512.png  # Adaptive Icon
    ├── apple-touch-icon.png   # iOS (180×180)
    ├── brand-icon.jpg         # 헤더 브랜드 로고
    ├── favicon-16.png
    └── favicon-32.png
```

---

## ⚙️ Service Worker 전략

| 리소스 유형 | 캐시 전략 |
|-----------|---------|
| HTML 페이지 | Network First |
| 정적 자산 (JS/CSS/PNG) | Cache First |
| Google Fonts / Pretendard | Stale-While-Revalidate |
| CDN 라이브러리 | Cache First (7일) |

---

## 🖥️ 반응형 지원

| 화면 | 너비 |
|-----|------|
| 데스크탑 | ≥ 1100px |
| 태블릿 | 768px – 1099px |
| 모바일 | < 768px |

---

## 🚀 GitHub Pages 배포

```bash
# 1. 저장소 생성 후 파일 업로드
git init
git add .
git commit -m "chore: PWA v3.0 파일셋 초기 배포"
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main

# 2. GitHub 저장소 → Settings → Pages
#    Source: Deploy from a branch → main / (root)
```

---

## 📋 개발 스펙

- **기준법령**: KDS 31 30 35 : 2021
- **강우 데이터**: 기상청 시간최대강우량
- **PWA 버전**: v3.0 (데스크탑/태블릿/모바일 통합)
- **Service Worker**: v3.0.0
- **오프라인 지원**: ✅

---

*© ARCHITECT KIM MANMIN — All rights reserved*
