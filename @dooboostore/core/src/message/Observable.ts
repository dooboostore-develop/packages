import { Subscription } from './Subscription';

type ObserverCallBack<T> = (data: T) => void;
type ErrorCallBack<E = any> = (e: E) => void;
type CompleteCallBack = () => void;
export type Observable<T, E = any> = {
  subscribe: (d: ObserverCallBack<T>, e?: ErrorCallBack, c?: CompleteCallBack) => Subscription;
};
