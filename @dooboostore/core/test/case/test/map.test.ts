import { Observable } from '@dooboostore/core/message/Observable';
import { map } from '@dooboostore/core/message/operators/map';

export const mapTest = () => {
  console.log('--- Map Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic Mapping
  console.log('\n--- Test Case 1: Basic Mapping ---');
  const source1 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });
  const received1: number[] = [];
  source1.pipe(
    map(x => x * 2)
  ).subscribe(v => received1.push(v));
  assert(JSON.stringify(received1) === JSON.stringify([2, 4, 6]), 'Should map values correctly.');

  // Test Case 2: Mapping with Index
  console.log('\n--- Test Case 2: Mapping with Index ---');
  const source2 = new Observable<string>(subscriber => {
    subscriber.next('a');
    subscriber.next('b');
    subscriber.complete();
  });
  const received2: string[] = [];
  source2.pipe(
    map((value, index) => `${value}${index}`)
  ).subscribe(v => received2.push(v));
  assert(JSON.stringify(received2) === JSON.stringify(['a0', 'b1']), 'Should map values using index.');

  // Test Case 3: Error Handling in Projection
  console.log('\n--- Test Case 3: Error Handling in Projection ---');
  const source3 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.complete();
  });
  let error3: any;
  source3.pipe(
    map(x => {
      if (x === 2) throw new Error('Test Error');
      return x;
    })
  ).subscribe({
    next: () => {},
    error: err => { error3 = err; }
  });
  assert(error3 instanceof Error && error3.message === 'Test Error', 'Should propagate errors from projection function.');

  // Test Case 4: Error/Complete Passthrough
  console.log('\n--- Test Case 4: Error/Complete Passthrough ---');
  const source4 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.error('Error from source');
    subscriber.complete(); // This won't be called
  });
  let received4: number[] = [];
  let error4: any;
  let completed4 = false;
  source4.pipe(
    map(x => x * 10)
  ).subscribe({
    next: v => received4.push(v),
    error: err => { error4 = err; },
    complete: () => { completed4 = true; }
  });
  assert(JSON.stringify(received4) === JSON.stringify([10]), 'Should pass through values before error.');
  assert(error4 === 'Error from source', 'Should pass through error notification.');
  assert(completed4 === false, 'Should not complete after error.');

  const source5 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.complete();
  });
  let received5: number[] = [];
  let completed5 = false;
  source5.pipe(
    map(x => x * 10)
  ).subscribe({
    next: v => received5.push(v),
    complete: () => { completed5 = true; }
  });
  assert(JSON.stringify(received5) === JSON.stringify([10]), 'Should pass through values before complete.');
  assert(completed5 === true, 'Should pass through complete notification.');

  console.log('\n--- All Map Operator tests completed ---');
};