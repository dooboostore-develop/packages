import { Observable } from '@dooboostore/core/message/Observable';
import { filter } from '@dooboostore/core/message/operators/filter';

export const filterTest = () => {
  console.log('--- Filter Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic Filtering
  console.log('\n--- Test Case 1: Basic Filtering ---');
  const source1 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.next(4);
    subscriber.complete();
  });
  const received1: number[] = [];
  source1.pipe(
    filter(x => x % 2 === 0) // Only even numbers
  ).subscribe(v => received1.push(v));
  assert(JSON.stringify(received1) === JSON.stringify([2, 4]), 'Should filter out values not satisfying the predicate.');

  // Test Case 2: Filtering with Index
  console.log('\n--- Test Case 2: Filtering with Index ---');
  const source2 = new Observable<string>(subscriber => {
    subscriber.next('a'); // index 0
    subscriber.next('b'); // index 1
    subscriber.next('c'); // index 2
    subscriber.complete();
  });
  const received2: string[] = [];
  source2.pipe(
    filter((value, index) => index % 2 === 0) // Only even indices
  ).subscribe(v => received2.push(v));
  assert(JSON.stringify(received2) === JSON.stringify(['a', 'c']), 'Should filter values using index in predicate.');

  // Test Case 3: Error Handling in Predicate
  console.log('\n--- Test Case 3: Error Handling in Predicate ---');
  const source3 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.complete();
  });
  let error3: any;
  source3.pipe(
    filter(x => {
      if (x === 2) throw new Error('Filter Error');
      return true;
    })
  ).subscribe({
    next: () => {},
    error: err => { error3 = err; }
  });
  assert(error3 instanceof Error && error3.message === 'Filter Error', 'Should propagate errors from predicate function.');

  // Test Case 4: Error/Complete Passthrough
  console.log('\n--- Test Case 4: Error/Complete Passthrough ---');
  const source4 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.error('Source Error');
    subscriber.complete();
  });
  let received4: number[] = [];
  let error4: any;
  let completed4 = false;
  source4.pipe(
    filter(x => true) // Always pass
  ).subscribe({
    next: v => received4.push(v),
    error: err => { error4 = err; },
    complete: () => { completed4 = true; }
  });
  assert(JSON.stringify(received4) === JSON.stringify([1]), 'Should pass through values before error.');
  assert(error4 === 'Source Error', 'Should pass through error notification.');
  assert(completed4 === false, 'Should not complete after error.');

  const source5 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.complete();
  });
  let received5: number[] = [];
  let completed5 = false;
  source5.pipe(
    filter(x => true) // Always pass
  ).subscribe({
    next: v => received5.push(v),
    complete: () => { completed5 = true; }
  });
  assert(JSON.stringify(received5) === JSON.stringify([1]), 'Should pass through values before complete.');
  assert(completed5 === true, 'Should pass through complete notification.');

  console.log('\n--- All Filter Operator tests completed ---');
};