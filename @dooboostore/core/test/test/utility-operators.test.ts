import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { share, finalize, tap } from '../../src/message/operators';
import { of, interval, throwError, Observable } from '../../src/message/internal';
import { take } from '../../src/message/internal';

describe('share operator', () => {

    test('should share a single subscription with multiple subscribers', (t, done) => {
        let sourceSubscriptionCount = 0;
        const source = of(1, 2, 3).pipe(tap(() => sourceSubscriptionCount++));
        const shared = source.pipe(share());

        const valuesA: number[] = [];
        const valuesB: number[] = [];
        let completeCount = 0;

        const checkCompletion = () => {
            if (++completeCount === 2) {
                assert.deepStrictEqual(valuesA, [1, 2, 3]);
                assert.deepStrictEqual(valuesB, [1, 2, 3]);
                assert.strictEqual(sourceSubscriptionCount, 3);
                done();
            }
        };

        shared.subscribe({ next: v => valuesA.push(v), complete: checkCompletion });
        shared.subscribe({ next: v => valuesB.push(v), complete: checkCompletion });
    });

    test('should unsubscribe from source only when all subscribers unsubscribe', (t, done) => {
        let sourceUnsubscribed = false;
        const source = new Observable(subscriber => {
            return () => sourceUnsubscribed = true;
        });
        const shared = source.pipe(share());

        const sub1 = shared.subscribe();
        const sub2 = shared.subscribe();

        sub1.unsubscribe();
        assert.strictEqual(sourceUnsubscribed, false, 'Source should not unsubscribe if subscribers remain');

        sub2.unsubscribe();
        assert.strictEqual(sourceUnsubscribed, true, 'Source should unsubscribe when all subscribers are gone');
        done();
    });

    test('should multicast errors to all subscribers', (t, done) => {
        const testError = new Error('shared error');
        const shared = throwError(() => testError).pipe(share());
        let errorCount = 0;

        const checkCompletion = () => {
            if (++errorCount === 2) {
                done();
            }
        };

        shared.subscribe({ error: err => {
            assert.strictEqual(err, testError);
            checkCompletion();
        }});
        shared.subscribe({ error: err => {
            assert.strictEqual(err, testError);
            checkCompletion();
        }});
    });
});

describe('finalize operator', () => {

    test('should be called once on completion', (t, done) => {
        let finalizeCallCount = 0;
        of(1, 2, 3).pipe(
            finalize(() => finalizeCallCount++)
        ).subscribe({
            complete: () => {
                assert.strictEqual(finalizeCallCount, 1);
                done();
            }
        });
    });

    test('should be called once on error', (t, done) => {
        let finalizeCallCount = 0;
        throwError(() => new Error('test')).pipe(
            finalize(() => finalizeCallCount++)
        ).subscribe({
            error: () => {
                assert.strictEqual(finalizeCallCount, 1);
                done();
            }
        });
    });

    test('should be called once on unsubscribe', (t, done) => {
        let finalizeCallCount = 0;
        const subscription = interval(50).pipe(
            finalize(() => finalizeCallCount++)
        ).subscribe();

        setTimeout(() => {
            subscription.unsubscribe();
            setTimeout(() => {
                assert.strictEqual(finalizeCallCount, 1);
                done();
            }, 50);
        }, 120);
    });

    test('should call multiple finalize operators in reverse order of subscription', (t, done) => {
        const calls: string[] = [];
        of(1).pipe(
            finalize(() => calls.push('first')),
            finalize(() => calls.push('second'))
        ).subscribe({
            complete: () => {
                assert.deepStrictEqual(calls, ['second', 'first']);
                done();
            }
        });
    });

    test('should not prevent stream completion if it throws', (t, done) => {
        let completed = false;
        of(1, 2).pipe(
            finalize(() => {
                throw new Error('finalize error');
            })
        ).subscribe({
            complete: () => {
                completed = true;
            }
        });
        
        setTimeout(() => {
            assert.strictEqual(completed, true);
            done();
        }, 50);
    });
});
