# 제4장: 상태 관리와 프록시 시스템

복잡한 애플리케이션에서는 여러 컴포넌트와 서비스 간에 공유되는 상태(State)를 효율적으로 관리하는 것이 중요합니다. 또한, API 요청과 같은 특정 작업을 가로채어 공통 로직을 적용하는 프록시(Proxy) 시스템도 필요합니다. 이 장에서는 `app-system`의 상태 관리(`Store`) 기능과 API 요청을 가로채는 프록시 시스템에 대해 알아봅니다.

## 4.1. 애플리케이션 상태 관리 (Store)

`app-system`은 `rxjs` 라이브러리를 활용하여 반응형 상태 관리 기능을 제공합니다. `Store`는 애플리케이션의 상태를 중앙에서 관리하고, 상태 변화를 구독자들에게 발행(publish)하여 여러 컴포넌트나 서비스가 동일한 상태를 공유하고 반응할 수 있도록 합니다.

### 구현 원리

`app-system`의 `Store`는 `rxjs`의 `Subject` 또는 `ReplaySubject`를 기반으로 구현됩니다. 상태를 변경하는 메소드(`publish`)는 `Subject.next()`를 호출하여 새로운 상태 값을 발행하고, 상태 변화를 감지하려는 구독자들은 `observable`을 통해 `Subject.asObservable()`을 구독합니다.

```typescript
// store/Store.ts (개념적)
import { Subject, Observable } from 'rxjs';

export namespace Store {
  export class BaseStore<T> {
    protected subject = new Subject<T>();

    get observable(): Observable<T> {
      return this.subject.asObservable();
    }

    publish(data: T): void {
      this.subject.next(data);
    }
  }
}
```

### 예제: `Store`를 사용한 상태 관리

```typescript
import 'reflect-metadata';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Store } from '@dooboostore/app-system/store/Store';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';

// 1. 사용자 상태를 관리하는 스토어 서비스
@Sim
class UserStore extends Store.BaseStore<{ name: string; isLoggedIn: boolean }> {
  constructor() {
    super();
    // 초기 상태 발행
    this.publish({ name: 'Guest', isLoggedIn: false });
  }

  login(userName: string) {
    console.log(`[UserStore] User ${userName} logged in.`);
    this.publish({ name: userName, isLoggedIn: true });
  }

  logout() {
    console.log('[UserStore] User logged out.');
    this.publish({ name: 'Guest', isLoggedIn: false });
  }
}

// 2. 사용자 상태를 표시하는 컴포넌트
@Sim
@Component({
  template: `
    <h1>User Status</h1>
    <p>Welcome, ${this.userName}$!</p>
    <p>Status: ${this.isLoggedIn ? 'Logged In' : 'Logged Out'}$</p>
    <button dr-if="!this.isLoggedIn" dr-event-click="this.userStore.login('Alice')">Login</button>
    <button dr-if="this.isLoggedIn" dr-event-click="this.userStore.logout()">Logout</button>
  `,
  styles: [`
    button { margin-right: 10px; padding: 8px 15px; cursor: pointer; }
  `]
})
class UserStatusComponent {
  userName: string = 'Guest';
  isLoggedIn: boolean = false;

  constructor(public userStore: UserStore) {
    // UserStore의 상태 변화를 구독
    this.userStore.observable.subscribe(userState => {
      this.userName = userState.name;
      this.isLoggedIn = userState.isLoggedIn;
      console.log(`[UserStatusComponent] State updated: ${userState.name}, LoggedIn: ${userState.isLoggedIn}`);
    });
  }
}

// 3. SimpleApplication 인스턴스 생성 및 실행
const config = new SimFrontOption(window)
  .setRootRouter(UserStatusComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Store example started.');
```

## 4.2. 프록시(Proxy)를 활용한 API 요청 가로채기

`app-system`은 `ApiService`의 HTTP 요청을 가로채어 추가적인 로직을 적용할 수 있는 프록시 시스템을 제공합니다. 이는 `ApiServiceInterceptor`와 `SymbolIntentApiServiceProxy`를 통해 구현됩니다.

-   **`ApiServiceInterceptor`:** `ApiService`의 `fetch` 호출 전후에 실행될 로직을 정의하는 인터페이스입니다. (1.3절에서 다루었습니다.)
-   **`SymbolIntentApiServiceProxy`:** `simple-boot-http-server-ssr`의 Intent 기반 통신과 연동하여, 클라이언트 측에서 서버의 특정 `@Sim` 서비스 메소드를 마치 로컬 메소드처럼 호출할 수 있도록 하는 프록시입니다. 이 프록시는 메소드 호출을 가로채어 `ApiService`를 통해 서버로 HTTP 요청을 보냅니다.

### 구현 원리

`SymbolIntentApiServiceProxy`는 `ProxyHandler`를 구현하여, 프록시로 감싸진 객체의 메소드 호출(`get` 트랩의 `apply` 또는 `value` 속성 접근)을 가로챕니다. 가로챈 호출은 `ApiService`의 `postJson` 또는 `post` 메소드를 사용하여 서버로 HTTP 요청으로 변환됩니다. 이때 `X-Simple-Boot-Ssr-Intent-Scheme` 헤더를 통해 호출될 서버 측 서비스의 `scheme`과 메소드 이름이 전달됩니다.

