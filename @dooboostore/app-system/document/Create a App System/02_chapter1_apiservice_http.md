# 제1장: 시스템의 기반 - ApiService와 HTTP 통신

모든 웹 애플리케이션의 핵심은 백엔드 서버와의 데이터 통신입니다. `ApiService`는 이러한 HTTP 통신을 체계적이고 확장 가능한 방식으로 처리하기 위해 설계된 `app-system`의 기반 모듈입니다. 이 장에서는 `ApiService`의 계층적 구조, HTTP 요청/응답 처리, 그리고 인터셉터(Interceptor) 패턴에 대해 알아봅니다.

## 1.1. ApiService의 계층적 구조

`ApiService`는 `fetch` API를 기반으로 하며, 다음과 같은 계층적 상속 구조를 가집니다. 각 계층은 특정 기능을 추가하며 상위 계층의 복잡성을 추상화합니다.

```
Fetcher → HttpFetcher → HttpJsonFetcher → ApiService
```

-   **`Fetcher` (Base Abstract Class):** 모든 데이터 가져오기(fetching) 작업의 추상적인 기반 클래스입니다. 가장 기본적인 `execute` 메소드를 정의합니다.
-   **`HttpFetcher`:** `Fetcher`를 확장하여 HTTP 통신에 특화된 기능을 추가합니다. 표준 HTTP 메소드(GET, POST 등), URL 및 쿼리 파라미터 처리, 요청 타임아웃, 요청/응답 인터셉션 포인트 등을 제공합니다.
-   **`HttpJsonFetcher`:** `HttpFetcher`를 확장하여 JSON 데이터 처리에 특화된 기능을 추가합니다. 자동 JSON `Content-Type` 헤더 설정, JSON 바디 직렬화, JSON 응답 파싱 등을 담당합니다.
-   **`ApiService`:** `HttpJsonFetcher`를 확장하여 `app-system`의 애플리케이션 특화 기능을 추가합니다. 진행 상황, 성공, 에러에 대한 알림(Alert) 기능, 요청 생명주기 이벤트에 대한 옵저버블(Observable) 패턴, 커스텀 콜백 훅 등을 제공합니다.

이러한 계층 구조는 각 계층의 책임을 명확히 분리하고, 코드 재사용성을 높이며, 시스템의 확장성을 용이하게 합니다.

## 1.2. HTTP 요청/응답 처리

`ApiService`는 `fetch` API를 사용하여 HTTP 요청을 보내고 응답을 받습니다. `ApiService`의 메소드들은 `target` (URL)과 `config` (요청 설정) 객체를 인자로 받습니다.

-   **요청 설정 (`HttpFetcherConfig`):** `fetch` API의 `RequestInit` 객체와 유사하게, `method`, `headers`, `body`, `signal` (AbortController용) 등 요청에 필요한 모든 설정을 포함합니다.
-   **응답 처리:** `ApiService`는 기본적으로 응답을 JSON으로 파싱합니다. 비-200 상태 코드 응답이나 네트워크 에러 발생 시에는 예외를 발생시켜 에러 처리 메커니즘과 연동됩니다.

### 예제: `ApiService`를 통한 HTTP 요청

```typescript
import 'reflect-metadata';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ApiService } from '@dooboostore/app-system/fetch/ApiService';
import { AlertService } from '@dooboostore/app-system/alert/AlertService';
import { DefaultAlertFactory } from '@dooboostore/app-system/alert/AlertFactory';

// AlertService와 AlertFactory는 ApiService의 의존성입니다.
// 실제 환경에서는 SimpleApplication에 의해 자동으로 주입됩니다.
const app = new SimpleApplication();
app.run();

const alertService = app.sim(AlertService); // AlertService 인스턴스 가져오기

@Sim
class UserService {
  constructor(private apiService: ApiService) {}

  async getUser(id: string) {
    console.log(`[UserService] Fetching user ${id}...`);
    try {
      const user = await this.apiService.get({
        target: `https://jsonplaceholder.typicode.com/users/${id}`, // 예시 API
        config: {
          config: {
            title: `User ${id} Data`,
            alertProgress: true, // 요청 시작 시 진행 알림 표시
            alertSuccessMsg: true, // 성공 시 성공 알림 표시
            alertErrorMsg: true, // 에러 시 에러 알림 표시
            enableErrorConsole: true, // 에러 발생 시 콘솔에 로그
          },
          callBackSuccess: (config, pipe) => {
            console.log(`[UserService] Successfully fetched ${config.config?.config?.title}`);
          },
          callBackError: (config, pipe, error) => {
            console.error(`[UserService] Failed to fetch ${config.config?.config?.title}:`, error);
          },
        },
      });
      console.log(`[UserService] User ${id} data:`, user);
      return user;
    } catch (error) {
      console.error(`[UserService] Error in getUser(${id}):`, error);
      throw error;
    }
  }

  async createUser(userData: { name: string; email: string }) {
    console.log(`[UserService] Creating user: ${userData.name}...`);
    try {
      const newUser = await this.apiService.postJson({
        target: `https://jsonplaceholder.typicode.com/users`, // 예시 API
        config: {
          fetch: {
            body: userData,
          },
          config: {
            title: `Create User ${userData.name}`,
            alertProgress: true,
            alertSuccessMsg: true,
            alertErrorMsg: true,
          },
        },
      });
      console.log(`[UserService] User created:`, newUser);
      return newUser;
    } catch (error) {
      console.error(`[UserService] Error in createUser(${userData.name}):`, error);
      throw error;
    }
  }
}

const userService = app.sim(UserService);

