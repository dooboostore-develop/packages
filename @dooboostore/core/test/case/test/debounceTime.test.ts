import { Observable } from '@dooboostore/core/message/Observable';
import { debounceTime } from '@dooboostore/core/message/operators/debounceTime';

export const debounceTimeTest = () => {
  console.log('--- DebounceTime Operator Test (Simplified) ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Helper to wait for a given time
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Test Case 1: Basic Debounce
  console.log('\n--- Test Case 1: Basic Debounce ---');
  (async () => {
    let received: number[] = [];
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      setTimeout(() => subscriber.next(2), 20);
      setTimeout(() => subscriber.next(3), 40);
      setTimeout(() => subscriber.complete(), 100);
    });

    source.pipe(
      debounceTime(50)
    ).subscribe(v => received.push(v));

    await delay(150);

    assert(JSON.stringify(received) === JSON.stringify([3]), 'Should emit only the last value after debounce time.');
  })();


  // Test Case 2: Rapid Emissions
  console.log('\n--- Test Case 2: Rapid Emissions ---');
  (async () => {
    let received: string[] = [];
    const source = new Observable<string>(subscriber => {
      subscriber.next('a');
      setTimeout(() => subscriber.next('b'), 10);
      setTimeout(() => subscriber.next('c'), 20);
      setTimeout(() => subscriber.next('d'), 30);
      setTimeout(() => subscriber.next('e'), 40);
      setTimeout(() => subscriber.complete(), 100);
    });

    source.pipe(
      debounceTime(20) // Short debounce time
    ).subscribe(v => received.push(v));

    await delay(150);

    assert(JSON.stringify(received) === JSON.stringify(['e']), 'Should emit only the last value from rapid bursts.');
  })();


  // Test Case 3: Completion with Pending Value
  console.log('\n--- Test Case 3: Completion with Pending Value ---');
  (async () => {
    let received: number[] = [];
    let completed = false;
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      setTimeout(() => subscriber.next(2), 10);
      setTimeout(() => subscriber.complete(), 20); // Complete before debounce time
    });

    source.pipe(
      debounceTime(50)
    ).subscribe({
      next: v => received.push(v),
      complete: () => completed = true
    });

    await delay(100); // Wait for debounce to settle

    assert(JSON.stringify(received) === JSON.stringify([2]), 'Should emit the last pending value on completion.');
    assert(completed , 'Should complete after emitting the last value.');
  })();


  // Test Case 4: Error Passthrough
  console.log('\n--- Test Case 4: Error Passthrough ---');
  (async () => {
    let error: any;
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      setTimeout(() => subscriber.error('Test Error'), 10);
    });

    source.pipe(
      debounceTime(50)
    ).subscribe({
      next: () => {},
      error: err => error = err
    });

    await delay(100);

    assert(error === 'Test Error', 'Should pass through error immediately.');
  })();

  console.log('\n--- All DebounceTime Operator tests completed (Simplified) ---');
};