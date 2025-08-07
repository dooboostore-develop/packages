import { Observable } from '@dooboostore/core/message/Observable';
import { take } from '@dooboostore/core/message/internal/take';
import { Subject } from '@dooboostore/core/message/Subject';

export const takeTest = () => {
  console.log('--- Take Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    // Test Case 1: Basic take functionality
    console.log('\n--- Test Case 1: Basic take functionality ---');
    const subject1 = new Subject<number>();
    const values1: number[] = [];
    let completed1 = false;

    const subscription1 = subject1.pipe(take(3)).subscribe({
      next: (value) => {
        values1.push(value);
      },
      complete: () => {
        completed1 = true;
      }
    });

    subject1.next(1);
    subject1.next(2);
    subject1.next(3);
    subject1.next(4); // This should not be received
    subject1.next(5); // This should not be received

    setTimeout(() => {
      assert(values1.length === 3, 'Should emit exactly 3 values');
      assert(values1[0] === 1, 'First value should be 1');
      assert(values1[1] === 2, 'Second value should be 2');
      assert(values1[2] === 3, 'Third value should be 3');
      assert(completed1, 'Should complete after taking 3 values');

      // Test Case 2: Take with count 0
      console.log('\n--- Test Case 2: Take with count 0 ---');
      const subject2 = new Subject<string>();
      const values2: string[] = [];
      let completed2 = false;

      subject2.pipe(take(0)).subscribe({
        next: (value) => {
          values2.push(value);
        },
        complete: () => {
          completed2 = true;
        }
      });

      subject2.next('should not receive');
      
      setTimeout(() => {
        assert(values2.length === 0, 'Should not emit any values with take(0)');
        assert(completed2, 'Should complete immediately with take(0)');

        // Test Case 3: Take with negative count
        console.log('\n--- Test Case 3: Take with negative count ---');
        const subject3 = new Subject<boolean>();
        const values3: boolean[] = [];
        let completed3 = false;

        subject3.pipe(take(-5)).subscribe({
          next: (value) => {
            values3.push(value);
          },
          complete: () => {
            completed3 = true;
          }
        });

        subject3.next(true);
        
        setTimeout(() => {
          assert(values3.length === 0, 'Should not emit any values with negative count');
          assert(completed3, 'Should complete immediately with negative count');

          // Test Case 4: Source completes before count is reached
          console.log('\n--- Test Case 4: Source completes before count is reached ---');
          const subject4 = new Subject<number>();
          const values4: number[] = [];
          let completed4 = false;

          subject4.pipe(take(5)).subscribe({
            next: (value) => {
              values4.push(value);
            },
            complete: () => {
              completed4 = true;
            }
          });

          subject4.next(10);
          subject4.next(20);
          subject4.complete(); // Complete before reaching count of 5

          setTimeout(() => {
            assert(values4.length === 2, 'Should emit all values before source completion');
            assert(values4[0] === 10, 'First value should be 10');
            assert(values4[1] === 20, 'Second value should be 20');
            assert(completed4, 'Should complete when source completes');

            // Test Case 5: Error propagation
            console.log('\n--- Test Case 5: Error propagation ---');
            const subject5 = new Subject<string>();
            const values5: string[] = [];
            let error5: any = null;

            subject5.pipe(take(3)).subscribe({
              next: (value) => {
                values5.push(value);
              },
              error: (err) => {
                error5 = err;
              }
            });

            subject5.next('first');
            subject5.error(new Error('test error'));

            setTimeout(() => {
              assert(values5.length === 1, 'Should emit values before error');
              assert(values5[0] === 'first', 'Should receive first value');
              assert(error5 !== null, 'Should propagate error');
              assert(error5.message === 'test error', 'Should propagate correct error');

              // Test Case 6: Take with count 1
              console.log('\n--- Test Case 6: Take with count 1 ---');
              const subject6 = new Subject<number>();
              const values6: number[] = [];
              let completed6 = false;

              subject6.pipe(take(1)).subscribe({
                next: (value) => {
                  values6.push(value);
                },
                complete: () => {
                  completed6 = true;
                }
              });

              subject6.next(42);
              subject6.next(43); // Should not be received

              setTimeout(() => {
                assert(values6.length === 1, 'Should emit exactly 1 value');
                assert(values6[0] === 42, 'Should receive correct value');
                assert(completed6, 'Should complete after first value');

                console.log('\n--- All take tests completed ---');
                resolve();
              }, 10);
            }, 10);
          }, 10);
        }, 10);
      }, 10);
    }, 10);
  });
};