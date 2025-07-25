# 제3장: 구체적인 알림과 UI 컴포넌트 연동

지금까지 우리는 추상적인 `Alert`와 `AlertFactory`에 대해 알아보았습니다. 이제 시스템이 실제로 동작하도록, 프론트엔드에서 사용될 구체적인 `Alert` 클래스를 만들고 이를 실제 UI 컴포넌트와 연결하는 방법을 살펴보겠습니다.

## 3.1. `Alert` 클래스 상속과 `make()` 메소드 구현

새로운 종류의 알림을 만드는 것은 `Alert` 추상 클래스를 상속받고, `make()` 추상 메소드를 구현하는 것에서 시작됩니다. `make()` 메소드의 역할은 **알림의 시각적 표현, 즉 UI 컴포넌트의 인스턴스를 생성하여 반환**하는 것입니다.

`DangerAlert` 클래스를 예로 들어보겠습니다. 이 클래스는 사용자에게 위험 또는 실패 상황을 알리는 빨간색 알림을 표시하는 역할을 합니다.

**`apps/lazycollect/front/service/alert/DangerAlert.ts`**
```typescript
import { Alert } from '@dooboostore/simple-boot/alert';
import { AlertService } from '@dooboostore/simple-boot/alert/AlertService';
import { AlertFactoryConfig } from '@dooboostore/simple-boot/alert/AlertFactoryConfig';
// 실제 UI를 담당할 컴포넌트를 import 합니다.
import { DangerAlertComponent } from '@src/component/alert/danger/DangerAlertComponent';

export class DangerAlert<T = any> extends Alert<T> {
  constructor(alertService?: AlertService<T>, config?: AlertFactoryConfig<T>) {
    super(alertService, config);
  }

  /**
   * 이 메소드에서 실제 UI 컴포넌트가 생성됩니다.
   * @protected
   */
  protected make(): void | T {
    // DangerAlertComponent의 새 인스턴스를 생성하여 반환합니다.
    return new DangerAlertComponent() as T;
  }
}
```

## 3.2. `make()` 메소드와 UI 컴포넌트의 만남

위 코드에서 가장 중요한 부분은 `make()` 메소드 안의 `new DangerAlertComponent()` 입니다. 이 한 줄이 바로 **추상적인 데이터(Alert)와 구체적인 뷰(UI Component)가 만나는 지점**입니다.

-   **`DangerAlert` (Data/Logic Layer)**: 알림의 데이터(`config`)와 행위(`active`, `deActive`)를 정의하는 논리적인 객체입니다.
-   **`DangerAlertComponent` (View Layer)**: 실제 HTML 템플릿, CSS 스타일, 그리고 사용자 인터랙션 로직을 가진 순수한 UI 컴포넌트입니다. 이 컴포넌트는 `@dooboostore/dom-render`와 같은 뷰 라이브러리를 사용하여 만들어집니다.

`AlertSystem`은 이 두 계층을 명확하게 분리합니다. `AlertService`나 `ApiService` 같은 상위 레벨의 서비스들은 `DangerAlertComponent`의 존재를 전혀 알 필요가 없습니다. 그들은 오직 `Alert`라는 추상화된 객체와 상호작용할 뿐입니다.

## 3.3. 시스템의 유연성

이러한 구조는 시스템에 엄청난 유연성을 제공합니다.

-   **UI 라이브러리 교체**: 만약 나중에 `dom-render`가 아닌 다른 뷰 라이브러리(예: React, Vue)로 UI를 교체하고 싶다면, `DangerAlertComponent`의 내부 구현만 새로운 라이브러리에 맞게 수정하면 됩니다. `DangerAlert` 클래스나 `FrontAlertFactory`, `AlertService` 등 시스템의 다른 부분은 전혀 수정할 필요가 없습니다.
-   **새로운 알림 타입 추가**: '성공'을 나타내는 초록색 알림을 추가하고 싶다면, 다음과 같은 단계만 거치면 됩니다.
    1.  UI를 담당할 `SuccessAlertComponent`를 만듭니다.
    2.  `Alert`를 상속받는 `SuccessAlert` 클래스를 만들고, `make()` 메소드가 `new SuccessAlertComponent()`를 반환하도록 구현합니다.
    3.  `FrontAlertFactory`의 `switch` 문에 `case AlertType.SUCCESS:`를 추가하여 `new SuccessAlert()`를 반환하도록 합니다.

이것으로 끝입니다. `AlertService`는 이제 `alertService.success()` 메소드를 통해 새로운 성공 알림을 즉시 생성할 수 있게 됩니다.

이처럼 `make()` 메소드를 통해 UI 컴포넌트의 생성을 위임하는 간단한 규칙 하나가 전체 시스템을 유연하고 확장 가능하게 만드는 핵심 열쇠입니다.

다음 장에서는 이렇게 생성된 UI 컴포넌트 인스턴스를 실제로 어떻게 화면에 렌더링하고 관리하는지, RxJS를 활용한 반응형 관리 기법에 대해 알아보겠습니다.
