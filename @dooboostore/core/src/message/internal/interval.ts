import { Observable } from '../Observable';

/**
 * Creates an Observable that emits sequential numbers every specified
 * interval of time.
 *
 * @param period The interval size in milliseconds
 * @return An Observable that emits a sequential number each time interval.
 */
export function interval(period: number = 0): Observable<number> {
  // Handle negative periods by treating them as 0
  if (period < 0) {
    period = 0;
  }

  return new Observable<number>(subscriber => {
    let count = 0;
    let intervalId: NodeJS.Timeout;

    // Start emitting after the first period has passed
    intervalId = setInterval(() => {
      subscriber.next(count++);
    }, period);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  });
}