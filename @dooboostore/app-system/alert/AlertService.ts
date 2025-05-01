import { AlertFactoryConfig } from './AlertFactoryConfig';
import { Alert } from './Alert';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { AlertFactory } from './AlertFactory';
import { Store } from '@dooboostore/core/message';
import { ReplaySubject } from 'rxjs';
import { AlertAction } from './AlertAction';
import { AlertType } from './AlertType';
import { PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export namespace AlertService {
  // export const SYMBOL: Symbol | undefined = Symbol('AlertService');
  export type AlertActionContainer<T> = { action: AlertAction; alert: Alert<T> };
}

@Sim
export class AlertService<T> implements Store<AlertService.AlertActionContainer<T>>{
  public name = new Date().toUTCString();
  private subject = new ReplaySubject<AlertService.AlertActionContainer<T>>();
  private alertFactory?: AlertFactory<T>;
  constructor(
    // @ts-ignore
    @Inject({symbol: AlertFactory.SYMBOL}) alertFactory: AlertFactory<T>
  ) {
    this.alertFactory = alertFactory;
    // console.log('%c AlertService constructor 55555', 'color: #ff0000', this.alertFactory)
    // this.observable.subscribe(it => {
    //   console.log('subscribe!!!!!selft!', it, this)
    // })
  }

  // @PostConstruct
  // postConstruct(
  // ) {
  //   this.alertFactory = alertFactory;
  // }

  get observable() {
    const observable = this.subject.asObservable();
    // console.log('get observable', observable)
    return observable;
  }

  publish(data: AlertService.AlertActionContainer<T>) {
    // console.log('publicsh------------', data)
    this.subject.next(data);
  }

  create(factory: (alert: Alert<T>) => T, config?: AlertFactoryConfig<T>): Alert<T> {
    return new (class extends Alert<T> {
      protected make(): T {
        return factory(this);
      }
    })(this, config);
  }

  createFromFactory(type: AlertType, config?: AlertFactoryConfig<T>) {
    return this.alertFactory?.create({ caller: this, type, config: config });
  }

  danger(config?: AlertFactoryConfig<T>) {
    // config = config ?? {};
    // config.closeTime ??= AlertService.DEFAULT_CLOSE_TIME;
    return this.createFromFactory(AlertType.DANGER, config) as Alert<T> | undefined;
  }

  progress(config?: AlertFactoryConfig<T>) {
    config = config ?? {};
    return this.createFromFactory(AlertType.PROGRESS, config) as Alert<T> | undefined;
  }

  success(config?: AlertFactoryConfig<T>) {
    // config = config ?? {};
    // config.closeTime ??= AlertService.DEFAULT_CLOSE_TIME;
    return this.createFromFactory(AlertType.SUCCESS, config) as Alert<T> | undefined;
  }
  info(config?: AlertFactoryConfig<T>) {
    // config = config ?? {};
    // config.closeTime ??= AlertService.DEFAULT_CLOSE_TIME;
    return this.createFromFactory(AlertType.INFO, config) as Alert<T> | undefined;
  }

  warning(config?: AlertFactoryConfig<T>) {
    // config = config ?? {};
    // config.closeTime ??= AlertService.DEFAULT_CLOSE_TIME;
    return this.createFromFactory(AlertType.WARNING, config) as Alert<T> | undefined;
  }
}