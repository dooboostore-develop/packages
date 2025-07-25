import { Observable } from '../Observable';

/**
 * Creates an output Observable which concurrently emits all values from every given input Observable.
 *
 * @param observables Input Observables to merge together.
 * @return An Observable that emits items from all the input Observables concurrently.
 */
export function merge<T>(...observables: Observable<T>[]): Observable<T> {
  return new Observable<T>(subscriber => {
    if (observables.length === 0) {
      subscriber.complete();
      return;
    }

    let completedCount = 0;
    const subscriptions: any[] = [];

    for (const observable of observables) {
      const subscription = observable.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          completedCount++;
          if (completedCount === observables.length) {
            subscriber.complete();
          }
        }
      });
      subscriptions.push(subscription);
    }

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  });
}