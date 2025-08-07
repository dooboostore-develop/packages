# 제2장: 컴포넌트 시스템 - UI 구성의 핵심

프론트엔드 프레임워크의 가장 중요한 역할 중 하나는 사용자 인터페이스(UI)를 재사용 가능하고 관리하기 쉬운 컴포넌트 단위로 구성하는 것입니다. `Simple-Boot-Front`는 `@Component` 데코레이터를 통해 컴포넌트를 정의하고, `dom-render` 라이브러리와의 통합을 통해 반응형 UI 렌더링을 구현합니다. 이 장에서는 컴포넌트 시스템의 설계와 동작 원리를 알아봅니다.

## 2.1. `@Component` 데코레이터와 컴포넌트 정의

`@Component` 데코레이터는 클래스를 UI 컴포넌트로 선언하는 역할을 합니다. 이 데코레이터는 컴포넌트의 템플릿(HTML), 스타일(CSS), 그리고 컴포넌트가 DOM에서 사용될 때의 태그 이름(`selector`)을 정의합니다.

```typescript
// decorators/Component.ts
export interface ComponentConfig {
    selector?: string; // 컴포넌트의 HTML 태그 이름 (기본값: 클래스명 소문자)
    noStrip?: boolean; // 컴포넌트의 루트 엘리먼트를 유지할지 여부
    template?: string; // 컴포넌트의 HTML 템플릿
    styles?: (string)[]  | string; // 컴포넌트의 CSS 스타일
    proxy?: SimConfigProxy; // 컴포넌트 인스턴스에 적용될 프록시 핸들러
    using?: SimConfigUsing; // 컴포넌트의 의존성 (DI 컨테이너 힌트)
}

export const Component = (configOrTarget: ConstructorType<any> | ComponentConfig): void | GenericClassDecorator<ConstructorType<any>> => {
    if (typeof configOrTarget === 'function') {
        // @Component 데코레이터가 인자 없이 사용될 때 (예: @Component)
        componentProcess({}, configOrTarget);
    } else {
        // @Component 데코레이터가 인자와 함께 사용될 때 (예: @Component({ template: '...' }))
        return (target: ConstructorType<any>) => {
            componentProcess(configOrTarget, target);
        }
    }
};

const componentProcess = (config: ComponentConfig, target: ConstructorType<any>) => {
    if (!config.selector) {
        config.selector = target.name.toLowerCase(); // 셀렉터 기본값 설정
    }
    ReflectUtils.defineMetadata(ComponentMetadataKey, config, target); // 메타데이터 저장
    componentSelectors.set(config.selector.toLowerCase(), target); // 셀렉터와 클래스 매핑 저장
};
```

`@Component` 데코레이터는 클래스에 컴포넌트 관련 메타데이터를 추가하고, `componentSelectors` 맵에 컴포넌트의 셀렉터(태그 이름)와 해당 클래스를 매핑하여 저장합니다. 이 맵은 `Simple-Boot-Front`가 `dom-render`와 연동할 때 사용됩니다.

## 2.2. `dom-render`와의 통합

`Simple-Boot-Front`는 UI 렌더링 엔진으로 `dom-render`를 사용합니다. `dom-render`는 JavaScript `Proxy` 기반의 반응형 시스템과 HTML 템플릿을 직접 조작하는 기능을 제공합니다. `SimpleBootFront`는 `@Component`로 정의된 클래스들을 `dom-render`가 인식할 수 있는 형태로 변환하여 등록합니다.

### `SimpleBootFront.initDomRenderTargetElements` 메소드

이 메소드는 `componentSelectors` 맵에 저장된 모든 컴포넌트들을 순회하며, `dom-render`의 `DomRender.createComponent` 메소드를 사용하여 `dom-render`의 `TargetElement` 객체로 변환합니다. 이렇게 변환된 `TargetElement` 객체들은 `SimpleBootFront`의 `domRenderTargetElements` 배열에 추가되며, 이 배열은 `dom-render`의 `config.targetElements`로 주입됩니다.

```typescript
// SimpleBootFront.ts (개념적)
private initDomRenderTargetElements() {
  const selectors = componentSelectors; // @Component로 등록된 모든 컴포넌트 정보
  selectors.forEach((val, name) => {
    const componentConfig = getComponent(val); // 컴포넌트의 설정(template, styles 등) 가져오기
    const domRenderTargetElement = RawSet.createComponentTargetElement({
      name: name, // HTML 태그 이름 (예: 'my-component')
      noStrip: componentConfig.noStrip,
      objFactory: (element, obj, rawSet, constructorParam) => {
        // 이 팩토리는 dom-render가 컴포넌트를 렌더링할 때 호출됩니다.
        // Simple-Boot의 DI 컨테이너를 통해 컴포넌트 인스턴스를 생성하고 프록시를 적용합니다.
        const newSimInstance = this.simstanceManager.newSim({ target: val });
        // ... 컴포넌트 인스턴스에 추가 프록시 적용 (ComponentConfig.proxy) ...
        return newSimInstance;
      },
      template: componentConfig.template,
      styles: componentConfig.styles
    });
    this.domRenderTargetElements.push(domRenderTargetElement);
  });
}
```

