# Chapter 3: Flexible Configuration Objects and Callbacks

The lifecycle hooks implemented so far operate uniformly for all API requests. However, in real-world applications, different handling is often required depending on the characteristics of each request. For example, some requests need to inform the user of their progress, while others should execute silently in the background.

In this chapter, we will concretize the `ApiServiceConfig` type to design and implement a configuration object and callback functions that allow flexible control over the behavior of each request.

## 3.1. Designing `ApiServiceConfig`

`ApiServiceConfig` is designed by separating it into two responsibilities:

-   **`AlertConfig`**: Handles settings for alerts to be shown to the user. This is a declarative approach, simply controlled by `true`/`false` values.
-   **`CallBackConfig`**: Handles custom callback functions to be executed at each lifecycle stage of a request. This is an imperative approach for handling complex logic required only for specific requests.

```typescript
// ApiService.ts -> Inside ApiService Namespace

// User Alert related settings
export type AlertConfig = {
  title?: string; // Title to display in the alert
  alertProgress?: boolean; // Whether to display a progress alert
  alertSuccessMsg?: boolean; // Whether to display a success message alert
  alertErrorMsg?: boolean; // Whether to display an error message alert
  enableErrorConsole?: boolean; // Whether to output error logs to the console
};

// Callback function related settings
export type CallBackConfig = {
  callBackProgress?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
  callBackSuccess?: (config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>, pipe: PIPE) => void;
  callBackError?: (
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>,
    pipe: PIPE,
    e?: any
  ) => void;
  callBackFinal?: (
    config: FetcherRequest<URL, any, HttpFetcherConfig<ApiServiceConfig>>,
    pipe: PIPE,
    e?: any
  ) => void;
};

// Define the final ApiServiceConfig type by combining the two settings
export type ApiServiceConfig = CallBackConfig & AlertConfig;
```

## 3.2. Injecting and Utilizing `AlertService`

To handle declarative alert settings, we inject `AlertService` from an external source. `AlertService` is responsible for providing consistent UI feedback to the user through methods like `success`, `danger`, and `progress`. (The detailed implementation of `AlertService` is beyond the scope of this book.)

```typescript
// ApiService.ts
import { AlertService } from '../alert/AlertService';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
// ...

@Sim
export class ApiService extends HttpJsonFetcher<ApiService.ApiServiceConfig, ApiService.PIPE> {
  private alertService?: AlertService<any>;

  constructor(private simstanceManager: SimstanceManager, alertService: AlertService<any>) {
    super();
    this.alertService = alertService;
  }

  // ... createPipe ...
}
```
When the `simple-boot` DI container creates `ApiService`, it automatically injects an instance of `AlertService`.

## 3.3. Linking Lifecycle Hooks with Configuration Objects

Now, we will modify the lifecycle hooks implemented in Chapter 2 to branch their execution based on `ApiServiceConfig` settings and execute callback functions.

```typescript
// ApiService.ts -> Inside ApiService Class

protected before(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // Execute callback
  config.config?.config?.callBackProgress?.(config, pipe);

  // Handle declarative alert
  if (config.config?.config?.alertProgress) {
    const alert = this.alertService?.progress({title: config.config.config.title});
    if (alert) {
      // Store the created alert object in PIPE so it can be referenced in the finally hook
      pipe.progress = alert;
      alert.active();
    }
  }
}

protected afterSuccess(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // Execute callback
  config.config?.config?.callBackSuccess?.(config, pipe);

  // Handle declarative alert
  if (config.config?.config?.alertSuccessMsg) {
    this.alertService?.success({ title: config.config.config.title })?.active();
  }
}

protected error(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE,
  e?: any
) {
  // Execute callback
  config.config?.config?.callBackError?.(config, pipe, e);

  // Handle declarative alert
  if (config.config?.config?.alertErrorMsg) {
    this.alertService?.danger({
      title: `${config.config.config.title ? config.config.config.title : ''}${e.message ? `(${e.message})` : ''}`
    })?.active();
  }

  // Handle error log output
  if (config.config?.config?.enableErrorConsole) {
    console.error(`[ApiService] Error: ${config?.config?.config?.title}`, e);
  }
}

protected finally(
  config: FetcherRequest<URL, any, HttpFetcherConfig<ApiService.ApiServiceConfig>>,
  pipe: ApiService.PIPE
) {
  // Execute callback
  config.config?.config?.callBackFinal?.(config, pipe);

  // Close the progress alert created in before
  pipe.progress?.deActive();
}
```

### Code Analysis
-   **Callback Invocation**: At the beginning of each hook, the `config.config?.config?.callBack...?` syntax checks if a callback function provided by the user exists, and if so, executes it.
-   **Declarative Alerts**: The `if (config.config?.config?.alert...?)` syntax checks if the user has set an alert option to `true`, and then calls `alertService` to display the alert.
-   **Utilizing the `PIPE` Object**: The `progress` alert object created in the `before` hook is stored in `pipe.progress`. Then, in the `finally` hook, `pipe.progress` is referenced again to call the `deActive()` method, ensuring that the progress alert is always closed when the request finishes. This is the core role of the `PIPE` object.

## 3.4. Ensuring Flexibility

Now, `ApiService` has become very flexible. Developers can control it by simply passing a configuration object when calling the API, as follows:

```typescript
// Usage Example
this.apiService.get('/users/1', {
  config: {
    title: 'Fetch User Info',
    alertProgress: true, // Display loading alert
    alertErrorMsg: true, // Display alert on error
    callBackSuccess: (config, pipe) => { // Execute special logic on success
      console.log('Successfully fetched user information.');
    }
  }
});
```

In the next chapter, we will go a step further and build a reactive system using RxJS to notify the entire application of all state changes in `ApiService`.
