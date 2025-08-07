import { Observable } from '../Observable';

/**
 * Converts the arguments to an observable sequence.
 *
 * @param values A comma separated list of arguments you want to be emitted
 * @return An Observable that emits the arguments described above and then completes.
 */
export function of<T>(...values: T[]): Observable<T> {
  return new Observable<T>(subscriber => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}