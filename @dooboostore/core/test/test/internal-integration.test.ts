import { interval } from '@dooboostore/core/message/internal/interval';
import { take } from '@dooboostore/core/message/internal/take';
import { lastValueFrom } from '@dooboostore/core/message/internal/lastValueFrom';
import { map } from '@dooboostore/core/message/operators/map';
import { filter } from '@dooboostore/core/message/operators/filter';
import { Subject } from '@dooboostore/core/message/Subject';
import { BehaviorSubject } from '@dooboostore/core/message/BehaviorSubject';

export const internalIntegrationTest = async () => {
  console.log('--- Internal Integration Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: interval().pipe(take(n)) combination
  console.log('\n--- Test Case 1: interval().pipe(take(n)) combination ---');
  try {
    const result1 = await lastValueFrom(interval(10).pipe(take(5)));
    assert(result1 === 4, 'interval(10).pipe(take(5)) should resolve with 4');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 2: interval with map and take
  console.log('\n--- Test Case 2: interval with map and take ---');
  try {
    const result2 = await lastValueFrom(
      interval(5)
        .pipe(
          map(x => x * 2),
          take(3)
        )
    );
    assert(result2 === 4, 'interval(5).pipe(map(x => x * 2), take(3)) should resolve with 4 (2*2)');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 3: interval with filter and take
  console.log('\n--- Test Case 3: interval with filter and take ---');
  try {
    const result3 = await lastValueFrom(
      interval(5)
        .pipe(
          filter(x => x % 2 === 0), // Only even numbers
          take(3) // Take first 3 even numbers: 0, 2, 4
        )
    );
    assert(result3 === 4, 'interval with filter(even) and take(3) should resolve with 4');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 4: Subject with take and lastValueFrom
  console.log('\n--- Test Case 4: Subject with take and lastValueFrom ---');
  try {
    const subject4 = new Subject<string>();
    const promise4 = lastValueFrom(subject4.pipe(take(2)));

    subject4.next('first');
    subject4.next('second');
    subject4.next('third'); // Should not be received due to take(2)

    const result4 = await promise4;
    assert(result4 === 'second', 'Subject with take(2) should resolve with second value');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 5: BehaviorSubject with take and lastValueFrom
  console.log('\n--- Test Case 5: BehaviorSubject with take and lastValueFrom ---');
  try {
    const behaviorSubject5 = new BehaviorSubject<number>(100);
    const promise5 = lastValueFrom(behaviorSubject5.pipe(take(3)));

    behaviorSubject5.next(200);
    behaviorSubject5.next(300);
    behaviorSubject5.next(400); // Should not be received due to take(3)

    const result5 = await promise5;
    assert(result5 === 300, 'BehaviorSubject with take(3) should resolve with third value');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 6: Complex chain with multiple operators
  console.log('\n--- Test Case 6: Complex chain with multiple operators ---');
  try {
    const result6 = await lastValueFrom(
      interval(3)
        .pipe(
          map(x => x + 1), // 1, 2, 3, 4, 5...
          filter(x => x > 2), // 3, 4, 5...
          map(x => x * 10), // 30, 40, 50...
          take(2) // 30, 40
        )
    );
    assert(result6 === 40, 'Complex operator chain should resolve with 40');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 7: take(0) with lastValueFrom should reject
  console.log('\n--- Test Case 7: take(0) with lastValueFrom should reject ---');
  try {
    await lastValueFrom(interval(10).pipe(take(0)));
    assert(false, 'take(0) with lastValueFrom should reject');
  } catch (error) {
    assert(error.name === 'EmptyError', 'take(0) should result in EmptyError');
  }

  // Test Case 8: Multiple subscribers to the same interval
  console.log('\n--- Test Case 8: Multiple subscribers to the same interval ---');
  return new Promise<void>((resolve) => {
    const source8 = interval(20).pipe(take(3));
    const values8a: number[] = [];
    const values8b: number[] = [];
    let completed8a = false;
    let completed8b = false;

    source8.subscribe({
      next: (value) => values8a.push(value),
      complete: () => {
        completed8a = true;
        checkCompletion();
      }
    });

    source8.subscribe({
      next: (value) => values8b.push(value),
      complete: () => {
        completed8b = true;
        checkCompletion();
      }
    });

    function checkCompletion() {
      if (completed8a && completed8b) {
        assert(values8a.length === 3, 'First subscriber should receive 3 values');
        assert(values8b.length === 3, 'Second subscriber should receive 3 values');
        assert(JSON.stringify(values8a) === JSON.stringify([0, 1, 2]), 'First subscriber should receive [0, 1, 2]');
        assert(JSON.stringify(values8b) === JSON.stringify([0, 1, 2]), 'Second subscriber should receive [0, 1, 2]');
        
        console.log('\n--- All integration tests completed ---');
        resolve();
      }
    }
  });
};