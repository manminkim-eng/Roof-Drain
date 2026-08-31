# 🌧️ 건축물 우수관경 산정 시스템 — MANMIN **Ver 5.0**

> **Developer MANMIN** | ㈜대성건축사사무소
> **KDS 31 30 35 : 2021** (국토교통부고시 제2021-203호) 기준 옥상 우수관경 산정 PWA
> 수직관 · 수평관 · 반원형 빗물받이 자동 산정 + 기상청 시간최대강우량 반영

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-배포됨-blue)](https://manminkim-eng.github.io/Roof-Drain)
[![PWA](https://img.shields.io/badge/PWA-지원-green)](https://web.dev/progressive-web-apps/)
[![KDS](https://img.shields.io/badge/기준-KDS_31_30_35_:_2021-navy)](https://www.kcsc.re.kr)

---

## 🆕 Ver 5.0 — MANMIN WAP 디자인 통일 (2026-08-31)

MANMIN WAP 39종 디자인 통일 작업의 **기계설비 계열 기준본**이다.
마스터는 01 옥내소화전(`fire-hydrant-calc`) Ver 5.0이며, 여기서 확정한 패턴이
21 위생배관 · 22 냉온수배관 · 24 설비펌프 · 25 급탕설비 · 26 환기설비에 복제된다.

> **계산 로직은 1바이트도 변경하지 않았다.** 관경 산정식·상수·강우량 데이터·법령 인용문 모두 Ver 2.0과 동일하다.
> 핵심 계산 함수 `doCalc()` 의 숫자 토큰 다중집합이 완전히 일치함을 검증했다.
> 변경 범위는 `<style>` 블록 · 출력 래퍼 · 폰트 토큰 · 버전 문자열 넷뿐이다.

### 조정 내역

| # | 항목 | 기존 (Ver 2.0) | 변경 (Ver 5.0) |
|---|------|---------------|---------------|
| ① | **본문 폰트** | `Pretendard` — jsDelivr CDN 의존 | **`Noto Sans KR`** + 로컬 woff2 동봉 → 오프라인·차단망에서도 한글 유지 |
| ② | **전역 셀렉터** | `*{font-family:…!important}` — 모든 요소 강제 | 소방과 같은 **태그 목록**으로 축소 (화면·인쇄 양쪽) |
| ③ | **고정폭 폰트** | `JetBrains Mono` 48곳 선언, 유니버설 `*` 에 덮여 **화면에서 미적용** | ②의 결과로 **화면에서도 실제 적용** |
| ④ | **A4 여백** | `@page margin:12mm 10mm 14mm` | **`14mm 12mm 22mm 14mm`** — 39종 공통, 유효영역 **184 × 261mm** |
| ⑤ | **인쇄 폭** | `@page margin` + `.a4-page` 자체 padding 이중 적용 | `.a4-page` 폭·패딩 **해제** → 여백을 `@page` 하나로 일원화 |
| ⑥ | **하단 각인** | 없음 (마지막 장 footer 만) | `.dev-stamp` 를 `position:fixed` 로 → **매 페이지 출력** |
| ⑦ | **모바일 JPG** | `exportMobileJPG()` — S24 프레임(`#mob-device`)을 다크배경 캡처 | **MANMIN JPG 저장 v5.4** 이식 — 인쇄와 **동일 DOM**(`#a4-page`) 캡처 |
| ⑧ | **모바일 미리보기 탭** | 별도 탭 + 이중 출력 경로 | **삭제** — 출력 경로를 하나로 통일 (약 15KB 감소) |
| ⑨ | **출력 버튼** | 헤더 `🖨️ 출력` + A4 탭 `🖨️ A4 인쇄` | `.mm-btn` 규격 v5.1 — **A4 탭 한 곳으로 일원화** |
| ⑩ | **헤더 구조** | 1줄 (로고 + 타이틀 13px + 부제 9px) · 58px | **3단** (eyebrow 11 · h1 26 · 부제+각인) · **162.2px** |
| ⑪ | **탭** | 11px / 700 / padding 8·12 | **13px / 700 / padding 11·16** → 높이 44px |
| ⑫ | **A4 미리보기 스케일** | 데스크탑 `transform-origin:top center` | 전 구간 **`top left` + `translateX(offset)`** — 마스터 검증식 |
| ⑬ | **FAB** | 드래그 이동형 원형 단일 + 툴팁 | **고정 세로스택** `.fab-wrap` — 아이콘 20 / 라벨 10 / 부제 9 |
| ⑭ | **브레이크포인트** | **12종** (1100·840·760·600·520·460·400·380·360 등) | **규격 6종** — 1024 · 860 · 768 · 640 · 480 · 420 |
| ⑮ | **표 스크롤** | `.twrap` 만, 힌트 없음 | `.tbl-hint` 추가 (≤768px) · `.rtbl{min-width:560px}` — 압축 대신 스크롤 |
| ⑯ | **버전 체계** | Ver2.0 / `manmin-v3.0.0` | **Ver-5.0 / `manmin-v5.0.0`** (전 39종 5.0에서 재출발) |

### MANMIN A4 규격 (전 39종 공통)

| 항목 | 값 |
|------|-----|
| 용지 | A4 portrait 210 × 297mm |
| 여백 | 상 14 · 우 12 · 하 22 · 좌 14mm |
| 유효 영역 | **184 × 261mm** |
| 하단 각인 | `MANMIN · Ver-5.0` · Orbitron 8pt · `#9CA3AF` · 우측 하단 · 매 페이지 |
| 분야 주도색 | 기계설비 `#0E7490` *(이관 대기 — 의미색과 얽혀 있어 39종 일괄 결정 시 적용)* |

### 버전 표기 3형식

| 형식 | 표기 | 사용처 |
|---|---|---|
| 문장형 | `MANMIN Ver-5.0` | `<title>` · 계산서 각주 · manifest |
| 각인형 | `MANMIN · Ver-5.0` | 헤더 각인 · `.dev-stamp` |
| 기계형 | `MANMIN-Ver5.0` | `#mm-print-stamp` · `var VER` (JPG 파일명) |

### JPG 저장 동작

```
우수관경_{공사명}_{YYYYMMDD}[_n].jpg
```

`MM_JPG_CONFIG = { zone:'#a4-page', name:'우수관경', prepare:'renderA4' }`

**바닐라 JS 계열이므로 `prepare` 에 계산서 빌드 함수명(`renderA4`)을 지정한다.**
React 계열(46 설계하중 등)의 `null` 을 그대로 쓰면 캡처 시점에 계산서가 비어 있을 수 있다.

`.page-break` 를 경계로 페이지를 나눠 A4 비율 이미지를 장수만큼 저장하며,
인쇄 쪽나눔과 같은 경계를 쓰므로 **PDF와 JPG의 페이지 구성이 일치**한다.

### 근거 기준

| 구분 | 내용 |
|------|------|
| 관경 산정 | **KDS 31 30 35 : 2021** 4.4.1 ~ 4.4.4 (국토교통부고시 제2021-203호) |
| 강우량 | 기상청 기후통계분석 1991~2020 평년값 · 시간최대강우량 |
| 출처 | 국가건설기준센터 `kcsc.re.kr` — KDS·KCS는 LawMCP 범위 밖 |

### 백업

| 파일 | 내용 |
|------|------|
| `index_백업_2026-08-31_원본.html` | v5.0 작업 직전 원본 (배포본과 SHA 일치 확인분) |
| `../../버전s-2.0/pwa-manmin/` | Ver 2.0 폴더 전체 **무변경 보존** |

---

## 📁 파일 구성

```
📦 Roof-Drain/
├── 📄 index.html          # 메인 앱
├── 📄 manifest.json       # PWA 매니페스트
├── 📄 sw.js               # Service Worker (manmin-v5.0.0)
├── 📄 offline.html        # 오프라인 폴백
├── 📄 favicon.ico · _config.yml · .nojekyll · .gitignore
├── 📁 assets/fonts/       # 로컬 폴백 폰트 (v5.0 신규)
│   ├── manmin-fonts.css
│   └── NotoSansKR-var.woff2
└── 📁 icons/              # 앱 아이콘
```

## 🚀 배포 시 주의 (작업지시서 §6)

| # | 항목 |
|---|---|
| 1 | 업로드 직전 **`Thumbs.db` 삭제** — 폴더를 열면 Windows 가 생성한다 |
| 2 | **`.nojekyll` 은 드래그로 안 올라간다** → `Add file → Create new file` 별도 커밋 |
| 3 | 업로드 후 **전 파일 blob SHA 대조** |

---

*MANMIN · Roof Rainwater Drain Pipe Sizing · Ver 5.0*
