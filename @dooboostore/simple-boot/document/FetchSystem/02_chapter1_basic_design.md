# 제1장: 계층적 Fetcher 설계와 기본 구조

`ApiService` 구현의 첫걸음은 견고하고 잘 설계된 기반 위에 클래스를 구축하는 것입니다. 우리는 `@dooboostore/core` 라이브러리에서 제공하는 계층적인 Fetcher 구조를 활용할 것입니다. 이 구조를 이해하는 것은 우리가 만들 `ApiService`의 역할과 위치를 명확히 하는 데 매우 중요합니다.

## 1.1. Fetcher 계층 구조의 설계 사상

`ApiService`는 단 하나의 클래스가 아니라, 명확한 책임을 가진 여러 클래스가 상속 관계로 엮인 계층 구조의 최상단에 위치합니다. 이 설계의 핵심 사상은 **관심사의 분리(Separation of Concerns)**입니다. 각 계층은 자신의 책임에만 집중하며, 하위 계층의 복잡성을 추상화하여 숨깁니다.

```
+---------------------+
|     ApiService      |  (비즈니스/애플리케이션 계층)
+---------------------+
          |
          V (extends)
+---------------------+
|   HttpJsonFetcher   |  (JSON 데이터 형식 계층)
+---------------------+
          |
          V (extends)
+---------------------+
|     HttpFetcher     |  (HTTP 프로토콜 계층)
+---------------------+
          |
          V (extends)
+---------------------+
|       Fetcher       |  (최상위 추상 계층)
+---------------------+
```

### 1.1.1. `Fetcher`: 최상위 추상 계층

-   **책임**: "데이터를 가져온다(fetch)"는 행위의 가장 기본적인 약속(contract)을 정의합니다.
-   **특징**: `execute`라는 단 하나의 추상 메소드만을 가집니다. 이 계층은 데이터 소스가 HTTP인지, 파일 시스템인지, 또는 데이터베이스인지 전혀 신경 쓰지 않습니다. 오직 "실행"이라는 개념만 존재합니다. 이러한 추상화 덕분에 `Fetcher`의 개념은 HTTP 통신 외의 다른 영역에서도 재사용될 수 있습니다.

### 1.1.2. `HttpFetcher`: HTTP 프로토콜 계층

-   **책임**: `Fetcher`의 추상적인 개념을 HTTP 프로토콜의 맥락으로 구체화합니다.
-   **특징**: `Fetcher`를 상속받아, `execute` 메소드를 브라우저의 `fetch` API를 사용하여 HTTP 요청을 보내는 로직으로 구현합니다. 이 계층은 URL, 요청 메소드(GET, POST 등), 헤더, 바디 등 HTTP의 구성 요소를 이해하고 처리합니다. 하지만 아직 데이터가 어떤 형식(JSON, XML, text 등)으로 오고 가는지는 관여하지 않습니다. 오직 순수한 HTTP 통신 그 자체만을 담당합니다.

### 1.1.3. `HttpJsonFetcher`: JSON 데이터 형식 계층

-   **책임**: 현대 웹에서 가장 널리 사용되는 데이터 형식인 JSON을 처리하는 책임을 전담합니다.
-   **특징**: `HttpFetcher`를 상속받아, JSON 데이터 교환을 위한 편의 기능을 추가합니다.
    -   요청 시: `body` 객체를 자동으로 `JSON.stringify()` 처리합니다.
    -   응답 시: `Response` 객체에 대해 자동으로 `.json()` 메소드를 호출하여 JavaScript 객체로 파싱합니다.
    -   `Content-Type` 헤더를 `application/json`으로 설정하는 등의 작업을 내부적으로 처리합니다.
-   우리가 만들 `ApiService`는 대부분의 API가 JSON 기반으로 통신하기 때문에, 이 클래스를 상속받는 것이 가장 효율적입니다.

### 1.1.4. `ApiService`: 비즈니스/애플리케이션 계층

-   **책임**: 잘 갖춰진 HTTP 및 JSON 통신 기반 위에, 우리 애플리케이션에 특화된 비즈니스 로직을 추가합니다.
-   **특징**: `HttpJsonFetcher`를 상속받아, 사용자 알림(Alert), 요청별 콜백, RxJS를 통한 반응형 상태 관리, 인증을 위한 인터셉터 등 애플리케이션 수준의 기능들을 구현합니다. 이 책에서 우리가 집중적으로 구현할 부분이 바로 이 계층입니다.

## 1.2. `ApiService` 기본 클래스 정의

이러한 계층적 설계를 이해했으므로, 이제 `HttpJsonFetcher`를 확장하여 `ApiService`의 기본 뼈대를 만들어 보겠습니다.

```typescript
// ApiService.ts
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { HttpFetcherConfig, HttpJsonFetcher, FetcherRequest } from '@dooboostore/core/fetch';

// 설정과 파이프 객체의 타입을 정의합니다. 지금은 비워둡니다.
export namespace ApiService {
  export type ApiServiceConfig = {};
  export type PIPE<T = any> = {};
}

// @Sim 데코레이터를 사용하여 DI 컨테이너에 등록합니다.
@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {

  // HttpJsonFetcher의 추상 메소드를 구현합니다.
  protected createPipe<T = any>(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>, T>
  ): ApiService.PIPE {
    // PIPE 객체는 각 요청마다 생성되며, 생명주기 훅 간에 데이터를 전달하는 데 사용됩니다.
    return {};
  }
}
```
이 코드는 이전과 동일하지만, 이제 우리는 `ApiService`가 왜 `HttpJsonFetcher`를 상속받았는지, 그리고 그 아래에 어떤 견고한 기반이 있는지 명확히 이해하게 되었습니다.

다음 장에서는 이 뼈대 위에 요청 생명주기 훅(`before`, `afterSuccess`, `error`, `finally`)을 오버라이드하여 우리가 원하는 기능들을 구체적으로 구현해보겠습니다.
