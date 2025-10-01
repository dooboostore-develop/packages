import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { take } from '@dooboostore/core/message/internal/take';
import { Subject } from '@dooboostore/core/message/Subject';

describe('take operator', () => {

    test('should emit a specified number of values and then complete', (t, done) => {
        const subject = new Subject<number>();
        const values: number[] = [];
        let completed = false;

        subject.pipe(take(3)).subscribe({
            next: (value) => values.push(value),
            complete: () => completed = true
        });

        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.next(4); // This should not be received

        // Use setImmediate to allow the synchronous next calls to process
        setImmediate(() => {
            assert.deepStrictEqual(values, [1, 2, 3], 'Should emit exactly 3 values');
            assert.strictEqual(completed, true, 'Should complete after taking 3 values');
            done();
        });
    });

    test('should complete immediately with take(0)', (t, done) => {
        const subject = new Subject<string>();
        const values: string[] = [];
        let completed = false;

        subject.pipe(take(0)).subscribe({
            next: (value) => values.push(value),
            complete: () => completed = true
        });

        subject.next('should not receive');

        setImmediate(() => {
            assert.strictEqual(values.length, 0, 'Should not emit any values');
            assert.strictEqual(completed, true, 'Should complete immediately');
            done();
        });
    });

    test('should complete immediately with a negative count', (t, done) => {
        const subject = new Subject<boolean>();
        const values: boolean[] = [];
        let completed = false;

        subject.pipe(take(-5)).subscribe({
            next: (value) => values.push(value),
            complete: () => completed = true
        });

        subject.next(true);

        setImmediate(() => {
            assert.strictEqual(values.length, 0, 'Should not emit any values');
            assert.strictEqual(completed, true, 'Should complete immediately');
            done();
        });
    });

    test('should complete when the source completes before the count is reached', (t, done) => {
        const subject = new Subject<number>();
        const values: number[] = [];
        let completed = false;

        subject.pipe(take(5)).subscribe({
            next: (value) => values.push(value),
            complete: () => completed = true
        });

        subject.next(10);
        subject.next(20);
        subject.complete();

        setImmediate(() => {
            assert.deepStrictEqual(values, [10, 20], 'Should emit all values before source completion');
            assert.strictEqual(completed, true, 'Should complete when source completes');
            done();
        });
    });

    test('should propagate errors from the source', (t, done) => {
        const subject = new Subject<string>();
        const testError = new Error('test error');
        const values: string[] = [];
        let error: any = null;

        subject.pipe(take(3)).subscribe({
            next: (value) => values.push(value),
            error: (err) => error = err
        });

        subject.next('first');
        subject.error(testError);

        setImmediate(() => {
            assert.deepStrictEqual(values, ['first'], 'Should emit values before error');
            assert.strictEqual(error, testError, 'Should propagate the correct error');
            done();
        });
    });

    test('should emit exactly 1 value for take(1)', (t, done) => {
        const subject = new Subject<number>();
        const values: number[] = [];
        let completed = false;

        subject.pipe(take(1)).subscribe({
            next: (value) => values.push(value),
            complete: () => completed = true
        });

        subject.next(42);
        subject.next(43); // Should not be received

        setImmediate(() => {
            assert.deepStrictEqual(values, [42], 'Should emit exactly 1 value');
            assert.strictEqual(completed, true, 'Should complete after the first value');
            done();
        });
    });
});
