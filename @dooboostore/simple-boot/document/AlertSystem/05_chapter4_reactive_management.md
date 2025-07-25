# 제4장: RxJS를 이용한 반응형 알림 관리

`FrontAlertFactory`가 UI 컴포넌트를 포함한 `Alert` 객체를 생성했습니다. 이제 `AlertService`는 이 알림의 생명주기(생성, 소멸)를 시스템 전체에 알려주어야 하고, 어딘가에서는 이 신호를 받아 실제 UI를 그리거나 다른 동작을 해야 합니다. `AlertSystem`은 이 과정을 **반응형(Reactive)**으로 처리하기 위해 RxJS를 사용합니다.

## 4.1. `AlertService`와 RxJS `ReplaySubject`

`AlertService`의 내부를 다시 살펴보면, `ReplaySubject`라는 특별한 `Subject`를 사용하는 것을 볼 수 있습니다.

**`@dooboostore/simple-boot/src/alert/AlertService.ts`**
```typescript
@Sim
export class AlertService<T> implements Store<AlertService.AlertActionContainer<T>> {
  // ReplaySubject는 새로운 구독자가 생겼을 때, 버퍼에 저장된 최신 이벤트를 재방송(replay)해줍니다.
  private subject = new ReplaySubject<AlertService.AlertActionContainer<T>>();

  // ...

  // Alert의 active/deActive 메소드에서 호출됩니다.
  publish(data: AlertService.AlertActionContainer<T>) {
    this.subject.next(data);
  }

  get observable() {
    return this.subject.asObservable();
  }
  // ...
}
```

-   **`publish()`**: `Alert` 객체의 `active()` 또는 `deActive()` 메소드가 호출될 때, `AlertService`의 `publish` 메소드가 함께 호출됩니다. 이 메소드는 `subject.next()`를 통해 현재 발생한 액션(활성화/비활성화)과 해당 `Alert` 객체를 시스템 전체에 방송합니다.
-   **`observable`**: 외부에서는 이 `observable`을 구독(subscribe)함으로써 모든 알림의 상태 변화를 실시간으로 감지할 수 있습니다.

## 4.2. `AlertAction`을 이용한 상태 전파

`publish`를 통해 전달되는 데이터는 어떤 형태일까요? `AlertAction`은 알림에 어떤 일이 일어났는지를 명시하는 간단한 열거형(enum)입니다.

**`@dooboostore/simple-boot/src/alert/AlertAction.ts`**
```typescript
export enum AlertAction {
  ACTIVE = 'ACTIVE',
  IN_ACTIVE = 'IN_ACTIVE'
}
```

`AlertService`는 이 `AlertAction`과 `Alert` 객체를 묶어 `AlertActionContainer`라는 타입으로 만들어 `Subject`를 통해 발행합니다.

```typescript
export namespace AlertService {
  export type AlertActionContainer<T> = { action: AlertAction; alert: Alert<T> };
}
```
따라서 `observable`을 구독하는 쪽에서는 `action`이 `ACTIVE`인지 `DE_ACTIVE`인지에 따라 다른 동작을 수행할 수 있습니다.

## 4.3. 알림 이벤트 구독 및 처리 (소비자 구현)

`AlertService`가 발행하는 이벤트를 실제로 소비하는 구독자(Subscriber)는 어떻게 구현할까요? 구독자는 실행 환경에 따라 전혀 다른 역할을 수행할 수 있습니다.

### 4.3.1. 프론트엔드 소비자: 동적 UI 렌더링

프론트엔드에서 구독자의 가장 중요한 역할은 **알림 UI 컴포넌트를 실제 DOM에 렌더링하고 제거**하는 것입니다. 이 역할은 보통 애플리케이션의 최상단에 위치하는 루트 컴포넌트(Root Component)가 담당합니다.

`lazycollect` 프로젝트의 `IndexRouterComponent`가 좋은 예시입니다.

