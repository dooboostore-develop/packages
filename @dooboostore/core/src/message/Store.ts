import { Observable } from './Observable';

export interface Store<T, O = Observable<T>> {
  observable: O;
  publish?(data: T): void | Promise<void>;
  transaction?<R>(data: T, transaction: (data: T, oldData?: T) => Promise<R> | R): Promise<R>;
  getValue?(): T;
}
