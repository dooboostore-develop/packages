# 제1장: 서버의 시작과 요청 처리 - SimpleBootHttpServer와 RequestResponse

모든 웹 서버 프레임워크는 클라이언트의 요청을 받아들이고 응답을 돌려주는 기본적인 HTTP 트랜잭션을 처리하는 것에서 시작합니다. 이 장에서는 `Simple-Boot-HTTP-Server`의 핵심인 `SimpleBootHttpServer` 클래스의 역할과 초기화 과정, 그리고 HTTP 요청과 응답을 통합적으로 관리하는 `RequestResponse` 객체에 대해 알아봅니다.

## 1.1. SimpleBootHttpServer의 역할과 초기화

`SimpleBootHttpServer`는 Node.js의 내장 `http` 또는 `https` 모듈을 기반으로 HTTP 서버를 생성하고 관리하는 역할을 합니다. 이 클래스는 `@dooboostore/simple-boot`의 `SimpleApplication`을 상속받아, DI 컨테이너와 같은 코어 프레임워크의 기능을 활용합니다.

-   **서버 인스턴스 관리:** `http.Server` 또는 `https.Server` 인스턴스를 생성하고, 요청(`request`) 이벤트를 리스닝하여 HTTP 트랜잭션을 처리합니다.
-   **옵션 설정:** `HttpServerOption` 객체를 통해 서버의 포트, 호스트, HTTPS 설정, 필터, 엔드포인트 등 다양한 서버 관련 설정을 관리합니다.
-   **생명주기 관리:** 서버 시작(`run`) 시 필터와 엔드포인트의 `onInit` 메소드를 호출하여 초기화 로직을 수행합니다.

`SimpleBootHttpServer` 인스턴스는 `new SimpleBootHttpServer(option)` 형태로 생성되며, `run()` 메소드를 호출하여 서버를 시작합니다.

```typescript
// SimpleBootHttpServer.ts (개념적)
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { HttpServerOption } from './option/HttpServerOption';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server as HttpsServer } from 'https';

export class SimpleBootHttpServer extends SimpleApplication {
  public server?: HttpServer | HttpsServer; // Node.js HTTP/HTTPS 서버 인스턴스

  constructor(public option: HttpServerOption = new HttpServerOption()) {
    super(option); // SimpleApplication 상속
    // 세션 관리자 초기화
    this.sessionManager = new SessionManager(this.option);
  }

  public run(otherInstanceSim?: Map<ConstructorType<any>, any>) {
    const simstanceManager = super.run(otherInstanceSim); // SimpleApplication 초기화
    
    // 필터 및 엔드포인트 초기화 (onInit 호출)
    const targets = [...this.option.closeEndPoints ?? [], ...this.option.errorEndPoints ?? [], ...this.option.requestEndPoints ?? [], ...this.option.filters ?? []];
    Promise.all(targets.map(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it as ConstructorType<any>}) : it) as OnInit).map(it => it.onInit(this)))
      .then(() => {
        this.startServer(); // 모든 초기화 완료 후 서버 시작
      });
    return simstanceManager;
  }

  private startServer() {
    // HTTP 또는 HTTPS 서버 인스턴스 생성
    if (this.option.serverOption && 'key' in this.option.serverOption && 'cert' in this.option.serverOption) {
      this.server = new HttpsServer(this.option.serverOption);
    } else if (this.option.serverOption) {
      this.server = new HttpServer(this.option.serverOption);
    } else {
      this.server = new HttpServer();
    }

    // 요청 이벤트 리스너 등록
    this.server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
      const rr = new RequestResponse(req, res, {sessionManager: this.sessionManager, option: this.option});
      // ... 요청 처리 로직 ...
    });

    // 서버 리스닝 시작
    this.server.listen(this.option.listen.port, this.option.listen.hostname, this.option.listen.backlog, () => {
      this.option.listen.listeningListener?.(this, this.server); // 리스닝 콜백 호출
    });
  }
}
```

## 1.2. RequestResponse 객체: HTTP 트랜잭션의 핵심

