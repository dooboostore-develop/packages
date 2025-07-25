# 제1장: 모든 것의 시작 - 반응성이란 무엇인가?

프레임워크의 심장은 '반응성(Reactivity)'입니다. 반응성이란 **데이터(상태, State)가 변경되었을 때, 이 데이터를 사용하는 사용자 인터페이스(UI)가 자동으로 업데이트되는 것**을 의미합니다. 이 장에서는 현대 프레임워크들이 반응성을 어떻게 구현하는지 비교해보고, `dom-render`의 기반이 되는 JavaScript `Proxy`에 대해 깊이 알아봅니다.

## 1.1. 현대 프레임워크의 반응성 모델 비교

-   **Virtual DOM (React):** 데이터가 변경되면, 메모리상에 가상의 DOM 트리를 새로 만듭니다. 그리고 이전의 가상 DOM 트리와 비교하여 변경된 부분(diffing)을 찾아내 실제 DOM에 한 번에 적용합니다. 이 방식은 DOM 조작을 최소화하지만, 메모리 사용량과 비교 연산 비용이 발생합니다.

-   **컴파일러 기반 (Svelte):** 빌드 시점에 코드를 분석하여, 어떤 데이터가 변경될 때 DOM의 어느 부분을 직접 수정해야 하는지에 대한 고도로 최적화된 코드를 생성합니다. 런타임에 가상 DOM이나 복잡한 비교 과정이 없어 매우 빠르지만, 프레임워크가 "마법"처럼 보일 수 있습니다.

-   **Proxy 기반 (Vue 3, `dom-render`):** `dom-render`가 채택한 방식입니다. 데이터 객체를 `Proxy`로 감싸서, 속성에 접근(`get`)하거나 값을 변경(`set`)하는 동작을 가로챕니다. 이를 통해 어떤 데이터가 어디서 사용되는지(의존성)를 정확히 추적하고, 변경 시 필요한 부분만 정밀하게 업데이트할 수 있습니다. 가상 DOM의 메모리 오버헤드가 없고, Svelte처럼 빌드 과정에 전적으로 의존하지도 않는 균형 잡힌 접근법입니다.

## 1.2. JavaScript `Proxy` 심층 탐구

`Proxy`는 객체에 대한 기본적인 동작(속성 접근, 할당, 순회 등)을 가로채고 재정의할 수 있는 특별한 객체입니다. 우리는 주로 `get`과 `set`이라는 두 가지 '트랩(trap)'을 사용합니다.

```javascript
// 순수한 데이터 객체
const user = {
  name: 'Alice',
  age: 30
};

// Proxy 핸들러: 트랩들을 정의하는 객체
const handler = {
  get(target, property) {
    console.log(`'${property}' 속성에 접근했습니다.`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`'${property}' 속성을 '${value}'(으)로 변경합니다.`);
    target[property] = value;
    return true; // set 트랩은 성공 시 true를 반환해야 합니다.
  }
};

// Proxy 객체 생성
const reactiveUser = new Proxy(user, handler);

// 사용 예시
console.log(reactiveUser.name); // "'name' 속성에 접근했습니다." 출력 후 "Alice" 출력
reactiveUser.age = 31;          // "'age' 속성을 '31'(으)로 변경합니다." 출력
```

이 간단한 예제가 `dom-render` 반응성의 핵심입니다. `get`을 할 때 "누가 이 데이터를 사용하는지" 기록하고, `set`을 할 때 "이 데이터를 사용하던 모두에게 변경 사실을 알리는" 로직을 추가하면 됩니다.

## 1.3. 의존성 추적(Dependency Tracking)의 개념

의존성 추적은 다음 두 단계로 이루어집니다.

1.  **의존성 수집 (Dependency Collection):** 코드가 실행되는 동안(`get` 트랩이 호출될 때), 현재 실행 중인 작업(예: 특정 DOM 요소를 업데이트하는 함수)을 특정 데이터 속성과 연결합니다. "`user.name`이 변경되면, 이 DOM 요소를 업데이트해야 해"라고 기록해두는 것과 같습니다.

2.  **변경 알림 (Change Notification):** 데이터가 변경되면(`set` 트랩이 호출될 때), 해당 속성에 연결된 모든 작업(DOM 업데이트 함수들)을 다시 실행합니다.

이 개념을 코드로 표현하면 다음과 같습니다.

```javascript
// 의존성을 저장할 맵: { target -> { property -> [effect1, effect2, ...] } }
const dependencyMap = new WeakMap();

// 현재 실행 중인 effect를 저장할 변수
let activeEffect = null;

// 의존성을 추적하는 함수
function track(target, property) {
  if (activeEffect) {
    let depsMap = dependencyMap.get(target);
    if (!depsMap) {
      dependencyMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(property);
    if (!deps) {
      depsMap.set(property, (deps = new Set()));
    }
    deps.add(activeEffect);
  }
}

// 변경 알림을 보내는 함수
function trigger(target, property) {
  const depsMap = dependencyMap.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(property);
  if (deps) {
    deps.forEach(effect => effect());
  }
}

// Proxy 핸들러에 적용
const handler = {
  get(target, property) {
    track(target, property);
    return target[property];
  },
  set(target, property, value) {
    target[property] = value;
    trigger(target, property);
    return true;
  }
};

// effect 함수: UI 업데이트 등 실제 작업을 수행하는 함수
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// --- 사용 예시 ---
const user = new Proxy({ name: 'Bob' }, handler);

effect(() => {
  // 이 함수는 user.name에 의존합니다.
  console.log('User name is:', user.name);
});

// user.name을 변경하면, 위 effect 함수가 자동으로 다시 실행됩니다.
user.name = 'Charlie'; // "User name is: Charlie"가 다시 출력됨
```

이제 우리는 프레임워크의 가장 근본적인 부분인 반응성 시스템의 원리를 이해했습니다. 다음 장에서는 이 반응성 시스템을 실제 DOM과 연결하는 템플릿 엔진을 만들어 보겠습니다.
