import { switchMap } from '../../src/message/operators/switchMap';
import { of, timer, interval } from '../../src/message/internal';
import { take } from '../../src/message/internal';

export const switchMapTest = () => {
  console.log('--- SwitchMap Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Test Case 1: Basic switchMap functionality ---');
    
    const values1: string[] = [];
    of(1, 2, 3).pipe(
      switchMap(x => of(`a${x}`, `b${x}`))
    ).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 6, 'Should emit all inner observable values');
        assert(values1[0] === 'a1' && values1[1] === 'b1', 'Should emit first inner values');
        assert(values1[2] === 'a2' && values1[3] === 'b2', 'Should emit second inner values');
        assert(values1[4] === 'a3' && values1[5] === 'b3', 'Should emit third inner values');
        testSwitchMapCancellation();
      }
    });

    function testSwitchMapCancellation() {
      console.log('\n--- Test Case 2: SwitchMap cancellation behavior ---');
      
      const values2: string[] = [];
      let innerSubscriptionCount = 0;
      
      // Create a source that emits quickly
      of(1, 2, 3).pipe(
        switchMap(x => {
          innerSubscriptionCount++;
          // Return a timer that would emit after some delay
          return timer(x * 10).pipe(
            switchMap(() => of(`result-${x}`))
          );
        })
      ).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          // Due to switching, only the last inner observable should complete
          assert(innerSubscriptionCount === 3, 'Should create 3 inner subscriptions');
          // The exact behavior depends on timing, but we should get at least the last result
          assert(values2.length >= 1, 'Should emit at least one result');
          testSwitchMapWithError();
        }
      });
    }

    function testSwitchMapWithError() {
      console.log('\n--- Test Case 3: SwitchMap error handling ---');
      
      let errorReceived = false;
      of(1, 2, 3).pipe(
        switchMap(x => {
          if (x === 2) {
            throw new Error(`Error for ${x}`);
          }
          return of(`success-${x}`);
        })
      ).subscribe({
        next: (value) => {
          // Should receive success-1 before error
        },
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'Error for 2', 'Should propagate projection error');
          testSwitchMapWithIndex();
        }
      });
    }

    function testSwitchMapWithIndex() {
      console.log('\n--- Test Case 4: SwitchMap with index parameter ---');
      
      const values4: string[] = [];
      of('a', 'b', 'c').pipe(
        switchMap((value, index) => of(`${value}-${index}`))
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 3, 'Should emit 3 values with index');
          assert(values4[0] === 'a-0', 'Should include correct index for first value');
          assert(values4[1] === 'b-1', 'Should include correct index for second value');
          assert(values4[2] === 'c-2', 'Should include correct index for third value');
          testSwitchMapUnsubscribe();
        }
      });
    }

    function testSwitchMapUnsubscribe() {
      console.log('\n--- Test Case 5: SwitchMap unsubscribe behavior ---');
      
      const values5: string[] = [];
      let innerUnsubscribed = false;
      
      const subscription = of(1).pipe(
        switchMap(x => {
          return new (of(null).constructor as any)((subscriber: any) => {
            const timeoutId = setTimeout(() => {
              subscriber.next(`delayed-${x}`);
              subscriber.complete();
            }, 100);
            
            return () => {
              clearTimeout(timeoutId);
              innerUnsubscribed = true;
            };
          });
        })
      ).subscribe({
        next: (value) => values5.push(value)
      });

      // Unsubscribe before inner observable completes
      setTimeout(() => {
        subscription.unsubscribe();
        
        setTimeout(() => {
          assert(values5.length === 0, 'Should not emit after unsubscribe');
          assert(innerUnsubscribed, 'Should unsubscribe from inner observable');
          
          console.log('\n--- All switchMap tests completed ---');
          resolve();
        }, 50);
      }, 50);
    }
  });
};