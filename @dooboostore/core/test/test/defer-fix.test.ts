import { defer, of } from '../../src/message/internal';

export const deferFixTest = () => {
  console.log('--- Defer Fix Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing defer with observable factory ---');
    
    let factoryCallCount = 0;
    const deferredObservable = defer(() => {
      factoryCallCount++;
      return of(`call-${factoryCallCount}`);
    });

    deferredObservable.subscribe({
      next: (value) => {
        console.log('Received value:', value);
        assert(value === 'call-1', 'First subscription should get call-1');
        assert(factoryCallCount === 1, 'Factory should be called once');
      },
      complete: () => {
        console.log('First subscription completed');
        
        // Second subscription
        deferredObservable.subscribe({
          next: (value) => {
            console.log('Second subscription received value:', value);
            assert(value === 'call-2', 'Second subscription should get call-2');
            assert(factoryCallCount === 2, 'Factory should be called twice');
          },
          complete: () => {
            console.log('Second subscription completed');
            
            // Test with promise factory
            console.log('\n--- Testing defer with promise factory ---');
            const deferredPromise = defer(() => Promise.resolve('promise-result'));
            deferredPromise.subscribe({
              next: (value) => {
                console.log('Promise defer received value:', value);
                assert(value === 'promise-result', 'Should emit promise resolved value');
              },
              complete: () => {
                console.log('Promise defer completed');
                
                // Test with factory error
                console.log('\n--- Testing defer with factory error ---');
                const deferredError = defer(() => {
                  throw new Error('Factory error');
                });
                deferredError.subscribe({
                  next: () => assert(false, 'Should not emit next when factory throws'),
                  error: (err) => {
                    console.log('Factory error received:', err.message);
                    assert(err.message === 'Factory error', 'Should emit factory error');
                    
                    console.log('\n--- Defer fix test completed ---');
                    resolve();
                  }
                });
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Unexpected error in defer test:', err);
        assert(false, 'Should not error in normal defer test');
      }
    });
  });
};