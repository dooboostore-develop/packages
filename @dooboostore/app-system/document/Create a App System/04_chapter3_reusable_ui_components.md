# 제3장: 재사용 가능한 UI 컴포넌트

현대 웹 애플리케이션 개발에서 UI 컴포넌트는 사용자 인터페이스를 구축하는 기본 단위입니다. `app-system`은 `simple-boot-front`와 `dom-render`를 기반으로 재사용 가능한 UI 컴포넌트들을 제공하여 개발 생산성을 높이고 코드의 일관성을 유지합니다. 이 장에서는 `app-system`의 UI 컴포넌트 설계 원칙과 내장 컴포넌트들의 구현 및 활용 방법을 알아봅니다.

## 3.1. 컴포넌트 설계 원칙

`app-system`의 UI 컴포넌트들은 다음과 같은 원칙을 기반으로 설계됩니다.

-   **재사용성:** 다양한 애플리케이션에서 재사용될 수 있도록 일반적인 기능을 제공합니다.
-   **캡슐화:** 컴포넌트의 내부 구현(HTML, CSS, JavaScript 로직)을 외부에 노출하지 않고, 명확한 인터페이스(속성, 이벤트)를 통해 외부와 통신합니다.
-   **선언적:** HTML 템플릿 내에서 속성을 통해 컴포넌트의 동작과 모양을 선언적으로 정의할 수 있도록 합니다.
-   **반응성:** `dom-render`의 반응성 시스템을 활용하여 컴포넌트의 상태 변화가 UI에 자동으로 반영되도록 합니다.
-   **DI 컨테이너 관리:** `simple-boot`의 `@Sim` 데코레이터를 통해 DI 컨테이너의 관리를 받으며, 의존성 주입을 통해 필요한 서비스들을 쉽게 사용할 수 있습니다.

`app-system`의 모든 UI 컴포넌트는 `ComponentBase`를 상속받아 공통적인 속성 관리 및 생명주기 훅을 활용합니다.

## 3.2. 내장 UI 컴포넌트 (Checkbox, Details, Input, Radio, Select)

`app-system`은 웹 애플리케이션에서 자주 사용되는 기본적인 UI 컴포넌트들을 제공합니다. 이 컴포넌트들은 `simple-boot-front`의 `@Component` 데코레이터와 `dom-render`의 템플릿 문법을 사용하여 구현됩니다.

-   **`Checkbox`:** 체크박스 입력 필드와 그 상태(체크됨/해제됨)를 관리하는 컴포넌트입니다. `Checked`와 `UnChecked`라는 하위 컴포넌트를 통해 상태에 따른 UI를 쉽게 전환할 수 있습니다.
-   **`Details`:** HTML `<details>` 태그를 래핑하여 확장/축소 가능한 섹션을 제공합니다. `Summary`와 `Body`, `Form`이라는 하위 컴포넌트를 가집니다.
-   **`Input`:** 텍스트 입력 필드를 제공하며, 디바운스(debounce) 및 중복 값 무시(distinctUntilChanged)와 같은 고급 입력 처리 기능을 포함합니다.
-   **`Radio`:** 라디오 버튼 입력 필드와 그 상태를 관리하는 컴포넌트입니다. `RadioChecked`와 `UnChecked`라는 하위 컴포넌트를 가집니다.
-   **`Select`:** 드롭다운 선택 필드를 제공합니다. `SelectOption`이라는 하위 컴포넌트를 가집니다.

### 구현 원리

각 UI 컴포넌트는 다음과 같은 방식으로 구현됩니다.

1.  **`@Component` 데코레이터:** 컴포넌트 클래스에 `@Component`를 적용하여 템플릿, 스타일, 셀렉터(태그 이름)를 정의합니다.
2.  **`ComponentBase` 상속:** `ComponentBase`를 상속받아 `dom-render`의 `onChangeAttrRender`, `onInitRender` 등 생명주기 훅과 속성 관리 기능을 활용합니다.
3.  **`dr-value-link`, `dr-event-*` 등 `dom-render` 지시어 활용:** 컴포넌트의 내부 HTML 템플릿에서 `dom-render`의 양방향 바인딩 및 이벤트 처리 지시어를 사용하여 UI와 컴포넌트 로직을 연결합니다.
4.  **하위 컴포넌트:** `Checkbox.Checked`와 같이 특정 상태를 나타내는 하위 컴포넌트들은 `dr-if` 지시어를 사용하여 부모 컴포넌트의 상태에 따라 조건부로 렌더링됩니다.

### 예제: `Checkbox` 컴포넌트 사용

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { CheckBox } from '@dooboostore/app-system/component/checkBox/CheckBox';

@Sim
@Component({
  template: `
    <h1>Checkbox Component Example</h1>
    <System:CheckBox name="myCheckbox" checked="${this.isChecked}$" change="${(checked) => this.onCheckboxChange(checked)}">
      <System:CheckBox.Checked>Checked!</System:CheckBox.Checked>
      <System:CheckBox.UnChecked>Unchecked!</System:CheckBox.UnChecked>
    </System:CheckBox>
    <p>Checkbox State: ${this.checkboxState}$</p>
    <button dr-event-click="this.toggleCheckbox()">Toggle from Code</button>
  `,
  styles: [`
    system-checkbox label { display: flex; align-items: center; cursor: pointer; }
    system-checkbox input[type="checkbox"] { margin-right: 5px; }
    button { margin-top: 10px; padding: 8px 15px; cursor: pointer; }
  `]
})
class AppRootComponent {
  isChecked: boolean = true;
  checkboxState: string = 'Checked!';

  onCheckboxChange(checked: boolean) {
    this.isChecked = checked;
    this.checkboxState = checked ? 'Checked!' : 'Unchecked!';
    console.log('Checkbox changed to:', checked);
  }

