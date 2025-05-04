import { RunnableLoader } from '../runs/RunnableLoader';
import { Observable } from '../message/Observable';

export type StoreLoadedState<T> = {
  state: 'loaded';
  data: T;
};
export type StoreErrorState = {
  state: 'error';
  data: any;
};

export type StoreLoaderState<T> =
  | {
      state: 'ready' | 'loading' | 'unloaded';
    }
  | StoreLoadedState<T>
  | StoreErrorState
  | {
      state: 'unloaded';
    };

export abstract class StoreLoader<T> {
  public abstract observable: Observable<StoreLoaderState<T>>;
}
