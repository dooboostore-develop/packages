import { retry } from '../../src/message/operators/retry';
import { of, throwError } from '../../src/message/internal';

export const retryTest = () => {
  console.log('--- Retry Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Test Case 1: Retry with eventual success ---');
    
    let attemptCount1 = 0;
    const values1: string[] = [];
    
    const flakyObservable1 = of(null).pipe(
      switchMap(() => {
        attemptCount1++;
        if (attemptCount1 < 3) {
          return throwError(new Error(`Attempt ${attemptCount1} failed`));
        }
        return of('success');
      })
    );

    flakyObservable1.pipe(
      retry(3)
    ).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 1, 'Should emit success value');
        assert(values1[0] === 'success', 'Should emit the success value');
        assert(attemptCount1 === 3, 'Should have attempted 3 times');
        testRetryExhaustion();
      },
      error: () => {
        assert(false, 'Should not error when retry succeeds');
      }
    });

    function testRetryExhaustion() {
      console.log('\n--- Test Case 2: Retry exhaustion ---');
      
      let attemptCount2 = 0;
      let errorReceived = false;
      
      const alwaysFailObservable = of(null).pipe(
        switchMap(() => {
          attemptCount2++;
          return throwError(new Error(`Attempt ${attemptCount2} failed`));
        })
      );

      alwaysFailObservable.pipe(
        retry(2)
      ).subscribe({
        next: () => assert(false, 'Should not emit when all retries fail'),
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'Attempt 3 failed', 'Should emit the final error');
          assert(attemptCount2 === 3, 'Should have attempted 3 times (1 initial + 2 retries)');
          testRetryZero();
        }
      });
    }

    function testRetryZero() {
      console.log('\n--- Test Case 3: Retry with count 0 ---');
      
      let attemptCount3 = 0;
      let errorReceived = false;
      
      const failObservable = of(null).pipe(
        switchMap(() => {
          attemptCount3++;
          return throwError(new Error('Immediate failure'));
        })
      );

      failObservable.pipe(
        retry(0)
      ).subscribe({
        next: () => assert(false, 'Should not emit when retry count is 0'),
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'Immediate failure', 'Should emit the error immediately');
          assert(attemptCount3 === 1, 'Should have attempted only once');
          testRetryWithValues();
        }
      });
    }

    function testRetryWithValues() {
      console.log('\n--- Test Case 4: Retry with values before error ---');
      
      let attemptCount4 = 0;
      const values4: any[] = [];
      
      const partialSuccessObservable = of(null).pipe(
        switchMap(() => {
          attemptCount4++;
          return of(1, 2).pipe(
            switchMap((x, index) => {
              if (x === 2 && attemptCount4 < 2) {
                return throwError(new Error(`Error at value ${x}, attempt ${attemptCount4}`));
              }
              return of(x);
            })
          );
        })
      );

      partialSuccessObservable.pipe(
        retry(2)
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          // On retry, the entire observable is resubscribed, so we get all values again
          assert(values4.length === 4, 'Should emit values from successful attempt');
          assert(values4[0] === 1 && values4[1] === 2, 'Should emit first attempt values');
          assert(values4[2] === 1 && values4[3] === 2, 'Should emit second attempt values');
          testRetryNoError();
        }
      });
    }

    function testRetryNoError() {
      console.log('\n--- Test Case 5: Retry with no error ---');
      
      const values5: number[] = [];
      
      of(1, 2, 3).pipe(
        retry(3)
      ).subscribe({
        next: (value) => values5.push(value),
        complete: () => {
          assert(values5.length === 3, 'Should emit all values when no error occurs');
          assert(values5[0] === 1 && values5[1] === 2 && values5[2] === 3, 'Should emit correct values');
          testRetryUnsubscribe();
        }
      });
    }

    function testRetryUnsubscribe() {
      console.log('\n--- Test Case 6: Retry unsubscribe behavior ---');
      
      let attemptCount6 = 0;
      const values6: any[] = [];
      
      const slowFailObservable = of(null).pipe(
        switchMap(() => {
          attemptCount6++;
          return new (of(null).constructor as any)((subscriber: any) => {
            const timeoutId = setTimeout(() => {
              subscriber.error(new Error(`Delayed error ${attemptCount6}`));
            }, 100);
            
            return () => clearTimeout(timeoutId);
          });
        })
      );

      const subscription = slowFailObservable.pipe(
        retry(5)
      ).subscribe({
        next: (value) => values6.push(value),
        error: () => assert(false, 'Should not error after unsubscribe')
      });

      // Unsubscribe before error occurs
      setTimeout(() => {
        subscription.unsubscribe();
        
        setTimeout(() => {
          assert(values6.length === 0, 'Should not emit after unsubscribe');
          assert(attemptCount6 === 1, 'Should not retry after unsubscribe');
          
          console.log('\n--- All retry tests completed ---');
          resolve();
        }, 150);
      }, 50);
    }

    // Helper function for switchMap (simplified version)
    function switchMap<T, R>(project: (value: T, index?: number) => any) {
      return (source: any) => {
        return new (source.constructor as any)((subscriber: any) => {
          let index = 0;
          return source.subscribe({
            next: (value: T) => {
              try {
                const inner = project(value, index++);
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
            complete: () => {} // Don't complete until inner completes
          });
        });
      };
    }
  });
};