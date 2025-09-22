import { Observable, OperatorFunction } from '../Observable';

export class EmptyError extends Error {
  constructor() {
    super('no elements in sequence');
    this.name = 'EmptyError';
  }
}

/**
 * Emits only the first value (or the first value that meets a condition)
 * emitted by the source Observable.
 *
 * If no value meets the condition, it will emit an EmptyError.
 *
 * @param predicate An optional function to test each source value for a condition.
 * @return An Observable that emits only the first value from the source, or the
 * first value that meets the condition.
 */
export function first<T>(
  predicate?: (value: T, index: number) => boolean
): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let index = 0;
      let found = false;

      const sourceSubscription = source.subscribe({
        next: (value) => {
          if (found) return;
          const passed = predicate ? predicate(value, index++) : true;
          if (passed) {
            found = true;
            subscriber.next(value);
            subscriber.complete();
            sourceSubscription.unsubscribe();
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          if (!found) {
            subscriber.error(new EmptyError());
          }
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
      };
    });
  };
}
