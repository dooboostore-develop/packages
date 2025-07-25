# Appendix: Going Further

Through this book, we have laid a solid foundation for `AlertSystem`. However, in a real production environment, we encounter more diverse and complex requirements. This appendix introduces some advanced topics that can further develop the system we have built.

## A.1. Creating Alerts with Confirmation/Cancellation Buttons

Beyond simple information display, how can we create dialog-style alerts that receive user input? This can be implemented by extending `AlertFactoryConfig` to pass callback functions.

### Implementation Ideas

1.  **Extend `AlertFactoryConfig`**: Add properties such as `onConfirm?: () => void`, `onCancel?: () => void`, `confirmButtonText?: string`.
2.  **Implement `ConfirmAlertComponent`**: This component receives a `config` object and renders buttons using `confirmButtonText` in addition to `title` and `text`. Connect `onConfirm` and `onCancel` callbacks to the click events of each button, and after executing the callback, call `alert.deActive()` to make it close itself.
3.  **`ConfirmAlert` Class**: In the `make()` method, pass the configuration to the component like `new ConfirmAlertComponent(this.config)`.
4.  **Usage**:
    ```typescript
    alertService.createFromFactory('CONFIRM', { // Specify custom type as string
      title: 'Are you sure you want to delete?',
      confirmButtonText: 'Delete',
      onConfirm: () => {
        // Execute actual deletion logic
        this.deleteItem(itemId);
      },
      onCancel: () => {
        console.log('Deletion cancelled.');
      }
    })?.active();
    ```

## A.2. Managing Notification Queues

If numerous alerts occur simultaneously in a short period, such as when API calls are executed within a loop, the screen can be overwhelmed with alerts, harming the user experience. To prevent this, an alert queue can be introduced.

### Implementation Ideas

-   **Modify `AlertService`**: Add an `alertQueue: Alert<any>[]` array and an `isDisplaying: boolean` flag inside `AlertService`.
-   **Change Behavior**: When `alert.active()` is called, if `isDisplaying` is `true`, do not display immediately and add to `alertQueue`. If `false`, display the alert immediately and set `isDisplaying` to `true`.
-   **Queue Processing**: When an alert is `deActive`d, set `isDisplaying` to `false`, and if there are pending alerts in `alertQueue`, dequeue one and call `active()` on it.

## A.3. Animation Integration

Alerts look much better with smooth animations rather than appearing and disappearing abruptly.

### Implementation Ideas

-   **Modify `Alert` Class**: Modify the logic of `active()` and `deActive()` methods.
-   **`active()`**: Immediately after creating the UI component via `make()` and adding it to the DOM, instead of directly setting `opacity` to `1`, use an animation library like `gsap` or `framer-motion` to execute an 'enter' animation that changes `opacity` from 0 to 1, and `transform` from `translateY(-20px)` to `translateY(0)`.
-   **`deActive()`**: Instead of immediately removing from the DOM, first execute a 'leave' animation (e.g., `opacity` to 0), and then execute the logic to remove from the DOM as a callback after the animation ends.
