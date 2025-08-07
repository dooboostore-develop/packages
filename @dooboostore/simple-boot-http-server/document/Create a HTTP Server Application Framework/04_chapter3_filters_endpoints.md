# 제3장: 요청/응답 가로채기 - 필터와 엔드포인트

웹 서버 애플리케이션에서는 핵심 비즈니스 로직 외에도 로깅, 인증, CORS 처리, 캐싱 등 다양한 공통 관심사(Cross-cutting Concerns)를 처리해야 합니다. `Simple-Boot-HTTP-Server`는 이러한 횡단 관심사를 효율적으로 관리하기 위해 필터(Filter)와 엔드포인트(EndPoint) 시스템을 제공합니다. 이 장에서는 이 두 메커니즘의 설계와 구현 방법을 알아봅니다.

## 3.1. 필터(Filter) 시스템: 요청 처리 전후 로직

필터는 클라이언트의 요청이 라우트 핸들러에 도달하기 전(`proceedBefore`)과 핸들러가 응답을 생성한 후(`proceedAfter`)에 특정 로직을 실행할 수 있도록 요청-응답 생명주기를 가로채는 역할을 합니다. 이는 미들웨어와 유사하지만, `Simple-Boot-HTTP-Server`에서는 DI 컨테이너의 관리와 함께 더 구조화된 방식으로 사용됩니다.

-   **`Filter` 인터페이스:** `proceedBefore`와 `proceedAfter` 메소드를 정의합니다. `proceedBefore`는 `true`를 반환해야 다음 필터 또는 라우트 핸들러로 요청이 진행됩니다. `false`를 반환하면 체인이 중단되고 응답이 즉시 전송됩니다.

### 구현 원리

`HttpServerOption`의 `filters` 배열에 등록된 필터들은 `SimpleBootHttpServer`의 `request` 이벤트 리스너 내에서 순서대로 실행됩니다. `proceedBefore` 메소드들은 등록된 순서대로 실행되며, `proceedAfter` 메소드들은 역순으로 실행됩니다.

```typescript
// SimpleBootHttpServer.ts (개념적 - 필터 체인 실행 부분)
// ...
// proceedBefore 실행
for (let i = 0; this.option.filters && i < this.option.filters.length; i++) {
    const filterInstance = (typeof this.option.filters[i] === 'function' ? this.simstanceManager.getOrNewSim({target:this.option.filters[i]}) : this.option.filters[i]) as Filter;
    let proceed = true;
    if (filterInstance?.proceedBefore) {
        proceed = await filterInstance.proceedBefore({rr, app: this, carrier: filter.carrier});
        filter.filters.push({filter: filterInstance, proceed}); // proceedAfter를 위해 상태 저장
    }
    if (!proceed) { // proceedBefore가 false를 반환하면 체인 중단
        break;
    }
}

// ... 라우트 핸들러 실행 ...

// proceedAfter 실행 (역순)
for (const it of filter.filters.reverse()) {
    if (it.filter?.proceedAfter) {
        await it.filter.proceedAfter({rr, app: this, before: it.proceed, carrier: filter.carrier});
    }
}
// ...
```

### 예제: 필터 사용

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';
import { HttpStatus } from '@dooboostore/simple-boot-http-server/codes/HttpStatus';

// 1. 인증 필터: 특정 경로에 대한 요청을 인증
@Sim
class AuthFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) { console.log('[Filter] AuthFilter initialized.'); }
    async proceedBefore({ rr, app, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any> }) {
        console.log(`[AuthFilter] Checking authentication for ${rr.reqUrl()}`);
        if (rr.reqUrl() === '/admin' && rr.reqHeader('authorization') !== 'Bearer my-secret-token') {
            rr.resStatusCode(HttpStatus.Unauthorized).resWrite('Unauthorized').resEnd();
            return false; // 요청 체인 중단
        }
        return true; // 다음으로 진행
    }
    async proceedAfter({ rr, app, before, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any> }) {
        console.log(`[AuthFilter] Authentication check finished for ${rr.reqUrl()}`);
        return true;
    }
}

