# Chapter 1: Core Management System - DI and Lifecycle

At the heart of every application framework is a system that creates and manages objects. This system efficiently handles dependencies between objects and manages their lifecycle, maximizing code flexibility and reusability. This chapter explores how to design and implement Simple-Boot's Dependency Injection (DI) container and object lifecycle management mechanism.

## 1.1. The Necessity of Dependency Injection (DI)

Dependency Injection (DI) is a design pattern where objects receive the other objects they need (dependencies) from an external source (DI container) instead of creating or finding them directly. This offers the following benefits:

-   **Loose Coupling:** Objects do not directly depend on each other's implementations, minimizing the impact of changes in one object on others.
-   **Increased Reusability:** Not being tied to specific environments or dependencies makes it easier to reuse objects in various contexts.
-   **Testability:** It facilitates unit testing by allowing easy injection of Mock objects instead of actual dependencies during testing.

Simple-Boot uses the `@Sim` decorator to register classes with the DI container and supports constructor-based dependency injection.

## 1.2. `@Sim` Decorator and SimstanceManager

The `@Sim` decorator registers a class with Simple-Boot's DI container (`SimstanceManager`). Classes annotated with `@Sim` are managed by the container and can receive or retrieve instances from the container when needed.

### Implementation of `@Sim` Decorator

The `@Sim` decorator uses `Reflect.defineMetadata` to add metadata to a class. This metadata indicates that the class should be managed by the DI container and can define object management policies such as `Lifecycle` (Singleton or Transient), `scheme`, and `symbol`.

```typescript
// decorators/SimDecorator.ts
export const SimMetadataKey = Symbol('Sim');

export function Sim(configOrTarget: SimConfig | ConstructorType<any> | Function): void | GenericClassDecorator<ConstructorType<any> | Function> {
  if (typeof configOrTarget === 'function') {
    // When @Sim decorator is used without arguments (e.g., @Sim)
    simProcess({}, configOrTarget);
  } else {
    // When @Sim decorator is used with arguments (e.g., @Sim({ scope: Lifecycle.Transient }))
    return (target: ConstructorType<any> | Function) => {
      simProcess(configOrTarget, target);
    }
  }
}

const simProcess = (config: SimConfig, target: ConstructorType<any> | Function | any) => {
  // Defines config metadata on the class with the SimMetadataKey symbol.
  ReflectUtils.defineMetadata(SimMetadataKey, config, target);
  // ... class registration logic to container ...
}
```

### Role of `SimstanceManager`

`SimstanceManager` is the core of Simple-Boot's DI container. This class performs the following key functions:

-   **Object Registration:** Internally manages all classes annotated with the `@Sim` decorator.
-   **Dependency Resolution:** When creating an object, it automatically finds and injects the necessary dependencies into the object's constructor. This is implemented by using `Reflect.getMetadata('design:paramtypes', target)` to obtain the types of the constructor parameters.
-   **Object Lifecycle Management:** Objects configured as `Lifecycle.Singleton` are created once and reused, while `Lifecycle.Transient` objects are newly created for each request.
-   **Proxy Application:** Applies a Proxy at the time of object creation to implement cross-cutting concerns such as AOP and exception handling.

```typescript
// simstance/SimstanceManager.ts (conceptual)
export class SimstanceManager {
  private storage = new Map<ConstructorType<any> | Function, Map<ConstructorType<any> | Function, any>>();

  // ... constructor ...

  resolve<T>({ targetKey, newInstanceCarrier }: { targetKey: ConstructorType<any> | Function, newInstanceCarrier?: Carrier }): T {
    // 1. Check if a singleton instance has already been created
    const registed = this.getStoreSet(targetKey);
    if (registed?.instance) {
      return registed.instance;
    }

    // 2. Obtain constructor parameter types (dependencies) and recursively call resolve
    const paramTypes = ReflectUtils.getParameterTypes(targetKey);
    const dependencies = paramTypes.map(depType => this.resolve({ targetKey: depType, newInstanceCarrier }));

    // 3. Create object
    const instance = new (targetKey as ConstructorType<T>)(...dependencies);

    // 4. Apply proxy
    const proxiedInstance = this.proxy(instance);

    // 5. Store according to lifecycle (Singleton)
    const simConfig = getSim(targetKey);
    if (simConfig?.scope === Lifecycle.Singleton) {
      this.setStoreSet(targetKey, proxiedInstance);
    }

    return proxiedInstance;
  }

  // ... other methods like setStoreSet, proxy ...
}
```

