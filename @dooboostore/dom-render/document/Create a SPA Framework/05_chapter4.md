# 제4장: 제어 흐름 구현 - 지시어(Directive) 시스템

지금까지 만든 템플릿 엔진은 데이터를 DOM에 표시할 수는 있지만, 조건에 따라 요소를 보여주거나 숨기고, 배열 데이터를 목록으로 표시하는 등의 동적인 구조 변경은 불가능합니다. 이 장에서는 `dr-if`, `dr-for-of`와 같은 특별한 HTML 속성, 즉 **지시어(Directive)**를 구현하여 템플릿에 프로그래밍적인 제어 흐름을 부여합니다.

## 4.1. Operator(연산자) 패턴 설계

`dr-if`, `dr-for-of` 등 각 지시어는 고유한 로직을 가집니다. 이를 체계적으로 관리하기 위해 `dom-render`는 **Operator(연산자) 패턴**을 사용합니다.

-   각 지시어(`dr-if`, `dr-for-of` 등)는 자신만의 로직을 가진 `Operator` 클래스(예: `DrIf`, `DrForOf`)와 일대일로 대응됩니다.
-   `RawSet`이 렌더링될 때, 자신의 엘리먼트에 어떤 `dr-*` 속성이 있는지 확인하고, 해당하는 `Operator` 클래스를 인스턴스화하여 실행을 위임합니다.
-   이 패턴은 각 지시어의 로직을 독립적으로 분리하여 코드의 유지보수성과 확장성을 높입니다. 새로운 지시어를 추가하고 싶다면, 새로운 `Operator` 클래스를 만들기만 하면 됩니다.

`OperatorExecuter`는 모든 Operator 클래스가 상속받는 추상 클래스로, `execute`라는 공통 메소드를 정의하여 렌더링 로직 실행을 표준화합니다.

## 4.2. `dr-if` 구현하기

`dr-if`는 가장 기본적인 제어 흐름 지시어입니다. `DrIf` Operator의 `execute` 메소드는 다음과 같은 로직을 수행합니다.

1.  **표현식 평가:** `dr-if` 속성의 값(예: `"this.user.isLoggedIn"`)을 JavaScript 표현식으로 평가하여 `true` 또는 `false` 값을 얻습니다.

2.  **DOM 조작:**
    -   **결과가 `true`일 때:** 템플릿 엘리먼트의 복사본(`cloneNode`)을 만들고, 이 복사본을 `RawSet`의 위치(시작과 끝 주석 사이)에 삽입합니다. 그리고 이 새로운 DOM 조각에 대해 `RawSet.checkPointCreates`를 재귀적으로 호출하여 내부의 다른 동적 요소들도 처리하도록 합니다.
    -   **결과가 `false`일 때:** `RawSet`의 위치에 있는 모든 DOM 노드를 제거합니다.

3.  **상태 저장:** `DrIf` Operator는 이전에 평가된 값을 기억하고 있어야 합니다. 만약 이전 값과 현재 값이 같다면, DOM을 조작할 필요가 없므로 렌더링을 건너뛰어 성능을 최적화합니다.

```javascript
// DrIf.ts의 개념적 로직
class DrIf extends OperatorExecuterAttrRequire<string> {
  async executeAttrRequire(attr: string): Promise<ExecuteState> {
    // 1. 표현식 평가
    const condition = ScriptUtils.evalReturn(attr, this.source.obj);

    // 3. 이전 상태와 비교하여 변경이 없으면 중단
    if (this.rawSet.data === condition) {
      return ExecuteState.STOP;
    }
    this.rawSet.data = condition; // 현재 상태 저장

    // 2. DOM 조작
    if (condition) {
      // 엘리먼트 복사 및 삽입
      const newElement = this.elementSource.element.cloneNode(true);
      // ... newElement에서 dr-if 속성 제거 ...
      this.returnContainer.fag.append(newElement);
    } else {
      // 자식 노드 없음 (결과적으로 아무것도 렌더링하지 않음)
    }

    // ... 부모 노드에 최종 DocumentFragment를 연결하고, 재귀적 RawSet 생성 ...
    return ExecuteState.EXECUTE;
  }
}
```

## 4.3. `dr-for-of` 와 `dr-appender` 구현하기