// 2. CORS 필터: 모든 요청에 CORS 헤더 추가
@Sim
class CorsFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) { console.log('[Filter] CorsFilter initialized.'); }
    async proceedBefore({ rr, app, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any> }) {
        rr.resSetHeader('Access-Control-Allow-Origin', '*');
        rr.resSetHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        rr.resSetHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (rr.reqMethod() === 'OPTIONS') {
            rr.resStatusCode(HttpStatus.NoContent).resEnd(); // OPTIONS 요청은 즉시 응답
            return false; // 요청 체인 중단
        }
        return true;
    }
    async proceedAfter({ rr, app, before, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any> }) {
        return true;
    }
}

// 3. 라우터
@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    index() {
        return 'Hello, Simple-Boot-HTTP-Server!';
    }

    @Route({ path: '/admin' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    adminPage() {
        return 'Welcome to Admin Page!';
    }
}

// 4. 서버 옵션 설정
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    filters: [CorsFilter, AuthFilter], // 필터 등록 (순서 중요: Cors가 먼저 실행되어야 함)
});

// 5. SimpleBootHttpServer 인스턴스 생성 및 실행
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Filters example started.');

/*
터미널에서 다음 명령어로 테스트:

# CORS 테스트 (OPTIONS 요청)
curl -X OPTIONS -H "Origin: http://example.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" http://localhost:3000/

# 인증 성공
curl -H "Authorization: Bearer my-secret-token" http://localhost:3000/admin

# 인증 실패
curl http://localhost:3000/admin
*/
```

## 3.2. 엔드포인트(EndPoint): 요청 생명주기 훅

엔드포인트는 필터와 유사하게 요청 생명주기의 특정 지점에서 실행되는 로직이지만, 주로 요청의 시작, 종료, 에러 발생과 같은 전역적인 이벤트에 반응하는 데 사용됩니다.

-   **`EndPoint` 인터페이스:** `endPoint` 메소드를 정의합니다. `onInit` 메소드도 포함하여 초기화 로직을 수행할 수 있습니다.

### 구현 원리

`HttpServerOption`에는 `requestEndPoints`, `closeEndPoints`, `errorEndPoints` 세 가지 유형의 엔드포인트 배열이 있습니다. `SimpleBootHttpServer`는 HTTP 요청의 `request`, `close`, `error` 이벤트에 리스너를 등록하고, 해당 이벤트 발생 시 등록된 엔드포인트의 `endPoint` 메소드를 호출합니다.

```typescript
// SimpleBootHttpServer.ts (개념적 - 엔드포인트 실행 부분)
// ...
this.server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
    const rr = new RequestResponse(req, res, {sessionManager: this.sessionManager, option: this.option});

    // requestEndPoints 실행
    if (this.option.requestEndPoints) {
        for (const it of this.option.requestEndPoints) {
            const endPointInstance = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it) as EndPoint;
            await endPointInstance?.endPoint(rr, this);
        }
    }

    res.on('close', async () => {
        // closeEndPoints 실행
        if (this.option.closeEndPoints) { /* ... */ }
    });

    res.on('error', async () => {
        // errorEndPoints 실행
        if (this.option.errorEndPoints) { /* ... */ }
    });
    // ...
});
```

### 예제: 엔드포인트 사용

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';

// 1. 요청 시작 엔드포인트: 요청 ID 부여 및 로깅
@Sim
class RequestIdEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] RequestIdEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        const requestId = Math.random().toString(36).substring(2, 15); // 간단한 요청 ID 생성
        rr.resSetHeader('X-Request-ID', requestId);
        console.log(`[EndPoint] Request ID: ${requestId} for ${rr.reqUrl()}`);
    }
}

// 2. 연결 종료 엔드포인트: 연결 시간 로깅
@Sim
class ConnectionCloseLoggerEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] ConnectionCloseLoggerEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log(`[EndPoint] Connection closed for ${rr.reqUrl()} (Request ID: ${rr.resHeader('X-Request-ID')})`);
    }
}

// 3. 에러 엔드포인트: 응답 스트림 에러 로깅
@Sim
class ErrorLoggerEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] ErrorLoggerEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.error(`[EndPoint] Error occurred on response stream for ${rr.reqUrl()} (Request ID: ${rr.resHeader('X-Request-ID')})`);
    }
}

// 4. 라우터
@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    index() {
        return 'Hello, Endpoints!';
    }

    @Route({ path: '/error-test' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    errorTest(rr: RequestResponse) {
        // 의도적으로 응답 스트림에 에러 발생 (실제 환경에서는 네트워크 문제 등으로 발생)
        rr.res.write('Partial data...');
        rr.res.destroy(new Error('Simulated stream error')); // 스트림 강제 종료 및 에러 발생
        return 'This will not be sent.';
    }
}

// 5. 서버 옵션 설정
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    requestEndPoints: [RequestIdEndPoint],         // 요청 시작 시
    closeEndPoints: [ConnectionCloseLoggerEndPoint], // 연결 종료 시
    errorEndPoints: [ErrorLoggerEndPoint],         // 응답 스트림 에러 시
});

// 6. SimpleBootHttpServer 인스턴스 생성 및 실행
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Endpoints example started.');

/*
터미널에서 다음 명령어로 테스트:
curl http://localhost:3000/
curl http://localhost:3000/error-test
*/
```

