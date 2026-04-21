import { Observable } from '../Observable';

export interface ThrottleTimeConfig {
  leading?: boolean;
  trailing?: boolean;
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (id: any) => void;
}

/**
 * Emits a value from the source Observable, then ignores subsequent source values
 * for a duration of time, then repeats this process.
 *
 * @param duration The duration in milliseconds to throttle
 * @param config Optional configuration object
 * @param config.leading Whether to emit the first value immediately (default: true)
 * @param config.trailing Whether to emit the last value after throttle duration (default: false)
 * @param config.setTimeout Custom setTimeout function (for testing)
 * @param config.clearTimeout Custom clearTimeout function (for testing)
 * @return An Observable that performs the throttle operation.
 *
 * @example
 * // Emit at most once per 500ms
 * source$.pipe(throttleTime(500)).subscribe(value => console.log(value));
 *
 * @example
 * // Emit first value immediately, then at most once per 500ms
 * source$.pipe(throttleTime(500, { leading: true, trailing: false })).subscribe(...);
 *
 * @example
 * // Emit last value after throttle duration
 * source$.pipe(throttleTime(500, { leading: true, trailing: true })).subscribe(...);
 */
export function throttleTime<T>(
  duration: number,
  config?: ThrottleTimeConfig
): (source: Observable<T, any>) => Observable<T, any> {
  const leading = config?.leading ?? true;
  const trailing = config?.trailing ?? false;
  const setTimeoutFn = config?.setTimeout || setTimeout;
  const clearTimeoutFn = config?.clearTimeout || clearTimeout;

  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      let throttled = false;
      let trailingValue: T | undefined;
      let hasTrailingValue = false;
      let timeoutId: any = null;

      const endThrottle = () => {
        if (timeoutId !== null) {
          clearTimeoutFn(timeoutId);
          timeoutId = null;
        }

        throttled = false;

        // Emit trailing value if configured
        if (trailing && hasTrailingValue) {
          const valueToEmit = trailingValue!;
          hasTrailingValue = false;
          trailingValue = undefined;

          // Use Promise to avoid stack overflow
          Promise.resolve().then(() => {
            if (!subscriber.closed) {
              subscriber.next(valueToEmit);
              startThrottle();
            }
          });
        }
      };

      const startThrottle = () => {
        if (throttled) {
          return;
        }

        throttled = true;
        timeoutId = setTimeoutFn(() => {
          endThrottle();
        }, duration);
      };

      const subscription = source.subscribe({
        next: (value) => {
          if (!throttled) {
            if (leading) {
              subscriber.next(value);
            } else if (trailing) {
              // If leading is false and trailing is true, save first value as trailing
              trailingValue = value;
              hasTrailingValue = true;
            }
            startThrottle();
          } else if (trailing) {
            // During throttle, only keep the last value
            trailingValue = value;
            hasTrailingValue = true;
          }
        },
        error: (err) => {
          if (timeoutId !== null) {
            clearTimeoutFn(timeoutId);
            timeoutId = null;
          }
          throttled = false;
          subscriber.error(err);
        },
        complete: () => {
          if (timeoutId !== null) {
            clearTimeoutFn(timeoutId);
            timeoutId = null;
          }
          // Emit trailing value if pending
          if (trailing && hasTrailingValue) {
            subscriber.next(trailingValue!);
          }
          subscriber.complete();
        }
      });

      return () => {
        subscription.unsubscribe();
        if (timeoutId !== null) {
          clearTimeoutFn(timeoutId);
          timeoutId = null;
        }
      };
    });
  };
}
