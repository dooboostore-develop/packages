import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  switchMap, mergeMap, concatMap, catchError, retry, delay, timeout, 
  scan, reduce, share, finalize, map, filter, tap, TimeoutError
} from '../../src/message/operators';
import { 
  of, interval, timer, throwError, range, take, startWith
} from '../../src/message/internal';

describe('Operators Integration', () => {

    test('should handle a data processing pipeline', (t, done) => {
        const results: any[] = [];
        let finalizeCount = 0;
        
        range(1, 10).pipe(
            filter((x: number) => x % 2 === 0),
            map((x: number) => ({ id: x, value: x * 10 })),
            switchMap(item => timer(10).pipe(map(() => ({ ...item, processed: true })), take(1))),
            scan((acc: any[], item) => [...acc, item], []),
            take(3),
            finalize(() => finalizeCount++)
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.strictEqual(results.length, 3);
                assert.strictEqual(results[0].length, 1);
                assert.strictEqual(results[1].length, 2);
                assert.strictEqual(results[2].length, 3);
                assert.strictEqual(finalizeCount, 1);
                done();
            }
        });
    });

    test('should handle an error recovery pipeline with retry and catchError', (t, done) => {
        const results: any[] = [];
        let attemptCount = 0;
        
        of(1, 2, 3).pipe(
            mergeMap(id => 
                of(id).pipe(
                    tap(() => attemptCount++),
                    map(val => {
                        if (val === 2 && attemptCount < 2) {
                            throw new Error('flaky error');
                        }
                        return { id: val, data: `data-${val}` };
                    }),
                    retry(1) // Retry each inner observable once
                )
            ),
            catchError((err, caught) => {
                return of({ id: 999, data: 'fallback-data' });
            })
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                const ids = results.map(r => r.id).sort();
                assert.deepStrictEqual(ids, [1, 2, 3]);
                done();
            }
        });
    });

    test('should process concurrently with mergeMap and sequentially with concatMap', (t, done) => {
        const concurrentResults: number[] = [];
        const sequentialResults: number[] = [];
        let concurrentCompleted = false;
        let sequentialCompleted = false;
        
        const checkCompletion = () => {
            if (concurrentCompleted && sequentialCompleted) {
                assert.deepStrictEqual(concurrentResults.sort(), [100, 200, 300]);
                assert.deepStrictEqual(sequentialResults, [100, 200, 300]);
                done();
            }
        };

        of(1, 2, 3).pipe(
            mergeMap(x => timer(x * 20).pipe(map(() => x * 100), take(1)))
        ).subscribe({
            next: (v) => concurrentResults.push(v),
            complete: () => { concurrentCompleted = true; checkCompletion(); }
        });

        of(1, 2, 3).pipe(
            concatMap(x => timer(x * 20).pipe(map(() => x * 100), take(1)))
        ).subscribe({
            next: (v) => sequentialResults.push(v),
            complete: () => { sequentialCompleted = true; checkCompletion(); }
        });
    });

    test('should share a single source with multiple subscribers', (t, done) => {
        let sourceExecutionCount = 0;
        const shared = interval(30).pipe(
            tap(() => sourceExecutionCount++),
            take(3),
            map(x => x * 10),
            share()
        );

        const sub1Results: number[] = [];
        const sub2Results: number[] = [];
        let completeCount = 0;

        const checkCompletion = () => {
            if (++completeCount === 2) {
                assert.deepStrictEqual(sub1Results, [0, 10, 20]);
                assert.deepStrictEqual(sub2Results, [10, 20]);
                assert.strictEqual(sourceExecutionCount, 3);
                done();
            }
        };

        shared.subscribe({ next: v => sub1Results.push(v), complete: checkCompletion });
        setTimeout(() => {
            shared.subscribe({ next: v => sub2Results.push(v), complete: checkCompletion });
        }, 45);
    });

    test('should handle timeout with a fallback value', (t, done) => {
        timer(200).pipe(
            map(() => 'slow-response'),
            timeout(100),
            catchError(err => {
                return err instanceof TimeoutError ? of('timeout-fallback') : throwError(() => err);
            })
        ).subscribe({
            next: (value) => assert.strictEqual(value, 'timeout-fallback'),
            complete: done
        });
    });

    test('should handle a complex user search scenario', (t, done) => {
        const results: any[] = [];
        of('a', 'ab', 'abc').pipe(
            switchMap(query => 
                timer(50).pipe(
                    map(() => {
                        if (query === 'ab') throw new Error('API error');
                        return { query, results: [`${query}-result`] };
                    }),
                    catchError(err => of({ query, results: [], error: err.message }))
                )
            ),
            take(3),
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.strictEqual(results.length, 3);
                assert(results.some(r => r.error));
                assert(results.some(r => r.results.length > 0));
                done();
            }
        });
    });
});
