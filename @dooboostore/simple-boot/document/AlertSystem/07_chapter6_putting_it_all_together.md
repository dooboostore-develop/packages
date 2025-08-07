# 제6장: 전체 시스템 조립 및 사용 예시

지금까지 우리는 `AlertSystem`을 구성하는 각 핵심 요소(`Alert`, `AlertService`, `AlertFactory`, `AlertContainer`)를 단계별로 설계하고 구현 원리를 알아보았습니다. 이제 이 모든 조각들을 하나로 모아, 실제 애플리케이션에서 어떻게 유기적으로 동작하는지 최종 그림을 그려보겠습니다.

## 6.1. `ApiService`에서 `AlertService` 사용하기

`AlertSystem`의 주요 클라이언트 중 하나는 바로 이전에 만들었던 `FetchSystem`의 `ApiService`입니다. `ApiService`는 자신의 생명주기 훅 안에서 `AlertService`를 호출하여 API 통신 상태를 사용자에게 알려주는 역할을 합니다.

**`@dooboostore/simple-boot/src/fetch/ApiService.ts` (일부)**
```typescript
@Sim
export class ApiService extends HttpJsonFetcher<ApiServiceConfig, PIPE> {
  // DI를 통해 AlertService 인스턴스를 주입받음
  constructor(
    private simstanceManager: SimstanceManager,
    private alertService: AlertService<any>
  ) {
    super();
  }

  // ...

  protected before(config: FetcherRequest<...>, pipe: PIPE) {
    // `alertProgress: true` 설정이 있으면
    if (config.config?.config?.alertProgress) {
      // `AlertService`를 통해 progress 타입의 알림 생성을 요청
      const alert = this.alertService.progress({ title: config.config.config.title });
      if (alert) {
        // 생성된 Alert 객체를 활성화하고, 나중에 닫기 위해 pipe에 저장
        pipe.progress = alert;
        alert.active();
      }
    }
  }

  protected error(config: FetcherRequest<...>, pipe: PIPE, e?: any) {
    // `alertErrorMsg: true` 설정이 있으면
    if (config.config?.config?.alertErrorMsg) {
      // `AlertService`를 통해 danger 타입의 알림 생성을 요청하고 활성화
      this.alertService.danger({
        title: `${config.config.config.title ?? ''} (${e.message ?? ''})`
      })?.active();
    }
  }

  protected finally(config: FetcherRequest<...>, pipe: PIPE) {
    // `before`에서 생성했던 progress 알림을 찾아 비활성화
    pipe.progress?.deActive();
  }
}
```
`ApiService`는 `AlertService`의 `progress()`, `danger()`와 같은 메소드를 호출할 뿐, `FrontAlertFactory`나 `DangerAlertComponent`의 존재에 대해서는 전혀 알지 못합니다. 이것이 바로 우리가 설계한 추상화의 힘입니다.

## 6.2. 전체 동작 흐름 요약

사용자가 버튼을 클릭하여 API 요청이 시작되고, 그 결과로 에러 알림이 화면에 표시되기까지의 전체 흐름을 순서대로 따라가 보겠습니다.

1.  **`ApiService`**: `error` 훅에서 `this.alertService.danger({ title: '...' })`를 호출합니다.
2.  **`AlertService`**: `danger()` 메소드 안에서 `createFromFactory(AlertType.DANGER, ...)`를 호출합니다.
3.  **`AlertService`**: 생성자에 주입된 `AlertFactory`의 `create()` 메소드를 `type: AlertType.DANGER`와 함께 호출합니다.
4.  **`FrontAlertFactory`**: `create()` 메소드의 `switch` 문이 `DANGER` 케이스를 만나 `new DangerAlert(this.alertService, ...)`를 실행하여 `DangerAlert` 인스턴스를 생성하고 반환합니다.
5.  **`AlertService`**: 생성된 `DangerAlert` 인스턴스를 `ApiService`에 반환합니다.
6.  **`ApiService`**: 반환된 `DangerAlert` 인스턴스의 `.active()` 메소드를 호출합니다.
7.  **`DangerAlert`**: `active()` 메소드 내부에서 자신의 `make()` 메소드를 호출합니다.
8.  **`DangerAlert`**: `make()` 메소드는 `new DangerAlertComponent()`를 실행하여 UI 컴포넌트 인스턴스를 생성하고, 이를 `this.result`에 저장한 후 반환합니다.
9.  **`DangerAlert`**: `active()` 메소드는 이어서 `this.alertService.publish({ action: AlertAction.ACTIVE, alert: this })`를 호출하여 "나(DangerAlert) 활성화되었음"이라고 시스템 전체에 방송합니다.
10. **`AlertContainer`**: `alertService.observable`을 구독하고 있다가 `ACTIVE` 액션을 수신합니다.
11. **`AlertContainer`**: 함께 전달된 `DangerAlert` 객체에서 `alert.result` (즉, `DangerAlertComponent` 인스턴스)를 꺼냅니다.
12. **`AlertContainer`**: `DangerAlertComponent`의 DOM 엘리먼트를 자신의 컨테이너 DIV에 `appendChild`하여 화면에 최종적으로 렌더링합니다.

이처럼 각 객체는 자신의 책임만 다하며, 서로의 구체적인 내용을 알지 못한 채 오직 약속된 인터페이스(추상화)를 통해서만 상호작용합니다. 그 결과, 매우 유연하고, 재사용 가능하며, 테스트하기 쉬운 `AlertSystem`이 완성되었습니다.

## 6.3. 책을 마치며

이 책을 통해 우리는 단순히 UI 컴포넌트를 만드는 것을 넘어, 그 이면의 아키텍처를 고민하고 설계하는 과정을 경험했습니다. 팩토리 패턴, 의존성 주입, 반응형 프로그래밍 등 여러 디자인 패턴과 개념들이 어떻게 조화롭게 어우러져 하나의 견고한 시스템을 만드는지 살펴보았습니다.

여기서 다룬 개념과 코드들을 기반으로, 여러분의 프로젝트에 맞는 더욱 강력하고 발전된 시스템을 만들어 나가시길 바랍니다.
