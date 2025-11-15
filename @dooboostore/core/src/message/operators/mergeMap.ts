import { Observable, OperatorFunction } from '../Observable';

/**
 * Projects each source value to an Observable or Promise which is merged in the output Observable.
 *
 * @param project A function that, when applied to an item emitted by the source Observable,
 * returns an Observable or Promise.
 * @param concurrent Maximum number of input Observables being subscribed to concurrently.
 * @return An Observable that emits the result of applying the projection function to each
 * item emitted by the source Observable and merging the results of the Observables obtained
 * from this transformation.
 */
export function mergeMap<T, R>(
  project: (value: T, index: number) => Observable<R> | Promise<R>,
  concurrent: number = Infinity
): OperatorFunction<T, R> {
  return (source: Observable<T, any>): Observable<R, any> => {
    return new Observable<R>(subscriber => {
      let index = 0;
      let activeSubscriptions = 0;
      let hasCompleted = false;
      let buffer: { value: T; index: number }[] = [];

      const checkForComplete = () => {
        if (hasCompleted && activeSubscriptions === 0) {
          subscriber.complete();
        }
      };

      const subscribeToInner = (value: T, idx: number) => {
        activeSubscriptions++;
        try {
          const result = project(value, idx);
          
          // Convert Promise to Observable if needed
          const innerObservable = result instanceof Promise
            ? new Observable<R>(sub => {
                result
                  .then(val => {
                    sub.next(val);
                    sub.complete();
                  })
                  .catch(err => {
                    sub.error(err);
                  });
              })
            : result;
          
          const innerSubscription = innerObservable.subscribe({
            next: (innerValue) => {
              subscriber.next(innerValue);
            },
            error: (err) => {
              subscriber.error(err);
            },
            complete: () => {
              activeSubscriptions--;
              
              // Process buffered items if any
              if (buffer.length > 0 && activeSubscriptions < concurrent) {
                const next = buffer.shift()!;
                subscribeToInner(next.value, next.index);
              }
              
              checkForComplete();
            }
          });
        } catch (err) {
          activeSubscriptions--;
          subscriber.error(err);
        }
      };

      const outerSubscription = source.subscribe({
        next: (value) => {
          if (activeSubscriptions < concurrent) {
            subscribeToInner(value, index++);
          } else {
            buffer.push({ value, index: index++ });
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          hasCompleted = true;
          checkForComplete();
        }
      });

      return () => {
        outerSubscription.unsubscribe();
      };
    });
  };
}