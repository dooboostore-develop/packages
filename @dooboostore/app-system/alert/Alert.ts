import { AlertFactoryConfig } from './AlertFactoryConfig';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { AlertAction } from './AlertAction';
import { AlertService } from './AlertService';

export abstract class Alert<T> {
  result?: T | void;
  isActive = false;
  activeBefore: ((() => void) | (() => Promise<void>))[] = [];
  avtiveAfter: ((() => void) | (() => Promise<void>))[] = [];
  deActiveBefore: ((() => void) | (() => Promise<void>))[] = [];
  deActiveAfter: ((() => void) | (() => Promise<void>))[] = [];
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
    this.activeBefore.push(fn);
  }

  addOpenAfter(fn: (() => void) | (() => Promise<void>)) {
    this.avtiveAfter.push(fn);
  }

  addCloseBefore(fn: (() => void) | (() => Promise<void>)) {
    this.deActiveBefore.push(fn);
  }

  addCloseAfter(fn: (() => void) | (() => Promise<void>)) {
    this.deActiveAfter.push(fn);
  }

  setData(key: string, value: any) {
    this.data.set(key, value);
  }
  getData(key: string) {
    return this.data.get(key);
  }

  active() {
    Promise.allSettled(this.activeBefore.map(it => it()))
      .then(it => {
        this.result = this.make();
        this.alertService?.publish({ action: AlertAction.ACTIVE, alert: this });
        this.isActive = true;
        if (this.config?.closeTime !== undefined && this.config?.closeTime > 0) {
          setTimeout(() => {
            this.deActive();
          }, this.config.closeTime);
        }
        this.config?.active?.(this.result, this);
      })
      .finally(() => {
        Promise.allSettled(this.avtiveAfter.map(it => it())).then(it => {});
      });
  }

  deActive() {
    Promise.allSettled(this.deActiveBefore.map(it => it()))
      .then(it => {
        this.alertService?.publish({ action: AlertAction.DE_ACTIVE, alert: this });
        this.isActive = false;
        this.config?.deActive?.(this.result, this);
      })
      .finally(() => {
        Promise.allSettled(this.deActiveAfter.map(it => it())).then(it => {});
      });
  }

  protected abstract make(): T | void;
}
