# Chapter 1: SSR Basics - SimpleBootHttpSSRServer and JSDOM Integration

Server-Side Rendering (SSR) is a technique for pre-rendering a client-side JavaScript application on the server to generate the initial HTML. This chapter explores the role of `SimpleBootHttpSSRServer`, the core of `Simple-Boot-HTTP-SSR`, the integration of JSDOM to build a browser-like DOM environment on the server, and the `SimpleBootFront` instance pool management mechanism.

## 1.1. The Role and Initialization of SimpleBootHttpSSRServer

`SimpleBootHttpSSRServer` extends `SimpleBootHttpServer` to provide HTTP server functionality while adding logic specific to SSR. Its main roles are as follows:

-   **Handling SSR Requests:** When a client requests an HTML page, it renders it on the server and sends the response.
-   **Managing `SimpleBootFront` Instances:** It creates and manages instances of the front-end application (`SimpleBootFront`).
-   **Providing a JSDOM Environment:** It provides a virtual browser environment through JSDOM so that front-end code can be executed on the server.

A `SimpleBootHttpSSRServer` instance is created with `new SimpleBootHttpSSRServer(option)`, and the server is started by calling the `run()` method.

```typescript
// SimpleBootHttpSSRServer.ts (Conceptual)
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { HttpSSRServerOption } from './option/HttpSSRServerOption';

export class SimpleBootHttpSSRServer extends SimpleBootHttpServer {
  constructor(option?: HttpSSRServerOption) {
    super(option); // Inherits from SimpleBootHttpServer
  }

  // The run method calls the run method of SimpleBootHttpServer to start the server.
  // SSR-related logic is mainly handled in the SSRFilter.
}

// server.ts (Example of server entry point)
import 'reflect-metadata';
import { SimpleBootHttpSSRServer } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRServer';
import { HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr/option/HttpSSRServerOption';
import { SSRFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/SSRFilter';
import Factory from './bootfactory'; // Factory for creating SimpleBootFront instances

const ssrOption = {
  frontDistPath: './dist/front',
  factorySimFrontOption: (window: any) => new SimFrontOption(window).setUrlType('path'),
  factory: Factory,
  poolOption: { max: 5, min: 2 }, // SimpleBootFront instance pool configuration
  using: [],
  domExcludes: [],
};

const option = new HttpSSRServerOption({
  listen: { port: 3000 },
  filters: [new SSRFilter(ssrOption)], // Register SSRFilter
});

const app = new SimpleBootHttpSSRServer(option);
app.run();

console.log('SSR Server started on port 3000');
```

## 1.2. Building a Server-Side Virtual DOM Environment with JSDOM

Front-end applications rely on the browser's DOM (Document Object Model) environment to function. To run this code on the server, a DOM environment similar to a browser must be mocked. `Simple-Boot-HTTP-SSR` implements this using the `jsdom` library.

-   **`jsdom`:** A JavaScript library that implements web standards in a Node.js environment, parsing HTML documents, creating a DOM tree, and providing objects like `window` and `document`.
-   **`JsdomInitializer`:** Creates a `jsdom` instance.

### Implementation Principle

`JsdomInitializer` reads the `index.html` file of the front-end application and uses the `JSDOM.JSDOM.fromFile()` method to create a `jsdom` instance.

```typescript
// initializers/JsdomInitializer.ts (Conceptual)
import * as JSDOM from 'jsdom';
import fs from 'fs';
import path from 'path';

export class JsdomInitializer {
  constructor(private frontDistPath: string, private frontDistIndexFileName: string, private reconfigureSettings?: JSDOM.ReconfigureSettings) {}

  async run(): Promise<JSDOM.JSDOM> {
    const pathStr = path.join(this.frontDistPath, this.frontDistIndexFileName);
    const jsdom = await JSDOM.JSDOM.fromFile(pathStr, {});
    return jsdom;
  }
}
```

## 1.3. Managing the SimpleBootFront Instance Pool

SSR requires initializing and rendering the front-end application for each incoming request. This process can be expensive, so `Simple-Boot-HTTP-SSR` optimizes performance by managing `SimpleBootFront` instances in a pool.

-   **Instance Pool:** A collection of pre-created `SimpleBootFront` instances.
-   **`AsyncBlockingQueue`:** A queue that manages `SimpleBootFront` instances. When a request comes in, it retrieves an instance from the pool, and when it's done, it returns it to the pool. If there are no instances in the pool, a new one is created.

### Implementation Principle

In its `onInit` method, `SSRFilter` pre-creates a minimum number of `SimpleBootFront` instances according to the `config.poolOption.min` setting and adds them to the queue. When a request comes in, an instance is retrieved from the pool via `simpleBootFrontQueue.dequeue()`, and after SSR rendering is complete, it is returned to the pool via `simpleBootFrontQueue.enqueue()`. This reduces the cost of instance creation and allows for efficient handling of concurrent requests.

```typescript
// filters/SSRFilter.ts (Conceptual)
import { AsyncBlockingQueue } from '@dooboostore/core/queues/AsyncBlockingQueue';

export class SSRFilter implements Filter {
    private simpleBootFrontPool: SimpleBootFront[] = []; // Stores the actual instances
    private simpleBootFrontQueue = new AsyncBlockingQueue<SimpleBootFront>(); // The queue

    constructor(public config: FactoryAndParams, public otherInstanceSim?: Map<ConstructorType<any>, any>) {
        // ...
    }

    async onInit(app: SimpleBootHttpServer) {
        // Pre-create a minimum number of instances and add them to the queue on server start
        for (let i = 0; i < this.config.poolOption.min; i++) {
            this.enqueueFrontApp(await this.makeFront(await this.makeJsdom()));
        }
    }

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        // ... SSR exclusion filtering ...

        // Get a SimpleBootFront instance from the queue
        const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
        try {
            // ... SSR rendering logic ...
        } finally {
            // Return the instance to the queue after use
            this.simpleBootFrontQueue.enqueue(simpleBootFront);
        }
        return false; // SSR handled the response, so don't proceed to the next filter
    }

    // makeFront: A method to create a SimpleBootFront instance in a JSDOM environment
    // enqueueFrontApp: A method to add the created instance to the pool and queue
}
```

This chapter covered the basic structure of `Simple-Boot-HTTP-SSR`, building a JSDOM environment for SSR, and the `SimpleBootFront` instance pool management mechanism. The next chapter will delve deeper into the workings of the `SSRFilter`, the core of SSR request processing, and data hydration.
