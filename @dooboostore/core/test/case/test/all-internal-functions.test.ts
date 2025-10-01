import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  timer, of, fromArray, fromPromise, empty, never, throwError, range, defer, interval,
  firstValueFrom, lastValueFrom, concat, merge,
  skip, takeWhile, startWith, take
} from '@dooboostore/core/message/internal';
import { map } from '@dooboostore/core/message/operators/map';
import { EmptyError } from '@dooboostore/core/message/internal/lastValueFrom';

describe('Comprehensive: Observable Creation Functions', () => {
    describe('timer', () => {
        test('should emit 0 after an initial delay', (t, done) => {
            const startTime = Date.now();
            timer(30).subscribe({
                next: (value) => {
                    const elapsed = Date.now() - startTime;
                    assert.strictEqual(value, 0);
                    assert(elapsed >= 25);
                },
                complete: done
            });
        });

        test('should emit values on a period', (t, done) => {
            const values: number[] = [];
            const subscription = timer(20, 15).subscribe(value => {
                values.push(value);
                if (values.length === 3) {
                    subscription.unsubscribe();
                    assert.deepStrictEqual(values, [0, 1, 2]);
                    done();
                }
            });
        });
    });

    describe('of', () => {
        test('should emit all provided arguments', (t, done) => {
            const values: any[] = [];
            of(1, 'hello', true, null, { test: 'object' }).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.deepStrictEqual(values, [1, 'hello', true, null, { test: 'object' }]);
                    done();
                }
            });
        });

        test('should complete without emission for no arguments', (t, done) => {
            let nextCalled = false;
            of().subscribe({ next: () => nextCalled = true, complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }});
        });
    });

    describe('fromArray', () => {
        test('should emit all items from an array', (t, done) => {
            const source = [10, 'test', { key: 'value' }, [1, 2, 3]];
            const values: any[] = [];
            fromArray(source).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.deepStrictEqual(values, source);
                    done();
                }
            });
        });

        test('should complete without emission for an empty array', (t, done) => {
            let nextCalled = false;
            fromArray([]).subscribe({ next: () => nextCalled = true, complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }});
        });
    });

    describe('fromPromise', () => {
        test('should emit the resolved value', async () => {
            const result = await firstValueFrom(fromPromise(Promise.resolve('resolved')));
            assert.strictEqual(result, 'resolved');
        });

        test('should emit the rejection error', async () => {
            const testError = new Error('test rejection');
            await assert.rejects(() => firstValueFrom(fromPromise(Promise.reject(testError))), testError);
        });
    });

    describe('empty', () => {
        test('should complete without emitting', (t, done) => {
            let nextCalled = false;
            empty().subscribe({ next: () => nextCalled = true, complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }});
        });
    });

    describe('never', () => {
        test('should not emit, complete, or error', (t, done) => {
            let called = false;
            const sub = never().subscribe(() => called = true);
            setTimeout(() => {
                sub.unsubscribe();
                assert.strictEqual(called, false);
                done();
            }, 50);
        });
    });

    describe('throwError', () => {
        test('should emit the specified error', (t, done) => {
            const testError = new Error('Test error');
            throwError(testError).subscribe({ error: (err) => {
                assert.strictEqual(err, testError);
                done();
            }});
        });
    });

    describe('range', () => {
        test('should emit a range of numbers', (t, done) => {
            const values: number[] = [];
            range(5, 4).subscribe({ next: v => values.push(v), complete: () => {
                assert.deepStrictEqual(values, [5, 6, 7, 8]);
                done();
            }});
        });

        test('should complete without emitting for zero count', (t, done) => {
            let nextCalled = false;
            range(10, 0).subscribe({ next: () => nextCalled = true, complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }});
        });
    });

    describe('defer', () => {
        test('should call factory for each subscription', (t, done) => {
            let factoryCallCount = 0;
            const deferred = defer(() => of(++factoryCallCount));
            deferred.subscribe(v => assert.strictEqual(v, 1));
            deferred.subscribe({ next: v => assert.strictEqual(v, 2), complete: done });
        });

        test('should emit error if factory throws', async () => {
            const testError = new Error('Factory error');
            const deferred = defer(() => { throw testError; });
            await assert.rejects(() => firstValueFrom(deferred), testError);
        });
    });
});

