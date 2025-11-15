import { Observable } from '../Observable';

/**
 * Creates an Observable that emits sequential numbers every specified interval of time.
 *
 * @param period The interval size in milliseconds (by default) or the time unit determined by the scheduler's clock.
 * @return An Observable that emits a sequential number each time interval.
 *
 * @example
 * ```typescript
 * import { interval } from '@dooboostore/core/message/operators';
 *
 * const numbers = interval(1000);
 * numbers.subscribe(x => console.log(x));
 * // Logs: 0, 1, 2, 3, 4, ... (every second)
 * ```
 */
export function interval(period: number = 0): Observable<number> {
  return new Observable<number>(subscriber => {
    let count = 0;
    const intervalId = setInterval(() => {
      subscriber.next(count++);
    }, period);

    return () => {
      clearInterval(intervalId);
    };
  });
}
