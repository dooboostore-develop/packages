# 제6장: 프레임워크 완성하기

지금까지 우리는 반응성 시스템, 템플릿 엔진, 컴포넌트 모델이라는 프레임워크의 3대 핵심 요소를 모두 구축했습니다. 이 마지막 장에서는 애플리케이션을 구조화하는 데 필수적인 라우팅과 컴포넌트 간 통신 기능을 추가하고, 최적화 및 빌드 과정을 통해 우리의 프레임워크를 실제 사용 가능한 형태로 완성합니다.

## 6.1. 라우터(`PathRouter`, `HashRouter`) 설계

SPA(Single Page Application)는 여러 페이지를 가진 것처럼 보이지만 실제로는 하나의 HTML 파일 위에서 동작합니다. 라우터는 URL의 변경을 감지하고, 그에 맞는 컴포넌트를 화면에 렌더링하는 역할을 합니다.

`dom-render`의 라우터는 다음과 같이 설계됩니다.

1.  **URL 변경 감지:** 브라우저의 `popstate` 이벤트를 리스닝합니다. 이 이벤트는 사용자가 브라우저의 '뒤로 가기'/'앞으로 가기' 버튼을 누르거나, `history.pushState()`가 호출될 때 발생합니다.

2.  **추상 클래스와 구현체:** `Router`라는 추상 클래스를 만들어 `go`, `test`, `getRouteData` 등 공통 인터페이스를 정의합니다. 그리고 URL 형식을 다루는 방식에 따라 두 개의 구현체를 만듭니다.
    -   `HashRouter`: `example.com/#/path`와 같이 해시(`#`)를 이용한 라우팅. `window.location.hash`를 읽어 경로를 파악합니다.
    -   `PathRouter`: `example.com/path`와 같이 표준 URL 경로를 이용한 라우팅. `window.location.pathname`을 읽어 경로를 파악하며, 서버 설정이 필요합니다.

3.  **렌더링과의 연동:** 라우터는 `dr-if` 지시어와 함께 사용될 때 가장 강력합니다. `$router`라는 특수 변수를 템플릿에 노출시켜, 다음과 같이 선언적인 라우팅을 구현합니다.

    ```html
    <main>
      <!-- 현재 URL이 '/'일 때만 main-page 컴포넌트를 렌더링 -->
      <main-page dr-if="$router.test('/')"></main-page>

      <!-- URL이 '/users/{id}' 패턴과 일치할 때 user-detail 컴포넌트를 렌더링 -->
      <user-detail dr-if="$router.test('/users/{id}')"></user-detail>
    </main>
    ```

    `$router.test()` 메소드는 내부적으로 현재 URL과 주어진 URL 표현식을 비교하여 `true` 또는 `false`를 반환합니다. `popstate` 이벤트가 발생하면, 라우터는 반응성 객체의 특정 속성(예: `_router_update_trigger`)을 변경하여 `$router` 변수에 의존하는 모든 `dr-if` 지시어가 다시 평가되도록 유도합니다. 이를 통해 URL 변경에 따라 적절한 컴포넌트가 자동으로 렌더링됩니다.

### 구현 예제: 선언적 라우팅

다음은 라우터와 `dr-if` 지시어를 결합하여 선언적으로 페이지를 전환하는 예제입니다.

**`index.html`**
```html
<header>
    <!-- 버튼 클릭 시 $router.go()를 호출하여 URL을 변경합니다. -->
    <button dr-event-click="$router?.go({path:'/'})">Main</button>
    <button dr-event-click="$router?.go({path:'/second'})">Second</button>
    <button dr-event-click="$router?.go({path:'/detail/25?name=user'})">Detail</button>
</header>
<main>
    <!-- $router.test()의 결과에 따라 렌더링할 컴포넌트를 결정합니다. -->
    <main-page dr-if="$router?.test('/')"></main-page>
    <page-second dr-if="$router?.test('/second')"></page-second>
    
    <!-- 
      URL 경로에서 파라미터(id)를 추출하고, 쿼리 스트링(name)을 사용하는 예제입니다.
      dr-on-component-init 훅을 사용해 컴포넌트가 초기화될 때 라우터 데이터를 전달합니다.
    -->
    <page-detail 
        url='/detail/{id:[0-9]+}' 
        dr-if="$router?.test($attribute.url)" 
        dr-on-component-init="$component.routerData($router.getRouteData($attribute.url))"
    ></page-detail>
</main>
```

**`index.ts`**
```typescript
import { DomRender, RunConfig } from '@dooboostore/dom-render';
import { Second } from './second/second';
import { Detail } from './detail/detail';

// ... 컴포넌트 템플릿 import ...

// DomRender 실행 설정
const config: RunConfig<Index> = {
  window: window,
  targetElements: [
    // 각 URL에 해당하는 컴포넌트를 등록합니다.
    DomRender.createComponent({type: Second, tagName: 'page-second', template: SecondTemplate}),
    DomRender.createComponent({type: Detail, tagName: 'page-detail', template: DetailTemplate})
  ],
  // 라우터 타입을 'path' 또는 'hash'로 지정합니다.
  routerType: 'path' 
};

// 애플리케이션 실행
DomRender.run({
  rootObject: new Index(),
  target:  document.querySelector('#app')!,
  config: config
});
```

