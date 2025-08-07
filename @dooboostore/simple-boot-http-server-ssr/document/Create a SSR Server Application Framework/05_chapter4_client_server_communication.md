# 제4장: 클라이언트-서버 통신 - IntentSchemeFilter

서버사이드 렌더링(SSR) 환경에서는 초기 페이지 로딩 이후 클라이언트와 서버 간의 동적인 통신이 필요합니다. `Simple-Boot-HTTP-SSR`은 `IntentSchemeFilter`를 통해 `simple-boot-core`의 Intent 기반 통신 메커니즘을 HTTP 요청/응답으로 확장하여 클라이언트-서버 간의 유연한 통신을 가능하게 합니다. 이 장에서는 `IntentSchemeFilter`의 역할과 구현, 그리고 클라이언트 측에서 Intent를 발행하고 서버 측에서 이를 처리하는 방법을 알아봅니다.

## 4.1. Intent 기반 통신 프로토콜

`Simple-Boot-HTTP-SSR`은 클라이언트와 서버 간의 통신을 위해 커스텀 HTTP 헤더와 `simple-boot-core`의 `Intent` 객체를 활용하는 프로토콜을 정의합니다.

-   **`Accept: application/json-post+simple-boot-ssr-intent-scheme`:** 클라이언트가 Intent 기반 통신을 요청할 때 사용하는 `Accept` 헤더입니다. `IntentSchemeFilter`는 이 헤더를 통해 Intent 통신 요청을 식별합니다.
-   **`X-Simple-Boot-Ssr-Intent-Scheme`:** 클라이언트가 발행하는 Intent의 `scheme` (예: `user-service`)을 전달하는 커스텀 HTTP 헤더입니다. 이 헤더는 서버 측에서 Intent를 라우팅하는 데 사용됩니다.
-   **요청 바디:** Intent에 포함될 데이터(`Intent.data`)는 요청 바디(JSON 또는 `multipart/form-data`)를 통해 전송됩니다.

## 4.2. IntentSchemeFilter의 역할과 구현

`IntentSchemeFilter`는 `simple-boot-http-server`의 `Filter` 인터페이스를 구현하며, 위에서 정의한 Intent 기반 통신 프로토콜을 처리하는 핵심 구성 요소입니다.

### 구현 원리

`IntentSchemeFilter`의 `proceedBefore` 메소드는 다음과 같은 단계로 Intent 통신 요청을 처리합니다.

1.  **요청 식별:** 요청의 `Accept` 헤더가 `application/json-post+simple-boot-ssr-intent-scheme`이고, `X-Simple-Boot-Ssr-Intent-Scheme` 헤더가 존재하는지 확인합니다.
2.  **Intent 객체 생성:** 요청 URL과 `X-Simple-Boot-Ssr-Intent-Scheme` 헤더의 값을 기반으로 `simple-boot-core`의 `Intent` 객체를 생성합니다. 요청 바디가 있다면 이를 `Intent.data`에 파싱하여 포함합니다.
3.  **Intent 발행:** 생성된 `Intent` 객체를 `simple-boot-core`의 `IntentManager`를 통해 발행합니다. 이 과정에서 서버 측의 `@Sim` 모듈에 정의된 Intent 구독 메소드(예: `UserService`의 `updateUser` 메소드)가 호출됩니다.
4.  **응답 전송:** Intent 발행 결과(메소드의 반환 값)를 클라이언트에 JSON 형태로 응답합니다. 이 필터가 응답을 완료하므로, 요청 처리 체인은 여기서 중단됩니다.

