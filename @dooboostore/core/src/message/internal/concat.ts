import { Observable } from '../Observable';

/**
 * Creates an output Observable which sequentially emits all values from the first given
 * Observable and then moves on to the next.
 *
 * @param observables Input Observables to concatenate.
 * @return An Observable that emits items from all the input Observables sequentially.
 */
export function concat<T>(...observables: Observable<T>[]): Observable<T> {
  return new Observable<T>(subscriber => {
    let currentIndex = 0;
    let currentSubscription: any;

    function subscribeToNext() {
      if (currentIndex >= observables.length) {
        subscriber.complete();
        return;
      }

      const currentObservable = observables[currentIndex++];
      currentSubscription = currentObservable.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscribeToNext();
        }
      });
    }

    subscribeToNext();

    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe();
      }
    };
  });
}