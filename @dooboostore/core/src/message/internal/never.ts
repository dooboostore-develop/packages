import { Observable } from '../Observable';

/**
 * Creates an Observable that emits no items to the Observer and never completes.
 *
 * @return An Observable that never emits anything.
 */
export function never<T = never>(): Observable<T> {
  return new Observable<T>(() => {
    // Do nothing - never emit, never complete, never error
  });
}