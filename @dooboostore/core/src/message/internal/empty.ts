import { Observable } from '../Observable';

/**
 * Creates an Observable that emits no items to the Observer and immediately
 * emits a complete notification.
 *
 * @return An Observable that emits only the complete notification.
 */
export function empty<T = never>(): Observable<T> {
  return new Observable<T>(subscriber => {
    subscriber.complete();
  });
}