이 과정을 통해 `dom-render`는 HTML 템플릿에서 `<my-component>`와 같은 커스텀 태그를 만나면, `Simple-Boot-Front`가 제공하는 `objFactory`를 호출하여 `@Component` 클래스의 인스턴스를 생성하고, 해당 인스턴스의 데이터와 생명주기를 관리하며 템플릿을 렌더링하게 됩니다.

### 예제: `@Component` 데코레이터와 `dom-render` 통합

템플릿과 스타일은 별도의 파일로 분리하여 관리하는 것이 좋습니다. 이렇게 하면 코드의 재사용성과 유지보수성이 향상됩니다. 웹팩(Webpack)과 같은 빌드 도구의 로더(예: `raw-loader`)를 사용하면 HTML과 CSS 파일을 직접 문자열로 가져와 컴포넌트의 `template`과 `styles` 속성에 주입할 수 있습니다.

`dom-render` 템플릿 문법에 따라 컴포넌트 인스턴스의 속성 및 메소드에 접근할 때는 `@this@` 키워드를 사용합니다.

**`./my-greeting.component.html`**
```html
<div>Hello, ${@this@.name}$!</div>
<button dr-event-click="@this@.changeName()">Change Name</button>
```

**`./my-greeting.component.css`**
```css
my-greeting { 
  display: block; 
  padding: 10px; 
  border: 1px solid blue; 
  margin-bottom: 10px; 
}
my-greeting button { 
  background-color: lightblue; 
  border: none; 
  padding: 5px 10px; 
  cursor: pointer; 
}
```

이제 위 파일들을 컴포넌트에서 `import`하여 사용합니다.

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';

// 위에서 정의한 외부 템플릿과 스타일 파일을 가져옵니다.
// (실제 사용을 위해서는 webpack 설정 등이 필요합니다)
import template from './my-greeting.component.html';
import styles from './my-greeting.component.css';

// 1. 간단한 컴포넌트 정의
@Sim // Simple-Boot DI 컨테이너에 등록
@Component({
  selector: 'my-greeting', // HTML에서 <my-greeting> 태그로 사용
  template, // './my-greeting.component.html' 파일의 내용
  styles,   // './my-greeting.component.css' 파일의 내용
})
class MyGreetingComponent {
  name: string = 'World';

  changeName() {
    this.name = this.name === 'World' ? 'Simple-Boot-Front' : 'World';
    console.log(`Name changed to: ${this.name}`);
  }
}

// 2. 애플리케이션의 루트 컴포넌트 (라우터 역할도 겸함)
@Sim
@Component({
  template: `
    <h1>Simple-Boot-Front App</h1>
    <my-greeting></my-greeting> <!-- 정의한 컴포넌트 사용 -->
    <my-greeting></my-greeting> <!-- 여러 번 사용 가능 -->
  `
})
class AppRootComponent {}

// 3. SimpleBootFront 인스턴스 생성 및 설정
const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent) // 루트 컴포넌트를 라우터로 설정 (여기서는 단순 컴포넌트 렌더링 목적)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);

// 4. 애플리케이션 실행
app.run();

console.log('Simple-Boot-Front component example started.');

