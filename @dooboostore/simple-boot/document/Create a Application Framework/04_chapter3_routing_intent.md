# 제3장: 애플리케이션 흐름 제어 - 라우팅과 Intent 시스템

애플리케이션의 규모가 커지면 사용자 요청에 따라 적절한 기능을 실행하고, 모듈 간에 효율적으로 통신하는 메커니즘이 필요합니다. 이 장에서는 Simple-Boot의 유연한 라우팅 시스템과 느슨하게 결합된 통신을 위한 Intent 기반 이벤트 시스템을 설계하고 구현하는 방법을 알아봅니다.

## 3.1. 유연한 라우터 시스템 설계

라우터는 들어오는 요청(예: HTTP 요청, 내부 이벤트)을 분석하여 적절한 모듈이나 메소드로 연결하는 역할을 합니다. Simple-Boot의 라우터는 다음과 같은 특징을 가집니다.

-	**계층적 라우팅:** 중첩된 라우터를 통해 복잡한 URL 구조를 체계적으로 관리할 수 있습니다.
-	**클래스 기반 및 메소드 기반 라우팅:** 특정 경로를 클래스 전체에 매핑하거나, 클래스 내의 특정 메소드에 매핑할 수 있습니다.
-	**경로 파라미터 추출:** URL 경로에서 동적인 값을 추출하여 메소드의 인자로 전달할 수 있습니다.
-	**필터 체인:** 요청이 라우팅되기 전후에 특정 로직을 실행하는 필터를 적용할 수 있습니다.

## 3.2. `@Router`와 `@Route` 데코레이터

Simple-Boot은 `@Router`와 `@Route` 데코레이터를 사용하여 라우팅 규칙을 선언적으로 정의합니다.

-	**`@Router`:** 클래스에 적용되어 해당 클래스가 라우터임을 선언하고, 기본 경로(`path`)와 하위 라우팅 규칙(`route`, `routers`)을 정의합니다.
-	**`@Route`:** `@Router` 클래스 내의 메소드에 적용되어 특정 경로(`path`)에 해당 메소드를 매핑합니다. 경로 파라미터(예: `/users/{id}`)를 정의할 수 있습니다.

### 구현 원리

`RouterManager`는 라우팅 시스템의 핵심입니다. `SimpleApplication`이 초기화될 때 `rootRouter`로 지정된 클래스를 시작점으로 하여 모든 `@Router` 및 `@Route` 메타데이터를 수집하고 라우팅 맵을 구축합니다.

사용자가 `app.routing(intent)`를 호출하면, `RouterManager`는 다음과 같은 과정을 거쳐 적절한 모듈/메소드를 찾아 실행합니다.

1.	**경로 매칭:** `Intent` 객체의 `pathname`과 라우팅 맵에 정의된 경로들을 비교하여 가장 적합한 경로를 찾습니다. 이때 경로 파라미터(`{id}`)와 정규표현식(`{id:[0-9]+}`)을 지원합니다.
2.	**필터 적용:** `@Router`나 `@Route`에 정의된 `filters`가 있다면, 해당 필터의 `isAccept(intent)` 메소드를 호출하여 요청을 계속 진행할지 여부를 결정합니다.
3.	**모듈/메소드 실행:** 매칭된 경로에 해당하는 클래스(모듈)를 `SimstanceManager`를 통해 인스턴스화하고, `@Route` 메소드가 있다면 해당 메소드를 실행합니다. 이때 URL에서 추출된 경로 파라미터(`pathData`)나 쿼리 파라미터(`queryParams`) 등을 메소드의 인자로 주입할 수 있습니다.
4.	**`RouterModule` 반환:** 라우팅 결과로 `RouterModule` 객체를 반환합니다. 이 객체는 매칭된 라우터 체인, 모듈 인스턴스, 경로 데이터 등 라우팅에 대한 모든 정보를 포함합니다.

```typescript
// route/RouterManager.ts (개념적)
export class RouterManager {
  // ... constructor ...

  public async routing<R = SimAtomic, M = any>(intent: Intent): Promise<RouterModule<R, M>> {
    // 1. rootRouter부터 시작하여 재귀적으로 경로 매칭 및 필터 적용
    const executeModuleResult = this.getExecuteModule(this.rootRouter, intent, []);

    if (executeModuleResult) {
      const [executeModule, routerChains] = executeModuleResult;
      executeModule.routerChains = routerChains;

      // 2. 라우터 체인에 있는 RouterAction 구현체들의 canActivate 호출
      // (예: 인증 체크, 데이터 로딩 등)
      for (const router of routerChains) {
        const instance = router.getValue();
        if (isRouterAction(instance)) {
          await instance.canActivate({ intent, routerModule: executeModule, routerManager: this });
        }
      }

      // 3. 최종 모듈/메소드 실행 및 RouterModule 반환
      // (메소드 기반 라우팅의 경우, 해당 메소드 실행)
      return executeModule;
    } else {
      // 4. 매칭되는 경로가 없을 경우 처리 (예: 404 Not Found)
      throw new Error('Route not found');
    }
  }

  // ... getExecuteModule, findRouting 등 내부 메소드 ...
}
```

