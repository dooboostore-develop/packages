import { Observable } from '../Observable';

export function filter<T>(predicate: (value: T, index: number) => boolean) {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      let index = 0;
      const subscription = source.subscribe({
        next: (value) => {
          try {
            if (predicate(value, index++)) {
              subscriber.next(value);
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