/* 예상 출력 (브라우저 콘솔):
Name changed to: Simple-Boot-Front
Name changed to: World
...
(버튼 클릭 시마다 name 속성이 변경되고, dom-render에 의해 UI가 자동 업데이트됨)
*/
```

## 2.3. 컴포넌트 생명주기

`Simple-Boot-Front`의 컴포넌트는 `Simple-Boot Core`의 생명주기 콜백과 `dom-render`의 생명주기 훅을 모두 활용합니다. 이를 통해 컴포넌트의 생성, 초기화, 렌더링, 소멸 등 다양한 시점에 특정 로직을 실행할 수 있습니다.

-   **`Simple-Boot Core` 생명주기:**
    -   `OnSimCreate`: DI 컨테이너에 의해 인스턴스가 생성된 직후.
    -   `@PostConstruct`: 인스턴스 생성 후 특정 메소드 호출.
    -   `OnSimCreateCompleted`: 인스턴스 생성 및 모든 프록시/AOP 적용 완료 후.

-   **`dom-render` 생명주기:**
    -   `OnCreateRender`: 컴포넌트가 DOM에 렌더링되기 직전 (데이터 바인딩 전).
    -   `OnInitRender`: 컴포넌트의 초기 렌더링이 완료된 후.
    -   `OnDestroyRender`: 컴포넌트가 DOM에서 제거될 때.

이러한 생명주기 훅들을 조합하여 컴포넌트의 복잡한 초기화 및 정리 로직을 체계적으로 관리할 수 있습니다.

### 예제: 컴포넌트 생명주기 훅 사용

생명주기 예제 컴포넌트도 템플릿과 스타일을 외부 파일로 분리할 수 있습니다.

**`./my-lifecycle.component.html`**
```html
<div>Lifecycle Test: ${@this@.message}$</div>
```

**`./my-lifecycle.component.css`**
```css
my-lifecycle-component { 
  border: 1px dashed green; 
  padding: 10px; 
  margin-bottom: 10px; 
}
```

이제 이 파일들을 생명주기 컴포넌트 예제에서 사용합니다.

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { OnSimCreate, PostConstruct, OnSimCreateCompleted } from '@dooboostore/simple-boot/lifecycle/OnSimCreate'; // Simple-Boot Core 생명주기
import { OnCreateRender, OnInitRender, OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender'; // dom-render 생명주기

// 외부 템플릿 및 스타일 파일 임포트
import template from './my-lifecycle.component.html';
import styles from './my-lifecycle.component.css';

@Sim
@Component({
  selector: 'my-lifecycle-component',
  template, // './my-lifecycle.component.html' 파일의 내용
  styles,   // './my-lifecycle.component.css' 파일의 내용
})
class MyLifecycleComponent implements 
  OnSimCreate, 
  PostConstruct, 
  OnSimCreateCompleted<MyLifecycleComponent>, 
  OnCreateRender, 
  OnInitRender, 
  OnDestroyRender 
{
  message: string = 'Initial';

  constructor() {
    console.log('1. Constructor: Component instance created.');
  }

  onSimCreate(): void {
    console.log('2. OnSimCreate: DI container finished creating instance.');
    this.message = 'OnSimCreate';
  }

  @PostConstruct()
  postConstructMethod() {
    console.log('3. @PostConstruct: Specific method called after construction.');
    this.message = 'PostConstruct';
  }

  onSimCreateProxyCompleted(proxyThis: MyLifecycleComponent): void {
    console.log('4. OnSimCreateCompleted: All proxies/AOP applied. Final instance ready.');
    this.message = 'OnSimCreateCompleted';
  }

  onCreateRender(): void {
    console.log('5. OnCreateRender: dom-render is about to render this component.');
    this.message = 'OnCreateRender';
  }

  onInitRender(): void {
    console.log('6. OnInitRender: Initial rendering by dom-render completed.');
    this.message = 'OnInitRender';
  }

  onDestroyRender(): void {
    console.log('7. OnDestroyRender: Component is being removed from DOM.');
    // 리소스 정리, 이벤트 리스너 해제 등
  }
}

@Sim
@Component({
  template: `
    <h1>Lifecycle App</h1>
    <button dr-event-click="@this@.toggleComponent()">Toggle Component</button>
    <my-lifecycle-component dr-if="@this@.showComponent"></my-lifecycle-component>
  `
})
class AppRootComponent {
  showComponent: boolean = true;

  toggleComponent() {
    this.showComponent = !this.showComponent;
    console.log('\n--- Toggling component visibility to:', this.showComponent, '---');
  }
}

const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Simple-Boot-Front lifecycle example started.');

/* 예상 출력 (콘솔):
1. Constructor: Component instance created.
2. OnSimCreate: DI container finished creating instance.
3. @PostConstruct: Specific method called after construction.
4. OnSimCreateCompleted: All proxies/AOP applied. Final instance ready.
5. OnCreateRender: dom-render is about to render this component.
6. OnInitRender: Initial rendering by dom-render completed.

--- Toggling component visibility to: false ---
7. OnDestroyRender: Component is being removed from DOM.

--- Toggling component visibility to: true ---
1. Constructor: Component instance created.
2. OnSimCreate: DI container finished creating instance.
3. @PostConstruct: Specific method called after construction.
4. OnSimCreateCompleted: All proxies/AOP applied. Final instance ready.
5. OnCreateRender: dom-render is about to render this component.
6. OnInitRender: Initial rendering by dom-render completed.
*/
*/

이 장에서는 `Simple-Boot-Front`의 컴포넌트 시스템과 `dom-render`와의 통합, 그리고 다양한 생명주기 훅들을 살펴보았습니다. 다음 장에서는 SPA의 핵심인 라우팅과 내비게이션 시스템에 대해 알아보겠습니다.

```