# Chapter 2: The SSR Filter - The Core of the Request Processing Pipeline

In `Simple-Boot-HTTP-SSR`, the core logic of Server-Side Rendering (SSR) is encapsulated in the `SSRFilter`. This filter intercepts client requests for HTML pages, executes the front-end application on the server, and returns the rendered HTML to the client. This chapter explores the working principle of the `SSRFilter`, the SSR request processing flow, and the data hydration mechanism.

## 2.1. How the SSRFilter Works

The `SSRFilter` implements the `Filter` interface from `simple-boot-http-server`. This means it is part of the HTTP request processing pipeline and can intercept and process requests along with other filters.

-   **`proceedBefore` Method:** This is where the core logic of the `SSRFilter` is implemented. This method detects requests for HTML pages and performs SSR using a `SimpleBootFront` instance.
-   **`ssrExcludeFilter`:** For certain URL patterns (e.g., `/api`, `/assets`), you can configure it to not perform SSR and instead pass the request to other filters or route handlers, such as for serving static files or API routing.

### Implementation Principle

The `proceedBefore` method of the `SSRFilter` processes SSR requests in the following steps:

1.  **Intercepting the Request:** It checks if it is a request for an HTML page, for example, by using `rr.reqHasAcceptHeader(Mimes.TextHtml)`.
2.  **Acquiring a `SimpleBootFront` Instance:** It gets an available `SimpleBootFront` instance from the `simpleBootFrontQueue` described in Chapter 1.
3.  **Configuring the JSDOM Environment:** It sets the `location.href` of the JSDOM `window` object associated with the acquired `SimpleBootFront` instance to the current request URL, so that the front-end router recognizes the correct path.
4.  **Executing Front-End Routing:** It calls the `goRouting()` method of the `SimpleBootFront` instance to execute front-end routing and component rendering within the JSDOM environment. During this process, component lifecycle hooks like `onInit` are called, and necessary data is loaded from the server.
5.  **Extracting the HTML:** Once rendering is complete, the complete HTML string is extracted from the JSDOM `document`'s `documentElement.outerHTML`.
6.  **Injecting Data for Hydration:** The data loaded on the server (`window.server_side_data`) is inserted into the HTML as a `<script>` tag to be sent to the client. (More details in section 2.3.)
7.  **Sending the Response:** The generated HTML is sent to the client as a response.
8.  **Returning the Instance:** The used `SimpleBootFront` instance is returned to the pool (`simpleBootFrontQueue`).

```typescript
// filters/SSRFilter.ts (Conceptual - proceedBefore method)
export class SSRFilter implements Filter {
  // ... constructor, onInit, makeFront, etc. ...

  async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
    // 1. SSR exclusion filtering (e.g., /api, /assets paths)
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false; // Skip SSR and proceed to the next filter
    }

    // 2. Check if it's an HTML request
    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All))) {
      // 3. Acquire a SimpleBootFront instance
      const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
      try {
        // 4. Configure JSDOM environment and execute front-end routing
        const url = rr.reqUrlObj({host: 'localhost'}); // Configure the server-side URL for the JSDOM environment
        simpleBootFront.goRouting(url.toString()); // Execute front-end routing

        // 5. Extract HTML and inject data for hydration
        let html = simpleBootFront.option.window.document.documentElement.outerHTML;
        const serverSideData = (simpleBootFront.option.window as any).server_side_data; // Data loaded on the server
        if (serverSideData) {
          // ... logic to inject data into HTML with a <script> tag ...
        }

        // 6. Send the response
        await this.writeOkHtmlAndEnd({rr}, html);
      } finally {
        // 7. Return the instance
        this.simpleBootFrontQueue.enqueue(simpleBootFront);
      }
      return false; // SSR handled the response, so don't proceed to the next filter
    }
    return true; // If it's not an HTML request, proceed to the next filter
  }
}
```

## 2.2. The SSR Request Processing Flow

The overall flow when a client's HTML page request reaches `Simple-Boot-HTTP-SSR` is as follows:

1.  **Request Reception:** `SimpleBootHttpServer` receives the client request.
2.  **Filter Chain Start:** The filters registered in `HttpServerOption` are executed in order.
3.  **`SSRFilter` Execution:** The `proceedBefore` method of `SSRFilter` is called.
    a.  It checks if the request is a target for SSR (`ssrExcludeFilter`).
    b.  It gets an instance from the `SimpleBootFront` instance pool.
    c.  It sets the request URL in the JSDOM environment of the acquired instance.
    d.  It calls `SimpleBootFront`'s `goRouting()` to execute front-end routing and component rendering on the server.
    e.  During the rendering process, the components fetch the necessary data from the server.
    f.   Once rendering is complete, it extracts the HTML from the JSDOM `document` and inserts the data fetched from the server into the HTML.
    g.  It sends the generated HTML to the client as a response.
    h.  It returns the `SimpleBootFront` instance to the pool.
4.  **Response Completion:** The client receives the fully rendered HTML from the server and can display the page immediately.
5.  **Client-Side Hydration:** When the JavaScript is loaded in the client's browser, `SimpleBootFront` reuses the already rendered HTML and activates the UI (hydration) using the data received from the server. No duplicate API calls are made in this process.

## 2.3. The Data Hydration Mechanism

Data hydration is one of the core concepts of SSR. It is a technique for transferring the data used during server-side rendering to the client, so that the client-side JavaScript can activate the UI without re-rendering the page. `Simple-Boot-HTTP-SSR` automates this with the `SaveAroundAfter` and `LoadAroundBefore` decorators.

-   **`window.server_side_data`:** `Simple-Boot-HTTP-SSR` stores the server-rendered data in the `server_side_data` property of the JSDOM `window` object. This data is inserted into the final HTML in the form of a `<script>` tag and sent to the client.

### Implementation Principle (Conceptual)

1.  **Server-Side Data Saving (`SaveAroundAfter`):**
    -   It works similarly to the `@Around` decorator from `@dooboostore/simple-boot`.
    -   When `SaveAroundAfter` is applied to a service method executed on the server (e.g., database query, external API call), the return value of that method is automatically saved to `window.server_side_data`.
    -   A unique key is generated by combining the `scheme` of the `@Sim` class to which the method belongs and the method name.

2.  **Client-Side Data Loading (`LoadAroundBefore`):**
    -   When `LoadAroundBefore` is applied to a service method executed on the client, it checks if there is data stored with the same key in `window.server_side_data` before the method is called.
    -   If the data exists, it skips the actual method execution and immediately returns the data from `window.server_side_data`. This prevents duplicate API calls on the client.

This mechanism allows data fetched and rendered on the server to be passed directly to the client, which can then activate the UI without needing to fetch the data again. This significantly improves initial loading speed and reduces server load.

The next chapter will delve deeper into the detailed implementation and usage of the `SaveAroundAfter` and `LoadAroundBefore` decorators, the core of data hydration.
