# 제5장: 생명과 영혼을 불어넣다 - 컴포넌트 시스템

애플리케이션이 복잡해지면 코드의 재사용성과 관리가 중요해집니다. 컴포넌트(Component)는 UI를 독립적이고 재사용 가능한 조각으로 나눈 단위로, 현대 프레임워크의 가장 중요한 개념 중 하나입니다. 이 장에서는 로직(JavaScript 클래스)과 뷰(HTML 템플릿)를 캡슐화하여 `dom-render`의 컴포넌트 시스템을 구축하는 방법을 알아봅니다.

## 5.1. `DomRender.createComponent` 설계

컴포넌트는 본질적으로 **"어떤 태그 이름이 사용되었을 때, 어떤 클래스를 인스턴스화하고 어떤 템플릿으로 렌더링할 것인가"**에 대한 규칙입니다. `DomRender.createComponent`는 이 규칙을 정의하는 팩토리 함수입니다.

여기서 주목할 점은 `dom-render`가 브라우저의 내장 Web Component 표준(Custom Elements, Shadow DOM 등)을 직접 사용하지 않고, 자체적인 컴포넌트 메커니즘을 구현한다는 것입니다. 이는 프레임워크가 렌더링 과정과 스코프 관리에 대한 완전한 제어권을 가지며, 특정 브라우저 환경에 덜 의존적인 일관된 동작을 보장하기 위함입니다.

```javascript
// DomRender.ts
public static createComponent(param: CreateComponentParam) {
  // CreateComponentParam: { type: 클래스, tagName: 'custom-tag', template: '...', styles: '...' }
  const component = RawSet.createComponentTargetElement({
    name: param.tagName, // 예: 'profile-card'
    objFactory: (element, obj, rawSet, constructorParam) => {
      // 이 함수는 <profile-card> 태그를 만났을 때 호출됩니다.
      // param.type에 해당하는 클래스를 인스턴스화하여 반환합니다.
      return new param.type(...constructorParam);
    },
    template: param.template, // 이 컴포넌트의 내부 HTML 템플릿
    styles: param.styles,     // 이 컴포넌트에만 적용될 스타일
    noStrip: param.noStrip
  });
  return component;
}
```

이렇게 생성된 "규칙" 객체는 `DomRender.run`의 `config.targetElements` 배열에 추가됩니다. 렌더링 과정에서 `DrTargetElement` Operator는 HTML 태그 이름이 `config.targetElements`에 등록된 이름과 일치하는지 확인하고, 일치한다면 해당 컴포넌트의 `callBack` (내부적으로 `objFactory` 호출)을 실행하여 컴포넌트를 인스턴스화하고 렌더링합니다.

## 5.2. 생명주기(Lifecycle) 훅 구현

컴포넌트는 생성되고, DOM에 추가되고, 데이터가 변경되며, 결국 DOM에서 제거되는 생명주기를 가집니다. 프레임워크는 이 생명주기의 특정 시점에 사용자가 정의한 코드를 실행할 수 있도록 **생명주기 훅(Lifecycle Hook)**을 제공해야 합니다.

`dom-render`는 인터페이스(Interface)를 통해 이를 구현합니다.

-   **`OnCreateRender`**: 컴포넌트 인스턴스가 생성되고, 초기 데이터가 설정된 직후에 호출됩니다. DOM에 실제로 삽입되기 전이므로, 초기화 로직에 적합합니다.
-   **`OnInitRender`**: 컴포넌트와 그 모든 자식 요소의 렌더링이 완료된 후 호출됩니다. DOM 요소에 직접 접근해야 하는 로직(예: `canvas` 컨텍스트 가져오기)을 여기에 배치합니다.
-   **`OnDestroyRender`**: 컴포넌트가 DOM에서 제거될 때 호출됩니다. 이벤트 리스너를 해제하거나 타이머를 정리하는 등의 클린업(clean-up) 로직을 수행합니다.

구현은 간단합니다. `DrTargetElement` Operator가 컴포넌트를 처리하는 각 단계에서, 해당 컴포넌트 인스턴스가 특정 생명주기 인터페이스의 메소드(예: `onCreateRender`)를 가지고 있는지 확인하고, 있다면 호출해주는 방식입니다.

