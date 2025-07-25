# Chapter 3: Intercepting Requests/Responses - Filters and Endpoints

In web server applications, besides the core business logic, various cross-cutting concerns such as logging, authentication, CORS handling, and caching need to be addressed. `Simple-Boot-HTTP-Server` provides a filter and endpoint system to efficiently manage these cross-cutting concerns. This chapter explores the design and implementation of these two mechanisms.

## 3.1. The Filter System: Pre- and Post-Request Processing Logic

Filters intercept the request-response lifecycle to execute specific logic before a client's request reaches the route handler (`proceedBefore`) and after the handler has generated a response (`proceedAfter`). This is similar to middleware, but in `Simple-Boot-HTTP-Server`, it is used in a more structured way with the management of the DI container.

-   **`Filter` Interface:** Defines the `proceedBefore` and `proceedAfter` methods. `proceedBefore` must return `true` for the request to proceed to the next filter or route handler. If it returns `false`, the chain is interrupted, and the response is sent immediately.

### Implementation Principle

The filters registered in the `filters` array of `HttpServerOption` are executed in order within the `request` event listener of `SimpleBootHttpServer`. The `proceedBefore` methods are executed in the order they are registered, and the `proceedAfter` methods are executed in reverse order.

```typescript
// SimpleBootHttpServer.ts (Conceptual - Filter chain execution part)
// ...
// Execute proceedBefore
for (let i = 0; this.option.filters && i < this.option.filters.length; i++) {
    const filterInstance = (typeof this.option.filters[i] === 'function' ? this.simstanceManager.getOrNewSim({target:this.option.filters[i]}) : this.option.filters[i]) as Filter;
    let proceed = true;
    if (filterInstance?.proceedBefore) {
        proceed = await filterInstance.proceedBefore({rr, app: this, carrier: filter.carrier});
        filter.filters.push({filter: filterInstance, proceed}); // Save state for proceedAfter
    }
    if (!proceed) { // If proceedBefore returns false, break the chain
        break;
    }
}

// ... Execute route handler ...

// Execute proceedAfter (in reverse order)
for (const it of filter.filters.reverse()) {
    if (it.filter?.proceedAfter) {
        await it.filter.proceedAfter({rr, app: this, before: it.proceed, carrier: filter.carrier});
    }
}
// ...
```

### Example: Using Filters

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { Filter } from '@dooboostore/simple-boot-http-server/filters/Filter';
import { HttpStatus } from '@dooboostore/simple-boot-http-server/codes/HttpStatus';

// 1. Auth Filter: Authenticates requests for a specific path
@Sim
class AuthFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) { console.log('[Filter] AuthFilter initialized.'); }
    async proceedBefore({ rr, app, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any> }) {
        console.log(`[AuthFilter] Checking authentication for ${rr.reqUrl()}`);
        if (rr.reqUrl() === '/admin' && rr.reqHeader('authorization') !== 'Bearer my-secret-token') {
            rr.resStatusCode(HttpStatus.Unauthorized).resWrite('Unauthorized').resEnd();
            return false; // Interrupt the request chain
        }
        return true; // Proceed to the next
    }
    async proceedAfter({ rr, app, before, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any> }) {
        console.log(`[AuthFilter] Authentication check finished for ${rr.reqUrl()}`);
        return true;
    }
}

// 2. CORS Filter: Adds CORS headers to all requests
@Sim
class CorsFilter implements Filter {
    async onInit(app: SimpleBootHttpServer) { console.log('[Filter] CorsFilter initialized.'); }
    async proceedBefore({ rr, app, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any> }) {
        rr.resSetHeader('Access-Control-Allow-Origin', '*');
        rr.resSetHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        rr.resSetHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (rr.reqMethod() === 'OPTIONS') {
            rr.resStatusCode(HttpStatus.NoContent).resEnd(); // Respond immediately to OPTIONS requests
            return false; // Interrupt the request chain
        }
        return true;
    }
    async proceedAfter({ rr, app, before, carrier }: { rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any> }) {
        return true;
    }
}

// 3. Router
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

// 4. Server Option Configuration
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    filters: [CorsFilter, AuthFilter], // Register filters (order matters: Cors should run first)
});

// 5. Create and run the SimpleBootHttpServer instance
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Filters example started.');

