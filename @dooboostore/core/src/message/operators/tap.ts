import { Observable } from '../Observable';
import { Observer } from '../Observer';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack } from '../Subscribable';

export function tap<T>(
  observerOrNext?: Partial<Observer<T, any>> | ObserverCallBack<T>,
  error?: ErrorCallBack,
  complete?: CompleteCallBack
) {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable(subscriber => {
      const partialObserver: Partial<Observer<T, any>> = {
        next: typeof observerOrNext === 'object' ? observerOrNext.next : observerOrNext,
        error: typeof observerOrNext === 'object' ? observerOrNext.error : error,
        complete: typeof observerOrNext === 'object' ? observerOrNext.complete : complete
      };

      const subscription = source.subscribe({
        next: (value) => {
          partialObserver.next?.(value);
          subscriber.next(value);
        },
        error: (err) => {
          partialObserver.error?.(err);
          subscriber.error(err);
        },
        complete: () => {
          partialObserver.complete?.();
          subscriber.complete();
        }
      });
      return subscription; // Return the subscription for teardown
    });
  };
}