## 3.3. 전역 예외 처리와 Advice

`Simple-Boot-HTTP-Server`는 `simple-boot-core`의 강력한 예외 처리 시스템을 활용하여 HTTP 요청 처리 중 발생하는 모든 예외를 중앙에서 관리할 수 있도록 합니다. 이는 `HttpServerOption`의 `globalAdvice` 옵션과 `@ExceptionHandler` 데코레이터를 통해 구현됩니다.

-   **`globalAdvice`:** `HttpServerOption`에 등록된 클래스는 전역 예외 핸들러 역할을 합니다. 이 클래스는 `@Sim`으로 등록되어 DI 컨테이너의 관리를 받습니다.
-   **`@ExceptionHandler`:** `globalAdvice` 클래스 내의 메소드에 적용되어 특정 타입의 예외를 처리합니다. 예외 객체(`Error`)와 `RequestResponse` 객체를 인자로 주입받을 수 있습니다.

### 구현 원리

`SimpleBootHttpServer`의 `request` 이벤트 리스너는 전체 요청 처리 로직을 `try-catch` 블록으로 감쌉니다. 예외가 발생하면, `simple-boot-core`의 `SimstanceManager`를 통해 `globalAdvice`에 등록된 클래스에서 해당 예외 타입에 맞는 `@ExceptionHandler` 메소드를 찾아 실행합니다. 이 핸들러는 `RequestResponse` 객체를 통해 클라이언트에게 적절한 HTTP 응답(예: `500 Internal Server Error`, `404 Not Found`)을 보낼 수 있습니다.

```typescript
// SimpleBootHttpServer.ts (개념적 - 예외 처리 부분)
// ...
try {
    // ... 요청 처리 및 라우트 핸들러 실행 ...
} catch (e) {
    // 1. HTTP 에러 상태 코드 설정 (HttpError 타입인 경우)
    rr.resStatusCode(e instanceof HttpError ? e.status : HttpStatus.InternalServerError);

    // 2. globalAdvice에 등록된 예외 핸들러 실행
    const globalAdviceInstance = this.simstanceManager.getOrNewSim(this.option.globalAdvice); // DI 컨테이너에서 인스턴스 조회
    if (globalAdviceInstance) {
        const exceptionHandlerMethod = targetExceptionHandler(globalAdviceInstance, e); // 예외 타입에 맞는 핸들러 메소드 찾기
        if (exceptionHandlerMethod) {
            // 핸들러 메소드 실행 (예외 객체, RequestResponse 객체 등 주입)
            await this.simstanceManager.executeBindParameterSimPromise({
                target: globalAdviceInstance,
                targetKey: exceptionHandlerMethod.propertyKey
            }, otherStorage); // otherStorage에 예외 객체와 RequestResponse 객체 포함
        }
    }
} finally {
    // ... 응답 종료 ...
}
```

