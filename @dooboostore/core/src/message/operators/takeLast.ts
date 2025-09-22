import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits only the last `count` values emitted by the source Observable.
 *
 * @param count The number of last values to emit.
 * @return An Observable that emits only the last `count` values from the source.
 */
export function takeLast<T>(count: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let buffer: T[] = [];

      if (count === 0) {
        subscriber.complete();
        return;
      }

      const sourceSubscription = source.subscribe({
        next: (value) => {
          buffer.push(value);
          if (buffer.length > count) {
            buffer.shift();
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          for (const value of buffer) {
            subscriber.next(value);
          }
          subscriber.complete();
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
      };
    });
  };
}
