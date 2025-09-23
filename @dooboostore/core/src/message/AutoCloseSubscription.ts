import { Subscription } from './Subscription';

export class AutoCloseSubscription implements Subscription {
  closed = false;
  constructor(private userUnsubscribe: () => void) {}

  unsubscribe(): void {
    this.userUnsubscribe();
    this.closed = true;
  }
}
