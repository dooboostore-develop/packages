import { Observable } from '../Observable';

/**
 * Creates an Observable that, on subscribe, calls an Observable factory to
 * make an Observable for each new Observer.
 *
 * @param observableFactory The Observable factory function to invoke for each
 * Observer that subscribes to the output Observable. May also return a Promise,
 * which will be converted on the fly to an Observable.
 * @return An Observable whose Observers' subscriptions trigger an invocation
 * of the given Observable factory function.
 */
export function defer<T>(observableFactory: () => Observable<T> | Promise<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    let result: Observable<T> | Promise<T>;

    try {
      result = observableFactory();
    } catch (err) {
      subscriber.error(err);
      return;
    }

    // If result is a Promise, convert it to Observable
    if (result && typeof (result as any).then === 'function') {
      const promise = result as Promise<T>;
      promise
        .then(value => {
          subscriber.next(value);
          subscriber.complete();
        })
        .catch(error => {
          subscriber.error(error);
        });
    } else {
      // If result is an Observable, subscribe to it
      const observable = result as Observable<T>;
      return observable.subscribe({
        next: (value) => subscriber.next(value),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete()
      });
    }
  });
}