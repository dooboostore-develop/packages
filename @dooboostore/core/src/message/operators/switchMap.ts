import { Observable, OperatorFunction } from '../Observable';

/**
 * Projects each source value to an Observable which is merged in the output Observable,
 * emitting values only from the most recently projected Observable.
 *
 * @param project A function that, when applied to an item emitted by the source Observable,
 * returns an Observable.
 * @return An Observable that emits the result of applying the projection function to each
 * item emitted by the source Observable and merging the results of the Observables obtained
 * from this transformation.
 */
export function switchMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {
  return (source: Observable<T, any>): Observable<R, any> => {
    return new Observable<R>(subscriber => {
      let index = 0;
      let innerSubscription: any = null;
      let hasCompleted = false;
      let outerCompleted = false;

      const checkForComplete = () => {
        if (outerCompleted && !innerSubscription) {
          subscriber.complete();
        }
      };

      const outerSubscription = source.subscribe({
        next: (value) => {
          // Cancel previous inner subscription
          if (innerSubscription) {
            innerSubscription.unsubscribe();
            innerSubscription = null;
          }

          try {
            const innerObservable = project(value, index++);
            innerSubscription = innerObservable.subscribe({
              next: (innerValue) => {
                subscriber.next(innerValue);
              },
              error: (err) => {
                subscriber.error(err);
              },
              complete: () => {
                innerSubscription = null;
                checkForComplete();
              }
            });
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          outerCompleted = true;
          checkForComplete();
        }
      });

      return () => {
        outerSubscription.unsubscribe();
        if (innerSubscription) {
          innerSubscription.unsubscribe();
        }
      };
    });
  };
}