# Chapter 5: The Foundation of the Framework - Integrating with Simple-Boot Core

`Simple-Boot-HTTP-Server` is tightly integrated with `Simple-Boot Core` to leverage its powerful features in the Node.js server environment. This chapter explores how `Simple-Boot-HTTP-Server` integrates and utilizes the dependency injection (DI), aspect-oriented programming (AOP), and exception handling systems of `Simple-Boot Core`.

## 5.1. Utilizing DI, AOP, and Exception Handling from Simple-Boot Core

`Simple-Boot-HTTP-Server` extends `SimpleApplication` (the main class of Simple-Boot Core). This means that a `Simple-Boot-HTTP-Server` instance is also a `SimpleApplication` instance. Therefore, all the core features provided by `Simple-Boot Core` can be used as is in the server environment.

-   **Dependency Injection (DI):**
    -   All classes defined with the `@Sim` decorator (services, controllers, etc.) are managed by the DI container (`SimstanceManager`) of `Simple-Boot-HTTP-Server`.
    -   Required dependencies can be automatically injected through constructor injection.
    -   Objects can be retrieved from the DI container through the `SimpleBootHttpServer` instance, like `app.sim(MyService)`.

-   **Aspect-Oriented Programming (AOP):**
    -   Common logic can be inserted before and after method calls using the `@Before`, `@After`, and `@Around` decorators.
    -   This is very effective for separating cross-cutting concerns such as logging, performance measurement, and authorization from business logic.

-   **Exception Handling System:**
    -   Exceptions that occur at the method or class level can be handled declaratively using the `@ExceptionHandler` decorator.
    -   A global `advice` can be registered to manage exceptions consistently across the application.

### Example: Utilizing Simple-Boot Core Features

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, Before, After, Around, ExceptionHandler, SimOption } from '@dooboostore/simple-boot';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';

// 1. Service with DI, AOP, and exception handling features
@Sim
class UserService {
    private users: { id: number; name: string }[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ];

    // AOP: Logging before method execution
    @Before({ property: 'getUserById' })
    logBeforeGetUser() {
        console.log('[AOP] Before getUserById method.');
    }

    // AOP: Logging after method execution
    @After({ property: 'getUserById' })
    logAfterGetUser() {
        console.log('[AOP] After getUserById method.');
    }

    // AOP: Using Around to modify arguments and validate return value
    @Around({
        before: (obj, prop, args) => {
            console.log(`[AOP] Around before ${String(prop)} with args:`, args);
            // If an argument is less than 0, change it to 0
            return args.map(arg => (typeof arg === 'number' && arg < 0) ? 0 : arg);
        },
        after: (obj, prop, args, result) => {
            console.log(`[AOP] Around after ${String(prop)} with result:`, result);
            if (!result) {
                throw new Error('User not found after processing!'); // Force an error
            }
            return result;
        }
    })
    getUserById(id: number) {
        console.log(`[UserService] Fetching user with ID: ${id}`);
        const user = this.users.find(u => u.id === id);
        if (!user) {
            throw new Error(`User with ID ${id} not found in DB.`);
        }
        return user;
    }

    // Exception Handling: Handling a specific error type
    @ExceptionHandler({ type: Error })
    handleAnyError(rr: RequestResponse, error: Error) {
        console.error(`[UserService] Caught error in handler: ${error.message}`);
        rr.resStatusCode(HttpStatus.InternalServerError).resWriteJson({ error: 'Server Error', message: error.message }).resEnd();
    }
}

// 2. Router: Injects and uses UserService
@Sim
@Router({ path: '' })
export class AppRouter {
    constructor(private userService: UserService) {}

    @Route({ path: '/user/{id}' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getUser(rr: RequestResponse, routerModule: RouterModule) {
        const id = parseInt(routerModule.pathData?.id || '0');
        try {
            const user = this.userService.getUserById(id);
            return user;
        } catch (e: any) {
            // This is not caught here because the @ExceptionHandler in UserService handles it
            // If there was no handler in UserService, it could be caught here
            console.error('This should not be reached if UserService handles the error.', e.message);
            throw e; // Can be re-thrown to be handled by a global handler
        }
    }

    @Route({ path: '/hello' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    hello(rr: RequestResponse, header: ReqHeader) {
        return `Hello from Simple-Boot-HTTP-Server! Your User-Agent is: ${header['user-agent']}`;
    }
}

// 3. Server Option Configuration
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    // globalAdvice: GlobalErrorHandlerAdvice, // Register a global exception handler if needed
});

// 4. Create and run the SimpleBootHttpServer instance
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Core features example started.');

/*
Test with the following commands in the terminal:
curl http://localhost:3000/user/1
curl http://localhost:3000/user/3 (non-existent user)
curl http://localhost:3000/user/-5 (Around decorator test)
curl http://localhost:3000/hello
*/
```

## 5.2. Optimized Integration for the Server Environment

While utilizing the features of `Simple-Boot Core`, `Simple-Boot-HTTP-Server` also provides an optimized integration that considers the characteristics of the Node.js server environment.

-   **Direct Use of Node.js `http`/`https` Modules:** By directly using Node.js's built-in HTTP server modules, it enables low-level request/response control and performance optimization.
-   **Stream-based Request/Response Handling:** The `RequestResponse` object is designed to read the request body as a stream and write the response body as a stream, making it efficient for handling large amounts of data.
-   **Middleware/Filter/Endpoint System:** It abstracts the middleware pattern similar to Express or Koa into a filter and endpoint system, allowing for flexible configuration of the request processing pipeline.
-   **Session Management:** Built-in session management for maintaining state in web applications enhances development convenience.
-   **File Upload Handling:** It helps to easily handle file uploads by automatically parsing `multipart/form-data` requests.

Through this integration, developers can consistently apply DI, AOP, and exception handling patterns necessary for backend development, and build high-performance web server applications by combining them with the powerful asynchronous processing capabilities of Node.js.

This chapter explored how `Simple-Boot-HTTP-Server` utilizes the powerful features of `Simple-Boot Core` to achieve an optimized integration for the server environment. With this, we have explored all the major features of `Simple-Boot-HTTP-Server` and the design principles that form its foundation.

The next appendix will objectively evaluate the pros and cons of the `Simple-Boot-HTTP-Server` architecture, share ideas on how to extend or contribute to the framework, and provide a growth roadmap for web server framework developers.