`RequestResponse` 클래스는 Node.js의 `IncomingMessage` (요청)와 `ServerResponse` (응답) 객체를 래핑하여, HTTP 요청과 응답에 관련된 모든 작업을 통합적으로 처리하는 핵심 객체입니다. 모든 라우트 핸들러, 필터, 엔드포인트는 이 `RequestResponse` 객체를 통해 요청 정보에 접근하고 응답을 구성합니다.

-   **요청 정보 접근:** 요청 메소드, URL, 헤더, 쿼리 파라미터, 바디 데이터(JSON, Form URL-encoded, Multipart Form Data) 등에 쉽게 접근할 수 있는 메소드를 제공합니다.
-   **응답 구성:** 상태 코드, 헤더 설정, 바디 데이터 작성(텍스트, JSON, 버퍼) 등 응답을 구성하는 메소드를 제공합니다.
-   **세션 관리:** `reqSession()` 메소드를 통해 세션 데이터에 접근할 수 있습니다.
-   **체이닝 가능한 API:** 대부분의 응답 관련 메소드는 `RequestResponse` 인스턴스 자신을 반환하여 메소드 체이닝을 가능하게 합니다.

```typescript
// models/RequestResponse.ts (개념적)
import { IncomingMessage, ServerResponse } from 'http';
import { HttpHeaders } from '../codes/HttpHeaders';
import { Mimes } from '../codes/Mimes';

export class RequestResponse {
  protected req: IncomingMessage;
  protected res: ServerResponse;
  // ... 기타 속성 ...

  constructor(req: IncomingMessage, res: ServerResponse, config: any) {
    this.req = req;
    this.res = res;
    this.config = config;
  }

  reqMethod(): string | undefined { return this.req.method?.toUpperCase(); }
  reqUrl(): string { return this.req.url ?? ''; }
  reqHeader(key: HttpHeaders | string): string | string[] | undefined { return this.req.headers[key.toLowerCase()]; }

  async reqBodyStringData(): Promise<string> { /* ... */ }
  async reqBodyJsonData<T>(): Promise<T> { /* ... */ }

  resStatusCode(code: number): RequestResponse { this.res.statusCode = code; return this; }
  resSetHeader(key: HttpHeaders | string, value: string | string[]): RequestResponse { this.res.setHeader(key.toLowerCase(), value); return this; }
  resWrite(chunk: string | Buffer | any): RequestResponse { /* ... */ return this; }
  resWriteJson(chunk: any): RequestResponse { /* ... */ return this; }
  async resEnd(chunk?: string | Buffer): Promise<void> { /* ... */ }
  resIsDone(): boolean { return this.res.finished || this.res.writableEnded || this.res.headersSent; }
}
```

## 1.3. HTTP 요청/응답 흐름 제어

`SimpleBootHttpServer`는 `request` 이벤트 리스너 내에서 `RequestResponse` 객체를 생성하고, 이 객체를 통해 요청의 생명주기를 관리합니다. 이 흐름은 다음과 같은 주요 단계로 구성됩니다.

1.  **`RequestResponse` 인스턴스 생성:** 클라이언트로부터 요청이 들어올 때마다 새로운 `RequestResponse` 객체가 생성됩니다.
2.  **기본 헤더 설정:** `Server` 헤더와 같은 기본 응답 헤더가 설정됩니다.
3.  **세션 쿠키 확인:** 세션 관리 시스템을 통해 세션 ID 쿠키를 확인하고, 없으면 새로 생성하여 `Set-Cookie` 헤더에 추가합니다.
4.  **요청 엔드포인트 실행:** `HttpServerOption`에 등록된 `requestEndPoints`가 있다면, 요청 처리 시작 시점에 실행됩니다.
5.  **필터 체인 실행:** `HttpServerOption`에 등록된 `filters`가 순서대로 실행됩니다. 각 필터의 `proceedBefore` 메소드가 `true`를 반환해야 다음 필터 또는 라우트 핸들러로 요청이 전달됩니다.
6.  **라우팅 및 핸들러 실행:** `SimpleApplication`의 `routing` 메소드를 통해 요청 URL에 매칭되는 라우트 핸들러(메소드)가 실행됩니다. 이때 `RequestResponse` 객체와 요청 바디, 헤더 등 필요한 데이터가 핸들러의 인자로 주입됩니다.
7.  **응답 작성:** 라우트 핸들러의 반환 값과 `MappingConfig`에 따라 응답 상태 코드, 헤더, 바디가 구성됩니다.
8.  **필터 체인 역순 실행:** `filters`의 `proceedAfter` 메소드가 역순으로 실행됩니다.
9.  **응답 종료:** `res.end()`를 호출하여 클라이언트에게 응답을 전송하고 HTTP 트랜잭션을 종료합니다.
10. **종료 엔드포인트 실행:** `closeEndPoints`와 `errorEndPoints`는 응답이 종료되거나 에러가 발생했을 때 실행됩니다.

