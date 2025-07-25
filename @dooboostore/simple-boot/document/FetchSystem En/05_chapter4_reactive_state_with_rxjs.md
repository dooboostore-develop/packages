# Chapter 4: Reactive State Management with RxJS

`ApiService` can now handle callbacks and configurations for individual requests. But what if you want to share the API request status (e.g., the number of currently active requests) across multiple components, or treat the flow of API requests as a data stream?

In this chapter, we will introduce RxJS's `Subject` and `Observable` to build a powerful reactive system that propagates all internal state changes of `ApiService` throughout the application.

## 4.1. Reactive Programming and RxJS

**Reactive Programming** is a programming paradigm that focuses on propagating data flows and changes. RxJS is a library for implementing reactive programming in a JavaScript environment, providing various tools to create, combine, filter, and react to data streams.

We will apply RxJS to `ApiService` to turn all API request lifecycle events into a single data stream.

## 4.2. Defining the State Data Type (`StoreData`)

First, we need to define a data type that can represent all possible states during an API request. We will use TypeScript's Union types to create a type called `StoreData`.

```typescript
// ApiService.ts -> Inside ApiService namespace

// ... (previous type definitions)

// Types of data to be delivered via Subject
export type StoreDataError = {
  type: 'error';
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
  pipe: PIPE;
  e: any;
};
export type StoreDataSuccess = {
  type: 'success';
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
  pipe: PIPE;
};
export type StoreDataProgress = {
  type: 'progress';
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
  pipe: PIPE;
};
export type StoreDataFinal = {
  type: 'final';
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>;
  pipe: PIPE;
};
// ... other pre/post fetch state types ...

// Union type combining all state types
export type StoreData =
  | StoreDataProgress
  | StoreDataSuccess
  | StoreDataError
  | StoreDataFinal
  // ...
```
Each state type clearly distinguishes the type of event via the `type` property, and includes `config` and `pipe` information at the time of the event, allowing external subscribers to utilize rich context.

## 4.3. Applying `Subject` and `Observable`

Now, we will create a `Subject` inside the `ApiService` class and expose it externally as an `Observable`.

-   **`Subject`**: A special type of `Observable` that can multicast events to multiple subscribers. Inside `ApiService`, state change events are emitted (`next()`) via the `Subject`.
-   **`Observable`**: Exposing a `Subject` directly to the outside is risky as `next()` could be called from anywhere. Therefore, it is safer to convert it into a read-only `Observable` using the `asObservable()` method before exposing it.

```typescript
// ApiService.ts
import { Subject } from 'rxjs';
// ...

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  // 1. Create a private Subject
  private subject = new Subject<ApiService.StoreData>();

  // ... (constructor)

  // 2. Expose as a public Observable
  get observable() {
    return this.subject.asObservable();
  }

  // ... (lifecycle hooks)
}
```

## 4.4. Emitting States from Lifecycle Hooks

Finally, we modify the code to emit data corresponding to each state via the `subject.next()` method within each lifecycle hook.

```typescript
// ApiService.ts -> Inside ApiService class

protected before(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // Emit 'progress' state
  this.subject.next({type: 'progress', config, pipe});
  // ... (existing logic)
}

protected afterSuccess(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // Emit 'success' state
  this.subject.next({type: 'success', config, pipe});
  // ... (existing logic)
}

protected error(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE,
  e?: any
) {
  // Emit 'error' state
  this.subject.next({type: 'error', config, pipe, e});
  // ... (existing logic)
}

protected finally(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // Emit 'final' state
  this.subject.next({type: 'final', config, pipe});
  // ... (existing logic)
}
```

## 4.5. Utilizing the Reactive `ApiService`

Now, `ApiService` has become a reactive service that notifies external parties of all request statuses in real-time. Other components or services can subscribe to `apiService.observable` to perform various operations.

```typescript
// Example usage in another service or component

@Sim
class GlobalLoadingIndicator {
  private activeApiCallCount = 0;

  constructor(private apiService: ApiService) {
    // Subscribe to ApiService's state changes
    this.apiService.observable.subscribe(storeData => {
      if (isStoreProgress(storeData)) { // Using type guard function
        this.activeApiCallCount++;
        this.showLoading();
      } else if (isStoreFinal(storeData)) {
        this.activeApiCallCount--;
        if (this.activeApiCallCount === 0) {
          this.hideLoading();
        }
      }
    });
  }

  showLoading() { /* ... */ }
  hideLoading() { /* ... */ }
}
```
The example above implements a feature that subscribes to the `ApiService` state stream to display a global loading indicator if at least one API request is in progress, and hides it when all requests are finished.

In the next chapter, we will implement the last core feature of `ApiService`, interceptors, to elegantly handle cross-cutting concerns such as adding authentication headers.