/*
Test with the following commands in the terminal:

# CORS Test (OPTIONS request)
curl -X OPTIONS -H "Origin: http://example.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" http://localhost:3000/

# Authentication Success
curl -H "Authorization: Bearer my-secret-token" http://localhost:3000/admin

# Authentication Failure
curl http://localhost:3000/admin
*/
```

## 3.2. Endpoints: Request Lifecycle Hooks

Endpoints are similar to filters in that they execute logic at specific points in the request lifecycle, but they are primarily used to react to global events such as the start of a request, its termination, or the occurrence of an error.

-   **`EndPoint` Interface:** Defines the `endPoint` method. It can also include an `onInit` method to perform initialization logic.

### Implementation Principle

`HttpServerOption` has three types of endpoint arrays: `requestEndPoints`, `closeEndPoints`, and `errorEndPoints`. `SimpleBootHttpServer` registers listeners for the `request`, `close`, and `error` events of the HTTP request and calls the `endPoint` method of the registered endpoints when these events occur.

```typescript
// SimpleBootHttpServer.ts (Conceptual - Endpoint execution part)
// ...
this.server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
    const rr = new RequestResponse(req, res, {sessionManager: this.sessionManager, option: this.option});

    // Execute requestEndPoints
    if (this.option.requestEndPoints) {
        for (const it of this.option.requestEndPoints) {
            const endPointInstance = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it) as EndPoint;
            await endPointInstance?.endPoint(rr, this);
        }
    }

    res.on('close', async () => {
        // Execute closeEndPoints
        if (this.option.closeEndPoints) { /* ... */ }
    });

    res.on('error', async () => {
        // Execute errorEndPoints
        if (this.option.errorEndPoints) { /* ... */ }
    });
    // ...
});
```

### Example: Using Endpoints

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';

// 1. Request Start Endpoint: Assigns a request ID and logs
@Sim
class RequestIdEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] RequestIdEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        const requestId = Math.random().toString(36).substring(2, 15); // Simple request ID generation
        rr.resSetHeader('X-Request-ID', requestId);
        console.log(`[EndPoint] Request ID: ${requestId} for ${rr.reqUrl()}`);
    }
}

// 2. Connection Close Endpoint: Logs connection time
@Sim
class ConnectionCloseLoggerEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] ConnectionCloseLoggerEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log(`[EndPoint] Connection closed for ${rr.reqUrl()} (Request ID: ${rr.resHeader('X-Request-ID')})`);
    }
}

// 3. Error Endpoint: Logs response stream errors
@Sim
class ErrorLoggerEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) { console.log('[EndPoint] ErrorLoggerEndPoint initialized.'); }
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.error(`[EndPoint] Error occurred on response stream for ${rr.reqUrl()} (Request ID: ${rr.resHeader('X-Request-ID')})`);
    }
}

// 4. Router
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
        // Intentionally cause an error on the response stream (in a real environment, this could be caused by network issues, etc.)
        rr.res.write('Partial data...');
        rr.res.destroy(new Error('Simulated stream error')); // Forcefully close the stream and cause an error
        return 'This will not be sent.';
    }
}

// 5. Server Option Configuration
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    requestEndPoints: [RequestIdEndPoint],         // At the start of a request
    closeEndPoints: [ConnectionCloseLoggerEndPoint], // When the connection is closed
    errorEndPoints: [ErrorLoggerEndPoint],         // On response stream error
});

// 6. Create and run the SimpleBootHttpServer instance
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Endpoints example started.');

/*
Test with the following commands in the terminal:
curl http://localhost:3000/
curl http://localhost:3000/error-test
*/
```

## 3.3. Global Exception Handling and Advice

`Simple-Boot-HTTP-Server` utilizes the powerful exception handling system of `simple-boot-core` to centrally manage all exceptions that occur during HTTP request processing. This is implemented through the `globalAdvice` option of `HttpServerOption` and the `@ExceptionHandler` decorator.

-   **`globalAdvice`:** A class registered in `HttpServerOption` acts as a global exception handler. This class is registered with `@Sim` and is managed by the DI container.
-   **`@ExceptionHandler`:** Applied to a method within the `globalAdvice` class to handle a specific type of exception. It can receive the exception object (`Error`) and the `RequestResponse` object as arguments.

### Implementation Principle

