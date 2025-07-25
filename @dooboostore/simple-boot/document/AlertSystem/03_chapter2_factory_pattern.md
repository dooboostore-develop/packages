# 제2장: 팩토리 패턴을 이용한 환경별 구현 분리

1장에서 우리는 `AlertService`가 `AlertFactory`에 알림 생성을 위임하는 구조를 설계했습니다. 왜 이런 중간 계층을 두는 것일까요? 바로 **애플리케이션이 실행되는 환경(Environment)에 따라 다른 알림 구현을 제공**하기 위함입니다. 이것이 팩토리 패턴을 사용하는 핵심적인 이유입니다.

## 2.1. 팩토리 패턴의 필요성: 프론트엔드 vs 백엔드

우리가 만드는 애플리케이션은 두 가지 주요 환경에서 실행될 수 있습니다.

1.  **프론트엔드 (브라우저)**: 사용자가 직접 상호작용하는 환경입니다. 알림은 시각적인 UI 컴포넌트(DOM 요소)로 렌더링되어야 합니다.
2.  **백엔드 (Node.js / SSR)**: 서버사이드 렌더링(SSR) 중이거나, 서버 자체 로직이 실행되는 환경입니다. 여기에는 DOM이 없으므로 시각적인 UI를 렌더링할 수 없습니다.

만약 `AlertService`가 `new DangerAlertComponent()`와 같은 UI 컴포넌트 생성 코드를 직접 가지고 있다면, 이 코드는 DOM이 없는 백엔드 환경에서 에러를 발생시킬 것입니다. 팩토리 패턴은 이러한 문제를 우아하게 해결합니다.

## 2.2. `FrontAlertFactory`: UI를 가진 프론트엔드 팩토리

프론트엔드 환경에서는 `FrontAlertFactory`가 `AlertFactory`의 구현체로 사용됩니다. 이 팩토리는 `create` 메소드 내부에 `switch` 문을 사용하여, 요청받은 `type`에 따라 그에 맞는 구체적인 `Alert` 클래스를 인스턴스화합니다.

**`apps/lazycollect/front/service/alert/FrontAlertFactory.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Alert, AlertType } from '@dooboostore/simple-boot/alert';
import { AlertFactory } from '@dooboostore/simple-boot/alert/AlertFactory';
// ... 구체적인 Alert 클래스들을 import ...

@Sim({symbol: AlertFactory.SYMBOL}) // 동일한 심볼로 등록
export class FrontAlertFactory<T = any> implements AlertFactory<T> {
  // ...
  create(data?: { type?: AlertType | string; ... }): Alert<T> | undefined {
    console.log('--- FrontAlertFactory --- creating alert for type:', data?.type);
    switch (data?.type) {
      case AlertType.DANGER:
        return new DangerAlert(this.alertService, data.config);
      // ... 다른 타입들 ...
    }
    return undefined;
  }
}
```
`FrontAlertFactory`는 `DangerAlert` 등 **실제 UI 컴포넌트를 생성하는 로직을 가진 `Alert` 클래스들을 알고 있는 유일한 곳**입니다.

## 2.3. `BackAlertFactory`: 비-UI 알림 처리기

`Alert`라는 이름이 UI의 팝업창만을 의미하는 것은 아닙니다. 더 넓은 의미에서 `Alert`는 **'주목해야 할 중요한 이벤트가 발생했음'**을 알리는 신호입니다. 백엔드 환경에서 이 신호를 어떻게 처리할지는 프론트엔드와 전혀 다를 수 있습니다.

예를 들어, `ApiService`에서 500 에러가 발생하여 `danger` 타입의 알림을 요청했다고 가정해 봅시다. 백엔드에서는 이를 UI로 표시하는 대신, **이벤트의 심각성을 인지하고 파일이나 외부 시스템에 로그를 남기는 것**이 훨씬 유용한 동작입니다.

`BackAlertFactory`는 바로 이러한 서버 환경에 특화된 동작을 정의합니다.

