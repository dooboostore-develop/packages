import { Observable, OperatorFunction } from '../Observable';

/**
 * Delays the emission of items from the source Observable by a given timeout.
 *
 * @param delay The delay duration in milliseconds.
 * @return An Observable that delays the emissions of the source Observable by the specified timeout.
 */
export function delay<T>(delayMs: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      const timeouts: NodeJS.Timeout[] = [];

      const subscription = source.subscribe({
        next: (value) => {
          const timeoutId = setTimeout(() => {
            subscriber.next(value);
          }, delayMs);
          timeouts.push(timeoutId);
        },
        error: (err) => {
          const timeoutId = setTimeout(() => {
            subscriber.error(err);
          }, delayMs);
          timeouts.push(timeoutId);
        },
        complete: () => {
          const timeoutId = setTimeout(() => {
            subscriber.complete();
          }, delayMs);
          timeouts.push(timeoutId);
        }
      });

      return () => {
        subscription.unsubscribe();
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    });
  };
}