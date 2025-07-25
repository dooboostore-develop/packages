# Chapter 5: Ensuring Extensibility Through Interceptors

The `ApiService` we've built so far is highly flexible, but what if we need to add an `Authorization` header to all API requests? Manually adding headers at every `apiService.get(...)` call is cumbersome and prone to errors.

To elegantly handle such cross-cutting concerns, we introduce the Interceptor pattern. An interceptor is a powerful tool that allows us to inject common logic into the request and response processing flow without modifying the core logic of `ApiService`.

## 5.1. Designing the `ApiServiceInterceptor` Interface

First, we define a common interface that all interceptors must implement.

```typescript
// ApiService.ts -> Inside ApiServiceInterceptor namespace

// Defines hooks where interceptors can intervene
export interface ApiServiceInterceptor {
  // Called just before fetch, providing an opportunity to modify request information
  beforeProxyFetch?<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>>;

  // Called immediately after fetch, providing an opportunity to process the Response object
  afterProxyFetch?<T = RequestInfo | URL>(config: AfterProxyFetchParams<T>): Promise<Response>;

  // Called before the ApiService's execute method runs
  beforeProxyExecute?(config: BeforeProxyExecuteParams): Promise<BeforeProxyExecuteParams>;
}
```

-   `beforeProxyFetch`: Executed just before `fetch` is actually called. Used for purposes such as adding request headers or changing URLs.
-   `afterProxyFetch`: Executed immediately after `fetch` completes, before `ApiService` processes the response. It allows direct manipulation of the `Response` object, making it suitable for implementing advanced logic like refreshing tokens on 401 errors and retrying the original request.
-   `beforeProxyExecute`: Called before the `ApiService`'s entire execution logic (`execute` method) begins.

## 5.2. Registering and Retrieving Interceptors

We utilize `simple-boot`'s DI container to manage interceptors. Interceptor classes are registered in the DI container using a unique `Symbol`, and `ApiService` finds all registered interceptor instances through this `Symbol`.

```typescript
// ApiService.ts -> Inside ApiServiceInterceptor namespace

// 1. Defines a unique Symbol for interceptor identification
export const TOKEN = Symbol('ApiServiceInterceptor');

// 2. Helper function to find all interceptor instances from the DI container
export const resolveAll = (simstanceManager: SimstanceManager): ApiServiceInterceptor[] => {
  try {
    return (simstanceManager.findSims<ApiServiceInterceptor>(ApiServiceInterceptor.TOKEN) ?? []).map(it => it.getValue()).filter(isDefined);
  } catch (e) {
    return [];
  }
};
```

## 5.3. Applying Interceptors to `ApiService`

Now, we modify the `ApiService`'s `beforeProxyFetch`, `afterProxyFetch`, and `execute` methods to sequentially execute the retrieved interceptors.

```typescript
// ApiService.ts -> Inside ApiService class

// ... (simstanceManager injected in constructor)

async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>) {
  // Get all registered interceptors
  const interceptors = ApiServiceInterceptor.resolveAll(this.simstanceManager);
  for (const interceptor of interceptors) {
    if (interceptor.beforeProxyFetch) {
      // Sequentially execute each interceptor's beforeProxyFetch
      // The config modified by the previous interceptor is passed to the next
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
      // afterProxyFetch directly handles the Response object
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
  // After all interceptors are applied, execute the parent class's execute
  return super.execute(r.target, r.config);
}
```

## 5.4. Interceptor Implementation and Usage Example

Now, let's create an `AuthInterceptor` that actually adds an authentication token to the header.

```typescript
// AuthInterceptor.ts

@Sim({
  symbol: ApiServiceInterceptor.TOKEN // Register with TOKEN symbol so ApiService can find it
})
export class AuthInterceptor implements ApiServiceInterceptor {
  constructor(private authStorage: AuthStorage) {} // Service that stores login tokens

  async beforeProxyFetch<T = RequestInfo | URL>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>> {
    const token = this.authStorage.getAccessToken();
    if (token) {
      // Add Authorization to headers
      (config.init.headers as Headers).set('Authorization', `Bearer ${token}`);
    }
    return config;
  }
}
```
By simply registering `AuthInterceptor` in the DI container using the `@Sim` decorator and `ApiServiceInterceptor.TOKEN` symbol, `ApiService` automatically recognizes this interceptor and applies it to all requests. Developers no longer need to worry about headers every time they make an API call.

With this, `ApiService` has become a complete API client equipped with centralized logic, flexible configuration, reactive state management, and excellent extensibility.

In the next chapter, we will bring together all the pieces we've built so far to examine the complete `ApiService` code and provide a simple usage example for a final summary.
