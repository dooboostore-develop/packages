import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { timer } from '@dooboostore/core/message/internal/timer';

describe('timer', () => {

    test('should emit 0 after an initial delay and then complete', (t, done) => {
        const startTime = Date.now();
        timer(50).subscribe({
            next: (value) => {
                const elapsed = Date.now() - startTime;
                assert.strictEqual(value, 0, 'Timer should emit 0');
                assert(elapsed >= 45, 'Timer should wait for the approximate initial delay');
            },
            complete: () => {
                done();
            }
        });
    });

    test('should emit values at a specified period after an initial delay', (t, done) => {
        const values: number[] = [];
        const startTime = Date.now();
        const subscription = timer(30, 20).subscribe({
            next: (value) => {
                values.push(value);
                if (values.length === 4) {
                    subscription.unsubscribe();
                    const elapsed = Date.now() - startTime;
                    assert.deepStrictEqual(values, [0, 1, 2, 3]);
                    // 30ms initial + 3 * 20ms period = 90ms
                    assert(elapsed >= 90, 'Should respect both initial delay and periods');
                    done();
                }
            }
        });
    });

    test('should emit immediately with a zero initial delay', (t, done) => {
        const values: number[] = [];
        const subscription = timer(0, 25).subscribe({
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

    test('should stop emitting after being unsubscribed', (t, done) => {
        const values: number[] = [];
        const subscription = timer(20, 15).subscribe({
            next: (value) => values.push(value)
        });

        setTimeout(() => {
            subscription.unsubscribe();
            const countAfterUnsubscribe = values.length;
            
            setTimeout(() => {
                assert.strictEqual(values.length, countAfterUnsubscribe, 'Should not emit after unsubscribe');
                done();
            }, 50);
        }, 60);
    });

    test('should treat a negative initial delay as zero', (t, done) => {
        const startTime = Date.now();
        timer(-100).subscribe({
            next: (value) => {
                const elapsed = Date.now() - startTime;
                assert.strictEqual(value, 0);
                assert(elapsed < 50, 'Negative delay should be treated as 0, emitting quickly');
            },
            complete: () => {
                done();
            }
        });
    });
});
