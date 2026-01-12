import { Subscription } from './Subscription';

export class AutoCloseSubscription extends Subscription {
  constructor(userUnsubscribe: () => void) {
    super(userUnsubscribe);
  }
}
