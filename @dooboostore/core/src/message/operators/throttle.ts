import { Observable, OperatorFunction } from '../Observable';

/**
 * Emits a value from the source Observable, then ignores subsequent source values
 * for a duration determined by another Observable, then repeats this process.
 *
 * @param durationSelector A function that receives a value from the source Observable
 * and returns an Observable that indicates the duration of the throttle.
 * @param config Optional configuration object
 * @param config.leading Whether to emit the first value immediately (default: true)
 * @param config.trailing Whether to emit the last value after throttle duration (default: false)
 * @return An Observable that performs the throttle operation.
 */
export function throttle<T>(
  durationSelector: (value: T) => Observable<any>,
  config?: { leading?: boolean; trailing?: boolean }
): OperatorFunction<T, T> {
  const leading = config?.leading ?? true;
  const trailing = config?.trailing ?? false;

  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let throttled = false;
      let trailingValue: T | undefined;
      let hasTrailingValue = false;
      let durationSubscription: any = null;

      const endThrottle = () => {
        if (durationSubscription) {
          durationSubscription.unsubscribe();
          durationSubscription = null;
        }
        
        if (trailing && hasTrailingValue) {
          subscriber.next(trailingValue!);
          hasTrailingValue = false;
          startThrottle(trailingValue!);
        } else {
          throttled = false;
        }
      };

      const startThrottle = (value: T) => {
        throttled = true;
        try {
          const duration = durationSelector(value);
          durationSubscription = duration.subscribe({
            next: () => {
              endThrottle();
            },
            error: (err) => {
              subscriber.error(err);
            },
            complete: () => {
              endThrottle();
            }
          });
        } catch (err) {
          subscriber.error(err);
        }
      };

      const sourceSubscription = source.subscribe({
        next: (value) => {
          if (!throttled) {
            if (leading) {
              subscriber.next(value);
            }
            startThrottle(value);
            hasTrailingValue = false;
          } else if (trailing) {
            trailingValue = value;
            hasTrailingValue = true;
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
        if (durationSubscription) {
          durationSubscription.unsubscribe();
        }
      };
    });
  };
}
