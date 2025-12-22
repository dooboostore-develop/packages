import { Observable, OperatorFunction } from '../Observable';

export class TimeoutError extends Error {
  constructor(message: string = 'Timeout has occurred') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export interface TimeoutConfig {
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (id: any) => void;
}

/**
 * Errors if Observable does not emit a value in given time span.
 *
 * @param due Number of milliseconds within which Observable must emit values.
 * @param config Configuration object with optional custom timer functions
 * @return An Observable that errors if the source Observable does not emit a value within the timeout period.
 */
export function timeout<T>(due: number, config?: TimeoutConfig): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      const setTimeoutFn = config?.setTimeout || setTimeout;
      const clearTimeoutFn = config?.clearTimeout || clearTimeout;

      let timeoutId: any;
      let hasEmitted = false;

      const resetTimeout = () => {
        if (timeoutId) {
          clearTimeoutFn(timeoutId);
        }
        timeoutId = setTimeoutFn(() => {
          if (!hasEmitted) {
            subscriber.error(new TimeoutError());
          }
        }, due);
      };

      resetTimeout();

      const subscription = source.subscribe({
        next: (value) => {
          hasEmitted = true;
          clearTimeoutFn(timeoutId);
          subscriber.next(value);
          resetTimeout();
        },
        error: (err) => {
          clearTimeoutFn(timeoutId);
          subscriber.error(err);
        },
        complete: () => {
          clearTimeoutFn(timeoutId);
          subscriber.complete();
        }
      });

      return () => {
        clearTimeoutFn(timeoutId);
        subscription.unsubscribe();
      };
    });
  };
}