# Foreword: Why Build a Fetch System?

In modern web applications, the ability to communicate with a server is essential, and browsers provide a standard API called `fetch`. However, in real production-scale applications, relying solely on `fetch` to handle all communication requirements leads to increased complexity and repetition. This book goes beyond simply using `fetch` to explore the essence of **how to design and implement a robust and scalable data communication system—a Fetch System—from scratch.**

In this book, we will build a core class called `ApiService`, based on the `Fetcher` architecture, which will be responsible for all API communication within the application.

The goal of this book is to help readers understand the internal workings of `ApiService` and gain the in-depth knowledge and insights necessary to build a reusable API communication layer.

## Key Features of `ApiService`

*   **Layered Design:** A clear separation of responsibilities, from `Fetcher` to `ApiService`, enhances code stability and readability.
*   **Lifecycle Hooks:** Provides clear hooks to intervene at each stage of a request—start, success, failure, and completion—to execute custom logic.
*   **Declarative UI Feedback:** Automatically manages user notifications based on request status with simple settings like `alertProgress: true`.
*   **Reactive State Propagation:** Utilizes RxJS to notify external components of all request state changes as a stream, allowing the application to react accordingly.
*   **Flexible Extensibility:** Through the Interceptor pattern, cross-cutting concerns like authentication and logging can be easily added without modifying core code.

## Main Topics Covered in This Book

*   **Understanding the Fetcher Layered Structure:** Learn the role and design philosophy of each layer, from `Fetcher`, `HttpFetcher`, `HttpJsonFetcher`, to `ApiService`.
*   **Implementing Lifecycle Hooks:** Discover how to control each stage of a request and add custom logic.
*   **Flexible Configuration and Callbacks:** Learn how to configure different behaviors based on the needs of each request.
*   **Reactive State Management:** Explore how to handle request states as streams using RxJS's `Subject` and `Observable`.
*   **Interceptor Pattern:** Implement elegant handling of cross-cutting concerns such as adding authentication headers.

Through this journey, you will gain a deep understanding of web application communication architecture. Now, let's begin our journey to build our own `FetchSystem` based on `ApiService`.