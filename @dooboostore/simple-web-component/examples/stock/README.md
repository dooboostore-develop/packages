# 📈 STAY STOCK - Simple Stock Market Platform

토스증권 스타일의 심플하고 직관적인 주식 플랫폼 예제입니다. **Accommodation Pattern**을 활용한 현대적인 SPA 아키텍처로 구현되었습니다.

## 🎯 주요 특징

- ✅ **Accommodation Pattern**: 명시적 DI와 팩토리 기반 등록
- ✅ **중앙 집중식 라우터**: `rootRouterFactory`가 모든 라우트 관리
- ✅ **선언적 라우팅**: `@subscribeSwcAppRouteChange`로 패턴 매칭
- ✅ **의존성 주입**: `@onInitialize`로 서비스 주입
- ✅ **이벤트 기반 네비게이션**: 헤더 네비게이션 통해 라우팅
- ✅ **실시간 시뮬레이션**: 2초마다 변동되는 시세
- ✅ **반응형 디자인**: 순수 CSS 활용

## 🏗️ 프로젝트 구조

```
src/
├── index.ts                    # 진입점: bootFactory 호출 및 앱 마운트
├── index.html                  # 루트: <body id="app" is="swc-app-body">
├── bootFactory.ts              # 중앙: 모든 팩토리 등록
├── components/
│   ├── index.ts                # Exports: componentFactories
│   ├── StockHeader.ts          # @elementDefine, 고정 헤더
│   └── StockCard.ts            # 종목 카드 컴포넌트
├── pages/
│   ├── index.ts                # Exports: pageFactories, rootRouterFactory
│   ├── MainPage.ts             # 대시보드 페이지
│   └── DetailPage.ts           # 종목 상세 페이지 (@attributeHost)
└── services/
    ├── index.ts                # Exports: serviceFactories
    └── StockService.ts         # 주식 데이터 관리
```

## 🚀 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run dev

# 프로덕션 빌드
pnpm run build
```

**브라우저에서 열기:** `http://localhost:3000`

## 🏛️ 아키텍처: Accommodation Pattern

### 1. 부트 팩토리 (bootFactory.ts)
모든 등록을 조율하는 중앙 부트 스트랩:

```typescript
import register from '@dooboostore/simple-web-component';
import { serviceFactories } from './services';
import { componentFactories } from "./components";
import { pageFactories } from "./pages";

export default (w: Window, container: symbol) => {
  // DI 컨테이너로 서비스 초기화
  serviceFactories.forEach(s => s(container));
  
  // 모든 페이지, 컴포넌트, 루트 라우터 등록
  register(w, [...pageFactories, ...componentFactories]);
};
```

### 2. 루트 라우터 (pages/index.ts)
`@subscribeSwcAppRouteChange` 사용한 중앙 라우팅 허브:

```typescript
export const rootRouterFactory = (w: Window) => {
  const tagName = 'stock-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private router: Router;
    private stockService: StockService;

    @onInitialize
    onconstructor(
      router: Router,
      @Inject({ symbol: StockService.SYMBOL }) stockService: StockService
    ) {
      this.router = router;
      this.stockService = stockService;
    }

    // 메인 페이지
    @subscribeSwcAppRouteChange('/')
    @applyInnerHtmlNodeHost({ root: 'light' })
    mainRoute(router: RouterEventType) {
      return `<stay-stock-main-page/>`;
    }

    // 상세 페이지 (경로 파라미터 포함)
    @subscribeSwcAppRouteChange('/stock/{id}')
    @applyInnerHtmlNodeHost({ root: 'light' })
    detailRoute(router: RouterEventType, pathData: any) {
      return `<stay-stock-detail-page stock-id="${pathData.id}"/>`;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
        <style>
          :host { display: flex; flex-direction: column; min-height: 100vh; background: #080808; }
          stay-stock-header { position: sticky; top: 0; z-index: 2000; }
          main { flex: 1; overflow-y: auto; }
        </style>
        <stay-stock-header on-navigate="$host.navigate($data.path)"></stay-stock-header>
        <main><slot></slot></main>
      `;
    }
  }
  return tagName;
};

export const pageFactories = [
  rootRouterFactory,
  MainPage,
  DetailPage
];
```

### 3. 상세 페이지 (pages/DetailPage.ts)
HTML 속성을 통한 데이터 수신:

```typescript
export default (w: Window) => {
  const tagName = 'stay-stock-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class DetailPage extends w.HTMLElement {
    private router: Router;
    private stockService: StockService;
    private stockId: string = '';

    @attributeHost('stock-id')
    stockIdAttr: string = '';

    @onInitialize
    onconstructor(
      router: Router,
      @Inject({ symbol: StockService.SYMBOL }) stockService: StockService
    ) {
      this.router = router;
      this.stockService = stockService;

      // 속성 변경 감지
      if (this.stockIdAttr) {
        this.loadStock(this.stockIdAttr);
      }
    }

    private loadStock(id: string) {
      if (this.stockId !== id) {
        this.stockId = id;
        // 종목 데이터 로드 및 렌더링
        this.render();
      }
    }

    @addEventListener('#go-back', 'click')
    onBack() {
      this.router.go('/');
    }
  }
  return tagName;
};
```

### 4. 컴포넌트 (components/StockHeader.ts)
이벤트 emit을 통한 네비게이션:

```typescript
export default (w: Window) => {
  const tagName = 'stay-stock-header';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class StockHeader extends w.HTMLElement {
    @emitCustomEventHost('navigate')
    @addEventListener('.nav-link', 'click', { delegate: true })
    onNavClick(e: any) {
      const path = e.target.closest('[data-path]')?.dataset?.path;
      return { path };
    }
  }
  return tagName;
};
```

### 5. 진입점 (index.ts)
DI 컨테이너와 함께 앱 부트스트랩:

```typescript
import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', () => {
  const container = Symbol('container');
  bootFactory(w, container);
  
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  
  if (appElement) {
    appElement.connect({
      path: UrlUtils.getUrlPath(w.location) ?? '/',
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: () => {
        console.log('[Stock] Engine started');
        appElement.innerHTML = '<stock-root-router></stock-root-router>';
      }
    });
  }
});
```

## 📊 데이터 흐름

```
서비스 (DI 컨테이너)
    ↓
