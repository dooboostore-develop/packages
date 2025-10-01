# Simple Boot HTTP Server Example

A complete example demonstrating the features of `@dooboostore/simple-boot-http-server` - a powerful HTTP server framework built on Simple Boot.

## Features

- 🎯 **Router-based Architecture** - `@Router` and `@Route` decorators
- 📦 **Dependency Injection** - `@Sim` decorator for service management
- 🔌 **HTTP Method Decorators** - `@GET`, `@POST`, `@PUT`, `@DELETE`
- 📁 **Static File Serving** - Serve files from resources directory
- ⚡ **Request/Response Abstraction** - Easy-to-use API
- 🛠️ **Built-in JSON Parsing** - Automatic content-type handling

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development Mode

Run with auto-reload on file changes:

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
├── build.mjs           # esbuild configuration
└── src/
    ├── index.ts        # Server entry point
    ├── routers/
    │   ├── AppRouter.ts   # Main page router
    │   └── ApiRouter.ts   # API endpoints
    ├── services/
    │   └── UserService.ts # User management service
    └── resources/
        └── index.css      # Static CSS file
```

## API Endpoints

### Main Routes (AppRouter)

- **GET /**  
  Home page with interactive API testing UI

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

## Example Code

### Creating a Router

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET, POST } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';

@Sim
@Router({ path: '/api' })
export class ApiRouter {
  @Route({ path: '/hello' })
  @GET
  hello(rr: RequestResponse) {
    rr.resSetHeader('Content-Type', 'application/json');
    rr.res.write(JSON.stringify({ message: 'Hello!' }));
    rr.res.end();
  }
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
  @GET
  getUsers(rr: RequestResponse) {
    const users = this.userService.getAllUsers();
    // ... return users
  }
}
```

## Technologies Used

- **@dooboostore/simple-boot-http-server** - HTTP server framework
- **@dooboostore/simple-boot** - DI container & routing
- **@dooboostore/core** - Core utilities
- **esbuild** - Fast bundler
- **TypeScript** - Type safety
- **Node.js** - Runtime environment

## License

MIT
