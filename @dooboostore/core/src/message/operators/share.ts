import { Observable, OperatorFunction } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

/**
 * Returns a new Observable that multicasts (shares) the original Observable. As long as there is
 * at least one Subscriber this Observable will be subscribed and emitting data.
 * When all subscribers have unsubscribed it will unsubscribe from the source Observable.
 *
 * @return An Observable that upon connection causes the source Observable to emit items to its Observers.
 */
export function share<T>(): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    let subject: Subject<T> | null = null;
    let sourceSubscription: Subscription | null = null;
    let refCount = 0;
    let hasCompleted = false;
    let hasErrored = false;

    const reset = () => {
      subject = null;
      sourceSubscription = null;
      hasCompleted = false;
      hasErrored = false;
    };

    return new Observable<T>(subscriber => {
      refCount++;
      let isFirst = false;

      // 이미 완료되었거나 에러가 발생한 경우, 새로운 구독 시작
      if (!subject || hasCompleted || hasErrored) {
        if (sourceSubscription) {
          sourceSubscription.unsubscribe();
        }
        subject = new Subject<T>();
        hasCompleted = false;
        hasErrored = false;
        isFirst = true;
      }

      // 구독을 먼저 해야 동기적인 방출을 잡을 수 있음.
      const subscription = subject.subscribe({
        next: value => subscriber.next(value),
        error: err => subscriber.error(err),
        complete: () => subscriber.complete()
      });

      if (isFirst) {
        const sub = source.subscribe({
          next: value => {
            if (subject) {
              subject.next(value);
            }
          },
          error: err => {
            hasErrored = true;
            const s = subject;
            if (s) {
              s.error(err);
            }
            // 에러 후에도 refCount가 0이 되면 정리
            if (refCount === 0) {
              reset();
            }
          },
          complete: () => {
            hasCompleted = true;
            const s = subject;
            if (s) {
              s.complete();
            }
            // 완료 후에도 refCount가 0이 되면 정리
            if (refCount === 0) {
              reset();
            }
          }
        });

        // 동기적으로 완료/에러되어 이미 reset()이 호출된 경우
        if (!subject) {
          sub.unsubscribe();
        } else {
          sourceSubscription = sub;
        }
      }

      return () => {
        refCount--;
        subscription.unsubscribe();

        if (refCount === 0) {
          if (sourceSubscription) {
            sourceSubscription.unsubscribe();
          }
          reset();
        }
      };
    });
  };
}
