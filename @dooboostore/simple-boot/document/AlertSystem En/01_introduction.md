# Introduction: Why Build a New Alert System?

'Alerts' are a fundamental feature of all interactive applications, used to convey information to users. While the browser's `window.alert()` can be used for the simplest cases, it has critical drawbacks (modal behavior, inability to customize UI) that degrade user experience. For this reason, most projects create and use their own alert components.

However, a new problem arises here. If every component or service that needs an alert starts directly creating and controlling its own UI components, the code becomes tightly coupled and reusability decreases. Logic for notifying API communication results, form validation results, etc., are scattered throughout the codebase, making it difficult to maintain consistency.

This book explores the essence of **how to design and implement a consistent, flexible, and extensible Alert System throughout an application** to solve these problems. We will delve into the internals of a well-designed alert system through the `Alert`-related modules of `@dooboostore/simple-boot`.

The goal of this book is to help readers not just create alert UIs, but to understand the underlying architecture and gain deep knowledge and insights to build reusable alert services in any situation.

## Key Features of `AlertSystem`

-   **Loose Coupling:** The requesting code for alerts and the UI components that actually draw the alerts on the screen are completely separated.
-   **Factory Pattern:** `AlertFactory` centrally manages the creation of alert objects, allowing different alert implementations to be provided depending on different environments such as frontend and backend (SSR).
-   **Centralized Service:** `AlertService` handles and controls all alert requests in the application through a single point of contact.
-   **Reactive Management:** Uses RxJS to propagate alert creation and destruction events as streams, and subscribes to them to dynamically manage the UI.
-   **Extensibility:** When you want to add a new type of alert, the system automatically extends without needing to modify existing code, simply by adding a new `Alert` class and factory logic.

## Main Topics Covered in This Book

-   **Core Abstractions:** Learn the roles of the `Alert` class, which is the foundation of all alerts, and the `AlertFactory` interface, which is responsible for creating alerts.
-   **Utilizing the Factory Pattern:** Understand the principles of how different alert objects are created depending on frontend and backend environments.
-   **UI Component Integration:** Examine how an abstract `Alert` object is connected to a UI component that is actually displayed on the screen.
-   **Reactive State Management:** Explore how `AlertService` manages the lifecycle of alerts using RxJS and how the UI reacts to it.
-   **Assembling the Entire System:** Complete the overall picture through a final usage example that utilizes `AlertService` in other services like `ApiService`.

Now, let's begin the journey of building a well-designed `AlertSystem`.