```typescript
// proxy/SymbolIntentApiServiceProxy.ts (개념적)
import { ApiService } from '../fetch/ApiService';
import { getSim, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { makeIntentHeaderBySymbol } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';

@Sim
export class SymbolIntentApiServiceProxy<T extends object> implements ProxyHandler<T> {
  constructor(private apiService: ApiService) {}

  get(target: T, prop: string | symbol, receiver: any): any {
    const simConfig = getSim(target); // 프록시 대상 객체의 @Sim 설정
    const apiService = this.apiService;

    // 메소드 호출을 가로챔
    if (typeof Reflect.get(target, prop, receiver) === 'function' && simConfig?.symbol) {
      return function (...args: any[]) {
        const firstScheme = (Array.isArray(simConfig.scheme) ? simConfig.scheme[0] : simConfig.scheme) || '';
        const headers = { ...makeIntentHeaderBySymbol(simConfig.symbol as Symbol) };

        // ApiService를 통해 서버로 HTTP 요청 전송
        return apiService.postJson({
          target: `/${String(prop)}`, // 호출될 서버 측 메소드 경로
          config: {
            fetch: {
              headers: headers,
              body: args[0], // 첫 번째 인자를 요청 바디로 사용
            },
          },
        });
      };
    }
    return Reflect.get(target, prop, receiver);
  }
}
```

### 예제: `SymbolIntentApiServiceProxy` 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ApiService } from '@dooboostore/app-system/fetch/ApiService';
import { SymbolIntentApiServiceProxy } from '@dooboostore/app-system/proxy/SymbolIntentApiServiceProxy';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';

// 1. 서버 측에서 제공될 API 서비스 (클라이언트에서 프록시로 호출)
// 이 클래스는 서버와 클라이언트 모두에서 사용될 수 있습니다.
@Sim({ scheme: 'user-api', symbol: Symbol('UserApiSymbol') }) // scheme과 symbol 모두 정의
class UserApiService {
  // 이 메소드는 클라이언트에서 호출될 때 서버로 HTTP 요청으로 변환됩니다.
  getUser(userId: number): Promise<any> { return Promise.resolve(); }
  createUser(userData: { name: string; email: string }): Promise<any> { return Promise.resolve(); }
}

// 2. 클라이언트 측 컴포넌트
@Sim
@Component({
  template: `
    <h1>API Proxy System</h1>
    <button dr-event-click="this.fetchUser()">Fetch User 101</button>
    <button dr-event-click="this.createNewUser()">Create New User</button>
    <p>User Data: ${this.userData ? JSON.stringify(this.userData) : 'N/A'}$</p>
    <p>New User Result: ${this.newUserResult ? JSON.stringify(this.newUserResult) : 'N/A'}$</p>
  `,
  styles: [`
    button { margin-right: 10px; padding: 8px 15px; cursor: pointer; }
  `]
})
class AppRootComponent {
  userData: any;
  newUserResult: any;

  // ApiService와 UserApiService를 주입받음
  constructor(private apiService: ApiService, private userApiService: UserApiService) {
    // UserApiService 인스턴스를 SymbolIntentApiServiceProxy로 감싸서 서버 통신을 추상화
    // 실제 SimpleBootFront 환경에서는 SimstanceManager가 @Sim 설정에 따라 자동으로 프록시를 적용할 수 있습니다.
    this.userApiService = new Proxy(this.userApiService, new SymbolIntentApiServiceProxy(this.apiService));
  }

  async fetchUser() {
    console.log('[Client] Calling userApiService.getUser(101) via proxy...');
    this.userData = await this.userApiService.getUser(101); // 프록시를 통해 서버로 요청 전송
    console.log('[Client] Received user data:', this.userData);
  }

  async createNewUser() {
    console.log('[Client] Calling userApiService.createUser() via proxy...');
    this.newUserResult = await this.userApiService.createUser({ name: 'Jane Doe', email: 'jane.doe@example.com' });
    console.log('[Client] Received new user result:', this.newUserResult);
  }
}

// 3. SimpleApplication 인스턴스 생성 및 실행
const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('API Proxy System example started.');

/*
이 예제를 실행하려면 서버 측에서 UserApiService에 해당하는 API 엔드포인트가 구현되어 있어야 합니다.
(예: simple-boot-http-server-ssr의 IntentSchemeFilter를 통해 UserApiService의 메소드가 호출되도록 설정)

예상 출력 (클라이언트 콘솔):
[Client] Calling userApiService.getUser(101) via proxy...
[Client] Received user data: { id: 101, name: 'User 101', status: 'active' } (서버에서 받은 데이터)
[Client] Calling userApiService.createUser() via proxy...
[Client] Received new user result: { success: true, newId: ..., receivedData: { name: 'Jane Doe', email: 'jane.doe@example.com' } } (서버에서 받은 데이터)
*/
```

`Store`를 통한 상태 관리와 `Proxy`를 활용한 API 요청 가로채기 시스템은 `app-system`이 복잡한 애플리케이션의 상태를 효율적으로 관리하고, 클라이언트-서버 통신을 추상화하여 개발 편의성을 높이는 데 기여합니다.

다음 장에서는 `app-system`이 `Simple-Boot` 생태계의 다른 프레임워크들과 어떻게 연동되며, 시스템의 확장성을 어떻게 설계하는지 알아보겠습니다.
