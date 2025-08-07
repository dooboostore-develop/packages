# Chapter 1: Core Abstractions - `Alert`, `AlertService`, `AlertFactory`

A robust system is built upon well-defined abstractions. At the heart of `AlertSystem` are three core abstractions: `Alert`, `AlertService`, and `AlertFactory`. Understanding their roles and relationships is the first step to grasping the entire system.

## 1.1. `Alert`: The Foundation of All Notifications

`Alert` is an abstract class that defines the basic contract that all types of notifications used in the system must adhere to. It is a pure concept, independent of any specific UI framework or style.

**`@dooboostore/simple-boot/src/alert/Alert.ts`**
```typescript
export abstract class Alert<T> {
  // ... (properties: isActive, uuid, config, etc.)

  constructor(
    public alertService?: AlertService<T>,
    public config?: AlertFactoryConfig<T>
  ) {
    // ...
  }

  // Method to activate (display on screen) the alert
  async active(): Promise<void> {
    // ... common activation logic ...
    this.result = this.make(); // Calls make() implemented by the child class
    this.alertService?.publish({action: AlertAction.ACTIVE, alert: this});
    // ...
  }

  // Method to deactivate (remove from screen) the alert
  async deActive(): Promise<void> {
    // ... common deactivation logic ...
    this.alertService?.publish({action: AlertAction.DE_ACTIVE, alert: this});
    // ...
  }

  // Abstract method that must be implemented by child classes
  // Responsible for creating the actual content of the alert (e.g., UI component)
  protected abstract make(): T | void;
}
```

-   **`active()` / `deActive()`**: These are common lifecycle methods that all alerts must have. These methods include common logic to be executed before/after the alert, as well as code to notify the external system of the current state via `alertService`.
-   **`make()`**: This is the core of the `Alert` class. Declared as `abstract`, this method must be implemented by all concrete alert classes (e.g., `DangerAlert`, `ProgressAlert`) that inherit from `Alert`, each in its own way. The `make()` method is responsible for **creating and returning the essence of the alert that will actually be displayed on the screen (e.g., DOM element, UI component instance)**.

## 1.2. `AlertService`: The Central Hub for Alert Management

`AlertService` is the sole point of contact (Facade) through which other parts of the application interact to create and manage alerts.

**`@dooboostore/simple-boot/src/alert/AlertService.ts`**
```typescript
@Sim
export class AlertService<T> implements Store<AlertService.AlertActionContainer<T>> {
  private subject = new ReplaySubject<AlertService.AlertActionContainer<T>>();
  private alertFactory?: AlertFactory<T>;

  constructor(
    @Inject({symbol: AlertFactory.SYMBOL}) alertFactory: AlertFactory<T>
  ) {
    this.alertFactory = alertFactory;
  }

  // ... (observable, publish methods)

  // Delegates alert creation to the factory based on type
  createFromFactory(type: AlertType, config?: AlertFactoryConfig<T>) {
    return this.alertFactory?.create({ caller: this, type, config: config });
  }

  // Convenience methods
  danger(config?: AlertFactoryConfig<T>) {
    return this.createFromFactory(AlertType.DANGER, config);
  }

  progress(config?: AlertFactoryConfig<T>) {
    return this.createFromFactory(AlertType.PROGRESS, config);
  }
  // ... (success, info, etc.)
}
```

-   **Centralized Management**: Provides intuitively named methods like `danger()`, `progress()`, allowing clients who need alerts to request them simply without complex creation processes.
-   **Delegation of Creation Responsibility**: `AlertService` does not create alerts directly. Instead, it delegates alert creation to the `alertFactory` injected into its constructor. This is an important design that clearly separates the responsibilities of the service.

## 1.3. `AlertFactory`: Responsibility for Alert Creation

`AlertFactory` is the interface of a Factory that is responsible for deciding what kind of `Alert` object to create and actually creating it.

**`@dooboostore/simple-boot/src/alert/AlertFactory.ts`**
```typescript
export namespace AlertFactory {
 export const SYMBOL: Symbol= Symbol('AlertFactory');
}

export interface AlertFactory<T> {
  create(data?: {
    caller?: any;
    type?: AlertType | string;
    config?: AlertFactoryConfig<T>;
  }): Alert<T> | undefined;
}
```

-   **`SYMBOL`**: A unique identifier used by the `simple-boot` DI container to find the correct `AlertFactory` implementation and inject it into `AlertService`.
-   **`create()`**: This is the core method of this interface. It takes `type` and `config` as arguments and creates and returns a concrete `Alert` instance that matches them.

## 1.4. Relationship Summary

`Client` -> `AlertService` -> `AlertFactory` -> `new ConcreteAlert()`

1.  **Client** (e.g., `ApiService`) calls a method of **`AlertService`** (e.g., `danger()`) when a specific type of alert is needed.
2.  **`AlertService`** has the type `danger` and calls the `create()` method of the injected **`AlertFactory`**.
3.  The implementation of **`AlertFactory`** (e.g., `FrontAlertFactory`) executes the code **`new DangerAlert()`** that matches the `danger` type, creating and returning a concrete alert object.

Thanks to this abstraction layer, `ApiService` does not need to know anything about the existence of `DangerAlert` or `FrontAlertFactory`, and only depends on the `AlertService` interface. This is the core of **Loose Coupling**.

In the next chapter, we will delve into how this factory pattern is used to create different alerts depending on frontend and backend environments.
