import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  skip, 
  takeWhile, 
  startWith, 
  concat, 
  merge, 
  of, 
  range 
} from '../../src/message/internal';

describe('skip operator', () => {
    test('should skip a specified number of values from the beginning', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5).pipe(
            skip(2)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [3, 4, 5]);
                done();
            }
        });
    });
});

describe('takeWhile operator', () => {
    test('should take values while the predicate is true', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5).pipe(
            takeWhile(x => x < 4)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3]);
                done();
            }
        });
    });

    test('should include the value that breaks the predicate when inclusive is true', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3, 4, 5).pipe(
            takeWhile(x => x < 4, true)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3, 4]);
                done();
            }
        });
    });
});

describe('startWith operator', () => {
    test('should prepend specified values to the source observable', (t, done) => {
        const values: any[] = [];
        of('world').pipe(
            startWith('hello', ' ')
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['hello', ' ', 'world']);
                done();
            }
        });
    });
});

describe('concat function', () => {
    test('should concatenate multiple observables sequentially', (t, done) => {
        const values: number[] = [];
        concat(
            of(1, 2),
            of(3, 4),
            of(5, 6)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3, 4, 5, 6]);
                done();
            }
        });
    });
});

describe('merge function', () => {
    test('should merge multiple observables concurrently', (t, done) => {
        const values: number[] = [];
        // Note: merge is concurrent, but `of` is synchronous, so the order is predictable here.
        // If sources were async, the order would not be guaranteed.
        merge(
            of(1, 3, 5),
            of(2, 4, 6)
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                // The original test sorted, which is the correct way to test merge
                // if the sources are asynchronous. With `of`, the order is deterministic.
                assert.deepStrictEqual(values.sort(), [1, 2, 3, 4, 5, 6]);
                done();
            }
        });
    });
});

describe('Complex operator chaining', () => {
    test('should produce correct output from a chain of operators', (t, done) => {
        const values: number[] = [];
        range(1, 10).pipe(
            skip(2),           // [3, 4, 5, 6, 7, 8, 9, 10]
            takeWhile(x => x < 8), // [3, 4, 5, 6, 7]
            startWith(0)       // [0, 3, 4, 5, 6, 7]
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [0, 3, 4, 5, 6, 7]);
                done();
            }
        });
    });
});
