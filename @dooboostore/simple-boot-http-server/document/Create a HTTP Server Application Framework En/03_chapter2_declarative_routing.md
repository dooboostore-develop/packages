# Chapter 2: Declarative Routing - Mapping URLs and Methods

The core function of a web server is routing, which connects a client's HTTP request to the appropriate handler (method). `Simple-Boot-HTTP-Server` extends the routing system of `@dooboostore/simple-boot` to provide a powerful feature for declaratively mapping HTTP methods and URL paths to classes and methods. This chapter explores the design and implementation of this declarative routing.

## 2.1. Routing with `@Router` and `@Route`

Routing in `Simple-Boot-HTTP-Server` is based on the `@Router` and `@Route` decorators from `simple-boot-core`. These decorators are used to connect URL paths with the server's business logic.

-   **`@Router`:** Applied to a class to declare it as a router, defining a base path (`path`) and sub-routing rules (`route`, `routers`). This enables a hierarchical routing structure.
-   **`@Route`:** Applied to a method within a `@Router` class to map that method to a specific path (`path`). It supports path parameters (e.g., `/users/{id}`) to extract dynamic values from the URL path.

### Implementation Principle

Since `SimpleBootHttpServer` extends `SimpleApplication`, it uses the `RouterManager` from `simple-boot-core` as is. During application initialization, `RouterManager` collects all `@Router` and `@Route` metadata to build a routing map. When a client request comes in, `SimpleBootHttpServer` calls the `routing()` method of `RouterManager` to find the route handler that matches the request URL.

## 2.2. HTTP Method Decorators (`@GET`, `@POST`, etc.)

`Simple-Boot-HTTP-Server` provides dedicated decorators to directly map HTTP methods (GET, POST, PUT, DELETE, etc.) to route handler methods. These decorators are extensions of the `UrlMapping` decorator and ensure that only requests for a specific HTTP method are handled.

-   **`@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`, `@OPTIONS`, `@HEAD`, `@TRACE`, `@CONNECT`:** Decorators corresponding to each HTTP method.
-   **`@UrlMapping`:** A generic decorator that allows you to specify the HTTP method as a string through the `method` property.

### Controlling Requests/Responses with `MappingConfig`

These method decorators take a `MappingConfig` object as an argument to finely control the properties of the request (`req`) and response (`res`).

-   **`req.contentType` / `req.accept`:** Filters requests based on the `Content-Type` or `Accept` header of the request.
-   **`res.status`:** Sets the response status code (e.g., `200`, `201`, `404`).
-   **`res.header`:** Adds custom response headers.
-   **`res.contentType`:** Sets the `Content-Type` header of the response (e.g., `Mimes.ApplicationJson`, `Mimes.TextHtml`).
-   **`resolver`:** Specifies a `Resolver` class to further process the method's return value before responding to the client (e.g., using `ResourceResorver` for file responses).

### Implementation Principle

HTTP method decorators use `Reflect.defineMetadata` to add `MappingConfig` metadata to the method. When a request comes in, `SimpleBootHttpServer` selects and executes the route handler method found by `RouterManager` that best matches the request's HTTP method, `Content-Type`, and `Accept` headers.

```typescript
// decorators/MethodMapping.ts (Conceptual)
export const MappingMetadataKey = Symbol('MappingMetadataKey');

export function GET(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function GET(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function GET(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        // When the @GET decorator is used without arguments
        process({method: HttpMethod.GET}, configOrTarget, propertyKey, descriptor);
    } else {
        // When the @GET decorator is used with arguments
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.GET;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

const process = (config: MappingConfig, target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // Store mapping information for all methods of the class
    const saveMappingConfigs = (ReflectUtils.getMetadata(MappingMetadataKey, target.constructor) ?? []) as SaveMappingConfig[];
    saveMappingConfigs.push({propertyKey, config});
    ReflectUtils.defineMetadata(MappingMetadataKey, saveMappingConfigs, target.constructor);
    // Store mapping information for a specific method
    ReflectUtils.defineMetadata(MappingMetadataKey, config, target, propertyKey);
};
```

### Example: URL & Method Mapping

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, POST, PUT, DELETE, Mimes, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import { ReqJsonBody } from '@dooboostore/simple-boot-http-server/models/datas/body/ReqJsonBody';

// Mock data store
const items: { id: number; name: string }[] = [
    { id: 1, name: 'Item A' },
    { id: 2, name: 'Item B' }
];
let nextId = 3;

@Sim
@Router({ path: '/api/items' })
export class ItemApi {

    @Route({ path: '' }) // GET /api/items
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getAllItems() {
        console.log('GET /api/items: All items requested.');
        return items;
    }

    @Route({ path: '/{id}' }) // GET /api/items/{id}
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getItemById(routerModule: RouterModule) {
        const itemId = parseInt(routerModule.pathData?.id || '0');
        console.log(`GET /api/items/${itemId}: Specific item requested.`);
        const item = items.find(i => i.id === itemId);
        if (!item) {
            // Can be integrated with Simple-Boot's exception handling system
            throw new Error(`Item with ID ${itemId} not found.`);
        }
        return item;
    }

    @Route({ path: '' }) // POST /api/items
    @POST({
        req: { contentType: [Mimes.ApplicationJson] }, // Only handle if request Content-Type is application/json
        res: { status: HttpStatus.Created, contentType: Mimes.ApplicationJson } // Response status 201 Created
    })
    createItem(body: ReqJsonBody) {
        console.log('POST /api/items: Creating new item:', body);
        const newItem = { id: nextId++, name: body.name };
        items.push(newItem);
        return { success: true, item: newItem };
    }

