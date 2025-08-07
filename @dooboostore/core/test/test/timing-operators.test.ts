import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { delay, timeout, TimeoutError } from '../../src/message/operators';
import { switchMap } from '../../src/message/operators/switchMap';
import { of, timer, interval, throwError } from '../../src/message/internal';
import { take } from '../../src/message/internal';

describe('delay operator', () => {

    test('should delay all emissions by a specified duration', (t, done) => {
        const startTime = Date.now();
        of(1, 2, 3).pipe(delay(100)).subscribe({
            next: (value) => {
                if (value === 1) {
                    const elapsed = Date.now() - startTime;
                    assert(elapsed >= 95, 'First value should be delayed');
                }
            },
            complete: () => {
                const elapsed = Date.now() - startTime;
                assert(elapsed >= 95, 'Completion should also be delayed');
                done();
            }
        });
    });

    test('should delay error notifications', (t, done) => {
        const startTime = Date.now();
        const testError = new Error('delayed error');
        throwError(() => testError).pipe(delay(50)).subscribe({
            error: (err) => {
                const elapsed = Date.now() - startTime;
                assert(elapsed >= 45, 'Error should be delayed');
                assert.strictEqual(err, testError);
                done();
            }
        });
    });

    test('should not emit values after unsubscription', (t, done) => {
        const values: number[] = [];
        const subscription = of(1, 2, 3).pipe(delay(100)).subscribe(v => values.push(v));

        setTimeout(() => {
            subscription.unsubscribe();
            setTimeout(() => {
                assert.strictEqual(values.length, 0, 'Should not emit after unsubscribe');
                done();
            }, 150);
        }, 50);
    });

    test('should handle a delay of 0ms', (t, done) => {
        const values: number[] = [];
        of(1, 2).pipe(delay(0)).subscribe({
            next: v => values.push(v),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2]);
                done();
            }
        });
    });
});

describe('timeout operator', () => {

    test('should not error if source emits within the timeout period', (t, done) => {
        let completed = false;
        of(1, 2, 3).pipe(timeout(100)).subscribe({
            complete: () => completed = true,
            error: () => assert.fail('Should not timeout')
        });
        setTimeout(() => {
            assert(completed);
            done();
        }, 50);
    });

    test('should error with TimeoutError if source is too slow', (t, done) => {
        timer(200).pipe(timeout(100)).subscribe({
            next: () => assert.fail('Should not emit'),
            error: (err) => {
                assert(err instanceof TimeoutError);
                done();
            }
        });
    });

    test('should reset the timeout on each emission', (t, done) => {
        const values: number[] = [];
        interval(50).pipe(
            take(3),
            timeout(80) // Each emission is within the 80ms timeout
        ).subscribe({
            next: v => values.push(v),
            complete: () => {
                assert.deepStrictEqual(values, [0, 1, 2]);
                done();
            },
            error: () => assert.fail('Should not timeout')
        });
    });

    test('should not error after unsubscription', (t, done) => {
        const subscription = timer(200).pipe(timeout(300)).subscribe({
            error: () => assert.fail('Should not timeout after unsubscribe')
        });

        setTimeout(() => {
            subscription.unsubscribe();
            setTimeout(done, 250);
        }, 100);
    });

    test('should timeout immediately with a 0ms timeout', (t, done) => {
        timer(10).pipe(timeout(0)).subscribe({
            next: () => assert.fail('Should not emit'),
            error: (err) => {
                assert(err instanceof TimeoutError);
                done();
            }
        });
    });
});

describe('Combined timing operators', () => {
    test('delay and timeout should work together correctly', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3).pipe(
            delay(50),
            timeout(200)
        ).subscribe({
            next: v => values.push(v),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3]);
                done();
            },
            error: () => assert.fail('Should not timeout')
        });
    });
});
