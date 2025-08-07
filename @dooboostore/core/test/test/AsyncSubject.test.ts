import { AsyncSubject } from '@dooboostore/core/message/AsyncSubject';

export const asyncSubjectTest = () => {
  console.log('--- AsyncSubject Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Emits only the last value on completion
  console.log('\n--- Test Case 1: Emits last value on completion ---');
  const subject1 = new AsyncSubject<string, any>();
  let receivedValue1: string | undefined;
  let completed1 = false;
  subject1.subscribe({
    next: v => { receivedValue1 = v; },
    complete: () => { completed1 = true; }
  });
  subject1.next('a');
  subject1.next('b');
  subject1.next('c');
  assert(receivedValue1 === undefined && !completed1, 'No value should be received before completion.');
  subject1.complete();
  assert(receivedValue1 === 'c', 'Should receive only the last value on completion.');
  assert(completed1, 'Should receive completion notification.');

  // Test Case 2: No value emitted if empty on completion
  console.log('\n--- Test Case 2: No value if empty on completion ---');
  const subject2 = new AsyncSubject<string, any>();
  let receivedNext2 = false;
  let completed2 = false;
  subject2.subscribe({
    next: () => { receivedNext2 = true; },
    complete: () => { completed2 = true; }
  });
  subject2.complete();
  assert(!receivedNext2, 'Should not receive any value if none was provided.');
  assert(completed2, 'Should still receive completion notification.');

  // Test Case 3: Late subscribers receive the last value
  console.log('\n--- Test Case 3: Late subscribers receive the last value ---');
  const subject3 = new AsyncSubject<number, any>();
  let receivedValue3: number | undefined;
  let completed3 = false;
  subject3.next(10);
  subject3.next(20);
  subject3.complete();
  subject3.subscribe({
    next: v => { receivedValue3 = v; },
    complete: () => { completed3 = true; }
  });
  assert(receivedValue3 === 20, 'Late subscriber should receive the last value.');
  assert(completed3, 'Late subscriber should receive completion notification.');

  // Test Case 4: Late subscribers receive only completion if no value
  console.log('\n--- Test Case 4: Late subscribers receive only completion ---');
  const subject4 = new AsyncSubject<number, any>();
  let receivedNext4 = false;
  let completed4 = false;
  subject4.complete();
  subject4.subscribe({
    next: () => { receivedNext4 = true; },
    complete: () => { completed4 = true; }
  });
  assert(!receivedNext4, 'Late subscriber should not receive a value.');
  assert(completed4, 'Late subscriber should receive completion.');

  console.log('\n--- All AsyncSubject tests completed ---');
};