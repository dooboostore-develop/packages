import { Observable, OperatorFunction } from '../Observable';

export class EmptyError extends Error {
  constructor(message: string = 'No elements in single') {
    super(message);
    this.name = 'EmptyError';
  }
}

export class SequenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SequenceError';
  }
}

/**
 * Emits the single value from the source Observable that matches the predicate.
 * If the source Observable emits more than one such value or no such values,
 * it will throw an error.
 *
 * @param predicate A predicate function to evaluate items emitted by the source Observable.
 * @return An Observable that emits the single item that matches the predicate.
 */
export function single<T>(
  predicate: (value: T, index: number) => boolean
): OperatorFunction<T, T> {
  return (source: Observable<T, any>): Observable<T, any> => {
    return new Observable<T>(subscriber => {
      let index = 0;
      let match: T | undefined;
      let hasFound = false;

      const sourceSubscription = source.subscribe({
        next: (value) => {
          try {
            if (predicate(value, index++)) {
              if (hasFound) {
                subscriber.error(new SequenceError('Sequence contains more than one element'));
                sourceSubscription.unsubscribe();
              } else {
                match = value;
                hasFound = true;
              }
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          if (hasFound) {
            subscriber.next(match!);
            subscriber.complete();
          } else {
            subscriber.error(new EmptyError());
          }
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
      };
    });
  };
}
