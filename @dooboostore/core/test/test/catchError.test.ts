import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { catchError } from '../../src/message/operators/catchError';
import { switchMap } from '../../src/message/operators/switchMap';
import { of, throwError } from '../../src/message/internal';

describe('catchError operator', () => {

    test('should catch an error and switch to a new observable', (t, done) => {
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

    test('should handle errors that occur after some values have been emitted', (t, done) => {
        const values: any[] = [];
        of(1, 2, 3).pipe(
            switchMap((x: number) => {
                if (x === 3) {
                    return throwError(() => new Error('error at 3'));
                }
                return of(x);
            }),
            catchError((err, caught) => of('fallback'))
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 'fallback']);
                done();
            }
        });
    });

    test('should allow retrying by returning the caught observable', (t, done) => {
        let attemptCount = 0;
        const flakySource = of(null).pipe(
            switchMap(() => {
                attemptCount++;
                return attemptCount < 3 ? throwError(() => new Error(`attempt ${attemptCount}`)) : of('success');
            })
        );

        flakySource.pipe(
            catchError((err, caught) => {
                return attemptCount < 3 ? caught : of('final fallback');
            })
        ).subscribe({
            next: (value) => {
                assert.strictEqual(value, 'success');
            },
            complete: () => {
                assert.strictEqual(attemptCount, 3);
                done();
            }
        });
    });

    test('should handle chained catchError operators', (t, done) => {
        const values: any[] = [];
        throwError(() => new Error('first error')).pipe(
            catchError((err, caught) => {
                assert.strictEqual(err.message, 'first error');
                return throwError(() => new Error('second error'));
            }),
            catchError((err, caught) => {
                return of(`caught: ${err.message}`);
            })
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, ['caught: second error']);
                done();
            }
        });
    });

    test('should propagate errors thrown from the selector function', (t, done) => {
        const selectorError = new Error('selector error');
        throwError(() => new Error('original error')).pipe(
            catchError((err, caught) => {
                throw selectorError;
            })
        ).subscribe({
            next: () => assert.fail('should not emit next'),
            error: (err) => {
                assert.strictEqual(err, selectorError);
                done();
            }
        });
    });

    test('should not do anything if the source does not error', (t, done) => {
        const values: number[] = [];
        of(1, 2, 3).pipe(
            catchError((err, caught) => of(999))
        ).subscribe({
            next: (value) => values.push(value),
            complete: () => {
                assert.deepStrictEqual(values, [1, 2, 3]);
                done();
            }
        });
    });
});
