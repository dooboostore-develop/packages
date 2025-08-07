# Chapter 2: Implementing Request Lifecycle Hooks

Now that we've built the basic structure of `ApiService`, it's time to add actual functionality. We will override the lifecycle methods inherited from `HttpJsonFetcher` to insert our desired operations at each stage of the API request.

## 2.1. What are Lifecycle Hooks?

Lifecycle hooks are methods that are automatically called by the system when a specific event occurs. `HttpJsonFetcher` provides hooks at key points in the API request process, allowing us to flexibly add logic.

-   `before()`: Called just before the `fetch` request begins.
-   `afterSuccess()`: Called immediately after the network request succeeds and the response is successfully parsed.
-   `error()`: Called when a network error occurs or the response status code is not 2xx.
-   `finally()`: Always called after all processes are complete, regardless of whether the request succeeded or failed.

## 2.2. Implementing Lifecycle Hooks

Let's add code to the `ApiService` class that overrides each hook to output simple logs. This will help us clearly understand when each hook is called.

```typescript
// ApiService.ts

// ... (Previous code)

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {

  // ... (createPipe method)

  protected before(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    console.log(`[ApiService] Request Starting: ${config.config?.config?.title ?? 'Untitled'}`);
    // You can add code here to activate a loading spinner.
  }

  protected afterSuccess(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    console.log(`[ApiService] Request Success: ${config.config?.config?.title ?? 'Untitled'}`);
    // You can add code here to display a success message.
  }

  protected error(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE,
    e?: any
  ) {
    console.error(`[ApiService] Request Error: ${config.config?.config?.title ?? 'Untitled'}`, e);
    // You can add code here to display an error message.
  }

  protected finally(
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
    pipe: ApiService.PIPE
  ) {
    console.log(`[ApiService] Request Finished: ${config.config?.config?.title ?? 'Untitled'}`);
    // You can add code here to deactivate the loading spinner.
  }
}
```

### Code Analysis

-   Each method receives two parameters: `config` and `pipe`.
    -   `config`: An object containing all information about the currently executing request. This includes the URL, HTTP method, headers, and custom settings (`ApiServiceConfig`) which we will define in the next chapter.
    -   `pipe`: As explained in Chapter 1, this is a shared context object during the lifecycle of the current request.
-   `config.config?.config?.title`: Reads the `title` property from the configuration object passed when using `ApiService` and outputs it to the log. This makes it easy to identify which request is running. The `?? 'Untitled'` syntax ensures a default value is used if `title` is not present.
-   The `error` method additionally receives an `e` parameter, which contains the error object that occurred.

## 2.3. Meaning of Implementation and Next Steps

Our `ApiService` now automatically logs at the start, success, failure, and completion of all API requests. This is very useful for debugging and forms the basis for future functionalities.

For example, you can add code to activate a loading spinner in the `before` hook and deactivate it in the `finally` hook. In the `afterSuccess` or `error` hooks, you can add UI logic to show success or failure messages to the user.

In the next chapter, instead of hardcoding such UI feedback logic, we will explore how to allow users to flexibly control it for each request through the `ApiServiceConfig` configuration object.
