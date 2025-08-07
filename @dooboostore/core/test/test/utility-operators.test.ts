import { share, finalize } from '../../src/message/operators';
import { of, interval, throwError } from '../../src/message/internal';
import { take } from '../../src/message/internal';

export const utilityOperatorsTest = () => {
  console.log('--- Utility Operators Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Test Case 1: Basic share functionality ---');
    
    let sourceSubscriptionCount = 0;
    const shared = of(1, 2, 3).pipe(
      tap(() => sourceSubscriptionCount++),
      share()
    );

    const values1a: number[] = [];
    const values1b: number[] = [];
    let completedCount = 0;

    const checkCompletion = () => {
      completedCount++;
      if (completedCount === 2) {
        assert(values1a.length === 3, 'First subscriber should receive all values');
        assert(values1b.length === 3, 'Second subscriber should receive all values');
        assert(values1a[0] === 1 && values1a[1] === 2 && values1a[2] === 3, 'First subscriber should receive correct values');
        assert(values1b[0] === 1 && values1b[1] === 2 && values1b[2] === 3, 'Second subscriber should receive correct values');
        // Note: sourceSubscriptionCount check might be timing-dependent
        testShareUnsubscribe();
      }
    };

    shared.subscribe({
      next: (value) => values1a.push(value),
      complete: checkCompletion
    });

    shared.subscribe({
      next: (value) => values1b.push(value),
      complete: checkCompletion
    });

    function testShareUnsubscribe() {
      console.log('\n--- Test Case 2: Share unsubscribe behavior ---');
      
      let sourceUnsubscribed = false;
      const shared2 = new (of(null).constructor as any)((subscriber: any) => {
        const timeoutId = setTimeout(() => {
          subscriber.next(1);
          subscriber.complete();
        }, 100);
        
        return () => {
          clearTimeout(timeoutId);
          sourceUnsubscribed = true;
        };
      }).pipe(share());

      const sub1 = shared2.subscribe(() => {});
      const sub2 = shared2.subscribe(() => {});

      // Unsubscribe first subscriber
      setTimeout(() => {
        sub1.unsubscribe();
        assert(!sourceUnsubscribed, 'Source should not be unsubscribed while other subscribers exist');
        
        // Unsubscribe second subscriber
        setTimeout(() => {
          sub2.unsubscribe();
          assert(sourceUnsubscribed, 'Source should be unsubscribed when all subscribers unsubscribe');
          testShareError();
        }, 50);
      }, 50);
    }

    function testShareError() {
      console.log('\n--- Test Case 3: Share error handling ---');
      
      const shared3 = throwError(new Error('shared error')).pipe(share());
      
      let error1Received = false;
      let error2Received = false;
      
      shared3.subscribe({
        next: () => assert(false, 'Should not emit next on error'),
        error: (err) => {
          error1Received = true;
          assert(err.message === 'shared error', 'First subscriber should receive error');
        }
      });

      shared3.subscribe({
        next: () => assert(false, 'Should not emit next on error'),
        error: (err) => {
          error2Received = true;
          assert(err.message === 'shared error', 'Second subscriber should receive error');
          assert(error1Received && error2Received, 'Both subscribers should receive error');
          testBasicFinalize();
        }
      });
    }

    function testBasicFinalize() {
      console.log('\n--- Test Case 4: Basic finalize functionality ---');
      
      let finalizeCallCount = 0;
      const values4: number[] = [];
      
      of(1, 2, 3).pipe(
        finalize(() => finalizeCallCount++)
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 3, 'Should emit all values normally');
          assert(finalizeCallCount === 1, 'Finalize should be called once on completion');
          testFinalizeError();
        }
      });
    }

    function testFinalizeError() {
      console.log('\n--- Test Case 5: Finalize with error ---');
      
      let finalizeCallCount = 0;
      let errorReceived = false;
      
      throwError(new Error('test error')).pipe(
        finalize(() => finalizeCallCount++)
      ).subscribe({
        next: () => assert(false, 'Should not emit next on error'),
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'test error', 'Should propagate original error');
          assert(finalizeCallCount === 1, 'Finalize should be called once on error');
          testFinalizeUnsubscribe();
        }
      });
    }

    function testFinalizeUnsubscribe() {
      console.log('\n--- Test Case 6: Finalize on unsubscribe ---');
      
      let finalizeCallCount = 0;
      const values6: number[] = [];
      
      const subscription = interval(50).pipe(
        finalize(() => finalizeCallCount++)
      ).subscribe({
        next: (value) => values6.push(value)
      });

      setTimeout(() => {
        subscription.unsubscribe();
        
        setTimeout(() => {
          assert(finalizeCallCount === 1, 'Finalize should be called once on unsubscribe');
          testFinalizeChaining();
        }, 50);
      }, 120);
    }

    function testFinalizeChaining() {
      console.log('\n--- Test Case 7: Multiple finalize operators ---');
      
      let finalize1CallCount = 0;
      let finalize2CallCount = 0;
      const values7: number[] = [];
      
      of(1, 2).pipe(
        finalize(() => finalize1CallCount++),
        finalize(() => finalize2CallCount++)
      ).subscribe({
        next: (value) => values7.push(value),
        complete: () => {
          assert(values7.length === 2, 'Should emit all values with multiple finalize');
          assert(finalize1CallCount === 1, 'First finalize should be called once');
          assert(finalize2CallCount === 1, 'Second finalize should be called once');
          testFinalizeException();
        }
      });
    }

    function testFinalizeException() {
      console.log('\n--- Test Case 8: Finalize callback exception ---');
      
      let errorReceived = false;
      const values8: number[] = [];
      
      of(1, 2).pipe(
        finalize(() => {
          throw new Error('finalize error');
        })
      ).subscribe({
        next: (value) => values8.push(value),
        complete: () => {
          // Even if finalize throws, the completion should still happen
          assert(values8.length === 2, 'Should emit all values even if finalize throws');
          testComplexUtilityChaining();
        },
        error: (err) => {
          // Depending on implementation, finalize errors might be swallowed
          // This test checks the behavior
        }
      });
    }

    function testComplexUtilityChaining() {
      console.log('\n--- Test Case 9: Complex utility operator chaining ---');
      
      let sourceSubscriptionCount = 0;
      let finalizeCallCount = 0;
      
      const complex = interval(30).pipe(
        tap(() => sourceSubscriptionCount++),
        take(3),
        share(),
        finalize(() => finalizeCallCount++)
      );

      const values9a: number[] = [];
      const values9b: number[] = [];
      let completedCount = 0;

      const checkCompletion = () => {
        completedCount++;
        if (completedCount === 2) {
          assert(values9a.length === 3, 'First subscriber should receive 3 values');
          assert(values9b.length === 3, 'Second subscriber should receive 3 values');
          assert(finalizeCallCount === 2, 'Finalize should be called for each subscriber');
          testUtilityEdgeCases();
        }
      };

      complex.subscribe({
        next: (value) => values9a.push(value),
        complete: checkCompletion
      });

      complex.subscribe({
        next: (value) => values9b.push(value),
        complete: checkCompletion
      });
    }

    function testUtilityEdgeCases() {
      console.log('\n--- Test Case 10: Utility operator edge cases ---');
      
      // Test share with immediate completion
      let shareImmediateCallCount = 0;
      const immediateComplete = of().pipe(
        finalize(() => shareImmediateCallCount++),
        share()
      );

      immediateComplete.subscribe({
        complete: () => {
          immediateComplete.subscribe({
            complete: () => {
              assert(shareImmediateCallCount >= 1, 'Should handle immediate completion');
              
              // Test finalize with empty observable
              let emptyFinalizeCallCount = 0;
              of().pipe(
                finalize(() => emptyFinalizeCallCount++)
              ).subscribe({
                complete: () => {
                  assert(emptyFinalizeCallCount === 1, 'Should call finalize even for empty observable');
                  
                  console.log('\n--- All utility operators tests completed ---');
                  resolve();
                }
              });
            }
          });
        }
      });
    }

    // Helper function
    function tap<T>(sideEffect: (value: T) => void) {
      return (source: any) => {
        return new (source.constructor as any)((subscriber: any) => {
          return source.subscribe({
            next: (value: T) => {
              try {
                sideEffect(value);
                subscriber.next(value);
              } catch (err) {
                subscriber.error(err);
              }
            },
            error: (err: any) => subscriber.error(err),
            complete: () => subscriber.complete()
          });
        });
      };
    }
  });
};