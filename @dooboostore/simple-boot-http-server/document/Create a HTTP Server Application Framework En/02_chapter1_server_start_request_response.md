# Chapter 1: Server Startup and Request Handling - SimpleBootHttpServer and RequestResponse

Every web server framework begins with handling the basic HTTP transaction of accepting a client's request and returning a response. This chapter explores the role and initialization process of `SimpleBootHttpServer`, the core of `Simple-Boot-HTTP-Server`, and the `RequestResponse` object, which manages HTTP requests and responses in an integrated manner.

## 1.1. The Role and Initialization of SimpleBootHttpServer

`SimpleBootHttpServer` is responsible for creating and managing an HTTP server based on Node.js's built-in `http` or `https` modules. This class extends `SimpleApplication` from `@dooboostore/simple-boot`, allowing it to leverage the features of the core framework, such as the DI container.

-   **Server Instance Management:** It creates an `http.Server` or `https.Server` instance and listens for the `request` event to handle HTTP transactions.
-   **Option Configuration:** It manages various server-related settings, such as port, host, HTTPS configuration, filters, and endpoints, through the `HttpServerOption` object.
-   **Lifecycle Management:** When the server starts (`run`), it calls the `onInit` method of filters and endpoints to perform initialization logic.

A `SimpleBootHttpServer` instance is created with `new SimpleBootHttpServer(option)`, and the server is started by calling the `run()` method.

```typescript
// SimpleBootHttpServer.ts (Conceptual)
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { HttpServerOption } from './option/HttpServerOption';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server as HttpsServer } from 'https';

export class SimpleBootHttpServer extends SimpleApplication {
  public server?: HttpServer | HttpsServer; // Node.js HTTP/HTTPS server instance

  constructor(public option: HttpServerOption = new HttpServerOption()) {
    super(option); // Inherits from SimpleApplication
    // Initialize session manager
    this.sessionManager = new SessionManager(this.option);
  }

  public run(otherInstanceSim?: Map<ConstructorType<any>, any>) {
    const simstanceManager = super.run(otherInstanceSim); // Initialize SimpleApplication
    
    // Initialize filters and endpoints (call onInit)
    const targets = [...this.option.closeEndPoints ?? [], ...this.option.errorEndPoints ?? [], ...this.option.requestEndPoints ?? [], ...this.option.filters ?? []];
    Promise.all(targets.map(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it as ConstructorType<any>}) : it) as OnInit).map(it => it.onInit(this)))
      .then(() => {
        this.startServer(); // Start the server after all initializations are complete
      });
    return simstanceManager;
  }

  private startServer() {
    // Create HTTP or HTTPS server instance
    if (this.option.serverOption && 'key' in this.option.serverOption && 'cert' in this.option.serverOption) {
      this.server = new HttpsServer(this.option.serverOption);
    } else if (this.option.serverOption) {
      this.server = new HttpServer(this.option.serverOption);
    } else {
      this.server = new HttpServer();
    }

    // Register request event listener
    this.server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
      const rr = new RequestResponse(req, res, {sessionManager: this.sessionManager, option: this.option});
      // ... request handling logic ...
    });

    // Start listening on the server
    this.server.listen(this.option.listen.port, this.option.listen.hostname, this.option.listen.backlog, () => {
      this.option.listen.listeningListener?.(this, this.server); // Call listening callback
    });
  }
}
```

## 1.2. The RequestResponse Object: The Core of HTTP Transactions

The `RequestResponse` class wraps Node.js's `IncomingMessage` (request) and `ServerResponse` (response) objects, providing a core object that handles all tasks related to HTTP requests and responses in an integrated manner. All route handlers, filters, and endpoints access request information and construct responses through this `RequestResponse` object.

-   **Accessing Request Information:** Provides methods to easily access the request method, URL, headers, query parameters, and body data (JSON, Form URL-encoded, Multipart Form Data).
-   **Constructing Responses:** Provides methods to construct responses, including setting the status code, headers, and writing the body data (text, JSON, buffer).
-   **Session Management:** Allows access to session data through the `reqSession()` method.
-   **Chainable API:** Most response-related methods return the `RequestResponse` instance itself, enabling method chaining.

