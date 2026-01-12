import { Observable, OperatorFunction } from '../Observable';

/**
 * Projects each source value to an Observable which is merged in the output Observable.
 *
 * @param project A function that, when applied to an item emitted by the source Observable,
 * returns an Observable or Promise.
 * @return An Observable that emits the result of applying the projection function to each item
 * emitted by the source Observable and merging the results of the Observables obtained from this transformation.
 */
export function mergeMap<T, R>(project: (value: T, index: number) => Observable<R> | Promise<R>): OperatorFunction<T, R> {
  return (source: Observable<T, any>): Observable<R, any> => {
    return new Observable<R>(subscriber => {
      let index = 0;
      let activeCount = 0;
      let hasCompleted = false;
      const innerSubscriptions: any[] = [];

      const checkComplete = () => {
        if (hasCompleted && activeCount === 0) {
          subscriber.complete();
        }
      };

      const sourceSubscription = source.subscribe({
        next: value => {
          activeCount++;
          const currentIndex = index++;

          try {
            const projected = project(value, currentIndex);

            // Promise를 Observable로 변환
            const innerObservable =
              projected instanceof Promise
                ? new Observable<R>(innerSubscriber => {
                    projected
                      .then(result => {
                        innerSubscriber.next(result);
                        innerSubscriber.complete();
                      })
                      .catch(err => {
                        innerSubscriber.error(err);
                      });
                  })
                : projected;

            const innerSubscription = innerObservable.subscribe({
              next: innerValue => {
                subscriber.next(innerValue);
              },
              error: err => {
                activeCount--;
                subscriber.error(err);
              },
              complete: () => {
                activeCount--;
                const idx = innerSubscriptions.indexOf(innerSubscription);
                if (idx >= 0) {
                  innerSubscriptions.splice(idx, 1);
                }
                checkComplete();
              }
            });

            innerSubscriptions.push(innerSubscription);
          } catch (err) {
            activeCount--;
            subscriber.error(err);
          }
        },
        error: err => {
          subscriber.error(err);
        },
        complete: () => {
          hasCompleted = true;
          checkComplete();
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
        innerSubscriptions.forEach(sub => sub.unsubscribe());
      };
    });
  };
}
