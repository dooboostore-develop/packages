# Chapter 4: Type-Safe Client-Server Communication: SymbolIntentApiServiceProxy

In web applications, especially in SSR (Server-Side Rendering) environments, smooth and efficient data communication between the front-end and back-end is essential. However, the traditional REST API approach can lead to several problems, such as DTO (Data Transfer Object) mismatches, repetitive API client code writing, and the hassle of URL management.

To solve these problems, `Simple-Boot-HTTP-SSR` provides a Symbol-based Proxy communication mechanism. The core of this architecture is that **the front-end and back-end share the same service interface**, and **the proxy automatically handles the actual network communication**, making it seem as if you are calling the back-end service directly from the local environment.

This chapter explores how to use `SymbolIntentApiServiceProxy` and `IntentSchemeFilter` to ensure type safety and maximize development productivity, using the `LayerService` example.

## 4.1. Core Components

This communication model consists of several core components.

-   **Service Interface (Shared Interface)**: The contract for the service that will be used in common by the front-end and back-end. It is defined with TypeScript's `interface` and a unique `Symbol`, and is referenced by both codebases.
-   **`SymbolIntentApiServiceProxy`**: A proxy applied to the front-end service. It intercepts method calls of the service and automatically generates and sends HTTP requests to the server according to a promised rule (e.g., `POST /api/{service_symbol}/{method_name}`).
-   **`IntentSchemeFilter`**: A filter that acts as a gateway on the back-end. It receives requests sent by the proxy, finds the actual back-end service based on the service symbol and method name specified in the URL, executes the corresponding method, and returns the result.
-   **Backend Service**: The actual implementation of the service interface, which performs the business logic.
-   **Frontend Service**: The front-end implementation of the service interface, which is empty in content and operates only with the proxy configuration.

## 4.2. Implementation Example: The `LayerService` Communication Process

Let's look at how the `LayerService` of the `lazycollect` application implements proxy communication, step by step.

### Step 1: (Common) Define the Service Interface

First, we define the `LayerService` interface that will be shared by the front-end and back-end. This file should be located in a common `src` directory so that it can be `import`ed from both sides.

**`apps/lazycollect/src/service/LayerService.ts`**
```typescript
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { Config } from '@dooboostore/app-system/proxy/SymbolIntentApiServiceProxy';
import { Layers } from '@src/entities/Layers';

// A symbol to be used as a unique identifier for the service
export namespace LayerService {
  export const SYMBOL = Symbol.for('LayerService');
  // ... request/response type definitions ...
  export type MyWorldLayersRequest = { sort?: Sort<Layers> };
  export type MyWorldLayersResponse = Layers[];
}

// The interface shared by the front-end and back-end
export interface LayerService {
  // ... other methods ...

  myWorldLayers(
    request: LayerService.MyWorldLayersRequest,
    // This second argument is a callback function that will be automatically injected by the proxy.
    // The front-end calls this function to send an API request.
    // The back-end receives the actual RequestResponse object as this argument.
    data?: RequestResponse | ((config?: Config<LayerService.MyWorldLayersRequest>) => Promise<LayerService.MyWorldLayersResponse>)
  ): Promise<LayerService.MyWorldLayersResponse>;
}
```
Each method of the interface has `data` as its second argument. This argument is the core of the proxy mechanism, acting as an API call function on the front-end and as a `RequestResponse` object on the back-end.

### Step 2: (Frontend) Implement the Proxy Service

On the front-end, we implement the `LayerService` interface and add the `proxy` setting to the `@Sim` decorator.

**`apps/lazycollect/front/service/FrontLayerService.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { LayerService } from '@src/service/LayerService';
import { Config, SymbolIntentApiServiceProxy } from '@dooboostore/app-system/proxy/SymbolIntentApiServiceProxy';

@Sim({
  symbol: LayerService.SYMBOL, // Use the same symbol as the back-end
  proxy: SymbolIntentApiServiceProxy // Apply the proxy
})
export class FrontLayerService implements LayerService {
  // The actual implementation of the method is just one line.
  // It calls the data function injected by the proxy and passes the request data.
  myWorldLayers(request: LayerService.MyWorldLayersRequest, data?: ((config?: Config<...>) => Promise<...>): Promise<LayerService.MyWorldLayersResponse> {
    return data!({ body: request });
  }

  // ... other methods are implemented with the same pattern ...
}
```
By simply adding `proxy: SymbolIntentApiServiceProxy` to the `@Sim` decorator, all the configuration is done. Each method just needs to call the `data` function injected by the proxy, and the proxy will automatically send an HTTP request to the server and return the response.

