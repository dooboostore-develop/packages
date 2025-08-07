# 제3장: 데이터 하이드레이션 - SaveAroundAfter와 LoadAroundBefore

데이터 하이드레이션(Data Hydration)은 서버사이드 렌더링(SSR)의 핵심 개념 중 하나입니다. 서버에서 렌더링된 HTML과 함께 사용된 데이터를 클라이언트로 전달하여, 클라이언트 측 JavaScript가 페이지를 다시 렌더링하지 않고도 UI를 활성화할 수 있도록 하는 기술입니다. `Simple-Boot-HTTP-SSR`은 `SaveAroundAfter`와 `LoadAroundBefore` 데코레이터를 통해 이 과정을 자동화합니다. 이 장에서는 이 두 데코레이터의 상세 구현과 사용법을 알아봅니다.

## 3.1. 서버 측 데이터 저장 (`SaveAroundAfter`)

`SaveAroundAfter` 데코레이터는 서버에서 실행되는 메소드의 반환 값을 `window.server_side_data` 객체에 저장하는 역할을 합니다. 이 데이터는 최종적으로 클라이언트로 전송되는 HTML에 포함됩니다.

### 구현 원리

`SaveAroundAfter`는 `@dooboostore/simple-boot`의 `@Around` 데코레이터와 유사하게 동작합니다. 메소드 디스크립터(`descriptor.value`)를 직접 수정하여 원본 메소드를 래핑합니다. 래핑된 메소드는 원본 메소드가 실행된 후, 그 반환 값을 가로채어 `window.server_side_data`에 저장합니다.

-   **키 생성:** 데이터를 저장할 때 사용할 키는 해당 메소드가 속한 `@Sim` 클래스의 `scheme`과 메소드 이름을 조합하여 생성됩니다. (예: `UserService_getUserById`)
-   **`window.server_side_data`:** 이 객체는 JSDOM 환경의 `window` 객체에 존재하며, 서버에서 렌더링된 모든 데이터를 임시로 저장하는 컨테이너 역할을 합니다.
-   **비동기 처리:** 메소드의 반환 값이 `Promise`인 경우, `Promise`가 resolve된 후에 데이터를 저장하도록 처리하여 비동기 데이터도 올바르게 하이드레이션될 수 있도록 합니다.

```typescript
// decorators/SaveAroundAfter.ts (개념적)
import { getSim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export const SaveAroundAfter = (obj: any, propertyKey: string, args: any[], beforeReturn: any) => {
    const simOption = obj._SimpleBoot_simOption; // SimpleBootFront의 SimFrontOption 접근
    const config = getSim(obj); // @Sim 데코레이터의 설정 가져오기

    if (simOption && config?.scheme && simOption.window) {
        if (!simOption.window.server_side_data) {
            simOption.window.server_side_data = {}; // server_side_data 객체 초기화
        }
        const key = config.scheme + '_' + propertyKey; // 저장할 키 생성

        if (beforeReturn instanceof Promise) {
            // Promise인 경우, resolve된 후에 데이터 저장
            beforeReturn.then((resolvedData) => {
                simOption.window.server_side_data[key] = JSON.stringify(resolvedData); // JSON 문자열로 저장
                return resolvedData;
            });
        } else {
            // Promise가 아닌 경우 즉시 데이터 저장
            simOption.window.server_side_data[key] = JSON.stringify(beforeReturn); // JSON 문자열로 저장
        }
    }
    return beforeReturn; // 원본 반환 값 그대로 반환
};
```

## 3.2. 클라이언트 측 데이터 로드 (`LoadAroundBefore`)

`LoadAroundBefore` 데코레이터는 클라이언트에서 실행되는 메소드가 서버에서 이미 가져온 데이터를 재사용할 수 있도록 돕습니다. 이 데코레이터가 적용된 메소드가 호출되기 전에 `window.server_side_data`에서 해당 데이터를 찾아 반환합니다.

### 구현 원리

`LoadAroundBefore`는 `SaveAroundAfter`와 마찬가지로 메소드 디스크립터를 수정하여 원본 메소드를 래핑합니다. 래핑된 메소드는 원본 메소드가 실행되기 전에 `window.server_side_data`를 확인합니다.

-   **데이터 조회:** `SaveAroundAfter`가 저장한 키와 동일한 키로 `window.server_side_data`에서 데이터를 조회합니다.
-   **실행 건너뛰기:** 데이터가 존재하면, 원본 메소드의 실행을 건너뛰고 `window.server_side_data`에 저장된 데이터를 반환합니다. 이때 `AroundForceReturn`을 사용하여 메소드 실행을 강제로 중단하고 값을 반환합니다.
-   **비동기 처리:** 저장된 데이터가 `Promise`의 결과였다면, `Promise.resolve()`로 감싸서 반환하여 비동기 컨텍스트를 유지합니다.

