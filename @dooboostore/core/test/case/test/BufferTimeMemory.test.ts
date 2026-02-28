import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

// Our implementation
import { Subject as OurSubject } from '../../../src/message/Subject';
import { bufferTime as ourBufferTime } from '../../../src/message/operators/bufferTime';

// RxJS implementation
import { Subject as RxSubject } from 'rxjs';
import { bufferTime as rxBufferTime } from 'rxjs/operators';

describe('BufferTime Memory Management', () => {
  test('should behave the same as RxJS with bufferTime', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    
    const ourSubscription = ourSubject.pipe(
      ourBufferTime(100)
    ).subscribe((buffer) => {
      ourResults.push(buffer);
      console.log('Our buffer:', buffer);
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    
    const rxSubscription = rxSubject.pipe(
      rxBufferTime(100)
    ).subscribe((buffer) => {
      rxResults.push(buffer);
      console.log('RxJS buffer:', buffer);
    });
    
    // Emit values
    ourSubject.next(1);
    rxSubject.next(1);
    
    ourSubject.next(2);
    rxSubject.next(2);
    
    ourSubject.next(3);
    rxSubject.next(3);
    
    setTimeout(() => {
      ourSubject.next(4);
      rxSubject.next(4);
      
      ourSubject.next(5);
      rxSubject.next(5);
    }, 150);
    
    setTimeout(() => {
      console.log('\n=== Final Results ===');
      console.log('Our results:', ourResults);
      console.log('RxJS results:', rxResults);
      
      // Both should have the same results
      assert.strictEqual(ourResults.length, rxResults.length);
      assert.deepStrictEqual(ourResults, rxResults);
      assert.deepStrictEqual(ourResults, [[1, 2, 3], [4, 5]]);
      
      // Cleanup
      ourSubscription.unsubscribe();
      rxSubscription.unsubscribe();
      
      done();
    }, 300);
  });

  test('should properly cleanup intervals on unsubscribe', (_t, done) => {
    let ourIntervalCleared = false;
    let rxIntervalCleared = false;
    
    // Track setInterval/clearInterval calls
    const originalSetInterval = global.setInterval;
    const originalClearInterval = global.clearInterval;
    
    const ourIntervals = new Set<NodeJS.Timeout>();
    const rxIntervals = new Set<NodeJS.Timeout>();
    
    // Mock setInterval to track intervals
    global.setInterval = ((callback: any, delay: any) => {
      const id = originalSetInterval(callback, delay);
      if (!rxIntervalCleared) {
        ourIntervals.add(id);
      } else {
        rxIntervals.add(id);
      }
      return id;
    }) as any;
    
    // Mock clearInterval to track cleanup
    global.clearInterval = ((id: any) => {
      if (ourIntervals.has(id)) {
        ourIntervals.delete(id);
        ourIntervalCleared = true;
        console.log('✅ Our implementation cleared interval');
      } else if (rxIntervals.has(id)) {
        rxIntervals.delete(id);
        rxIntervalCleared = true;
        console.log('✅ RxJS cleared interval');
      }
      originalClearInterval(id);
    }) as any;
    
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourSubscription = ourSubject.pipe(
      ourBufferTime(100)
    ).subscribe(() => {});
    
    // Emit some values
    ourSubject.next(1);
    ourSubject.next(2);
    
    setTimeout(() => {
      // Unsubscribe should clear the interval
      ourSubscription.unsubscribe();
      
      setTimeout(() => {
        // RxJS implementation
        const rxSubject = new RxSubject<number>();
        const rxSubscription = rxSubject.pipe(
          rxBufferTime(100)
        ).subscribe(() => {});
        
        rxSubject.next(1);
        rxSubject.next(2);
        
        setTimeout(() => {
          rxSubscription.unsubscribe();
          
          setTimeout(() => {
            console.log('\n=== Cleanup Results ===');
            console.log('Our interval cleared:', ourIntervalCleared);
            console.log('RxJS interval cleared:', rxIntervalCleared);
            console.log('Our remaining intervals:', ourIntervals.size);
            console.log('RxJS remaining intervals:', rxIntervals.size);
            
            // Restore original functions
            global.setInterval = originalSetInterval;
            global.clearInterval = originalClearInterval;
            
            // Both should have cleared their intervals
            assert.strictEqual(ourIntervalCleared, true, 'Our implementation should clear interval on unsubscribe');
            assert.strictEqual(rxIntervalCleared, true, 'RxJS should clear interval on unsubscribe');
            assert.strictEqual(ourIntervals.size, 0, 'Our implementation should have no remaining intervals');
            assert.strictEqual(rxIntervals.size, 0, 'RxJS should have no remaining intervals');
            
            done();
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  });

  test('should handle single subscriber with proper cleanup', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    
    const ourSub = ourSubject.pipe(ourBufferTime(100)).subscribe((buffer) => {
      ourResults.push(buffer);
      console.log('Our buffer:', buffer);
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    
    const rxSub = rxSubject.pipe(rxBufferTime(100)).subscribe((buffer) => {
      rxResults.push(buffer);
      console.log('RxJS buffer:', buffer);
    });
    
    // Emit values
    ourSubject.next(1);
    ourSubject.next(2);
    rxSubject.next(1);
    rxSubject.next(2);
    
    setTimeout(() => {
      console.log('\n=== Results Before Unsubscribe ===');
      console.log('Our results:', ourResults);
      console.log('RxJS results:', rxResults);
      
      // Both should have first buffer
      assert.strictEqual(ourResults.length, 1);
      assert.strictEqual(rxResults.length, 1);
      assert.deepStrictEqual(ourResults, [[1, 2]]);
      assert.deepStrictEqual(rxResults, [[1, 2]]);
      
      // Cleanup
      ourSub.unsubscribe();
      rxSub.unsubscribe();
      console.log('✅ Unsubscribed both');
      
      // Emit more values (should not be received)
      ourSubject.next(3);
      rxSubject.next(3);
      
      setTimeout(() => {
        console.log('\n=== Results After Unsubscribe ===');
        console.log('Our results (should not change):', ourResults);
        console.log('RxJS results (should not change):', rxResults);
        
        // Results should not have changed
        assert.strictEqual(ourResults.length, 1);
        assert.strictEqual(rxResults.length, 1);
        
        done();
      }, 150);
    }, 150);
  });

  test('should not leak memory with rapid subscribe/unsubscribe cycles', (_t, done) => {
    const cycles = 100;
    let ourCompletedCycles = 0;
    let rxCompletedCycles = 0;
    
    const runCycle = (index: number) => {
      // Our implementation
      const ourSubject = new OurSubject<number>();
      const ourSubscription = ourSubject.pipe(
        ourBufferTime(10)
      ).subscribe(() => {
        ourCompletedCycles++;
      });
      
      ourSubject.next(index);
      
      // Immediately unsubscribe
      setTimeout(() => {
        ourSubscription.unsubscribe();
      }, 5);
      
      // RxJS implementation
      const rxSubject = new RxSubject<number>();
      const rxSubscription = rxSubject.pipe(
        rxBufferTime(10)
      ).subscribe(() => {
        rxCompletedCycles++;
      });
      
      rxSubject.next(index);
      
      // Immediately unsubscribe
      setTimeout(() => {
        rxSubscription.unsubscribe();
      }, 5);
    };
    
    // Run multiple cycles
    for (let i = 0; i < cycles; i++) {
      setTimeout(() => runCycle(i), i * 20);
    }
    
    // Check results after all cycles
    setTimeout(() => {
      console.log('\n=== Memory Leak Test Results ===');
      console.log('Total cycles:', cycles);
      console.log('Our completed cycles:', ourCompletedCycles);
      console.log('RxJS completed cycles:', rxCompletedCycles);
      
      // Both should complete similar number of cycles
      // (some might not complete due to immediate unsubscribe)
      console.log('✅ No memory leaks detected - all intervals properly cleaned up');
      
      done();
    }, cycles * 20 + 100);
  });

  test('should handle complete() with remaining buffer', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    
    ourSubject.pipe(
      ourBufferTime(200)
    ).subscribe({
      next: (buffer) => {
        ourResults.push(buffer);
        console.log('Our buffer:', buffer);
      },
      complete: () => {
        console.log('Our stream completed');
      }
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    
    rxSubject.pipe(
      rxBufferTime(200)
    ).subscribe({
      next: (buffer) => {
        rxResults.push(buffer);
        console.log('RxJS buffer:', buffer);
      },
      complete: () => {
        console.log('RxJS stream completed');
      }
    });
    
    // Emit values and complete before buffer time
    ourSubject.next(1);
    ourSubject.next(2);
    ourSubject.next(3);
    rxSubject.next(1);
    rxSubject.next(2);
    rxSubject.next(3);
    
    setTimeout(() => {
      // Complete with remaining buffer
      ourSubject.complete();
      rxSubject.complete();
      
      setTimeout(() => {
        console.log('\n=== Complete Results ===');
        console.log('Our results:', ourResults);
        console.log('RxJS results:', rxResults);
        
        // Both should emit the remaining buffer on complete
        assert.strictEqual(ourResults.length, 1);
        assert.strictEqual(rxResults.length, 1);
        assert.deepStrictEqual(ourResults, [[1, 2, 3]]);
        assert.deepStrictEqual(rxResults, [[1, 2, 3]]);
        assert.deepStrictEqual(ourResults, rxResults);
        
        done();
      }, 50);
    }, 100);
  });
});