  toggleCheckbox() {
    this.isChecked = !this.isChecked;
    this.checkboxState = this.isChecked ? 'Checked!' : 'Unchecked!';
    console.log('Checkbox toggled from code to:', this.isChecked);
  }
}

const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Checkbox component example started.');
```

## 3.3. Promise 기반 컴포넌트 (PromiseSwitch)

`PromiseSwitch` 컴포넌트는 비동기 작업(Promise)의 상태(pending, fulfilled, rejected)에 따라 다른 UI를 조건부로 렌더링하는 데 사용됩니다. 이는 데이터 로딩 중 로딩 스피너를 보여주거나, 에러 발생 시 에러 메시지를 표시하는 등 비동기 UI를 처리하는 데 매우 유용합니다.

-   **`PromiseSwitch`:** `data` 속성으로 Promise 객체를 받습니다.
-   **`Pending`:** Promise가 대기 중일 때 렌더링됩니다.
-   **`Fulfilled`:** Promise가 성공적으로 완료되었을 때 렌더링됩니다. Promise의 결과 값을 `data` 속성으로 접근할 수 있습니다.
-   **`Rejected`:** Promise가 실패했을 때 렌더링됩니다. Promise의 에러 객체를 `data` 속성으로 접근할 수 있습니다.
-   **`Default`:** Promise의 상태와 관계없이 항상 렌더링됩니다. (주로 PromiseSwitch가 처리하지 않는 다른 UI를 표시할 때 사용)

### 구현 원리

`PromiseSwitch` 컴포넌트는 `onChangeAttrRender` 훅을 사용하여 `data` 속성으로 전달된 Promise의 상태 변화를 감지합니다. `dom-render`의 반응성 시스템을 통해 Promise의 상태가 `pending`, `fulfilled`, `rejected`로 변경될 때마다 `Pending`, `Fulfilled`, `Rejected` 하위 컴포넌트들의 `hidden` 속성을 토글하여 적절한 UI를 표시합니다.

```typescript
// component/promise/PromiseSwitch.ts (개념적)
export namespace PromiseSwitch {
  // ... Pending, Fulfilled, Rejected, Default 하위 컴포넌트 정의 ...

  export class PromiseSwitch extends ComponentBase<Attribute> {
    private promiseState?: Promises.Result.PromiseState<any, unknown>;

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'data') && value) {
        this.promiseState = Promises.Result.wrap(typeof value === 'function' ? value() : value as Promise<any>);
        this.childStateChange(); // Promise 상태에 따라 하위 컴포넌트 hidden 속성 변경

        this.promiseState.then(data => {
          this.childStateChange();
        }).catch((e) => {
          this.childStateChange();
        }).finally(() => {
          // ...
        });
      }
    }

    childStateChange() {
      // promiseState의 상태에 따라 Pending, Fulfilled, Rejected 하위 컴포넌트의 hidden 속성을 제어
      // 예: promiseState.status === 'pending' 이면 Pending 컴포넌트만 hidden = false
      // ...
    }
  }
}
```

### 예제: `PromiseSwitch` 컴포넌트 사용

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { PromiseSwitch } from '@dooboostore/app-system/component/promise/PromiseSwitch';
import { Skeleton } from '@dooboostore/app-system/component/skeleton/Skeleton'; // 로딩 스피너 대용

@Sim
class DataService {
  async fetchData(shouldSucceed: boolean): Promise<string> {
    console.log(`[DataService] Fetching data... (shouldSucceed: ${shouldSucceed})`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve('Data loaded successfully!');
        } else {
          reject(new Error('Failed to load data.'));
        }
      }, 2000); // 2초 지연
    });
  }
}

@Sim
@Component({
  template: `
    <h1>PromiseSwitch Component Example</h1>
    <button dr-event-click="this.loadData(true)">Load Data (Success)</button>
    <button dr-event-click="this.loadData(false)">Load Data (Fail)</button>
    <button dr-event-click="this.clearData()">Clear</button>

    <div style="margin-top: 20px; border: 1px solid #ccc; padding: 15px;">
      <System:PromiseSwitch data="${this.dataPromise}$">
        <System:PromiseSwitch.Pending>
          <p><System:Skeleton width="100px" height="20px"></System:Skeleton> Loading data...</p>
        </System:PromiseSwitch.Pending>
        <System:PromiseSwitch.Fulfilled>
          <p style="color: green;">Success: ${#it}$</p>
        </System:PromiseSwitch.Fulfilled>
        <System:PromiseSwitch.Rejected>
          <p style="color: red;">Error: ${#it.message}$</p>
        </System:PromiseSwitch.Rejected>
        <System:PromiseSwitch.Default>
          <p>Click a button to load data.</p>
        </System:PromiseSwitch.Default>
      </System:PromiseSwitch>
    </div>
  `,
  styles: [`
    button { margin-right: 10px; padding: 8px 15px; cursor: pointer; }
  `]
})
class AppRootComponent {
  dataPromise: Promise<string> | null = null;

  constructor(private dataService: DataService) {}

  loadData(shouldSucceed: boolean) {
    this.dataPromise = this.dataService.fetchData(shouldSucceed);
  }

  clearData() {
    this.dataPromise = null;
  }
}

const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('PromiseSwitch component example started.');
```

재사용 가능한 UI 컴포넌트들은 `app-system`이 개발 생산성을 높이고 애플리케이션의 일관된 사용자 경험을 제공하는 데 핵심적인 역할을 합니다. 특히 `PromiseSwitch`와 같은 컴포넌트는 비동기 UI 처리를 크게 단순화합니다.

다음 장에서는 애플리케이션의 상태를 관리하는 `Store`와 API 요청을 가로채는 `Proxy` 시스템에 대해 알아보겠습니다.
