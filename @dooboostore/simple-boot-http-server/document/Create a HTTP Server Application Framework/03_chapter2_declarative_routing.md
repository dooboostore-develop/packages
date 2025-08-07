# 제2장: 선언적 라우팅 - URL과 메소드 매핑

웹 서버의 핵심 기능은 클라이언트의 HTTP 요청을 받아 적절한 핸들러(메소드)로 연결하는 라우팅입니다. `Simple-Boot-HTTP-Server`는 `@dooboostore/simple-boot`의 라우팅 시스템을 확장하여, HTTP 메소드와 URL 경로를 클래스 및 메소드에 선언적으로 매핑하는 강력한 기능을 제공합니다. 이 장에서는 이러한 선언적 라우팅의 설계와 구현 방법을 알아봅니다.

## 2.1. `@Router`와 `@Route`를 활용한 라우팅

`Simple-Boot-HTTP-Server`의 라우팅은 `simple-boot-core`의 `@Router`와 `@Route` 데코레이터를 기반으로 합니다. 이 데코레이터들을 사용하여 URL 경로와 서버의 비즈니스 로직을 연결합니다.

-   **`@Router`:** 클래스에 적용되어 해당 클래스가 라우터임을 선언하고, 기본 경로(`path`)와 하위 라우팅 규칙(`route`, `routers`)을 정의합니다. 이는 계층적 라우팅 구조를 가능하게 합니다.
-   **`@Route`:** `@Router` 클래스 내의 메소드에 적용되어 특정 경로(`path`)에 해당 메소드를 매핑합니다. URL 경로에서 동적인 값을 추출하는 경로 파라미터(예: `/users/{id}`)를 지원합니다.

### 구현 원리

`SimpleBootHttpServer`는 `SimpleApplication`을 상속받으므로, `simple-boot-core`의 `RouterManager`를 그대로 사용합니다. `RouterManager`는 애플리케이션 초기화 시 모든 `@Router` 및 `@Route` 메타데이터를 수집하여 라우팅 맵을 구축합니다. 클라이언트 요청이 들어오면 `SimpleBootHttpServer`는 `RouterManager`의 `routing()` 메소드를 호출하여 요청 URL에 매칭되는 라우트 핸들러를 찾습니다.

## 2.2. HTTP 메소드 데코레이터 (`@GET`, `@POST` 등)

`Simple-Boot-HTTP-Server`는 HTTP 메소드(GET, POST, PUT, DELETE 등)를 라우트 핸들러 메소드에 직접 매핑할 수 있는 전용 데코레이터를 제공합니다. 이 데코레이터들은 `UrlMapping` 데코레이터를 확장한 형태로, 특정 HTTP 메소드에 대한 요청만 처리하도록 합니다.

-   **`@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`, `@OPTIONS`, `@HEAD`, `@TRACE`, `@CONNECT`:** 각 HTTP 메소드에 해당하는 데코레이터입니다.
-   **`@UrlMapping`:** 제네릭 데코레이터로, `method` 속성을 통해 HTTP 메소드를 문자열로 직접 지정할 수 있습니다.

### `MappingConfig`를 통한 요청/응답 제어

이 메소드 데코레이터들은 `MappingConfig` 객체를 인자로 받아 요청(`req`) 및 응답(`res`)의 속성을 세밀하게 제어할 수 있습니다.

-   **`req.contentType` / `req.accept`:** 요청의 `Content-Type` 또는 `Accept` 헤더를 기반으로 요청을 필터링합니다.
-   **`res.status`:** 응답 상태 코드 (예: `200`, `201`, `404`)를 설정합니다.
-   **`res.header`:** 커스텀 응답 헤더를 추가합니다.
-   **`res.contentType`:** 응답의 `Content-Type` 헤더를 설정합니다. (예: `Mimes.ApplicationJson`, `Mimes.TextHtml`)
-   **`resolver`:** 메소드의 반환 값을 클라이언트에 응답하기 전에 추가적으로 처리할 `Resolver` 클래스를 지정합니다. (예: `ResourceResorver`를 사용하여 파일 응답)

### 구현 원리

HTTP 메소드 데코레이터들은 `Reflect.defineMetadata`를 사용하여 메소드에 `MappingConfig` 메타데이터를 추가합니다. `SimpleBootHttpServer`는 요청이 들어오면, `RouterManager`가 찾은 라우트 핸들러 메소드들 중에서 요청의 HTTP 메소드, `Content-Type`, `Accept` 헤더에 가장 잘 매칭되는 메소드를 선택하여 실행합니다.

