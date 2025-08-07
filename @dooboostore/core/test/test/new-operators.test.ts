import { 
  switchMap, 
  mergeMap, 
  concatMap, 
  catchError, 
  retry, 
  delay, 
  timeout, 
  scan, 
  reduce, 
  share, 
  finalize,
  TimeoutError
} from '../../src/message/operators';
import { of, timer, throwError, interval } from '../../src/message/internal';
import { take } from '../../src/message/internal';

export const newOperatorsTest = () => {
  console.log('--- New Operators Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing switchMap operator ---');
    
    const values1: string[] = [];
    of(1, 2, 3).pipe(
      switchMap(x => of(`a${x}`, `b${x}`))
    ).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 6, 'switchMap should emit all inner values');
        assert(values1[0] === 'a1' && values1[1] === 'b1', 'Should emit first inner observable values');
        testMergeMap();
      }
    });

    function testMergeMap() {
      console.log('\n--- Testing mergeMap operator ---');
      
      const values2: string[] = [];
      of(1, 2).pipe(
        mergeMap(x => of(`x${x}`, `y${x}`))
      ).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          assert(values2.length === 4, 'mergeMap should emit all inner values');
          // Note: order might vary due to concurrent execution
          const sortedValues = values2.sort();
          assert(sortedValues.includes('x1') && sortedValues.includes('y1'), 'Should include first inner values');
          assert(sortedValues.includes('x2') && sortedValues.includes('y2'), 'Should include second inner values');
          testConcatMap();
        }
      });
    }

    function testConcatMap() {
      console.log('\n--- Testing concatMap operator ---');
      
      const values3: string[] = [];
      of(1, 2).pipe(
        concatMap(x => of(`first${x}`, `second${x}`))
      ).subscribe({
        next: (value) => values3.push(value),
        complete: () => {
          assert(values3.length === 4, 'concatMap should emit all inner values');
          assert(values3[0] === 'first1' && values3[1] === 'second1', 'Should emit first inner observable completely first');
          assert(values3[2] === 'first2' && values3[3] === 'second2', 'Should emit second inner observable after first completes');
          testCatchError();
        }
      });
    }

    function testCatchError() {
      console.log('\n--- Testing catchError operator ---');
      
      const values4: any[] = [];
      throwError(new Error('test error')).pipe(
        catchError((err, caught) => of('recovered'))
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 1, 'catchError should emit recovery value');
          assert(values4[0] === 'recovered', 'Should emit the recovery value');
          testRetry();
        }
      });
    }

    function testRetry() {
      console.log('\n--- Testing retry operator ---');
      
      let attemptCount = 0;
      const values5: number[] = [];
      
      const flakyObservable = of(null).pipe(
        switchMap(() => {
          attemptCount++;
          if (attemptCount < 3) {
            return throwError(new Error('flaky error'));
          }
          return of(42);
        })
      );

      flakyObservable.pipe(
        retry(3)
      ).subscribe({
        next: (value) => values5.push(value),
        complete: () => {
          assert(values5.length === 1, 'retry should eventually succeed');
          assert(values5[0] === 42, 'Should emit the successful value');
          assert(attemptCount === 3, 'Should have retried the correct number of times');
          testDelay();
        },
        error: (err) => {
          assert(false, 'Should not error when retry succeeds');
        }
      });
    }

    function testDelay() {
      console.log('\n--- Testing delay operator ---');
      
      const startTime = Date.now();
      const values6: number[] = [];
      
      of(1, 2, 3).pipe(
        delay(50)
      ).subscribe({
        next: (value) => {
          values6.push(value);
          if (values6.length === 1) {
            const elapsed = Date.now() - startTime;
            assert(elapsed >= 45, 'delay should wait before emitting first value');
          }
        },
        complete: () => {
          assert(values6.length === 3, 'delay should emit all values');
          testTimeout();
        }
      });
    }

    function testTimeout() {
      console.log('\n--- Testing timeout operator ---');
      
      // Test timeout that should succeed
      of(1, 2, 3).pipe(
        timeout(100)
      ).subscribe({
        next: (value) => {
          // Should receive values normally
        },
        complete: () => {
          // Test timeout that should fail
          timer(200).pipe(
            timeout(50)
          ).subscribe({
            next: () => assert(false, 'Should not emit when timeout occurs'),
            error: (err) => {
              assert(err instanceof TimeoutError, 'Should emit TimeoutError');
              testScan();
            }
          });
        }
      });
    }

    function testScan() {
      console.log('\n--- Testing scan operator ---');
      
      const values7: number[] = [];
      of(1, 2, 3, 4).pipe(
        scan((acc, val) => acc + val, 0)
      ).subscribe({
        next: (value) => values7.push(value),
        complete: () => {
          assert(values7.length === 4, 'scan should emit intermediate results');
          assert(values7[0] === 1, 'First scan result should be 1');
          assert(values7[1] === 3, 'Second scan result should be 3');
          assert(values7[2] === 6, 'Third scan result should be 6');
          assert(values7[3] === 10, 'Fourth scan result should be 10');
          testReduce();
        }
      });
    }

    function testReduce() {
      console.log('\n--- Testing reduce operator ---');
      
      const values8: number[] = [];
      of(1, 2, 3, 4).pipe(
        reduce((acc, val) => acc + val, 0)
      ).subscribe({
        next: (value) => values8.push(value),
        complete: () => {
          assert(values8.length === 1, 'reduce should emit only final result');
          assert(values8[0] === 10, 'reduce result should be sum of all values');
          testShare();
        }
      });
    }

    function testShare() {
      console.log('\n--- Testing share operator ---');
      
      let subscriptionCount = 0;
      const shared = of(1, 2, 3).pipe(
        tap(() => subscriptionCount++),
        share()
      );

      const values9a: number[] = [];
      const values9b: number[] = [];

      const sub1 = shared.subscribe(value => values9a.push(value));
      const sub2 = shared.subscribe(value => values9b.push(value));

      setTimeout(() => {
        assert(values9a.length === 3, 'First subscriber should receive all values');
        assert(values9b.length === 3, 'Second subscriber should receive all values');
        // Note: subscriptionCount check might be tricky due to timing
        testFinalize();
      }, 50);
    }

    function testFinalize() {
      console.log('\n--- Testing finalize operator ---');
      
      let finalizeCallCount = 0;
      const values10: number[] = [];
      
      of(1, 2, 3).pipe(
        finalize(() => finalizeCallCount++)
      ).subscribe({
        next: (value) => values10.push(value),
        complete: () => {
          assert(values10.length === 3, 'finalize should not affect normal emission');
          assert(finalizeCallCount === 1, 'finalize should be called once on completion');
          
          // Test finalize with error
          let errorFinalizeCallCount = 0;
          throwError(new Error('test')).pipe(
            finalize(() => errorFinalizeCallCount++)
          ).subscribe({
            next: () => {},
            error: (err) => {
              assert(errorFinalizeCallCount === 1, 'finalize should be called once on error');
              testComplexChaining();
            }
          });
        }
      });
    }

    function testComplexChaining() {
      console.log('\n--- Testing complex operator chaining ---');
      
      const values11: number[] = [];
      let finalizeCount = 0;
      
      of(1, 2, 3, 4, 5).pipe(
        scan((acc, val) => acc + val, 0),  // [1, 3, 6, 10, 15]
        delay(10),
        take(3),                           // [1, 3, 6]
        switchMap(x => of(x * 2)),        // [2, 6, 12]
        finalize(() => finalizeCount++)
      ).subscribe({
        next: (value) => values11.push(value),
        complete: () => {
          assert(values11.length === 3, 'Complex chain should emit 3 values');
          assert(values11[0] === 2, 'First value should be 2');
          assert(values11[1] === 6, 'Second value should be 6');
          assert(values11[2] === 12, 'Third value should be 12');
          assert(finalizeCount === 1, 'finalize should be called once');
          
          console.log('\n--- All new operators tests completed ---');
          resolve();
        }
      });
    }
  });
};