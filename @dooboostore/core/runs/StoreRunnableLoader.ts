import { RunnableLoader } from './RunnableLoader';
import { Observable } from '../message/Observable';
import { StoreLoaderState } from '../store/StoreLoader';

export abstract class StoreRunnableLoader<T> extends RunnableLoader<T> {
  public abstract observable: Observable<StoreLoaderState<T>>;
}
