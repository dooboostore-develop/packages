# Chapter 2: Handling Cross-cutting Concerns - AOP and Exception Handling

In application development, common functionalities that repeatedly appear across multiple modules, such as logging, security, and transaction management, are called **Cross-cutting Concerns**. Aspect-Oriented Programming (AOP) is a programming paradigm that modularizes these cross-cutting concerns to reduce code duplication and improve maintainability. This chapter explores how Simple-Boot implements AOP and a robust exception handling system.

## 2.1. Understanding Aspect-Oriented Programming (AOP)

AOP is a development approach that separates core business logic from cross-cutting concerns. The main concepts of AOP are as follows:

-   **Aspect:** A modularized unit of cross-cutting concerns (e.g., logging aspect, security aspect).
-   **Join Point:** A specific point during program execution, such as a method call or field access.
-   **Advice:** Code to be executed at a join point (e.g., `Before` advice executes before method execution, `After` advice executes after method execution).
-   **Pointcut:** An expression that specifies the join points where advice should be applied.

Simple-Boot implements AOP by using decorators to intercept method calls.

## 2.2. `@Before`, `@After`, `@Around` Decorators

Simple-Boot provides `@Before`, `@After`, and `@Around` decorators to apply AOP at the method level. These decorators work by intercepting method calls within `SimProxyHandler`.

-   **`@Before`:** Defines logic to be executed before the target method runs. (e.g., input validation, permission checks)
-   **`@After`:** Defines logic to be executed after the target method has run. It always executes regardless of the method's outcome. (e.g., logging, resource cleanup)
-   **`@Around`:** Wraps the target method call itself, allowing control over the entire process before and after method execution. It provides the most powerful control, such as modifying method arguments, preventing method execution, or returning a different value.

### Implementation Principle

The `@Before`, `@After`, and `@Around` decorators use `Reflect.defineMetadata` to add AOP-related metadata to methods. When `SimstanceManager` creates an object, its methods are wrapped by `SimProxyHandler`.

The `apply` trap of `SimProxyHandler` intercepts method calls, checks for `@Before`, `@After`, and `@Around` metadata applied to the method, and executes the defined advice logic.

```typescript
// proxy/SimProxyHandler.ts (Conceptual)
export class SimProxyHandler implements ProxyHandler<any> {
  // ... constructor, get, set ...

  apply(target: Function, thisArg: any, argumentsList?: any[]): any {
    let result;
    try {
      // 1. Execute @Before advice
      this.aopBefore(thisArg, target);

      // 2. Execute @Around advice's before logic and modify arguments
      // (Actual implementation is done by wrapping the method inside the @Around decorator)

      // 3. Execute original method
      result = Reflect.apply(target, thisArg, argumentsList);

    } finally {
      // 4. Execute @After advice
      this.aopAfter(thisArg, target);

      // 5. Execute @Around advice's after logic and modify return value
    }
    return result;
  }

  // ... aopBefore, aopAfter methods ...
}
```

### Example: Using AOP Decorators

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Before, After, Around, AroundForceReturn } from '@dooboostore/simple-boot';

@Sim
class Calculator {
    @Before({ property: 'add' })
    logBeforeAdd() {
        console.log('Preparing to add...');
    }

    @After({ property: 'add' })
    logAfterAdd() {
        console.log('Addition complete.' );
    }

    @Around({
        before: (obj, propertyKey, args) => {
            console.log(`[${String(propertyKey)}] Before with args:`, args);
            // Modify arguments to double them
            return args.map(arg => typeof arg === 'number' ? arg * 2 : arg);
        },
        after: (obj, propertyKey, args, beforeReturn) => {
            console.log(`[${String(propertyKey)}] After with result:`, beforeReturn);
            // Force return by throwing an exception if return value is greater than 10
            if (beforeReturn > 10) {
                throw new AroundForceReturn("Value is too high!");
            }
            return beforeReturn;
        }
    })
    add(a: number, b: number): number {
        console.log('Executing add method');
        return a + b;
    }
}

const app = new SimpleApplication();
app.run();

const calculator = app.sim(Calculator);

console.log('-- Calling add(3, 4) --');
try {
    const result1 = calculator?.add(3, 4);
    console.log('Result 1:', result1);
} catch (e: any) {
    console.error('Error 1:', e.message);
}

console.log('\n-- Calling add(1, 1) --');
try {
    const result2 = calculator?.add(1, 1);
    console.log('Result 2:', result2);
} catch (e: any) {
    console.error('Error 2:', e.message);
}

