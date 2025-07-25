# 제3장: 반응성 주입 - `DomRenderProxy`의 탄생

지금까지 우리는 두 개의 독립적인 조각, 즉 데이터 변경을 감지하는 '반응성 시스템'과 데이터를 화면에 그리는 '템플릿 엔진'을 만들었습니다. 이 장에서는 이 둘을 하나로 엮어 `dom-render`의 핵심인 `DomRenderProxy`를 완성합니다. 이 과정을 통해 데이터의 변경이 어떻게 자동으로 DOM 업데이트로 이어지는지 그 비밀을 파헤칩니다.

## 3.1. 1장과 2장의 결합

핵심 아이디어는 간단합니다. **"데이터에 접근(`get`)할 때, 어떤 `RawSet`이 그 데이터에 의존하는지 기록하고, 데이터가 변경(`set`)될 때, 기록된 모든 `RawSet`을 다시 렌더링한다."**

이를 위해 1장에서 만든 `Proxy` 핸들러와 `activeEffect` 개념을 `RawSet` 렌더링 과정에 통합합니다.

1.  **`RawSet.render` 메소드 수정:** `RawSet`을 렌더링하기 직전에, 해당 `RawSet` 자신을 전역 변수(예: `activeRawSet`)에 할당합니다.

2.  **`Proxy`의 `get` 트랩 수정:** `get` 트랩은 이제 `activeEffect` 대신 `activeRawSet`을 확인합니다. 만약 `activeRawSet`이 존재한다면, 현재 접근 중인 데이터 속성(예: `user.name`)과 `activeRawSet`을 의존성 맵에 연결합니다.

3.  **`Proxy`의 `set` 트랩 수정:** `set` 트랩은 변경된 속성(예: `user.name`)에 연결된 모든 `RawSet`을 의존성 맵에서 찾아, 각각의 `render` 메소드를 다시 호출합니다.

```javascript
// DomRenderProxy.ts의 개념적 흐름

let activeRawSet = null; // 현재 렌더링 중인 RawSet

class DomRenderProxy {
  // ... Proxy 핸들러 ...
  get(target, property) {
    // 2. get 트랩: activeRawSet이 있다면 의존성 기록
    if (activeRawSet) {
      track(target, property, activeRawSet);
    }
    return target[property];
  }

  set(target, property, value) {
    target[property] = value;
    // 3. set 트랩: 의존하는 모든 RawSet을 찾아 재렌더링
    const dependentRawSets = findDependentRawSets(target, property);
    dependentRawSets.forEach(rawSet => rawSet.render());
    return true;
  }
}

class RawSet {
  render(obj, config) {
    // 1. 렌더링 직전, 자신을 activeRawSet으로 설정
    activeRawSet = this;
    
    // ... 템플릿 표현식 평가 및 DOM 생성 로직 ...
    // 이 과정에서 obj의 속성에 접근하면 Proxy의 get 트랩이 호출됨
    const value = ScriptUtils.evalReturn(this.expression, obj);
    // ...

    // 렌더링 완료 후, activeRawSet을 초기화
    activeRawSet = null;
  }
}
```

## 3.2. 재귀적 Proxy 적용

`user.profile.name`과 같이 중첩된 객체의 변경도 감지해야 합니다. 이는 `Proxy`를 재귀적으로 적용하여 해결합니다.

`DomRenderProxy`의 `set` 트랩이나 객체 초기화 시점에, 새로 할당되는 값이 객체이고 아직 `Proxy`가 아니라면, 그 객체에 대해서도 새로운 `DomRenderProxy`를 생성하여 감싸줍니다.

이때 중요한 것은 **부모-자식 관계를 의존성 맵에 기록**하는 것입니다. `dom-render`에서는 이를 `_domRender_ref` 속성에 저장합니다. 예를 들어, `user` 객체의 `profile` 속성에 새로운 객체가 할당되면, `profile` 객체의 `Proxy`는 `user` 객체를 자신의 부모로 참조합니다.

이렇게 하면, `user.profile.name`이 변경되었을 때, `profile` 객체의 `set` 트랩이 먼저 호출되고, 이 변경은 부모인 `user` 객체에게도 전파될 수 있습니다. `DomRenderProxy`의 `root` 메소드는 이러한 참조 관계를 역으로 거슬러 올라가, 최종적으로 어떤 `RawSet`이 재렌더링되어야 하는지를 찾는 복잡한 로직을 수행합니다.

## 3.3. `DomRender.run`의 완성

이제 모든 조각을 맞춰 최종적인 진입점(Entry Point)인 `DomRender.run` 클래스 메소드를 완성할 수 있습니다.

`DomRender.run(rootObject, targetElement, config)`가 호출되면 일어나는 일은 다음과 같습니다.

1.  **`DomRenderProxy` 생성:** 사용자가 전달한 순수 데이터 객체(`rootObject`)를 `DomRenderProxy`로 감싸서 반응형 객체로 만듭니다.

2.  **초기 렌더링:**
    a.  `targetElement`의 `innerHTML`을 파싱하여 초기 `RawSet`들을 생성합니다 (`RawSet.checkPointCreates`).
    b.  생성된 모든 `RawSet`의 `render` 메소드를 처음으로 호출합니다.

3.  **의존성 수집:** 초기 렌더링 과정에서 각 `RawSet`이 템플릿 표현식을 평가하기 위해 반응형 객체의 속성에 접근(`get`)할 때마다, 의존성 맵이 자동으로 채워집니다.

4.  **반환:** `Proxy`로 감싸진 반응형 객체를 사용자에게 반환합니다.

이제 사용자가 반환된 객체의 속성을 변경하면, `set` 트랩이 자동으로 호출되고, 의존성 맵에 따라 필요한 `RawSet`들이 정밀하게 재렌더링됩니다. 이로써 데이터와 DOM이 완벽하게 동기화되는 반응형 시스템이 완성되었습니다.

### 구현 예제: Quick Start

다음은 지금까지 설명한 모든 개념이 어떻게 실제로 동작하는지 보여주는 간단한 예제입니다.

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>examples</title>
</head>
<body id="app">
<h1>
    ${this.name}$
</h1>
<ul>
    <li dr-for-of="this.friends">
    ${#it#.name}$
    </li>
</ul>
<button dr-event-click="alert(1)">
rr
</button>
</body>
</html>
```

**`index.ts`**
```typescript
import {DomRender} from '@dooboostore/dom-render';

class Data {
    name = 'my name is dom-render';
    friends = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
}

const data = DomRender.run({
    rootObject: () => new Data(), 
    target: document.querySelector('#app')!, 
    config: { window: window }
});

setInterval(() => {
    // 1초마다 name 속성을 변경하면, <h1> 태그의 내용이 자동으로 업데이트됩니다.
    data.rootObject.name = Date.now().toString();
}, 1000);
```

이 예제에서 `DomRender.run`은 `Data` 클래스의 인스턴스를 반응형 객체로 만들고, `#app` 요소를 렌더링 대상으로 지정합니다. `setInterval` 함수가 1초마다 `data.rootObject.name`을 변경하면, `DomRenderProxy`의 `set` 트랩이 이 변경을 감지하고, `name` 속성에 의존하는 `<h1>` 태그에 연결된 `RawSet`을 찾아 재렌더링하여 화면을 업데이트합니다.

다음 장에서는 `dr-if`, `dr-for`와 같은 지시어(Directive)를 구현하여, 단순한 값 치환을 넘어 프로그램적인 제어 흐름을 템플릿에 도입하는 방법을 알아보겠습니다.
