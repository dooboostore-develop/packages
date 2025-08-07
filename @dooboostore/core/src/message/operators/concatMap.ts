import { Observable, OperatorFunction } from '../Observable';

/**
 * Projects each source value to an Observable which is merged in the output Observable,
 * in a serialized fashion waiting for each one to complete before merging the next.
 *
 * @param project A function that, when applied to an item emitted by the source Observable,
 * returns an Observable.
 * @return An Observable that emits the result of applying the projection function to each
 * item emitted by the source Observable and concatenating the Observables obtained from
 * this transformation.
 */
export function concatMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {
  return (source: Observable<T, any>): Observable<R, any> => {
    return new Observable<R>(subscriber => {
      let index = 0;
      let buffer: { value: T; index: number }[] = [];
      let activeInnerSubscription: any = null;
      let hasCompleted = false;

      const checkForComplete = () => {
        if (hasCompleted && !activeInnerSubscription && buffer.length === 0) {
          subscriber.complete();
        }
      };

      const subscribeToNext = () => {
        if (buffer.length === 0 || activeInnerSubscription) {
          return;
        }

        const next = buffer.shift()!;
        try {
          const innerObservable = project(next.value, next.index);
          activeInnerSubscription = innerObservable.subscribe({
            next: (innerValue) => {
              subscriber.next(innerValue);
            },
            error: (err) => {
              subscriber.error(err);
            },
            complete: () => {
              activeInnerSubscription = null;
              subscribeToNext(); // Process next item in buffer
              checkForComplete();
            }
          });
        } catch (err) {
          activeInnerSubscription = null;
          subscriber.error(err);
        }
      };

      const outerSubscription = source.subscribe({
        next: (value) => {
          buffer.push({ value, index: index++ });
          subscribeToNext();
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
        if (activeInnerSubscription) {
          activeInnerSubscription.unsubscribe();
        }
      };
    });
  };
}