import { Observable } from '../Observable';

export function from<T>(input: T[]): Observable<T, any> {
  return new Observable(subscriber => {
    for (let i = 0; i < input.length; i++) {
      subscriber.next(input[i]);
    }
    subscriber.complete();
  });
}
