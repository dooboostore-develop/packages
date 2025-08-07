import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { Observer } from './Observer';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack } from './Subscribable';

export class BehaviorSubject<T, E = any> extends Subject<T, E> {
  private _value: T; // BehaviorSubject always has a current value

  constructor(initialValue: T) {
    super();
    this._value = initialValue; // Store the initial value
  }

  next(data: T): void {
    this._value = data; // Update the current value
    super.next(data); // Multicast to all current subscribers
  }

  protected _subscribeToSubject(subscriber: any): Subscription {
    // Call parent's subscribe logic first
    const subscription = super._subscribeToSubject(subscriber);

    // Immediately emit the current value to the new subscriber
    // Only if the subject has not completed or errored
    if (!(this as any)._isStopped) { // _isStopped is from Subject
      subscriber.next(this._value);
    } else if ((this as any)._hasError) { // _hasError is from Subject
      subscriber.error((this as any)._error!); // _error is from Subject
    } else {
      subscriber.complete();
    }

    return subscription;
  }

  getValue(): T {
    if ((this as any)._hasError) {
      throw (this as any)._error;
    }
    return this._value;
  }
}