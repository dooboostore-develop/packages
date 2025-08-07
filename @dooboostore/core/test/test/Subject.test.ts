import { Subject } from '@dooboostore/core/message/Subject';
import { Observable } from '@dooboostore/core/message/Observable'; // Still needed for asObservable() return type

export const subjectTest = () => {
  console.log('--- Subject Test (Refactored) ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic Multicasting
  console.log('\n--- Test Case 1: Basic Multicasting ---');
  const subject1 = new Subject<string>();
  let received1A: string | undefined;
  let received1B: string | undefined;

  subject1.subscribe(value => { received1A = value; });
  subject1.subscribe(value => { received1B = value; });

  subject1.next('hello');

  assert(received1A === 'hello', 'First observer should receive the value.');
  assert(received1B === 'hello', 'Second observer should receive the value.');

  // Test Case 2: Error Handling
  console.log('\n--- Test Case 2: Error Handling ---');
  const subject2 = new Subject<number>();
  let error2A: any;
  let error2B: any;
  let next2A: number[] = [];
  let next2B: number[] = [];

  subject2.subscribe({
    next: v => next2A.push(v),
    error: err => error2A = err
  });
  subject2.subscribe({
    next: v => next2B.push(v),
    error: err => error2B = err
  });

  subject2.next(1);
  subject2.error('Test Error');
  subject2.next(2); // Should be ignored

  assert(JSON.stringify(next2A) === JSON.stringify([1]), 'Observer A should receive value before error.');
  assert(error2A === 'Test Error', 'Observer A should receive error.');
  assert(JSON.stringify(next2B) === JSON.stringify([1]), 'Observer B should receive value before error.');
  assert(error2B === 'Test Error', 'Observer B should receive error.');

  // Test Case 2.1: Late subscriber to errored subject
  console.log('\n--- Test Case 2.1: Late subscriber to errored subject ---');
  let error2_1: any;
  subject2.subscribe({
    next: () => {},
    error: err => error2_1 = err
  });
  assert(error2_1 === 'Test Error', 'Late subscriber should receive error immediately.');

  // Test Case 3: Completion Handling
  console.log('\n--- Test Case 3: Completion Handling ---');
  const subject3 = new Subject<string>();
  let completed3A = false;
  let completed3B = false;
  let next3A: string[] = [];

  subject3.subscribe({
    next: v => next3A.push(v),
    complete: () => completed3A = true
  });
  subject3.subscribe({
    next: () => {},
    complete: () => completed3B = true
  });

  subject3.next('data');
  subject3.complete();
  subject3.next('more data'); // Should be ignored

  assert(JSON.stringify(next3A) === JSON.stringify(['data']), 'Observer A should receive value before complete.');
  assert(completed3A, 'Observer A should receive complete.');
  assert(completed3B, 'Observer B should receive complete.');

  // Test Case 3.1: Late subscriber to completed subject
  console.log('\n--- Test Case 3.1: Late subscriber to completed subject ---');
  let completed3_1 = false;
  subject3.subscribe({
    next: () => {},
    complete: () => completed3_1 = true
  });
  assert(completed3_1, 'Late subscriber should receive complete immediately.');

  // Test Case 4: Unsubscription
  console.log('\n--- Test Case 4: Unsubscription ---');
  const subject4 = new Subject<number>();
  let received4A: number[] = [];
  let received4B: number[] = [];

  const sub4A = subject4.subscribe(v => received4A.push(v));
  const sub4B = subject4.subscribe(v => received4B.push(v));

  subject4.next(1);
  assert(JSON.stringify(received4A) === JSON.stringify([1]), 'Observer A receives first value.');
  assert(JSON.stringify(received4B) === JSON.stringify([1]), 'Observer B receives first value.');

  sub4A.unsubscribe();
  subject4.next(2);
  assert(JSON.stringify(received4A) === JSON.stringify([1]), 'Observer A should not receive second value after unsubscribe.');
  assert(JSON.stringify(received4B) === JSON.stringify([1, 2]), 'Observer B receives second value.');

  // Test Case 5: asObservable()
  console.log('\n--- Test Case 5: asObservable() ---');
  const subject5 = new Subject<string>();
  const observable5 = subject5.asObservable();

  // Should not be able to call next/error/complete directly on observable5
  // observable5.next('test'); // This would be a compile-time error

  let received5: string | undefined;
  observable5.subscribe(v => received5 = v);
  subject5.next('from subject');
  assert(received5 === 'from subject', 'Observable from asObservable() should receive values.');

  console.log('\n--- All Subject tests completed (Refactored) ---');
};