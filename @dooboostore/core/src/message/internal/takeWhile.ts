import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits values emitted by the source Observable so long as each value satisfies
 * the given predicate, and then completes as soon as this predicate is not satisfied.
 *
 * @param predicate A function that evaluates each value emitted by the source Observable.
 * If it returns `true`, the value is emitted, if `false` the Observable completes.
 * @param inclusive When set to `true` the value that caused predicate to return `false` will also be emitted.
 * @return An Observable that emits values from the source Observable so long as each value
 * satisfies the condition defined by the predicate, then completes.
 */
export function takeWhile<T>(
  predicate: (value: T, index: number) => boolean,
  inclusive: boolean = false
): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let index = 0;
      
      const subscription = source.subscribe({
        next: (value) => {
          const result = predicate(value, index++);
          
          if (result) {
            subscriber.next(value);
          } else {
            if (inclusive) {
              subscriber.next(value);
            }
            subscriber.complete();
          }
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