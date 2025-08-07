# Chapter 4: Reactive Notification Management Using RxJS

`FrontAlertFactory` has created an `Alert` object including UI components. Now, `AlertService` needs to notify the entire system of this alert's lifecycle (creation, destruction), and somewhere, this signal must be received to draw the actual UI or perform other actions. `AlertSystem` uses RxJS to handle this process **reactively**.

## 4.1. `AlertService` and RxJS `ReplaySubject`

Looking back at the internals of `AlertService`, you can see that it uses a special `Subject` called `ReplaySubject`.

**`@dooboostore/simple-boot/src/alert/AlertService.ts`**
```typescript
@Sim
export class AlertService<T> implements Store<AlertService.AlertActionContainer<T>> {
  // ReplaySubject replays the latest events stored in its buffer when a new subscriber appears.
  private subject = new ReplaySubject<AlertService.AlertActionContainer<T>>();

  // ...

  // Called from the active/deActive methods of Alert.
  publish(data: AlertService.AlertActionContainer<T>) {
    this.subject.next(data);
  }

  get observable() {
    return this.subject.asObservable();
  }
  // ...
}
```

-   **`publish()`**: When the `active()` or `deActive()` method of an `Alert` object is called, the `publish` method of `AlertService` is also called. This method broadcasts the current action (activation/deactivation) and the corresponding `Alert` object to the entire system via `subject.next()`.
-   **`observable`**: Externally, by subscribing to this `observable`, all alert status changes can be detected in real-time.

## 4.2. Propagating State Using `AlertAction`

What form does the data transmitted via `publish` take? `AlertAction` is a simple enum that specifies what happened to the alert.

**`@dooboostore/simple-boot/src/alert/AlertAction.ts`**
```typescript
export enum AlertAction {
  ACTIVE = 'ACTIVE',
  IN_ACTIVE = 'IN_ACTIVE'
}
```

`AlertService` bundles this `AlertAction` and `Alert` object into a type called `AlertActionContainer` and publishes it via `Subject`.

```typescript
export namespace AlertService {
  export type AlertActionContainer<T> = { action: AlertAction; alert: Alert<T> };
}
```
Therefore, the subscriber can perform different actions depending on whether the `action` is `ACTIVE` or `DE_ACTIVE`.

## 4.3. Subscribing to and Handling Notification Events (Consumer Implementation)

How do we implement a subscriber that actually consumes the events published by `AlertService`? Subscribers can play completely different roles depending on the execution environment.

### 4.3.1. Frontend Consumer: Dynamic UI Rendering

In the frontend, the most important role of a subscriber is to **render and remove alert UI components from the actual DOM**. This role is usually handled by a Root Component located at the top level of the application.

`IndexRouterComponent` in the `lazycollect` project is a good example.

**`apps/lazycollect/src/pages/index.router.component.ts` (partial)**
```typescript
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet';

@Component({ ... })
export class IndexRouterComponent extends ComponentRouterBase {
  // dom-render's Appender manages and renders dynamic component lists.
  private alertAppender = new Appender<any>();

  constructor(private alertService: AlertService<any>, ...) {
    super();
  }

  onInit(...data: any): any {
    // Subscribe to AlertService's observable when the component is initialized.
    this.alertService.observable.subscribe(it => {
      if (it.action === AlertAction.ACTIVE) {
        // When an ACTIVE event comes,
        // wrap alert.result (UI component instance) with ComponentSet and
        // add (set) it to Appender using alert.uuid as the key.
        this.alertAppender?.set(it.alert.uuid, {
            componentSet: new ComponentSet(it.alert.result),
            alertConfig: it.alert.config
        });
      } else { // When a DE_ACTIVE event comes,
        // remove the component with the corresponding alert.uuid from Appender.
        this.alertAppender?.delete(it.alert.uuid);
      }
    });
  }
}
```
-   **`Appender`**: `Appender` from the `@dooboostore/dom-render` library is a special object that dynamically manages component lists like an array. If bound in a template like `dr-for-of="@this@.alertAppender"`, the screen is automatically updated whenever the `Appender`'s content changes.
-   **Subscription Logic**: `IndexRouterComponent` subscribes to `alertService` and when it receives an `ACTIVE` signal, it adds a new component to `alertAppender`, and when it receives a `DE_ACTIVE` signal, it removes it. This makes all alerts in `AlertSystem` dynamically appear and disappear on the screen.

### 4.3.2. Backend Consumer: External System Integration

In a backend environment, instead of rendering UI, alert events can be used to integrate with other systems. For example, you can create an `AlertLoggingSubscriber` that detects `DANGER` type alerts (indicating a critical error) and sends error information to an external logging service (e.g., Sentry, DataDog).

**`apps/lazycollect/backend/service/AlertLoggingSubscriber.ts` (Example)**
```typescript
import { PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AlertService } from '@dooboostore/simple-boot/alert/AlertService';
import { AlertAction, AlertType } from '@dooboostore/simple-boot/alert';
import { ExternalLogService } from './ExternalLogService'; // Fictional external logging service

@Sim()
export class AlertLoggingSubscriber {
  constructor(
    private alertService: AlertService<any>,
    private externalLogService: ExternalLogService
  ) {}

  // @PostConstruct is called immediately after the DI container creates this object.
  @PostConstruct
  onInit() {
    this.alertService.observable.subscribe(it => {
      // React only when DANGER or ERROR type alerts are active
      if (it.action === AlertAction.ACTIVE && (it.alert.config?.type === AlertType.DANGER || it.alert.config?.type === AlertType.ERROR)) {
        console.log('[Backend] Critical alert detected. Sending to external log system...');
        this.externalLogService.send({
          level: 'error',
          message: it.alert.config?.title,
          data: it.alert.config?.data
        });
      }
    });
  }
}
```
This `AlertLoggingSubscriber` subscribes to `AlertService` when the application starts (`PostConstruct`) and sends information to an external logging service whenever a `DANGER` or `ERROR` alert occurs. In this way, `AlertSystem` can be used as a powerful tool for handling important server events, beyond just UI.

Now we have understood the complete flow of `AlertSystem`, from requesting alerts, creating them through a factory, and finally, consumers receiving and processing events.
