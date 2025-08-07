# Chapter 5: The Foundation of the Framework - Core Architecture

Simple-Boot is built upon a robust core architecture that organically connects and manages various functionalities. This chapter deeply explores the role of `SimpleApplication`, the heart of the framework, metadata management, and the dynamic extension mechanism utilizing Proxy.

## 5.1. The Role of SimpleApplication

`SimpleApplication` is the entry point of the Simple-Boot framework and a container that integrates and manages all core components. When the application starts, a `SimpleApplication` instance is created, and through this instance, all framework functionalities such as dependency injection, routing, and Intent publishing can be used.

Internally, `SimpleApplication` initializes and manages the following key managers:

-   **`SimstanceManager`:** As the core of the Dependency Injection (DI) container, it is responsible for the creation, management, and dependency resolution of all objects registered with `@Sim`.
-   **`IntentManager`:** Manages the Intent-based event system, mediating the publishing and subscribing of Intents.
-   **`RouterManager`:** Manages the application's routing system, connecting requests to appropriate modules or methods.

`SimpleApplication` creates instances of these managers and injects dependencies between them, ensuring that all framework functionalities are organically linked. Additionally, it manages application-wide settings through the `SimOption` object.

```typescript
// SimpleApplication.ts (Conceptual)
export class SimpleApplication {
  public simstanceManager: SimstanceManager;
  public intentManager: IntentManager;
  public routerManager: RouterManager;

  constructor(public option: SimOption = new SimOption()) {
    // Initialize SimstanceManager and register itself (SimpleApplication) and SimstanceManager itself
    this.simstanceManager = new SimstanceManager(this, option);
    this.simstanceManager.setStoreSet(SimpleApplication, this);
    this.simstanceManager.setStoreSet(SimstanceManager, this.simstanceManager);

    // Initialize IntentManager and RouterManager and apply proxy
    this.intentManager = this.simstanceManager.proxy(new IntentManager(this.simstanceManager));
    this.routerManager = this.simstanceManager.proxy(new RouterManager(this.simstanceManager, option.rootRouter));

    // Register initialized managers with SimstanceManager
    this.simstanceManager.setStoreSet(IntentManager, this.intentManager);
    this.simstanceManager.setStoreSet(RouterManager, this.routerManager);
  }

  public run() {
    // Initialize all @Sim objects via SimstanceManager and start lifecycle management
    this.simstanceManager.run();
  }

  // ... sim(), publishIntent(), routing() etc. externally accessible methods ...
}
```

## 5.2. Metadata Management and Reflect API

Simple-Boot's core functionalities (DI, AOP, routing, caching, validation) all operate based on **metadata**. Metadata refers to information about the code itself (e.g., additional information about classes, methods, properties), and this information is used at runtime to implement dynamic behavior.

Simple-Boot manages metadata using TypeScript decorators and the `reflect-metadata` library.

-   **Decorators:** All decorators such as `@Sim`, `@PostConstruct`, `@Before`, `@Router` play a role in adding metadata to classes, methods, properties, and parameters.
-   **`reflect-metadata`:** Extends JavaScript's `Reflect` object, providing APIs to define and query metadata at runtime. Methods like `Reflect.defineMetadata` and `Reflect.getMetadata` are used.

### The Role of `ReflectUtils`

`ReflectUtils` is a utility class that wraps the `reflect-metadata` API to help Simple-Boot handle metadata consistently and safely internally. A typical example is using `ReflectUtils.getMetadata('design:paramtypes', target)` to obtain the parameter types of constructors or methods, which is then used for dependency injection.

```typescript
// utils/reflect/ReflectUtils.ts (Conceptual)
export class ReflectUtils {
  static getParameterTypes(target: any, propertyKey?: string | symbol): ConstructorType<any>[] {
    // The 'design:paramtypes' metadata is recorded by the TypeScript compiler for constructor/method parameter types.
    return Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
  }

  static defineMetadata(metadataKey: any, value: any, target: any, propertyKey?: string | symbol) {
    // Defines metadata with a specific key.
    Reflect.defineMetadata(metadataKey, value, target, propertyKey);
  }

  static getMetadata<T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T | undefined {
    // Queries metadata defined with a specific key.
    return Reflect.getMetadata(metadataKey, target, propertyKey);
  }
  // ... other metadata-related utility methods ...
}
```

## 5.3. Dynamic Extension Using Proxy

Many of Simple-Boot's features, such as AOP, exception handling, and caching, are implemented using JavaScript's `Proxy` object. `Proxy` is a powerful mechanism that can intercept operations on an object (e.g., property access, method calls) and add custom behavior.

### The Role of `SimProxyHandler`

`SimProxyHandler` is used as a handler for `Proxy` objects and intercepts method calls of objects managed by `@Sim` to apply AOP, exception handling, and caching logic. After creating an object, `SimstanceManager` wraps the object with this `SimProxyHandler` as a proxy.

-   **`apply` trap:** Intercepts method calls to execute `@Before`, `@After`, `@Around` advices, and calls `@ExceptionHandler` when an exception occurs.
-   **`get`, `set` traps:** Intercepts property access and assignment of objects to provide access to internal framework objects like `SimpleApplication`, `SimstanceManager`, or recursively apply other proxies.

```typescript
// proxy/SimProxyHandler.ts (Conceptual)
export class SimProxyHandler implements ProxyHandler<any> {
  // ... constructor ...

  apply(target: Function, thisArg: any, argumentsList?: any[]): any {
    // Core logic for intercepting method calls
    // 1. Execute AOP @Before, @Around(before) 실행
    // 2. 원본 메소드 실행
    // 3. AOP @After, @Around(after) 실행
    // 4. 예외 발생 시 @ExceptionHandler 실행
    // ...
  }

  get(target: any, name: string): any {
    // Return internal framework objects when specific properties are accessed
    if (name === '_SimpleBoot_application') {
      return this.simpleApplication;
    } else if (name === '_SimpleBoot_simstanceManager') {
      return this.simstanceManager;
    } // ...
    return target[name];
  }

  set(obj: any, prop: string, value: any, receiver: any): boolean {
    // Recursively apply proxy when properties are assigned
    value = this.simstanceManager?.proxy(value);
    obj[prop] = value;
    return true;
  }
  // ...
}
```

Through such `Proxy` objects, Simple-Boot builds a powerful and flexible architecture that can dynamically inject various cross-cutting concerns and extend object behavior without altering core business logic.

In this chapter, we explored `SimpleApplication`, metadata management, and the use of `Proxy` that constitute Simple-Boot's core architecture. With this, we have investigated all major functionalities of Simple-Boot and the underlying design principles.

In the next appendix, we will objectively evaluate the pros and cons of the Simple-Boot architecture, share ideas on how to extend or contribute to the framework, and a growth roadmap as a framework developer.
