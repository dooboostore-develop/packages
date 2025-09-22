import { Observable } from '../Observable';
import { EmptyError } from './lastValueFrom'; // Reusing EmptyError from lastValueFrom

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve with the last value emitted
 * by the observable when it completes.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError}.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * @param source The observable to convert to a promise.
 * @return A promise that resolves with the last value from the observable,
 * or rejects with an error or EmptyError.
 */
export function toPromise<T>(source: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
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
        } else {
          reject(new EmptyError());
        }
      },
    });
  });
}