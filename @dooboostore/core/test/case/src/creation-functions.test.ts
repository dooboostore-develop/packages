import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  of, 
  fromArray, 
  fromPromise, 
  empty, 
  never, 
  throwError, 
  range, 
  defer 
} from '@dooboostore/core/message/internal';
import { firstValueFrom } from '@dooboostore/core/message/internal/firstValueFrom';

describe('Creation Functions', () => {

    describe('of', () => {
        test('should emit all provided arguments of various types', (t, done) => {
            const values: any[] = [];
            const source = [1, 'hello', true, null, undefined, { key: 'value' }, [1, 2, 3]];
            of(...source).subscribe({
                next: (value) => values.push(value),
                complete: () => {
                    assert.deepStrictEqual(values, source);
                    done();
                }
            });
        });

        test('should complete without emission when called with no arguments', (t, done) => {
            let nextCalled = false;
            of().subscribe({
                next: () => nextCalled = true,
                complete: () => {
                    assert.strictEqual(nextCalled, false);
                    done();
                }
            });
        });
    });

    describe('fromArray', () => {
        test('should emit all elements from a mixed-type array', (t, done) => {
            const source = ['a', 1, true, null];
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
            fromArray([]).subscribe({
                next: () => nextCalled = true,
                complete: () => {
                    assert.strictEqual(nextCalled, false);
                    done();
                }
            });
        });
    });

    describe('fromPromise', () => {
        test('should emit the resolved value of a promise', async () => {
            const result = await firstValueFrom(fromPromise(Promise.resolve('success')));
            assert.strictEqual(result, 'success');
        });

        test('should emit an error from a rejected promise', async () => {
            const testError = new Error('failure');
            await assert.rejects(() => firstValueFrom(fromPromise(Promise.reject(testError))), testError);
        });

        test('should emit a complex object from a resolved promise', async () => {
            const source = { data: [1, 2, 3], status: 'ok' };
            const result = await firstValueFrom(fromPromise(Promise.resolve(source)));
            assert.deepStrictEqual(result, source);
        });
    });

    describe('empty', () => {
        test('should complete immediately without emitting', (t, done) => {
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

    describe('never', () => {
        test('should not emit, complete, or error', (t, done) => {
            let called = false;
            const subscription = never().subscribe(() => called = true);
            setTimeout(() => {
                subscription.unsubscribe();
                assert.strictEqual(called, false);
                done();
            }, 50);
        });
    });

    describe('throwError', () => {
        test('should emit the specified Error object', (t, done) => {
            const testError = new Error('Custom error');
            throwError(testError).subscribe({
                error: (err) => {
                    assert.strictEqual(err, testError);
                    done();
                }
            });
        });

        test('should emit a non-Error object as is', (t, done) => {
            const errorString = 'string error';
            throwError(errorString).subscribe({
                error: (err) => {
                    assert.strictEqual(err, errorString);
                    done();
                }
            });
        });
    });

    describe('range', () => {
        test('should emit a sequence of numbers', (t, done) => {
            const values: number[] = [];
            range(5, 4).subscribe({
                next: (v) => values.push(v),
                complete: () => {
                    assert.deepStrictEqual(values, [5, 6, 7, 8]);
                    done();
                }
            });
        });

        test('should not emit for a zero or negative count', (t, done) => {
            let called = false;
            range(10, 0).subscribe({
                next: () => called = true,
                complete: () => {
                    assert.strictEqual(called, false);
                    
                    range(1, -5).subscribe({
                        next: () => called = true,
                        complete: () => {
                            assert.strictEqual(called, false);
                            done();
                        }
                    });
                }
            });
        });
    });

    describe('defer', () => {
        test('should create a new observable via factory for each subscription', (t, done) => {
            let callCount = 0;
            const deferred = defer(() => of(++callCount));
            
            deferred.subscribe(v => assert.strictEqual(v, 1));
            deferred.subscribe({
                next: v => assert.strictEqual(v, 2),
                complete: () => {
                    assert.strictEqual(callCount, 2);
                    done();
                }
            });
        });

        test('should handle a promise-returning factory', async () => {
            const result = await firstValueFrom(defer(() => Promise.resolve('promise-result')));
            assert.strictEqual(result, 'promise-result');
        });

        test('should emit error if the factory function throws', async () => {
            const testError = new Error('Factory error');
            const deferred = defer(() => { throw testError; });
            await assert.rejects(() => firstValueFrom(deferred), testError);
        });
    });
});
