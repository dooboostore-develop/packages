import { Observable, OperatorFunction } from '../Observable';

/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 *
 * @param selector A function that takes as arguments `err`, which is the error, and `caught`,
 * which is the source observable, in case you'd like to "retry" that observable by returning it again.
 * Whatever observable is returned by the `selector` will be used to continue the observable chain.
 * @return An Observable that originates from either the source or the Observable returned by the
 * catch `selector` function.
 */
export function catchError<T, R>(
  selector: (err: any, caught: Observable<T>) => Observable<R>
): OperatorFunction<T, T | R> {
  return (source: Observable<T, any>): Observable<T | R, any> => {
    return new Observable<T | R>(subscriber => {
      let subscription: any;

      const subscribeToSource = () => {
        subscription = source.subscribe({
          next: (value) => {
            subscriber.next(value);
          },
          error: (err) => {
            try {
              const result = selector(err, source);
              subscription = result.subscribe({
                next: (value) => {
                  subscriber.next(value);
                },
                error: (innerErr) => {
                  subscriber.error(innerErr);
                },
                complete: () => {
                  subscriber.complete();
                }
              });
            } catch (selectorErr) {
              subscriber.error(selectorErr);
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