import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Observable } from '@dooboostore/core/message/Observable';
import { lastValueFrom, EmptyError } from '@dooboostore/core/message/internal/lastValueFrom';
import { Subject } from '@dooboostore/core/message/Subject';

describe('lastValueFrom utility', () => {

    test('should resolve with the last emitted value from a stream of multiple values', async () => {
        const subject = new Subject<number>();
        const promise = lastValueFrom(subject);

        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.complete();

        const result = await promise;
        assert.strictEqual(result, 3);
    });

    test('should resolve with the single emitted value', async () => {
        const subject = new Subject<string>();
        const promise = lastValueFrom(subject);

        subject.next('only value');
        subject.complete();

        const result = await promise;
        assert.strictEqual(result, 'only value');
    });

    test('should throw EmptyError for an empty stream without a default value', async () => {
        const subject = new Subject<number>();
        const promise = lastValueFrom(subject);

        subject.complete();

        await assert.rejects(promise, (err) => {
            assert(err instanceof EmptyError, 'The error should be an instance of EmptyError');
            assert.strictEqual(err.message, 'No elements in sequence');
            return true;
        });
    });

    test('should resolve with the default value for an empty stream', async () => {
        const subject = new Subject<number>();
        const promise = lastValueFrom(subject, { defaultValue: 42 });

        subject.complete();

        const result = await promise;
        assert.strictEqual(result, 42);
    });

    test('should propagate an error from the source stream', async () => {
        const subject = new Subject<string>();
        const testError = new Error('test error');
        const promise = lastValueFrom(subject);

        subject.next('some value');
        subject.error(testError);

        await assert.rejects(promise, testError);
    });

    test('should propagate an error even if a default value is provided', async () => {
        const subject = new Subject<number>();
        const testError = new Error('another error');
        const promise = lastValueFrom(subject, { defaultValue: 100 });

        subject.next(50);
        subject.error(testError);

        await assert.rejects(promise, testError);
    });

    test('should resolve with the last emitted value, not the default', async () => {
        const subject = new Subject<boolean>();
        const promise = lastValueFrom(subject, { defaultValue: false });

        subject.next(true);
        subject.next(false);
        subject.next(true);
        subject.complete();

        const result = await promise;
        assert.strictEqual(result, true);
    });
    
    test('should throw EmptyError for an Observable that completes immediately', async () => {
        const observable = new Observable<number>(subscriber => {
            subscriber.complete();
        });
        
        await assert.rejects(lastValueFrom(observable), EmptyError);
    });

    test('should resolve with value from an Observable that emits and completes immediately', async () => {
        const observable = new Observable<string>(subscriber => {
            subscriber.next('immediate');
            subscriber.complete();
        });
        
        const result = await lastValueFrom(observable);
        assert.strictEqual(result, 'immediate');
    });
});
