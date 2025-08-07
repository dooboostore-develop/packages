import { Observable, OperatorFunction } from '../Observable';

/**
 * Returns an Observable that mirrors the source Observable, but will call a specified function when
 * the source terminates on complete or error.
 *
 * @param callback Function to be called when source terminates.
 * @return An Observable that mirrors the source, but will call the specified function on termination.
 */
export function finalize<T>(callback: () => void): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      const subscription = source.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (err) => {
          try {
            callback();
          } finally {
            subscriber.error(err);
          }
        },
        complete: () => {
          try {
            callback();
          } finally {
            subscriber.complete();
          }
        }
      });

      return () => {
        try {
          subscription.unsubscribe();
        } finally {
          callback();
        }
      };
    });
  };
}