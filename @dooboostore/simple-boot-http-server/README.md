# @dooboostore/simple-boot-http-server

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-http-server.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

`@dooboostore/simple-boot-http-server` is a lightweight, high-performance HTTP web server framework for Node.js, built on top of `@dooboostore/simple-boot`. It provides a decorator-driven, declarative programming model that allows you to design complex backend architectures intuitively and robustly.

---

## 🚀 Key Features

- **Declarative Routing**: Map URL paths and HTTP methods directly to your controller methods using decorators like `@Router`, `@Route`, `@GET`, and `@POST`.
- **Dependency Injection (DI)**: Manage dependencies between services automatically using the `@Sim` decorator.
- **Middleware & Filters**: Systematically separate pre/post-processing logic (CORS, authentication, logging, etc.) through the `Filter` interface.
- **Powerful Exception Handling**: Leverage AOP-based `GlobalAdvice` to isolate business logic from error handling logic.
- **WebSocket Integration**: Includes a topic-based publish/subscribe model and automatic reconnection features.
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
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

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
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET, POST } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';

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
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { HttpServerOption } from '@dooboostore/simple-boot-http-server/option/HttpServerOption';

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
Implement the `Filter` interface to perform common request processing.

```typescript
@Sim
export class MyAuthFilter implements Filter {
    async onHandle(rr: RequestResponse): Promise<boolean> {
        // Returning false stops the request execution.
        return true; 
    }
}
```

---

## 📖 Learn More
Check out the detailed guides and tutorials in the `document` folder.
- [WebSocket Detailed Guide](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server/document/websocket)
- [Project Template Generator](https://github.com/dooboostore-develop/packages/tree/main/simple-boot-http-server/create)

---

## License
[MIT License](LICENSE.md)
