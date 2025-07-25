import { Observable } from '../Observable';

/**
 * Converts a Promise to an Observable.
 *
 * @param promise A promise to be converted to Observable
 * @return An Observable that emits the resolved value of the Promise and then completes,
 * or emits an error if the Promise rejects.
 */
export function fromPromise<T>(promise: Promise<T>): Observable<T> {
  return new Observable<T>(subscriber => {
    promise
      .then(value => {
        subscriber.next(value);
        subscriber.complete();
      })
      .catch(error => {
        subscriber.error(error);
      });
  });
}