    @Route({ path: '/{id}' }) // PUT /api/items/{id}
    @PUT({ req: { contentType: [Mimes.ApplicationJson] } })
    updateItem(routerModule: RouterModule, body: ReqJsonBody) {
        const itemId = parseInt(routerModule.pathData?.id || '0');
        console.log(`PUT /api/items/${itemId}: Updating item:`, body);
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            throw new Error(`Item with ID ${itemId} not found for update.`);
        }
        items[itemIndex].name = body.name || items[itemIndex].name;
        return { success: true, item: items[itemIndex] };
    }

    @Route({ path: '/{id}' }) // DELETE /api/items/{id}
    @DELETE({ res: { status: HttpStatus.NoContent } }) // Response status 204 No Content
    deleteItem(routerModule: RouterModule) {
        const itemId = parseInt(routerModule.pathData?.id || '0');
        console.log(`DELETE /api/items/${itemId}: Deleting item.`);
        const initialLength = items.length;
        items.splice(items.findIndex(i => i.id === itemId), 1);
        if (items.length === initialLength) {
            throw new Error(`Item with ID ${itemId} not found for deletion.`);
        }
        // No return value for 204 No Content response
    }
}

// Server Option Configuration
const httpServerOption = new HttpServerOption({
    listen: {
        port: 3000,
        listeningListener: (server, httpServer) => {
            const address = httpServer.address();
            console.log(`Server is running on http://localhost:${(address as any).port}`);
        }
    }
});

// Create and run the SimpleBootHttpServer instance
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server URL & Method Mapping example started.');

/*
Test with the following commands in the terminal:

# Get all items
curl http://localhost:3000/api/items

# Get a specific item
curl http://localhost:3000/api/items/1

# Create a new item
curl -X POST -H "Content-Type: application/json" -d '{'''name''':'''New Item'''}' http://localhost:3000/api/items

# Update an item
curl -X PUT -H "Content-Type: application/json" -d '{'''name''':'''Updated Item A'''}' http://localhost:3000/api/items/1

# Delete an item
curl -X DELETE http://localhost:3000/api/items/2
*/
```

## 2.3. Request/Response Data Binding (Body, Header, Query)

`Simple-Boot-HTTP-Server` provides a feature to automatically inject (bind) various request data into the parameters of the route handler method. This is implemented using the DI container of `simple-boot-core` and the `RequestResponse` object.

-   **`RequestResponse`:** The HTTP request/response object itself can be injected to access all request information and construct the response.
-   **`RouterModule`:** An object containing detailed information about the current routing (path parameters `pathData`, query parameters `queryParams`, etc.).
-   **`ReqHeader`:** The entire request header is injected as an object.
-   **`ReqJsonBody`:** When the request body is in JSON format, the JSON data is parsed and injected as an object.
-   **`ReqFormUrlBody`:** When the request body is in `application/x-www-form-urlencoded` format, the data is parsed and injected as an object.
-   **`ReqMultipartFormBody`:** Handles `multipart/form-data` request bodies, injecting file and field data.
-   **`URLSearchParams`:** The query string of the request URL is injected as a `URLSearchParams` object.

### Implementation Principle

Within the `request` event listener of `SimpleBootHttpServer`, before executing the route handler method, the `SimstanceManager.getParameterSim()` method of `simple-boot-core` is used to analyze the parameter types of the handler method. Depending on each parameter type, the corresponding data is extracted or parsed from the `RequestResponse` object and injected as an argument to the method.

For example, if a handler method has a parameter of type `ReqJsonBody`, the `reqBodyJsonData()` method of the `RequestResponse` object is called to read and parse the request body as JSON, and the result is injected into that parameter.

```typescript
// SimpleBootHttpServer.ts (Conceptual - Route handler execution part)
// ...
// methods[0] is the metadata of the matched route handler method
const it = methods[0]; 
const moduleInstance = routerModule?.getModuleInstance?.(); // Instance of the class to which the route handler belongs

// Analyze the parameter types of the handler method
const paramTypes = ReflectUtils.getParameterTypes(moduleInstance, it.propertyKey);
const otherStorage = new Map<ConstructorType<any>, any>();
otherStorage.set(RequestResponse, rr); // The RequestResponse object can always be injected
otherStorage.set(RouterModule, routerModule); // The RouterModule object can also always be injected

for (const paramType of paramTypes) {
    if (paramType === ReqFormUrlBody) {
        otherStorage.set(ReqFormUrlBody, await rr.reqBodyReqFormUrlBody());
    } else if (paramType === ReqJsonBody) {
        otherStorage.set(ReqJsonBody, await rr.reqBodyReqJsonBody());
    } else if (paramType === ReqHeader) {
        otherStorage.set(ReqHeader, rr.reqHeaderObj);
    } // ... handle other parameter types ...
}

// Execute the handler method by injecting parameters through SimstanceManager
let data = await this.simstanceManager.executeBindParameterSimPromise({
    target: moduleInstance,
    targetKey: it.propertyKey
}, otherStorage);
// ... construct response ...
```

This automatic data binding feature reduces the hassle for developers of manually parsing and validating request data, allowing them to focus more on implementing business logic.

The next chapter will cover the filter and endpoint systems, which intercept and execute specific logic in the request/response lifecycle.
