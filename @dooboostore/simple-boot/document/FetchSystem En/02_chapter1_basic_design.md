# Chapter 1: Hierarchical Fetcher Design and Basic Structure

The first step in implementing `ApiService` is to build the class on a robust and well-designed foundation. We will leverage the hierarchical Fetcher structure provided by the `@dooboostore/core` library. Understanding this structure is crucial for clarifying the role and position of the `ApiService` we will create.

## 1.1. Design Philosophy of the Fetcher Hierarchy

`ApiService` is not a single class, but rather sits at the top of a hierarchical structure where multiple classes with clear responsibilities are linked through inheritance. The core idea behind this design is **Separation of Concerns**. Each layer focuses solely on its own responsibilities, abstracting away and hiding the complexity of the lower layers.

```
+---------------------+
|     ApiService      |  (Business/Application Layer)
+---------------------+
          |
          V (extends)
+---------------------+
|   HttpJsonFetcher   |  (JSON Data Format Layer)
+---------------------+
          |
          V (extends)
+---------------------+
|     HttpFetcher     |  (HTTP Protocol Layer)
+---------------------+
          |
          V (extends)
+---------------------+
|       Fetcher       |  (Top-level Abstract Layer)
+---------------------+
```

### 1.1.1. `Fetcher`: Top-level Abstract Layer

-   **Responsibility**: Defines the most basic promise (contract) of the act of "fetching data."
-   **Characteristics**: It has only one abstract method, `execute`. This layer does not care whether the data source is HTTP, a file system, or a database. Only the concept of "execution" exists. Thanks to this abstraction, the concept of `Fetcher` can be reused in areas other than HTTP communication.

### 1.1.2. `HttpFetcher`: HTTP Protocol Layer

-   **Responsibility**: Concretizes the abstract concept of `Fetcher` within the context of the HTTP protocol.
-   **Characteristics**: Inherits from `Fetcher` and implements the `execute` method with logic that sends HTTP requests using the browser's `fetch` API. This layer understands and processes HTTP components such as URL, request method (GET, POST, etc.), headers, and body. However, it does not yet concern itself with what format the data (JSON, XML, text, etc.) is exchanged in. It is solely responsible for pure HTTP communication itself.

### 1.1.3. `HttpJsonFetcher`: JSON Data Format Layer

-   **Responsibility**: Takes sole responsibility for processing JSON, the most widely used data format in modern web.
-   **Characteristics**: Inherits from `HttpFetcher` and adds convenience features for JSON data exchange.
    -   On request: Automatically `JSON.stringify()` the `body` object.
    -   On response: Automatically calls the `.json()` method on the `Response` object to parse it into a JavaScript object.
    -   Internally handles tasks such as setting the `Content-Type` header to `application/json`.
-   The `ApiService` we will create will be most efficient inheriting from this class, as most APIs communicate based on JSON.

### 1.1.4. `ApiService`: Business/Application Layer

-   **Responsibility**: Adds business logic specific to our application on top of the well-established HTTP and JSON communication foundation.
-   **Characteristics**: Inherits from `HttpJsonFetcher` and implements application-level functionalities such as user notifications (Alert), request-specific callbacks, reactive state management via RxJS, and interceptors for authentication. This is the layer we will focus on implementing in this book.

## 1.2. Defining the Basic `ApiService` Class

Having understood this hierarchical design, let's now extend `HttpJsonFetcher` to create the basic skeleton of `ApiService`.

```typescript
// ApiService.ts
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { HttpFetcherConfig, HttpJsonFetcher, FetcherRequest } from '@dooboostore/core/fetch';

// Defines the types for configuration and pipe objects. Currently empty.
export namespace ApiService {
  export type ApiServiceConfig = {};
  export type PIPE<T = any> = {};
}

// Registers with the DI container using the @Sim decorator.
@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {

  // Implements the abstract method of HttpJsonFetcher.
  protected createPipe<T = any>(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>, T>
  ): ApiService.PIPE {
    // The PIPE object is created for each request and used to pass data between lifecycle hooks.
    return {};
  }
}
```
This code is identical to before, but now we clearly understand why `ApiService` inherits from `HttpJsonFetcher` and what robust foundation lies beneath it.

In the next chapter, we will concretely implement the desired functionalities by overriding the request lifecycle hooks (`before`, `afterSuccess`, `error`, `finally`) on top of this skeleton.
