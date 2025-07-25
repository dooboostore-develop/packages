import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { defer, of } from '../../src/message/internal';
import { firstValueFrom } from '../../src/message/internal/firstValueFrom';

describe('defer operator (fix test)', () => {

    test('should call the factory function for each new subscriber', (t, done) => {
        let factoryCallCount = 0;
        const deferredObservable = defer(() => {
            factoryCallCount++;
            return of(`call-${factoryCallCount}`);
        });

        // First subscription
        deferredObservable.subscribe({
            next: (value) => {
                assert.strictEqual(value, 'call-1', 'First subscription should get call-1');
                assert.strictEqual(factoryCallCount, 1, 'Factory should be called once');
            },
            complete: () => {
                // Second subscription
                deferredObservable.subscribe({
                    next: (value) => {
                        assert.strictEqual(value, 'call-2', 'Second subscription should get call-2');
                        assert.strictEqual(factoryCallCount, 2, 'Factory should be called twice');
                    },
                    complete: () => {
                        done();
                    }
                });
            }
        });
    });

    test('should work correctly with a promise-returning factory', async () => {
        const deferredPromise = defer(() => Promise.resolve('promise-result'));
        const result = await firstValueFrom(deferredPromise);
        assert.strictEqual(result, 'promise-result');
    });

    test('should propagate an error from the factory function', async () => {
        const testError = new Error('Factory error');
        const deferredError = defer(() => {
            throw testError;
        });
        
        await assert.rejects(() => firstValueFrom(deferredError), testError);
    });
});
