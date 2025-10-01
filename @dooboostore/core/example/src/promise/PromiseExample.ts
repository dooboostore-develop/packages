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
    
    console.log('\n=========================\n');
  }
}
