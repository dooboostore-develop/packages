import { Observable } from '../../src/message/Observable';
import { Subject } from '../../src/message/Subject';
import { BehaviorSubject } from '../../src/message/BehaviorSubject';
import { map } from '../../src/message/operators/map';
import { interval, take, lastValueFrom } from '../../src/message/internal';

export const observableTest = () => {
  console.log('--- Observable Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing Basic Observable functionality ---');

    // Test Case 1: Observable with producer function
    console.log('\n--- Test Case 1: Observable with producer function ---');
    const observable1 = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    const results1: number[] = [];
    observable1.subscribe({
      next: (value) => results1.push(value),
      complete: () => {
        assert(results1.length === 2, 'Should receive 2 values');
        assert(results1[0] === 1, 'First value should be 1');
        assert(results1[1] === 2, 'Second value should be 2');

        // Test Case 2: Observable error handling
        console.log('\n--- Test Case 2: Observable error handling ---');
        const testError = new Error('Test error');
        const observable2 = new Observable<number>((subscriber) => {
          subscriber.next(1);
          subscriber.error(testError);
        });

        let receivedValue: number | undefined;
        let receivedError: Error | undefined;
        observable2.subscribe({
          next: (value) => receivedValue = value,
          error: (err) => {
            receivedError = err;
            assert(receivedValue === 1, 'Should receive value before error');
            assert(receivedError === testError, 'Should receive the correct error');

            // Test Case 3: Observable pipe functionality
            console.log('\n--- Test Case 3: Observable pipe functionality ---');
            const observable3 = new Observable<number>((subscriber) => {
              subscriber.next(1);
              subscriber.next(2);
              subscriber.next(3);
              subscriber.complete();
            });

            const results3: number[] = [];
            observable3.pipe(
              map(x => x * 2)
            ).subscribe({
              next: (value) => results3.push(value),
              complete: () => {
                assert(results3.length === 3, 'Should receive 3 mapped values');
                assert(results3[0] === 2, 'First mapped value should be 2');
                assert(results3[1] === 4, 'Second mapped value should be 4');
                assert(results3[2] === 6, 'Third mapped value should be 6');

                // Test Case 4: Observable toPromise
                console.log('\n--- Test Case 4: Observable toPromise ---');
                const observable4 = new Observable<number>((subscriber) => {
                  subscriber.next(1);
                  subscriber.next(2);
                  subscriber.next(3);
                  subscriber.complete();
                });

                observable4.toPromise().then((result) => {
                  assert(result === 3, 'toPromise should resolve with last value');

                  // Test Case 5: Observable cleanup
                  console.log('\n--- Test Case 5: Observable cleanup ---');
                  let cleanupCalled = false;
                  const observable5 = new Observable<number>((subscriber) => {
                    const timer = setTimeout(() => {
                      subscriber.next(1);
                    }, 100);

                    return () => {
                      clearTimeout(timer);
                      cleanupCalled = true;
                    };
                  });

                  const subscription5 = observable5.subscribe(() => {});
                  subscription5.unsubscribe();
                  
                  setTimeout(() => {
                    assert(cleanupCalled, 'Cleanup function should be called on unsubscribe');
                    testSubjectFunctionality();
                  }, 50);
                });
              }
            });
          }
        });
      }
    });

    function testSubjectFunctionality() {
      console.log('\n--- Testing Subject functionality ---');

      // Test Case 6: Subject as Observable and Observer
      console.log('\n--- Test Case 6: Subject as Observable and Observer ---');
      const subject6 = new Subject<number>();
      const results6: number[] = [];

      subject6.subscribe({
        next: (value) => results6.push(value),
        complete: () => {
          assert(results6.length === 3, 'Subject should receive 3 values');
          assert(results6[0] === 1, 'First value should be 1');
          assert(results6[1] === 2, 'Second value should be 2');
          assert(results6[2] === 3, 'Third value should be 3');

          // Test Case 7: Subject multiple subscribers
          console.log('\n--- Test Case 7: Subject multiple subscribers ---');
          const subject7 = new Subject<string>();
          const results7a: string[] = [];
          const results7b: string[] = [];

          subject7.subscribe(value => results7a.push(value));
          subject7.subscribe(value => results7b.push(value));

          subject7.next('hello');
          subject7.next('world');

          assert(results7a.length === 2, 'First subscriber should receive 2 values');
          assert(results7b.length === 2, 'Second subscriber should receive 2 values');
          assert(results7a[0] === 'hello' && results7a[1] === 'world', 'First subscriber should receive correct values');
          assert(results7b[0] === 'hello' && results7b[1] === 'world', 'Second subscriber should receive correct values');

          // Test Case 8: Subject pipe operations
          console.log('\n--- Test Case 8: Subject pipe operations ---');
          const subject8 = new Subject<number>();
          const results8: number[] = [];

          subject8.pipe(
            map(x => x * 2)
          ).subscribe({
            next: (value) => results8.push(value),
            complete: () => {
              assert(results8.length === 3, 'Subject pipe should receive 3 mapped values');
              assert(results8[0] === 2, 'First mapped value should be 2');
              assert(results8[1] === 4, 'Second mapped value should be 4');
              assert(results8[2] === 6, 'Third mapped value should be 6');

              // Test Case 9: Subject error propagation
              console.log('\n--- Test Case 9: Subject error propagation ---');
              const subject9 = new Subject<number>();
              const testError9 = new Error('Test error');
              let receivedValue9: number | undefined;
              let receivedError9: Error | undefined;

              subject9.subscribe({
                next: (value) => receivedValue9 = value,
                error: (err) => {
                  receivedError9 = err;
                  assert(receivedValue9 === 1, 'Should receive value before error');
                  assert(receivedError9 === testError9, 'Should receive the correct error');

                  testBehaviorSubjectFunctionality();
                }
              });

              subject9.next(1);
              subject9.error(testError9);
            }
          });

          subject8.next(1);
          subject8.next(2);
          subject8.next(3);
          subject8.complete();
        }
      });

      subject6.next(1);
      subject6.next(2);
      subject6.next(3);
      subject6.complete();
    }

    function testBehaviorSubjectFunctionality() {
      console.log('\n--- Testing BehaviorSubject functionality ---');

      // Test Case 10: BehaviorSubject initial value
      console.log('\n--- Test Case 10: BehaviorSubject initial value ---');
      const subject10 = new BehaviorSubject<number>(42);
      const results10: number[] = [];

      subject10.subscribe(value => results10.push(value));
      assert(results10.length === 1, 'Should immediately receive initial value');
      assert(results10[0] === 42, 'Initial value should be 42');

      subject10.next(100);
      assert(results10.length === 2, 'Should receive updated value');
      assert(results10[1] === 100, 'Updated value should be 100');

      // Test Case 11: BehaviorSubject getValue
      console.log('\n--- Test Case 11: BehaviorSubject getValue ---');
      const subject11 = new BehaviorSubject<string>('initial');
      assert(subject11.getValue() === 'initial', 'getValue should return initial value');

      subject11.next('updated');
      assert(subject11.getValue() === 'updated', 'getValue should return updated value');

      // Test Case 12: BehaviorSubject with pipe
      console.log('\n--- Test Case 12: BehaviorSubject with pipe ---');
      const subject12 = new BehaviorSubject<number>(1);
      const results12: number[] = [];

      subject12.pipe(
        map(x => x * 10)
      ).subscribe({
        next: (value) => results12.push(value),
        complete: () => {
          assert(results12.length === 3, 'Should receive 3 mapped values');
          assert(results12[0] === 10, 'First mapped value should be 10');
          assert(results12[1] === 20, 'Second mapped value should be 20');
          assert(results12[2] === 30, 'Third mapped value should be 30');

          testInternalOperators();
        }
      });

      subject12.next(2);
      subject12.next(3);
      subject12.complete();
    }

    function testInternalOperators() {
      console.log('\n--- Testing Internal operators integration ---');

      // Test Case 13: interval with take
      console.log('\n--- Test Case 13: interval with take ---');
      const results13: number[] = [];
      
      interval(10).pipe(
        take(3)
      ).subscribe({
        next: (value) => results13.push(value),
        complete: () => {
          assert(results13.length === 3, 'Should receive exactly 3 values');
          assert(results13[0] === 0, 'First value should be 0');
          assert(results13[1] === 1, 'Second value should be 1');
          assert(results13[2] === 2, 'Third value should be 2');

          // Test Case 14: lastValueFrom
          console.log('\n--- Test Case 14: lastValueFrom ---');
          const subject14 = new Subject<number>();
          
          const promise14 = lastValueFrom(subject14);
          
          subject14.next(1);
          subject14.next(2);
          subject14.next(3);
          subject14.complete();

          promise14.then((result) => {
            assert(result === 3, 'lastValueFrom should resolve with last value');

            testTypeCompatibility();
          });
        }
      });
    }

    function testTypeCompatibility() {
      console.log('\n--- Testing Type compatibility ---');

      // Test Case 15: Subject as Observable type
      console.log('\n--- Test Case 15: Subject as Observable type ---');
      const subject15 = new Subject<number>();
      const observable15: Observable<number> = subject15; // Should work without error
      
      assert(observable15 === subject15, 'Subject should be assignable to Observable');
      assert(typeof observable15.pipe === 'function', 'Observable should have pipe method');
      assert(typeof observable15.subscribe === 'function', 'Observable should have subscribe method');

      // Test Case 16: BehaviorSubject as Observable type
      console.log('\n--- Test Case 16: BehaviorSubject as Observable type ---');
      const behaviorSubject16 = new BehaviorSubject<string>('test');
      const observable16: Observable<string> = behaviorSubject16; // Should work without error
      
      assert(observable16 === behaviorSubject16, 'BehaviorSubject should be assignable to Observable');
      assert(typeof observable16.pipe === 'function', 'Observable should have pipe method');
      assert(typeof observable16.subscribe === 'function', 'Observable should have subscribe method');

      console.log('\n--- All Observable tests completed ---');
      resolve();
    }
  });
};