`dr-for-of`는 배열 데이터를 다루기 때문에 `dr-if`보다 복잡합니다. `DrForOf` Operator는 다음과 같이 동작합니다.

1.  **배열 데이터 평가:** `dr-for-of` 속성의 값(예: `"this.users"`)을 평가하여 순회할 배열을 얻습니다.

2.  **루프 실행:** 배열의 각 아이템에 대해 다음을 반복합니다.
    a.  원본 엘리먼트를 `cloneNode(true)`로 복제합니다.
    b.  **스코프 생성:** 복제된 엘리먼트 내부에서 `#it#`이나 `#nearForOfIndex#` 같은 특수 변수를 사용할 수 있도록 처리합니다. `dom-render`는 템플릿을 파싱할 때 이런 변수들을 임시 고유 문자열로 바꾸고, 렌더링 시점에 실제 값(배열의 현재 아이템, 인덱스 등)으로 다시 치환하는 방식을 사용합니다.
    c.  처리된 엘리먼트를 최종 결과물인 `DocumentFragment`에 추가합니다.

3.  **DOM 교체:** 반복이 끝나면, 생성된 `DocumentFragment`로 `RawSet`의 위치에 있는 기존 DOM을 통째로 교체합니다.

```javascript
// DrForOf.ts의 개념적 로직
class DrForOf extends OperatorExecuterAttrRequire<string> {
  async executeAttrRequire(attr: string): Promise<ExecuteState> {
    // 1. 배열 데이터 평가
    const collection = ScriptUtils.evalReturn(attr, this.source.obj);

    if (collection) {
      let index = -1;
      for (const item of collection) {
        index++;
        // 2a. 엘리먼트 복제
        const newElement = this.elementSource.element.cloneNode(true);
        
        // 2b. 스코프 변수 치환
        // 'destIt'은 '#it#'에 해당하는 실제 데이터 경로 (예: 'this.users[0]')
        const destIt = `${attr}[${index}]`; 
        newElement.innerHTML = newElement.innerHTML.replace(/#it#/g, destIt).replace(/#nearForOfIndex#/g, index);
        // ... 다른 속성들도 치환 ...

        // 2c. 최종 결과물에 추가
        this.returnContainer.fag.append(newElement);
      }
    }
    // ... DOM 교체 및 재귀적 RawSet 생성 ...
    return ExecuteState.EXECUTE;
  }
}
```

### `dr-appender`: 추가(Append)에 최적화된 리스트 렌더링

`dr-for-of`는 배열이 변경될 때마다 전체 목록을 다시 그리는 단순한 접근 방식을 사용합니다. 이는 데이터가 적을 때는 문제가 없지만, 아이템이 많은 리스트에 새로운 항목 하나를 추가하는 경우 매우 비효율적일 수 있습니다.

`dr-appender`는 이러한 문제를 해결하기 위해 고안된, "추가" 작업에 특화된 지시어입니다. `DrAppender` Operator는 `dr-for-of`를 영리하게 활용하여 전체를 다시 그리지 않고 새 항목만 추가합니다.

1.  **동적 `dr-for-of` 생성:** `DrAppender`는 템플릿을 직접 반복 실행하지 않습니다. 대신, 런타임에 `dr-for-of` 속성을 가진 새로운 엘리먼트를 생성합니다.
2.  **마지막 항목만 타겟팅:** 생성된 `dr-for-of`는 전체 배열이 아닌, 배열의 **마지막 항목**(`appender[appender.length - 1]`)만을 가리키도록 설정됩니다.
3.  **다음 항목 예약:** 동시에 `dr-option-next`라는 내부용 속성을 추가하여, 다음 렌더링 사이클에서 처리해야 할 다음 항목(`appender,appender.length`)을 예약합니다.

이 방식을 통해, `Appender` 객체에 `push`가 발생했을 때, 프레임워크는 전체 리스트를 다시 그리는 대신 마지막에 추가된 항목에 대해서만 렌더링 로직을 수행하게 됩니다. 이는 Keyed-Diffing의 완전한 구현은 아니지만, 리스트의 끝에 데이터를 추가하는 흔한 시나리오에서 매우 효과적인 최적화 기법입니다.

