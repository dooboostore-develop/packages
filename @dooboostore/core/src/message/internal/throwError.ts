import { Observable } from '../Observable';

/**
 * Creates an Observable that emits no items to the Observer and immediately
 * emits an error notification.
 *
 * @param error The particular Error to pass to the error notification.
 * @return An Observable that emits only the error notification.
 */
export function throwError<T = never>(error: any): Observable<T> {
  return new Observable<T>(subscriber => {
    subscriber.error(error);
  });
}