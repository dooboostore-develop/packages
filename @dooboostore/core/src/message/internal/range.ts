import { Observable } from '../Observable';

/**
 * Creates an Observable that emits a sequence of numbers within a specified range.
 *
 * @param start The value of the first integer in the sequence.
 * @param count The number of sequential integers to generate.
 * @return An Observable that emits a finite range of sequential integers.
 */
export function range(start: number, count: number): Observable<number> {
  return new Observable<number>(subscriber => {
    if (count <= 0) {
      subscriber.complete();
      return;
    }

    const end = start + count;
    for (let i = start; i < end; i++) {
      subscriber.next(i);
    }
    subscriber.complete();
  });
}