# Chapter 3: Application Flow Control - Routing and Intent System

As applications grow in scale, a mechanism is needed to execute appropriate functions based on user requests and to communicate efficiently between modules. This chapter explores how to design and implement Simple-Boot's flexible routing system and an Intent-based event system for loosely coupled communication.

## 3.1. Designing a Flexible Router System

A router analyzes incoming requests (e.g., HTTP requests, internal events) and connects them to the appropriate module or method. Simple-Boot's router has the following characteristics:

-   **Hierarchical Routing:** Complex URL structures can be systematically managed through nested routers.
-   **Class-based and Method-based Routing:** A specific path can be mapped to an entire class, or to a specific method within a class.
-   **Path Parameter Extraction:** Dynamic values can be extracted from the URL path and passed as arguments to methods.
-   **Filter Chain:** Filters can be applied to execute specific logic before and after a request is routed.

## 3.2. `@Router` and `@Route` Decorators

Simple-Boot uses `@Router` and `@Route` decorators to declaratively define routing rules.

-   **`@Router`:** Applied to a class to declare that the class is a router, defining its base path (`path`) and sub-routing rules (`route`, `routers`).
-   **`@Route`:** Applied to a method within an `@Router` class to map that method to a specific path (`path`). Path parameters (e.g., `/users/{id}`) can be defined.

### Implementation Principle

`RouterManager` is the core of the routing system. When `SimpleApplication` is initialized, it starts with the class designated as `rootRouter`, collects all `@Router` and `@Route` metadata, and builds a routing map.

When a user calls `app.routing(intent)`, `RouterManager` finds and executes the appropriate module/method through the following process:

1.  **Path Matching:** Compares the `pathname` of the `Intent` object with the paths defined in the routing map to find the most suitable path. It supports path parameters (`{id}`) and regular expressions (`{id:[0-9]+}`).
2.  **Filter Application:** If `filters` are defined in `@Router` or `@Route`, their `isAccept(intent)` method is called to determine whether the request should proceed.
3.  **Module/Method Execution:** The class (module) corresponding to the matched path is instantiated via `SimstanceManager` and, if an `@Route` method exists, that method is executed. Path parameters (`pathData`) extracted from the URL or query parameters (`queryParams`) can be injected as arguments to the method.
4.  **`RouterModule` Return:** A `RouterModule` object is returned as the routing result. This object contains all routing information, including the matched router chain, module instance, and path data.

```typescript
// route/RouterManager.ts (Conceptual)
export class RouterManager {
  // ... constructor ...

  public async routing<R = SimAtomic, M = any>(intent: Intent): Promise<RouterModule<R, M>> {
    // 1. Recursively match paths and apply filters starting from rootRouter
    const executeModuleResult = this.getExecuteModule(this.rootRouter, intent, []);

    if (executeModuleResult) {
      const [executeModule, routerChains] = executeModuleResult;
      executeModule.routerChains = routerChains;

      // 2. Call canActivate of RouterAction implementations in the router chain
      // (e.g., authentication check, data loading)
      for (const router of routerChains) {
        const instance = router.getValue();
        if (isRouterAction(instance)) {
          await instance.canActivate({ intent, routerModule: executeModule, routerManager: this });
        }
      }

      // 3. Execute the final module/method and return RouterModule
      // (For method-based routing, execute the corresponding method)
      return executeModule;
    } else {
      // 4. Handle cases where no matching path is found (e.g., 404 Not Found)
      throw new Error('Route not found');
    }
  }

  // ... getExecuteModule, findRouting and other internal methods ...
}
```

### Example: Using `@Router` and `@Route` Decorators

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';

// Module responsible for the user list page
@Sim
class UserListPage {
    showUsers() {
        console.log('Displaying user list page.');
        return 'User List Page Content';
    }
}

// Module responsible for a specific user detail page
@Sim
class UserDetailPage {
    showUserDetail(routerModule: RouterModule) {
        const userId = routerModule.pathData?.id; // Extract 'id' parameter from URL path
        console.log(`Displaying detail for user ID: ${userId}`);
        return `User Detail Page Content for ID: ${userId}`;
    }
}

// Module responsible for API endpoints
@Sim
class ApiService {
    @Route({ path: '/health' })
    checkHealth() {
        console.log('API Health Check: OK');
        return { status: 'healthy' };
    }

    @Route({ path: '/data/{type}' })
    getData(routerModule: RouterModule) {
        const dataType = routerModule.pathData?.type; // Extract 'type' parameter from URL path
        const queryParam = routerModule.queryParams?.q; // Extract query parameter 'q'
        console.log(`Fetching data of type: ${dataType}, query: ${queryParam || 'none'}`);
        return { type: dataType, query: queryParam, result: `Data for ${dataType}` };
    }
}

// Application's root router
@Sim
@Router({ path: '' }) // Base path
class AppRouter {
    // Class-based routing: When a request comes to /users, activate the UserListPage module
    @Route({ path: '/users' })
    userList(routerModule: RouterModule) {
        return routerModule.getModuleInstance<UserListPage>()?.showUsers();
    }

    // Method-based routing: When a request comes to /users/{id}, call the showUserDetail method of the UserDetailPage module
    @Route({ path: '/users/{id}' })
    userDetail(routerModule: RouterModule) {
        return routerModule.getModuleInstance<UserDetailPage>()?.showUserDetail(routerModule);
    }

    // Hierarchical routing: All requests under /api path are handled by the ApiService router
    @Route({ path: '/api', target: ApiService }) // Use target to connect another router module
    apiRoutes() {}
}

