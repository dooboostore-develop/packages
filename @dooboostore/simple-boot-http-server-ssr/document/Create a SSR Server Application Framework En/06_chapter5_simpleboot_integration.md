# Chapter 5: The Foundation of the Framework - Integrating with Simple-Boot Core and Front

`Simple-Boot-HTTP-SSR` builds a Server-Side Rendering (SSR) environment by integrating two powerful frameworks: `Simple-Boot Core` and `Simple-Boot-Front`. This chapter explores how these three frameworks work together organically to help you efficiently develop SSR applications.

## 5.1. Utilizing DI, AOP, and Routing from Simple-Boot Core

`Simple-Boot-HTTP-SSR` extends `SimpleBootHttpServer`, which in turn extends `SimpleApplication` (the main class of Simple-Boot Core). This inheritance structure allows `Simple-Boot-HTTP-SSR` to use all the core features of `Simple-Boot Core` as is in the server environment.

-   **Dependency Injection (DI):**
    -   All classes defined with the `@Sim` decorator (services, controllers, etc.) are managed by the DI container (`SimstanceManager`) of `Simple-Boot-HTTP-SSR`.
    -   Server-side services or route handlers can automatically receive the necessary dependencies through constructor injection.
-   **Aspect-Oriented Programming (AOP):**
    -   Cross-cutting concerns such as logging, performance measurement, and authorization can be applied before and after server-side method calls using the `@Before`, `@After`, and `@Around` decorators.
-   **Exception Handling System:**
    -   Exceptions that occur at the server-side method or class level can be handled declaratively using the `@ExceptionHandler` decorator.
    -   A global `advice` can be registered to manage exceptions consistently across the server application.
-   **Routing:**
    -   HTTP requests are mapped to server-side route handlers using the `@Router` and `@Route` decorators.
    -   `Simple-Boot-HTTP-SSR` uses this routing system to pass client requests for HTML pages to the `SSRFilter` or API requests to the corresponding controller.

### Example: Utilizing Simple-Boot Core Features (Server-Side)

```typescript
// server.ts (Server-side code)
import 'reflect-metadata';
import { SimpleBootHttpSSRServer, HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr';
import { Sim, Router, Route, Before, ExceptionHandler } from '@dooboostore/simple-boot';
import { GET, Mimes, RequestResponse, HttpStatus } from '@dooboostore/simple-boot-http-server';

// 1. Service with DI, AOP, and exception handling features
@Sim
class ProductService {
    private products: { id: number; name: string }[] = [
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Mouse' }
    ];

    // AOP: Logging before method execution
    @Before({ property: 'getProductById' })
    logBeforeProductFetch() {
        console.log('[AOP] Before fetching product.');
    }

    getProductById(id: number) {
        console.log(`[ProductService] Fetching product with ID: ${id}`);
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found.`);
        }
        return product;
    }

    // Exception Handling: Handling a specific error type
    @ExceptionHandler({ type: Error })
    handleProductError(rr: RequestResponse, error: Error) {
        console.error(`[ProductService] Caught error in handler: ${error.message}`);
        rr.resStatusCode(HttpStatus.NotFound).resWriteJson({ error: 'Product Not Found', message: error.message }).resEnd();
    }
}

// 2. Server-side router (injects and uses ProductService)
@Sim
@Router({ path: '' })
class ServerAppRouter {
    constructor(private productService: ProductService) {}