```typescript
// decorators/MethodMapping.ts (개념적)
export const MappingMetadataKey = Symbol('MappingMetadataKey');

export function GET(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function GET(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function GET(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        // @GET 데코레이터가 인자 없이 사용될 때
        process({method: HttpMethod.GET}, configOrTarget, propertyKey, descriptor);
    } else {
        // @GET 데코레이터가 인자와 함께 사용될 때
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.GET;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

const process = (config: MappingConfig, target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // 클래스의 모든 메소드에 대한 매핑 정보를 저장
    const saveMappingConfigs = (ReflectUtils.getMetadata(MappingMetadataKey, target.constructor) ?? []) as SaveMappingConfig[];
    saveMappingConfigs.push({propertyKey, config});
    ReflectUtils.defineMetadata(MappingMetadataKey, saveMappingConfigs, target.constructor);
    // 특정 메소드에 대한 매핑 정보를 저장
    ReflectUtils.defineMetadata(MappingMetadataKey, config, target, propertyKey);
};
```

### 예제: URL & 메소드 매핑

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, POST, PUT, DELETE, Mimes, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import { ReqJsonBody } from '@dooboostore/simple-boot-http-server/models/datas/body/ReqJsonBody';

// 가상의 데이터 저장소
const items: { id: number; name: string }[] = [
    { id: 1, name: 'Item A' },
    { id: 2, name: 'Item B' }
];
let nextId = 3;

@Sim
@Router({ path: '/api/items' })
export class ItemApi {

    @Route({ path: '' }) // GET /api/items
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getAllItems() {
        console.log('GET /api/items: All items requested.');
        return items;
    }

    @Route({ path: '/{id}' }) // GET /api/items/{id}
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getItemById(routerModule: RouterModule) {
        const itemId = parseInt(routerModule.pathData?.id || '0');
        console.log(`GET /api/items/${itemId}: Specific item requested.`);
        const item = items.find(i => i.id === itemId);
        if (!item) {
            // Simple-Boot의 예외 처리 시스템과 연동 가능
            throw new Error(`Item with ID ${itemId} not found.`);
        }
        return item;
    }

    @Route({ path: '' }) // POST /api/items
    @POST({
        req: { contentType: [Mimes.ApplicationJson] }, // 요청 Content-Type이 application/json일 때만 처리
        res: { status: HttpStatus.Created, contentType: Mimes.ApplicationJson } // 응답 상태 201 Created
    })
    createItem(body: ReqJsonBody) {
        console.log('POST /api/items: Creating new item:', body);
        const newItem = { id: nextId++, name: body.name };
        items.push(newItem);
        return { success: true, item: newItem };
    }

    @Route({ path: '/{id}' }) // PUT /api/items/{id}
    @PUT({ req: { contentType: [Mimes.ApplicationJson] } })
    updateItem(routerModule: RouterModule, body: ReqJsonBody) {
        const itemId = parseInt(routerModule.pathData?.id || '0');
        console.log(`PUT /api/items/${itemId}: Updating item:`, body);
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            throw new Error(`Item with ID ${itemId} not found for update.`);
        }
        items[itemIndex].name = body.name || items[itemIndex].name;
        return { success: true, item: items[itemIndex] };
    }

    @Route({ path: '/{id}' }) // DELETE /api/items/{id}
    @DELETE({ res: { status: HttpStatus.NoContent } }) // 응답 상태 204 No Content
    deleteItem(routerModule: RouterModule) {
        const itemId = parseInt(routerModule.pathData?.id || '0');
        console.log(`DELETE /api/items/${itemId}: Deleting item.`);
        const initialLength = items.length;
        items.splice(items.findIndex(i => i.id === itemId), 1);
        if (items.length === initialLength) {
            throw new Error(`Item with ID ${itemId} not found for deletion.`);
        }
        // 204 No Content 응답이므로 반환 값 없음
    }
}

// 서버 옵션 설정
const httpServerOption = new HttpServerOption({
    listen: {
        port: 3000,
        listeningListener: (server, httpServer) => {
            const address = httpServer.address();
            console.log(`Server is running on http://localhost:${(address as any).port}`);
        }
    }
});

// SimpleBootHttpServer 인스턴스 생성 및 실행
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server URL & Method Mapping example started.');

