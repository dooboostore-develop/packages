import { Observable, OperatorFunction } from '../Observable';

export function filter<T, S extends T>(
  predicate: (value: T, index: number) => value is S
): OperatorFunction<T, S>;
export function filter<T, S extends T>(
  predicate: (value: T) => value is S
): OperatorFunction<T, S>;
export function filter<T>(
  predicate: (value: T, index: number) => boolean
): OperatorFunction<T, T>;
export function filter<T>(
  predicate: (value: T) => boolean
): OperatorFunction<T, T>;
export function filter<T, S extends T>(
  predicate: ((value: T, index: number) => value is S) | ((value: T, index: number) => boolean)
): OperatorFunction<T, S> | OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<S, any> | Observable<T, any> => {
    return new Observable(subscriber => {
      let index = 0;
      const subscription = source.subscribe({
        next: (value) => {
          try {
            if (predicate(value, index++)) {
              subscriber.next(value as any);
            }
          } catch (err) {
            subscriber.error(err as any);
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
