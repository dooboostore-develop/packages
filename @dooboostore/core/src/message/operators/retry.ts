import { Observable, OperatorFunction } from '../Observable';

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`.
 * If the source Observable calls `error`, this method will resubscribe to the source Observable
 * for a maximum of `count` resubscriptions (given as a number parameter) rather than propagating the `error` call.
 *
 * @param count Number of retry attempts before failing. Default is 3.
 * @return The source Observable modified with retry logic.
 */
export function retry<T>(count: number = 3): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let retryCount = 0;
      let subscription: any;

      const subscribeToSource = () => {
        subscription = source.subscribe({
          next: (value) => {
            subscriber.next(value);
          },
          error: (err) => {
            if (retryCount < count) {
              retryCount++;
              subscribeToSource(); // Retry
            } else {
              subscriber.error(err); // Give up and propagate error
            }
          },
          complete: () => {
            subscriber.complete();
          }
        });
      };

      subscribeToSource();

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  };
}