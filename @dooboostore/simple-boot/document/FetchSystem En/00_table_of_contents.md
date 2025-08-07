# Mastering `FetchSystem`: From `ApiService` Design to Implementation

## Table of Contents

-   [**Introduction: Why a New FetchSystem?**](./01_introduction.md)
    -   Limitations of the `fetch` API
    -   Design Goals of `ApiService`

-   [**Chapter 1: Hierarchical Fetcher Design and Basic Structure**](./02_chapter1_basic_design.md)
    -   Design Philosophy of the Fetcher Hierarchy
    -   `Fetcher`: Abstract Layer
    -   `HttpFetcher`: HTTP Protocol Layer
    -   `HttpJsonFetcher`: JSON Data Format Layer
    -   `ApiService`: Business Logic Layer
    -   Defining the `ApiService` Base Class

-   [**Chapter 2: Implementing Request Lifecycle Hooks**](./03_chapter2_request_lifecycle_hooks.md)
    -   What are Lifecycle Hooks?
    -   Implementing Lifecycle Hooks

-   [**Chapter 3: Flexible Configuration Objects and Callbacks**](./04_chapter3_configuration_and_callbacks.md)
    -   Designing `ApiServiceConfig`
    -   Injecting and Utilizing `AlertService`
    -   Integrating Lifecycle Hooks with Configuration Objects

-   [**Chapter 4: Reactive State Management with RxJS**](./05_chapter4_reactive_state_with_rxjs.md)
    -   Reactive Programming and RxJS
    -   Defining State Data Type (`StoreData`)
    -   Applying `Subject` and `Observable`
    -   Emitting State from Lifecycle Hooks

-   [**Chapter 5: Ensuring Extensibility with Interceptors**](./06_chapter5_extensibility_with_interceptors.md)
    -   Designing the `ApiServiceInterceptor` Interface
    -   Registering and Retrieving Interceptors
    -   Applying Interceptors to `ApiService`
    -   Interceptor Implementation and Usage Examples

-   [**Chapter 6: Full Code and Final Assembly**](./07_chapter6_putting_it_all_together.md)
    -   Complete `ApiService.ts` Code
    -   Usage Example: `PostService`
    -   Concluding the Book

-   [**Appendix: Going Further**](./08_appendix.md)
    -   Caching Strategies
    -   Request Cancellation
    -   File Upload/Download
    -   Advanced Error Handling