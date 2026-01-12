import { Unsubscribable } from './Unsubscribable';

export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}

export class Subscription implements SubscriptionLike {
  public static EMPTY: Subscription = (function (empty: any) {
    empty.closed = true;
    return empty;
  })(new Subscription());

  public closed = false;
  private _teardowns: (Unsubscribable | (() => void))[] | null = null;

  constructor(initialTeardown?: () => void) {
    if (initialTeardown) {
      this.add(initialTeardown);
    }
  }

  unsubscribe(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    const teardowns = this._teardowns;
    this._teardowns = null;

    if (teardowns) {
      let errors: any[] | null = null;
      teardowns.forEach(teardown => {
        try {
          if (typeof teardown === 'function') {
            teardown();
          } else if (teardown && typeof (teardown as any).unsubscribe === 'function') {
            (teardown as any).unsubscribe();
          }
        } catch (e) {
          errors = errors || [];
          errors.push(e);
        }
      });
      if (errors) {
        throw new Error(errors.map(e => e.message).join('\n'));
      }
    }
  }

  add(teardown: Unsubscribable | Function | void): void {
    if (!teardown) {
      return;
    }
    let teardownToAdd: Unsubscribable | (() => void);
    if (typeof teardown === 'function') {
      teardownToAdd = teardown as () => void;
    } else if (typeof teardown === 'object' && teardown !== null && typeof (teardown as any).unsubscribe === 'function') {
      teardownToAdd = teardown as Unsubscribable;
    } else {
      return;
    }

    if (this.closed) {
      if (typeof teardownToAdd === 'function') {
        teardownToAdd();
      } else {
        teardownToAdd.unsubscribe();
      }
    } else {
      if (!this._teardowns) {
        this._teardowns = [];
      }
      this._teardowns.push(teardownToAdd);
    }
  }

  remove(teardown: Unsubscribable | Function | void): void {
    const teardowns = this._teardowns;
    if (!teardowns || !teardown) {
      return;
    }
    const index = teardowns.indexOf(teardown as any);
    if (index !== -1) {
      teardowns.splice(index, 1);
    }
  }
}
