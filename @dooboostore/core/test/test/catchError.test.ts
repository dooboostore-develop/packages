import { catchError } from '../../src/message/operators/catchError';
import { of, throwError } from '../../src/message/internal';

export const catchErrorTest = () => {
  console.log('--- CatchError Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Test Case 1: Basic catchError functionality ---');
    
    const values1: any[] = [];
    throwError(new Error('test error')).pipe(
      catchError((err, caught) => of('recovered'))
    ).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 1, 'Should emit recovery value');
        assert(values1[0] === 'recovered', 'Should emit the correct recovery value');
        testCatchErrorWithValues();
      }
    });

    function testCatchErrorWithValues() {
      console.log('\n--- Test Case 2: CatchError with values before error ---');
      
      const values2: any[] = [];
      of(1, 2, 3).pipe(
        // Simulate an error after emitting some values
        switchMap((x: number) => {
          if (x === 3) {
            return throwError(new Error('error at 3'));
          }
          return of(x);
        }),
        catchError((err, caught) => of('fallback'))
      ).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          assert(values2.length === 3, 'Should emit values before error and fallback');
          assert(values2[0] === 1 && values2[1] === 2, 'Should emit values before error');
          assert(values2[2] === 'fallback', 'Should emit fallback value');
          testCatchErrorRetry();
        }
      });
    }

    function testCatchErrorRetry() {
      console.log('\n--- Test Case 3: CatchError with retry (return caught) ---');
      
      let attemptCount = 0;
      const values3: any[] = [];
      
      const flakySource = of(null).pipe(
        switchMap(() => {
          attemptCount++;
          if (attemptCount < 3) {
            return throwError(new Error(`attempt ${attemptCount}`));
          }
          return of('success');
        })
      );

      flakySource.pipe(
        catchError((err, caught) => {
          if (attemptCount < 3) {
            return caught; // Retry by returning the caught observable
          }
          return of('final fallback');
        })
      ).subscribe({
        next: (value) => values3.push(value),
        complete: () => {
          assert(values3.length === 1, 'Should eventually succeed or fallback');
          assert(values3[0] === 'success', 'Should emit success after retries');
          testCatchErrorChaining();
        }
      });
    }

    function testCatchErrorChaining() {
      console.log('\n--- Test Case 4: CatchError chaining ---');
      
      const values4: any[] = [];
      throwError(new Error('first error')).pipe(
        catchError((err, caught) => {
          if (err.message === 'first error') {
            return throwError(new Error('second error'));
          }
          return of('should not reach');
        }),
        catchError((err, caught) => {
          return of(`caught: ${err.message}`);
        })
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 1, 'Should catch the second error');
          assert(values4[0] === 'caught: second error', 'Should catch and handle second error');
          testCatchErrorSelectorError();
        }
      });
    }

    function testCatchErrorSelectorError() {
      console.log('\n--- Test Case 5: CatchError selector throws error ---');
      
      let errorReceived = false;
      throwError(new Error('original error')).pipe(
        catchError((err, caught) => {
          throw new Error('selector error');
        })
      ).subscribe({
        next: () => assert(false, 'Should not emit next when selector throws'),
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'selector error', 'Should propagate selector error');
          testCatchErrorNoError();
        }
      });
    }

    function testCatchErrorNoError() {
      console.log('\n--- Test Case 6: CatchError with no error ---');
      
      const values6: number[] = [];
      of(1, 2, 3).pipe(
        catchError((err, caught) => of(999)) // Should not be called
      ).subscribe({
        next: (value) => values6.push(value),
        complete: () => {
          assert(values6.length === 3, 'Should emit all values when no error');
          assert(values6[0] === 1 && values6[1] === 2 && values6[2] === 3, 'Should emit original values');
          
          console.log('\n--- All catchError tests completed ---');
          resolve();
        }
      });
    }

    // Helper function for switchMap (simplified version)
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
            complete: () => {} // Don't complete until inner completes
          });
        });
      };
    }
  });
};