### 예제: `@Router`와 `@Route` 데코레이터 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';

// 사용자 목록 페이지를 담당하는 모듈
@Sim
class UserListPage {
    showUsers() {
        console.log('Displaying user list page.');
        return 'User List Page Content';
    }
}

// 특정 사용자 상세 페이지를 담당하는 모듈
@Sim
class UserDetailPage {
    showUserDetail(routerModule: RouterModule) {
        const userId = routerModule.pathData?.id; // URL 경로에서 'id' 파라미터 추출
        console.log(`Displaying detail for user ID: ${userId}`);
        return `User Detail Page Content for ID: ${userId}`;
    }
}

// API 엔드포인트를 담당하는 모듈
@Sim
class ApiService {
    @Route({ path: '/health' })
    checkHealth() {
        console.log('API Health Check: OK');
        return { status: 'healthy' };
    }

    @Route({ path: '/data/{type}' })
    getData(routerModule: RouterModule) {
        const dataType = routerModule.pathData?.type; // URL 경로에서 'type' 파라미터 추출
        const queryParam = routerModule.queryParams?.q; // 쿼리 파라미터 'q' 추출
        console.log(`Fetching data of type: ${dataType}, query: ${queryParam || 'none'}`);
        return { type: dataType, query: queryParam, result: `Data for ${dataType}` };
    }
}

// 애플리케이션의 루트 라우터
@Sim
@Router({ path: '' }) // 기본 경로
class AppRouter {
    // 클래스 기반 라우팅: /users 경로로 요청이 오면 UserListPage 모듈을 활성화
    @Route({ path: '/users' })
    userList(routerModule: RouterModule) {
        return routerModule.getModuleInstance<UserListPage>()?.showUsers();
    }

    // 메소드 기반 라우팅: /users/{id} 경로로 요청이 오면 UserDetailPage 모듈의 showUserDetail 메소드 호출
    @Route({ path: '/users/{id}' })
    userDetail(routerModule: RouterModule) {
        return routerModule.getModuleInstance<UserDetailPage>()?.showUserDetail(routerModule);
    }

    // 계층적 라우팅: /api 경로 아래의 모든 요청은 ApiService 라우터가 처리
    @Route({ path: '/api', target: ApiService }) // target을 사용하여 다른 라우터 모듈을 연결
    apiRoutes() {}
}

// SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication({ rootRouter: AppRouter });
app.run();

// 라우팅 실행 예시
async function runRoutingExamples() {
    console.log('\n--- Routing to /users ---');
    let result = await app.routing({ path: '/users' });
    console.log('Routing Result:', result.getModuleInstance());

    console.log('\n--- Routing to /users/123 ---');
    result = await app.routing({ path: '/users/123' });
    console.log('Routing Result:', result.getModuleInstance());

    console.log('\n--- Routing to /api/health ---');
    result = await app.routing({ path: '/api/health' });
    console.log('Routing Result:', result.getModuleInstance());

    console.log('\n--- Routing to /api/data/products?q=electronics ---');
    result = await app.routing({ path: '/api/data/products?q=electronics' });
    console.log('Routing Result:', result.getModuleInstance());
}

runRoutingExamples();
```

## 3.3. Intent 기반 이벤트 시스템

애플리케이션의 다양한 부분들이 서로 직접적으로 의존하지 않으면서도 통신할 수 있도록, Simple-Boot은 Intent 기반의 이벤트 시스템을 제공합니다. 이는 발행/구독(Publish/Subscribe) 패턴의 한 형태로, `Android`의 `Intent` 개념과 유사합니다.

-	**`Intent` 객체:** 통신의 목적(URI)과 전달할 데이터(`data`), 그리고 관련 이벤트(`event`)를 캡슐화한 객체입니다. URI는 `scheme://path?query` 형태를 가집니다.
-	**`IntentManager`:** Intent의 발행과 구독을 중재하는 역할을 합니다.

### 구현 원리

1.	**Intent 발행 (`publishIntent`):
    `app.publishIntent('MyService://updateUser', { name: 'Jane' })`와 같이 Intent를 발행하면, `IntentManager`는 Intent의 URI를 분석하여 해당 `scheme`이나 `path`에 등록된 모든 `@Sim` 모듈을 찾습니다.

