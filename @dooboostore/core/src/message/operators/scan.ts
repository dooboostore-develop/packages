import { Observable, OperatorFunction } from '../Observable';

/**
 * Applies an accumulator function over the source Observable, and returns each
 * intermediate result, with an optional seed value.
 *
 * @param accumulator The accumulator function called on each source value.
 * @param seed The initial accumulation value.
 * @return An Observable that emits the current accumulation whenever the source emits a value.
 */
export function scan<T, R>(
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
            subscriber.next(acc);
            index++;
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

      return subscription;
    });
  };
}