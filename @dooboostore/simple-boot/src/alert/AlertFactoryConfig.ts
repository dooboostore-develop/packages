import { Alert } from './Alert';

export type AlertFactoryConfig<T> = {
  title?: string;
  subTitle?: string;
  closeTime?: number;
  data?: any;
  type?: string;
  uuid?: string;
  active?: (result: T | void, alert: Alert<T>) => void;
  deActive?: (result: T | void, alert: Alert<T>) => void;
};
