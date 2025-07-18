# SIMPLE-BOOT-HTTP-SERVER

### A lightweight and powerful HTTP web server framework for Node.js.
![typescript](https://img.shields.io/badge/-typescript-black?logo=typescript) [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-http-server) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)

- **Declarative Routing**: Use decorators (`@Router`, `@Route`) to map URLs to classes and methods.
- **HTTP Method Mapping**: Decorators for all standard HTTP methods (`@GET`, `@POST`, `@PUT`, `@DELETE`, etc.).
- **Request/Response Handling**: A unified `RequestResponse` object to manage the HTTP transaction.
- **Middleware/Filters**: Intercept requests and responses for cross-cutting concerns like logging, authentication, or CORS.
- **Endpoints**: Define logic to be executed at different stages of the request lifecycle (e.g., on request start, close, or error).
- **Global Exception Handling**: Centralized error handling using `@Sim` advice classes.
- **Session Management**: Built-in session management with customizable storage providers.
- **HTTPS and HTTP/2 Support**: Configure the server to run over HTTPS.

### Dependencies

- **simple-boot**: The core dependency injection and application framework.

## 🚀 Quick Start

```shell
npm init -y
npm install @dooboostore/simple-boot @dooboostore/simple-boot-http-server reflect-metadata
tsc --init --experimentalDecorators --emitDecoratorMetadata
```

```typescript
// index.ts
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';

@Sim
@Router({ path: '' })
export class AppRouter {
    @Route({ path: '/' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        console.log('Request from:', header['user-agent']);
        return { message: 'Welcome to Simple Boot HTTP Server!' };
    }
}

const httpServerOption = new HttpServerOption({
    listen: {
        port: 3000,
        listeningListener: (server, httpServer) => {
            const address = httpServer.address();
            console.log(`Server is running on http://localhost:${address.port}`);
        }
    }
});

const app = new SimpleBootHttpServer(httpServerOption);
app.run();
```

```shell
# Run the server
npx ts-node index.ts
# Server is running on http://localhost:3000

# In another terminal
curl http://localhost:3000
# {"message":"Welcome to Simple Boot HTTP Server!"}
```

# 😃 Examples

- [More examples](./examples)

## URL & Method Mapping

Simple Boot provides decorators for all standard HTTP methods to map incoming requests to your class methods. These are combined with `@Route` from `@dooboostore/simple-boot` to define endpoints.

### Available Method Decorators

-   `@GET`
-   `@POST`
-   `@PUT`
-   `@DELETE`
-   `@PATCH`
-   `@OPTIONS`
-   `@HEAD`
-   `@TRACE`
-   `@CONNECT`
-   `@UrlMapping`: A generic decorator where you can specify the method as a string.

### Example Usage

```typescript
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import {
    GET, POST, PUT, DELETE,
    Mimes,
    RequestResponse,
    ReqJsonBody
} from '@dooboostore/simple-boot-http-server';

@Sim
@Router({ path: '/api/items' })
export class ItemApi {

