import { Observable } from '../Observable';

export function debounceTime<T>(duration: number) {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      let timeoutId: any = null;
      let lastValue: T | undefined;
      let hasValue = false;

      const subscription = source.subscribe({
        next: (value) => {
          clearTimeout(timeoutId);
          lastValue = value;
          hasValue = true;
          timeoutId = setTimeout(() => {
            if (hasValue) {
              subscriber.next(lastValue!);
              hasValue = false; // Reset after emitting
            }
          }, duration);
        },
        error: (err) => {
          clearTimeout(timeoutId);
          subscriber.error(err);
        },
        complete: () => {
          clearTimeout(timeoutId);
          // Emit the last value if it's pending
          if (hasValue) {
            subscriber.next(lastValue!);
          }
          subscriber.complete();
        }
      });
      return subscription; // Return the subscription for teardown
    });
  };
}
