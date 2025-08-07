import { Observable } from '../Observable';

export function map<T, R>(project: (value: T, index: number) => R) {
  return (source: Observable<T, any>): Observable<R, any> => {
    return new Observable(subscriber => {
      let index = 0;
      const subscription = source.subscribe({
        next: (value) => {
          try {
            subscriber.next(project(value, index++));
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
