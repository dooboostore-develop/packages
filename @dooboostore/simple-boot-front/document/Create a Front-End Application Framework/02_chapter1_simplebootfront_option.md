# 제1장: 프레임워크의 시작점 - SimpleBootFront와 옵션

모든 프레임워크는 애플리케이션의 시작을 알리고 전반적인 설정을 관리하는 진입점(Entry Point)을 가집니다. `Simple-Boot-Front`에서는 `SimpleBootFront` 클래스가 이 역할을 담당합니다. 이 장에서는 `SimpleBootFront`의 초기화 과정과 `SimFrontOption`을 통한 설정 관리, 그리고 핵심 의존성 주입(DI) 컨테이너와의 연동에 대해 알아봅니다.

## 1.1. SimpleBootFront의 역할과 초기화

`SimpleBootFront`는 `SimpleApplication` (Simple-Boot Core의 핵심 클래스)을 상속받아 프론트엔드 환경에 특화된 기능을 추가합니다. 주요 역할은 다음과 같습니다.

-   **프론트엔드 환경 설정:** 브라우저 `window` 객체를 기반으로 프론트엔드 환경을 초기화합니다.
-   **`dom-render` 통합:** UI 렌더링을 담당하는 `dom-render` 라이브러리와 연동하여 반응형 UI를 구축합니다.
-   **라우터 초기화:** 클라이언트 측 라우팅을 위한 `PathRouter` 또는 `HashRouter`를 설정합니다.
-   **핵심 서비스 등록:** `CookieService`, `StorageService`, `MetaTagService` 등 프론트엔드 개발에 필요한 유틸리티 서비스들을 DI 컨테이너에 등록합니다.

`SimpleBootFront` 인스턴스는 `new SimpleBootFront(option)` 형태로 생성되며, `run()` 메소드를 호출하여 애플리케이션을 시작합니다.

```typescript
// SimpleBootFront.ts (개념적)
export class SimpleBootFront extends SimpleApplication {
  public domRenderConfig: RunConfig;
  private domRenderRouter: Router | undefined;

  constructor(public option: SimFrontOption) {
    super(option);
    
    // 라우터 초기화 (HashRouter 또는 PathRouter)
    this.domRenderRouter = option.urlType === 'path' ? new PathRouter({window: option.window, disableAttach: true}) : new HashRouter({window: option.window, disableAttach: true});
    this.simstanceManager.setStoreSet(Router, this.domRenderRouter); // DI 컨테이너에 라우터 등록

    // dom-render 설정 초기화
    this.domRenderConfig = {
      window: option.window,
      targetElements: this.domRenderTargetElements, // 컴포넌트 등록용
      targetAttrs: this.domRenderTargetAttrs,     // 커스텀 속성 등록용
      routerType: this.domRenderRouter,           // dom-render에 라우터 주입
      scripts: { /* 동적 스크립트 등록용 */ },
      eventVariables: { /* 이벤트 핸들러에 주입될 변수 */ },
      proxyExcludeTyps: this.domRendoerExcludeProxy, // dom-render 프록시 제외 타입
      // ... 기타 설정 ...
    };

    // SimpleApplication의 프록시 핸들러에 dom-render 프록시 생성 로직 연결
    option.proxy = {
      onProxy: (it: any) => this.createDomRender(it) // @Sim 객체 생성 시 dom-render 프록시 적용
    };
  }

  public run(otherInstanceSim?: Map<ConstructorType<any>, any>, url?: string) {
    const simstanceManager = this.initRun(otherInstanceSim); // SimpleApplication의 초기화 로직 실행
    this.initDomRenderScripts(); // dom-render 스크립트 초기화
    this.initDomRenderTargetElements(); // dom-render 컴포넌트 초기화

    // 루트 라우터 초기 렌더링 및 popstate 이벤트 리스너 등록
    this.option.window.dispatchEvent(new Event('popstate'));
    return simstanceManager;
  }

  // ... createDomRender, initDomRenderScripts, initDomRenderTargetElements 등 내부 메소드 ...
}
```

## 1.2. SimFrontOption을 통한 설정 관리

`SimFrontOption` 클래스는 `SimpleBootFront`의 동작을 설정하는 데 사용됩니다. `SimpleApplication`의 `SimOption`을 상속받아 프론트엔드 특화된 설정들을 추가합니다.

-   **`selector`:** `SimpleBootFront`가 애플리케이션을 마운트할 DOM 엘리먼트의 CSS 셀렉터 (기본값: `#app`).
-   **`urlType`:** 라우팅 방식 ( `UrlType.path` 또는 `UrlType.hash`).
-   **`window`:** 브라우저의 `window` 객체. 테스트 환경 등에서 모의(mock) 객체를 주입할 때 유용합니다.
-   **`rootRouter`:** 애플리케이션의 최상위 라우터 클래스.

```typescript
// option/SimFrontOption.ts
export enum UrlType {
  path = 'path',
  hash = 'hash'
}

export class SimFrontOption extends SimOption {
  selector: string = '#app';
  urlType: UrlType = UrlType.path;

  constructor(public window: Window, initSimOption?: InitOptionType) {
    super(initSimOption);
  }

  // 체이닝 가능한 설정 메소드
  setSelector(selector: string): SimFrontOption { this.selector = selector; return this; }
  setUrlType(urlType: UrlType): SimFrontOption { this.urlType = urlType; return this; }
  setRootRouter(rootRouter: ConstructorType<any>): SimFrontOption { this.rootRouter = rootRouter; return this; }
}
```