### 예제: 전역 예외 처리와 Advice

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, ExceptionHandler } from '@dooboostore/simple-boot';
import { NotFoundError, HttpError } from '@dooboostore/simple-boot-http-server/errors';

// 1. 전역 예외 처리를 위한 Advice 클래스
@Sim
class GlobalErrorHandlerAdvice {
    // NotFoundError (404) 처리
    @ExceptionHandler({ type: NotFoundError })
    handleNotFoundError(rr: RequestResponse, error: NotFoundError) {
        console.error(`[GlobalAdvice] Caught NotFoundError: ${error.message}`);
        rr.resStatusCode(HttpStatus.NotFound).resWriteJson({ error: 'Not Found', message: error.message }).resEnd();
    }

    // 모든 다른 HttpError 처리
    @ExceptionHandler({ type: HttpError })
    handleHttpError(rr: RequestResponse, error: HttpError) {
        console.error(`[GlobalAdvice] Caught HttpError: ${error.message} (Status: ${error.status})`);
        rr.resStatusCode(error.status).resWriteJson({ error: 'HTTP Error', message: error.message }).resEnd();
    }

    // 예상치 못한 모든 예외 처리 (가장 일반적인 핸들러)
    @ExceptionHandler()
    handleAllOtherErrors(rr: RequestResponse, error: any) {
        console.error(`[GlobalAdvice] Caught unexpected error:`, error);
        rr.resStatusCode(HttpStatus.InternalServerError).resWriteJson({ error: 'Internal Server Error', message: 'An unexpected error occurred.' }).resEnd();
    }
}

// 2. 라우터
@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    index() {
        return 'Hello, Global Exception Handling!';
    }

    @Route({ path: '/trigger-404' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    trigger404() {
        throw new NotFoundError({ message: 'This page does not exist.' });
    }

    @Route({ path: '/trigger-500' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    trigger500() {
        throw new Error('Something went wrong on the server!'); // 일반 Error 발생
    }

    @Route({ path: '/trigger-custom-http-error' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    triggerCustomHttpError() {
        // 커스텀 HTTP 에러 (예: 403 Forbidden)
        throw new HttpError({ status: HttpStatus.Forbidden, message: 'Access Denied.' });
    }
}

// 3. 서버 옵션 설정
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    globalAdvice: GlobalErrorHandlerAdvice, // 전역 예외 핸들러 등록
    // 매칭되는 라우트가 없을 때 NotFoundError를 발생시키도록 설정
    noSuchRouteEndPointMappingThrow: (rr) => new NotFoundError({ message: `No route found for ${rr.reqUrl()}` }),
});

// 4. SimpleBootHttpServer 인스턴스 생성 및 실행
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Global Exception Handling example started.');

/*
터미널에서 다음 명령어로 테스트:
curl http://localhost:3000/
curl http://localhost:3000/trigger-404
curl http://localhost:3000/trigger-500
curl http://localhost:3000/trigger-custom-http-error
curl http://localhost:3000/non-existent-path
*/
```

필터와 엔드포인트, 그리고 전역 예외 처리 시스템은 `Simple-Boot-HTTP-Server`가 견고하고 유연한 웹 서버 애플리케이션을 구축하는 데 필수적인 도구입니다. 이를 통해 개발자는 핵심 비즈니스 로직에 집중하면서도, 요청의 전처리, 후처리, 그리고 예외 상황에 대한 일관된 대응을 구현할 수 있습니다.

다음 장에서는 웹 애플리케이션의 상태를 관리하는 세션 시스템과 파일 업로드 처리 방법에 대해 알아보겠습니다.