/* Expected Output:
-- Calling add(3, 4) --
Preparing to add...
[add] Before with args: [ 3, 4 ]
Executing add method
[add] After with result: 14
Error 1: Value is too high!

-- Calling add(1, 1) --
Preparing to add...
[add] Before with args: [ 1, 1 ]
Executing add method
[add] After with result: 2
Result 2: 2
*/
```

## 2.3. Robust Exception Handling System

Consistently and effectively handling exceptions that occur in an application is crucial. Simple-Boot provides a local and global exception handling system through the `@ExceptionHandler` decorator.

-   **Local Exception Handling:** Exceptions occurring within a specific class are handled by the `@ExceptionHandler` method in that class. Fine-grained control can be achieved by specifying a particular exception type (`type`).
-   **Global Exception Handling (Advice):** Classes registered in the `advice` option when configuring `SimpleApplication` act as global exception handlers. They can handle exceptions occurring throughout the application in one place, providing consistent error responses or logging.

### Implementation Principle

The `@ExceptionHandler` decorator adds exception handling-related metadata to methods. If an exception occurs during method execution within the `apply` trap of `SimProxyHandler`, it searches for and executes an exception handler in the following order:

1.  **Local Handler Search:** Searches for an `@ExceptionHandler` method matching the exception type within the object (`thisArg`) where the exception occurred.
2.  **Global Handler Search:** If no local handler is found, or if the local handler re-throws the exception (`throw: true`), it searches for an `@ExceptionHandler` method matching the exception type within the `advice` classes registered in `SimpleApplication`.
3.  **Handler Execution:** Executes the found exception handler method. The exception object (`Error`) and original method arguments (`argumentsList`) can be injected into this method.

```typescript
// proxy/SimProxyHandler.ts (Conceptual)
export class SimProxyHandler implements ProxyHandler<any> {
  // ... catch block inside apply method ...
  try {
    // ... execute original method ...
  } catch (e: Error | any) {
    // 1. Search for exception handler
    const inHandlers = this.getExceptionHandler(e, thisArg, target); // Search local and global handlers

    if (inHandlers.length > 0 && inHandlers[0]) {
      const inHandler = inHandlers[0];
      // 2. Execute exception handler
      this.executeExceptionHandler(e, inHandler, argumentsList);
    } else {
      // 3. If no handler is found, re-throw the exception
      throw e;
    }
  }
  // ...
}
```

### Example: Using `@ExceptionHandler` Decorator

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, ExceptionHandler, SimOption } from '@dooboostore/simple-boot';

// Custom Error Class
class MyCustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MyCustomError';
    }
}

@Sim
class UserService {
    // Local handler that only handles exceptions of type MyCustomError
    @ExceptionHandler({ type: MyCustomError })
    handleMyCustomError(e: MyCustomError) {
        console.error(`[UserService] Caught MyCustomError: ${e.message}`);
    }

    // Local handler that handles all other exceptions (handles the most general exception)
    @ExceptionHandler()
    handleGenericError(e: Error) {
        console.error(`[UserService] Caught generic error: ${e.message}`);
    }

    doSomethingRisky(value: number) {
        if (value < 0) {
            throw new MyCustomError('Value cannot be negative');
        } else if (value === 0) {
            throw new Error('Value cannot be zero');
        }
        console.log(`Processing value: ${value}`);
    }
}

// Advice class for global exception handling
@Sim
class GlobalErrorAdvice {
    @ExceptionHandler({ type: Error }) // Handles all Error types
    handleAllErrorsGlobally(e: Error) {
        console.log(`[GlobalAdvice] A global error occurred: ${e.message}`);
    }
}

// Application configuration
const appOption = new SimOption({
    advice: [GlobalErrorAdvice] // Register global exception handler
});
const app = new SimpleApplication(appOption);
app.run();

const userService = app.sim(UserService);

console.log('-- Calling doSomethingRisky(-5) --');
userService?.doSomethingRisky(-5);
// Expected Output:
// [UserService] Caught MyCustomError: Value cannot be negative

console.log('\n-- Calling doSomethingRisky(0) --');
userService?.doSomethingRisky(0);
// Expected Output:
// [UserService] Caught generic error: Value cannot be zero

console.log('\n-- Calling doSomethingRisky(10) --');
userService?.doSomethingRisky(10);
// Expected Output:
// Processing value: 10

// When an exception without a handler in UserService occurs, the global handler acts
@Sim
class AnotherService {
    doAnotherRiskyThing() {
        throw new TypeError('This is a TypeError');
    }
}

const anotherService = app.sim(AnotherService);
console.log('\n-- Calling doAnotherRiskyThing() --');
anotherService?.doAnotherRiskyThing();
// Expected Output:
// [GlobalAdvice] A global error occurred: This is a TypeError
```

Through this AOP and exception handling system, Simple-Boot provides powerful tools that clearly separate core business logic from cross-cutting concerns and enhance application stability.

In the next chapter, we will explore how to implement a routing system to control application flow and an Intent system for loosely coupled communication.