```typescript
// decorators/LoadAroundBefore.ts (개념적)
import { AroundForceReturn } from '@dooboostore/simple-boot/decorators/aop/AOPDecorator';
import { getSim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export const LoadAroundBefore = (obj: any, propertyKey: string, args: any[]) => {
    const simOption = obj._SimpleBoot_simOption; // SimpleBootFront의 SimFrontOption 접근
    const config = getSim(obj); // @Sim 데코레이터의 설정 가져오기

    if (simOption && config?.scheme && simOption.window) {
        const key = config.scheme + '_' + propertyKey; // 저장된 키와 동일한 키 생성
        const isHas = (key in (simOption.window.server_side_data ?? {})); // 데이터 존재 여부 확인

        if (isHas) {
            const data = simOption.window.server_side_data?.[key];
            delete simOption.window.server_side_data?.[key]; // 사용된 데이터는 삭제

            let rdata;
            // 저장된 데이터가 Promise의 결과였다면 Promise.resolve로 감싸서 반환
            try {
                rdata = JSON.parse(data); // JSON 문자열을 객체로 역직렬화
            } catch (e) {
                rdata = data; // 파싱 실패 시 원본 문자열 반환
            }

            // 원본 메소드 실행을 건너뛰고 데이터 반환
            throw new AroundForceReturn(rdata instanceof Promise ? rdata : Promise.resolve(rdata));
        }
    }
    return args; // 데이터가 없으면 원본 메소드 인자 그대로 반환 (원본 메소드 실행)
};
```

## 3.3. 데이터 직렬화 및 역직렬화

서버에서 클라이언트로 데이터를 전달할 때는 네트워크를 통해 전송 가능한 형태로 변환해야 합니다. 이는 주로 **직렬화(Serialization)** 과정을 통해 이루어집니다. `Simple-Boot-HTTP-SSR`에서는 `JSON.stringify()`를 사용하여 데이터를 JSON 문자열로 직렬화하고, 클라이언트에서는 `JSON.parse()`를 사용하여 역직렬화합니다.

-   **서버 측 (`SaveAroundAfter`):** 메소드의 반환 값을 `JSON.stringify()`를 통해 JSON 문자열로 변환하여 `window.server_side_data`에 저장합니다.
-   **클라이언트 측 (`LoadAroundBefore`):** `window.server_side_data`에서 가져온 JSON 문자열을 `JSON.parse()`를 통해 원래의 JavaScript 객체로 복원합니다.

### 예제: 데이터 하이드레이션 데코레이터 사용

```typescript
// server.ts (서버 측 코드)
import 'reflect-metadata';
import { SimpleBootHttpSSRServer, HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { SaveAroundAfter } from '@dooboostore/simple-boot-http-server-ssr/decorators/SaveAroundAfter';

// 1. 서버 측 데이터 서비스
@Sim({ scheme: 'data-service' }) // scheme 설정 (하이드레이션 키 생성에 사용)
class ServerDataService {
    @SaveAroundAfter // 이 메소드의 반환 값을 window.server_side_data에 저장
    async fetchUserData(userId: number) {
        console.log(`[Server] Fetching user data for ID: ${userId} from DB...`);
        // 실제 데이터베이스 조회 또는 외부 API 호출
        await new Promise(resolve => setTimeout(resolve, 100)); // 비동기 작업 모의
        return { id: userId, name: `Server User ${userId}`, email: `user${userId}@example.com` };
    }

    @SaveAroundAfter
    async fetchProductList() {
        console.log(`[Server] Fetching product list...`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return [{ id: 1, name: 'Laptop' }, { id: 2, name: 'Mouse' }];
    }
}

// 2. 서버 측 라우터
@Sim
@Router({ path: '' })
class ServerAppRouter {
    constructor(private serverDataService: ServerDataService) {}

    @Route({ path: '/user/{id}' })
    @GET({ res: { contentType: Mimes.TextHtml } }) // HTML 응답
    async userPage(rr: RequestResponse, routerModule: RouterModule) {
        const userId = parseInt(routerModule.pathData?.id || '0');
        // 서버에서 데이터를 미리 가져와서 프론트엔드 컴포넌트가 사용할 수 있도록 함
        await this.serverDataService.fetchUserData(userId); // SaveAroundAfter에 의해 데이터 저장
        await this.serverDataService.fetchProductList(); // SaveAroundAfter에 의해 데이터 저장
        // 실제로는 여기서 프론트엔드 앱을 렌더링하는 로직이 호출됨 (SSRFilter가 담당)
        return 'HTML will be rendered by SSRFilter';
    }
}

const httpServerOption = new HttpSSRServerOption({
    listen: { port: 3000 },
    rootRouter: ServerAppRouter,
    // ... SSRFilter 설정 (이전 장 참조) ...
});

const app = new SimpleBootHttpSSRServer(httpServerOption);
app.run();

console.log('SSR Server with Data Hydration example started.');
```

