import { Observable } from '../Observable';

/**
 * Creates an Observable that starts emitting after an `initialDelay` and emits ever increasing numbers
 * after each `period` of time thereafter.
 *
 * @param initialDelay The initial delay time to wait before emitting the first value
 * @param period The period of time between emissions of the subsequent numbers
 * @return An Observable that emits a sequential number each period of time after an initial delay
 */
export function timer(initialDelay: number, period?: number): Observable<number> {
  return new Observable<number>(subscriber => {
    let count = 0;
    let intervalId: NodeJS.Timeout | undefined;

    // Initial delay
    const timeoutId = setTimeout(() => {
      subscriber.next(count++);
      
      // If period is specified, continue emitting at intervals
      if (period !== undefined && period >= 0) {
        intervalId = setInterval(() => {
          subscriber.next(count++);
        }, period);
      } else {
        // If no period, complete after first emission
        subscriber.complete();
      }
    }, Math.max(0, initialDelay));

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  });
}