이 예제에서 사용자는 버튼을 클릭하여 URL을 변경합니다. `DomRender`는 URL 변경을 감지하고, `$router` 객체를 업데이트합니다. 이 업데이트는 `$router.test()`를 사용하는 `dr-if` 지시어들을 다시 평가하게 만듭니다. 결과적으로 현재 URL과 일치하는 `dr-if`를 가진 컴포넌트만 `true`가 되어 화면에 렌더링됩니다.

특히 `page-detail` 컴포넌트는 `/detail/{id}` 형태의 동적 경로를 처리하는 방법을 보여줍니다. `$router.getRouteData()` 메소드는 URL에서 `{id}` 같은 파라미터와 쿼리 스트링을 추출하여 객체 형태로 반환하고, 이를 컴포넌트에 전달하여 상세 페이지를 렌더링하는 데 사용합니다.

## 6.2. 메신저(`Messenger`) 시스템

부모-자식 관계가 아닌, 멀리 떨어진 컴포넌트 간에 데이터를 주고받아야 할 때가 있습니다. 이를 위해 `dom-render`는 **발행/구독(Publish/Subscribe) 패턴**을 사용하는 `Messenger` 시스템을 제공합니다.

-   **`Messenger`**: 모든 통신을 중재하는 중앙 허브입니다.
-   **`Channel`**: 특정 주제(주로 컴포넌트 클래스나 고유 키)에 대한 통신 채널입니다. 컴포넌트는 자신만의 채널을 생성할 수 있습니다.
-   **`publish`**: 특정 채널에 데이터를 발행(전송)합니다. `messenger.publish(TargetComponent, { message: 'Hello' })`와 같이 사용합니다.
-   **`subscribe`**: 특정 채널을 구독하여 데이터가 발행될 때마다 콜백 함수를 실행합니다. `messenger.createChannel(this).subscribe(data => ...)`와 같이 사용합니다.

이 시스템은 컴포넌트 간의 직접적인 결합(coupling)을 없애주어, 애플리케이션 구조를 더 유연하고 확장 가능하게 만듭니다.

## 6.3. 최적화와 예외 처리

프레임워크는 안정적이어야 합니다. `dom-render`는 몇 가지 장치를 통해 성능을 최적화하고 예외적인 상황에 대처합니다.

-   **`DomRenderFinalProxy`, `Shield`**: 모든 객체를 `Proxy`로 감싸는 것은 때로 불필요하거나 성능 저하를 유발할 수 있습니다. (예: 외부 라이브러리 객체, 거대한 데이터 구조). `DomRenderProxy.final()`이나 `new Shield()`로 객체를 감싸면, 해당 객체는 더 이상 `Proxy`로 변환되지 않아 반응성 추적에서 제외됩니다. 이는 "탈출구"를 제공하여 개발자가 성능을 미세 조정할 수 있게 합니다.
-   **`proxyExcludeTyps`**: `config` 객체에 특정 클래스(예: `Window`, `Map`, `Set`)를 등록하면, 해당 클래스의 인스턴스는 `Proxy` 변환에서 자동으로 제외됩니다. 이는 `Maximum call stack size exceeded` 같은 무한 재귀 오류를 방지하는 데 중요합니다.

## 6.4. 빌드 및 배포

마지막으로, 우리가 작성한 TypeScript 소스 코드를 브라우저가 이해할 수 있는 단일 JavaScript 파일로 변환해야 합니다. 이 과정을 **번들링(Bundling)**이라고 하며, `webpack` 같은 도구를 사용합니다.

-   **`tsconfig.json`**: TypeScript 컴파일러의 설정을 정의합니다. `target: "ESNext"`는 최신 JavaScript 문법을 사용하도록 하고, `module: "esnext"`는 모듈 시스템을 정의합니다. `experimentalDecorators`와 `emitDecoratorMetadata`는 데코레이터 문법을 사용하기 위해 필요합니다.
-   **`webpack.config.js`**: Webpack의 동작을 설정합니다.
    -   `entry`: 번들링을 시작할 진입점 파일(예: `index.ts`)을 지정합니다.
    -   `output`: 결과물 파일의 이름과 저장될 경로를 지정합니다.
    -   `resolve`: `import` 시 `.ts`나 `.js` 같은 확장자를 생략할 수 있도록 설정합니다.
    -   `module.rules`: `.ts` 파일은 `ts-loader`를 통해 TypeScript에서 JavaScript로 변환하고, `.css`나 `.html` 파일은 텍스트로 불러올 수 있도록 설정합니다.

`npm run build` 같은 명령어를 실행하면, Webpack은 `entry` 파일부터 시작해 모든 `import`된 파일들을 따라가며 하나의 파일로 합치고 변환하여 최종 결과물을 만들어냅니다.

--- 

**축하합니다!** 이 장을 끝으로 우리는 반응성 코어부터 컴포넌트 시스템, 라우팅, 빌드 과정에 이르기까지 현대적인 프론트엔드 프레임워크의 모든 핵심 요소를 직접 설계하고 그 원리를 탐구했습니다. 이 여정을 통해 얻은 지식은 여러분이 어떤 프레임워크를 사용하든 그 내부를 더 깊이 이해하고, 더 나은 소프트웨어 아키텍처를 설계하는 데 훌륭한 밑거름이 될 것입니다.
