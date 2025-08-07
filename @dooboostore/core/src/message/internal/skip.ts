import { Observable, OperatorFunction } from '../Observable';

/**
 * Returns an Observable that skips the first `count` items emitted by the source Observable.
 *
 * @param count The number of times, items emitted by source Observable should be skipped.
 * @return An Observable that skips the first `count` values emitted by the source Observable.
 */
export function skip<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let skipped = 0;
      
      const subscription = source.subscribe({
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

      return subscription;
    });
  };
}