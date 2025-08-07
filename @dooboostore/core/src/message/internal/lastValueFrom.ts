import { Observable } from '../Observable';

export interface LastValueFromConfig<T> {
  defaultValue: T;
}

export class EmptyError extends Error {
  constructor(message: string = 'No elements in sequence') {
    super(message);
    this.name = 'EmptyError';
  }
}

export function lastValueFrom<T, D>(source: Observable<T>, config: LastValueFromConfig<D>): Promise<T | D>;
export function lastValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * waiting for it to complete, and resolving the returned promise with the
 * last value from the observed stream.
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function lastValueFrom<T, D>(source: Observable<T>, config?: LastValueFromConfig<D>): Promise<T | D> {
  const hasConfig = typeof config === 'object';
  return new Promise<T | D>((resolve, reject) => {
    let _hasValue = false;
    let _value: T;
    
    source.subscribe({
      next: (value) => {
        _value = value;
        _hasValue = true;
      },
      error: reject,
      complete: () => {
        if (_hasValue) {
          resolve(_value);
        } else if (hasConfig) {
          resolve(config!.defaultValue);
        } else {
          reject(new EmptyError());
        }
      },
    });
  });
}