# @dooboostore/simple-boot-http-server

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

`@dooboostore/simple-boot-http-server` is a lightweight, high-performance HTTP web server framework for Node.js, built on top of `@dooboostore/simple-boot`. It provides a decorator-driven, declarative programming model that allows you to design complex backend architectures intuitively and robustly.

---

## 🚀 Key Features

- **Declarative Routing**: Map URL paths and HTTP methods directly to your controller methods using decorators like `@Router`, `@Route`, `@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`.
- **Dependency Injection (DI)**: Manage dependencies between services automatically using the `@Sim` decorator — the exact same DI/AOP container as `@dooboostore/simple-boot`.
- **Middleware & Filters**: Systematically separate pre/post-processing logic (CORS, caching, auth, logging, OpenAPI generation, etc.) through the `Filter` interface.
- **Powerful Exception Handling**: Leverage AOP-based `GlobalAdvice` to isolate business logic from error handling logic.
- **Manual Response Streaming**: Opt out of the automatic response pipeline with `res: { manual: true }` to stream Server-Sent Events, NDJSON, or any long-lived response directly from the injected `ServerResponse`.
- **Real-time WebSocket Protocol**: A topic-based pub/sub protocol over a single socket — subscribe/unsubscribe, request/response, *and* server-initiated events the server can `await` a client reply for — with automatic reconnection and re-subscription.
- **Binary File Transfer over WebSocket**: `Buffer`/`File` values anywhere in a message are detected automatically and shipped as raw bytes in a compact binary frame (length header + JSON metadata + concatenated buffers) instead of being bloated with base64 — no separate upload endpoint needed.
- **Resource Resolvers**: Provides `ResourceResolver` for serving static files and templates effortlessly.

---

## 📦 Installation

```bash
pnpm add @dooboostore/simple-boot-http-server reflect-metadata
```

---

## 💻 Usage Example

### 1. Define a Service (Dependency Injection)
Create a service that contains business logic using `@Sim`.

```typescript
import { Sim } from '@dooboostore/simple-boot';

@Sim
export class UserService {
  private users = [{ id: 1, name: 'Dooboo' }];

  getAllUsers() {
    return this.users;
  }
}
```

### 2. Configure Router and Controller
Define endpoints using decorators. Inject services through the constructor.

```typescript
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { GET, POST } from '@dooboostore/simple-boot-http-server';

@Sim
@Router({ path: '/api' })
export class ApiRouter {
  constructor(private userService: UserService) {}

  @Route({ path: '/users' })
  @GET({ res: { contentType: 'application/json' } })
  getUsers() {
    return this.userService.getAllUsers();
  }
}
```

### 3. Run the Server
Configure `HttpServerOption` and launch the server.

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption } from '@dooboostore/simple-boot-http-server';

const option = new HttpServerOption(
  { listen: { port: 8080 } },
  { rootRouter: ApiRouter }
);

const server = new SimpleBootHttpServer(option).run();
console.log('🚀 Server running at http://localhost:8080');
```

---

## 🛠️ Advanced Features

### Filters
Implement the `Filter` interface to perform common request processing. A filter has two hooks: `proceedBefore` runs before the route handler (return `false` to stop the chain right there), and `proceedAfter` runs after it (receives `before`, the boolean `proceedBefore` returned).

```typescript
import { Sim } from '@dooboostore/simple-boot';
import { Filter, RequestResponse, SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server';

@Sim
export class MyAuthFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) {}

    async proceedBefore({ rr }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, any> }): Promise<boolean> {
        // Returning false stops the request from proceeding to the next filter/route handler.
        return true;
    }

    async proceedAfter({ rr, before }: { rr: RequestResponse; app: SimpleBootHttpServer; before: boolean; carrier: Map<string, any> }): Promise<boolean> {
        return true;
    }
}
```

### Manual Response Streaming (SSE / NDJSON)
By default, a route's return value is automatically serialized and written as a single response. Set `res: { manual: true }` to skip that entirely and take direct control of the injected `ServerResponse` — the request handler's promise simply stays pending until you're done, so nothing else writes to the response underneath you.

```typescript
import { ServerResponse } from 'http';
import { Route } from '@dooboostore/simple-boot';
import { GET } from '@dooboostore/simple-boot-http-server';

@Route({ path: '/stream/time' })
@GET({ res: { manual: true } }) // status/header/body auto-write is skipped
streamTime(res: ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });

  return new Promise<void>(resolve => {
    const timer = setInterval(() => {
      res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    }, 1000);
    res.on('close', () => { clearInterval(timer); resolve(); }); // clean up when the client disconnects
  });
}
```

`res: { manual: true }` is a discriminated union with the normal `{ status, header, contentType }` shape, so TypeScript won't let you accidentally combine them — a route is either auto-written or fully manual.

### WebSocket: Topic Protocol + Binary File Transfer
Register `WebSocketManager` as a `webSocketEndPoints` entry to get a topic-based pub/sub protocol over a single connection — subscribe/unsubscribe, request/response, and **server-initiated events the server can `await` a client reply for**.

```typescript
import { WebSocketManager } from '@dooboostore/simple-boot-http-server/websocket/WebSocketManager';

const option = new HttpServerOption({
  webSocketEndPoints: [WebSocketManager],
  listen: { port: 8080 }
}, { rootRouter: AppRouter });
```

Any `@Sim({ symbol })`-tagged service's public methods become callable by name over the socket via an intent target (`Symbol.for(ClassName)://methodName`) — no extra decorator needed:

```typescript
@Sim({ symbol: Symbol.for('UserService') })
export class UserService {
  say(message: any) {
    return { echo: message };
  }
}
```

`WebSocketClient` (the browser-side counterpart) ships as its own standalone UMD bundle at `dist/umd-bundle/websocket-client.umd.js` — it's *not* resolvable through the package's `exports` map, it's meant to be loaded with a plain `<script>` tag:

```html
<script src="./node_modules/@dooboostore/simple-boot-http-server/dist/umd-bundle/websocket-client.umd.js"></script>
<script>
  const { WebSocketClient } = dooboostoreSimpleBootHttpServerWebSocketClient;
  const ws = new WebSocketClient('http://localhost:8080', { retryConnectionCount: Infinity, retryConnectionDelay: 1000 });

  const subject = ws.subject('Symbol.for(UserService)://say', { type: 'intent' });
  subject.observable.subscribe({ next: data => console.log('received:', data) });
  subject.send({ hello: 'world' });

  // subject.observable.subscribe(...) returns a *local* RxJS-style subscription —
  // unsubscribing it only stops local delivery. To actually tell the server to
  // drop the topic, call the outer object's own unsubscribe:
  subject.unsubscribe();
</script>
```

Drop a `Buffer` (Node) or `File`/`Blob` (browser) anywhere inside a message body and it's detected automatically and shipped as raw bytes in a compact binary frame (4-byte length header + JSON metadata with `$file` references + concatenated buffers) instead of being base64-inflated inside JSON — reconstructed transparently as a real `File`/`{name, mime, size, buffer}` on the other side:

```typescript
say(message: any) {
  const buffer = Buffer.from('hello binary world', 'utf8');
  return { echo: message, file: { name: 'greeting.txt', mime: 'text/plain', buffer } };
}
```

See the [WebSocket Detailed Guide](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server/document/websocket) for the full wire protocol.

---

## 📖 Learn More
Check out the detailed guides and tutorials in the `document` folder.
- [WebSocket Detailed Guide](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server/document/websocket)
- [Project Template Generator](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server/create)

---

## License
[MIT License](LICENSE.md)