```typescript
// DrTargetElement.ts의 개념적 로직
// ... 컴포넌트 인스턴스 생성 후 ...
const instance = objFactory(...);

// OnCreateRender 훅 호출
if (isOnCreateRender(instance)) {
  instance.onCreateRender(...);
}

// ... 렌더링 완료 후 ...
// OnInitRender 훅 호출
if (isOnInitRender(instance)) {
  instance.onInitRender(...);
}
```

## 5.3. 스코프 격리와 데이터 흐름

컴포넌트는 독립적인 스코프(Scope)를 가져야 합니다. 컴포넌트 내부의 `this`는 외부가 아닌 컴포넌트 인스턴스 자신을 가리켜야 합니다. `dr-this` 지시어는 이 스코프 변경을 담당합니다.

`DrThis` Operator는 `dr-this` 속성에 지정된 객체(예: `this.__domrender_components.some_uuid`)를 새로운 렌더링 컨텍스트로 설정하고, 그 자식 노드들을 해당 컨텍스트에서 렌더링합니다.

데이터 흐름(Props)은 어떻게 구현할까요? `dom-render`는 `dr-on-create:callback`이나 `dr-detect` 같은 속성을 통해 이를 해결합니다. 부모 스코프에서 자식 컴포넌트의 속성을 설정하는 스크립트를 실행하는 방식입니다.

```html
<!-- 부모 템플릿 -->
<profile-card dr-detect="$component.age = @this@.age"></profile-card>
```

위 코드에서 `$component`는 `profile-card` 컴포넌트의 인스턴스를, `@this@`는 부모의 컨텍스트를 가리킵니다. `DrTargetElement` Operator는 컴포넌트를 렌더링할 때 이 `dr-detect` 스크립트를 평가하여 부모의 `age`를 자식의 `age`에 할당합니다. 부모의 `age`가 반응형 데이터라면, 이 변경은 자동으로 자식에게 전파됩니다.

## 5.4. 격리된 스타일(Scoped Styles) 구현

컴포넌트의 스타일이 다른 컴포넌트에 영향을 주지 않도록 하려면 스타일을 해당 컴포넌트 내부에만 적용해야 합니다. 이를 **스코프 스타일(Scoped Styles)**이라고 합니다.

`dom-render`는 컴포넌트 렌더링 시 고유한 UUID를 생성하고, 이를 이용해 스타일을 격리합니다.

1.  **CSS 파싱:** `DomRender.createComponent`에 전달된 CSS 문자열을 `css-parse` 라이브러리를 사용해 AST(추상 구문 트리)로 변환합니다.

2.  **셀렉터 변환:** CSS AST를 순회하며 모든 셀렉터(예: `.title`, `p`)를 변환합니다. 예를 들어, `.title`은 `#component-uuid-start ~ .title:not(#component-uuid-start ~ #component-uuid-end ~ *)` 와 같은 복잡한 형태로 변경됩니다. 이 셀렉터는 "`#component-uuid-start` 요소 뒤에 있으면서, 그 컴포넌트의 끝을 나타내는 `#component-uuid-end` 요소의 자손은 아닌 `.title` 요소"를 의미합니다.

3.  **CSS 재생성 및 삽입:** 변환된 AST를 `css-stringify`를 사용해 다시 CSS 문자열로 만들고, 이 내용을 담은 `<style>` 태그를 컴포넌트의 템플릿 최상단에 삽입합니다.

이 과정을 통해 각 컴포넌트는 자신만의 고유한 스타일 스코프를 갖게 되어 스타일 충돌 문제를 원천적으로 방지합니다.

이제 우리의 프레임워크는 재사용 가능하고, 캡슐화되었으며, 자체적인 생명주기와 스타일을 갖는 컴포넌트를 만들어낼 수 있게 되었습니다. 마지막 장에서는 라우팅, 상태 관리 등 프레임워크를 완성하는 고급 기능들을 구현하고 전체 프로젝트를 빌드하는 방법을 다루겠습니다.