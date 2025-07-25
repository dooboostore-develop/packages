# 제1장: 핵심 추상화 - `Alert`, `AlertService`, `AlertFactory`

견고한 시스템은 잘 정의된 추상화 위에 세워집니다. `AlertSystem`의 중심에는 `Alert`, `AlertService`, `AlertFactory`라는 세 가지 핵심적인 추상화가 있습니다. 이들의 역할과 관계를 이해하는 것이 시스템 전체를 파악하는 첫걸음입니다.

## 1.1. `Alert`: 모든 알림의 기반

`Alert`는 시스템에서 사용될 모든 종류의 알림이 따라야 할 기본 규약(contract)을 정의하는 추상 클래스(abstract class)입니다. 특정 UI 프레임워크나 스타일에 종속되지 않은 순수한 개념입니다.

**`@dooboostore/simple-boot/src/alert/Alert.ts`**
```typescript
export abstract class Alert<T> {
  // ... (속성들: isActive, uuid, config 등)

  constructor(
    public alertService?: AlertService<T>,
    public config?: AlertFactoryConfig<T>
  ) {
    // ...
  }

  // 알림을 활성화(화면에 표시)하는 메소드
  async active(): Promise<void> {
    // ... 공통 활성화 로직 ...
    this.result = this.make(); // 자식 클래스가 구현한 make() 호출
    this.alertService?.publish({action: AlertAction.ACTIVE, alert: this});
    // ...
  }

  // 알림을 비활성화(화면에서 제거)하는 메소드
  async deActive(): Promise<void> {
    // ... 공통 비활성화 로직 ...
    this.alertService?.publish({action: AlertAction.DE_ACTIVE, alert: this});
    // ...
  }

  // 자식 클래스에서 반드시 구현해야 할 추상 메소드
  // 실제 알림의 내용(예: UI 컴포넌트)을 생성하는 역할을 함
  protected abstract make(): T | void;
}
```

-   **`active()` / `deActive()`**: 모든 알림이 가져야 할 공통적인 생명주기 메소드입니다. 이 메소드들에는 알림 전/후에 실행될 공통 로직과 함께, `alertService`를 통해 현재 상태를 외부에 알리는 코드가 포함됩니다.
-   **`make()`**: `Alert` 클래스의 핵심입니다. 이 메소드는 `abstract`로 선언되어, `Alert`를 상속받는 모든 구체적인 알림 클래스(예: `DangerAlert`, `ProgressAlert`)가 자신만의 방식으로 반드시 구현해야 합니다. `make()` 메소드는 **실제로 화면에 표시될 알림의 본질(예: DOM 요소, UI 컴포넌트 인스턴스)을 생성하여 반환**하는 역할을 합니다.

## 1.2. `AlertService`: 알림 관리의 중앙 허브

`AlertService`는 애플리케이션의 다른 부분들이 알림을 생성하고 관리하기 위해 상호작용하는 유일한 창구(Facade)입니다.

**`@dooboostore/simple-boot/src/alert/AlertService.ts`**
```typescript
@Sim
export class AlertService<T> implements Store<AlertService.AlertActionContainer<T>> {
  private subject = new ReplaySubject<AlertService.AlertActionContainer<T>>();
  private alertFactory?: AlertFactory<T>;

  constructor(
    @Inject({symbol: AlertFactory.SYMBOL}) alertFactory: AlertFactory<T>
  ) {
    this.alertFactory = alertFactory;
  }

  // ... (observable, publish 메소드)

  // 타입에 따라 팩토리에 알림 생성을 위임
  createFromFactory(type: AlertType, config?: AlertFactoryConfig<T>) {
    return this.alertFactory?.create({ caller: this, type, config: config });
  }

  // 사용 편의를 위한 메소드들
  danger(config?: AlertFactoryConfig<T>) {
    return this.createFromFactory(AlertType.DANGER, config);
  }

  progress(config?: AlertFactoryConfig<T>) {
    return this.createFromFactory(AlertType.PROGRESS, config);
  }
  // ... (success, info 등)
}
```

-   **중앙 집중 관리**: `danger()`, `progress()` 등 직관적인 이름의 메소드를 제공하여, 알림을 필요로 하는 쪽(Client)에서는 복잡한 생성 과정 없이 간단하게 알림을 요청할 수 있습니다.
-   **생성 책임 위임**: `AlertService`는 알림을 직접 생성하지 않습니다. 대신, 생성자에 주입된 `alertFactory`에게 알림 생성을 위임합니다. 이는 서비스의 책임을 명확히 분리하는 중요한 설계입니다.

## 1.3. `AlertFactory`: 알림 생성의 책임

`AlertFactory`는 어떤 종류의 `Alert` 객체를 생성할지 결정하고, 실제로 생성하는 책임을 가진 팩토리(Factory)의 인터페이스입니다.

**`@dooboostore/simple-boot/src/alert/AlertFactory.ts`**
```typescript
export namespace AlertFactory {
 export const SYMBOL: Symbol= Symbol('AlertFactory');
}

export interface AlertFactory<T> {
  create(data?: {
    caller?: any;
    type?: AlertType | string;
    config?: AlertFactoryConfig<T>;
  }): Alert<T> | undefined;
}
```

-   **`SYMBOL`**: `simple-boot` DI 컨테이너가 올바른 `AlertFactory` 구현체를 찾아 `AlertService`에 주입해줄 때 사용하는 고유 식별자입니다.
-   **`create()`**: 이 인터페이스의 핵심 메소드입니다. `type`과 `config`를 인자로 받아, 그에 맞는 구체적인 `Alert` 인스턴스를 생성하여 반환합니다.

## 1.4. 관계 요약

`Client` -> `AlertService` -> `AlertFactory` -> `new ConcreteAlert()`

1.  **Client** (예: `ApiService`)는 특정 타입의 알림이 필요할 때 **`AlertService`**의 메소드(예: `danger()`)를 호출합니다.
2.  **`AlertService`**는 `danger`라는 타입을 가지고, 주입받은 **`AlertFactory`**의 `create()` 메소드를 호출합니다.
3.  **`AlertFactory`**의 구현체(예: `FrontAlertFactory`)는 `danger` 타입에 맞는 **`new DangerAlert()`** 코드를 실행하여 구체적인 알림 객체를 생성하고 반환합니다.

이러한 추상화 계층 덕분에 `ApiService`는 `DangerAlert`나 `FrontAlertFactory`의 존재를 전혀 알 필요가 없으며, 오직 `AlertService` 인터페이스에만 의존하게 됩니다. 이것이 바로 **느슨한 결합(Loose Coupling)**의 핵심입니다.

다음 장에서는 이 팩토리 패턴을 활용하여 어떻게 프론트엔드와 백엔드 환경에 따라 다른 알림을 만들어내는지 자세히 알아보겠습니다.
