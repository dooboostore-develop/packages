import { Observable } from '../Observable';

/**
 * Creates an Observable from an Array.
 *
 * @param input An array to be converted to Observable
 * @return An Observable that emits the items from the array and then completes.
 */
export function fromArray<T>(input: T[]): Observable<T> {
  return new Observable<T>(subscriber => {
    for (const item of input) {
      subscriber.next(item);
    }
    subscriber.complete();
  });
}