### 예제: `SimpleBootFront` 초기화 및 설정

`SimpleBootFront`를 초기화하고 라우터를 설정하는 전체 예제입니다. 이 예제는 `quick-start`에서 사용된 라우팅 방식을 따릅니다.

먼저, 페이지 컴포넌트와 라우터 컴포넌트의 템플릿 및 스타일을 별도 파일로 정의합니다.

**`./home-page.component.html`**
```html
<div>Home Page</div>
```

**`./about-page.component.html`**
```html
<div>About Page</div>
```

**`./app-router.component.html`**
```html
<nav>
  <button dr-event-click="$router?.go({path: '/'})">Home</button>
  <button dr-event-click="$router?.go({path: '/about'})">About</button>
</nav>
<main>
  <div dr-this="@this@.child"></div> <!-- 라우팅된 컴포넌트가 렌더링될 위치 -->
</main>
```

**`./app-router.component.css`**
```css
nav button { 
  margin-right: 10px; 
  padding: 5px 10px; 
}
main { 
  border: 1px solid #ccc; 
  padding: 20px; 
  margin-top: 20px; 
}
```

이제 이 파일들을 사용하여 전체 예제 코드를 작성합니다.

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet';

// 템플릿 및 스타일 파일 임포트
import homeTemplate from './home-page.component.html';
import aboutTemplate from './about-page.component.html';
import appRouterTemplate from './app-router.component.html';
import appRouterStyles from './app-router.component.css';

// 1. 페이지 컴포넌트 정의
@Sim
@Component({ template: homeTemplate })
class HomePage {}

@Sim
@Component({ template: aboutTemplate })
class AboutPage {}

// 2. 라우터 정의
@Sim
@Router({
    path: '', // 루트 경로
    route: {
        '/': HomePage,
        '/about': AboutPage
    }
})
@Component({ 
  template: appRouterTemplate,
  styles: appRouterStyles
})
export class AppRouter implements RouterAction {
  child?: ComponentSet<any>; // 라우팅된 컴포넌트를 ComponentSet으로 관리

  // 라우팅 가드: 라우팅되기 전에 호출
  async canActivate(url: any, module: any) {
    this.child = new ComponentSet(module); // 라우팅된 모듈을 ComponentSet으로 감싸서 할당
    console.log(`Navigating to: ${url.intent.pathname}, Module: ${module?.constructor.name}`);
  }
}

// 3. SimpleBootFront 인스턴스 생성 및 설정
const config = new SimFrontOption(window) // 브라우저 window 객체 주입
  .setRootRouter(AppRouter) // 루트 라우터 클래스 지정
  .setUrlType(UrlType.hash) // URL 해시(#) 기반 라우팅 사용
  .setSelector('#app'); // 애플리케이션이 마운트될 DOM 엘리먼트

const app = new SimpleBootFront(config);

// 4. 애플리케이션 실행
app.run();

console.log('Simple-Boot-Front application started.');

// 브라우저 환경에서 실행 시, #app 엘리먼트 내부에 라우팅된 컴포넌트가 표시됩니다.
// URL을 #/about으로 변경하면 AboutPage가 표시됩니다.
```

## 1.3. 의존성 주입(DI) 컨테이너 연동

`SimpleBootFront`는 `SimpleApplication`을 상속받으므로, `Simple-Boot Core`의 강력한 의존성 주입(DI) 컨테이너인 `SimstanceManager`를 그대로 활용합니다. 이는 프론트엔드 애플리케이션에서도 백엔드에서와 동일한 방식으로 객체들을 관리하고 의존성을 주입받을 수 있음을 의미합니다.

-   `SimpleBootFront`는 초기화 과정에서 `SimstanceManager` 인스턴스를 생성하고, 자신(`SimpleBootFront` 인스턴스)과 `SimstanceManager` 자신을 DI 컨테이너에 등록합니다.
-   `@Sim` 데코레이터로 등록된 모든 클래스는 `SimpleBootFront` 애플리케이션 내에서 DI 컨테이너의 관리를 받게 됩니다.
-   `app.sim(MyService)`와 같이 `SimpleBootFront` 인스턴스를 통해 DI 컨테이너로부터 객체를 조회할 수 있습니다.

이러한 DI 컨테이너 연동은 프론트엔드 애플리케이션의 모듈성을 높이고, 테스트 용이성을 향상시키며, 복잡한 객체 그래프를 효율적으로 관리할 수 있도록 돕습니다.

이 장에서는 `SimpleBootFront`의 기본적인 구조와 초기화, 그리고 `SimFrontOption`을 통한 설정 관리 및 DI 컨테이너 연동에 대해 알아보았습니다. 다음 장에서는 `Simple-Boot-Front`의 핵심인 컴포넌트 시스템과 `dom-render`와의 통합에 대해 더 깊이 탐구하겠습니다.
