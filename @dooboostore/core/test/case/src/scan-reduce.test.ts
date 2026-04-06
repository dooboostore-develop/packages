import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { scan, reduce } from '../../src/message/operators';
import { of, empty, throwError } from '../../src/message/internal';

describe('scan operator', () => {

    test('should emit intermediate accumulations with a seed', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4).pipe(
            scan((acc, val) => acc + val, 0)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 3, 6, 10]);
                done();
            }
        });
    });

    test('should use the first item as the initial value if no seed is provided', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4).pipe(
            scan((acc, val) => acc + val)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 3, 6, 10]);
                done();
            }
        });
    });

    test('should include the index in the accumulator function', (t, done) => {
        const values: string[] = [];
        of('a', 'b', 'c').pipe(
            scan((acc, val, index) => `${acc}-${val}${index}`, 'start')
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['start-a0', 'start-a0-b1', 'start-a0-b1-c2']);
                done();
            }
        });
    });

    test('should propagate errors from the accumulator function', (t, done) => {
        const values: number[] = [];
        const testError = new Error('Scan error');
        of(1, 2, 3).pipe(
            scan((acc, val) => {
                if (val === 2) throw testError;
                return acc + val;
            }, 0)
        ).subscribe({
            next: (value) => values.push(value),
            error: (err) => {
                assert.deepStrictEqual(values, [1]);
                assert.strictEqual(err, testError);
                done();
            }
        });
    });
});

describe('reduce operator', () => {

    test('should emit only the final accumulation with a seed', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4).pipe(
            reduce((acc, val) => acc + val, 0)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [10]);
                done();
            }
        });
    });

    test('should use the first item as seed if none provided', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4).pipe(
            reduce((acc, val) => acc * val)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [24]);
                done();
            }
        });
    });

    test('should error on an empty source if no seed is provided', async () => {
        const promise = new Promise((resolve, reject) => {
            empty().pipe(
                reduce((acc, val) => acc + val)
            ).subscribe({
                next: () => assert.fail('should not emit'),
                error: reject,
                complete: () => assert.fail('should not complete')
            });
        });
        await assert.rejects(promise, /empty sequence/);
    });

    test('should emit the seed value for an empty source', (t, done) => {
        const values: number[] = [];
        empty().pipe(
            reduce((acc, val) => acc + val, 42)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [42]);
                done();
            }
        });
    });

    test('should propagate errors from the accumulator function', (t, done) => {
        const testError = new Error('Reduce error');
        of(1, 2, 3).pipe(
            reduce((acc, val) => {
                if (val === 2) throw testError;
                return acc + val;
            }, 0)
        ).subscribe({
            next: () => assert.fail('should not emit'),
            error: (err) => {
                assert.strictEqual(err, testError);
                done();
            }
        });
    });
});
