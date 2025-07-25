# Building a Flexible and Extensible Notification System with `AlertSystem`

## Table of Contents

-   [**Introduction: Why Build a New Alert System?**](./01_introduction.md)
    -   `AlertSystem`의 핵심 특징

-   [**Chapter 1: Core Abstractions - `Alert`, `AlertService`, `AlertFactory`**](./02_chapter1_core_abstractions.md)
    -   `Alert`: Abstract class serving as the base for all notifications
    -   `AlertService`: Central service for requesting and managing notifications
    -   `AlertFactory`: Factory interface delegating notification creation

-   [**Chapter 2: Separating Environment-Specific Implementations Using the Factory Pattern**](./03_chapter2_factory_pattern.md)
    -   Need for the Factory Pattern: Frontend vs. Backend
    -   `FrontAlertFactory`: Frontend factory implementation with UI
    -   `BackAlertFactory`: Non-UI notification handler
    -   Factory selection through Dependency Injection

-   [**Chapter 3: Integrating Concrete Alerts with UI Components**](./04_chapter3_concrete_alerts_and_ui.md)
    -   `Alert` class inheritance and `make()` method implementation
    -   `DangerAlert` example
    -   Meeting of `make()` method and UI components

-   [**Chapter 4: Reactive Notification Management Using RxJS**](./05_chapter4_reactive_management.md)
    -   `AlertService` and RxJS `ReplaySubject`
    -   Propagating state using `AlertAction`
    -   Subscribing to and handling notification events (Consumer implementation)
        -   Frontend consumer: Dynamic UI rendering
        -   Backend consumer: External system integration

-   [**Chapter 5: Adding Type-Safe Custom Alert Types**](./06_chapter5_extending_with_custom_types.md)
    -   Why is type extension necessary?
    -   Extending `FrontAlertFactory`
    -   Ensuring type safety with TypeScript Module Augmentation

-   [**Chapter 6: Assembling the Entire System and Usage Examples**](./07_chapter6_putting_it_all_together.md)
    -   Using `AlertService` in `ApiService`
    -   Summary of overall operation flow
    -   Concluding the book

-   [**Appendix: Going Further**](./08_appendix.md)
    -   Creating alerts with confirmation/cancellation buttons
    -   Managing notification queues
    -   Integrating animations
