import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { interval } from '@dooboostore/core/message/internal/interval';
import { take } from '@dooboostore/core/message/internal/take';

describe('interval operator', () => {

    test('should emit values at a specified interval', (t, done) => {
        const values: number[] = [];
        const source = interval(50); // 50ms interval
        
        const subscription = source.subscribe({
            next: (value) => {
                values.push(value);
                if (values.length === 3) {
                    subscription.unsubscribe();
                    assert.deepStrictEqual(values, [0, 1, 2], 'Should emit [0, 1, 2]');
                    done();
                }
            }
        });
    });

    test('should handle a zero period interval', (t, done) => {
        const values: number[] = [];
        const source = interval(0);
        
        const subscription = source.subscribe({
            next: (value) => {
                values.push(value);
                if (values.length === 2) {
                    subscription.unsubscribe();
                    assert.deepStrictEqual(values, [0, 1], 'Should emit [0, 1] for 0ms interval');
                    done();
                }
            }
        });
    });

    test('should treat a negative period as zero', (t, done) => {
        const values: number[] = [];
        const source = interval(-100); // Should be treated as 0
        
        const subscription = source.subscribe({
            next: (value) => {
                values.push(value);
                if (values.length === 2) {
                    subscription.unsubscribe();
                    assert.deepStrictEqual(values, [0, 1], 'Should emit [0, 1] for negative period');
                    done();
                }
            }
        });
    });

    test('should stop emitting values after unsubscribe', (t, done) => {
        const values: number[] = [];
        const source = interval(30);
        
        const subscription = source.subscribe({
            next: (value) => {
                values.push(value);
            }
        });
        
        setTimeout(() => {
            subscription.unsubscribe();
            const countAfterUnsubscribe = values.length;
            
            setTimeout(() => {
                assert.strictEqual(values.length, countAfterUnsubscribe, 'Should not emit after unsubscribe');
                done();
            }, 50);
        }, 100);
    });

    test('should work with the take operator', (t, done) => {
        const values: number[] = [];
        const source = interval(20).pipe(take(3));
        
        source.subscribe({
            next: (value) => {
                values.push(value);
            },
            complete: () => {
                assert.deepStrictEqual(values, [0, 1, 2], 'Should emit exactly 3 values with take(3)');
                done();
            }
        });
    });
});
