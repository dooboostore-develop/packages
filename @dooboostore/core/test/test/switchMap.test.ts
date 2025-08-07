import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { switchMap } from '../../src/message/operators/switchMap';
import { of, timer, interval, throwError } from '../../src/message/internal';
import { take } from '../../src/message/internal';
import { map } from '../../src/message/operators/map';
import { Observable } from '../../src/message/Observable';

describe('switchMap operator', () => {

    test('should map and flatten inner observables', (t, done) => {
        const values: string[] = [];
        of(1, 2, 3).pipe(
            switchMap(x => of(`a${x}`, `b${x}`))
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['a1', 'b1', 'a2', 'b2', 'a3', 'b3']);
                done();
            }
        });
    });

    test('should switch to new inner observables, cancelling previous ones', (t, done) => {
        const values: string[] = [];
        // interval emits 0, 1, 2 every 30ms
        interval(30).pipe(
            take(3),
            // switchMap switches to a new timer for each value.
            // The timers for 0 and 1 will be cancelled by the next emission.
            // Only the timer for 2 will run to completion.
            switchMap(x => timer(50).pipe(map(() => `result-${x}`), take(1)))
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['result-2']);
                done();
            }
        });
    });

    test('should propagate errors from the projection function', (t, done) => {
        const testError = new Error('Error for 2');
        of(1, 2, 3).pipe(
            switchMap(x => {
                if (x === 2) {
                    throw testError;
                }
                return of(`success-${x}`);
            })
        ).subscribe({
            error: (err) => {
                assert.strictEqual(err, testError);
                done();
            }
        });
    });

    test('should use the index parameter correctly', (t, done) => {
        const values: string[] = [];
        of('a', 'b', 'c').pipe(
            switchMap((value, index) => of(`${value}-${index}`))
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['a-0', 'b-1', 'c-2']);
                done();
            }
        });
    });

    test('should unsubscribe from inner observable on outer unsubscribe', (t, done) => {
        let innerUnsubscribed = false;
        const inner = new Observable(subscriber => {
            const timeoutId = setTimeout(() => {
                subscriber.next('delayed');
                subscriber.complete();
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
                innerUnsubscribed = true;
            };
        });

        const subscription = of(1).pipe(
            switchMap(() => inner)
        ).subscribe();

        setTimeout(() => {
            subscription.unsubscribe();
            setTimeout(() => {
                assert.strictEqual(innerUnsubscribed, true);
                done();
            }, 50);
        }, 50);
    });
});
