# STAY LUXE - Experience-First Premium Curation Platform

STAY LUXE는 단순한 숙박 예약을 넘어, 지역의 행사와 특별한 경험을 중심으로 숙소를 큐레이션하는 프리미엄 여행 플랫폼 예제입니다. `@dooboostore/simple-web-component`를 사용하여 현대적이고 규모감 있는 SPA(Single Page Application)로 구축되었습니다.

## 🌟 핵심 컨셉 (Experience-First)

"어디로 갈까?"가 아닌 **"무엇을 할까?"**에서 시작하는 여행을 지향합니다. 지역의 축제, 전시, 로컬 이벤트를 먼저 탐색하고 그 경험을 완성하기 위한 최적의 숙소를 연결합니다.

## 🏨 주요 기능

### 1. 경험 중심 랜딩 페이지
- **이벤트 큐레이션:** 현재 가장 핫한 지역 행사와 축제를 메인에서 즉시 확인
- **테마별 탐색:** 뮤직 페스티벌, 미식 투어, 웰니스 등 사용자 취향에 따른 카테고리 분류
- **감성적 UI:** 프리미엄 브랜드 아이덴티티를 반영한 현대적인 디자인과 반응형 레이아웃

### 2. 하이브리드 리스트 & 인터랙티브 맵
- **실시간 필터링:** 가격 범위, 숙소 유형, 편의시설 등을 선택하면 리스트와 지도가 동시에 업데이트
- **마커 연동:** Leaflet.js를 활용하여 필터링된 숙소 위치를 실시간으로 지도에 표시
- **스마트 줌:** 검색 결과에 따라 지도의 중심점과 확대 레벨이 자동으로 최적화

### 3. 고도화된 숙소 상세 정보
- **프리미엄 갤러리:** 에어비앤비 스타일의 5분할 그리드 레이아웃으로 숙소 사진 노출
- **객실 구조도(Floor Plan):** 실제 건축 도면/3D 평면도를 통해 숙소의 내부 구조 시각화
- **로컬 경험 매칭:** 해당 숙소 인근에서 즐길 수 있는 행사 정보를 자동으로 매칭하여 추천
- **리뷰 시스템:** 실제 사용자의 생생한 후기와 평점을 2열 그리드 레이아웃으로 확인
- **스티키 예약 위젯:** 스크롤에 관계없이 가격 정보 확인 및 예약 액션 가능

## 🏗️ 프로젝트 구조

```
src/
├── components/           # UI 컴포넌트
│   ├── AppHeader.ts          # 전역 공통 헤더 (반응형)
│   ├── AppMap.ts             # Leaflet 기반 전문 지도 컴포넌트
│   ├── AccommodationCard.ts  # 숙소 정보 카드 (Hover 애니메이션)
│   └── index.ts              # 컴포넌트 팩토리 export
│
├── pages/                # 페이지 컴포넌트 (SPA)
│   ├── LandingPage.ts        # 행사 중심 랜딩 페이지
│   ├── ListPage.ts           # 검색 결과 (목록 + 지도 하이브리드)
│   ├── DetailPage.ts         # 숙소 상세 (갤러리, 도면, 주변 행사 연동)
│   ├── EventDetailPage.ts    # 행사 상세 (행사 정보 + 인근 숙소 추천)
│   └── index.ts              # 페이지 팩토리 export
│
├── services/             # 비즈니스 로직 & 데이터
│   ├── AccommodationService.ts # 글로벌 럭셔리 숙소 데이터 (10개 지점)
│   ├── EventService.ts         # 지역별 행사/축제 데이터 관리
│   └── index.ts                # 서비스 export
│
├── index.html           # HTML 진입점 (라이브러리 로드)
└── index.ts             # 루트 라우터 및 SPA 초기화 설정
```

## 🎯 기술 스택

### Simple Web Component (SWC)
표준 Web Components 기반의 경량 프레임워크로 다음과 같은 핵심 기능을 활용합니다:

1. **DI (Dependency Injection):** `@Sim` 데코레이터를 통한 서비스 싱글톤 관리
2. **Declarative Rendering:** `@onConnectedInnerHtml`을 이용한 선언적 UI 정의
3. **Smart DOM Manipulation:** `@applyNodeHost`, `@setAttribute`, `@setClassList` 등을 이용한 정밀한 DOM 조작
4. **SPA Routing:** `simple-boot`와 연동된 선언적 경로 관리
5. **Shadow DOM:** 완벽한 스타일 캡슐화와 독립적 컴포넌트 구조

### 📦 주요 라이브러리
- **Leaflet.js:** 마커 연동형 인터랙티브 지도 구현
- **Reflect-metadata:** 데코레이터 기반 DI 지원
- **Unsplash API:** 고해상도 테마 이미지 활용

## 🚀 시작하기

### 설치

```bash
# 패키지 설치
pnpm install
```

### 개발 서버

```bash
# 개발 서버 실행 (http://localhost:3000)
pnpm run dev
```

## 📚 학습 포인트

1. **컴포넌트 기반 아키텍처:** 기능별로 분리된 컴포넌트와 페이지의 조립 방식
2. **복합 데이터 처리:** 숙소와 행사라는 서로 다른 도메인 데이터를 지역 정보를 매개로 연결하는 로직
3. **상태 기반 UI 업데이트:** 필터 변경 시 리스트와 지도가 유기적으로 반응하는 패턴
4. **반응형 웹 디자인:** 미디어 쿼리와 유연한 레이아웃을 통한 모바일 최적화 기법
5. **외부 라이브러리 통합:** Web Components 내부(Shadow DOM)에서 Leaflet과 같은 외부 라이브러리를 안전하게 사용하는 방법

---
본 예제는 `@dooboostore/simple-web-component`의 강력한 기능들을 실무 수준의 복잡한 시나리오에 적용하는 방법을 제시합니다.