**`apps/lazycollect/src/pages/index.router.component.ts` (일부)**
```typescript
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet';

@Component({ ... })
export class IndexRouterComponent extends ComponentRouterBase {
  // dom-render의 Appender는 동적인 컴포넌트 목록을 관리하고 렌더링합니다.
  private alertAppender = new Appender<any>();

  constructor(private alertService: AlertService<any>, ...) {
    super();
  }

  onInit(...data: any): any {
    // 컴포넌트가 초기화될 때 AlertService의 observable을 구독합니다.
    this.alertService.observable.subscribe(it => {
      if (it.action === AlertAction.ACTIVE) {
        // ACTIVE 이벤트가 오면,
        // alert.result (UI 컴포넌트 인스턴스)를 ComponentSet으로 감싸고
        // alert.uuid를 키로 사용하여 Appender에 추가(set)합니다.
        this.alertAppender?.set(it.alert.uuid, {
            componentSet: new ComponentSet(it.alert.result),
            alertConfig: it.alert.config
        });
      } else { // DE_ACTIVE 이벤트가 오면,
        // 해당 alert.uuid를 키로 가진 컴포넌트를 Appender에서 제거합니다.
        this.alertAppender?.delete(it.alert.uuid);
      }
    });
  }
}
```
-   **`Appender`**: `@dooboostore/dom-render` 라이브러리의 `Appender`는 배열처럼 동적으로 컴포넌트 목록을 관리해주는 특별한 객체입니다. 템플릿에서 `dr-for-of="@this@.alertAppender"`와 같이 바인딩해두면, `Appender`의 내용이 변경될 때마다 화면이 자동으로 갱신됩니다.
-   **구독 로직**: `IndexRouterComponent`는 `alertService`를 구독하다가 `ACTIVE` 신호를 받으면 `alertAppender`에 새로운 컴포넌트를 추가하고, `DE_ACTIVE` 신호를 받으면 제거합니다. 이로써 `AlertSystem`의 모든 알림이 화면에 동적으로 나타나고 사라지게 됩니다.

### 4.3.2. 백엔드 소비자: 외부 시스템 연동

백엔드 환경에서는 UI를 렌더링하는 대신, 알림 이벤트를 다른 시스템과 연동하는 데 사용할 수 있습니다. 예를 들어, 심각한 에러가 발생했다는 `DANGER` 타입의 알림을 감지하여 외부 로깅 서비스(예: Sentry, DataDog)로 에러 정보를 전송하는 `AlertLoggingSubscriber`를 만들 수 있습니다.

**`apps/lazycollect/backend/service/AlertLoggingSubscriber.ts` (예시)**
```typescript
import { PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AlertService } from '@dooboostore/simple-boot/alert/AlertService';
import { AlertAction, AlertType } from '@dooboostore/simple-boot/alert';
import { ExternalLogService } from './ExternalLogService'; // 가상의 외부 로깅 서비스

@Sim()
export class AlertLoggingSubscriber {
  constructor(
    private alertService: AlertService<any>,
    private externalLogService: ExternalLogService
  ) {}

  // @PostConstruct는 DI 컨테이너가 이 객체를 생성한 직후에 호출됩니다.
  @PostConstruct
  onInit() {
    this.alertService.observable.subscribe(it => {
      // DANGER 또는 ERROR 타입의 알림이 활성화될 때만 반응
      if (it.action === AlertAction.ACTIVE && (it.alert.config?.type === AlertType.DANGER || it.alert.config?.type === AlertType.ERROR)) {
        console.log('[Backend] Critical alert detected. Sending to external log system...');
        this.externalLogService.send({
          level: 'error',
          message: it.alert.config?.title,
          data: it.alert.config?.data
        });
      }
    });
  }
}
```
이 `AlertLoggingSubscriber`는 애플리케이션이 시작될 때(`PostConstruct`) `AlertService`를 구독하고, `DANGER` 또는 `ERROR` 알림이 발생할 때마다 외부 로깅 서비스로 정보를 전송합니다. 이처럼 `AlertSystem`은 UI를 넘어 서버의 중요한 이벤트를 처리하는 강력한 도구로도 활용될 수 있습니다.

이제 우리는 알림을 요청하는 부분부터, 팩토리를 통해 생성하고, 최종적으로 소비자가 이벤트를 받아 처리하는 `AlertSystem`의 완전한 흐름을 이해하게 되었습니다.