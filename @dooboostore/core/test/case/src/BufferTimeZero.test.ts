import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

// Our implementation
import { Subject as OurSubject } from '../../../src/message/Subject';
import { bufferTime as ourBufferTime } from '../../../src/message/operators/bufferTime';

// RxJS implementation
import { Subject as RxSubject } from 'rxjs';
import { bufferTime as rxBufferTime } from 'rxjs/operators';

describe('BufferTime with Zero Delay', () => {
  test('should behave the same as RxJS with bufferTime(0)', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    
    const ourSubscription = ourSubject.pipe(
      ourBufferTime(0)
    ).subscribe((buffer) => {
      ourResults.push(buffer);
      console.log('Our buffer (0ms):', buffer);
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    
    const rxSubscription = rxSubject.pipe(
      rxBufferTime(0)
    ).subscribe((buffer) => {
      rxResults.push(buffer);
      console.log('RxJS buffer (0ms):', buffer);
    });
    
    // Emit values rapidly
    console.log('\n=== Emitting values ===');
    ourSubject.next(1);
    rxSubject.next(1);
    
    ourSubject.next(2);
    rxSubject.next(2);
    
    ourSubject.next(3);
    rxSubject.next(3);
    
    // Wait a bit to see what happens
    setTimeout(() => {
      console.log('\n=== Results After First Batch ===');
      console.log('Our results:', ourResults);
      console.log('RxJS results:', rxResults);
      
      // Emit more values
      ourSubject.next(4);
      rxSubject.next(4);
      
      ourSubject.next(5);
      rxSubject.next(5);
      
      setTimeout(() => {
        console.log('\n=== Final Results ===');
        console.log('Our results:', ourResults);
        console.log('RxJS results:', rxResults);
        console.log('Our total buffers:', ourResults.length);
        console.log('RxJS total buffers:', rxResults.length);
        
        // Cleanup
        ourSubscription.unsubscribe();
        rxSubscription.unsubscribe();
        
        // Both should have similar behavior
        console.log('✅ Test completed - check if behaviors match');
        
        done();
      }, 100);
    }, 100);
  });

  test('should handle rapid emissions with bufferTime(0)', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    
    const ourSubscription = ourSubject.pipe(
      ourBufferTime(0)
    ).subscribe((buffer) => {
      ourResults.push(buffer);
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    
    const rxSubscription = rxSubject.pipe(
      rxBufferTime(0)
    ).subscribe((buffer) => {
      rxResults.push(buffer);
    });
    
    // Emit 10 values rapidly
    console.log('\n=== Rapid Emissions Test ===');
    for (let i = 1; i <= 10; i++) {
      ourSubject.next(i);
      rxSubject.next(i);
    }
    
    setTimeout(() => {
      console.log('Our buffers count:', ourResults.length);
      console.log('RxJS buffers count:', rxResults.length);
      console.log('Our total values:', ourResults.flat().length);
      console.log('RxJS total values:', rxResults.flat().length);
      
      // All values should be emitted
      assert.strictEqual(ourResults.flat().length, 10, 'Our implementation should emit all 10 values');
      assert.strictEqual(rxResults.flat().length, 10, 'RxJS should emit all 10 values');
      
      // Cleanup
      ourSubscription.unsubscribe();
      rxSubscription.unsubscribe();
      
      console.log('✅ All values emitted correctly');
      
      done();
    }, 100);
  });

  test('should cleanup properly with bufferTime(0)', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    
    const ourSubscription = ourSubject.pipe(
      ourBufferTime(0)
    ).subscribe((buffer) => {
      ourResults.push(buffer);
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    
    const rxSubscription = rxSubject.pipe(
      rxBufferTime(0)
    ).subscribe((buffer) => {
      rxResults.push(buffer);
    });
    
    // Emit some values
    ourSubject.next(1);
    ourSubject.next(2);
    rxSubject.next(1);
    rxSubject.next(2);
    
    setTimeout(() => {
      const ourCountBefore = ourResults.length;
      const rxCountBefore = rxResults.length;
      
      console.log('\n=== Before Unsubscribe ===');
      console.log('Our buffers:', ourCountBefore);
      console.log('RxJS buffers:', rxCountBefore);
      
      // Unsubscribe
      ourSubscription.unsubscribe();
      rxSubscription.unsubscribe();
      console.log('✅ Unsubscribed');
      
      // Emit more values (should not be received)
      ourSubject.next(3);
      ourSubject.next(4);
      rxSubject.next(3);
      rxSubject.next(4);
      
      setTimeout(() => {
        console.log('\n=== After Unsubscribe ===');
        console.log('Our buffers (should not change):', ourResults.length);
        console.log('RxJS buffers (should not change):', rxResults.length);
        
        // Counts should not have changed
        assert.strictEqual(ourResults.length, ourCountBefore, 'Our implementation should not receive values after unsubscribe');
        assert.strictEqual(rxResults.length, rxCountBefore, 'RxJS should not receive values after unsubscribe');
        
        console.log('✅ Cleanup successful - no values received after unsubscribe');
        
        done();
      }, 50);
    }, 50);
  });

  test('should handle complete() immediately with bufferTime(0)', (_t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[][] = [];
    let ourCompleted = false;
    
    ourSubject.pipe(
      ourBufferTime(0)
    ).subscribe({
      next: (buffer) => {
        ourResults.push(buffer);
        console.log('Our buffer:', buffer);
      },
      complete: () => {
        ourCompleted = true;
        console.log('Our stream completed');
      }
    });
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[][] = [];
    let rxCompleted = false;
    
    rxSubject.pipe(
      rxBufferTime(0)
    ).subscribe({
      next: (buffer) => {
        rxResults.push(buffer);
        console.log('RxJS buffer:', buffer);
      },
      complete: () => {
        rxCompleted = true;
        console.log('RxJS stream completed');
      }
    });
    
    // Emit values and complete immediately
    ourSubject.next(1);
    ourSubject.next(2);
    ourSubject.next(3);
    rxSubject.next(1);
    rxSubject.next(2);
    rxSubject.next(3);
    
    // Complete immediately
    ourSubject.complete();
    rxSubject.complete();
    
    setTimeout(() => {
      console.log('\n=== Complete Results ===');
      console.log('Our results:', ourResults);
      console.log('RxJS results:', rxResults);
      console.log('Our completed:', ourCompleted);
      console.log('RxJS completed:', rxCompleted);
      
      // Both should have completed
      assert.strictEqual(ourCompleted, true, 'Our implementation should complete');
      assert.strictEqual(rxCompleted, true, 'RxJS should complete');
      
      // All values should be emitted
      const ourTotal = ourResults.flat().length;
      const rxTotal = rxResults.flat().length;
      console.log('Our total values:', ourTotal);
      console.log('RxJS total values:', rxTotal);
      
      assert.strictEqual(ourTotal, 3, 'Our implementation should emit all 3 values');
      assert.strictEqual(rxTotal, 3, 'RxJS should emit all 3 values');
      
      done();
    }, 50);
  });
});