/*
터미널에서 다음 명령어로 테스트:

# 모든 아이템 조회
curl http://localhost:3000/api/items

# 특정 아이템 조회
curl http://localhost:3000/api/items/1

# 새 아이템 생성
curl -X POST -H "Content-Type: application/json" -d '{"name":"New Item"}' http://localhost:3000/api/items

# 아이템 업데이트
curl -X PUT -H "Content-Type: application/json" -d '{"name":"Updated Item A"}' http://localhost:3000/api/items/1

# 아이템 삭제
curl -X DELETE http://localhost:3000/api/items/2
*/
```

## 2.3. 요청/응답 데이터 바인딩 (Body, Header, Query)

`Simple-Boot-HTTP-Server`는 라우트 핸들러 메소드의 파라미터에 요청의 다양한 데이터를 자동으로 주입(바인딩)하는 기능을 제공합니다. 이는 `simple-boot-core`의 DI 컨테이너와 `RequestResponse` 객체를 활용하여 구현됩니다.

-   **`RequestResponse`:** HTTP 요청/응답 객체 자체를 주입받아 모든 요청 정보에 접근하고 응답을 구성할 수 있습니다.
-   **`RouterModule`:** 현재 라우팅에 대한 상세 정보(경로 파라미터 `pathData`, 쿼리 파라미터 `queryParams` 등)를 포함하는 객체입니다.
-   **`ReqHeader`:** 요청 헤더 전체를 객체 형태로 주입받습니다.
-   **`ReqJsonBody`:** 요청 바디가 JSON 형태일 때, 해당 JSON 데이터를 객체로 파싱하여 주입받습니다.
-   **`ReqFormUrlBody`:** 요청 바디가 `application/x-www-form-urlencoded` 형태일 때, 해당 데이터를 객체로 파싱하여 주입받습니다.
-   **`ReqMultipartFormBody`:** `multipart/form-data` 형태의 요청 바디를 처리하여 파일 및 필드 데이터를 주입받습니다.
-   **`URLSearchParams`:** 요청 URL의 쿼리 스트링을 `URLSearchParams` 객체로 주입받습니다.

### 구현 원리

`SimpleBootHttpServer`의 `request` 이벤트 리스너 내에서 라우트 핸들러 메소드를 실행하기 전에, `simple-boot-core`의 `SimstanceManager.getParameterSim()` 메소드를 사용하여 핸들러 메소드의 파라미터 타입을 분석합니다. 각 파라미터 타입에 따라 `RequestResponse` 객체로부터 해당 데이터를 추출하거나 파싱하여 메소드의 인자로 주입합니다.

예를 들어, 핸들러 메소드의 파라미터에 `ReqJsonBody` 타입이 있다면, `RequestResponse` 객체의 `reqBodyJsonData()` 메소드를 호출하여 요청 바디를 읽고 JSON으로 파싱한 후, 그 결과를 해당 파라미터에 주입합니다.

```typescript
// SimpleBootHttpServer.ts (개념적 - 라우트 핸들러 실행 부분)
// ...
// methods[0]는 매칭된 라우트 핸들러 메소드의 메타데이터
const it = methods[0]; 
const moduleInstance = routerModule?.getModuleInstance?.(); // 라우트 핸들러가 속한 클래스의 인스턴스

// 핸들러 메소드의 파라미터 타입 분석
const paramTypes = ReflectUtils.getParameterTypes(moduleInstance, it.propertyKey);
const otherStorage = new Map<ConstructorType<any>, any>();
otherStorage.set(RequestResponse, rr); // RequestResponse 객체는 항상 주입 가능
otherStorage.set(RouterModule, routerModule); // RouterModule 객체도 항상 주입 가능

for (const paramType of paramTypes) {
    if (paramType === ReqFormUrlBody) {
        otherStorage.set(ReqFormUrlBody, await rr.reqBodyReqFormUrlBody());
    } else if (paramType === ReqJsonBody) {
        otherStorage.set(ReqJsonBody, await rr.reqBodyReqJsonBody());
    } else if (paramType === ReqHeader) {
        otherStorage.set(ReqHeader, rr.reqHeaderObj);
    } // ... 다른 파라미터 타입 처리 ...
}

// SimstanceManager를 통해 파라미터들을 주입하여 핸들러 메소드 실행
let data = await this.simstanceManager.executeBindParameterSimPromise({
    target: moduleInstance,
    targetKey: it.propertyKey
}, otherStorage);
// ... 응답 구성 ...
```

이러한 자동 데이터 바인딩 기능은 개발자가 요청 데이터를 수동으로 파싱하고 검증하는 번거로움을 줄여주어, 비즈니스 로직 구현에 더 집중할 수 있도록 돕습니다.

다음 장에서는 요청/응답 생명주기에서 특정 로직을 가로채어 실행하는 필터와 엔드포인트 시스템에 대해 알아보겠습니다.