    @Route({ path: '' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getAllItems() {
        // Logic to get all items
        return [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    }

    @Route({ path: '/{id}' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getItemById(routerModule: RouterModule) {
        const itemId = routerModule.pathData?.id;
        // Logic to get item by ID
        return { id: itemId, name: `Item ${itemId}` };
    }

    @Route({ path: '' })
    @POST({
        req: { contentType: [Mimes.ApplicationJson] },
        res: { status: 201, contentType: Mimes.ApplicationJson }
    })
    createItem(body: ReqJsonBody) {
        console.log('Creating new item:', body);
        // Logic to create a new item
        return { success: true, id: 3, ...body };
    }

    @Route({ path: '/{id}' })
    @PUT({ req: { contentType: [Mimes.ApplicationJson] } })
    updateItem(routerModule: RouterModule, body: ReqJsonBody) {
        const itemId = routerModule.pathData?.id;
        console.log(`Updating item ${itemId}:`, body);
        // Logic to update an item
        return { success: true, id: itemId, ...body };
    }

    @Route({ path: '/{id}' })
    @DELETE({ res: { status: 204 } })
    deleteItem(routerModule: RouterModule) {
        const itemId = routerModule.pathData?.id;
        console.log(`Deleting item ${itemId}`);
        // Logic to delete an item
        // No content returned for 204
    }
}
```

### Decorator Options

The method decorators accept a `MappingConfig` object to control request and response properties.

```typescript
export type MappingConfig = {
    method: HttpMethod | string;
    description?: { name?: string; detail?: string; };
    req?: {
        contentType?: (Mimes | string)[];
        accept?: (Mimes | string)[];
    };
    res?: {
        status?: number;
        header?: { [key: string]: string };
        contentType?: Mimes | string;
    }
    resolver?: Resolver | ConstructorType<Resolver>;
}
```

## Filters

Filters allow you to intercept the request-response cycle. The `before` method runs before the route handler, and `after` runs after. Returning `false` from `before` will stop the chain.

```typescript
import { Filter, RequestResponse, SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server';

export class LoggingFilter implements Filter {
    async before(rr: RequestResponse, app: SimpleBootHttpServer): Promise<boolean> {
        console.log(`[${new Date().toISOString()}] Received ${rr.reqMethod()} request for ${rr.reqUrl}`);
        return true; // Continue the chain
    }

    async after(rr: RequestResponse, app: SimpleBootHttpServer, sw: boolean): Promise<boolean> {
        console.log(`Request finished with status ${rr.resStatusCode()}`);
        return true;
    }
}

// In HttpServerOption
const option = new HttpServerOption({
    filters: [LoggingFilter]
});
```

## Global Advice & Exception Handling

Define global exception handlers in an `Advice` class. This class is managed by `@Sim` and can catch errors thrown from anywhere in the application.

```typescript
import { Sim, ExceptionHandler } from '@dooboostore/simple-boot';
import { RequestResponse, NotFoundError } from '@dooboostore/simple-boot-http-server';

@Sim
export class GlobalErrorHandler {
    @ExceptionHandler({ type: NotFoundError })
    handleNotFound(rr: RequestResponse, e: NotFoundError) {
        rr.resStatusCode(404).resSetHeader('X-Error-Message', 'Resource not found');
        console.error(`Not found error for URL: ${rr.reqUrl}`, e);
    }

    @ExceptionHandler()
    handleAll(rr: RequestResponse, e: any) {
        console.error('An unexpected error occurred:', e);
        // Avoid sending detailed error in production
        rr.resStatusCode(500).resWriteJson({ error: 'Internal Server Error' });
    }
}

// In HttpServerOption
const option = new HttpServerOption({
    globalAdvice: GlobalErrorHandler,
    noSuchRouteEndPointMappingThrow: (rr) => new NotFoundError({ message: `No route for ${rr.reqUrl}` }),
});
```

## Endpoints

Endpoints are hooks that run at specific points in the request lifecycle.

- **`requestEndPoints`**: Run as soon as a request is received.
- **`closeEndPoints`**: Run when the client connection is closed.
- **`errorEndPoints`**: Run if an error occurs on the response stream.

```typescript
import { EndPoint, RequestResponse, SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server';

@Sim
class ConnectionLogger implements EndPoint {
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log(`Connection closed for ${rr.reqRemoteAddress}`);
    }
}

// In HttpServerOption
const option = new HttpServerOption({
    closeEndPoints: [ConnectionLogger]
});
```

## Session Management

The server has built-in session management. It automatically creates a session ID cookie and provides a `SessionManager` to store and retrieve session data.

```typescript
import { RequestResponse } from '@dooboostore/simple-boot-http-server';

// In a route handler
async function handleSession(rr: RequestResponse) {
    const session = await rr.reqSession();

    let visitCount = session.visitCount || 0;
    visitCount++;
    session.visitCount = visitCount;

    return { message: `You have visited ${visitCount} times.` };
}
```
