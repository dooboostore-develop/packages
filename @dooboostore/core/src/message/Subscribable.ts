// import { Unsubscribable } from './Unsubscribable';
import { Observer } from './Observer';
import { Subscription } from './Subscription';
export type ObserverCallBack<T> = (data: T) => void;
export type ErrorCallBack<E = any> = (e: E) => void;
export type CompleteCallBack = () => void;
export interface Subscribable<T, E> {
  subscribe(observer: Partial<Observer<T>>): Subscription;
  subscribe(d: ObserverCallBack<T>, e?: ErrorCallBack, c?: CompleteCallBack):  Subscription;

}