async function runApiExamples() {
  console.log('\n--- Fetching User 1 ---');
  await userService?.getUser('1');

  console.log('\n--- Fetching Non-existent User (ID 999) ---');
  await userService?.getUser('999'); // 404 Not Found 에러 발생 예상

  console.log('\n--- Creating New User ---');
  await userService?.createUser({ name: 'Jane Doe', email: 'jane.doe@example.com' });
}

runApiExamples();
```

## 1.3. 인터셉터(Interceptor) 패턴

인터셉터는 HTTP 요청이 전송되기 전이나 응답이 처리되기 전에 요청 또는 응답을 가로채어 수정하거나 추가적인 로직을 실행할 수 있는 강력한 메커니즘입니다. 이는 인증 토큰 추가, 로깅, 에러 처리, 데이터 변환 등 횡단 관심사를 처리하는 데 매우 유용합니다.

`ApiService`는 `ApiServiceInterceptor` 인터페이스를 통해 인터셉터 패턴을 지원합니다.

-   **`ApiServiceInterceptor` 인터페이스:** `beforeProxyFetch`, `afterProxyFetch`, `beforeProxyExecute` 메소드를 정의합니다. 이 메소드들은 `ApiService`의 `fetch` 호출 전후에 실행됩니다.

### 구현 원리

`ApiService`는 `SimstanceManager`를 통해 등록된 모든 `ApiServiceInterceptor` 구현체들을 찾아 요청 처리 파이프라인에 주입합니다. `ApiService`의 `beforeProxyFetch`와 `afterProxyFetch` 메소드 내에서 등록된 인터셉터들의 해당 메소드를 순서대로 호출합니다.

```typescript
// fetch/ApiService.ts (개념적 - 인터셉터 적용 부분)
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  // ...

  async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>) {
    let interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager); // 등록된 모든 인터셉터 조회
    for (const interceptor of interceptors) {
      if (interceptor.beforeProxyFetch) {
        config = await interceptor.beforeProxyFetch(config); // 각 인터셉터의 beforeProxyFetch 호출
      }
    }
    return config;
  }

  async afterProxyFetch<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>) {
    let interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
    let response = config.response;
    for (const interceptor of interceptors) {
      if (interceptor.afterProxyFetch) {
        response = await interceptor.afterProxyFetch(config); // 각 인터셉터의 afterProxyFetch 호출
      }
    }
    return response;
  }
  // ...
}
```

### 예제: `ApiServiceInterceptor` 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ApiService, ApiServiceInterceptor } from '@dooboostore/app-system/fetch/ApiService';
import { AlertService } from '@dooboostore/app-system/alert/AlertService';
import { DefaultAlertFactory } from '@dooboostore/app-system/alert/AlertFactory';

// 1. 커스텀 인터셉터 정의
@Sim({ symbol: ApiServiceInterceptor.TOKEN }) // ApiServiceInterceptor.TOKEN 심볼로 등록
class AuthInterceptor implements ApiServiceInterceptor {
  async beforeProxyFetch(config: any) {
    console.log('[AuthInterceptor] Adding Authorization header...');
    // 요청 헤더에 인증 토큰 추가 (예시)
    config.fetch.headers = {
      ...config.fetch.headers,
      'Authorization': 'Bearer my-auth-token-123',
    };
    return config;
  }

  async afterProxyFetch(config: any) {
    console.log('[AuthInterceptor] Checking response status...');
    if (config.response.status === 401) {
      console.warn('[AuthInterceptor] Unauthorized response! Redirecting to login...');
      // 실제 애플리케이션에서는 로그인 페이지로 리다이렉트 등의 로직 수행
    }
    return config.response;
  }
}

@Sim({ symbol: ApiServiceInterceptor.TOKEN }) // 다른 인터셉터도 등록 가능
class LoggingInterceptor implements ApiServiceInterceptor {
  async beforeProxyFetch(config: any) {
    console.log(`[LoggingInterceptor] Requesting: ${config.target.toString()}`);
    return config;
  }

  async afterProxyFetch(config: any) {
    console.log(`[LoggingInterceptor] Response status: ${config.response.status}`);
    return config.response;
  }
}

// 2. ApiService를 사용하는 서비스
@Sim
class DataService {
  constructor(private apiService: ApiService) {}

  async fetchData() {
    console.log('[DataService] Fetching data from API...');
    try {
      const data = await this.apiService.get({
        target: 'https://jsonplaceholder.typicode.com/posts/1',
        config: {
          config: { title: 'Fetch Post' },
        },
      });
      console.log('[DataService] Fetched data:', data);
      return data;
    } catch (error) {
      console.error('[DataService] Error fetching data:', error);
      throw error;
    }
  }

  async fetchUnauthorizedData() {
    console.log('\n[DataService] Fetching data that will result in 401...');
    try {
      // 401 응답을 모의하기 위한 URL (실제 API는 아님)
      const data = await this.apiService.get({
        target: 'https://httpstat.us/401',
        config: {
          config: { title: 'Fetch 401' },
        },
      });
      console.log('[DataService] Fetched 401 data:', data);
      return data;
    } catch (error) {
      console.error('[DataService] Error fetching 401 data:', error);
      throw error;
    }
  }
}

// 3. SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication();
app.run();

const dataService = app.sim(DataService);

async function runInterceptorExamples() {
  await dataService?.fetchData();
  await dataService?.fetchUnauthorizedData();
}

runInterceptorExamples();
```

`ApiService`와 인터셉터 패턴은 `app-system`이 HTTP 통신을 강력하고 유연하게 제어할 수 있도록 하는 핵심 메커니즘입니다. 이를 통해 개발자는 API 호출 로직을 깔끔하게 유지하면서도, 인증, 로깅, 에러 처리 등 다양한 횡단 관심사를 효과적으로 관리할 수 있습니다.

다음 장에서는 사용자에게 시각적인 피드백을 제공하는 `Alert` 시스템에 대해 알아보겠습니다.
