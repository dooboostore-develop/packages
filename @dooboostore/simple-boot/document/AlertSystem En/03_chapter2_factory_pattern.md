# Chapter 2: Separating Environment-Specific Implementations Using the Factory Pattern

In Chapter 1, we designed a structure where `AlertService` delegates alert creation to `AlertFactory`. Why do we have such an intermediate layer? It is to **provide different alert implementations depending on the environment in which the application runs**. This is the core reason for using the Factory Pattern.

## 2.1. Need for the Factory Pattern: Frontend vs. Backend

The application we are building can run in two main environments:

1.  **Frontend (Browser)**: This is the environment where users directly interact. Alerts must be rendered as visual UI components (DOM elements).
2.  **Backend (Node.js / SSR)**: This is the environment where server-side rendering (SSR) or server-side logic itself is executed. There is no DOM here, so visual UI cannot be rendered.

If `AlertService` directly contained UI component creation code like `new DangerAlertComponent()`, this code would cause an error in a backend environment without a DOM. The Factory Pattern elegantly solves this problem.

## 2.2. `FrontAlertFactory`: Frontend Factory with UI

In the frontend environment, `FrontAlertFactory` is used as an implementation of `AlertFactory`. This factory uses a `switch` statement within its `create` method to instantiate the appropriate concrete `Alert` class based on the requested `type`.

**`apps/lazycollect/front/service/alert/FrontAlertFactory.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Alert, AlertType } from '@dooboostore/simple-boot/alert';
import { AlertFactory } from '@dooboostore/simple-boot/alert/AlertFactory';
// ... import concrete Alert classes ...

@Sim({symbol: AlertFactory.SYMBOL}) // Register with the same symbol
export class FrontAlertFactory<T = any> implements AlertFactory<T> {
  // ...
  create(data?: { type?: AlertType | string; ... }): Alert<T> | undefined {
    console.log('--- FrontAlertFactory --- creating alert for type:', data?.type);
    switch (data?.type) {
      case AlertType.DANGER:
        return new DangerAlert(this.alertService, data.config);
      // ... other types ...
    }
    return undefined;
  }
}
```
`FrontAlertFactory` is the **only place that knows about `Alert` classes that contain the logic to create actual UI components**, such as `DangerAlert`.

## 2.3. `BackAlertFactory`: Non-UI Alert Handler

The name `Alert` does not only refer to UI pop-up windows. In a broader sense, `Alert` is a signal indicating that **'an important event that needs attention has occurred'**. How this signal is handled in a backend environment can be completely different from the frontend.

For example, let's assume a `danger` type alert was requested because a 500 error occurred in `ApiService`. In the backend, instead of displaying it as UI, **logging the event to a file or an external system, recognizing its severity**, is a much more useful action.

`BackAlertFactory` defines precisely this kind of server-specific behavior.

**`apps/lazycollect/backend/service/alert/BackAlertFactory.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Alert, AlertType } from '@dooboostore/simple-boot/alert';
import { AlertFactory } from '@dooboostore/simple-boot/alert/AlertFactory';
import { LoggingService } from '@backend/service/LoggingService'; // Fictional logging service

@Sim({symbol: AlertFactory.SYMBOL}) // Register with the same symbol
export class BackAlertFactory<T = any> implements AlertFactory<T> {
  // Inject logging service via DI
  constructor(private loggingService: LoggingService) {}

  create(data?: { type?: AlertType | string; config?: AlertFactoryConfig<T> }): Alert<T> | undefined {
    const { type, config } = data ?? {};
    console.log(`--- BackAlertFactory --- Handling event of type: ${type}`);

    // Integrate 'DANGER' or 'ERROR' type alerts with the logging system
    if (type === AlertType.DANGER || type === AlertType.ERROR) {
      // Create an Alert object that performs logging instead of creating UI
      return new (class extends Alert<T> {
        // Logging logic is executed when make() is called
        protected make(): void | T {
          const logMessage = `Critical Event: ${config?.title ?? 'No title'}`;
          // Use the injected logging service to log the error
          this.loggingService.error(logMessage, config?.data);
        }
      })(this.alertService, config);
    }

    // For other types, return a dummy object that does nothing
    return new (class extends Alert<T> {
      protected make(): void | T {}
    })(this.alertService, config);
  }
}
```
Now, `BackAlertFactory` is no longer a passive 'dummy' object. When important events like `DANGER` or `ERROR` occur, it becomes an active handler that detects them and logs them via `LoggingService`. In this way, `AlertSystem` can be extended beyond a simple UI system to a **general-purpose event processing system that performs different actions depending on the environment**.

## 2.4. Factory Selection through Dependency Injection (DI)

So, how does `AlertService` know when to use `FrontAlertFactory` and when to use `BackAlertFactory`? The answer lies in **Dependency Injection**.

-   In the frontend application's entry point (`front/index.ts`), `FrontAlertFactory` is registered with the DI container.
-   In the backend application's entry point (`backend/index.ts`), `LoggingService` and `BackAlertFactory` (which uses it) are registered with the DI container.

Since both factories are registered using the same `AlertFactory.SYMBOL`, `AlertService` will be injected with the correct factory for the execution environment without any changes to its own code.

```typescript
// AlertService.ts constructor
constructor(
  // @Inject finds and injects the implementation with AlertFactory.SYMBOL
  // registered in the container at runtime.
  @Inject({symbol: AlertFactory.SYMBOL}) alertFactory: AlertFactory<T>
) {
  this.alertFactory = alertFactory;
}
```

As such, using the Factory Pattern and Dependency Injection together allows us to encapsulate the details of environment-specific implementations within low-level factory modules. High-level modules like `AlertService` can operate consistently by relying only on the abstract `AlertFactory` interface, without needing to know anything about the concrete implementations.

In the next chapter, we will examine how the concrete `Alert` classes created by `FrontAlertFactory` are connected to actual UI components.
