# 제2장: 요청 생명주기(Lifecycle) 훅 구현

`ApiService`의 기본 구조를 만들었으니, 이제 실제 기능을 추가할 차례입니다. `HttpJsonFetcher`로부터 상속받은 생명주기 메소드들을 오버라이드(override)하여 API 요청의 각 단계에 우리가 원하는 동작을 삽입해 보겠습니다.

## 2.1. 생명주기 훅(Hook)이란?

생명주기 훅은 특정 이벤트가 발생했을 때 시스템에 의해 자동으로 호출되는 메소드를 의미합니다. `HttpJsonFetcher`는 API 요청 과정의 주요 시점마다 훅을 제공하여 우리가 유연하게 로직을 추가할 수 있도록 해줍니다.

-   `before()`: `fetch` 요청이 시작되기 직전에 호출됩니다.
-   `afterSuccess()`: 네트워크 요청이 성공하고 응답을 성공적으로 파싱한 직후에 호출됩니다.
-   `error()`: 네트워크 오류가 발생하거나 응답 상태 코드가 2xx가 아닐 때 호출됩니다.
-   `finally()`: 요청이 성공하든 실패하든 관계없이 모든 과정이 끝난 후 항상 호출됩니다.

## 2.2. 생명주기 훅 구현하기

`ApiService` 클래스에 각 훅을 오버라이드하여 간단한 로그를 출력하는 코드를 추가해 보겠습니다. 이를 통해 각 훅이 언제 호출되는지 명확하게 이해할 수 있습니다.

```typescript
// ApiService.ts

// ... (이전 코드)

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {

  // ... (createPipe 메소드)

  protected before(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    console.log(`[ApiService] Request Starting: ${config.config?.config?.title ?? 'Untitled'}`);
    // 여기에 로딩 스피너를 활성화하는 코드를 추가할 수 있습니다.
  }

  protected afterSuccess(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    console.log(`[ApiService] Request Success: ${config.config?.config?.title ?? 'Untitled'}`);
    // 여기에 성공 메시지를 표시하는 코드를 추가할 수 있습니다.
  }

  protected error(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE,
    e?: any
  ) {
    console.error(`[ApiService] Request Error: ${config.config?.config?.title ?? 'Untitled'}`, e);
    // 여기에 에러 메시지를 표시하는 코드를 추가할 수 있습니다.
  }

  protected finally(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    console.log(`[ApiService] Request Finished: ${config.config?.config?.title ?? 'Untitled'}`);
    // 여기에 로딩 스피러를 비활성화하는 코드를 추가할 수 있습니다.
  }
}
```

### 코드 분석

-   각 메소드는 `config`와 `pipe` 두 개의 파라미터를 받습니다.
    -   `config`: 현재 실행 중인 요청에 대한 모든 정보를 담고 있는 객체입니다. URL, HTTP 메소드, 헤더, 그리고 우리가 다음 장에서 정의할 커스텀 설정(`ApiServiceConfig`) 등이 포함됩니다.
    -   `pipe`: 1장에서 설명했듯이, 현재 요청의 생명주기 동안 공유되는 컨텍스트 객체입니다.
-   `config.config?.config?.title`: `ApiService`를 사용할 때 넘겨줄 설정 객체에서 `title` 속성을 읽어와 로그에 출력합니다. 이를 통해 어떤 요청이 실행 중인지 쉽게 식별할 수 있습니다. `?? 'Untitled'` 구문은 `title`이 없을 경우 기본값을 사용하도록 합니다.
-   `error` 메소드는 추가로 `e` 파라미터를 받는데, 여기에는 발생한 에러 객체가 담겨있습니다.

## 2.3. 구현의 의미와 다음 단계

이제 우리의 `ApiService`는 모든 API 요청의 시작, 성공, 실패, 그리고 종료 시점에 자동으로 로그를 남기는 기능을 갖게 되었습니다. 이는 디버깅에 매우 유용하며, 앞으로 추가될 기능들의 기반이 됩니다.

예를 들어, `before` 훅에는 로딩 스피너를 활성화하는 코드를, `finally` 훅에는 비활성화하는 코드를 추가할 수 있습니다. `afterSuccess`나 `error` 훅에는 사용자에게 성공 또는 실패 메시지를 보여주는 UI 로직을 추가할 수 있습니다.

다음 장에서는 이러한 UI 피드백 로직을 하드코딩하는 대신, `ApiServiceConfig` 설정 객체를 통해 사용자가 각 요청마다 유연하게 제어할 수 있도록 만드는 방법을 알아보겠습니다.