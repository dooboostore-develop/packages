# 제3장: 라우팅과 내비게이션 - SPA의 흐름 제어

단일 페이지 애플리케이션(SPA)에서 라우팅은 여러 페이지를 가진 것처럼 보이게 하는 핵심 메커니즘입니다. `Simple-Boot-Front`는 `simple-boot-core`의 라우팅 시스템과 `dom-render`의 UI 렌더링 기능을 결합하여 강력하고 유연한 클라이언트 측 라우팅을 제공합니다. 이 장에서는 라우팅 시스템의 설계와 내비게이션, 그리고 라우팅 가드에 대해 알아봅니다.

## 3.1. `@Router`와 `@Route`를 활용한 라우팅

`Simple-Boot-Front`의 라우팅은 `simple-boot-core`의 `@Router`와 `@Route` 데코레이터를 기반으로 합니다. 이 데코레이터들을 사용하여 URL 경로와 컴포넌트(또는 메소드)를 선언적으로 매핑합니다.

-   **`@Router`:** 클래스에 적용되어 해당 클래스가 라우터임을 선언하고, 기본 경로(`path`)와 하위 라우팅 규칙(`route`, `routers`)을 정의합니다. `SimpleBootFront`의 `rootRouter` 옵션에 지정된 클래스가 최상위 라우터가 됩니다.
-   **`@Route`:** `@Router` 클래스 내의 메소드에 적용되어 특정 경로(`path`)에 해당 메소드를 매핑합니다. 이 메소드는 `RouterModule` 객체를 인자로 받아 현재 라우팅에 대한 상세 정보(경로 데이터, 쿼리 파라미터 등)에 접근할 수 있습니다.

### 구현 원리

`SimpleBootFront`는 `simple-boot-core`의 `RouterManager`를 사용하여 라우팅을 처리합니다. `RouterManager`는 애플리케이션 초기화 시 모든 `@Router` 및 `@Route` 메타데이터를 수집하여 라우팅 맵을 구축합니다.

사용자가 `router-link`를 클릭하거나 `app.goRouting()`을 호출하여 URL이 변경되면, `SimpleBootFront`는 `dom-render`의 라우터(`PathRouter` 또는 `HashRouter`)를 통해 URL 변경을 감지합니다. 이후 `RouterManager`의 `routing()` 메소드를 호출하여 변경된 URL에 매칭되는 `@Route`를 찾고, 해당 `@Route`에 연결된 컴포넌트를 `dom-render`를 통해 `#app` 엘리먼트 내부에 렌더링합니다.

특히, `SimpleBootFront`의 루트 라우터 컴포넌트 템플릿 내에 `<router dr-this="this.child" dr-this:type="outlet"></router>`와 같은 플레이스홀더를 두어, 라우팅된 컴포넌트가 이 위치에 동적으로 삽입되도록 합니다. `RouterAction` 인터페이스를 구현한 라우터 클래스는 `canActivate` 메소드를 통해 `this.child` 속성에 다음 라우팅될 컴포넌트 인스턴스를 할당할 수 있습니다.

### 예제: `@Router`와 `@Route`를 활용한 라우팅

이 예제에서는 `quick-start`에서 사용된 라우팅 방식을 적용합니다. 이 방식은 `@Router` 데코레이터의 `route` 속성에 경로와 컴포넌트를 직접 매핑하여 라우팅 규칙을 한곳에서 관리합니다.

먼저, 라우팅에 사용될 각 페이지 컴포넌트의 템플릿을 별도의 HTML 파일로 정의합니다.

**`./home-page.component.html`**
```html
<div><h1>Home Page</h1><p>Welcome to the home page!</p></div>
```

**`./about-page.component.html`**
```html
<div><h1>About Page</h1><p>Learn more about us.</p></div>
```

**`./user-detail-page.component.html`**
```html
<div>
  <h1>User Detail Page</h1>
  <p>User ID: ${@this@.userId}$</p>
  <p>Query Param (name): ${@this@.userName}$</p>
</div>
```

다음으로, 메인 라우터 컴포넌트의 템플릿과 스타일을 정의합니다.

**`./app-router.component.html`**
```html
<nav>
  <button dr-event-click="$router?.go({path: '/'})">Home</button>
  <button dr-event-click="$router?.go({path: '/about'})">About</button>
  <button dr-event-click="$router?.go({path: '/users/123?name=Alice'})">User 123 (Alice)</button>
  <button dr-event-click="$router?.go({path: '/users/456?name=Bob'})">User 456 (Bob)</button>
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
  cursor: pointer; 
}
main { 
  border: 1px solid #ccc; 
  padding: 20px; 
  margin-top: 20px; 
  min-height: 150px; 
}
```

이제 이 파일들을 사용하여 새로운 라우팅 방식이 적용된 전체 코드를 작성합니다.

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet';

// HTML 템플릿 및 CSS 파일들을 임포트합니다.
import homeTemplate from './home-page.component.html';
import aboutTemplate from './about-page.component.html';
import userDetailTemplate from './user-detail-page.component.html';
import appRouterTemplate from './app-router.component.html';
import appRouterStyles from './app-router.component.css';