### Step 3: (Backend) Implement the Service

On the back-end, we implement the actual business logic of the `LayerService` interface.

**`apps/lazycollect/backend/service/layer/BackLayerService.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { LayerService } from '@src/service/LayerService';
import { DatabaseService } from '@backend/service/database';
import { SecurityService } from '@backend/service/SecurityService';
// ...

@Sim({ symbol: LayerService.SYMBOL }) // Use the same symbol as the front-end
export class BackLayerService implements LayerService {
  constructor(
    private databaseService: DatabaseService,
    private securityService: SecurityService
  ) {}

  // Implement the actual business logic
  async myWorldLayers(request: LayerService.MyWorldLayersRequest, rr?: RequestResponse): Promise<LayerService.MyWorldLayersResponse> {
    return await this.databaseService.transaction(async (entityManager) => {
      const user = await this.securityService.verifyAccessToken({ rr, entityManager });
      if (user.worldSeq) {
        // ... database query logic ...
        return await layersRepository.find({ where: { worldSeq: user.worldSeq, ... } });
      } else {
        throw new NotFoundError();
      }
    });
  }

  // ... implement other methods ...
}
```
The back-end service is registered in the `Sim` container using the same `LayerService.SYMBOL` as the front-end. `IntentSchemeFilter` uses this symbol to find the correct service to handle the request.

### Step 4: (Backend) Configure the Server Filter

Finally, we add `IntentSchemeFilter` to the `Filter` list of the back-end server.

**`apps/lazycollect/backend/index.ts`**
```typescript
// ...
import { IntentSchemeFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/IntentSchemeFilter';

// ... server configuration ...
const option = new HttpSSRServerOption({
    // ...
    filters: [
      // ... other filters ...
      IntentSchemeFilter // Register the filter to handle proxy requests
    ],
    // ...
});

const ssr = new SimpleBootHttpSSRServer(option);
await ssr.run(otherInstanceSim);
```
`IntentSchemeFilter` is responsible for detecting and processing all requests that come in with a URL in the form of `/api/{service_symbol}/{method_name}`.

## 4.3. Summary of the Communication Process

Once all the configuration is complete, the communication flows as follows:

1.  The front-end component calls `layerService.myWorldLayers({ sort: [...] })`.
2.  `SymbolIntentApiServiceProxy` intercepts this call.
3.  The proxy generates an HTTP request like `POST /api/LayerService/myWorldLayers`. The request body contains the serialized `request` object, the first argument of `myWorldLayers`.
4.  The back-end's `IntentSchemeFilter` receives this request.
5.  The filter parses the service symbol (`LayerService`) and method name (`myWorldLayers`) from the URL.
6.  It finds the `BackLayerService` instance in the `Sim` container with the key `LayerService.SYMBOL`.
7.  It executes the `myWorldLayers` method of the found instance with the request body data and the `RequestResponse` object as arguments.
8.  It serializes the method execution result and returns it as an HTTP response.
9.  The front-end's proxy receives this response, deserializes it, and passes it as a `Promise` result to the original caller.

## 4.4. Conclusion

The architecture using `SymbolIntentApiServiceProxy` provides the following powerful advantages:

-   **Type Safety**: Since the client and server share the same interface, errors can be found at compile time if the API specification changes.
-   **Code Deduplication**: There is no need to write repetitive API client code like `fetch` or `axios`.
-   **Improved Development Productivity**: Developers can focus solely on implementing the business logic on both sides, without having to worry about the additional task of network communication.

Thus, the Symbol-based proxy communication provided by `Simple-Boot-HTTP-SSR` is the best way to build a robust and maintainable client-server architecture, which is essential for modern web applications.
