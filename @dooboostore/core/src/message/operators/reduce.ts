import { Observable, OperatorFunction } from '../Observable';

/**
 * Applies an accumulator function over the source Observable, and returns the
 * accumulated result when the source completes, given an optional seed value.
 *
 * @param accumulator The accumulator function called on each source value.
 * @param seed The initial accumulation value.
 * @return An Observable that emits a single value that is the result of
 * accumulating the values emitted by the source Observable.
 */
export function reduce<T, R>(
  accumulator: (acc: R, value: T, index: number) => R,
  seed?: R
): OperatorFunction<T, R> {
  return (source: Observable<T, any>): Observable<R, any> => {
    return new Observable<R>(subscriber => {
      let hasAccumulator = arguments.length >= 2;
      let acc: R = seed!;
      let index = 0;

      const subscription = source.subscribe({
        next: (value) => {
          try {
            if (!hasAccumulator) {
              acc = value as any;
              hasAccumulator = true;
            } else {
              acc = accumulator(acc, value, index);
            }
            index++;
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          if (hasAccumulator) {
            subscriber.next(acc);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Reduce of empty sequence with no initial value'));
          }
        }
      });

      return subscription;
    });
  };
}