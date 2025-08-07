import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits only the first `count` values emitted by the source Observable.
 *
 * @param count The maximum number of `next` values to emit.
 * @return A function that returns an Observable that emits only the first
 * `count` values emitted by the source Observable.
 */
export function take<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    // Handle count <= 0 by returning immediately completing Observable
    if (count <= 0) {
      return new Observable<T>(subscriber => {
        subscriber.complete();
      });
    }

    return new Observable<T>(subscriber => {
      let seen = 0;
      
      const subscription = source.subscribe({
        next: (value) => {
          // Increment the number of values we have seen
          if (++seen <= count) {
            subscriber.next(value);
            // If we have met or passed our allowed count, complete
            if (count <= seen) {
              subscriber.complete();
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

      // Return the subscription for teardown
      return subscription;
    });
  };
}