### 예제: `SimpleBootHttpServer`와 `RequestResponse` 사용

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes, HttpHeaders, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';
import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';

// 1. 요청 엔드포인트: 요청 시작 시 로깅
@Sim
class RequestLoggerEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] RequestLoggerEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log(`[EndPoint] Request received: ${rr.reqMethod()} ${rr.reqUrl()}`);
    }
}

// 2. 필터: 요청 처리 전후 로깅
@Sim
class LoggingFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) { console.log('[Filter] LoggingFilter initialized.'); }
    async proceedBefore({ rr, app, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any> }) {
        console.log(`[Filter] Before route: ${rr.reqUrl()}`);
        carrier.set('startTime', Date.now()); // 처리 시간 측정을 위해 시작 시간 저장
        return true; // 다음 필터 또는 라우트 핸들러로 진행
    }
    async proceedAfter({ rr, app, before, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any> }) {
        const startTime = carrier.get('startTime');
        console.log(`[Filter] After route: ${rr.reqUrl()} (Took ${Date.now() - startTime}ms)`);
        return true; // 응답 완료
    }
}

// 3. 라우터: 실제 요청을 처리하는 비즈니스 로직
@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        console.log('Handling / request.');
        console.log('User-Agent:', header['user-agent']);
        console.log('Path Data:', routerModule.pathData);
        rr.resSetHeader('X-Custom-Header', 'Simple-Boot-Server');
        return { message: 'Welcome to Simple Boot HTTP Server!', timestamp: new Date().toISOString() };
    }

    @Route({ path: '/hello/{name}' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    sayHello(rr: RequestResponse, routerModule: RouterModule) {
        const name = routerModule.pathData?.name || 'Guest';
        console.log(`Handling /hello/${name} request.`);
        return `Hello, ${name}!`;
    }

    @Route({ path: '/status' })
    @GET({ res: { status: HttpStatus.Ok, contentType: Mimes.ApplicationJson } })
    getStatus(rr: RequestResponse) {
        console.log('Handling /status request.');
        return { status: 'UP', uptime: process.uptime() };
    }
}

// 4. 서버 옵션 설정
const httpServerOption = new HttpServerOption({
    listen: {
        port: 3000,
        listeningListener: (server, httpServer) => {
            const address = httpServer.address();
            console.log(`Server is running on http://localhost:${(address as any).port}`);
        }
    },
    requestEndPoints: [RequestLoggerEndPoint], // 요청 시작 시 실행될 엔드포인트
    filters: [LoggingFilter],                 // 요청 처리 전후 실행될 필터
});

// 5. SimpleBootHttpServer 인스턴스 생성 및 실행
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server application started.');

/*
터미널에서 다음 명령어로 테스트:
curl http://localhost:3000/
curl http://localhost:3000/hello/World
curl http://localhost:3000/status
*/
```

이 장에서는 `SimpleBootHttpServer`의 기본적인 구조와 `RequestResponse` 객체를 통한 HTTP 트랜잭션 처리, 그리고 요청/응답 흐름 제어에 대해 알아보았습니다. 다음 장에서는 선언적인 라우팅과 HTTP 메소드 매핑에 대해 더 깊이 탐구하겠습니다.
