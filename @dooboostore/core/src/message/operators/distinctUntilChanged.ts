import { Observable } from '../Observable';

export function distinctUntilChanged<T>(
  comparator?: (prev: T, curr: T) => boolean
) {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      let hasValue = false;
      let previousValue: T;

      const subscription = source.subscribe({
        next: (value) => {
          const areEqual = hasValue
            ? comparator
              ? comparator(previousValue, value)
              : previousValue === value
            : false;

          if (!areEqual) {
            hasValue = true;
            previousValue = value;
            subscriber.next(value);
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        }
      });
      return subscription; // Return the subscription for teardown
    });
  };
}
