# Chapter 6: Assembling the Entire System and Usage Examples

So far, we have designed and learned the implementation principles of each core element (`Alert`, `AlertService`, `AlertFactory`, `AlertContainer`) that constitutes the `AlertSystem` step by step. Now, let's put all these pieces together to draw the final picture of how they organically operate in a real application.

## 6.1. Using `AlertService` in `ApiService`

One of the main clients of `AlertSystem` is `ApiService` from `FetchSystem`, which we created earlier. `ApiService` calls `AlertService` within its lifecycle hooks to inform the user about the API communication status.

**`@dooboostore/simple-boot/src/fetch/ApiService.ts` (partial)**
```typescript
@Sim
export class ApiService extends HttpJsonFetcher<ApiServiceConfig, PIPE> {
  // AlertService instance is injected via DI
  constructor(
    private simstanceManager: SimstanceManager,
    private alertService: AlertService<any>
  ) {
    super();
  }

  // ...

  protected before(config: FetcherRequest<...>, pipe: PIPE) {
    // If `alertProgress: true` is set
    if (config.config?.config?.alertProgress) {
      // Request creation of a progress type alert via `AlertService`
      const alert = this.alertService.progress({ title: config.config.config.title });
      if (alert) {
        // Activate the created Alert object and store it in pipe for later closing
        pipe.progress = alert;
        alert.active();
      }
    }
  }

  protected error(config: FetcherRequest<...>, pipe: PIPE, e?: any) {
    // If `alertErrorMsg: true` is set
    if (config.config?.config?.alertErrorMsg) {
      // Request creation and activation of a danger type alert via `AlertService`
      this.alertService.danger({
        title: `${config.config.config.title ?? ''} (${e.message ?? ''})`
      })?.active();
    }
  }

  protected finally(config: FetcherRequest<...>, pipe: PIPE) {
    // Find and deactivate the progress alert created in `before`
    pipe.progress?.deActive();
  }
}
```
`ApiService` only calls methods like `progress()` and `danger()` of `AlertService`, and knows nothing about the existence of `FrontAlertFactory` or `DangerAlertComponent`. This is the power of the abstraction we designed.

## 6.2. Summary of Overall Operation Flow

Let's follow the entire flow from when a user clicks a button to initiate an API request, and an error alert is displayed on the screen as a result.

1.  **`ApiService`**: Calls `this.alertService.danger({ title: '...' })` in the `error` hook.
2.  **`AlertService`**: Calls `createFromFactory(AlertType.DANGER, ...)` inside the `danger()` method.
3.  **`AlertService`**: Calls the `create()` method of the `AlertFactory` injected into its constructor, with `type: AlertType.DANGER`.
4.  **`FrontAlertFactory`**: The `switch` statement in the `create()` method encounters the `DANGER` case, executes `new DangerAlert(this.alertService, ...)`, creates a `DangerAlert` instance, and returns it.
5.  **`AlertService`**: Returns the created `DangerAlert` instance to `ApiService`.
6.  **`ApiService`**: Calls the `.active()` method of the returned `DangerAlert` instance.
7.  **`DangerAlert`**: Calls its own `make()` method inside the `active()` method.
8.  **`DangerAlert`**: The `make()` method executes `new DangerAlertComponent()` to create a UI component instance, stores it in `this.result`, and then returns it.
9.  **`DangerAlert`**: The `active()` method then calls `this.alertService.publish({ action: AlertAction.ACTIVE, alert: this })` to broadcast "I (DangerAlert) have been activated" to the entire system.
10. **`AlertContainer`**: Subscribes to `alertService.observable` and receives the `ACTIVE` action.
11. **`AlertContainer`**: Extracts `alert.result` (i.e., the `DangerAlertComponent` instance) from the `DangerAlert` object passed along.
12. **`AlertContainer`**: Finally renders the `DangerAlertComponent`'s DOM element on the screen by `appendChild`ing it to its container DIV.

In this way, each object fulfills only its own responsibility, and they interact only through promised interfaces (abstractions) without knowing each other's concrete details. As a result, a very flexible, reusable, and easy-to-test `AlertSystem` is completed.

## 6.3. Concluding the Book

Through this book, we have experienced the process of contemplating and designing the architecture behind UI components, beyond just creating them. We have seen how various design patterns and concepts such as the Factory Pattern, Dependency Injection, and Reactive Programming harmoniously combine to create a robust system.

Based on the concepts and code covered here, we hope you will continue to build more powerful and advanced systems tailored to your projects.
