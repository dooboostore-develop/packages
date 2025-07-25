# 제3장: 유연한 설정 객체와 콜백

지금까지 구현한 생명주기 훅은 모든 API 요청에 대해 동일하게 동작합니다. 하지만 실제 애플리케이션에서는 각 요청의 특성에 따라 다른 처리가 필요할 때가 많습니다. 예를 들어, 어떤 요청은 진행 상태를 사용자에게 알려줘야 하지만, 백그라운드에서 조용히 실행되어야 하는 요청도 있습니다.

이번 장에서는 `ApiServiceConfig` 타입을 구체화하여, 각 요청마다 동작을 유연하게 제어할 수 있는 설정 객체와 콜백 함수를 설계하고 구현합니다.

## 3.1. `ApiServiceConfig` 설계

`ApiServiceConfig`를 두 가지 책임으로 분리하여 설계합니다.

-   **`AlertConfig`**: 사용자에게 보여줄 알림(Alert)에 대한 설정을 다룹니다. `true`/`false` 값으로 간단하게 제어하는 선언적인 방식입니다.
-   **`CallBackConfig`**: 요청의 각 생명주기 시점에 실행될 커스텀 콜백 함수를 다룹니다. 특정 요청에만 필요한 복잡한 로직을 처리하는 명령적인 방식입니다.

```typescript
// ApiService.ts -> ApiService 네임스페이스 내부

// 사용자 알림(Alert) 관련 설정
export type AlertConfig = {
  title?: string; // 알림에 표시될 제목
  alertProgress?: boolean; // 진행 중 알림 표시 여부
  alertSuccessMsg?: boolean; // 성공 메시지 알림 표시 여부
  alertErrorMsg?: boolean; // 에러 메시지 알림 표시 여부
  enableErrorConsole?: boolean; // 콘솔에 에러 로그 출력 여부
};

// 콜백 함수 관련 설정
export type CallBackConfig = {
  callBackProgress?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
  callBackSuccess?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
  callBackError?: (
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>,
    pipe: PIPE,
    e?: any
  ) => void;
  callBackFinal?: (
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>,
    pipe: PIPE,
    e?: any
  ) => void;
};

// 두 설정을 합쳐 최종 ApiServiceConfig 타입을 정의
export type ApiServiceConfig = CallBackConfig & AlertConfig;
```

## 3.2. `AlertService` 주입 및 활용

선언적인 알림 설정을 처리하기 위해, 외부에서 `AlertService`를 주입받아 사용합니다. `AlertService`는 `success`, `danger`, `progress` 등의 메소드를 통해 사용자에게 일관된 UI 피드백을 제공하는 역할을 합니다. (`AlertService`의 상세 구현은 이 책의 범위를 벗어납니다.)

```typescript
// ApiService.ts
import { AlertService } from '../alert/AlertService';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
// ...

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  private alertService?: AlertService<any>;

  constructor(private simstanceManager: SimstanceManager, alertService: AlertService<any>) {
    super();
    this.alertService = alertService;
  }

  // ... createPipe ...
}
```
`simple-boot` DI 컨테이너가 `ApiService`를 생성할 때, `AlertService`의 인스턴스를 자동으로 주입해 줍니다.

## 3.3. 생명주기 훅과 설정 객체 연동

이제 2장에서 구현했던 생명주기 훅들을 수정하여, `ApiServiceConfig` 설정에 따라 분기 처리하고 콜백 함수를 실행하도록 만듭니다.

```typescript
// ApiService.ts -> ApiService 클래스 내부

protected before(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // 콜백 실행
  config.config?.config?.callBackProgress?.(config, pipe);

  // 선언적 알림 처리
  if (config.config?.config?.alertProgress) {
    const alert = this.alertService?.progress({title: config.config.config.title});
    if (alert) {
      // 생성된 알림 객체를 PIPE에 저장하여 finally 훅에서 참조할 수 있도록 함
      pipe.progress = alert;
      alert.active();
    }
  }
}

protected afterSuccess(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // 콜백 실행
  config.config?.config?.callBackSuccess?.(config, pipe);

  // 선언적 알림 처리
  if (config.config?.config?.alertSuccessMsg) {
    this.alertService?.success({ title: config.config.config.title })?.active();
  }
}

protected error(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE,
  e?: any
) {
  // 콜백 실행
  config.config?.config?.callBackError?.(config, pipe, e);

  // 선언적 알림 처리
  if (config.config?.config?.alertErrorMsg) {
    this.alertService?.danger({
      title: `${config.config.config.title ? config.config.config.title : ''}${e.message ? `(${e.message})` : ''}`
    })?.active();
  }

  // 에러 로그 출력 처리
  if (config.config?.config?.enableErrorConsole) {
    console.error(`[ApiService] Error: ${config?.config?.config?.title}`, e);
  }
}

protected finally(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // 콜백 실행
  config.config?.config?.callBackFinal?.(config, pipe);

  // before에서 생성한 진행 알림을 닫음
  pipe.progress?.deActive();
}
```

### 코드 분석
- **콜백 호출**: 각 훅의 시작 부분에서 `config.config?.config?.callBack...?` 구문을 통해 사용자가 전달한 콜백 함수가 있는지 확인하고, 있다면 실행합니다.
- **선언적 알림**: `if (config.config?.config?.alert...?)` 구문을 통해 사용자가 알림 옵션을 `true`로 설정했는지 확인하고, `alertService`를 호출하여 알림을 띄웁니다.
- **`PIPE` 객체 활용**: `before` 훅에서 생성된 `progress` 알림 객체를 `pipe.progress`에 저장했습니다. 그리고 `finally` 훅에서 `pipe.progress`를 다시 참조하여 `deActive()` 메소드를 호출함으로써, 요청이 끝나면 진행 알림이 항상 닫히도록 보장합니다. 이것이 `PIPE` 객체의 핵심적인 역할입니다.

## 3.4. 유연성의 확보

이제 `ApiService`는 매우 유연해졌습니다. 개발자는 API를 호출할 때 설정 객체를 넘겨주는 것만으로 다음과 같은 제어를 할 수 있습니다.

```typescript
// 사용 예시
this.apiService.get('/users/1', {
  config: {
    title: '사용자 정보 조회',
    alertProgress: true, // 로딩 알림 표시
    alertErrorMsg: true, // 에러 발생 시 알림 표시
    callBackSuccess: (config, pipe) => { // 성공 시 특별한 로직 실행
      console.log('사용자 정보를 성공적으로 가져왔습니다.');
    }
  }
});
```

다음 장에서는 여기서 한 걸음 더 나아가, RxJS를 사용하여 `ApiService`의 모든 상태 변화를 애플리케이션 전체에 알리는 반응형 시스템을 구축해보겠습니다.