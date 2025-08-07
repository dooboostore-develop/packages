import { interval } from '@dooboostore/core/message/internal/interval';
import { take } from '@dooboostore/core/message/internal/take';

export const intervalTest = () => {
  console.log('--- Interval Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic interval emission
  console.log('\n--- Test Case 1: Basic interval emission ---');
  return new Promise<void>((resolve) => {
    const values: number[] = [];
    const source = interval(50); // 50ms interval
    
    const subscription = source.subscribe({
      next: (value) => {
        values.push(value);
        if (values.length === 3) {
          subscription.unsubscribe();
          assert(values.length === 3, 'Should emit 3 values');
          assert(values[0] === 0, 'First value should be 0');
          assert(values[1] === 1, 'Second value should be 1');
          assert(values[2] === 2, 'Third value should be 2');
          
          // Test Case 2: Zero period interval
          console.log('\n--- Test Case 2: Zero period interval ---');
          const values2: number[] = [];
          const source2 = interval(0);
          
          const subscription2 = source2.subscribe({
            next: (value) => {
              values2.push(value);
              if (values2.length === 2) {
                subscription2.unsubscribe();
                assert(values2.length === 2, 'Should emit values with 0ms interval');
                assert(values2[0] === 0, 'First value should be 0');
                assert(values2[1] === 1, 'Second value should be 1');
                
                // Test Case 3: Negative period handling
                console.log('\n--- Test Case 3: Negative period handling ---');
                const values3: number[] = [];
                const source3 = interval(-100); // Should be treated as 0
                
                const subscription3 = source3.subscribe({
                  next: (value) => {
                    values3.push(value);
                    if (values3.length === 2) {
                      subscription3.unsubscribe();
                      assert(values3.length === 2, 'Should emit values even with negative period');
                      assert(values3[0] === 0, 'First value should be 0');
                      assert(values3[1] === 1, 'Second value should be 1');
                      
                      // Test Case 4: Unsubscribe cleanup
                      console.log('\n--- Test Case 4: Unsubscribe cleanup ---');
                      const values4: number[] = [];
                      const source4 = interval(30);
                      
                      const subscription4 = source4.subscribe({
                        next: (value) => {
                          values4.push(value);
                        }
                      });
                      
                      setTimeout(() => {
                        subscription4.unsubscribe();
                        const countAfterUnsubscribe = values4.length;
                        
                        setTimeout(() => {
                          assert(values4.length === countAfterUnsubscribe, 'Should not emit after unsubscribe');
                          
                          // Test Case 5: Integration with take operator
                          console.log('\n--- Test Case 5: Integration with take operator ---');
                          const values5: number[] = [];
                          const source5 = interval(20).pipe(take(3));
                          
                          source5.subscribe({
                            next: (value) => {
                              values5.push(value);
                            },
                            complete: () => {
                              assert(values5.length === 3, 'Should emit exactly 3 values with take(3)');
                              assert(values5[0] === 0, 'First value should be 0');
                              assert(values5[1] === 1, 'Second value should be 1');
                              assert(values5[2] === 2, 'Third value should be 2');
                              
                              console.log('\n--- All interval tests completed ---');
                              resolve();
                            }
                          });
                        }, 50);
                      }, 100);
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  });
};