The `request` event listener of `SimpleBootHttpServer` wraps the entire request processing logic in a `try-catch` block. When an exception occurs, `SimstanceManager` from `simple-boot-core` is used to find and execute the `@ExceptionHandler` method in the class registered with `globalAdvice` that matches the exception type. This handler can send an appropriate HTTP response (e.g., `500 Internal Server Error`, `404 Not Found`) to the client through the `RequestResponse` object.

```typescript
// SimpleBootHttpServer.ts (Conceptual - Exception handling part)
// ...
try {
    // ... Request processing and route handler execution ...
} catch (e) {
    // 1. Set HTTP error status code (if it's an HttpError type)
    rr.resStatusCode(e instanceof HttpError ? e.status : HttpStatus.InternalServerError);

    // 2. Execute the exception handler registered in globalAdvice
    const globalAdviceInstance = this.simstanceManager.getOrNewSim(this.option.globalAdvice); // Get instance from DI container
    if (globalAdviceInstance) {
        const exceptionHandlerMethod = targetExceptionHandler(globalAdviceInstance, e); // Find the handler method for the exception type
        if (exceptionHandlerMethod) {
            // Execute the handler method (inject exception object, RequestResponse object, etc.)
            await this.simstanceManager.executeBindParameterSimPromise({
                target: globalAdviceInstance,
                targetKey: exceptionHandlerMethod.propertyKey
            }, otherStorage); // otherStorage contains the exception object and RequestResponse object
        }
    }
} finally {
    // ... End response ...
}
```

### Example: Global Exception Handling and Advice

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, ExceptionHandler } from '@dooboostore/simple-boot';
import { NotFoundError, HttpError } from '@dooboostore/simple-boot-http-server/errors';

// 1. Advice class for global exception handling
@Sim
class GlobalErrorHandlerAdvice {
    // Handle NotFoundError (404)
    @ExceptionHandler({ type: NotFoundError })
    handleNotFoundError(rr: RequestResponse, error: NotFoundError) {
        console.error(`[GlobalAdvice] Caught NotFoundError: ${error.message}`);
        rr.resStatusCode(HttpStatus.NotFound).resWriteJson({ error: 'Not Found', message: error.message }).resEnd();
    }

    // Handle all other HttpErrors
    @ExceptionHandler({ type: HttpError })
    handleHttpError(rr: RequestResponse, error: HttpError) {
        console.error(`[GlobalAdvice] Caught HttpError: ${error.message} (Status: ${error.status})`);
        rr.resStatusCode(error.status).resWriteJson({ error: 'HTTP Error', message: error.message }).resEnd();
    }

    // Handle all other unexpected exceptions (most general handler)
    @ExceptionHandler()
    handleAllOtherErrors(rr: RequestResponse, error: any) {
        console.error(`[GlobalAdvice] Caught unexpected error:`, error);
        rr.resStatusCode(HttpStatus.InternalServerError).resWriteJson({ error: 'Internal Server Error', message: 'An unexpected error occurred.' }).resEnd();
    }
}

// 2. Router
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
        throw new Error('Something went wrong on the server!'); // General Error
    }

    @Route({ path: '/trigger-custom-http-error' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    triggerCustomHttpError() {
        // Custom HTTP error (e.g., 403 Forbidden)
        throw new HttpError({ status: HttpStatus.Forbidden, message: 'Access Denied.' });
    }
}

// 3. Server Option Configuration
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    globalAdvice: GlobalErrorHandlerAdvice, // Register global exception handler
    // Configure to throw NotFoundError when no matching route is found
    noSuchRouteEndPointMappingThrow: (rr) => new NotFoundError({ message: `No route found for ${rr.reqUrl()}` }),
});

// 4. Create and run the SimpleBootHttpServer instance
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Global Exception Handling example started.');

/*
Test with the following commands in the terminal:
curl http://localhost:3000/
curl http://localhost:3000/trigger-404
curl http://localhost:3000/trigger-500
curl http://localhost:3000/trigger-custom-http-error
curl http://localhost:3000/non-existent-path
*/
```

Filters, endpoints, and the global exception handling system are essential tools for building robust and flexible web server applications with `Simple-Boot-HTTP-Server`. They allow developers to focus on core business logic while implementing consistent pre-processing, post-processing, and handling of exceptional situations.

The next chapter will cover the session system for managing application state and how to handle file uploads.
