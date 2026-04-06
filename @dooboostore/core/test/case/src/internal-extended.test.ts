import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  timer, 
  of, 
  fromArray, 
  fromPromise, 
  empty, 
  never, 
  throwError, 
  firstValueFrom, 
  range, 
  defer 
} from '../../src/message/internal';
import { EmptyError } from '../../src/message/internal/lastValueFrom';

describe('timer', () => {
    test('should emit 0 after an initial delay and complete', (t, done) => {
        const startTime = Date.now();
        timer(50).subscribe({
            next: (value) => {
                const elapsed = Date.now() - startTime;
                assert.strictEqual(value, 0);
                assert(elapsed >= 45, 'Timer should wait for the approximate initial delay');
            },
            complete: () => done()
        });
    });

    test('should emit values at a specified period after an initial delay', (t, done) => {
        const values: number[] = [];
        const subscription = timer(30, 20).subscribe({
            next: (value) => {
                values.push(value);
                if (values.length === 3) {
                    subscription.unsubscribe();
                    assert.deepStrictEqual(values, [0, 1, 2]);
                    done();
                }
            }
        });
    });
});

describe('of', () => {
    test('should emit all provided values and complete', (t, done) => {
        const values: any[] = [];
        of(1, 'hello', true, { test: 'object' }).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.strictEqual(values.length, 4);
                assert.deepStrictEqual(values, [1, 'hello', true, { test: 'object' }]);
                done();
            }
        });
    });
});

describe('fromArray', () => {
    test('should emit all values from an array and complete', (t, done) => {
        const values: number[] = [];
        fromArray([10, 20, 30]).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [10, 20, 30]);
                done();
            }
        });
    });
});

describe('fromPromise', () => {
    test('should emit the resolved value of a promise and complete', async () => {
        const resolvedPromise = Promise.resolve('resolved value');
        const result = await firstValueFrom(fromPromise(resolvedPromise));
        assert.strictEqual(result, 'resolved value');
    });

    test('should emit an error from a rejected promise', async () => {
        const testError = new Error('rejected');
        const rejectedPromise = Promise.reject(testError);
        await assert.rejects(() => firstValueFrom(fromPromise(rejectedPromise)), testError);
    });
});

describe('empty', () => {
    test('should not emit any values and complete immediately', (t, done) => {
        let nextCalled = false;
        empty().subscribe({
            next: () => nextCalled = true,
            complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }
        });
    });
});

describe('throwError', () => {
    test('should not emit any values and emit the specified error', (t, done) => {
        const testError = new Error('Test error');
        let nextCalled = false;
        throwError(testError).subscribe({
            next: () => nextCalled = true,
            error: (err) => {
                assert.strictEqual(nextCalled, false);
                assert.strictEqual(err, testError);
                done();
            }
        });
    });
});

describe('firstValueFrom', () => {
    test('should resolve with the first value from a stream', async () => {
        const observable = of(1, 2, 3);
        const value = await firstValueFrom(observable);
        assert.strictEqual(value, 1);
    });

    test('should resolve with a default value for an empty stream', async () => {
        const value = await firstValueFrom(empty(), { defaultValue: 'default' });
        assert.strictEqual(value, 'default');
    });

    test('should reject for an empty stream with no default value', async () => {
        await assert.rejects(firstValueFrom(empty()), EmptyError);
    });
});

describe('range', () => {
    test('should emit a sequence of numbers within a specified range', (t, done) => {
        const values: number[] = [];
        range(5, 3).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [5, 6, 7]);
                done();
            }
        });
    });

    test('should not emit any values for a zero count', (t, done) => {
        let nextCalled = false;
        range(1, 0).subscribe({
            next: () => nextCalled = true,
            complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }
        });
    });
});

describe('defer', () => {
    test('should create a new observable for each subscription', (t, done) => {
        let factoryCallCount = 0;
        const deferredObservable = defer(() => {
            factoryCallCount++;
            return of(`call-${factoryCallCount}`);
        });

        deferredObservable.subscribe({
            next: (value) => assert.strictEqual(value, 'call-1'),
            complete: () => {
                deferredObservable.subscribe({
                    next: (value) => {
                        assert.strictEqual(value, 'call-2');
                        assert.strictEqual(factoryCallCount, 2);
                    },
                    complete: () => done()
                });
            }
        });
    });

    test('should work with a promise-returning factory', async () => {
        const deferredPromise = defer(() => Promise.resolve('promise-value'));
        const result = await firstValueFrom(deferredPromise);
        assert.strictEqual(result, 'promise-value');
    });
});
