import { Subscription } from './Subscription';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack, Subscribable } from './Subscribable';
import { Observer } from './Observer';
import { Subscriber } from './Subscriber.';

export type OperatorFunction<T, R> = (source: Observable<T, any>) => Observable<R, any>;

export class Observable<T, E = any> implements Subscribable<T, E> {
  private _producerFunction: ((subscriber: Subscriber<T, E>) => (Subscription | (() => void) | void)) | undefined;

  constructor(producerFunction?: (subscriber: Subscriber<T, E>) => (Subscription | (() => void) | void)) {
    this._producerFunction = producerFunction;
  }

  subscribe(observer: Partial<Observer<T, E>>): Subscription;
  subscribe(d: ObserverCallBack<T>, e?: ErrorCallBack, c?: CompleteCallBack): Subscription;
  subscribe(observer: Partial<Observer<T, E>> | ObserverCallBack<T>, e?: ErrorCallBack, c?: CompleteCallBack): Subscription {

    const partialObserver: Partial<Observer<T, E>> = {
      next: typeof observer === 'object' ? observer.next : observer,
      error: typeof observer === 'object' ? observer.error : e,
      complete: typeof observer === 'object' ? observer.complete : c
    }

    // Create a new internal subscriber for this specific subscription
    const internalSubscriber = new Subscriber({
        next: (data: T) => {
          partialObserver.next?.(data);
        },
        error: (e: E) => {
          partialObserver.error?.(e);
        },
        complete: () => {
          partialObserver.complete?.();
        }
      }
    );

    let teardownLogic: Subscription | (() => void) | void;
    if (this._producerFunction) {
        teardownLogic = this._producerFunction(internalSubscriber);
    }

    return {
      unsubscribe: () => {
        // console.log('unsubscribe-->', teardownLogic)
        // Execute the teardown logic returned by the producer function
        if (typeof teardownLogic === 'function') {
            teardownLogic();
        } else if (teardownLogic && typeof teardownLogic.unsubscribe === 'function') {
            teardownLogic.unsubscribe();
        }
      }
    }
  }

  toPromise(): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      let lastValue: T | undefined;
      let subscription: Subscription;

      subscription = this.subscribe({
        next: (value: T) => {
          lastValue = value;
        },
        error: (err: E) => {
          reject(err);
          subscription.unsubscribe();
        },
        complete: () => {
          resolve(lastValue);
          subscription.unsubscribe();
        }
      });
    });
  }

  pipe(): Observable<T, E>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A, any>;
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B, any>;
  pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C, any>;
  pipe<A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D, any>;
  pipe<A, B, C, D, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, F>): Observable<F, any>;
  pipe(...operators: OperatorFunction<any, any>[]): Observable<any, any> {
    if (operators.length === 0) {
      return this as any;
    }
    return operators.reduce((prev, operator) => operator(prev), this as any);
  }
}