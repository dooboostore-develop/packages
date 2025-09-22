import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits the values from the source Observable until a `notifier` Observable emits a value.
 *
 * @param notifier The Observable that dictates when to stop emitting values from the source Observable.
 * @return An Observable that emits values from the source Observable until the `notifier` Observable emits a value.
 */
export function takeUntil<T>(notifier: Observable<any, any>): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      const sourceSubscription = source.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        }
      });

      const notifierSubscription = notifier.subscribe({
        next: () => {
          subscriber.complete();
          sourceSubscription.unsubscribe();
          notifierSubscription.unsubscribe();
        },
        error: (err) => {
          subscriber.error(err); // Pass along errors from the notifier
        },
        complete: () => {
          // If the notifier completes, we don't necessarily complete the source.
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
        notifierSubscription.unsubscribe();
      };
    });
  };
}
