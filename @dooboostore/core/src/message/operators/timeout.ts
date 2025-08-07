import { Observable, OperatorFunction } from '../Observable';

export class TimeoutError extends Error {
  constructor(message: string = 'Timeout has occurred') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Errors if Observable does not emit a value in given time span.
 *
 * @param due Number of milliseconds within which Observable must emit values.
 * @return An Observable that errors if the source Observable does not emit a value within the timeout period.
 */
export function timeout<T>(due: number): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let timeoutId: NodeJS.Timeout;
      let hasEmitted = false;

      const resetTimeout = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          if (!hasEmitted) {
            subscriber.error(new TimeoutError());
          }
        }, due);
      };

      resetTimeout();

      const subscription = source.subscribe({
        next: (value) => {
          hasEmitted = true;
          clearTimeout(timeoutId);
          subscriber.next(value);
          resetTimeout();
        },
        error: (err) => {
          clearTimeout(timeoutId);
          subscriber.error(err);
        },
        complete: () => {
          clearTimeout(timeoutId);
          subscriber.complete();
        }
      });

      return () => {
        clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    });
  };
}