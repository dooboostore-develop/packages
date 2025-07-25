import { Observable } from '../Observable';
import { EmptyError } from './lastValueFrom';

export interface FirstValueFromConfig<T> {
  defaultValue: T;
}

export function firstValueFrom<T, D>(source: Observable<T>, config: FirstValueFromConfig<D>): Promise<T | D>;
export function firstValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as the first value
 * arrives from the observable.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function firstValueFrom<T, D>(source: Observable<T>, config?: FirstValueFromConfig<D>): Promise<T | D> {
  const hasConfig = typeof config === 'object';
  return new Promise<T | D>((resolve, reject) => {
    let _hasValue = false;
    
    const subscription = source.subscribe({
      next: (value) => {
        _hasValue = true;
        resolve(value);
        subscription.unsubscribe();
      },
      error: reject,
      complete: () => {
        if (!_hasValue) {
          if (hasConfig) {
            resolve(config!.defaultValue);
          } else {
            reject(new EmptyError());
          }
        }
      },
    });
  });
}