```typescript
// models/RequestResponse.ts (Conceptual)
import { IncomingMessage, ServerResponse } from 'http';
import { HttpHeaders } from '../codes/HttpHeaders';
import { Mimes } from '../codes/Mimes';

export class RequestResponse {
  protected req: IncomingMessage;
  protected res: ServerResponse;
  // ... other properties ...

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

## 1.3. Controlling the HTTP Request/Response Flow

`SimpleBootHttpServer` creates a `RequestResponse` object within the `request` event listener and manages the request's lifecycle through this object. This flow consists of the following main steps:

1.  **`RequestResponse` Instance Creation:** A new `RequestResponse` object is created for each incoming client request.
2.  **Setting Default Headers:** Default response headers, such as the `Server` header, are set.
3.  **Checking Session Cookie:** The session management system checks for a session ID cookie. If one doesn't exist, a new one is created and added to the `Set-Cookie` header.
4.  **Executing Request Endpoints:** If `requestEndPoints` are registered in `HttpServerOption`, they are executed at the start of request processing.
5.  **Executing Filter Chain:** The `filters` registered in `HttpServerOption` are executed in order. The `proceedBefore` method of each filter must return `true` for the request to be passed to the next filter or route handler.
6.  **Routing and Handler Execution:** The `routing` method of `SimpleApplication` is used to find and execute the route handler (method) that matches the request URL. The `RequestResponse` object and necessary data like the request body and headers are injected as arguments to the handler.
7.  **Constructing the Response:** The response status code, headers, and body are constructed based on the return value of the route handler and the `MappingConfig`.
8.  **Executing Filter Chain in Reverse:** The `proceedAfter` method of the `filters` is executed in reverse order.
9.  **Ending the Response:** `res.end()` is called to send the response to the client and terminate the HTTP transaction.
10. **Executing Close and Error Endpoints:** `closeEndPoints` and `errorEndPoints` are executed when the response is finished or an error occurs.

### Example: Using `SimpleBootHttpServer` and `RequestResponse`

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes, HttpHeaders, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';
import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';

// 1. Request Endpoint: Logging at the start of a request
@Sim
class RequestLoggerEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] RequestLoggerEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log(`[EndPoint] Request received: ${rr.reqMethod()} ${rr.reqUrl()}`);
    }
}

// 2. Filter: Logging before and after request processing
@Sim
class LoggingFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) { console.log('[Filter] LoggingFilter initialized.'); }
    async proceedBefore({ rr, app, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any> }) {
        console.log(`[Filter] Before route: ${rr.reqUrl()}`);
        carrier.set('startTime', Date.now()); // Store start time to measure processing time
        return true; // Proceed to the next filter or route handler
    }
    async proceedAfter({ rr, app, before, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any> }) {
        const startTime = carrier.get('startTime');
        console.log(`[Filter] After route: ${rr.reqUrl()} (Took ${Date.now() - startTime}ms)`);
        return true; // Response complete
    }
}

// 3. Router: Business logic that handles the actual requests
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

// 4. Server Option Configuration
const httpServerOption = new HttpServerOption({
    listen: {
        port: 3000,
        listeningListener: (server, httpServer) => {
            const address = httpServer.address();
            console.log(`Server is running on http://localhost:${(address as any).port}`);
        }
    },
    requestEndPoints: [RequestLoggerEndPoint], // Endpoint to execute at the start of a request
    filters: [LoggingFilter],                 // Filter to execute before and after request processing
});

// 5. Create and run the SimpleBootHttpServer instance
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server application started.');

/*
Test with the following commands in the terminal:
curl http://localhost:3000/
curl http://localhost:3000/hello/World
curl http://localhost:3000/status
*/
```

This chapter covered the basic structure of `SimpleBootHttpServer`, HTTP transaction handling through the `RequestResponse` object, and controlling the request/response flow. The next chapter will delve deeper into declarative routing and HTTP method mapping.
