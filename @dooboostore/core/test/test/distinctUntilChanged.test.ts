import { Observable } from '@dooboostore/core/message/Observable';
import { distinctUntilChanged } from '@dooboostore/core/message/operators/distinctUntilChanged';

export const distinctUntilChangedTest = () => {
  console.log('--- DistinctUntilChanged Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic Distinct
  console.log('\n--- Test Case 1: Basic Distinct ---');
  const source1 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(2);
    subscriber.next(1);
    subscriber.complete();
  });
  const received1: number[] = [];
  source1.pipe(
    distinctUntilChanged()
  ).subscribe(v => received1.push(v));
  // console.log('--------', received1)
  assert(JSON.stringify(received1) === JSON.stringify([1, 2, 1]), 'Should filter out consecutive duplicate values.');

  // Test Case 2: Custom Comparator
  console.log('\n--- Test Case 2: Custom Comparator ---');
  const source2 = new Observable<{ value: number }>(subscriber => {
    subscriber.next({ value: 1 });
    subscriber.next({ value: 1 }); // Different object, same value
    subscriber.next({ value: 2 });
    subscriber.next({ value: 2 });
    subscriber.next({ value: 1 });
    subscriber.complete();
  });
  const received2: { value: number }[] = [];
  source2.pipe(
    distinctUntilChanged((prev, curr) => prev.value === curr.value)
  ).subscribe(v => received2.push(v));
  assert(JSON.stringify(received2) === JSON.stringify([{ value: 1 }, { value: 2 }, { value: 1 }]), 'Should filter using custom comparator.');

  // Test Case 3: Error/Complete Passthrough
  console.log('\n--- Test Case 3: Error/Complete Passthrough ---');
  const source3 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(1);
    subscriber.error('Test Error');
    subscriber.complete();
  });
  let received3: number[] = [];
  let error3: any;
  let completed3 = false;
  source3.pipe(
    distinctUntilChanged()
  ).subscribe({
    next: v => received3.push(v),
    error: err => { error3 = err; },
    complete: () => { completed3 = true; }
  });
  assert(JSON.stringify(received3) === JSON.stringify([1]), 'Should pass through values before error.');
  assert(error3 === 'Test Error', 'Should pass through error notification.');
  assert(completed3 === false, 'Should not complete after error.');

  const source4 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(1);
    subscriber.complete();
  });
  let received4: number[] = [];
  let completed4 = false;
  source4.pipe(
    distinctUntilChanged()
  ).subscribe({
    next: v => received4.push(v),
    complete: () => { completed4 = true; }
  });
  assert(JSON.stringify(received4) === JSON.stringify([1]), 'Should pass through values before complete.');
  assert(completed4, 'Should pass through complete notification.');

  console.log('\n--- All DistinctUntilChanged Operator tests completed ---');
};