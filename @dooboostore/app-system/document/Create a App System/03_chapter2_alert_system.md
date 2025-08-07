# 제2장: 사용자 피드백 - Alert 시스템

애플리케이션에서 사용자에게 현재 상태, 작업 진행 상황, 성공/실패 여부 등을 명확하게 전달하는 것은 사용자 경험(UX)에 매우 중요합니다. `app-system`의 Alert 시스템은 이러한 사용자 피드백을 일관되고 유연하게 제공하기 위해 설계되었습니다. 이 장에서는 Alert 시스템의 역할과 구성, 그리고 다양한 Alert 타입의 구현에 대해 알아봅니다.

## 2.1. Alert 시스템의 역할과 구성

Alert 시스템은 애플리케이션의 다양한 지점에서 발생하는 이벤트(예: API 호출 성공/실패, 데이터 저장 완료)에 대해 사용자에게 시각적 또는 비시각적 알림을 제공합니다. 주요 구성 요소는 다음과 같습니다.

-   **`Alert` (추상 클래스):** 모든 알림의 기본이 되는 추상 클래스입니다. 알림의 활성화(`active`) 및 비활성화(`deActive`) 로직, 생명주기 콜백(예: `activeBefore`, `deActiveAfter`), 고유 ID(`uuid`) 등을 정의합니다.
-   **`AlertType` (Enum):** 알림의 종류를 정의하는 열거형입니다. `SUCCESS`, `ERROR`, `INFO`, `WARNING`, `PROGRESS`, `DANGER`, `CONSOLE` 등 다양한 타입을 포함합니다.
-   **`AlertFactory` (인터페이스):** 특정 `AlertType`에 해당하는 `Alert` 인스턴스를 생성하는 팩토리 인터페이스입니다. `DefaultAlertFactory`가 기본 구현체로 제공됩니다.
-   **`AlertService`:** Alert 시스템의 핵심 서비스입니다. `AlertFactory`를 통해 `Alert` 인스턴스를 생성하고, 알림의 활성화/비활성화 상태를 관리하며, `rxjs`의 `Subject`를 통해 알림 상태 변화를 외부에 발행합니다.

## 2.2. AlertFactory와 AlertService

`AlertFactory`와 `AlertService`는 Alert 시스템의 핵심적인 협력 관계를 이룹니다.

-   **`AlertFactory`:** `AlertFactory.create()` 메소드를 통해 특정 `AlertType`에 맞는 `Alert` 인스턴스를 생성합니다. 개발자는 `AlertFactory` 인터페이스를 구현하여 커스텀 Alert 타입을 추가할 수 있습니다.
-   **`AlertService`:** `AlertService`는 `AlertFactory`를 주입받아 사용합니다. `alertService.success()`, `alertService.error()`, `alertService.progress()` 등 편리한 헬퍼 메소드를 제공하여 특정 타입의 Alert를 쉽게 생성하고 활성화할 수 있도록 합니다.

### 구현 원리

`AlertService`는 `rxjs`의 `ReplaySubject`를 사용하여 Alert의 상태 변화를 구독자들에게 알립니다. `Alert.active()` 또는 `Alert.deActive()` 메소드가 호출될 때마다 `AlertService.publish()`를 통해 `Subject`에 이벤트를 발행합니다. 외부 모듈은 `AlertService.observable`을 구독하여 Alert의 상태 변화를 실시간으로 감지하고 UI를 업데이트할 수 있습니다.

```typescript
// alert/AlertService.ts (개념적)
import { AlertFactory } from './AlertFactory';
import { Alert } from './Alert';
import { ReplaySubject } from 'rxjs';

export class AlertService<T> {
  private subject = new ReplaySubject<AlertService.AlertActionContainer<T>>();
  private alertFactory?: AlertFactory<T>;

  constructor(alertFactory: AlertFactory<T>) {
    this.alertFactory = alertFactory;
  }

  get observable() {
    return this.subject.asObservable(); // Alert 상태 변화를 외부에 발행
  }

  publish(data: AlertService.AlertActionContainer<T>) {
    this.subject.next(data); // Alert 상태 변화 이벤트 발행
  }

  createFromFactory(type: AlertType, config?: AlertFactoryConfig<T>) {
    return this.alertFactory?.create({ caller: this, type, config: config }); // 팩토리를 통해 Alert 인스턴스 생성
  }

  // success(), error(), progress() 등 헬퍼 메소드들은 createFromFactory를 호출
}

// alert/Alert.ts (개념적)
export abstract class Alert<T> {
  // ... constructor ...

  async active(): Promise<void> {
    // ... activeBefore 콜백 실행 ...
    this.result = this.make(); // 추상 메소드 make()를 통해 실제 Alert 내용 생성
    this.alertService?.publish({action: AlertAction.ACTIVE, alert: this}); // AlertService에 활성화 이벤트 발행
    this.isActive = true;
    // ... closeTime 설정 시 자동 deActive ...
    // ... activeAfter 콜백 실행 ...
  }

  async deActive(): Promise<void> {
    // ... deActiveBefore 콜백 실행 ...
    this.alertService?.publish({action: AlertAction.DE_ACTIVE, alert: this}); // AlertService에 비활성화 이벤트 발행
    this.isActive = false;
    // ... deActiveAfter 콜백 실행 ...
  }

  protected abstract make(): T | void; // 실제 Alert 내용을 생성하는 추상 메소드
}
```

## 2.3. 다양한 Alert 타입 구현

`app-system`은 `AlertType` 열거형을 통해 다양한 종류의 Alert를 정의하고, 이에 해당하는 구체적인 `Alert` 클래스들을 제공합니다.