describe('Comprehensive: Utility Functions', () => {
    describe('firstValueFrom', () => {
        test('should resolve with the first value', async () => {
            const value = await firstValueFrom(of(1, 2, 3));
            assert.strictEqual(value, 1);
        });

        test('should reject with EmptyError for empty stream', async () => {
            await assert.rejects(firstValueFrom(empty()), EmptyError);
        });

        test('should resolve with default value for empty stream', async () => {
            const value = await firstValueFrom(empty(), { defaultValue: 'default' });
            assert.strictEqual(value, 'default');
        });
    });

    describe('lastValueFrom', () => {
        test('should resolve with the last value', async () => {
            const value = await lastValueFrom(of(1, 2, 3));
            assert.strictEqual(value, 3);
        });

        test('should reject with EmptyError for empty stream', async () => {
            await assert.rejects(lastValueFrom(empty()), EmptyError);
        });

        test('should resolve with default value for empty stream', async () => {
            const value = await lastValueFrom(empty(), { defaultValue: 'default' });
            assert.strictEqual(value, 'default');
        });
    });

    describe('concat', () => {
        test('should concatenate observables sequentially', (t, done) => {
            const values: number[] = [];
            concat(of(1, 2), range(3, 2)).subscribe({ next: v => values.push(v), complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3, 4]);
                done();
            }});
        });
    });

    describe('merge', () => {
        test('should merge observables concurrently', (t, done) => {
            const values: number[] = [];
            merge(of(1, 4), range(2, 2)).subscribe({ next: v => values.push(v), complete: () => {
                assert.deepStrictEqual(values.sort(), [1, 2, 3, 4]);
                done();
            }});
        });
    });
});

describe('Comprehensive: Operator Functions', () => {
    test('skip should ignore the first N values', (t, done) => {
        const values: number[] = [];
        range(1, 10).pipe(skip(5)).subscribe({ next: v => values.push(v), complete: () => {
            assert.deepStrictEqual(values, [6, 7, 8, 9, 10]);
            done();
        }});
    });

    test('takeWhile should take values until predicate is false', (t, done) => {
        const values: number[] = [];
        range(1, 10).pipe(takeWhile(v => v < 5)).subscribe({ next: v => values.push(v), complete: () => {
            assert.deepStrictEqual(values, [1, 2, 3, 4]);
            done();
        }});
    });

    test('startWith should prepend values', (t, done) => {
        const values: number[] = [];
        of(3, 4).pipe(startWith(1, 2)).subscribe({ next: v => values.push(v), complete: () => {
            assert.deepStrictEqual(values, [1, 2, 3, 4]);
            done();
        }});
    });
});

describe('Comprehensive: Complex Chains and Integrations', () => {
    test('should handle a complex synchronous chain', (t, done) => {
        const values: number[] = [];
        range(0, 20).pipe(
            skip(5),                    // [5, 6, ..., 19]
            takeWhile(x => x < 15),     // [5, 6, ..., 14]
            map(x => x * 2),            // [10, 12, ..., 28]
            take(5),                    // [10, 12, 14, 16, 18]
            startWith(0, 2)             // [0, 2, 10, 12, 14, 16, 18]
        ).subscribe({ next: v => values.push(v), complete: () => {
            assert.deepStrictEqual(values, [0, 2, 10, 12, 14, 16, 18]);
            done();
        }});
    });

    test('should handle a complex asynchronous chain', (t, done) => {
        const values: number[] = [];
        timer(10, 15).pipe(
            take(5),         // [0, 1, 2, 3, 4]
            map(x => x + 100), // [100, 101, 102, 103, 104]
            skip(1),         // [101, 102, 103, 104]
            startWith(99)    // [99, 101, 102, 103, 104]
        ).subscribe({ next: v => values.push(v), complete: () => {
            assert.deepStrictEqual(values, [99, 101, 102, 103, 104]);
            done();
        }});
    });

    test('should handle error propagation in a chain', (t, done) => {
        const testError = new Error('Chain error');
        let receivedValue: any;
        throwError(testError).pipe(
            startWith('start')
        ).subscribe({
            next: (v) => receivedValue = v,
            error: (err) => {
                assert.strictEqual(receivedValue, 'start');
                assert.strictEqual(err, testError);
                done();
            }
        });
    });

    test('should handle a data processing pipeline scenario', (t, done) => {
        const sourceData = [
            { id: 1, name: 'Alice', age: 25 },
            { id: 2, name: 'Bob', age: 17 },
            { id: 3, name: 'Charlie', age: 30 },
        ];
        const processedData: any[] = [];
        fromArray(sourceData).pipe(
            map(user => ({ ...user, isAdult: user.age >= 18 })),
            skip(1),
            startWith({ name: 'Welcome' })
        ).subscribe({ next: v => processedData.push(v), complete: () => {
            assert.deepStrictEqual(processedData[0], { name: 'Welcome' });
            assert.deepStrictEqual(processedData[1].name, 'Bob');
            assert.deepStrictEqual(processedData[2].isAdult, true);
            done();
        }});
    });
});
