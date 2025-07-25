import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { Observer } from './Observer';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack } from './Subscribable';

export class AsyncSubject<T, E = any> extends Subject<T, E> {
  private _lastValue: T | undefined;
  private _hasValue = false;
  // _isStopped, _hasError, _error are now managed by the parent Subject class

  next(data: T): void {
    // Only store the value, don't emit it yet.
    if (!(this as any)._isStopped) { // Check _isStopped from parent Subject
      this._lastValue = data;
      this._hasValue = true;
    }
  }

  complete(): void {
    if (!(this as any)._isStopped) { // Check _isStopped from parent Subject
      if (this._hasValue) {
        super.next(this._lastValue!); // Emit the last value
      }
      super.complete(); // Call parent complete to notify observers and stop
    }
  }

  error(err: E): void {
    // Call parent error to notify observers and stop
    super.error(err);
  }

  protected _subscribeToSubject(subscriber: any): Subscription {
    // If the subject has already completed or errored, emit that status
    if ((this as any)._isStopped) { // Check _isStopped from parent Subject
      if ((this as any)._hasError) { // Check _hasError from parent Subject
        subscriber.error((this as any)._error!); // _error from parent Subject
      } else {
        if (this._hasValue) { // Only emit value if it was set before completion
          subscriber.next(this._lastValue!);
        }
        subscriber.complete();
      }
      return { closed: true, unsubscribe: () => {} }; // Return dummy subscription as it's already done
    }

    // Otherwise, add the observer for future notifications
    return super._subscribeToSubject(subscriber);
  }
}