**`templates/user-profile.component.html`**
```html
<!-- templates/user-profile.component.html -->
<h1>User Profile</h1>
<p>ID: ${this.user?.id}$</p>
<p>Name: ${this.user?.name}$</p>
<p>Email: ${this.user?.email}$</p>
<h2>Products</h2>
<ul>
  <li dr-for-of="this.products">${#it.name}$</li>
</ul>
```

```typescript
// client.ts (클라이언트 측 코드 - 브라우저에서 실행)
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { LoadAroundBefore } from '@dooboostore/simple-boot-http-server-ssr/decorators/LoadAroundBefore';
import template from './templates/user-profile.component.html'

// 1. 클라이언트 측 데이터 서비스 (서버 측과 동일한 scheme과 메소드명 사용)
@Sim({ scheme: 'data-service' })
class ClientDataService {
    @LoadAroundBefore // 이 메소드 호출 전 window.server_side_data에서 데이터 로드 시도
    async fetchUserData(userId: number) {
        console.log(`[Client] Fetching user data for ID: ${userId} from API...`);
        // 서버에서 데이터가 없으면 실제 API 호출
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    }

    @LoadAroundBefore
    async fetchProductList() {
        console.log(`[Client] Fetching product list from API...`);
        const response = await fetch(`/api/products`);
        return response.json();
    }
}

// 2. 클라이언트 측 컴포넌트
@Sim
@Component({
  template
})
class UserProfileComponent {
  user: any;
  products: any[] = [];

  constructor(private clientDataService: ClientDataService) {}

  async onInit() {
    // 클라이언트에서 컴포넌트 초기화 시 데이터 로드
    // LoadAroundBefore에 의해 서버에서 이미 가져온 데이터가 있으면 API 호출 없이 즉시 반환
    const userId = parseInt(window.location.pathname.split('/').pop() || '0');
    this.user = await this.clientDataService.fetchUserData(userId);
    this.products = await this.clientDataService.fetchProductList();
    console.log('[Client] User data loaded:', this.user);
    console.log('[Client] Product data loaded:', this.products);
  }
}

// 3. 클라이언트 측 라우터
@Sim
@Router({ path: '' })
@Component({
  template: `<router dr-this="this.child"></router>`
})
class ClientAppRouter {
  child?: any;
  async canActivate(url: any, module: any) {
    this.child = module;
  }

  @Route({ path: '/user/{id}', target: UserProfileComponent })
  userRoute() {}
}

const config = new SimFrontOption(window)
  .setRootRouter(ClientAppRouter)
  .setUrlType(UrlType.path) // 서버와 동일한 URL 타입 사용
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Client-side application started.');

/*
실행 방법:
1. server.ts 실행 (Node.js)
2. client.ts를 웹팩 등으로 번들링하여 HTML에 포함
3. 브라우저에서 http://localhost:3000/user/123 접속

예상 출력 (서버 콘솔):
[Server] Fetching user data for ID: 123 from DB...
[Server] Fetching product list...

예상 출력 (클라이언트 콘솔):
[Client] User data loaded: { id: 123, name: 'Server User 123', ... }
[Client] Product data loaded: [...] (API 호출 없이 서버에서 받은 데이터 사용)
*/
```

이 장에서는 데이터 하이드레이션의 핵심인 `SaveAroundAfter`와 `LoadAroundBefore` 데코레이터의 구현 원리와 사용법을 알아보았습니다. 이를 통해 서버에서 렌더링된 데이터를 클라이언트에서 효율적으로 재활용하여 초기 로딩 성능을 최적화할 수 있습니다.

다음 장에서는 `Simple-Boot-HTTP-SSR`이 `Simple-Boot Core` 및 `Simple-Boot-Front`와 어떻게 연동되어 SSR 환경에 최적화된 통합을 이루는지 알아보겠습니다.
