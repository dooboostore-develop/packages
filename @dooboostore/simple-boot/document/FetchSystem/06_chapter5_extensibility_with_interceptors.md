# 제5장: 인터셉터를 통한 확장성 확보

지금까지 만든 `ApiService`는 매우 유연하지만, 만약 모든 API 요청에 공통적으로 `Authorization` 헤더를 추가해야 한다면 어떻게 해야 할까요? 모든 `apiService.get(...)` 호출 시점에 헤더를 수동으로 추가하는 것은 번거롭고 실수를 유발하기 쉽습니다.

이러한 횡단 관심사(cross-cutting concerns)를 우아하게 처리하기 위해 인터셉터(Interceptor) 패턴을 도입합니다. 인터셉터는 `ApiService`의 핵심 로직을 수정하지 않으면서, 요청과 응답의 처리 과정에 개입하여 공통 로직을 추가할 수 있게 해주는 강력한 도구입니다.

## 5.1. `ApiServiceInterceptor` 인터페이스 설계

먼저, 모든 인터셉터가 구현해야 할 공통 인터페이스를 정의합니다.

```typescript
// ApiService.ts -> ApiServiceInterceptor 네임스페이스 내부

// 인터셉터가 개입할 수 있는 훅(hook) 정의
export interface ApiServiceInterceptor {
  // fetch 직전에 호출되어 요청 정보를 수정할 기회를 제공
  beforeProxyFetch?<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>>;

  // fetch 직후에 호출되어 응답(Response) 객체를 가공할 기회를 제공
  afterProxyFetch?<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>): Promise<Response>;

  // ApiService의 execute 메소드 실행 전에 호출
  beforeProxyExecute?(config: BeforeProxyExecuteParams): Promise<BeforeProxyExecuteParams>;
}
```

-   `beforeProxyFetch`: `fetch`가 실제로 호출되기 직전에 실행됩니다. 요청 헤더를 추가하거나 URL을 변경하는 등의 용도로 사용됩니다.
-   `afterProxyFetch`: `fetch`가 완료된 직후, `ApiService`가 응답을 처리하기 전에 실행됩니다. `Response` 객체를 직접 다룰 수 있어, 401 에러 발생 시 토큰을 갱신하고 원래 요청을 재시도하는 등의 고급 로직을 구현하기에 적합합니다.
-   `beforeProxyExecute`: `ApiService`의 전체 실행 로직(`execute` 메소드)이 시작되기 전에 호출됩니다.

## 5.2. 인터셉터 등록 및 조회

`simple-boot`의 DI 컨테이너를 활용하여 인터셉터들을 관리합니다. 인터셉터 클래스들은 고유한 `Symbol`을 사용하여 DI 컨테이너에 등록하고, `ApiService`는 이 `Symbol`을 통해 등록된 모든 인터셉터 인스턴스를 찾아옵니다.

```typescript
// ApiService.ts -> ApiServiceInterceptor 네임스페이스 내부

// 1. 인터셉터 식별을 위한 고유 심볼 정의
export const TOKEN = Symbol('ApiServiceInterceptor');

// 2. DI 컨테이너에서 모든 인터셉터 인스턴스를 찾아오는 헬퍼 함수
export const resolveAll = (simstanceManager: SimstanceManager): ApiServiceInterceptor[] => {
  try {
    return (simstanceManager.findSims<ApiServiceInterceptor>(ApiServiceInterceptor.TOKEN) ?? []).map(it => it.getValue()).filter(isDefined);
  } catch (e) {
    return [];
  }
};
```

## 5.3. `ApiService`에 인터셉터 적용하기

이제 `ApiService`의 `beforeProxyFetch`, `afterProxyFetch`, `execute` 메소드를 수정하여, 조회된 인터셉터들을 순차적으로 실행하도록 만듭니다.

```typescript
// ApiService.ts -> ApiService 클래스 내부

// ... (constructor에서 simstanceManager 주입받음)

async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>) {
  // 등록된 모든 인터셉터를 가져옴
  const interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
  for (const interceptor of interceptors) {
    if (interceptor.beforeProxyFetch) {
      // 각 인터셉터의 beforeProxyFetch를 순차적으로 실행
      // 이전 인터셉터가 수정한 config가 다음 인터셉터로 전달됨
      config = await interceptor.beforeProxyFetch(config);
    }
  }
  this.subject.next({ type: 'beforeFetchData', config: config as BeforeProxyFetchParams});
  return config;
}

async afterProxyFetch<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>) {
  const interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
  let r = config.response;
  for (const interceptor of interceptors) {
    if (interceptor.afterProxyFetch) {
      // afterProxyFetch는 Response 객체를 직접 다룸
      r = await interceptor.afterProxyFetch({ ...config, response: r });
    }
  }
  this.subject.next({ type: 'afterFetchData', response: r });
  return r;
}

protected async execute(
  target: HttpFetcherTarget,
  config?: HttpFetcherConfig<ApiService.ApiServiceConfig>
): Promise<any> {
  let r: ApiServiceInterceptor.BeforeProxyExecuteParams = {target, config};
  const interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
  for (const interceptor of interceptors) {
    if (interceptor.beforeProxyExecute) {
      r = await interceptor.beforeProxyExecute?.(r);
    }
  }
  // 모든 인터셉터가 적용된 후, 부모 클래스의 execute 실행
  return super.execute(r.target, r.config);
}
```

## 5.4. 인터셉터 구현 및 사용 예시

이제 실제로 인증 토큰을 헤더에 추가하는 `AuthInterceptor`를 만들어 보겠습니다.

```typescript
// AuthInterceptor.ts

@Sim({
  symbol: ApiServiceInterceptor.TOKEN // ApiService가 찾을 수 있도록 TOKEN 심볼로 등록
})
export class AuthInterceptor implements ApiServiceInterceptor {
  constructor(private authStorage: AuthStorage) {} // 로그인 토큰을 저장하는 서비스

  async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>> {
    const token = this.authStorage.getAccessToken();
    if (token) {
      // 헤더에 Authorization 추가
      (config.init.headers as Headers).set('Authorization', `Bearer ${token}`);
    }
    return config;
  }
}
```
`@Sim` 데코레이터와 `ApiServiceInterceptor.TOKEN` 심볼을 사용하여 `AuthInterceptor`를 DI 컨테이너에 등록하기만 하면, `ApiService`는 이 인터셉터를 자동으로 인식하고 모든 요청에 적용합니다. 개발자는 더 이상 API를 호출할 때마다 헤더를 신경 쓸 필요가 없습니다.

이로써 `ApiService`는 중앙화된 로직, 유연한 설정, 반응형 상태 관리, 그리고 뛰어난 확장성까지 갖춘 완전한 형태의 API 클라이언트가 되었습니다.

다음 장에서는 지금까지 만든 모든 조각들을 모아 `ApiService`의 전체 코드를 살펴보고, 간단한 사용 예시를 통해 최종적으로 정리하겠습니다.