2.	**Intent 구독 (`intentSubscribe`):
    `@Sim` 모듈은 `intentSubscribe(intent: Intent)` 메소드를 구현하여 발행된 Intent를 수신할 수 있습니다. 또한, Intent의 `path`에 따라 모듈 내의 특정 메소드를 직접 호출할 수도 있습니다.

```typescript
// intent/IntentManager.ts (개념적)
export class IntentManager {
  // ... constructor ...

  public publish(intent: Intent): any[] {
    const results: any[] = [];
    // 1. Intent URI를 기반으로 수신 대상 Sim 모듈들을 찾습니다.
    const targetSims = this.simstanceManager.findSims({ scheme: intent.scheme });

    targetSims.forEach(simAtomic => {
      const instance = simAtomic.getValue();
      if (instance) {
        // 2. Intent의 path에 따라 모듈 내의 특정 메소드를 호출하거나,
        //    intentSubscribe 메소드를 호출합니다.
        if (intent.paths.length > 0) {
          // 예: MyService://updateUser -> instance.updateUser(intent)
          const method = instance[intent.paths[0]]; 
          if (typeof method === 'function') {
            results.push(method.call(instance, intent));
          }
        } else if (typeof instance.intentSubscribe === 'function') {
          results.push(instance.intentSubscribe(intent));
        }
      }
    });
    return results;
  }
}
```

### 예제: Intent 기반 이벤트 시스템 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Intent, IntentSubscribe } from '@dooboostore/simple-boot';

// Intent를 발행하는 서비스
@Sim
class PublisherService {
    constructor(private app: SimpleApplication) {}

    publishUserUpdate(userId: string, newName: string) {
        console.log(`[Publisher] Publishing user update for ID: ${userId}`);
        // 'user-service' 스킴의 'updateUser' 경로로 Intent 발행
        this.app.publishIntent(
            new Intent(`user-service://updateUser/${userId}`, { name: newName })
        );
    }

    publishGlobalMessage(message: string) {
        console.log(`[Publisher] Publishing global message: ${message}`);
        // 'global-events' 스킴으로 데이터만 포함된 Intent 발행
        this.app.publishIntent(
            new Intent('global-events://', { message: message })
        );
    }
}

// Intent를 구독하는 서비스 (user-service 스킴)
@Sim({ scheme: 'user-service' })
class UserService implements IntentSubscribe {
    // user-service://updateUser/{id} 경로에 매핑되는 메소드
    updateUser(intent: Intent) {
        const userId = intent.getPathnameData('updateUser/{id}')?.id;
        const newName = intent.data?.name;
        console.log(`[UserService] Received update for user ${userId}: new name is ${newName}`);
        // 실제 사용자 정보 업데이트 로직...
    }

    // user-service 스킴의 다른 Intent를 처리하는 일반 구독 메소드
    intentSubscribe(intent: Intent) {
        console.log(`[UserService] Generic intent received: ${intent.uri}, data:`, intent.data);
    }
}

// Intent를 구독하는 또 다른 서비스 (global-events 스킴)
@Sim({ scheme: 'global-events' })
class NotificationService implements IntentSubscribe {
    intentSubscribe(intent: Intent) {
        const message = intent.data?.message;
        console.log(`[NotificationService] Global message received: ${message}`);
        // 사용자에게 알림을 표시하는 로직...
    }
}

// SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication();
app.run();

const publisher = app.sim(PublisherService);

// Intent 발행 예시
publisher?.publishUserUpdate('101', 'Alice Smith');
publisher?.publishGlobalMessage('Application started successfully!');

// 존재하지 않는 스킴으로 발행 시 아무도 받지 않음
console.log('\n--- Publishing to unknown scheme ---');
app.publishIntent(new Intent('unknown-service://doSomething', { value: 123 }));

/* 예상 출력:
[Publisher] Publishing user update for ID: 101
[UserService] Received update for user 101: new name is Alice Smith
[Publisher] Publishing global message: Application started successfully!
[NotificationService] Global message received: Application started successfully!

--- Publishing to unknown scheme ---
*/
```

라우팅 시스템과 Intent 시스템은 Simple-Boot 애플리케이션의 흐름을 제어하고, 모듈 간의 결합도를 낮춰 유연하고 확장 가능한 아키텍처를 구축하는 데 핵심적인 역할을 합니다.

다음 장에서는 애플리케이션의 성능과 데이터 무결성을 보장하는 캐싱과 유효성 검증 시스템을 구현하는 방법을 알아보겠습니다.