bootFactory (서비스 초기화)
    ↓
rootRouterFactory (@subscribeSwcAppRouteChange)
    ↓
페이지 (속성을 통한 데이터 수신)
    ↓
컴포넌트 (@emitCustomEventHost로 이벤트 전파)
    ↓
UI 렌더링 (순수 Web Components)
```

## 🔑 핵심 패턴

### ⚠️ **핵심: 모든 HTMLElement 상속 클래스는 @Sim을 붙이면 안 됩니다!**

**이 규칙은 모든 Web Component에 적용됩니다:**
- ✅ RootRouter
- ✅ Pages (MainPage, DetailPage, etc.)
- ✅ Components (StockHeader, StockCard, etc.)

오직 Services만 `@Sim` 데코레이터를 사용합니다! Web Components는 `@elementDefine`만 사용합니다. 라우팅은 이제 `@subscribeSwcAppRouteChange` 데코레이터를 개별 라우트 핸들러 메서드에 붙여서 처리합니다.

```typescript
// ✅ 올바름: Service와 @Sim
@Sim()
export class StockService {
  async getStocks() { }
}

// ✅ 올바름: RootRouter와 @subscribeSwcAppRouteChange (@Sim 없음, @Router 없음)
@elementDefine(tagName, { window: w })
class RootRouter extends w.HTMLElement {
  @onInitialize
  onconstructor(service: StockService) { }

  @subscribeSwcAppRouteChange('/')
  @applyInnerHtmlNodeHost({ root: 'light' })
  mainRoute(router: RouterEventType) {
    return `<page-main/>`;
  }

  @subscribeSwcAppRouteChange('/stock/{id}')
  @applyInnerHtmlNodeHost({ root: 'light' })
  detailRoute(router: RouterEventType, pathData: any) {
    return `<page-detail stock-id="${pathData.id}"/>`;
  }
}

// ✅ 올바름: Page와 @elementDefine (@Sim 없음, @Router 없음)
@elementDefine(tagName, { window: w })
class DetailPage extends w.HTMLElement {
  @onInitialize
  onconstructor(service: StockService) { }
}

// ✅ 올바름: Component와 @elementDefine (@Sim 없음)
@elementDefine(tagName, { window: w })
class StockHeader extends w.HTMLElement { }

// ❌ 잘못됨: 어떤 Web Component도 @Sim 사용 금지
@Sim()
@elementDefine(tagName, { window: w })
class RootRouter extends w.HTMLElement { }  // ← 절대 금지!

// ❌ 잘못된 패턴: 구식 @Router 사용 금지
@Sim()
@Router(routerConfig)  // ← 구식 패턴!
@elementDefine(tagName, { window: w })
class RootRouter extends w.HTMLElement { }  // ← 절대 금지!
```

## 🔑 핵심 패턴

### 1️⃣ **팩토리는 tagName 반환 (문자열)**
```typescript
export default (w: Window) => {
  const tagName = 'element-name';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;  // 클래스가 아닌 문자열 반환

  @elementDefine(tagName, { window: w })
  class ElementName { }
  
  return tagName;  // 항상 문자열 반환
};
```

### 2️⃣ **@onInitialize로 DI 처리**
```typescript
@onInitialize
onconstructor(
  router: Router,
  @Inject({ symbol: Service.SYMBOL }) service: Service
) {
  this.router = router;
  this.service = service;
}
```

### 3️⃣ **@subscribeSwcAppRouteChange로 라우팅**
```typescript
@subscribeSwcAppRouteChange('/stock/{id}')
@applyInnerHtmlNodeHost({ root: 'light' })
routeMethod(router: RouterEventType, pathData: any) {
  return `<component-name stock-id="${pathData.id}" />`;
}
```

### 4️⃣ **이벤트 통신**
헤더 → emit → 루트라우터 → navigate:

```typescript
// 헤더 emit
@emitCustomEventHost('navigate')
onNavClick() { return { path: '/stock/123' }; }

// 루트라우터 수신
<header on-navigate="$host.navigate($data.path)"></header>

// 루트라우터 처리
navigate(path: string) { this.router.go(path); }
```

---

**이 아키텍처의 장점:**
- ✅ 명시적 등록 및 bootFactory를 통한 중앙화
- ✅ 하나의 RootRouter에서 모든 라우팅 관리
- ✅ HTML 속성을 통한 파라미터 전달
- ✅ 이벤트 기반 네비게이션
- ✅ 완전한 의존성 주입 지원
- ✅ 숨겨진 마법 없는 명확한 데이터 흐름
