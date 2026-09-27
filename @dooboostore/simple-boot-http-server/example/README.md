# Simple Boot HTTP Server Example

A complete example demonstrating the features of `@dooboostore/simple-boot-http-server` - a powerful HTTP server framework built on Simple Boot.

## Features

- 🎯 **Router-based Architecture** - `@Router` and `@Route` decorators
- 📦 **Dependency Injection** - `@Sim` decorator for service management
- 🔌 **HTTP Method Decorators** - `@GET`, `@POST`, `@PUT`, `@DELETE`
- 📁 **Static File Serving** - Serve files from resources directory
- ⚡ **Request/Response Abstraction** - Easy-to-use API
- 🛠️ **Built-in JSON Parsing** - Automatic content-type handling
- 🧯 **Global Exception Handling** - `GlobalAdvice` with `@ExceptionHandler`
- 🪵 **End Points** - request / close / error logging end points
- 🔌 **WebSocket** - `WebSocketManager` topic protocol; `UserService` (`@Sim({ symbol: Symbol.for('UserService') })`) is callable over the socket

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development Mode

Run `webpack --watch`; nodemon restarts `dist/index.cjs` on each rebuild:

```bash
pnpm dev
```

### Build and Run

Build the project and run the compiled output:

```bash
pnpm start
```

Server will start on **http://localhost:8080**

## Project Structure

```
example/
├── package.json
├── tsconfig.json
├── webpack.config.cjs          # webpack (ts-loader) + nodemon-webpack-plugin
├── websocket-client.html       # Browser WebSocket demo (calls Symbol.for(UserService)://say)
└── src/
    ├── index.ts                # Server entry point (HttpServerOption, rootRouter: AppRouter)
    ├── advices/
    │   └── GlobalAdvice.ts     # @ExceptionHandler global error handling
    ├── endpoints/
    │   ├── RequestLogEndPoint.ts
    │   ├── CloseLogEndPoint.ts
    │   └── ErrorLogEndPoint.ts
    ├── routers/
    │   ├── AppRouter.ts        # Main page router (routers: [ApiRouter])
    │   └── ApiRouter.ts        # API endpoints
    ├── services/
    │   ├── index.ts
    │   └── UserService.ts      # User management service
    └── resources/
        └── index.css           # Static CSS file
```

## API Endpoints

### Main Routes (AppRouter)

- **GET /**  
  Home page with interactive API testing UI

- **GET /resources/index.css**  
  Static file served through `@GET({ resolver: ResourceResolver })`

### API Routes (ApiRouter)

- **GET /api/hello**  
  Simple hello world JSON response
  
- **GET /api/users**  
  Get list of all users
  
- **POST /api/users**  
  Create a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
  
- **GET /api/time**  
  Get current server time with timezone info

- **GET /api/users/find?id=1**  
  Find a single user by id

- **PUT /api/users**  
  Update an existing user
  ```json
  {
    "id": 1,
    "name": "Alice Updated"
  }
  ```

- **DELETE /api/users?id=1**  
  Delete a user

- **GET /api/stream/time**  
  Server-Sent Events endpoint — pushes the current time every second. Demonstrates `res: 'manual'`,
  which tells the framework to skip its automatic status/header/body write so the handler can control the
  injected `ServerResponse` directly (`res.writeHead` + repeated `res.write`).

## Example Code

### Creating a Router

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';

@Sim
@Router({ path: '/api' })
export class ApiRouter {
  @Route({ path: '/hello' })
  @GET({ res: { contentType: 'application/json' } })
  hello(rr: RequestResponse) {
    // The return value becomes the response body (objects are JSON.stringify'd automatically)
    return { message: 'Hello!' };
  }
}
```

### Streaming a Response Manually (SSE)

```typescript
import { ServerResponse } from 'http';

@Route({ path: '/stream/time' })
@GET({ res: 'manual' }) // Skip automatic status/header/body handling
streamTime(res: ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });

  return new Promise<void>(resolve => {
    const timer = setInterval(() => {
      res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    }, 1000);
    res.on('close', () => { clearInterval(timer); resolve(); }); // Clean up when the client disconnects
  });
}
```

### Using Dependency Injection

```typescript
@Sim({
  using: [UserService]
})
@Router({ path: '/api' })
export class ApiRouter {
  constructor(private userService: UserService) {}
  
  @Route({ path: '/users' })
  @GET({ res: { contentType: 'application/json' } })
  getUsers(rr: RequestResponse) {
    return this.userService.getAllUsers();
  }
}
```

## Technologies Used

- **@dooboostore/simple-boot-http-server** - HTTP server framework
- **@dooboostore/simple-boot** - DI container & routing
- **@dooboostore/core** - Core utilities
- **webpack** - Bundler
- **TypeScript** - Type safety
- **Node.js** - Runtime environment

## License

MIT