// 1. 페이지 컴포넌트 정의
@Sim
@Component({ template: homeTemplate })
class HomePage {}

@Sim
@Component({ template: aboutTemplate })
class AboutPage {}

@Sim
@Component({ template: userDetailTemplate })
class UserDetailPage {
  userId: string = '';
  userName: string = '';

  onActivate(routerModule: RouterModule) {
    this.userId = routerModule.pathData?.id || 'N/A';
    this.userName = routerModule.queryParams?.name || 'N/A';
    console.log(`UserDetailPage activated for ID: ${this.userId}, Name: ${this.userName}`);
  }
}

// 2. 애플리케이션의 루트 라우터 컴포넌트
@Sim
@Router({
    path: '', // 루트 경로
    route: {
        '/': HomePage,
        '/about': AboutPage,
        '/users/{id}': UserDetailPage // @Route 데코레이터 대신 route 객체에 직접 매핑
    }
})
@Component({
  template: appRouterTemplate,
  styles: appRouterStyles
})
export class AppRouter implements RouterAction {
  child?: ComponentSet<any>; // 라우팅된 컴포넌트를 ComponentSet으로 관리

  async canActivate(url: any, module: any) {
    // 라우팅된 모듈을 ComponentSet으로 감싸서 child 속성에 할당
    this.child = new ComponentSet(module);
    console.log(`[AppRouter] Navigating to: ${url.intent.pathname}, Module: ${module?.constructor.name}`);
    if (typeof module?.onActivate === 'function') {
      module.onActivate(url.routerModule);
    }
  }
}

// 3. SimpleBootFront 인스턴스 생성 및 설정
const config = new SimFrontOption(window)
  .setRootRouter(AppRouter)
  .setUrlType(UrlType.hash) // URL 해시(#) 기반 라우팅 사용
  .setSelector('#app');

const app = new SimpleBootFront(config);

// 4. 애플리케이션 실행
app.run();

console.log('Simple-Boot-Front routing example started.');

// 브라우저에서 버튼을 클릭하거나 URL 해시를 변경하여 라우팅 테스트
```

## 3.2. `$router.go()`를 이용한 프로그래밍 방식 내비게이션

`Simple-Boot-Front`는 `dom-render`에서 제공하는 내장 `$router` 객체를 통해 프로그래밍 방식으로 내비게이션을 처리합니다. 템플릿 내의 이벤트 핸들러에서 `$router.go()` 메소드를 호출하여 원하는 경로로 이동할 수 있습니다.

-   **`$router.go({path: '/...'})`**: `dr-event-click`과 같은 이벤트 속성 내에서 호출되어, 인자로 전달된 `path`로 클라이언트 측 라우팅을 수행합니다. 쿼리 파라미터도 경로에 포함할 수 있습니다.

### 구현 원리

`dom-render`는 템플릿을 파싱할 때 `$router`라는 특수 변수를 주입합니다. 이 객체는 `dom-render`의 라우터 인스턴스(`PathRouter` 또는 `HashRouter`)와 연결되어 있습니다. `dr-event-click` 등에서 `$router.go()`가 호출되면, `dom-render`는 내부적으로 URL을 변경하고 라우팅을 트리거합니다. 이 변경은 `SimpleBootFront`가 감지하여 `RouterManager`를 통해 적절한 컴포넌트를 렌더링하게 합니다.

## 3.3. `RouterAction`을 통한 라우팅 가드

`RouterAction` 인터페이스는 라우팅 과정에 개입하여 특정 로직을 실행할 수 있는 **라우팅 가드(Routing Guard)** 기능을 제공합니다. 이는 인증, 권한 확인, 데이터 로딩 등 라우팅이 완료되기 전에 수행되어야 할 작업에 유용합니다.

-   **`canActivate(url: RoutingDataSet, module: any)`:** `@Router` 클래스가 `RouterAction` 인터페이스를 구현하면, `canActivate` 메소드가 라우팅되기 전에 호출됩니다. `url` 객체는 현재 `Intent`와 `RouterModule` 정보를 포함하며, `module`은 다음 라우팅될 컴포넌트 인스턴스입니다. 이 메소드 내에서 비동기 작업을 수행하거나, 특정 조건에 따라 라우팅을 중단할 수 있습니다.

### 구현 원리

`Simple-Boot Core`의 `RouterManager`는 라우팅 체인(`routerChains`)을 순회하며 `RouterAction` 인터페이스를 구현한 라우터 인스턴스를 발견하면 `canActivate` 메소드를 호출합니다. `SimpleBootFront`의 `AppRouter` 예제에서 `canActivate`를 구현하여 `this.child` 속성에 다음 라우팅될 컴포넌트를 할당하는 것이 대표적인 사용 예입니다.

이러한 라우팅 시스템은 SPA의 복잡한 내비게이션 요구사항을 충족시키고, 애플리케이션의 흐름을 체계적으로 제어할 수 있도록 돕습니다.

다음 장에서는 `Simple-Boot-Front`의 기능을 확장하는 동적 스크립트와 내장 서비스들에 대해 알아보겠습니다.