> **고급 주제: Keyed-Diffing**
> 실제 고성능 프레임워크에서는 `dr-for-of`를 구현할 때, 배열의 아이템이 추가/삭제/순서 변경될 때마다 모든 DOM을 지우고 새로 그리지 않습니다. 각 아이템에 고유한 `key`를 부여하고, 이전 렌더링 결과와 비교하여 최소한의 DOM 조작(이동, 추가, 삭제)만 수행하는 **Keyed-Diffing** 알고리즘을 사용합니다. `dom-render`는 현재 이 방식을 완전히 구현하지는 않았지만, 이는 프레임워크 성능 최적화의 핵심적인 다음 단계가 될 수 있습니다.

이제 우리의 프레임워크는 단순한 데이터 표시를 넘어, 조건과 반복을 통해 동적인 UI 구조를 만들어낼 수 있게 되었습니다.

### 구현 예제: Appender

다음은 `dr-appender`를 사용하여 동적으로 리스트를 조작하는 예제입니다.

**`index.ts`의 컴포넌트 설정 부분**
```typescript
import { DomRender } from '@dooboostore/dom-render';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';

// ... (다른 클래스 정의)

export class Sub {
  // Appender 객체를 생성합니다.
  appender = new Appender();

  constructor(public name: string) {
    // 초기 데이터로 1, 2를 추가합니다.
    this.appender.push(1, 2);
  }

  add(): void {
    // 새로운 UUID를 생성하여 Appender에 추가(set)합니다.
    const uuid = RandomUtils.uuid();
    this.appender.set(uuid, `new item ${uuid.substring(0, 4)}`);
  }

  delete(): void {
    // Appender의 모든 항목을 지웁니다.
    this.appender.clear();
  }
  
  change(): void {
    // 기존 항목의 값을 변경합니다.
    if (this.appender.list.length > 0) {
        const firstKey = this.appender.list[0][0];
        this.appender.set(firstKey, `changed item ${Date.now()}`);
    }
  }
}

export class Index {
  // Sub 컴포넌트를 생성하고, 템플릿에서 dr-appender를 사용합니다.
  child = new ComponentSet(new Sub('sub0'), {
    template: `
      <div>
        <h1>Appender Example</h1>
        <button dr-event-click="@this@.add()">Add</button>
        <button dr-event-click="@this@.delete()">Delete</button>
        <button dr-event-click="@this@.change()">Change First</button>
        
        <!-- 
          dr-appender는 @this@.appender 객체와 바인딩됩니다.
          dr-option-this="#it#"는 각 아이템의 스코프를 #it#으로 설정합니다.
        -->
        <div dr-appender="@this@.appender" dr-option-this="#it#">
          Key: ${#it#}$ - Value: ${#it#}$
        </div>
      </div>
    `
  });
}

// DomRender 실행
DomRender.run({ 
  rootObject: new Index(), 
  target: document.querySelector('#app')!
});
```

이 예제에서 `Sub` 클래스는 `Appender` 인스턴스를 가지고 있으며, `add`, `delete`, `change` 메소드를 통해 이 리스트를 조작합니다. `Index` 컴포넌트의 템플릿에서는 `dr-appender` 지시어가 `Sub` 컴포넌트의 `appender` 객체에 바인딩됩니다.

-   **`Add` 버튼 클릭 시:** `appender.set()`이 호출되면, `DrAppender` Operator는 전체 리스트를 다시 그리지 않고, 새로 추가된 항목에 대한 DOM만 생성하여 리스트의 끝에 추가합니다.
-   **`Delete` 버튼 클릭 시:** `appender.clear()`가 호출되면, `DrAppender`는 관련된 모든 DOM 노드를 효율적으로 제거합니다.
-   **`Change First` 버튼 클릭 시:** `appender.set()`으로 기존 키에 다른 값을 할당하면, 해당 키에 연결된 DOM 부분만 업데이트됩니다.

이처럼 `dr-appender`는 `dr-for-of`의 한계를 보완하여, 특히 리스트 데이터가 동적으로 자주 변경되는 시나리오에서 높은 성능을 제공합니다.

다음 장에서는 이 모든 것을 재사용 가능한 캡슐화된 단위, 즉 '컴포넌트'로 만드는 방법을 탐구하여 프레임워크에 생명과 영혼을 불어넣겠습니다.