import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits only the first value (or the first value that meets some condition) emitted by the source Observable.
 *
 * @param predicate An optional function to test each item emitted by the source Observable.
 * @param defaultValue The default value emitted in case no valid value was found on the source.
 * @return An Observable that emits only the first value from the source Observable, or a default value if no value is emitted.
 */
export function first<T>(
  predicate?: (value: T, index: number) => boolean,
  defaultValue?: T
): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let index = 0;
      let hasValue = false;

      const subscription = source.subscribe({
        next: (value) => {
          if (hasValue) {
            return; // Already found first value
          }

          const shouldEmit = predicate ? predicate(value, index++) : true;

          if (shouldEmit) {
            hasValue = true;
            subscriber.next(value);
            subscriber.complete();
            subscription.unsubscribe();
          }
        },
        error: (err) => {
          if (!hasValue) {
            subscriber.error(err);
          }
        },
        complete: () => {
          if (!hasValue) {
            if (defaultValue !== undefined) {
              subscriber.next(defaultValue);
              subscriber.complete();
            } else {
              subscriber.error(new Error('no elements in sequence'));
            }
          }
        }
      });

      return subscription;
    });
  };
}