-   **`ConsoleLog` / `ConsoleError`:** 콘솔에 메시지를 출력하는 Alert입니다. 주로 개발 및 디버깅 용도로 사용됩니다.
-   **UI 기반 Alert:** `AlertType.SUCCESS`, `AlertType.ERROR`, `AlertType.PROGRESS` 등은 실제 사용자 인터페이스에 표시되는 Alert를 위한 타입입니다. 이들은 `AlertFactory`를 통해 구체적인 UI 컴포넌트(예: 토스트 메시지, 모달 다이얼로그)와 연결될 수 있습니다.

개발자는 `Alert` 추상 클래스를 상속받아 `make()` 메소드를 구현함으로써 자신만의 커스텀 Alert 타입을 쉽게 정의할 수 있습니다. `AlertFactory`를 구현하여 이 커스텀 Alert를 `AlertService`에 통합할 수도 있습니다.

### 예제: Alert 시스템 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AlertService, AlertFactory, Alert } from '@dooboostore/app-system/alert';
import { AlertType } from '@dooboostore/app-system/alert/AlertType';
import { AlertFactoryConfig } from '@dooboostore/app-system/alert/AlertFactoryConfig';
import { ReplaySubject } from 'rxjs';

// 1. 커스텀 UI Alert 구현 (예: 간단한 토스트 메시지)
// 실제 UI 렌더링은 dom-render나 다른 UI 라이브러리와 연동되어야 합니다.
class ToastAlert<T = string> extends Alert<T> {
  protected make(): T | void {
    const message = this.config?.title || 'Default Toast';
    console.log(`[ToastAlert] Displaying: ${message}`);
    // 실제 DOM에 토스트 메시지를 추가하는 로직
    const toastElement = document.createElement('div');
    toastElement.className = 'toast-message';
    toastElement.textContent = message;
    document.body.appendChild(toastElement);

    // 일정 시간 후 자동으로 제거 (CSS 애니메이션 등과 연동)
    setTimeout(() => {
      toastElement.remove();
      console.log(`[ToastAlert] Removed: ${message}`);
    }, (this.config?.closeTime || 3000) + 500); // closeTime + 애니메이션 시간

    return message as T;
  }
}

// 2. 커스텀 AlertFactory 구현
@Sim({ symbol: AlertFactory.SYMBOL }) // AlertFactory 심볼로 등록
class CustomAlertFactory implements AlertFactory<string> {
  create(data?: { caller?: any; type?: AlertType | string; config?: AlertFactoryConfig<string> }): Alert<string> | undefined {
    switch (data?.type) {
      case AlertType.SUCCESS:
        return new ToastAlert(data.caller, { ...data.config, closeTime: 3000 });
      case AlertType.ERROR:
        return new ToastAlert(data.caller, { ...data.config, closeTime: 5000 });
      case AlertType.PROGRESS:
        return new ToastAlert(data.caller, { ...data.config, closeTime: 0 }); // 수동으로 닫기
      case AlertType.CONSOLE:
        return new (class extends Alert<string> { protected make(): string { console.log(`[ConsoleAlert] ${this.config?.title}`); return this.config?.title || ''; } })(data.caller, data.config);
      default:
        return undefined;
    }
  }
}

// 3. AlertService를 사용하는 서비스
@Sim
class AppService {
  constructor(private alertService: AlertService<string>) {
    // AlertService의 observable을 구독하여 Alert 상태 변화를 감지
    this.alertService.observable.subscribe(event => {
      console.log(`[AppService] Alert Event: ${event.action} for ${event.alert.config?.title} (UUID: ${event.alert.uuid})`);
    });
  }

  performTask() {
    const progressAlert = this.alertService.progress({ title: 'Task in progress...' });
    progressAlert?.active();

    setTimeout(() => {
      if (Math.random() > 0.5) {
        progressAlert?.deActive(); // 진행 알림 닫기
        this.alertService.success({ title: 'Task completed successfully!' })?.active();
      } else {
        progressAlert?.deActive(); // 진행 알림 닫기
        this.alertService.error({ title: 'Task failed! Please try again.' })?.active();
      }
    }, 2000);
  }

  logMessage() {
    this.alertService.createFromFactory(AlertType.CONSOLE, { title: 'This is a console message.' })?.active();
  }
}

// 4. SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication();
app.run();

const appService = app.sim(AppService);

// DOM 환경 모의 (브라우저 환경이 아닐 경우)
const JSDOM = require('jsdom').JSDOM;
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
global.document = dom.window.document;
global.window = dom.window;

console.log('Alert system example started.');
appService?.performTask();
appService?.logMessage();

/* 예상 출력 (콘솔):
Alert system example started.
[AppService] Alert Event: ACTIVE for Task in progress... (UUID: ...)
[ToastAlert] Displaying: Task in progress...
[ConsoleAlert] This is a console message.
[AppService] Alert Event: ACTIVE for This is a console message. (UUID: ...)

(2초 후, 랜덤하게 성공 또는 실패 메시지 출력)
[AppService] Alert Event: DE_ACTIVE for Task in progress... (UUID: ...)
[ToastAlert] Removed: Task in progress...
[ToastAlert] Displaying: Task completed successfully! (또는 Task failed! Please try again.)
[AppService] Alert Event: ACTIVE for Task completed successfully! (UUID: ...)
*/
```

`Alert` 시스템은 `app-system`이 사용자에게 효과적인 피드백을 제공하고, 애플리케이션의 상태 변화를 외부에 알리는 중요한 메커니즘입니다. 이를 통해 개발자는 사용자 경험을 향상시키고, 애플리케이션의 동작을 더 투명하게 만들 수 있습니다.

다음 장에서는 재사용 가능한 UI 컴포넌트들을 어떻게 설계하고 구현하는지 알아보겠습니다.
