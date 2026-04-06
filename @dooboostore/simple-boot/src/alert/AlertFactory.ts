import { Alert } from './Alert';
import { AlertType } from './AlertType';
import { Sim } from '../decorators/SimDecorator';
import { AlertFactoryConfig } from './AlertFactoryConfig';
// export namespace AlertFactory {
//  export const SYMBOL: symbol= Symbol.for('simple-boot:alert-factory-token');
// }

export abstract class AlertFactory<T> {
  abstract create(data?: {
    caller?: any;
    type?: AlertType | string;
    config?: AlertFactoryConfig<T>;
  }): Alert<T> | undefined;
}
export interface AlertFactorAy<T> {
  create(data?: {
    caller?: any;
    type?: AlertType | string;
    config?: AlertFactoryConfig<T>;
  }): Alert<T> | undefined;
}


export class DefaultAlertFactory<T = any> extends AlertFactory<T>{
  create(data?: { caller?: any; type?: AlertType | string; config?: AlertFactoryConfig<T> }): Alert<T> | undefined {
    return undefined;
  }
}