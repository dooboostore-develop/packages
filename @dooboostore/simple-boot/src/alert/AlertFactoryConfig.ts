import { Alert } from './Alert';

export type AlertFactoryConfig<T> = {
  title?: string;
  subTitle?: string;
  closeTime?: number;
  data?: any;
  type?: string;
  uuid?: string;
  activate?: (result: T, alert: Alert<T>) => void;
  deActivate?: (result: T, alert: Alert<T>) => void;
};