**`apps/lazycollect/backend/service/alert/BackAlertFactory.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Alert, AlertType } from '@dooboostore/simple-boot/alert';
import { AlertFactory } from '@dooboostore/simple-boot/alert/AlertFactory';
import { LoggingService } from '@backend/service/LoggingService'; // 가상의 로깅 서비스

@Sim({symbol: AlertFactory.SYMBOL}) // 동일한 심볼로 등록
export class BackAlertFactory<T = any> implements AlertFactory<T> {
  // DI를 통해 로깅 서비스를 주입받음
  constructor(private loggingService: LoggingService) {}

  create(data?: { type?: AlertType | string; config?: AlertFactoryConfig<T> }): Alert<T> | undefined {
    const { type, config } = data ?? {};
    console.log(`--- BackAlertFactory --- Handling event of type: ${type}`);

    // 'DANGER' 또는 'ERROR' 타입의 알림을 로깅 시스템과 연동
    if (type === AlertType.DANGER || type === AlertType.ERROR) {
      // UI를 만드는 대신, 로그를 남기는 행위를 하는 Alert 객체를 생성
      return new (class extends Alert<T> {
        // make()가 호출될 때 로깅 로직이 실행됨
        protected make(): void | T {
          const logMessage = `Critical Event: ${config?.title ?? 'No title'}`;
          // 주입받은 로깅 서비스를 사용하여 에러 로그를 남김
          this.loggingService.error(logMessage, config?.data);
        }
      })(this.alertService, config);
    }

    // 그 외의 타입은 아무 동작도 하지 않는 더미 객체 반환
    return new (class extends Alert<T> {
      protected make(): void | T {}
    })(this.alertService, config);
  }
}
```
이제 `BackAlertFactory`는 더 이상 수동적인 '더미' 객체가 아닙니다. `DANGER`나 `ERROR` 같은 중요한 이벤트가 발생하면, 이를 감지하여 `LoggingService`를 통해 로그를 남기는 능동적인 처리기가 되었습니다. 이처럼 `AlertSystem`은 단순한 UI 시스템을 넘어, **환경에 따라 다른 동작을 수행하는 범용 이벤트 처리 시스템**으로 확장될 수 있습니다.

## 2.4. 의존성 주입(DI)을 통한 팩토리 선택

그렇다면 `AlertService`는 언제가 `FrontAlertFactory`를 사용하고, 언제가 `BackAlertFactory`를 사용해야 하는지 어떻게 알 수 있을까요? 정답은 **의존성 주입(Dependency Injection)**에 있습니다.

-   프론트엔드 애플리케이션의 시작점(`front/index.ts`)에서는 `FrontAlertFactory`를 DI 컨테이너에 등록합니다.
-   백엔드 애플리케이션의 시작점(`backend/index.ts`)에서는 `LoggingService`와 이를 사용하는 `BackAlertFactory`를 DI 컨테이너에 등록합니다.

두 팩토리 모두 동일한 `AlertFactory.SYMBOL`을 사용하여 등록되기 때문에, `AlertService`는 자신의 코드를 전혀 변경하지 않고도 실행 환경에 맞는 올바른 팩토리를 주입받게 됩니다.

```typescript
// AlertService.ts의 생성자
constructor(
  // @Inject는 실행 시점에 컨테이너에 등록된
  // AlertFactory.SYMBOL을 가진 구현체를 찾아 주입해준다.
  @Inject({symbol: AlertFactory.SYMBOL}) alertFactory: AlertFactory<T>
) {
  this.alertFactory = alertFactory;
}
```

이처럼 팩토리 패턴과 의존성 주입을 함께 사용하면, 환경에 따라 달라지는 구현의 상세 내용을 저수준(low-level)의 팩토리 모듈 안에 캡슐화할 수 있습니다. `AlertService`와 같은 고수준(high-level) 모듈은 구체적인 구현에 대해 전혀 알 필요 없이, 오직 `AlertFactory`라는 추상화된 인터페이스에만 의존하여 일관된 방식으로 동작할 수 있습니다.

다음 장에서는 `FrontAlertFactory`가 생성하는 구체적인 `Alert` 클래스들이 어떻게 실제 UI 컴포넌트와 연결되는지 살펴보겠습니다.