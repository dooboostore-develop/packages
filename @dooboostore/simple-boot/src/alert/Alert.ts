import { AlertFactoryConfig } from './AlertFactoryConfig';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { AlertAction } from './AlertAction';
import { AlertService } from './AlertService';

export abstract class Alert<T> {
  result?: T ;
  isActive = false;
  activateBefore: ((() => void) | (() => Promise<void>))[] = [];
  activateAfter: ((() => void) | (() => Promise<void>))[] = [];
  deActivateBefore: ((() => void) | (() => Promise<void>))[] = [];
  deActivateAfter: ((() => void) | (() => Promise<void>))[] = [];
  data: Map<string, any> = new Map();
  public readonly uuid: string;

  constructor(
    public alertService?: AlertService<T>,
    public config?: AlertFactoryConfig<T>
  ) {
    if (config?.uuid) {
      this.uuid = config.uuid;
    } else {
      this.uuid = RandomUtils.uuid();
    }
  }

  addOpenBefore(fn: (() => void) | (() => Promise<void>)) {
    this.activateBefore.push(fn);
  }

  addOpenAfter(fn: (() => void) | (() => Promise<void>)) {
    this.activateAfter.push(fn);
  }

  addCloseBefore(fn: (() => void) | (() => Promise<void>)) {
    this.deActivateBefore.push(fn);
  }

  addCloseAfter(fn: (() => void) | (() => Promise<void>)) {
    this.deActivateAfter.push(fn);
  }

  setData(key: string, value: any) {
    this.data.set(key, value);
  }

  getData(key: string) {
    return this.data.get(key);
  }

  async activate(): Promise<void> {
    try {
      await Promise.allSettled(this.activateBefore.map(it => it()))
        .then(it => {
          this.result = this.make();
          this.alertService?.publish({action: AlertAction.ACTIVE, alert: this});
          this.isActive = true;
          if (this.config?.closeTime !== undefined && this.config?.closeTime > 0) {
            setTimeout(() => {
              this.deActivate();
            }, this.config.closeTime);
          }
          this.config?.activate?.(this.result, this);
        });
    } catch (e) {

    } finally {
      await Promise.allSettled(this.activateAfter.map(it => it())).then(it => {
      });
    }

  }

  async deActivate(): Promise<void> {
    try {
      await Promise.allSettled(this.deActivateBefore.map(it => it()))
        .then(it => {
          this.alertService?.publish({action: AlertAction.IN_ACTIVE, alert: this});
          this.isActive = false;
          this.config?.deActivate?.(this.result, this);
        })
    } catch (e) {

    } finally {
      await Promise.allSettled(this.deActivateAfter.map(it => it())).then(it => {
      });

    }
  }

  protected abstract make(): T ;
}
