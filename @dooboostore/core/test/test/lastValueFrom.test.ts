import { Observable } from '@dooboostore/core/message/Observable';
import { lastValueFrom, EmptyError } from '@dooboostore/core/message/internal/lastValueFrom';
import { Subject } from '@dooboostore/core/message/Subject';

export const lastValueFromTest = async () => {
  console.log('--- LastValueFrom Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic lastValueFrom with multiple values
  console.log('\n--- Test Case 1: Basic lastValueFrom with multiple values ---');
  try {
    const subject1 = new Subject<number>();
    const promise1 = lastValueFrom(subject1);

    subject1.next(1);
    subject1.next(2);
    subject1.next(3);
    subject1.complete();

    const result1 = await promise1;
    assert(result1 === 3, 'Should resolve with the last emitted value');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 2: lastValueFrom with single value
  console.log('\n--- Test Case 2: lastValueFrom with single value ---');
  try {
    const subject2 = new Subject<string>();
    const promise2 = lastValueFrom(subject2);

    subject2.next('only value');
    subject2.complete();

    const result2 = await promise2;
    assert(result2 === 'only value', 'Should resolve with the single emitted value');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 3: Empty stream without default value
  console.log('\n--- Test Case 3: Empty stream without default value ---');
  try {
    const subject3 = new Subject<number>();
    const promise3 = lastValueFrom(subject3);

    subject3.complete(); // Complete without emitting any values

    await promise3;
    assert(false, 'Should have thrown EmptyError');
  } catch (error) {
    assert(error instanceof EmptyError, 'Should throw EmptyError for empty stream');
    assert(error.message === 'No elements in sequence', 'Should have correct error message');
  }

  // Test Case 4: Empty stream with default value
  console.log('\n--- Test Case 4: Empty stream with default value ---');
  try {
    const subject4 = new Subject<number>();
    const promise4 = lastValueFrom(subject4, { defaultValue: 42 });

    subject4.complete(); // Complete without emitting any values

    const result4 = await promise4;
    assert(result4 === 42, 'Should resolve with default value for empty stream');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 5: Error propagation
  console.log('\n--- Test Case 5: Error propagation ---');
  try {
    const subject5 = new Subject<string>();
    const promise5 = lastValueFrom(subject5);

    subject5.next('some value');
    subject5.error(new Error('test error'));

    await promise5;
    assert(false, 'Should have thrown the source error');
  } catch (error) {
    assert(error.message === 'test error', 'Should propagate the source error');
  }

  // Test Case 6: Error with default value still propagates error
  console.log('\n--- Test Case 6: Error with default value still propagates error ---');
  try {
    const subject6 = new Subject<number>();
    const promise6 = lastValueFrom(subject6, { defaultValue: 100 });

    subject6.next(50);
    subject6.error(new Error('another error'));

    await promise6;
    assert(false, 'Should have thrown the source error even with default value');
  } catch (error) {
    assert(error.message === 'another error', 'Should propagate error even with default value config');
  }

  // Test Case 7: Values emitted then empty completion with default
  console.log('\n--- Test Case 7: Values emitted then last value resolution ---');
  try {
    const subject7 = new Subject<boolean>();
    const promise7 = lastValueFrom(subject7, { defaultValue: false });

    subject7.next(true);
    subject7.next(false);
    subject7.next(true);
    subject7.complete();

    const result7 = await promise7;
    assert(result7 === true, 'Should resolve with last emitted value, not default');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  // Test Case 8: Observable that immediately completes
  console.log('\n--- Test Case 8: Observable that immediately completes ---');
  try {
    const observable8 = new Observable<number>(subscriber => {
      subscriber.complete();
    });
    
    await lastValueFrom(observable8);
    assert(false, 'Should have thrown EmptyError');
  } catch (error) {
    assert(error instanceof EmptyError, 'Should throw EmptyError for immediately completing Observable');
  }

  // Test Case 9: Observable that immediately emits and completes
  console.log('\n--- Test Case 9: Observable that immediately emits and completes ---');
  try {
    const observable9 = new Observable<string>(subscriber => {
      subscriber.next('immediate');
      subscriber.complete();
    });
    
    const result9 = await lastValueFrom(observable9);
    assert(result9 === 'immediate', 'Should resolve with immediately emitted value');
  } catch (error) {
    assert(false, `Should not throw error: ${error}`);
  }

  console.log('\n--- All lastValueFrom tests completed ---');
};