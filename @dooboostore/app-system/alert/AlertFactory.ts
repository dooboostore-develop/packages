import { Alert } from './Alert';
import { AlertType } from './AlertType';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AlertFactoryConfig } from './AlertFactoryConfig';
export namespace AlertFactory {
 export const SYMBOL: Symbol= Symbol('AlertFactory');
}

export interface AlertFactory<T> {
  create(data?: {
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

@Sim({symbol: AlertFactory.SYMBOL})
export class DefaultAlertFactory<T = any> implements AlertFactory<T>{
  create(data?: { caller?: any; type?: AlertType | string; config?: AlertFactoryConfig<T> }): Alert<T> | undefined {
    return undefined;
  }
}