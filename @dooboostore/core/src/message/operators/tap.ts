import { Observable } from '../Observable';
import { Observer } from '../Observer';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack } from '../Subscribable';

export function tap<T>(observerOrNext?: Partial<Observer<T, any>> | ObserverCallBack<T>, error?: ErrorCallBack, complete?: CompleteCallBack) {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      const partialObserver: Partial<Observer<T, any>> = {
        next: typeof observerOrNext === 'object' ? observerOrNext.next : observerOrNext,
        error: typeof observerOrNext === 'object' ? observerOrNext.error : error,
        complete: typeof observerOrNext === 'object' ? observerOrNext.complete : complete
      };

      const subscription = source.subscribe({
        next: value => {
          try {
            partialObserver.next?.(value);
          } catch (err) {
            subscriber.error(err);
            return;
          }
          subscriber.next(value);
        },
        error: err => {
          try {
            partialObserver.error?.(err);
          } catch (e) {
            subscriber.error(e); // tap 에러가 우선 혹은 원본 에러와 함께? 보통은 tap 에러 전파
            return;
          }
          subscriber.error(err);
        },
        complete: () => {
          try {
            partialObserver.complete?.();
          } catch (err) {
            subscriber.error(err);
            return;
          }
          subscriber.complete();
        }
      });
      return subscription; // Return the subscription for teardown
    });
  };
}
