import { Observable } from '../Observable';

export interface DebounceTimeConfig {
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (id: any) => void;
}

export function debounceTime<T>(duration: number, config?: DebounceTimeConfig) {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      const setTimeoutFn = config?.setTimeout || setTimeout;
      const clearTimeoutFn = config?.clearTimeout || clearTimeout;

      let timeoutId: any = null;
      let lastValue: T | undefined;
      let hasValue = false;

      const subscription = source.subscribe({
        next: (value) => {
          clearTimeoutFn(timeoutId);
          lastValue = value;
          hasValue = true;
          timeoutId = setTimeoutFn(() => {
            if (hasValue) {
              subscriber.next(lastValue!);
              hasValue = false; // Reset after emitting
            }
          }, duration);
        },
        error: (err) => {
          clearTimeoutFn(timeoutId);
          subscriber.error(err);
        },
        complete: () => {
          clearTimeoutFn(timeoutId);
          // Emit the last value if it's pending
          if (hasValue) {
            subscriber.next(lastValue!);
          }
          subscriber.complete();
        }
      });
      return subscription; // Return the subscription for teardown
    });
  };
}
