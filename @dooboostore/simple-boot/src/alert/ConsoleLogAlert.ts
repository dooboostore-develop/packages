import { Alert } from './Alert';
import { AlertService } from './AlertService';
import { AlertFactoryConfig } from './AlertFactoryConfig';

export class ConsoleLog<T = string> extends Alert<T> {
  constructor(
    public alertService?: AlertService<T>,
    public config?: AlertFactoryConfig<T>
  ) {
    super(alertService, config);
  }

  protected make(): T  {
    return '' as T;
  }
}
