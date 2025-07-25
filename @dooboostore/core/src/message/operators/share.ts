import { Observable, OperatorFunction } from '../Observable';
import { Subject } from '../Subject';

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
    let sourceSubscription: any = null;
    let refCount = 0;

    return new Observable<T>(subscriber => {
      refCount++;

      if (!subject) {
        subject = new Subject<T>();
        sourceSubscription = source.subscribe({
          next: (value) => subject!.next(value),
          error: (err) => {
            const s = subject;
            subject = null;
            sourceSubscription = null;
            refCount = 0;
            if (s) {
              s.error(err);
            }
          },
          complete: () => {
            const s = subject;
            subject = null;
            sourceSubscription = null;
            refCount = 0;
            if (s) {
              s.complete();
            }
          }
        });
      }

      const subscription = subject.subscribe({
        next: (value) => subscriber.next(value),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete()
      });

      return () => {
        refCount--;
        subscription.unsubscribe();
        
        if (refCount === 0 && sourceSubscription) {
          sourceSubscription.unsubscribe();
          sourceSubscription = null;
          subject = null;
        }
      };
    });
  };
}