    @Route({ path: '/api/products/{id}' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getProduct(rr: RequestResponse, routerModule: RouterModule) {
        const id = parseInt(routerModule.pathData?.id || '0');
        return this.productService.getProductById(id);
    }

    @Route({ path: '/api/hello' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    helloApi() {
        return 'Hello from API!';
    }
}

const httpServerOption = new HttpSSRServerOption({
    listen: { port: 3000 },
    rootRouter: ServerAppRouter,
    // ... SSRFilter configuration (see previous chapter) ...
});

const app = new SimpleBootHttpSSRServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-SSR Core features example started.');

/*
Test with the following commands in the terminal:
curl http://localhost:3000/api/products/1
curl http://localhost:3000/api/products/3 (non-existent product)
curl http://localhost:3000/api/hello
*/
```

## 5.2. Integration and Code Sharing with Simple-Boot-Front

`Simple-Boot-HTTP-SSR` creates and runs `SimpleBootFront` instances directly on the server. This is the core mechanism that enables code sharing between the server and the client.

-   **`SimpleBootHttpSSRFactory`:** A factory class for creating `SimpleBootFront` instances. It helps to share the same `SimpleBootFront` configuration on both the server and the client.
-   **`SSRFilter`:** This filter runs `SimpleBootFront` instances in a JSDOM environment to render front-end components on the server.
-   **Code Sharing:** Much of the code, such as routing rules, service logic, and component definitions, can be reused on both the server and the client. This is a great advantage for increasing development productivity and maintaining code consistency.

### Example: Integration with Simple-Boot-Front (Conceptual)

```typescript
// common-factory.ts (used on both server and client)
import { SimpleBootHttpSSRFactory, SimFrontOption, SimpleBootFront } from '@dooboostore/simple-boot-http-server-ssr';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';

// Front-end component (used on both server and client)
@Sim
@Component({ template: '<div>User ID: ${this.userId}$</div>' })
class UserProfileComponent {
  userId: string = '';
  onInit(routerModule: any) { // Method to be called after routing on the client-side
    this.userId = routerModule.pathData?.id;
  }
}

// Front-end router (used on both server and client)
@Sim
@Router({ path: '' })
@Component({ template: `<router dr-this="this.child"></router>` })
class FrontAppRouter {
  child?: any;
  canActivate(url: any, module: any) { this.child = module; }
  @Route({ path: '/users/{id}', target: UserProfileComponent })
  userRoute() {}
}

// Factory for creating SimpleBootFront instances
class FrontAppFactory extends SimpleBootHttpSSRFactory {
  async factory(simFrontOption: SimFrontOption, using: any[], domExcludes: any[]): Promise<SimpleBootFront> {
    const simpleBootFront = new SimpleBootFront(simFrontOption);
    // Set root router
    simpleBootFront.option.setRootRouter(FrontAppRouter);
    return simpleBootFront;
  }
}

export const frontAppFactory = new FrontAppFactory();
export const makeSimFrontOption = (window: any) => new SimFrontOption(window).setUrlType('path');

// server.ts (Server-side code - SSRFilter configuration part)
// ...
const ssrOption = {
  frontDistPath: './dist/front',
  factorySimFrontOption: (window: any) => makeSimFrontOption(window),
  factory: frontAppFactory,
  // ...
};
const option = new HttpSSRServerOption({
  listen: { port: 3000 },
  filters: [new SSRFilter(ssrOption)],
});
const app = new SimpleBootHttpSSRServer(option);
app.run();
// ...

// client.ts (Client-side code - SimpleBootFront initialization part)
// ...
const config = makeSimFrontOption(window);
const app = new SimpleBootFront(config);
app.run();
// ...
```

## 5.3. Optimized Integration for the SSR Environment

`Simple-Boot-HTTP-SSR` optimizes the integration with `Simple-Boot Core` and `Simple-Boot-Front` by considering the characteristics of the SSR environment.

-   **Execution in a JSDOM Environment:** `SimpleBootFront` instances are run in a JSDOM environment, not a real browser. `Simple-Boot-HTTP-SSR` uses `JsdomInitializer` to mock the necessary global objects like `window`, `document`, `history`, and `fetch` for the JSDOM environment, so that the front-end code can run without errors.
-   **Data Hydration:** It efficiently transfers and reuses data fetched on the server to the client through the `SaveAroundAfter` and `LoadAroundBefore` decorators to optimize initial loading performance.
-   **Instance Pooling:** It manages `SimpleBootFront` instances in a pool to reduce the overhead of SSR request processing and increase concurrency.
-   **Intent-Based Client-Server Communication:** It implements dynamic data communication between the client and server using the Intent system of `simple-boot-core` through `IntentSchemeFilter`.

Through this integration, developers can efficiently build high-performance SSR applications that run on both the server and the client with a single codebase.

This chapter explored how `Simple-Boot-HTTP-SSR` integrates with `Simple-Boot Core` and `Simple-Boot-Front` to achieve an optimized integration for the SSR environment. With this, we have explored all the major features of `Simple-Boot-HTTP-SSR` and the design principles that form its foundation.

The next appendix will objectively evaluate the pros and cons of the `Simple-Boot-HTTP-SSR` architecture, share ideas on how to extend or contribute to the framework, and provide a growth roadmap for SSR framework developers.
