import { timer } from '@dooboostore/core/message/internal/timer';

export const timerTest = () => {
  console.log('--- Timer Function Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
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
        const startTime2 = Date.now();
        const subscription2 = timer(30, 20).subscribe({
          next: (value) => {
            values2.push(value);
            if (values2.length === 4) {
              subscription2.unsubscribe();
              const elapsed = Date.now() - startTime2;
              assert(values2.length === 4, 'Should receive 4 values before unsubscribe');
              assert(values2[0] === 0, 'First value should be 0');
              assert(values2[1] === 1, 'Second value should be 1');
              assert(values2[2] === 2, 'Third value should be 2');
              assert(values2[3] === 3, 'Fourth value should be 3');
              assert(elapsed >= 90, 'Should respect both initial delay and periods');
              
              console.log('\n--- Test Case 3: Timer with zero initial delay ---');
              const values3: number[] = [];
              const startTime3 = Date.now();
              timer(0, 25).subscribe({
                next: (value) => {
                  values3.push(value);
                  if (values3.length === 3) {
                    subscription3.unsubscribe();
                    const elapsed = Date.now() - startTime3;
                    assert(values3[0] === 0, 'Should emit immediately with zero delay');
                    assert(elapsed < 80, 'Should be relatively fast with zero initial delay');
                    
                    console.log('\n--- Test Case 4: Timer cleanup on unsubscribe ---');
                    const values4: number[] = [];
                    const subscription4 = timer(20, 15).subscribe({
                      next: (value) => values4.push(value)
                    });
                    
                    setTimeout(() => {
                      subscription4.unsubscribe();
                      const countAfterUnsubscribe = values4.length;
                      
                      setTimeout(() => {
                        assert(values4.length === countAfterUnsubscribe, 'Should not emit after unsubscribe');
                        
                        console.log('\n--- Test Case 5: Timer with negative initial delay ---');
                        const startTime5 = Date.now();
                        timer(-100).subscribe({
                          next: (value) => {
                            const elapsed = Date.now() - startTime5;
                            assert(value === 0, 'Should emit 0 even with negative delay');
                            assert(elapsed < 50, 'Negative delay should be treated as 0');
                          },
                          complete: () => {
                            console.log('\n--- All timer tests completed ---');
                            resolve();
                          }
                        });
                      }, 50);
                    }, 60);
                  }
                }
              });
              const subscription3 = timer(0, 25).subscribe({
                next: (value) => {
                  values3.push(value);
                  if (values3.length === 3) {
                    subscription3.unsubscribe();
                  }
                }
              });
            }
          }
        });
      }
    });
  });
};