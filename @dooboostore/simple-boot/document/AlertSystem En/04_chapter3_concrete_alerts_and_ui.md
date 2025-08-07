# Chapter 3: Integrating Concrete Alerts with UI Components

So far, we have learned about the abstract `Alert` and `AlertFactory`. Now, let's look at how to create concrete `Alert` classes to be used in the frontend and connect them to actual UI components so that the system can actually function.

## 3.1. `Alert` Class Inheritance and `make()` Method Implementation

Creating a new type of alert begins with inheriting the `Alert` abstract class and implementing the `make()` abstract method. The role of the `make()` method is to **create and return an instance of the alert's visual representation, i.e., a UI component**.

Let's take the `DangerAlert` class as an example. This class is responsible for displaying a red alert to the user, indicating a dangerous or failed situation.

**`apps/lazycollect/front/service/alert/DangerAlert.ts`**
```typescript
import { Alert } from '@dooboostore/simple-boot/alert';
import { AlertService } from '@dooboostore/simple-boot/alert/AlertService';
import { AlertFactoryConfig } from '@dooboostore/simple-boot/alert/AlertFactoryConfig';
// Import the component that will handle the actual UI.
import { DangerAlertComponent } from '@src/component/alert/danger/DangerAlertComponent';

export class DangerAlert<T = any> extends Alert<T> {
  constructor(alertService?: AlertService<T>, config?: AlertFactoryConfig<T>) {
    super(alertService, config);
  }

  /**
   * The actual UI component is created in this method.
   * @protected
   */
  protected make(): void | T {
    // Create and return a new instance of DangerAlertComponent.
    return new DangerAlertComponent() as T;
  }
}
```

## 3.2. Meeting of `make()` Method and UI Components

The most important part of the above code is `new DangerAlertComponent()` inside the `make()` method. This single line is the **point where abstract data (Alert) and concrete view (UI Component) meet**.

-   **`DangerAlert` (Data/Logic Layer)**: A logical object that defines the alert's data (`config`) and behavior (`active`, `deActive`).
-   **`DangerAlertComponent` (View Layer)**: A pure UI component with actual HTML templates, CSS styles, and user interaction logic. This component is built using a view library like `@dooboostore/dom-render`.

`AlertSystem` clearly separates these two layers. Higher-level services like `AlertService` or `ApiService` do not need to know anything about the existence of `DangerAlertComponent`. They only interact with the abstract `Alert` object.

## 3.3. System Flexibility

This structure provides tremendous flexibility to the system.

-   **UI Library Replacement**: If you later want to replace the UI with a different view library (e.g., React, Vue) instead of `dom-render`, you only need to modify the internal implementation of `DangerAlertComponent` to match the new library. No changes are needed for other parts of the system, such as the `DangerAlert` class, `FrontAlertFactory`, or `AlertService`.
-   **Adding New Alert Types**: If you want to add a green alert indicating 'success', you only need to follow these steps:
    1.  Create a `SuccessAlertComponent` to handle the UI.
    2.  Create a `SuccessAlert` class that inherits from `Alert` and implement its `make()` method to return `new SuccessAlertComponent()`.
    3.  Add `case AlertType.SUCCESS:` to the `switch` statement of `FrontAlertFactory` to return `new SuccessAlert()`.

That's it. `AlertService` can now instantly create new success alerts via the `alertService.success()` method.

As such, a simple rule of delegating UI component creation through the `make()` method is the key to making the entire system flexible and extensible.

In the next chapter, we will learn how to actually render and manage the UI component instances created in this way, using reactive management techniques with RxJS.
