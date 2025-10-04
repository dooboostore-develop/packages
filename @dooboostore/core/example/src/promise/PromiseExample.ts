import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Promises } from '@dooboostore/core/promise/Promises';

export class PromiseExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Promise Utils Example ===\n');
    
    // Sleep example
    console.log('1. Sleep example:');
    console.log('  Starting sleep...');
    await Promises.sleep(1000);
    console.log('  Slept 1 second!');
    
    // Settle example
    console.log('\n2. Settle (safe promise handling):');
    const successPromise = Promise.resolve('Success!');
    const failPromise = Promise.reject(new Error('Failed!'));
    
    const result1 = await Promises.settle(successPromise);
    console.log('  Success result:', result1);
    
    const result2 = await Promises.settle(failPromise);
    console.log('  Failed result:', result2);
    
    // Settles (multiple promises)
    console.log('\n3. Settles (multiple promises):');
    const results = await Promises.settles(
      Promise.resolve(1),
      Promise.reject('Error'),
      Promise.resolve(3)
    );
    console.log('  All results:', results);
    
    // Loop example
    console.log('\n4. Loop example (will run 3 times):');
    let count = 0;
    const subscription = Promises.loop({
      factory: async (config) => {
        count++;
        console.log(`  Loop iteration ${config.age}`);
        if (count >= 3) {
          subscription.unsubscribe();
        }
        return count;
      },
      delay: 100,
      loopDelay: 500
    }).subscribe({
      then: (data, config) => {
        console.log(`  Received: ${data}, duration: ${config.duration}ms`);
      }
    });
    
    // Wait for loop to finish
    await Promises.sleep(2000);
    
    // Result utilities example
    console.log('\n5. Result utilities:');
    
    // Wrap promise with Result
    const successPromise2 = Promise.resolve('Success data');
    const wrappedSuccess = Promises.Result.wrap(successPromise2);
    
    console.log('  Initial state:', {
      status: wrappedSuccess.status,
      isPending: wrappedSuccess.isPending,
      isFulfilled: wrappedSuccess.isFulfilled,
      isRejected: wrappedSuccess.isRejected
    });

    // Wait for the promise to resolve
    await wrappedSuccess;
    
    console.log('  After resolution:', {
      status: wrappedSuccess.status,
      isPending: wrappedSuccess.isPending,
      isFulfilled: wrappedSuccess.isFulfilled,
      isRejected: wrappedSuccess.isRejected,
      value: wrappedSuccess.value
    });

    // Wrap rejected promise
    const failurePromise2 = Promise.reject(new Error('Test error'));
    const wrappedFailure = Promises.Result.wrap(failurePromise2);
    
    try {
      await wrappedFailure;
    } catch (e) {
      // Expected to throw
    }
    
    console.log('  After rejection:', {
      status: wrappedFailure.status,
      isPending: wrappedFailure.isPending,
      isFulfilled: wrappedFailure.isFulfilled,
      isRejected: wrappedFailure.isRejected,
      reason: wrappedFailure.reason
    });

    // AwaitWrap example
    console.log('\n6. AwaitWrap example:');
    
    const asyncFunction = async () => {
      await Promises.sleep(500);
      return 'Async function result';
    };

    const result = await Promises.Result.awaitWrap(asyncFunction);
    console.log('  AwaitWrap result:', {
      status: result.status,
      isFulfilled: result.isFulfilled,
      isRejected: result.isRejected,
      isPending: result.isPending,
      value: result.value
    });

    // Factory pattern with awaitWrap
    const factoryResult = await Promises.Result.awaitWrap(() => asyncFunction());
    console.log('  Factory result:', {
      status: factoryResult.status,
      isFulfilled: factoryResult.isFulfilled,
      hasFactory: !!factoryResult.factory
    });

    // Use factory to create new instance
    if (factoryResult.factory) {
      const newResult = await factoryResult.factory();
      console.log('  New factory result:', {
        status: newResult.status,
        isFulfilled: newResult.isFulfilled,
        value: newResult.value
      });
    }

    // Filter catch example
    console.log('\n7. Filter catch example:');
    
    const errorPromise = Promise.reject(new Error('Specific error'));
    
    try {
      const filteredError = await Promises.filterCatch(errorPromise, Error);
      console.log('  Filtered error:', filteredError);
    } catch (e) {
      console.log('  Error not filtered:', e.message);
    }

    // Transaction example
    console.log('\n8. Transaction example:');
    
    const transactionPromise = Promise.resolve('Transaction data');
    
    Promises.transaction(transactionPromise, {
      delay: 100,
      before: () => {
        console.log('  Before transaction');
        return 'before data';
      },
      after: () => {
        console.log('  After transaction');
        return 'after data';
      },
      then: (data, context) => {
        console.log('  Transaction success:', data, 'with context:', context);
      },
      catch: (error, context) => {
        console.log('  Transaction error:', error, 'with context:', context);
      },
      finally: (context) => {
        console.log('  Transaction finally:', context);
      }
    });

    // Wait for transaction to complete
    await Promises.sleep(1000);
    
    console.log('\n=========================\n');
  }
}
