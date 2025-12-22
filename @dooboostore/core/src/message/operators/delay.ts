import { Observable, OperatorFunction } from '../Observable';

export interface DelayConfig {
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (id: any) => void;
}

/**
 * Delays the emission of items from the source Observable by a given timeout.
 *
 * @param delayMs The delay duration in milliseconds.
 * @param config Configuration object with optional custom timer functions
 * @return An Observable that delays the emissions of the source Observable by the specified timeout.
 */
export function delay<T>(delayMs: number, config?: DelayConfig): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      const setTimeoutFn = config?.setTimeout || setTimeout;
      const clearTimeoutFn = config?.clearTimeout || clearTimeout;

      const timeouts: any[] = [];

      const subscription = source.subscribe({
        next: (value) => {
          const timeoutId = setTimeoutFn(() => {
            subscriber.next(value);
          }, delayMs);
          timeouts.push(timeoutId);
        },
        error: (err) => {
          const timeoutId = setTimeoutFn(() => {
            subscriber.error(err);
          }, delayMs);
          timeouts.push(timeoutId);
        },
        complete: () => {
          const timeoutId = setTimeoutFn(() => {
            subscriber.complete();
          }, delayMs);
          timeouts.push(timeoutId);
        }
      });

      return () => {
        subscription.unsubscribe();
        timeouts.forEach(timeout => clearTimeoutFn(timeout));
      };
    });
  };
}