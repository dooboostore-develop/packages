import { Observable, OperatorFunction } from '../Observable';

/**
 * Returns an Observable that emits the items you specify as arguments before it begins
 * to emit items emitted by the source Observable.
 *
 * @param values Items you want the modified Observable to emit first.
 * @return An Observable that emits the given values and then emits the items emitted by the source Observable.
 */
export function startWith<T>(...values: T[]): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      // First emit the starting values
      for (const value of values) {
        subscriber.next(value);
      }
      
      // Then subscribe to the source
      const subscription = source.subscribe({
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

      return subscription;
    });
  };
}