# 부록: 더 나아가기

지금까지 우리는 강력하고 유연한 `ApiService`를 구현했습니다. 하지만 실제 프로덕션 환경에서는 더 복잡한 요구사항들이 존재합니다. 이 부록에서는 `ApiService`를 더욱 발전시킬 수 있는 몇 가지 심화 주제에 대해 간략히 소개합니다.

## A.1. 캐싱(Caching) 전략

동일한 GET 요청이 짧은 시간 내에 반복적으로 발생하는 경우, 실제 네트워크 요청을 보내는 대신 이전에 받아온 응답을 재사용하면 성능을 크게 향상시키고 서버 부하를 줄일 수 있습니다.

### HTTP 계층에서의 캐싱: `CacheInterceptor`

-   **구현 아이디어**: 새로운 인터셉터를 만들어 `beforeProxyFetch` 훅을 사용합니다.
-   **캐시 키(Cache Key) 생성**: 요청 URL과 파라미터를 조합하여 고유한 캐시 키를 만듭니다.
-   **캐시 확인**: `beforeProxyFetch`에서 요청에 해당하는 캐시가 있는지 확인합니다.
    -   **캐시 존재 시**: 실제 `fetch`를 호출하는 대신, 캐시된 `Response` 객체를 복제(`clone()`)하여 즉시 반환합니다. 이를 통해 네트워크 요청을 완전히 건너뛸 수 있습니다.
    -   **캐시 부재 시**: 실제 `fetch` 요청을 그대로 진행시킵니다.
-   **캐시 저장**: `afterProxyFetch` 훅에서 성공적인 GET 요청의 응답을 캐시에 저장합니다. 이때 `Response` 객체는 한 번만 읽을 수 있으므로 `clone()`하여 저장해야 합니다.
-   **캐시 저장소**: 간단하게는 `Map` 객체를 사용한 인메모리(in-memory) 캐시부터, `sessionStorage`나 `localStorage`를 활용하여 브라우저 세션이나 영구적인 캐싱을 구현할 수도 있습니다.

### 서비스 계층에서의 캐싱: `@Cache` 데코레이터 활용

`CacheInterceptor`가 HTTP 요청/응답 레벨에서 동작한다면, `simple-boot` 프레임워크가 제공하는 `@Cache` 데코레이터를 사용하면 서비스 계층의 메소드 레벨에서 캐싱을 손쉽게 구현할 수 있습니다. 이는 `ApiService`를 호출하는 서비스 메소드 자체에 캐싱을 적용하는 방식입니다.

- **동작 방식**: `@Cache` 데코레이터가 적용된 메소드는 첫 호출 시 실행 결과를 캐시합니다. 이후 동일한 인자로 다시 호출되면, 실제 메소드 로직(API 호출 포함)을 실행하지 않고 캐시된 결과를 즉시 반환합니다.
- **장점**: 구현이 매우 간단하며, API 응답 데이터뿐만 아니라 가공된 최종 결과물까지 캐싱할 수 있어 더욱 효과적일 수 있습니다.
- **사용법**: 캐싱을 원하는 서비스 메소드 위에 `@Cache` 데코레이터를 추가하기만 하면 됩니다. 동적인 캐시 키 생성, 만료 시간(TTL) 설정 등 다양한 옵션을 제공합니다.

```typescript
// PostService.ts 예시

import { Cache } from '@dooboostore/simple-boot';

@Sim
export class PostService {
    constructor(private apiService: ApiService) {}

    // TTL 5분짜리 캐시 적용
    @Cache({ ms: 300000 })
    getPosts() {
        console.log('Fetching posts from server...'); // 이 로그는 5분 내 재호출 시 나타나지 않음
        return this.apiService.get<Post[]>('/posts', {
            config: { title: '게시글 목록 조회' }
        });
    }

    // 사용자 ID를 기반으로 동적 캐시 키 생성
    @Cache({ key: (id: number) => `post:${id}`, ms: 60000 })
    getPost(id: number) {
        console.log(`Fetching post ${id} from server...`);
        return this.apiService.get<Post>(`/posts/${id}`, {
            config: { title: `게시글 #${id} 조회` }
        });
    }
}
```
이 두 가지 방법(`CacheInterceptor`와 `@Cache` 데코레이터)은 상호 보완적이며, 애플리케이션의 특성과 요구사항에 맞게 적절한 전략을 선택하거나 조합하여 사용할 수 있습니다.

## A.2. 요청 취소(Request Cancellation)

`ApiService`는 `AbortController`를 사용하여 진행 중인 네트워크 요청을 취소하는 기능을 지원합니다. 사용자가 페이지를 떠나거나, 새로운 검색어를 입력하여 이전 요청이 더 이상 필요 없게 되었을 때, 요청을 취소하여 불필요한 리소스 낭비를 막을 수 있습니다.

### 구현 및 사용법

`ApiService`의 `get`, `post` 등 메소드를 호출할 때, `fetch` API의 표준 `RequestInit` 객체에 포함되는 `signal` 속성을 설정할 수 있습니다.

1.  **`AbortController` 생성**: 요청을 제어하려는 쪽에서 `AbortController`의 인스턴스를 생성합니다.
2.  **`signal` 전달**: `apiService` 메소드를 호출할 때, `config` 객체의 `signal` 속성으로 `controller.signal`을 전달합니다. `HttpJsonFetcher`는 이 `signal`을 내부 `fetch` 호출에 자동으로 전달합니다.
3.  **요청 취소**: 원하는 시점에 `controller.abort()` 메소드를 호출합니다.

`abort()`가 호출되면, `fetch` 요청은 중단되고 `AbortError`라는 이름의 `DOMException`이 발생합니다. `ApiService`의 `error` 훅에서 이 특정 에러를 감지하여, 사용자에게 별도의 오류 메시지를 보여주지 않고 조용히 무시하도록 처리하는 것이 일반적입니다.

### 예제 코드

```typescript
// 요청을 제어하는 컴포넌트 또는 서비스
class MyComponent {
    private controller = new AbortController();

