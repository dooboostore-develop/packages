import { Alert } from './Alert';
import { AlertService } from './AlertService';
import { AlertFactoryConfig } from './AlertFactoryConfig';

export class ConsoleError<T = string> extends Alert<T> {
  constructor(
    public alertService?: AlertService<T>,
    public config?: AlertFactoryConfig<T>
  ) {
    super(alertService, config);
  }

  // active(): void {
  //   console.error(this.title);
  // }
  //
  // deActive(): void {}

  protected make(): T | void{
   return 'aa' as T;
  }
}
