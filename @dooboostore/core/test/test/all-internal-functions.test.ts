import { 
  // Observable creation functions
  timer, 
  of, 
  fromArray, 
  fromPromise, 
  empty, 
  never, 
  throwError, 
  range, 
  defer,
  interval,
  
  // Utility functions
  firstValueFrom,
  lastValueFrom,
  concat, 
  merge,
  
  // Operator functions
  skip, 
  takeWhile, 
  startWith,
  take
} from '@dooboostore/core/message/internal';
import { map } from '@dooboostore/core/message/operators/map';

export const allInternalFunctionsTest = () => {
  console.log('--- All Internal Functions Comprehensive Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n=== OBSERVABLE CREATION FUNCTIONS ===');

    // Test timer function
    console.log('\n--- Testing timer function ---');
    testTimer().then(() => {
      testOf();
    });

    function testTimer() {
      return new Promise<void>((resolveTimer) => {
        console.log('Test Case: Timer with initial delay only');
        const startTime = Date.now();
        timer(30).subscribe({
          next: (value) => {
            const elapsed = Date.now() - startTime;
            assert(value === 0, 'Timer should emit 0 as first value');
            assert(elapsed >= 25, 'Timer should respect initial delay');
          },
          complete: () => {
            console.log('Test Case: Timer with period');
            const values: number[] = [];
            const subscription = timer(20, 15).subscribe({
              next: (value) => {
                values.push(value);
                if (values.length === 3) {
                  subscription.unsubscribe();
                  assert(values.length === 3, 'Timer with period should emit multiple values');
                  assert(values[0] === 0 && values[1] === 1 && values[2] === 2, 'Timer should emit sequential numbers');
                  resolveTimer();
                }
              }
            });
          }
        });
      });
    }

    function testOf() {
      console.log('\n--- Testing of function ---');
      console.log('Test Case: of with multiple types');
      const values: any[] = [];
      of(1, 'hello' as any, true, null, { test: 'object' }).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 5, 'of should emit all provided values');
          assert(values[0] === 1, 'First value should be 1');
          assert(values[1] === 'hello', 'Second value should be "hello"');
          assert(values[2] === true, 'Third value should be true');
          assert(values[3] === null, 'Fourth value should be null');
          assert(values[4].test === 'object', 'Fifth value should be object');
          
          console.log('Test Case: of with no arguments');
          const emptyValues: any[] = [];
          of().subscribe({
            next: (value) => emptyValues.push(value),
            complete: () => {
              assert(emptyValues.length === 0, 'of() with no args should emit no values');
              testFromArray();
            }
          });
        }
      });
    }

    function testFromArray() {
      console.log('\n--- Testing fromArray function ---');
      console.log('Test Case: fromArray with various types');
      const values: any[] = [];
      fromArray([10, 'test', { key: 'value' }, [1, 2, 3]]).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 4, 'fromArray should emit all array elements');
          assert(values[0] === 10, 'First element should be 10');
          assert(values[1] === 'test', 'Second element should be "test"');
          assert(values[2].key === 'value', 'Third element should be object');
          assert(Array.isArray(values[3]), 'Fourth element should be array');
          
          console.log('Test Case: fromArray with empty array');
          const emptyValues: any[] = [];
          fromArray([]).subscribe({
            next: (value) => emptyValues.push(value),
            complete: () => {
              assert(emptyValues.length === 0, 'fromArray([]) should emit no values');
              testFromPromise();
            }
          });
        }
      });
    }

    function testFromPromise() {
      console.log('\n--- Testing fromPromise function ---');
      console.log('Test Case: fromPromise with resolved promise');
      const resolvedPromise = Promise.resolve('resolved value');
      fromPromise(resolvedPromise).subscribe({
        next: (value) => {
          assert(value === 'resolved value', 'Should emit resolved promise value');
        },
        complete: () => {
          console.log('Test Case: fromPromise with rejected promise');
          const rejectedPromise = Promise.reject(new Error('test rejection'));
          fromPromise(rejectedPromise).subscribe({
            next: () => assert(false, 'Should not emit next for rejected promise'),
            error: (err) => {
              assert(err.message === 'test rejection', 'Should emit error from rejected promise');
              testEmpty();
            }
          });
        }
      });
    }

    function testEmpty() {
      console.log('\n--- Testing empty function ---');
      console.log('Test Case: empty observable');
      let nextCalled = false;
      let completeCalled = false;
      empty().subscribe({
        next: () => nextCalled = true,
        complete: () => {
          completeCalled = true;
          assert(!nextCalled, 'Empty should not emit any values');
          assert(completeCalled, 'Empty should complete immediately');
          testNever();
        }
      });
    }

    function testNever() {
      console.log('\n--- Testing never function ---');
      console.log('Test Case: never observable');
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
        assert(!nextCalled, 'Never should not emit any values');
        assert(!completeCalled, 'Never should not complete');
        assert(!errorCalled, 'Never should not error');
        testThrowError();
      }, 50);
    }

    function testThrowError() {
      console.log('\n--- Testing throwError function ---');
      console.log('Test Case: throwError observable');
      const testError = new Error('Test error message');
      let nextCalled = false;
      let completeCalled = false;
      throwError(testError).subscribe({
        next: () => nextCalled = true,
        complete: () => completeCalled = true,
        error: (err) => {
          assert(!nextCalled, 'throwError should not emit any values');
          assert(!completeCalled, 'throwError should not complete');
          assert(err === testError, 'Should emit the specified error');
          assert(err.message === 'Test error message', 'Error message should match');
          testRange();
        }
      });
    }

    function testRange() {
      console.log('\n--- Testing range function ---');
      console.log('Test Case: range with positive count');
      const values: number[] = [];
      range(5, 4).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 4, 'Range should emit specified count of values');
          assert(values[0] === 5, 'First value should be start value');
          assert(values[1] === 6, 'Second value should be start + 1');
          assert(values[2] === 7, 'Third value should be start + 2');
          assert(values[3] === 8, 'Fourth value should be start + 3');
          
          console.log('Test Case: range with zero count');
          let nextCalled = false;
          range(10, 0).subscribe({
            next: () => nextCalled = true,
            complete: () => {
              assert(!nextCalled, 'Range with zero count should not emit values');
              
              console.log('Test Case: range with negative count');
              let nextCalled2 = false;
              range(1, -5).subscribe({
                next: () => nextCalled2 = true,
                complete: () => {
                  assert(!nextCalled2, 'Range with negative count should not emit values');
                  testDefer();
                }
              });
            }
          });
        }
      });
    }

    function testDefer() {
      console.log('\n--- Testing defer function ---');
      console.log('Test Case: defer with observable factory');
      let factoryCallCount = 0;
      const deferredObservable = defer(() => {
        factoryCallCount++;
        return of(`call-${factoryCallCount}`);
      });

      deferredObservable.subscribe({
        next: (value) => {
          assert(value === 'call-1', 'First subscription should get call-1');
          assert(factoryCallCount === 1, 'Factory should be called once for first subscription');
        },
        complete: () => {
          deferredObservable.subscribe({
            next: (value) => {
              assert(value === 'call-2', 'Second subscription should get call-2');
              assert(factoryCallCount === 2, 'Factory should be called twice total');
            },
            complete: () => {
              console.log('Test Case: defer with promise factory');
              const deferredPromise = defer(() => Promise.resolve('promise-result'));
              deferredPromise.subscribe({
                next: (value) => {
                  assert(value === 'promise-result', 'Should emit promise resolved value');
                },
                complete: () => {
                  console.log('Test Case: defer with factory error');
                  const deferredError = defer(() => {
                    throw new Error('Factory error');
                  });
                  deferredError.subscribe({
                    next: () => assert(false, 'Should not emit next when factory throws'),
                    error: (err) => {
                      assert(err.message === 'Factory error', 'Should emit factory error');
                      testUtilityFunctions();
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    function testUtilityFunctions() {
      console.log('\n=== UTILITY FUNCTIONS ===');
      
      console.log('\n--- Testing firstValueFrom function ---');
      console.log('Test Case: firstValueFrom with multiple values');
      const observable = of(1, 2, 3, 4, 5);
      firstValueFrom(observable).then((value) => {
        assert(value === 1, 'firstValueFrom should resolve with first value');
        
        console.log('Test Case: firstValueFrom with empty observable and default');
        firstValueFrom(empty(), { defaultValue: 'default-value' }).then((value) => {
          assert(value === 'default-value', 'Should use default value for empty observable');
          
          console.log('Test Case: firstValueFrom with empty observable no default');
          firstValueFrom(empty()).catch((err) => {
            assert(err.name === 'EmptyError', 'Should reject with EmptyError for empty observable');
            testLastValueFrom();
          });
        });
      });
    }

    function testLastValueFrom() {
      console.log('\n--- Testing lastValueFrom function ---');
      console.log('Test Case: lastValueFrom with multiple values');
      const observable = of(10, 20, 30, 40);
      lastValueFrom(observable).then((value) => {
        assert(value === 40, 'lastValueFrom should resolve with last value');
        
        console.log('Test Case: lastValueFrom with single value');
        lastValueFrom(of('single')).then((value) => {
          assert(value === 'single', 'Should resolve with single value');
          
          console.log('Test Case: lastValueFrom with empty and default');
          lastValueFrom(empty(), { defaultValue: 'last-default' }).then((value) => {
            assert(value === 'last-default', 'Should use default value for empty observable');
            testConcat();
          });
        });
      });
    }

    function testConcat() {
      console.log('\n--- Testing concat function ---');
      console.log('Test Case: concat multiple observables');
      const values: number[] = [];
      concat(
        of(1, 2),
        of(3, 4),
        range(5, 2)
      ).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 6, 'Concat should emit all values sequentially');
          assert(values[0] === 1 && values[1] === 2, 'First observable values should come first');
          assert(values[2] === 3 && values[3] === 4, 'Second observable values should come second');
          assert(values[4] === 5 && values[5] === 6, 'Third observable values should come last');
          
          console.log('Test Case: concat with empty observables');
          const emptyValues: number[] = [];
          concat(empty(), of(1), empty(), of(2)).subscribe({
            next: (value) => emptyValues.push(value),
            complete: () => {
              assert(emptyValues.length === 2, 'Should skip empty observables');
              assert(emptyValues[0] === 1 && emptyValues[1] === 2, 'Should emit non-empty values');
              testMerge();
            }
          });
        }
      });
    }

    function testMerge() {
      console.log('\n--- Testing merge function ---');
      console.log('Test Case: merge multiple observables');
      const values: number[] = [];
      merge(
        of(1, 3, 5),
        of(2, 4, 6)
      ).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 6, 'Merge should emit all values from all sources');
          const sortedValues = values.sort();
          for (let i = 1; i <= 6; i++) {
            assert(sortedValues[i-1] === i, `Should contain value ${i}`);
          }
          
          console.log('Test Case: merge with empty array');
          let nextCalled = false;
          merge().subscribe({
            next: () => nextCalled = true,
            complete: () => {
              assert(!nextCalled, 'Merge with no observables should complete immediately');
              testOperatorFunctions();
            }
          });
        }
      });
    }

    function testOperatorFunctions() {
      console.log('\n=== OPERATOR FUNCTIONS ===');
      
      console.log('\n--- Testing skip operator ---');
      console.log('Test Case: skip with normal count');
      const values1: number[] = [];
      range(1, 10).pipe(
        skip(3)
      ).subscribe({
        next: (value) => values1.push(value),
        complete: () => {
          assert(values1.length === 7, 'Should skip first 3 values');
          assert(values1[0] === 4, 'First emitted value should be 4');
          assert(values1[6] === 10, 'Last emitted value should be 10');
          
          console.log('Test Case: skip more than available');
          const values2: number[] = [];
          of(1, 2, 3).pipe(
            skip(5)
          ).subscribe({
            next: (value) => values2.push(value),
            complete: () => {
              assert(values2.length === 0, 'Should emit no values when skipping more than available');
              testTakeWhile();
            }
          });
        }
      });
    }

    function testTakeWhile() {
      console.log('\n--- Testing takeWhile operator ---');
      console.log('Test Case: takeWhile with predicate');
      const values1: number[] = [];
      range(1, 10).pipe(
        takeWhile(x => x <= 5)
      ).subscribe({
        next: (value) => values1.push(value),
        complete: () => {
          assert(values1.length === 5, 'Should take while condition is true');
          assert(values1[0] === 1 && values1[4] === 5, 'Should take values 1 through 5');
          
          console.log('Test Case: takeWhile with inclusive');
          const values2: number[] = [];
          range(1, 10).pipe(
            takeWhile(x => x <= 5, true)
          ).subscribe({
            next: (value) => values2.push(value),
            complete: () => {
              assert(values2.length === 6, 'Should include the value that failed predicate');
              assert(values2[5] === 6, 'Should include the failing value');
              
              console.log('Test Case: takeWhile with index');
              const values3: number[] = [];
              of('a', 'b', 'c', 'd', 'e').pipe(
                takeWhile((value, index) => index < 3)
              ).subscribe({
                next: (value) => values3.push(value as any),
                complete: () => {
                  assert(values3.length === 3, 'Should use index in predicate');
                  testStartWith();
                }
              });
            }
          });
        }
      });
    }

    function testStartWith() {
      console.log('\n--- Testing startWith operator ---');
      console.log('Test Case: startWith single value');
      const values1: any[] = [];
      of('world').pipe(
        startWith('hello')
      ).subscribe({
        next: (value) => values1.push(value),
        complete: () => {
          assert(values1.length === 2, 'Should emit starting value first');
          assert(values1[0] === 'hello', 'First value should be from startWith');
          assert(values1[1] === 'world', 'Second value should be from source');
          
          console.log('Test Case: startWith multiple values');
          const values2: any[] = [];
          of(4, 5).pipe(
            startWith(1, 2, 3)
          ).subscribe({
            next: (value) => values2.push(value),
            complete: () => {
              assert(values2.length === 5, 'Should emit all starting values first');
              assert(values2[0] === 1 && values2[1] === 2 && values2[2] === 3, 'Starting values should come first');
              assert(values2[3] === 4 && values2[4] === 5, 'Source values should come after');
              testComplexChaining();
            }
          });
        }
      });
    }

    function testComplexChaining() {
      console.log('\n=== COMPLEX OPERATOR CHAINING ===');
      
      console.log('Test Case: Complex chaining with multiple operators');
      const values: number[] = [];
      range(0, 20).pipe(
        skip(5),                    // Skip first 5: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]
        takeWhile(x => x < 15),     // Take while < 15: [5,6,7,8,9,10,11,12,13,14]
        map(x => x * 2),            // Multiply by 2: [10,12,14,16,18,20,22,24,26,28]
        take(5),                    // Take first 5: [10,12,14,16,18]
        startWith(0, 2)             // Start with 0,2: [0,2,10,12,14,16,18]
      ).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 7, 'Complex chaining should produce correct number of values');
          assert(values[0] === 0 && values[1] === 2, 'Should start with specified values');
          assert(values[2] === 10, 'First processed value should be 10');
          assert(values[6] === 18, 'Last value should be 18');
          
          console.log('Test Case: Chaining with async operations');
          testAsyncChaining();
        }
      });
    }

    function testAsyncChaining() {
      console.log('Test Case: Async chaining with timer and operators');
      const values: number[] = [];
      timer(10, 15).pipe(
        take(5),
        map(x => x + 100),
        skip(1),
        startWith(99)
      ).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          assert(values.length === 5, 'Async chaining should work correctly');
          assert(values[0] === 99, 'Should start with 99');
          assert(values[1] === 101, 'Second value should be 101 (1+100)');
          assert(values[4] === 104, 'Last value should be 104 (4+100)');
          
          console.log('Test Case: Error handling in chains');
          testErrorHandling();
        }
      });
    }

    function testErrorHandling() {
      console.log('Test Case: Error propagation through operator chains');
      let errorReceived = false;
      throwError(new Error('Chain error')).pipe(
        map(x => x * 2),
        take(5),
        startWith<string>('start')
      ).subscribe({
        next: (value) => {
          assert(value === 'start', 'Should emit startWith value before error');
        },
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'Chain error', 'Error should propagate through chain');
          
          console.log('\n=== INTEGRATION TESTS ===');
          testIntegrationScenarios();
        }
      });
    }

    function testIntegrationScenarios() {
      console.log('Test Case: Real-world scenario - Data processing pipeline');
      const processedData: any[] = [];
      
      // Simulate processing a stream of user data
      fromArray([
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 17 },
        { id: 3, name: 'Charlie', age: 30 },
        { id: 4, name: 'Diana', age: 16 },
        { id: 5, name: 'Eve', age: 28 }
      ]).pipe(
        // Filter adults only (age >= 18)
        takeWhile((user, index) => index < 10), // Safety limit
        map(user => ({ ...user, isAdult: user.age >= 18 })),
        // Skip first user for some reason
        skip(1),
        // Add a welcome message
        startWith({ id: 0, name: 'Welcome', age: 0, isAdult: false })
      ).subscribe({
        next: (data) => processedData.push(data),
        complete: () => {
          assert(processedData.length === 5, 'Should process correct number of items');
          assert(processedData[0].name === 'Welcome', 'Should start with welcome message');
          assert(processedData[1].name === 'Bob', 'Should skip Alice and start with Bob');
          assert(processedData[2].isAdult === true, 'Charlie should be marked as adult');
          assert(processedData[3].isAdult === false, 'Diana should be marked as not adult');
          
          console.log('\n--- All comprehensive tests completed successfully! ---');
          resolve();
        }
      });
    }
  });
};