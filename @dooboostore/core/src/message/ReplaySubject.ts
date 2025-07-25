import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { Observer } from './Observer';
import { CompleteCallBack, ErrorCallBack, ObserverCallBack } from './Subscribable';

export class ReplaySubject<T, E = any> extends Subject<T, E> {
  private _buffer: T[] = [];
  // Removed: private _error: E | undefined;
  // Removed: private _isStopped = false;

  constructor(private bufferSize: number = Infinity) {
    super();
  }

  next(data: T): void {
    // Rely on parent Subject's _isStopped
    if ((this as any)._isStopped) {
      return; // Cannot emit after stopped
    }
    this._buffer.push(data);
    if (this._buffer.length > this.bufferSize) {
      this._buffer.shift(); // Remove oldest if buffer exceeds size
    }
    super.next(data); // Multicast to current subscribers
  }

  error(err: E): void {
    // Rely on parent Subject to manage _isStopped and _error
    super.error(err); // Multicast error and stop
  }

  complete(): void {
    // Rely on parent Subject to manage _isStopped
    super.complete(); // Multicast complete and stop
  }

  protected _subscribeToSubject(subscriber: any): Subscription {
    // Emit buffered values to the new subscriber first
    this._buffer.forEach(value => subscriber.next(value));

    // If the subject has already completed or errored, emit that status
    // Rely on parent Subject's _isStopped, _hasError, _error
    if ((this as any)._isStopped) {
      if ((this as any)._hasError) {
        subscriber.error((this as any)._error);
      } else {
        subscriber.complete();
      }
      return { closed: true, unsubscribe: () => {} }; // Return dummy subscription as it's already done
    }

    // Then, call super._subscribeToSubject to add the observer for future values
    return super._subscribeToSubject(subscriber);
  }
}
