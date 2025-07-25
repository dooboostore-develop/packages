import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  of, 
  fromArray, 
  empty, 
  range, 
  defer,
  skip,
  take,
  startWith
} from '../../src/message/internal';

describe('Simple Internal Functions', () => {

    test('of should emit all provided values', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3]);
                done();
            }
        });
    });

    test('fromArray should emit all values from an array', (t, done) => {
        const values: string[] = [];
        fromArray(['a', 'b', 'c']).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['a', 'b', 'c']);
                done();
            }
        });
    });

    test('empty should complete without emitting any values', (t, done) => {
        let nextCalled = false;
        empty().subscribe({
            next: () => nextCalled = true,
            complete: () => {
                assert.strictEqual(nextCalled, false);
                done();
            }
        });
    });

    test('range should emit a sequence of numbers', (t, done) => {
        const values: number[] = [];
        range(5, 3).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [5, 6, 7]);
                done();
            }
        });
    });

    test('skip should ignore the first N values', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5).pipe(skip(2)).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [3, 4, 5]);
                done();
            }
        });
    });

    test('take should emit the first N values', (t, done) => {
        const values: number[] = [];
        range(1, 10).pipe(take(3)).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3]);
                done();
            }
        });
    });

    test('startWith should prepend values to the stream', (t, done) => {
        const values: any[] = [];
        of('world').pipe(startWith('hello', ' ')).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['hello', ' ', 'world']);
                done();
            }
        });
    });

    test('defer should create a new observable for each subscription', (t, done) => {
        let callCount = 0;
        const deferredObs = defer(() => {
            callCount++;
            return of(`result-${callCount}`);
        });

        deferredObs.subscribe({
            next: (value) => assert.strictEqual(value, 'result-1'),
            complete: () => {
                assert.strictEqual(callCount, 1);
                
                deferredObs.subscribe({
                    next: (value) => assert.strictEqual(value, 'result-2'),
                    complete: () => {
                        assert.strictEqual(callCount, 2);
                        done();
                    }
                });
            }
        });
    });
});
