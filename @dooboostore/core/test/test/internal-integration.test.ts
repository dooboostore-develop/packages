import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { interval } from '@dooboostore/core/message/internal/interval';
import { take } from '@dooboostore/core/message/internal/take';
import { lastValueFrom, EmptyError } from '@dooboostore/core/message/internal/lastValueFrom';
import { map } from '@dooboostore/core/message/operators/map';
import { filter } from '@dooboostore/core/message/operators/filter';
import { Subject } from '@dooboostore/core/message/Subject';
import { BehaviorSubject } from '@dooboostore/core/message/BehaviorSubject';

describe('Internal operators integration', () => {

    test('interval().pipe(take(n)) should resolve with the last value', async () => {
        const result = await lastValueFrom(interval(10).pipe(take(5)));
        assert.strictEqual(result, 4);
    });

    test('interval with map and take should resolve correctly', async () => {
        const result = await lastValueFrom(
            interval(5).pipe(
                map(x => x * 2),
                take(3)
            )
        );
        // 0*2=0, 1*2=2, 2*2=4 -> last is 4
        assert.strictEqual(result, 4);
    });

    test('interval with filter and take should resolve correctly', async () => {
        const result = await lastValueFrom(
            interval(5).pipe(
                filter(x => x % 2 === 0), // 0, 2, 4
                take(3)
            )
        );
        assert.strictEqual(result, 4);
    });

    test('Subject with take and lastValueFrom should resolve with the correct value', async () => {
        const subject = new Subject<string>();
        const promise = lastValueFrom(subject.pipe(take(2)));

        subject.next('first');
        subject.next('second');
        subject.next('third'); // Should be ignored

        const result = await promise;
        assert.strictEqual(result, 'second');
    });

    test('BehaviorSubject with take and lastValueFrom should resolve correctly', async () => {
        // Initial value is 100
        const behaviorSubject = new BehaviorSubject<number>(100);
        // take(3) will take 100, 200, 300
        const promise = lastValueFrom(behaviorSubject.pipe(take(3)));

        behaviorSubject.next(200);
        behaviorSubject.next(300);
        behaviorSubject.next(400); // Should be ignored

        const result = await promise;
        assert.strictEqual(result, 300);
    });

    test('a complex operator chain should resolve with the correct value', async () => {
        const result = await lastValueFrom(
            interval(3).pipe(
                map(x => x + 1),     // 1, 2, 3, 4, 5...
                filter(x => x > 2),  // 3, 4, 5...
                map(x => x * 10),    // 30, 40, 50...
                take(2)              // 30, 40
            )
        );
        assert.strictEqual(result, 40);
    });

    test('take(0) with lastValueFrom should reject with EmptyError', async () => {
        const promise = lastValueFrom(interval(10).pipe(take(0)));
        await assert.rejects(promise, EmptyError);
    });

    test('should handle multiple subscribers to the same interval-based observable', (t, done) => {
        const source = interval(20).pipe(take(3));
        const valuesA: number[] = [];
        const valuesB: number[] = [];
        let completedA = false;
        let completedB = false;

        const checkCompletion = () => {
            if (completedA && completedB) {
                assert.deepStrictEqual(valuesA, [0, 1, 2]);
                assert.deepStrictEqual(valuesB, [0, 1, 2]);
                done();
            }
        };

        source.subscribe({
            next: (value) => valuesA.push(value),
            complete: () => {
                completedA = true;
                checkCompletion();
            }
        });

        source.subscribe({
            next: (value) => valuesB.push(value),
            complete: () => {
                completedB = true;
                checkCompletion();
            }
        });
    });
});