```typescript
// filters/IntentSchemeFilter.ts (개념적)
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';
import { HttpHeaders } from '../codes/HttpHeaders';
import { Mimes } from '../codes/Mimes';
import { Intent, PublishType } from '@dooboostore/simple-boot/intent/Intent';
import { IntentManager } from '@dooboostore/simple-boot/intent/IntentManager';

export class IntentSchemeFilter implements Filter {
  constructor(private intentManager: IntentManager) {}

  async onInit(app: SimpleBootHttpServer) {}

  async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
    const acceptType = rr.reqHeader(HttpHeaders.Accept);
    const intentScheme = rr.reqHeader(HttpHeaders.XSimpleBootSsrIntentScheme);

    // 1. Intent 통신 요청 식별
    if (acceptType === Mimes.ApplicationJsonPostSimpleBootSsrIntentScheme && intentScheme) {
      const url = rr.reqUrl;
      const contentType = rr.reqHeader(HttpHeaders.ContentType);
      let intent = new Intent(`${intentScheme}:/${url}`); // Intent 객체 생성
      intent.publishType = PublishType.INLINE_DATA_PARAMETERS; // 인라인 데이터 파라미터로 설정

      // 2. 요청 바디 파싱하여 Intent.data에 포함
      if (rr.reqMethod() === 'POST' && rr.reqBodyData()) {
        if (contentType.includes(Mimes.ApplicationJson)) {
          intent.data = [await rr.reqBodyJsonData(), rr];
        } else if (contentType.includes(Mimes.MultipartFormData)) {
          intent.data = [await rr.reqBodyMultipartFormDataObject(), rr];
        }
      } else {
        intent.data = [rr.reqUrlSearchParamsObj, rr]; // GET 요청의 경우 쿼리 파라미터 사용
      }

      // 3. Intent 발행 및 결과 반환
      const results = this.intentManager.publish(intent);
      const result = results[0]; // 첫 번째 결과만 사용
      const responseData = result instanceof Promise ? await result : result;

      rr.resStatusCode(HttpStatus.Ok);
      rr.resSetHeader(HttpHeaders.ContentType, Mimes.ApplicationJson);
      await rr.resEnd(responseData ? JSON.stringify(responseData) : undefined);

      return false; // 요청 처리 완료, 체인 중단
    }
    return true; // Intent 통신 요청이 아니면 다음 필터로 진행
  }

  async proceedAfter({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) { return true; }
}
```

## 4.3. 클라이언트 측 Intent 발행과 서버 측 처리

클라이언트 측에서는 `fetch` API를 사용하여 `IntentSchemeFilter`가 인식할 수 있는 형태로 HTTP 요청을 구성하여 Intent를 발행합니다. 서버 측에서는 `simple-boot-core`의 Intent 구독 메커니즘을 통해 이를 처리합니다.

### 클라이언트 측 (`IntentSchemeFrontProxy`)

`Simple-Boot-HTTP-SSR`은 클라이언트 측에서 서버의 서비스 메소드를 마치 로컬 메소드처럼 호출할 수 있도록 `IntentSchemeFrontProxy`를 제공합니다. 이 프록시는 클라이언트 측 서비스 메소드 호출을 가로채어 Intent 기반 HTTP 요청으로 변환합니다.

-   **`IntentSchemeFrontProxy`:** 클라이언트 측 서비스 클래스에 적용되는 `ProxyHandler`입니다. 서비스 메소드 호출을 가로채어 `fetch` API를 사용하여 서버로 HTTP 요청을 보냅니다.
-   **`Accept` 및 `X-Simple-Boot-Ssr-Intent-Scheme` 헤더:** 이 프록시는 요청에 필요한 커스텀 헤더들을 자동으로 추가합니다.

### 서버 측 (`IntentManager` 및 `@Sim` 모듈)

서버 측에서는 `IntentManager`가 `IntentSchemeFilter`로부터 전달받은 `Intent`를 처리합니다. `Intent`의 `scheme`과 `path`에 매핑된 `@Sim` 모듈의 메소드가 호출됩니다.

### 예제: 클라이언트-서버 Intent 통신

먼저, 클라이언트 측 컴포넌트의 템플릿을 별도 파일로 정의합니다.

**`./intent-client-example.component.html`**
```html
<h1>Client-Server Intent Communication</h1>
<button dr-event-click="@this@.fetchUser()">Fetch User 101</button>
<button dr-event-click="@this@.createNewUser()">Create New User</button>
<p>User Data: ${@this@.userData ? JSON.stringify(@this@.userData) : 'N/A'}$</p>
<p>New User Result: ${@this@.newUserResult ? JSON.stringify(@this@.newUserResult) : 'N/A'}$</p>
```

이제 이 템플릿을 사용하여 전체 예제 코드를 작성합니다.

