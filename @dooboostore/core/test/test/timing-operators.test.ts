import { delay, timeout, TimeoutError } from '../../src/message/operators';
import { of, timer, interval } from '../../src/message/internal';
import { take } from '../../src/message/internal';

export const timingOperatorsTest = () => {
  console.log('--- Timing Operators Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Test Case 1: Basic delay functionality ---');
    
    const startTime1 = Date.now();
    const values1: number[] = [];
    
    of(1, 2, 3).pipe(
      delay(100)
    ).subscribe({
      next: (value) => {
        values1.push(value);
        if (values1.length === 1) {
          const elapsed = Date.now() - startTime1;
          assert(elapsed >= 95, 'First value should be delayed by at least 100ms');
        }
      },
      complete: () => {
        assert(values1.length === 3, 'All values should be emitted after delay');
        assert(values1[0] === 1 && values1[1] === 2 && values1[2] === 3, 'Values should be correct');
        testDelayError();
      }
    });

    function testDelayError() {
      console.log('\n--- Test Case 2: Delay with error ---');
      
      const startTime2 = Date.now();
      let errorReceived = false;
      
      of(1).pipe(
        // Simulate error after first emission
        switchMap(x => {
          if (x === 1) {
            return throwError(new Error('delayed error'));
          }
          return of(x);
        }),
        delay(50)
      ).subscribe({
        next: () => assert(false, 'Should not emit next when error occurs'),
        error: (err) => {
          const elapsed = Date.now() - startTime2;
          errorReceived = true;
          assert(elapsed >= 45, 'Error should also be delayed');
          assert(err.message === 'delayed error', 'Should propagate the error');
          testDelayComplete();
        }
      });
    }

    function testDelayComplete() {
      console.log('\n--- Test Case 3: Delay completion ---');
      
      const startTime3 = Date.now();
      let completed = false;
      
      of(1).pipe(
        delay(75)
      ).subscribe({
        next: () => {},
        complete: () => {
          const elapsed = Date.now() - startTime3;
          completed = true;
          assert(elapsed >= 70, 'Completion should also be delayed');
          testDelayUnsubscribe();
        }
      });
    }

    function testDelayUnsubscribe() {
      console.log('\n--- Test Case 4: Delay unsubscribe cleanup ---');
      
      const values4: number[] = [];
      const subscription = of(1, 2, 3).pipe(
        delay(100)
      ).subscribe({
        next: (value) => values4.push(value)
      });

      // Unsubscribe before delay completes
      setTimeout(() => {
        subscription.unsubscribe();
        
        setTimeout(() => {
          assert(values4.length === 0, 'Should not emit after unsubscribe');
          testTimeoutSuccess();
        }, 150);
      }, 50);
    }

    function testTimeoutSuccess() {
      console.log('\n--- Test Case 5: Timeout with fast emission ---');
      
      const values5: number[] = [];
      of(1, 2, 3).pipe(
        timeout(100)
      ).subscribe({
        next: (value) => values5.push(value),
        complete: () => {
          assert(values5.length === 3, 'Should emit all values when within timeout');
          testTimeoutFailure();
        },
        error: () => assert(false, 'Should not timeout for fast emissions')
      });
    }

    function testTimeoutFailure() {
      console.log('\n--- Test Case 6: Timeout with slow emission ---');
      
      let timeoutErrorReceived = false;
      timer(200).pipe(
        timeout(100)
      ).subscribe({
        next: () => assert(false, 'Should not emit when timeout occurs'),
        error: (err) => {
          timeoutErrorReceived = true;
          assert(err instanceof TimeoutError, 'Should emit TimeoutError');
          assert(err.message.includes('Timeout'), 'Error message should mention timeout');
          testTimeoutReset();
        }
      });
    }

    function testTimeoutReset() {
      console.log('\n--- Test Case 7: Timeout reset on each emission ---');
      
      const values7: number[] = [];
      interval(50).pipe(
        take(3),
        timeout(100) // Each emission resets the timeout
      ).subscribe({
        next: (value) => values7.push(value),
        complete: () => {
          assert(values7.length === 3, 'Should complete normally when emissions are frequent enough');
          testTimeoutUnsubscribe();
        },
        error: () => assert(false, 'Should not timeout when emissions are frequent')
      });
    }

    function testTimeoutUnsubscribe() {
      console.log('\n--- Test Case 8: Timeout unsubscribe cleanup ---');
      
      const subscription = timer(200).pipe(
        timeout(300)
      ).subscribe({
        next: () => {},
        error: () => assert(false, 'Should not timeout after unsubscribe')
      });

      // Unsubscribe before timeout
      setTimeout(() => {
        subscription.unsubscribe();
        
        setTimeout(() => {
          // If we reach here without timeout error, cleanup worked
          testCombinedTimingOperators();
        }, 250);
      }, 100);
    }

    function testCombinedTimingOperators() {
      console.log('\n--- Test Case 9: Combined delay and timeout ---');
      
      const startTime9 = Date.now();
      const values9: number[] = [];
      
      of(1, 2, 3).pipe(
        delay(50),
        timeout(200) // Should be enough time even with delay
      ).subscribe({
        next: (value) => {
          values9.push(value);
          if (values9.length === 1) {
            const elapsed = Date.now() - startTime9;
            assert(elapsed >= 45, 'Should respect delay even with timeout');
          }
        },
        complete: () => {
          assert(values9.length === 3, 'Should complete successfully with both operators');
          testTimingEdgeCases();
        },
        error: () => assert(false, 'Should not timeout with sufficient time')
      });
    }

    function testTimingEdgeCases() {
      console.log('\n--- Test Case 10: Timing edge cases ---');
      
      // Test delay with 0ms
      const values10a: number[] = [];
      of(1, 2).pipe(
        delay(0)
      ).subscribe({
        next: (value) => values10a.push(value),
        complete: () => {
          assert(values10a.length === 2, 'Zero delay should still emit all values');
          
          // Test timeout with 0ms (should timeout immediately)
          let immediateTimeoutReceived = false;
          timer(10).pipe(
            timeout(0)
          ).subscribe({
            next: () => assert(false, 'Should timeout immediately with 0ms timeout'),
            error: (err) => {
              immediateTimeoutReceived = true;
              assert(err instanceof TimeoutError, 'Should timeout immediately');
              
              console.log('\n--- All timing operators tests completed ---');
              resolve();
            }
          });
        }
      });
    }

    // Helper functions
    function switchMap<T, R>(project: (value: T) => any) {
      return (source: any) => {
        return new (source.constructor as any)((subscriber: any) => {
          return source.subscribe({
            next: (value: T) => {
              try {
                const inner = project(value);
                inner.subscribe({
                  next: (innerValue: R) => subscriber.next(innerValue),
                  error: (err: any) => subscriber.error(err),
                  complete: () => subscriber.complete()
                });
              } catch (err) {
                subscriber.error(err);
              }
            },
            error: (err: any) => subscriber.error(err),
            complete: () => {}
          });
        });
      };
    }

    function throwError(error: any) {
      return new (of(null).constructor as any)((subscriber: any) => {
        subscriber.error(error);
      });
    }
  });
};