# 제4장: RxJS를 이용한 반응형 상태 관리

`ApiService`는 이제 개별 요청에 대한 콜백과 설정을 처리할 수 있게 되었습니다. 하지만 여러 컴포넌트에서 API 요청 상태(예: 현재 활성 요청 수)를 공유하고 싶거나, API 요청의 흐름을 데이터 스트림으로 다루고 싶다면 어떻게 해야 할까요?

이번 장에서는 RxJS의 `Subject`와 `Observable`을 도입하여, `ApiService`의 모든 내부 상태 변화를 애플리케이션 전체에 전파하는 강력한 반응형 시스템을 구축합니다.

## 4.1. 반응형 프로그래밍과 RxJS

**반응형 프로그래밍(Reactive Programming)**은 데이터의 흐름과 변경 사항을 전파하는 데 중점을 둔 프로그래밍 패러다임입니다. RxJS는 JavaScript 환경에서 반응형 프로그래밍을 구현하기 위한 라이브러리로, 데이터 스트림을 생성, 조합, 필터링하고 이에 반응할 수 있는 다양한 도구를 제공합니다.

우리는 `ApiService`에 RxJS를 적용하여, 모든 API 요청의 생명주기 이벤트를 하나의 데이터 스트림으로 만들 것입니다.

## 4.2. 상태 데이터 타입(`StoreData`) 정의

먼저, API 요청 과정에서 발생할 수 있는 모든 상태를 표현할 수 있는 데이터 타입을 정의해야 합니다. TypeScript의 유니언(Union) 타입을 사용하여 `StoreData`라는 타입을 만듭니다.

```typescript
// ApiService.ts -> ApiService 네임스페이스 내부

// ... (이전 타입 정의)

// Subject를 통해 전달될 데이터의 타입들
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
// ... 기타 fetch 전/후 상태 타입들 ...

// 모든 상태 타입을 하나로 묶은 유니언 타입
export type StoreData =
  | StoreDataProgress
  | StoreDataSuccess
  | StoreDataError
  | StoreDataFinal
  // ...
```
각 상태 타입은 `type` 속성을 통해 어떤 종류의 이벤트인지 명확히 구분하며, 이벤트 발생 시점의 `config`와 `pipe` 정보를 함께 담고 있어 외부 구독자가 풍부한 컨텍스트를 활용할 수 있게 합니다.

## 4.3. `Subject`와 `Observable` 적용

이제 `ApiService` 클래스 내부에 `Subject`를 생성하고, 이를 외부에 `Observable`로 노출시킵니다.

-   **`Subject`**: 여러 구독자에게 이벤트를 멀티캐스트(multicast)할 수 있는 특별한 종류의 `Observable`입니다. `ApiService` 내부에서는 `Subject`를 통해 상태 변경 이벤트를 발행(`next()`)합니다.
-   **`Observable`**: `Subject`를 외부에 직접 노출하면 어디서든 `next()`를 호출할 수 있어 위험하므로, `asObservable()` 메소드를 통해 읽기 전용(read-only)인 `Observable`로 변환하여 노출하는 것이 안전합니다.

```typescript
// ApiService.ts
import { Subject } from 'rxjs';
// ...

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  // 1. private Subject 생성
  private subject = new Subject<ApiService.StoreData>();

  // ... (constructor)

  // 2. 외부에 public Observable로 노출
  get observable() {
    return this.subject.asObservable();
  }

  // ... (생명주기 훅들)
}
```

## 4.4. 생명주기 훅에서 상태 발행하기

마지막으로, 각 생명주기 훅에서 해당 상태에 맞는 데이터를 `subject.next()` 메소드를 통해 발행하도록 코드를 수정합니다.

```typescript
// ApiService.ts -> ApiService 클래스 내부

protected before(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // 'progress' 상태 발행
  this.subject.next({type: 'progress', config, pipe});
  // ... (기존 로직)
}

protected afterSuccess(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // 'success' 상태 발행
  this.subject.next({type: 'success', config, pipe});
  // ... (기존 로직)
}

protected error(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE,
  e?: any
) {
  // 'error' 상태 발행
  this.subject.next({type: 'error', config, pipe, e});
  // ... (기존 로직)
}

protected finally(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // 'final' 상태 발행
  this.subject.next({type: 'final', config, pipe});
  // ... (기존 로직)
}
```

## 4.5. 반응형 `ApiService` 활용하기

이제 `ApiService`는 모든 요청의 상태를 외부에 실시간으로 알리는 반응형 서비스가 되었습니다. 다른 컴포넌트나 서비스에서는 `apiService.observable`을 구독하여 다양한 처리를 할 수 있습니다.

```typescript
// 다른 서비스 또는 컴포넌트에서 사용 예시

@Sim
class GlobalLoadingIndicator {
  private activeApiCallCount = 0;

  constructor(private apiService: ApiService) {
    // ApiService의 상태 변화를 구독
    this.apiService.observable.subscribe(storeData => {
      if (isStoreProgress(storeData)) { // 타입 가드 함수 사용
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
위 예시는 `ApiService`의 상태 스트림을 구독하여, 현재 진행 중인 API 요청이 하나라도 있으면 글로벌 로딩 인디케이터를 표시하고, 모든 요청이 끝나면 숨기는 기능을 구현한 것입니다.

다음 장에서는 `ApiService`의 마지막 핵심 기능인 인터셉터를 구현하여, 인증 헤더 추가와 같은 횡단 관심사를 우아하게 처리하는 방법을 알아보겠습니다.