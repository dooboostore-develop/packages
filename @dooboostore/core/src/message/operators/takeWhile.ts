import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits values emitted by the source Observable so long as each value satisfies
 * the given `predicate`, and then completes as soon as this `predicate` is not
 * satisfied.
 *
 * @param predicate A function that evaluates each value emitted by the source
 * Observable. If it returns `true`, the value is emitted. If it returns
 * `false`, the Observable completes.
 * @return An Observable that emits values from the source Observable so long as
 * each value satisfies the given `predicate`.
 */
export function takeWhile<T>(
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
            } else {
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
