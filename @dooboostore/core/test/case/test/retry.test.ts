import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { retry } from '../../src/message/operators/retry';
import { switchMap } from '../../src/message/operators/switchMap';
import { of, throwError, Observable } from '../../src/message/internal';

describe('retry operator', () => {

    test('should resubscribe and succeed after a number of failures', (t, done) => {
        let attemptCount = 0;
        const flakyObservable = of(null).pipe(
            switchMap(() => {
                attemptCount++;
                return attemptCount < 3 ? throwError(() => new Error('flaky')) : of('success');
            })
        );

        flakyObservable.pipe(retry(3)).subscribe({
            next: (value) => assert.strictEqual(value, 'success'),
            complete: () => {
                assert.strictEqual(attemptCount, 3);
                done();
            },
            error: () => assert.fail('Should not error when retry succeeds')
        });
    });

    test('should error after exhausting all retry attempts', (t, done) => {
        let attemptCount = 0;
        const alwaysFail = of(null).pipe(
            switchMap(() => {
                attemptCount++;
                return throwError(() => new Error(`Attempt ${attemptCount} failed`));
            })
        );

        alwaysFail.pipe(retry(2)).subscribe({
            next: () => assert.fail('Should not emit when all retries fail'),
            error: (err) => {
                assert.strictEqual(err.message, 'Attempt 3 failed');
                assert.strictEqual(attemptCount, 3);
                done();
            }
        });
    });

    test('should error immediately with a retry count of 0', (t, done) => {
        let attemptCount = 0;
        const failObservable = of(null).pipe(
            switchMap(() => {
                attemptCount++;
                return throwError(() => new Error('Immediate failure'));
            })
        );

        failObservable.pipe(retry(0)).subscribe({
            next: () => assert.fail('Should not emit'),
            error: (err) => {
                assert.strictEqual(err.message, 'Immediate failure');
                assert.strictEqual(attemptCount, 1);
                done();
            }
        });
    });

    test('should resubscribe to the source, re-emitting values before error', (t, done) => {
        let attemptCount = 0;
        const values: any[] = [];
        const partialSuccess = of(1, 2).pipe(
            switchMap(x => {
                if (x === 2 && attemptCount < 1) {
                    attemptCount++;
                    return throwError(() => new Error('fail'));
                }
                return of(x);
            })
        );

        partialSuccess.pipe(retry(1)).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 1, 2]);
                done();
            }
        });
    });

    test('should not retry if the source does not error', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3).pipe(retry(3)).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3]);
                done();
            }
        });
    });

    test('should not retry after unsubscription', (t, done) => {
        let attemptCount = 0;
        const slowFail = new Observable(subscriber => {
            attemptCount++;
            const timeoutId = setTimeout(() => {
                subscriber.error(new Error('Delayed error'));
            }, 100);
            return () => clearTimeout(timeoutId);
        });

        const subscription = slowFail.pipe(retry(5)).subscribe({
            error: () => assert.fail('Should not error after unsubscribe')
        });

        setTimeout(() => {
            subscription.unsubscribe();
            setTimeout(() => {
                assert.strictEqual(attemptCount, 1, 'Should only have one attempt');
                done();
            }, 150);
        }, 50);
    });
});
