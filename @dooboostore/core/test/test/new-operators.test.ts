import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  switchMap, mergeMap, concatMap, catchError, retry, delay, timeout, 
  scan, reduce, share, finalize, TimeoutError, tap
} from '../../src/message/operators';
import { of, timer, throwError, interval } from '../../src/message/internal';
import { take } from '../../src/message/internal';
import { map } from '../../src/message/operators/map';

describe('New Operators', () => {

    describe('switchMap', () => {
        test('should map to inner observable and switch to new ones', (t, done) => {
            const values: string[] = [];
            interval(30).pipe(
                take(3),
                switchMap(x => timer(0, 20).pipe(
                    map(y => `${x}:${y}`),
                    take(2)
                ))
            ).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.deepStrictEqual(values, ['0:0', '0:1', '1:0', '1:1', '2:0', '2:1']);
                    done();
                }
            });
        });
    });

    describe('mergeMap', () => {
        test('should map and merge all inner observables', (t, done) => {
            const values: string[] = [];
            of(1, 2).pipe(
                mergeMap(x => of(`x${x}`, `y${x}`))
            ).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.strictEqual(values.length, 4);
                    assert.deepStrictEqual(values.sort(), ['x1', 'x2', 'y1', 'y2']);
                    done();
                }
            });
        });
    });

    describe('concatMap', () => {
        test('should map and concatenate all inner observables', (t, done) => {
            const values: string[] = [];
            of(1, 2).pipe(
                concatMap(x => timer(10).pipe(map(() => `val${x}`), take(1)))
            ).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.deepStrictEqual(values, ['val1', 'val2']);
                    done();
                }
            });
        });
    });

    describe('catchError', () => {
        test('should catch an error and return a new observable', (t, done) => {
            const values: any[] = [];
            throwError(() => new Error('test error')).pipe(
                catchError((err, caught) => of('recovered'))
            ).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.deepStrictEqual(values, ['recovered']);
                    done();
                }
            });
        });
    });

    describe('retry', () => {
        test('should resubscribe to the source on error', (t, done) => {
            let attemptCount = 0;
            const flakyObservable = of(null).pipe(
                switchMap(() => {
                    attemptCount++;
                    return attemptCount < 3 ? throwError(() => new Error('flaky')) : of(42);
                })
            );

            flakyObservable.pipe(retry(2)).subscribe({
                next: (value) => assert.strictEqual(value, 42),
                complete: () => {
                    assert.strictEqual(attemptCount, 3);
                    done();
                }
            });
        });
    });

    describe('delay', () => {
        test('should delay emissions by a specified time', (t, done) => {
            const startTime = Date.now();
            of(1).pipe(delay(50)).subscribe({
                next: () => {
                    const elapsed = Date.now() - startTime;
                    assert(elapsed >= 45);
                },
                complete: done
            });
        });
    });

    describe('timeout', () => {
        test('should not error if source completes within timeout', (t, done) => {
            let completed = false;
            of(1).pipe(timeout(100)).subscribe({
                complete: () => completed = true
            });
            setTimeout(() => {
                assert(completed);
                done();
            }, 50);
        });

        test('should error if source does not complete within timeout', (t, done) => {
            timer(200).pipe(timeout(50)).subscribe({
                error: (err) => {
                    assert(err instanceof TimeoutError);
                    done();
                }
            });
        });
    });

    describe('scan', () => {
        test('should emit intermediate accumulated values', (t, done) => {
            const values: number[] = [];
            of(1, 2, 3, 4).pipe(scan((acc, val) => acc + val, 0)).subscribe({
                next: (v) => values.push(v),
                complete: () => {
                    assert.deepStrictEqual(values, [1, 3, 6, 10]);
                    done();
                }
            });
        });
    });

    describe('reduce', () => {
        test('should emit only the final accumulated value on completion', (t, done) => {
            const values: number[] = [];
            of(1, 2, 3, 4).pipe(reduce((acc, val) => acc + val, 0)).subscribe({
                next: (v) => values.push(v),
                complete: () => {
                    assert.deepStrictEqual(values, [10]);
                    done();
                }
            });
        });
    });

    describe('share', () => {
        test('should share a single subscription among multiple subscribers', (t, done) => {
            let sourceSubscribed = 0;
            const source = of(1, 2, 3).pipe(tap(() => sourceSubscribed++));
            const shared = source.pipe(share());

            const valuesA: number[] = [];
            const valuesB: number[] = [];
            
            shared.subscribe(v => valuesA.push(v));
            shared.subscribe(v => valuesB.push(v));

            setTimeout(() => {
                assert.strictEqual(sourceSubscribed, 3);
                assert.deepStrictEqual(valuesA, [1, 2, 3]);
                assert.deepStrictEqual(valuesB, [1, 2, 3]);
                done();
            }, 50);
        });
    });

    describe('finalize', () => {
        test('should call the finalize callback on completion', (t, done) => {
            let finalizeCalled = false;
            of(1).pipe(finalize(() => finalizeCalled = true)).subscribe({
                complete: () => {
                    assert(finalizeCalled);
                    done();
                }
            });
        });

        test('should call the finalize callback on error', (t, done) => {
            let finalizeCalled = false;
            throwError(() => new Error('test')).pipe(
                finalize(() => finalizeCalled = true)
            ).subscribe({
                error: () => {
                    assert(finalizeCalled);
                    done();
                }
            });
        });
    });
});