// Create and run SimpleApplication instance
const app = new SimpleApplication({ rootRouter: AppRouter });
app.run();

// Routing execution examples
async function runRoutingExamples() {
    console.log('\n--- Routing to /users ---');
    let result = await app.routing({ path: '/users' });
    console.log('Routing Result:', result.getModuleInstance());

    console.log('\n--- Routing to /users/123 ---');
    result = await app.routing({ path: '/users/123' });
    console.log('Routing Result:', result.getModuleInstance());

    console.log('\n--- Routing to /api/health ---');
    result = await app.routing({ path: '/api/health' });
    console.log('Routing Result:', result.getModuleInstance());

    console.log('\n--- Routing to /api/data/products?q=electronics ---');
    result = await app.routing({ path: '/api/data/products?q=electronics' });
    console.log('Routing Result:', result.getModuleInstance());
}

runRoutingExamples();
```

## 3.3. Intent-based Event System

To allow different parts of an application to communicate without direct dependencies, Simple-Boot provides an Intent-based event system. This is a form of the Publish/Subscribe pattern, similar to the `Intent` concept in `Android`.

-   **`Intent` Object:** An object that encapsulates the purpose of communication (URI), the data to be transmitted (`data`), and related events (`event`). The URI has the form `scheme://path?query`.
-   **`IntentManager`:** Acts as an intermediary for publishing and subscribing to Intents.

### Implementation Principle

1.  **Intent Publishing (`publishIntent`):**
    When an Intent is published, such as `app.publishIntent('MyService://updateUser', { name: 'Jane' })`, `IntentManager` analyzes the Intent's URI and finds all `@Sim` modules registered for that `scheme` or `path`.

2.  **Intent Subscription (`intentSubscribe`):
    An `@Sim` module can implement the `intentSubscribe(intent: Intent)` method to receive published Intents. Additionally, specific methods within the module can be directly called based on the Intent's `path`.

```typescript
// intent/IntentManager.ts (Conceptual)
export class IntentManager {
  // ... constructor ...

  public publish(intent: Intent): any[] {
    const results: any[] = [];
    // 1. Find target Sim modules based on the Intent URI.
    const targetSims = this.simstanceManager.findSims({ scheme: intent.scheme });

    targetSims.forEach(simAtomic => {
      const instance = simAtomic.getValue();
      if (instance) {
        // 2. Call a specific method within the module based on the Intent's path, or
        //    call the intentSubscribe method.
        if (intent.paths.length > 0) {
          // Example: MyService://updateUser -> instance.updateUser(intent)
          const method = instance[intent.paths[0]]; 
          if (typeof method === 'function') {
            results.push(method.call(instance, intent));
          }
        } else if (typeof instance.intentSubscribe === 'function') {
          results.push(instance.intentSubscribe(intent));
        }
      }
    });
    return results;
  }
}
```

### Example: Using the Intent-based Event System

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Intent, IntentSubscribe } from '@dooboostore/simple-boot';

// Service that publishes Intents
@Sim
class PublisherService {
    constructor(private app: SimpleApplication) {}

    publishUserUpdate(userId: string, newName: string) {
        console.log(`[Publisher] Publishing user update for ID: ${userId}`);
        // Publish Intent to 'user-service' scheme with 'updateUser' path
        this.app.publishIntent(
            new Intent(`user-service://updateUser/${userId}`, { name: newName })
        );
    }

    publishGlobalMessage(message: string) {
        console.log(`[Publisher] Publishing global message: ${message}`);
        // Publish Intent with only data to 'global-events' scheme
        this.app.publishIntent(
            new Intent('global-events://', { message: message })
        );
    }
}

// Service that subscribes to Intents (user-service scheme)
@Sim({ scheme: 'user-service' })
class UserService implements IntentSubscribe {
    // Method mapped to user-service://updateUser/{id} path
    updateUser(intent: Intent) {
        const userId = intent.getPathnameData('updateUser/{id}')?.id;
        const newName = intent.data?.name;
        console.log(`[UserService] Received update for user ${userId}: new name is ${newName}`);
        // Actual user information update logic...
    }

    // Generic subscription method for other Intents of the user-service scheme
    intentSubscribe(intent: Intent) {
        console.log(`[UserService] Generic intent received: ${intent.uri}, data:`, intent.data);
    }
}

// Another service that subscribes to Intents (global-events scheme)
@Sim({ scheme: 'global-events' })
class NotificationService implements IntentSubscribe {
    intentSubscribe(intent: Intent) {
        const message = intent.data?.message;
        console.log(`[NotificationService] Global message received: ${message}`);
        // Logic to display notifications to the user...
    }
}

// Create and run SimpleApplication instance
const app = new SimpleApplication();
app.run();

const publisher = app.sim(PublisherService);

// Intent publishing examples
publisher?.publishUserUpdate('101', 'Alice Smith');
publisher?.publishGlobalMessage('Application started successfully!');

// Publishing to a non-existent scheme will not be received by anyone
console.log('\n--- Publishing to unknown scheme ---');
app.publishIntent(new Intent('unknown-service://doSomething', { value: 123 }));

/* Expected Output:
[Publisher] Publishing user update for ID: 101
[UserService] Received update for user 101: new name is Alice Smith
[Publisher] Publishing global message: Application started successfully!
[NotificationService] Global message received: Application started successfully!

--- Publishing to unknown scheme ---
*/
```

The routing system and Intent system play a key role in controlling the flow of Simple-Boot applications and building a flexible and extensible architecture by reducing coupling between modules.

In the next chapter, we will learn how to implement caching and validation systems that ensure application performance and data integrity.
