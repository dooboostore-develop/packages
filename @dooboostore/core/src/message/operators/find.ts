import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits only the first value emitted by the source Observable that meets some
 * condition.
 *
 * @param predicate A function that evaluates each value emitted by the source
 * Observable. If it returns `true`, the value is emitted, and the Observable
 * completes.
 * @return An Observable that emits the first value that matches the condition.
 */
export function find<T>(
  predicate: (value: T, index: number) => boolean
): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let index = 0;

      const sourceSubscription = source.subscribe({
        next: (value) => {
          try {
            if (predicate(value, index++)) {
              subscriber.next(value);
              subscriber.complete();
              sourceSubscription.unsubscribe();
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
      };
    });
  };
}
