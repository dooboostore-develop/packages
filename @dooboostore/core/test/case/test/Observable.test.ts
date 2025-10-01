import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Observable } from '../../src/message/Observable';
import { Subject } from '../../src/message/Subject';
import { BehaviorSubject } from '../../src/message/BehaviorSubject';
import { map } from '../../src/message/operators/map';
import { interval, take, lastValueFrom } from '../../src/message/internal';

describe('Observable Core Functionality', () => {

    test('should handle basic Observable with producer function', (t, done) => {
        const observable = new Observable<number>((subscriber) => {
            subscriber.next(1);
            subscriber.next(2);
            subscriber.complete();
        });

        const results: number[] = [];
        observable.subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.deepStrictEqual(results, [1, 2], 'Should receive [1, 2]');
                done();
            }
        });
    });

    test('should handle Observable error handling', (t, done) => {
        const testError = new Error('Test error');
        const observable = new Observable<number>((subscriber) => {
            subscriber.next(1);
            subscriber.error(testError);
        });

        let receivedValue: number | undefined;
        let receivedError: Error | undefined;
        observable.subscribe({
            next: (value) => receivedValue = value,
            error: (err) => {
                receivedError = err;
                assert.strictEqual(receivedValue, 1, 'Should receive value before error');
                assert.strictEqual(receivedError, testError, 'Should receive the correct error');
                done();
            }
        });
    });

    test('should handle Observable pipe functionality', (t, done) => {
        const observable = new Observable<number>((subscriber) => {
            subscriber.next(1);
            subscriber.next(2);
            subscriber.next(3);
            subscriber.complete();
        });

        const results: number[] = [];
        observable.pipe(
            map(x => x * 2)
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.deepStrictEqual(results, [2, 4, 6], 'Should receive mapped values [2, 4, 6]');
                done();
            }
        });
    });

    test('toPromise should resolve with the last value', async () => {
        const observable = new Observable<number>((subscriber) => {
            subscriber.next(1);
            subscriber.next(2);
            subscriber.next(3);
            subscriber.complete();
        });
        const result = await observable.toPromise();
        assert.strictEqual(result, 3, 'toPromise should resolve with last value');
    });

    test('should call cleanup function on unsubscribe', (t, done) => {
        let cleanupCalled = false;
        const observable = new Observable<number>(() => {
            return () => {
                cleanupCalled = true;
            };
        });

        const subscription = observable.subscribe(() => {});
        subscription.unsubscribe();
        
        setImmediate(() => {
            assert.strictEqual(cleanupCalled, true, 'Cleanup function should be called on unsubscribe');
            done();
        });
    });
});

describe('Subject Functionality', () => {
    test('should work as both an Observable and an Observer', (t, done) => {
        const subject = new Subject<number>();
        const results: number[] = [];

        subject.subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.deepStrictEqual(results, [1, 2, 3], 'Subject should receive [1, 2, 3]');
                done();
            }
        });

        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.complete();
    });

    test('should multicast to multiple subscribers', () => {
        const subject = new Subject<string>();
        const resultsA: string[] = [];
        const resultsB: string[] = [];

        subject.subscribe(value => resultsA.push(value));
        subject.subscribe(value => resultsB.push(value));

        subject.next('hello');
        subject.next('world');

        assert.deepStrictEqual(resultsA, ['hello', 'world']);
        assert.deepStrictEqual(resultsB, ['hello', 'world']);
    });

    test('should handle pipe operations correctly', (t, done) => {
        const subject = new Subject<number>();
        const results: number[] = [];

        subject.pipe(
            map(x => x * 2)
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.deepStrictEqual(results, [2, 4, 6]);
                done();
            }
        });

        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.complete();
    });

    test('should propagate errors to subscribers', (t, done) => {
        const subject = new Subject<number>();
        const testError = new Error('Test error');
        let receivedValue: number | undefined;
        let receivedError: Error | undefined;

        subject.subscribe({
            next: (value) => receivedValue = value,
            error: (err) => {
                receivedError = err;
                assert.strictEqual(receivedValue, 1);
                assert.strictEqual(receivedError, testError);
                done();
            }
        });

        subject.next(1);
        subject.error(testError);
    });
});

describe('BehaviorSubject Functionality', () => {
    test('should provide an initial value to subscribers', () => {
        const subject = new BehaviorSubject<number>(42);
        const results: number[] = [];
        
        subject.subscribe(value => results.push(value));
        
        assert.deepStrictEqual(results, [42]);
        
        subject.next(100);
        
        assert.deepStrictEqual(results, [42, 100]);
    });

    test('getValue should return the current value', () => {
        const subject = new BehaviorSubject<string>('initial');
        assert.strictEqual(subject.getValue(), 'initial');
        
        subject.next('updated');
        assert.strictEqual(subject.getValue(), 'updated');
    });

    test('should work correctly with pipe', (t, done) => {
        const subject = new BehaviorSubject<number>(1);
        const results: number[] = [];

        subject.pipe(
            map(x => x * 10)
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.deepStrictEqual(results, [10, 20, 30]);
                done();
            }
        });

        subject.next(2);
        subject.next(3);
        subject.complete();
    });
});


describe('Internal Operators Integration', () => {
    test('interval with take should work correctly', (t, done) => {
        const results: number[] = [];
        interval(10).pipe(
            take(3)
        ).subscribe({
            next: (value) => results.push(value),
            complete: () => {
                assert.deepStrictEqual(results, [0, 1, 2]);
                done();
            }
        });
    });

    test('lastValueFrom should resolve with the last value', async () => {
        const subject = new Subject<number>();
        const promise = lastValueFrom(subject);
        
        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.complete();

        const result = await promise;
        assert.strictEqual(result, 3);
    });
});

describe('Type Compatibility', () => {
    test('Subject should be assignable to Observable', () => {
        const subject = new Subject<number>();
        const observable: Observable<number> = subject;
        
        assert.strictEqual(observable, subject);
        assert.strictEqual(typeof observable.pipe, 'function');
        assert.strictEqual(typeof observable.subscribe, 'function');
    });

    test('BehaviorSubject should be assignable to Observable', () => {
        const behaviorSubject = new BehaviorSubject<string>('test');
        const observable: Observable<string> = behaviorSubject;
        
        assert.strictEqual(observable, behaviorSubject);
        assert.strictEqual(typeof observable.pipe, 'function');
        assert.strictEqual(typeof observable.subscribe, 'function');
    });
});
