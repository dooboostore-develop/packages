import { Observable, OperatorFunction } from '../Observable';

/**
 * Buffers the source Observable values for a specific time period.
 *
 * @param bufferTimeSpan The amount of time to fill each buffer for.
 * @return An Observable of arrays of values.
 */
export function bufferTime<T>(bufferTimeSpan: number): OperatorFunction<T, T[]> {
  return (source: Observable<T, any>): Observable<T[], any> => {
    return new Observable<T[]>(subscriber => {
      let buffer: T[] = [];

      const intervalId = setInterval(() => {
        if (buffer.length > 0) {
          subscriber.next(buffer);
          buffer = [];
        }
      }, bufferTimeSpan);

      const sourceSubscription = source.subscribe({
        next: (value) => {
          buffer.push(value);
        },
        error: (err) => {
          subscriber.error(err);
          clearInterval(intervalId);
        },
        complete: () => {
          if (buffer.length > 0) {
            subscriber.next(buffer);
          }
          subscriber.complete();
          clearInterval(intervalId);
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
        clearInterval(intervalId);
      };
    });
  };
}
