import { Observer } from './Observer';
import { Observable, OperatorFunction } from './Observable';
import { Subscription } from './Subscription';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack, Subscribable } from './Subscribable';

export class Subject<T, E = any> extends Observable<T, E> implements Observer<T, E> {
  private _observers = new Set<Partial<Observer<T, E>>>();
  private _isStopped = false;
  private _hasError = false;
  private _error: E | undefined;

  constructor() {
    // Call parent Observable constructor with our own subscribe logic
    super((subscriber) => {
      return this._subscribeToSubject(subscriber);
    });
  }

  protected _subscribeToSubject(subscriber: any): Subscription {
    const partialObserver: Partial<Observer<T, E>> = {
      next: subscriber.next.bind(subscriber),
      error: subscriber.error.bind(subscriber),
      complete: subscriber.complete.bind(subscriber)
    };

    if (this._isStopped) {
      if (this._hasError) {
        partialObserver.error?.(this._error!);
      } else {
        partialObserver.complete?.();
      }
      return { closed: true, unsubscribe: () => {} }; // Already stopped, return dummy subscription
    }

    this._observers.add(partialObserver);

    let closed = false;

    return {
      get closed() {
        return closed;
      },
      unsubscribe: () => {
        this._observers.delete(partialObserver);
        closed = true;
      }
    };
  }

  next(data: T): void {
    if (this._isStopped) {
      return; // Subject is stopped, no more emissions
    }
    this._observers.forEach(observer => {
      observer.next?.(data)
    });
  }

  error(err: E): void {
    if (this._isStopped) {
      return; // Subject is stopped, no more errors
    }
    this._hasError = true;
    this._error = err;
    this._isStopped = true; // Subject stops after error
    this._observers.forEach(observer => observer.error?.(err));
    this._observers.clear(); // Clear observers after error
  }

  complete(): void {
    if (this._isStopped) {
      return; // Subject is stopped, no more completions
    }
    this._isStopped = true; // Subject stops after completion
    this._observers.forEach(observer => observer.complete?.());
    this._observers.clear(); // Clear observers after completion
  }



  asObservable(): Observable<T, E> {
    // Returns a new Observable that wraps this Subject's subscribe method.
    // This hides the next/error/complete methods from the consumer.
    return new Observable<T, E>(subscriber => {
      return this._subscribeToSubject(subscriber);
    });
  }
}