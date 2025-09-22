import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits only the first `count` values emitted by the source Observable.
 *
 * @param count The maximum number of values to emit.
 * @return An Observable that emits only the first `count` values from the source.
 */
export function take<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let taken = 0;

      if (count === 0) {
        subscriber.complete();
        return;
      }

      const sourceSubscription = source.subscribe({
        next: (value) => {
          if (taken < count) {
            taken++;
            subscriber.next(value);
            if (taken === count) {
              subscriber.complete();
              sourceSubscription.unsubscribe();
            }
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