```typescript
// server.ts (서버 측 코드)
import 'reflect-metadata';
import { SimpleBootHttpSSRServer, HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { IntentSchemeFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/IntentSchemeFilter';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';

// 1. 서버 측 서비스 (클라이언트에서 Intent로 호출될 대상)
@Sim({ scheme: 'user-api' }) // 클라이언트에서 사용할 scheme
class UserApiService {
    // 클라이언트에서 user-api://getUser/123 형태로 호출될 메소드
    getUser(intent: Intent) {
        const userId = intent.getPathnameData('getUser/{id}')?.id;
        console.log(`[Server] Intent: getUser called for ID: ${userId}`);
        // 실제 DB 조회 로직
        return { id: userId, name: `User ${userId}`, status: 'active' };
    }

    // 클라이언트에서 user-api://createUser 형태로 호출될 메소드 (POST 요청)
    createUser(userData: { name: string; email: string }, rr: RequestResponse) {
        console.log(`[Server] Intent: createUser called with data:`, userData);
        // 실제 DB 저장 로직
        return { success: true, newId: Math.floor(Math.random() * 1000), receivedData: userData };
    }
}

// 2. 서버 측 라우터 (SSRFilter가 HTML 요청을 처리하고, IntentSchemeFilter가 Intent 요청을 처리)
@Sim
@Router({ path: '' })
class ServerAppRouter {
    @Route({ path: '/' })
    @GET({ res: { contentType: Mimes.TextHtml } })
    indexPage() {
        return 'HTML will be rendered by SSRFilter'; // SSRFilter가 이 요청을 가로채어 HTML 렌더링
    }
}

const httpServerOption = new HttpSSRServerOption({
    listen: { port: 3000 },
    rootRouter: ServerAppRouter,
    filters: [IntentSchemeFilter], // IntentSchemeFilter 등록
    // ... SSRFilter 설정 (이전 장 참조) ...
});

const app = new SimpleBootHttpSSRServer(httpServerOption);
app.run();

console.log('SSR Server with IntentSchemeFilter example started.');

// client.ts (클라이언트 측 코드 - 브라우저에서 실행)
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { IntentSchemeFrontProxy } from '@dooboostore/simple-boot-http-server-ssr/proxy/IntentSchemeFrontProxy';
import { HttpHeaders as SSRHttpHeaders } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';
import { Mimes as SSRMimes } from '@dooboostore/simple-boot-http-server-ssr/codes/Mimes';

// 템플릿 파일 임포트
import template from './intent-client-example.component.html';

// 1. 클라이언트 측 서비스 (서버 측 UserApiService와 매핑)
@Sim({ scheme: 'user-api' }) // 서버 측 서비스의 scheme과 동일하게 설정
class ClientUserApiService {
    // 이 메소드 호출은 IntentSchemeFrontProxy에 의해 서버로 HTTP 요청으로 변환됨
    getUser(userId: number): Promise<any> { return Promise.resolve(); }
    createUser(userData: { name: string; email: string }): Promise<any> { return Promise.resolve(); }
}

// 2. 클라이언트 측 컴포넌트
@Sim
@Component({ template })
class AppRootComponent {
  userData: any;
  newUserResult: any;

  // IntentSchemeFrontProxy를 적용하여 서버 측 서비스와 통신
  constructor(private userApiService: ClientUserApiService) {
    // Simple-Boot Core의 Proxy 기능을 사용하여 IntentSchemeFrontProxy 적용
    // 실제 SimpleBootFront에서는 SimstanceManager가 자동으로 처리
    this.userApiService = new Proxy(this.userApiService, new IntentSchemeFrontProxy());
  }

  async fetchUser() {
    console.log('[Client] Calling userApiService.getUser(101)...');
    this.userData = await this.userApiService.getUser(101); // 서버로 Intent 요청
    console.log('[Client] Received user data:', this.userData);
  }

  async createNewUser() {
    console.log('[Client] Calling userApiService.createUser()...');
    this.newUserResult = await this.userApiService.createUser({ name: 'Jane Doe', email: 'jane@example.com' }); // 서버로 Intent 요청
    console.log('[Client] Received new user result:', this.newUserResult);
  }
}

const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Client-side application started.');

/*
실행 방법:
1. server.ts 실행 (Node.js)
2. client.ts를 웹팩 등으로 번들링하여 HTML에 포함
3. 브라우저에서 http://localhost:3000/ 접속 후 버튼 클릭

예상 출력 (서버 콘솔):
[Server] Intent: getUser called for ID: 101
[Server] Intent: createUser called with data: { name: 'Jane Doe', email: 'jane@example.com' }

예상 출력 (클라이언트 콘솔):
[Client] Calling userApiService.getUser(101)...
[Client] Received user data: { id: '101', name: 'User 101', status: 'active' }
[Client] Calling userApiService.createUser()...
[Client] Received new user result: { success: true, newId: ..., receivedData: { name: 'Jane Doe', email: 'jane@example.com' } }
*/
```

이 장에서는 `IntentSchemeFilter`를 통해 `Simple-Boot-HTTP-SSR` 환경에서 클라이언트와 서버가 Intent 기반으로 통신하는 방법을 알아보았습니다. 이는 SPA의 동적인 데이터 교환 요구사항을 충족시키면서도, `simple-boot-core`의 강력한 Intent 시스템을 활용하여 유연하고 확장 가능한 통신 아키텍처를 구축할 수 있게 합니다.

다음 장에서는 `Simple-Boot-HTTP-SSR`이 `Simple-Boot Core` 및 `Simple-Boot-Front`와 어떻게 연동되어 SSR 환경에 최적화된 통합을 이루는지 알아보겠습니다.
