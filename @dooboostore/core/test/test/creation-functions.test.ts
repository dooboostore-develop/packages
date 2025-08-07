import { 
  of, 
  fromArray, 
  fromPromise, 
  empty, 
  never, 
  throwError, 
  range, 
  defer 
} from '@dooboostore/core/message/internal';

export const creationFunctionsTest = () => {
  console.log('--- Creation Functions Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing of function ---');
    
    // Test of with various data types
    const values1: any[] = [];
    of(1, 'hello' as any, true, null, undefined, { key: 'value' }, [1, 2, 3]).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 7, 'of should emit all provided values');
        assert(values1[0] === 1, 'Should emit number');
        assert(values1[1] === 'hello', 'Should emit string');
        assert(values1[2] === true, 'Should emit boolean');
        assert(values1[3] === null, 'Should emit null');
        assert(values1[4] === undefined, 'Should emit undefined');
        assert(typeof values1[5] === 'object', 'Should emit object');
        assert(Array.isArray(values1[6]), 'Should emit array');
        
        // Test of with no arguments
        const emptyValues: any[] = [];
        of().subscribe({
          next: (value) => emptyValues.push(value),
          complete: () => {
            assert(emptyValues.length === 0, 'of() should emit no values');
            testFromArray();
          }
        });
      }
    });

    function testFromArray() {
      console.log('\n--- Testing fromArray function ---');
      
      // Test with normal array
      const values2: number[] = [];
      fromArray([10, 20, 30, 40]).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          assert(values2.length === 4, 'fromArray should emit all array elements');
          assert(values2[0] === 10 && values2[3] === 40, 'Should emit in correct order');
          
          // Test with empty array
          const emptyValues: any[] = [];
          fromArray([]).subscribe({
            next: (value) => emptyValues.push(value),
            complete: () => {
              assert(emptyValues.length === 0, 'fromArray([]) should emit no values');
              
              // Test with mixed types array
              const mixedValues: any[] = [];
              fromArray(['a', 1, true, null]).subscribe({
                next: (value) => mixedValues.push(value),
                complete: () => {
                  assert(mixedValues.length === 4, 'Should handle mixed types');
                  testFromPromise();
                }
              });
            }
          });
        }
      });
    }

    function testFromPromise() {
      console.log('\n--- Testing fromPromise function ---');
      
      // Test with resolved promise
      const resolvedPromise = Promise.resolve('success');
      fromPromise(resolvedPromise).subscribe({
        next: (value) => {
          assert(value === 'success', 'Should emit resolved value');
        },
        complete: () => {
          // Test with rejected promise
          const rejectedPromise = Promise.reject(new Error('failure'));
          fromPromise(rejectedPromise).subscribe({
            next: () => assert(false, 'Should not emit next for rejected promise'),
            error: (err) => {
              assert(err.message === 'failure', 'Should emit rejection error');
              
              // Test with promise that resolves to complex object
              const objectPromise = Promise.resolve({ data: [1, 2, 3], status: 'ok' });
              fromPromise(objectPromise).subscribe({
                next: (value) => {
                  assert(value.status === 'ok', 'Should emit complex resolved value');
                  assert(Array.isArray(value.data), 'Should preserve object structure');
                },
                complete: () => {
                  testEmpty();
                }
              });
            }
          });
        }
      });
    }

    function testEmpty() {
      console.log('\n--- Testing empty function ---');
      
      let nextCalled = false;
      let completeCalled = false;
      empty().subscribe({
        next: () => nextCalled = true,
        complete: () => completeCalled = true,
        error: () => assert(false, 'Empty should not error')
      });
      
      // Give it a moment to ensure it completes synchronously
      setTimeout(() => {
        assert(!nextCalled, 'Empty should not emit any values');
        assert(completeCalled, 'Empty should complete immediately');
        testNever();
      }, 10);
    }

    function testNever() {
      console.log('\n--- Testing never function ---');
      
      let nextCalled = false;
      let completeCalled = false;
      let errorCalled = false;
      
      const subscription = never().subscribe({
        next: () => nextCalled = true,
        complete: () => completeCalled = true,
        error: () => errorCalled = true
      });
      
      setTimeout(() => {
        subscription.unsubscribe();
        assert(!nextCalled, 'Never should not emit values');
        assert(!completeCalled, 'Never should not complete');
        assert(!errorCalled, 'Never should not error');
        testThrowError();
      }, 50);
    }

    function testThrowError() {
      console.log('\n--- Testing throwError function ---');
      
      const testError = new Error('Custom error message');
      let nextCalled = false;
      let completeCalled = false;
      
      throwError(testError).subscribe({
        next: () => nextCalled = true,
        complete: () => completeCalled = true,
        error: (err) => {
          assert(!nextCalled, 'throwError should not emit values');
          assert(!completeCalled, 'throwError should not complete');
          assert(err === testError, 'Should emit the exact error object');
          assert(err.message === 'Custom error message', 'Error message should be preserved');
          
          // Test with non-Error object
          throwError('string error').subscribe({
            next: () => assert(false, 'Should not emit next'),
            error: (err) => {
              assert(err === 'string error', 'Should emit non-Error objects as-is');
              testRange();
            }
          });
        }
      });
    }

    function testRange() {
      console.log('\n--- Testing range function ---');
      
      // Test normal range
      const values3: number[] = [];
      range(5, 4).subscribe({
        next: (value) => values3.push(value),
        complete: () => {
          assert(values3.length === 4, 'Range should emit correct count');
          assert(values3[0] === 5, 'Should start with start value');
          assert(values3[3] === 8, 'Should end with start + count - 1');
          
          // Test range with zero count
          const zeroValues: number[] = [];
          range(10, 0).subscribe({
            next: (value) => zeroValues.push(value),
            complete: () => {
              assert(zeroValues.length === 0, 'Range with zero count should emit nothing');
              
              // Test range with negative count
              const negativeValues: number[] = [];
              range(1, -5).subscribe({
                next: (value) => negativeValues.push(value),
                complete: () => {
                  assert(negativeValues.length === 0, 'Range with negative count should emit nothing');
                  
                  // Test range with large numbers
                  const largeValues: number[] = [];
                  range(1000000, 3).subscribe({
                    next: (value) => largeValues.push(value),
                    complete: () => {
                      assert(largeValues.length === 3, 'Should handle large start values');
                      assert(largeValues[0] === 1000000, 'Should start with large number');
                      testDefer();
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    function testDefer() {
      console.log('\n--- Testing defer function ---');
      
      // Test defer with observable factory
      let callCount = 0;
      const deferredObs = defer(() => {
        callCount++;
        return of(`execution-${callCount}`);
      });
      
      // First subscription
      deferredObs.subscribe({
        next: (value) => {
          assert(value === 'execution-1', 'First subscription should get execution-1');
          assert(callCount === 1, 'Factory should be called once');
        },
        complete: () => {
          // Second subscription
          deferredObs.subscribe({
            next: (value) => {
              assert(value === 'execution-2', 'Second subscription should get execution-2');
              assert(callCount === 2, 'Factory should be called again');
            },
            complete: () => {
              // Test defer with promise factory
              const deferredPromise = defer(() => Promise.resolve('promise-result'));
              deferredPromise.subscribe({
                next: (value) => {
                  assert(value === 'promise-result', 'Should handle promise factory');
                },
                complete: () => {
                  // Test defer with factory that throws
                  const deferredError = defer(() => {
                    throw new Error('Factory threw error');
                  });
                  deferredError.subscribe({
                    next: () => assert(false, 'Should not emit when factory throws'),
                    error: (err) => {
                      assert(err.message === 'Factory threw error', 'Should emit factory error');
                      
                      console.log('\n--- All creation functions tests completed ---');
                      resolve();
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};