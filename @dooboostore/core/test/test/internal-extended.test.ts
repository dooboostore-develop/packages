import { 
  timer, 
  of, 
  fromArray, 
  fromPromise, 
  empty, 
  never, 
  throwError, 
  firstValueFrom, 
  range, 
  defer 
} from '../../src/message/internal';

export const internalExtendedTest = () => {
  console.log('--- Internal Extended Functions Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing timer function ---');

    // Test Case 1: Timer with initial delay only
    console.log('\n--- Test Case 1: Timer with initial delay only ---');
    const startTime1 = Date.now();
    timer(50).subscribe({
      next: (value) => {
        const elapsed = Date.now() - startTime1;
        assert(value === 0, 'Timer should emit 0 as first value');
        assert(elapsed >= 45, 'Timer should wait for initial delay');
      },
      complete: () => {
        console.log('\n--- Test Case 2: Timer with period ---');
        const values2: number[] = [];
        const subscription2 = timer(30, 20).subscribe({
          next: (value) => {
            values2.push(value);
            if (values2.length === 3) {
              subscription2.unsubscribe();
              assert(values2.length === 3, 'Should receive 3 values');
              assert(values2[0] === 0, 'First value should be 0');
              assert(values2[1] === 1, 'Second value should be 1');
              assert(values2[2] === 2, 'Third value should be 2');
              testOfFunction();
            }
          }
        });
      }
    });

    function testOfFunction() {
      console.log('\n--- Testing of function ---');

      // Test Case 3: of with multiple values
      console.log('\n--- Test Case 3: of with multiple values ---');
      const values3: any[] = [];
      of(1, 'hello' as any, true, { test: 'object' }).subscribe({
        next: (value) => values3.push(value),
        complete: () => {
          assert(values3.length === 4, 'Should emit 4 values');
          assert(values3[0] === 1, 'First value should be 1');
          assert(values3[1] === 'hello', 'Second value should be "hello"');
          assert(values3[2] === true, 'Third value should be true');
          assert(values3[3].test === 'object', 'Fourth value should be object');
          testFromArrayFunction();
        }
      });
    }

    function testFromArrayFunction() {
      console.log('\n--- Testing fromArray function ---');

      // Test Case 4: fromArray with array
      console.log('\n--- Test Case 4: fromArray with array ---');
      const values4: number[] = [];
      fromArray([10, 20, 30]).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 3, 'Should emit 3 values from array');
          assert(values4[0] === 10, 'First value should be 10');
          assert(values4[1] === 20, 'Second value should be 20');
          assert(values4[2] === 30, 'Third value should be 30');
          testFromPromiseFunction();
        }
      });
    }

    function testFromPromiseFunction() {
      console.log('\n--- Testing fromPromise function ---');

      // Test Case 5: fromPromise with resolved promise
      console.log('\n--- Test Case 5: fromPromise with resolved promise ---');
      const resolvedPromise = Promise.resolve('resolved value');
      fromPromise(resolvedPromise).subscribe({
        next: (value) => {
          assert(value === 'resolved value', 'Should emit resolved promise value');
        },
        complete: () => {
          // Test Case 6: fromPromise with rejected promise
          console.log('\n--- Test Case 6: fromPromise with rejected promise ---');
          const rejectedPromise = Promise.reject(new Error('rejected'));
          fromPromise(rejectedPromise).subscribe({
            next: () => assert(false, 'Should not emit next for rejected promise'),
            error: (err) => {
              assert(err.message === 'rejected', 'Should emit error from rejected promise');
              testEmptyFunction();
            }
          });
        }
      });
    }

    function testEmptyFunction() {
      console.log('\n--- Testing empty function ---');

      // Test Case 7: empty observable
      console.log('\n--- Test Case 7: empty observable ---');
      let nextCalled = false;
      empty().subscribe({
        next: () => nextCalled = true,
        complete: () => {
          assert(!nextCalled, 'Empty should not emit any values');
          testThrowErrorFunction();
        }
      });
    }

    function testThrowErrorFunction() {
      console.log('\n--- Testing throwError function ---');

      // Test Case 8: throwError observable
      console.log('\n--- Test Case 8: throwError observable ---');
      const testError = new Error('Test error');
      let nextCalled = false;
      throwError(testError).subscribe({
        next: () => nextCalled = true,
        error: (err) => {
          assert(!nextCalled, 'throwError should not emit any values');
          assert(err === testError, 'Should emit the specified error');
          testFirstValueFromFunction();
        }
      });
    }

    function testFirstValueFromFunction() {
      console.log('\n--- Testing firstValueFrom function ---');

      // Test Case 9: firstValueFrom with multiple values
      console.log('\n--- Test Case 9: firstValueFrom with multiple values ---');
      const observable9 = of(1, 2, 3);
      firstValueFrom(observable9).then((value) => {
        assert(value === 1, 'firstValueFrom should resolve with first value');

        // Test Case 10: firstValueFrom with empty observable and default
        console.log('\n--- Test Case 10: firstValueFrom with empty and default ---');
        firstValueFrom(empty(), { defaultValue: 'default' }).then((value) => {
          assert(value === 'default', 'Should use default value for empty observable');
          testRangeFunction();
        });
      });
    }

    function testRangeFunction() {
      console.log('\n--- Testing range function ---');

      // Test Case 11: range function
      console.log('\n--- Test Case 11: range function ---');
      const values11: number[] = [];
      range(5, 3).subscribe({
        next: (value) => values11.push(value),
        complete: () => {
          assert(values11.length === 3, 'Should emit 3 values');
          assert(values11[0] === 5, 'First value should be 5');
          assert(values11[1] === 6, 'Second value should be 6');
          assert(values11[2] === 7, 'Third value should be 7');

          // Test Case 12: range with zero count
          console.log('\n--- Test Case 12: range with zero count ---');
          let nextCalled12 = false;
          range(1, 0).subscribe({
            next: () => nextCalled12 = true,
            complete: () => {
              assert(!nextCalled12, 'Range with zero count should not emit values');
              testDeferFunction();
            }
          });
        }
      });
    }

    function testDeferFunction() {
      console.log('\n--- Testing defer function ---');

      // Test Case 13: defer with observable factory
      console.log('\n--- Test Case 13: defer with observable factory ---');
      let factoryCallCount = 0;
      const deferredObservable = defer(() => {
        factoryCallCount++;
        return of(`call-${factoryCallCount}`);
      });

      deferredObservable.subscribe({
        next: (value) => {
          assert(value === 'call-1', 'First subscription should get call-1');
        },
        complete: () => {
          deferredObservable.subscribe({
            next: (value) => {
              assert(value === 'call-2', 'Second subscription should get call-2');
              assert(factoryCallCount === 2, 'Factory should be called twice');
            },
            complete: () => {
              // Test Case 14: defer with promise factory
              console.log('\n--- Test Case 14: defer with promise factory ---');
              const deferredPromise = defer(() => Promise.resolve('promise-value'));
              deferredPromise.subscribe({
                next: (value) => {
                  assert(value === 'promise-value', 'Should emit promise value');
                },
                complete: () => {
                  console.log('\n--- All internal extended tests completed ---');
                  resolve();
                }
              });
            }
          });
        }
      });
    }
  });
};