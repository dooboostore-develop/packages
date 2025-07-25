import { Unsubscribable } from './Unsubscribable';

export interface Subscription extends Unsubscribable {
  closed: boolean;
}
