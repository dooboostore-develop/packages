import { Observable, OperatorFunction } from '../Observable';

/**
 * Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds true,
 * but emits all further source items as soon as the condition becomes false.
 *
 * @param predicate A function to test each item emitted from the source Observable.
 * @return An Observable that begins emitting items emitted by the source Observable when the specified condition becomes false.
 */
export function skipWhile<T>(
  predicate: (value: T, index: number) => boolean
): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let index = 0;
      let skipping = true;

      const sourceSubscription = source.subscribe({
        next: (value) => {
          try {
            if (skipping && predicate(value, index++)) {
              // still skipping
            } else {
              skipping = false;
              subscriber.next(value);
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
