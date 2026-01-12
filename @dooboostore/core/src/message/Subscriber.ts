import { Subscription } from './Subscription';
import { Observer } from './Observer';

export class Subscriber<T, E = any> extends Subscription implements Observer<T, E> {
  constructor(private destination: Observer<T, E>) {
    super();
  }
  next(value: T): void {
    if (this.closed) {
      return;
    }
    this.destination.next(value);
  }
  error(err: E): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.destination.error(err);
    this.unsubscribe();
  }
  complete(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.destination.complete();
    this.unsubscribe();
  }
}