    constructor(private apiService: ApiService) {}

    fetchData() {
        // 이전 요청이 있다면 취소
        this.controller.abort();
        // 새로운 AbortController 생성
        this.controller = new AbortController();

        this.apiService.get('/some/data', {
            signal: this.controller.signal, // signal 전달
            config: {
                title: '데이터 조회'
            }
        }).catch(error => {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error('Fetch error:', error);
            }
        });
    }

    cleanup() {
        // 컴포넌트가 파괴될 때 진행중인 요청 취소
        this.controller.abort();
    }
}
```

## A.3. 파일 및 바이너리 데이터 처리

`HttpJsonFetcher`는 이름에서 알 수 있듯 JSON 처리에 최적화되어 있지만, `FormData`나 `Blob` 같은 다른 데이터 타입도 유연하게 처리할 수 있는 메커니즘을 이미 갖추고 있습니다.

### 파일 업로드 (`FormData`)

`HttpJsonFetcher`는 요청 `body`가 `FormData`의 인스턴스인 경우, 이를 자동으로 감지하여 `JSON.stringify`를 적용하지 않고 그대로 `fetch`에 전달합니다. 따라서 파일 업로드는 매우 간단합니다.

-   `FormData` 객체를 생성하여 `File` 객체와 다른 데이터들을 추가합니다.
-   생성된 `FormData` 객체를 `post` 또는 `put` 메소드의 `body`로 전달하기만 하면 됩니다.
-   `Content-Type` 헤더를 직접 설정할 필요가 없습니다. 브라우저가 `FormData`를 보고 올바른 `multipart/form-data` 헤더와 `boundary`를 자동으로 추가해 줍니다.

```typescript
// FormData를 사용한 파일 업로드 예시
const formData = new FormData();
formData.append('profileImage', fileInput.files[0]);
formData.append('userName', 'John Doe');

apiService.post('/users/profile', {
    body: formData, // FormData를 그대로 전달
    config: {
        title: '프로필 이미지 업로드'
    }
});
```

### 파일 다운로드 및 바이너리 응답 처리

기본적으로 `HttpJsonFetcher`는 모든 응답을 JSON으로 파싱하려고 시도합니다. 이미지나 PDF 파일 같은 바이너리 데이터를 다운로드하려면 이 동작을 건너뛰어야 합니다. 이때 `bypassTransform` 설정을 사용합니다.

-   요청 `config`에 `bypassTransform: true`를 추가하면, `HttpJsonFetcher`는 JSON 파싱을 시도하지 않고 원시 `Response` 객체를 그대로 반환합니다.
-   반환된 `Response` 객체의 `.blob()`, `.arrayBuffer()`, `.text()` 등의 메소드를 직접 호출하여 원하는 형태로 데이터를 처리할 수 있습니다.

```typescript
// bypassTransform을 사용한 이미지 다운로드 예시
async function downloadImage() {
    const response = await apiService.get('/images/profile.png', {
        bypassTransform: true, // JSON 파싱 건너뛰기
        config: {
            title: '이미지 다운로드'
        }
    });

    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    // 이제 imageUrl을 <img> 태그의 src로 사용할 수 있습니다.
}
```

## A.4. 고급 에러 핸들링

인터셉터를 사용하면 전역적인 에러 처리 로직을 매우 효과적으로 구현할 수 있습니다.

### 구현 아이디어

-   **`ErrorInterceptor` 구현**: `afterProxyFetch` 훅을 사용하는 새로운 인터셉터를 만듭니다.
-   **응답 상태 코드 확인**: `response.status`를 확인하여 특정 에러 코드에 따라 분기합니다.
    -   **401 (Unauthorized)**: 인증 토큰이 만료되었을 가능성이 높습니다. 토큰 갱신 API를 호출하고, 성공하면 원래 실패했던 요청을 새로운 토큰으로 재시도하는 로직을 구현할 수 있습니다. 여러 요청이 동시에 401 에러를 받을 경우, 토큰 갱신은 한 번만 일어나도록 락(lock)을 거는 처리도 필요합니다.
    -   **403 (Forbidden)**: 권한 없음 알림을 띄우거나 특정 페이지로 리다이렉트합니다.
    -   **5xx (Server Error)**: "서버에 일시적인 문제가 발생했습니다"와 같은 공통 에러 메시지를 표시하고, 에러 리포팅 서비스(예: Sentry)에 로그를 전송할 수 있습니다.