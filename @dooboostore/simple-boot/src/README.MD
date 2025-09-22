# SIMPLE-BOOT

### It provides convenience in service development.
![typescript](https://img.shields.io/badge/-typescript-black?logo=typescript) [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-core) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)

- **Object management**
    - Dependency Injection (DI)
    - Lifecycle callbacks
- **Aspect-Oriented Programming (AOP)**
- **Powerful Exception Handling** (Global and Local)
- **Flexible Router System**
- **Intent-based Event System**
- **Method-level Caching**
- **Data Validation**

# 🚀 Quick start cli
```shell
npm init @dooboostore/simple-boot projectname
cd projectname
npm start
```

```typescript
// index.ts
import 'reflect-metadata';
import { SimpleApplication, Sim, Router } from '@dooboostore/simple-boot';

@Sim // Decorator can be used without parentheses
class Greeter {
  say() {
    console.log('Hello, Simple Boot!');
  }
}

@Sim
@Router({ path: '', route: { '/user': Greeter } })
class AppRouter {}

const app = new SimpleApplication({ rootRouter: AppRouter });
app.run();

// Get instance and call method
const greeter = app.sim(Greeter);
greeter?.say();

// Or, route to the module and execute
app.routing('/user').then(routerModule => {
    routerModule.getModuleInstance<Greeter>()?.say();
});
```

```shell
npx ts-node index.ts
# Hello, Simple Boot!
# Hello, Simple Boot!
```

# 😃 Examples

- [More examples](./examples)

## Object Management

<details>
  <summary><strong>Dependency Injection (DI) & @Sim</strong> 🔻(click)</summary>

`@Sim` is the core decorator that marks a class for management by the Simple Boot container. It can be used with or without parentheses (`@Sim` or `@Sim()`). It handles dependency injection automatically based on constructor parameter types.

```typescript
@Sim // Using without parentheses for default settings
class ProjectService {
  sum(x: number, y: number): number {
    return x + y;
  }
}

@Sim() // Using with parentheses is also valid
class User {
  constructor(private projectService: ProjectService) {}

  calculate() {
    const result = this.projectService.sum(5, 25);
    console.log(`Calculation result is: ${result}`);
  }
}

// somewhere in your app
const user = app.sim(User);
user?.calculate(); //-> Calculation result is: 30
```

### `SimConfig`

You can provide a configuration object to `@Sim` to customize its behavior.

```typescript
export enum Lifecycle {
  Singleton = 'Singleton', // (Default) Same instance every time.
  Transient = 'Transient'  // A new instance is created on each request.
}

export interface SimConfig {
  symbol?: Symbol | Symbol[]; // Register with a Symbol for lookup
  scheme?: string | string[]; // Register with a string scheme for lookup
  scope?: Lifecycle;        // Singleton or Transient
  autoCreate?: boolean;     // Create instance automatically on startup
  proxy?: Function | Function[]; // Apply proxy handlers
  type?: Function | Function[]; // Register under a different type (e.g., an interface)
  using?: Function | Function[]; // Explicitly declare dependencies
}

@Sim({ scope: Lifecycle.Transient, scheme: 'MyService' })
class MyTransientService {}
```

</details>

<details>
  <summary><strong>Lifecycle Callbacks</strong> 🔻(click)</summary>

Classes managed by `@Sim` can hook into lifecycle events.

- **`OnSimCreate`**: Called immediately after the instance is created.
- **`@PostConstruct`**: A decorator for a method that should be called after the instance is created. It's an alternative to `OnSimCreate`.
- **`OnSimCreateCompleted`**: Called after all proxy objects and AOP features have been applied to the instance. The original, proxied `this` is passed as an argument.
- **`OnRouting`**: Called when the router navigates to a component. It receives routing data as an argument.

```typescript
import { OnSimCreate, OnSimCreateCompleted, PostConstruct, Sim, OnRouting, RoutingDataSet } from '@dooboostore/simple-boot';

@Sim
class MyComponent implements OnSimCreate, OnSimCreateCompleted<MyComponent>, OnRouting {
  constructor() {
    console.log('1. Constructor called');
  }

  onSimCreate(): void {
    console.log('2. onSimCreate called');
  }

  @PostConstruct()
  initialize() {
      console.log('3. @PostConstruct method called');
  }

  onSimCreateProxyCompleted(proxyThis: MyComponent): void {
    console.log('4. onSimCreateProxyCompleted called');
    // proxyThis is the fully initialized, proxied instance
  }

  async onRouting(r: RoutingDataSet): Promise<void> {
    console.log('5. onRouting called', r);
  }
}
```

</details>

<details>
<summary><strong>Manual Injection with @Inject</strong> 🔻(click)</summary>

Use `@Inject` for more complex scenarios, like injecting a specific implementation for an interface or abstract class using a `scheme` or `symbol`.

```typescript
abstract class UserServiceBase {}

@Sim({ scheme: 'UserService' })
class UserServiceImpl extends UserServiceBase { /* ... */ }

@Sim
class UserController {
  constructor(
    @Inject({ scheme: 'UserService' }) private userService: UserServiceBase
  ) {}
}
```

</details>

## Aspect-Oriented Programming (AOP)

<details>
  <summary><strong>Method Call AOP (@Before, @After, @Around)</strong> 🔻(click)</summary>

Simple Boot provides decorators to intercept method calls.

- **`@Before`**: Runs before the target method.
- **`@After`**: Runs after the target method completes (regardless of success or failure).
- **`@Around`**: A powerful decorator that wraps the original method, allowing you to control the arguments before execution and the return value after.

```typescript
import { Sim, Before, After, Around, AroundForceReturn } from '@dooboostore/simple-boot';

const LoggingAround = () => Around({
    before: (obj, propertyKey, args) => {
        console.log(`[${propertyKey}] Before with args:`, args);
        // You can modify arguments here
        return args.map(arg => typeof arg === 'number' ? arg * 2 : arg);
    },
    after: (obj, propertyKey, args, beforeReturn) => {
        console.log(`[${propertyKey}] After with result:`, beforeReturn);
        // You can force a different return value
        if (beforeReturn > 10) {
            throw new AroundForceReturn("Value is too high!");
        }
        return beforeReturn;
    }
});

@Sim
class Calculator {
    @Before({ property: 'add' })
    logBefore() {
        console.log('Preparing to add...');
    }

    @After({ property: 'add' })
    logAfter() {
        console.log('Addition complete.');
    }

    @LoggingAround()
    add(a: number, b: number): number {
        console.log('Executing add method');
        return a + b;
    }
}

// Calling calculator.add(3, 4) would output:
// Preparing to add...
// [add] Before with args: [ 3, 4 ]
// Executing add method
// [add] After with result: 14
// Addition complete.
// The final return value would be "Value is too high!" because of AroundForceReturn.
```

</details>

## Exception Handling

<details>
  <summary><strong>@ExceptionHandler (Local & Global)</strong> 🔻(click)</summary>

Simple Boot provides a powerful exception handling mechanism using the `@ExceptionHandler` decorator, which can be used both locally within a class or globally in a dedicated `Advice` class.

### Local Exception Handler

```typescript
class MyError extends Error {}

@Sim
class UserService {
  @ExceptionHandler({ type: MyError })
  handleMyError(e: MyError) {
    console.error(`Caught a specific MyError: ${e.message}`);
  }

  @ExceptionHandler()
  handleAllOtherErrors(e: any) {
    console.error(`Caught a generic error:`, e);
  }

  doSomething() {
    throw new MyError('Something went wrong!');
  }
}
```

### Global Exception Advice

For cross-cutting concerns, you can define handlers in a global advice class.

```typescript
@Sim
class GlobalAdvice {
  @ExceptionHandler({ type: Error })
  handleAllErrors(e: Error) {
    console.log(`[Global Advice] An error occurred: ${e.message}`);
  }
}

// In your application setup
const option = new SimOption({ advice: [GlobalAdvice] });
const app = new SimpleApplication({ rootRouter: AppRouter }, option);
app.run();
```

</details>

## Routing System

<details>
  <summary><strong>@Router and @Route</strong> 🔻(click)</summary>

Simple Boot's routing system maps URL paths to specific classes (`@Sim` modules) or methods within a router class.

### Class-based Routing

Map a path directly to a class. Simple Boot will instantiate it when the route is matched.

```typescript
@Sim
class UserPage {
    // ... logic for the user page
}

@Sim
@Router({
  path: '/app',
  route: {
    '/users': UserPage
  }
})
class AppRouter {}

// Navigating to '/app/users' will activate the UserPage module.
```

### Method-based Routing

Use `@Route` on methods within a `@Router` class to handle specific paths.

```typescript
@Sim
@Router({ path: '/api' })
class ApiRouter {
  @Route({ path: '/health' })
  checkHealth() {
    console.log('API is healthy!');
    return { status: 'ok' };
  }

  @Route({ path: '/users/{id}' })
  getUser(routerModule: RouterModule) {
    const userId = routerModule.pathData?.id;
    console.log(`Fetching user with ID: ${userId}`);
    // ... fetch user logic
  }
}

// Navigating to '/api/health' calls the checkHealth method.
// Navigating to '/api/users/123' calls the getUser method.
```

</details>

## Intent Event System

<details>
  <summary><strong>Publishing and Subscribing with Intent</strong> 🔻(click)</summary>

Simple Boot includes a powerful event system based on `Intent` objects. This allows for decoupled communication between different parts of your application.

- **Publish**: Send an `Intent` to a specific `scheme` or `symbol`.
- **Subscribe**: A method in a `@Sim` module can receive the intent.

```typescript
// Publisher
app.publishIntent('MyService://updateUser', { name: 'Jane Doe' });

// Subscriber
@Sim({ scheme: 'MyService' })
class MyService {
  updateUser(intent: Intent) {
    console.log('Received data:', intent.data); //-> { name: 'Jane Doe' }
  }
}
```

</details>

## Caching System

<details>
  <summary><strong>@Cache Decorator</strong> 🔻(click)</summary>

Simple Boot provides a method-level caching mechanism via the `@Cache` decorator. It can cache the results of a method and automatically handle cache eviction.

### Basic Caching

Cache the result of a method. The cache key is automatically generated from the class and method name.

```typescript
@Sim
class DataService {
    @Cache
    fetchHeavyData() {
        // This expensive operation runs only once.
        console.log('Fetching data...');
        return { data: 'some-heavy-data' };
    }
}
```

### Caching with Dynamic Keys and TTL

```typescript
@Sim
class UserService {
    @Cache({ key: (id: string) => `user:${id}`, ms: 5000 }) // Dynamic key, 5-second TTL
    getUserById(id: string) {
        console.log(`Fetching user ${id} from DB...`);
        return { id, name: 'User ' + id };
    }

    @Cache({ deleteKey: (id: string) => `user:${id}` }) // Clears cache with the matching key
    updateUser(id: string, data: any) {
        console.log(`Updating user ${id}, cache will be cleared.`);
        // ... update logic
    }
}
```

### CacheManager

You can also interact with the cache programmatically by injecting the `CacheManager`.

```typescript
@Sim
class MyCacheController {
    constructor(private cacheManager: CacheManager) {}

    clearUserCache(id: string) {
        this.cacheManager.deleteCacheByKey(`user:${id}`);
    }
}
```

</details>

## Validation System

<details>
  <summary><strong>@Validation Decorator</strong> 🔻(click)</summary>

Simple Boot includes a validation system to ensure the integrity of class properties.

```typescript
import { Sim, Validation, NotEmpty, NotNull, Regexp, execValidationInValid, ValidException } from '@dooboostore/simple-boot';

@Sim
class UserProfile {
    @Validation(NotEmpty)
    @Validation(Regexp(/^[a-zA-Z]+$/))
    name: string = '';

    @Validation(NotNull)
    age: number | null = null;
}

const profile = new UserProfile();
profile.name = '123'; // Invalid name
profile.age = null; // Invalid age

const validationErrors = execValidationInValid(profile);

if (validationErrors.length > 0) {
    throw new ValidException(validationErrors);
}
//-> Throws ValidException with details about 'name' and 'age' fields.
```

</details>

## Global Routing Event Listener: `RouterManager.observable`

Instead of using the `@OnRoute` decorator, you can directly subscribe to the `RouterManager.observable` to react to routing events. This provides a more explicit and flexible way to handle routing changes.

### How to Use

Inject `RouterManager` into your `@Sim`-managed class and subscribe to its `observable` property. It's recommended to manage the subscription lifecycle, for example, by subscribing in `onSimCreate` and unsubscribing in a cleanup method if your class has a specific lifecycle for destruction.

**Example:** A class that listens to all routing events.

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnSimCreate } from '@dooboostore/simple-boot';
import { RouterManager, RoutingDataSet } from '@dooboostore/simple-boot/route/RouterManager';
import { Subscription } from '@dooboostore/core/message/Subscription';

@Sim
class MyRoutingListener implements OnSimCreate {
  private routingSubscription: Subscription;

  constructor(private routerManager: RouterManager) {
    console.log('MyRoutingListener constructor');
  }

  onSimCreate() {
    this.routingSubscription = this.routerManager.observable.subscribe((data: RoutingDataSet) => {
      console.log('Routing event received:', data);
      // Add your logic here to react to routing changes
      // e.g., update UI, log analytics, etc.
    });
  }

  // If your class has a destroy/cleanup lifecycle, you should unsubscribe:
  // onDestroy() { // Assuming anDestroy interface
  //   if (this.routingSubscription) {
  //     this.routingSubscription.unsubscribe();
  //   }
  // }
}
```

### Important: Subscription Management

When subscribing to `RouterManager.observable`, it is crucial to manage the lifecycle of your subscription. If your `@Sim` instance is transient or has a defined destruction lifecycle, ensure you `unsubscribe()` from the `routingSubscription` to prevent memory leaks.


# License

- MIT
- dooboostore@gmail.com