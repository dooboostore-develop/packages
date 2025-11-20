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
      let isEndingThrottle = false; // 재귀 방지 플래그

      const endThrottle = () => {
        // 이미 endThrottle 실행 중이면 무시 (재귀 방지)
        if (isEndingThrottle) {
          return;
        }

        isEndingThrottle = true;

        if (durationSubscription) {
          durationSubscription.unsubscribe();
          durationSubscription = null;
        }

        throttled = false;

        // trailing 값이 있으면 비동기로 처리 (스택 오버플로우 방지)
        if (trailing && hasTrailingValue) {
          const valueToEmit = trailingValue!;
          hasTrailingValue = false;
          trailingValue = undefined;

          // 다음 이벤트 루프에서 처리
          Promise.resolve().then(() => {
            isEndingThrottle = false;
            if (!subscriber.closed) {
              subscriber.next(valueToEmit);
              startThrottle(valueToEmit);
            }
          });
        } else {
          isEndingThrottle = false;
        }
      };

      const startThrottle = (value: T) => {
        if (throttled) {
          return; // 이미 throttle 중이면 무시
        }

        throttled = true;
        try {
          const duration = durationSelector(value);
          durationSubscription = duration.subscribe({
            next: () => {
              // duration이 값을 emit하면 throttle 종료
              endThrottle();
            },
            error: (err) => {
              throttled = false;
              if (durationSubscription) {
                durationSubscription.unsubscribe();
                durationSubscription = null;
              }
              subscriber.error(err);
            },
            complete: () => {
              // duration이 complete되면 throttle 종료
              endThrottle();
            }
          });
        } catch (err) {
          throttled = false;
          subscriber.error(err);
        }
      };

      const sourceSubscription = source.subscribe({
        next: (value) => {
          if (!throttled) {
            if (leading) {
              subscriber.next(value);
            } else if (trailing) {
              // leading이 false이고 trailing이 true인 경우, 첫 값을 trailing으로 저장
              trailingValue = value;
              hasTrailingValue = true;
            }
            startThrottle(value);
          } else if (trailing) {
            // throttle 중에는 마지막 값만 저장
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