### Example: Using `@Sim` Decorator and DI Container

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Lifecycle } from '@dooboostore/simple-boot';

// Service class to be injected as a dependency
@Sim // Register with DI container using @Sim decorator
class ProjectService {
  sum(x: number, y: number): number {
    return x + y;
  }
}

// Class that depends on ProjectService
@Sim() // @Sim() or @Sim are both possible
class User {
  // ProjectService is injected via constructor parameter
  constructor(private projectService: ProjectService) {}

  calculate() {
    const result = this.projectService.sum(5, 25);
    console.log(`Calculation result is: ${result}`);
  }
}

// Create and run SimpleApplication instance
const app = new SimpleApplication();
app.run();

// Retrieve User instance from DI container
const user = app.sim(User);
user?.calculate(); //-> Calculation result is: 30

// Pass configuration object to @Sim decorator
@Sim({ scope: Lifecycle.Transient, scheme: 'MyTransientService' })
class MyTransientService {
  private id: number;
  constructor() {
    this.id = Math.random();
    console.log(`MyTransientService instance created with ID: ${this.id}`);
  }
}

const service1 = app.sim(MyTransientService);
const service2 = app.sim(MyTransientService);
// service1 and service2 are different instances (Transient scope)
```

## 1.3. Object Lifecycle Callbacks

Simple-Boot provides lifecycle callbacks that allow developers to execute code at specific points when an object is created and initialized. This is useful for initial object setup or resource loading.

-   **`OnSimCreate` Interface:** Called immediately after an object instance is created. Complex initialization logic or logic that uses other dependencies, which cannot be done in the constructor, can be placed here.

    ```typescript
    // lifecycle/OnSimCreate.ts
    export interface OnSimCreate {
        onSimCreate(): void;
    }
    ```

-   **`@PostConstruct` Decorator:** Applied to a specific method to ensure that the method is automatically called after the object instance is created. Similar to `OnSimCreate`, but allows for finer-grained control at the method level.

    ```typescript
    // decorators/SimDecorator.ts
    export const PostConstruct = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      // ... metadata definition ...
    }
    ```

-   **`OnSimCreateCompleted` Interface:** Called after the object instance is created and all proxy and AOP functionalities have been applied. It receives the fully initialized object itself (`proxyThis`) as an argument, which is useful when additional operations are needed on the final proxied object.

    ```typescript
    // lifecycle/OnSimCreateCompleted.ts
    export interface OnSimCreateCompleted<T = any> {
        onSimCreateProxyCompleted(proxyThis: T): void;
    }
    ```

`SimstanceManager` checks for the implementation of these interfaces or the presence of the `@PostConstruct` decorator during object creation and calls the corresponding methods at the appropriate time.

### Example: Using Object Lifecycle Callbacks

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, OnSimCreate, PostConstruct, OnSimCreateCompleted } from '@dooboostore/simple-boot';

@Sim
class MyComponent implements OnSimCreate, OnSimCreateCompleted<MyComponent> {
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
    // proxyThis is the fully initialized and proxied instance.
    // At this point, all functionalities like AOP, exception handling, etc., are active.
  }
}

const app = new SimpleApplication();
app.run();

// When MyComponent instance is retrieved, the above callbacks are called in order.
app.sim(MyComponent);
```

In this chapter, we explored Simple-Boot's core DI container and object lifecycle management system. The next chapter will cover how to implement AOP and a robust exception handling system based on this object management system to address cross-cutting concerns in applications.
