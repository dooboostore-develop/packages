import { Observable, OperatorFunction } from '../Observable';

/**
 * Returns an Observable that skips the first `count` items emitted by the source Observable.
 *
 * @param count The number of items to skip.
 * @return An Observable that skips the first `count` items.
 */
export function skip<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let skipped = 0;

      const sourceSubscription = source.subscribe({
        next: (value) => {
          if (skipped < count) {
            skipped++;
          } else {
            subscriber.next(value);
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
