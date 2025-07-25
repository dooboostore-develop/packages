import { BehaviorSubject } from '@dooboostore/core/message/BehaviorSubject';

export const behaviorSubjectTest = () => {
  console.log('--- BehaviorSubject Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Initial value
  console.log('\n--- Test Case 1: Initial value ---');
  const subject1 = new BehaviorSubject<string>('initial');
  assert(subject1.getValue() === 'initial', 'Constructor should set the initial value.');

  // Test Case 2: Emits current value to new subscribers
  console.log('\n--- Test Case 2: Emits current value to new subscribers ---');
  const subject2 = new BehaviorSubject<string>('current');
  let receivedValue2: string | undefined;
  subject2.subscribe(value => {
    receivedValue2 = value;
  });
  assert(receivedValue2 === 'current', 'New subscriber should immediately receive the current value.');

  // Test Case 3: Emits new values after subscription
  console.log('\n--- Test Case 3: Emits new values after subscription ---');
  const subject3 = new BehaviorSubject<number>(0);
  let receivedValue3: number | undefined;
  subject3.subscribe(value => {
    receivedValue3 = value;
  });
  assert(receivedValue3 === 0, 'Subscriber receives initial value.');
  subject3.next(1);
  assert(receivedValue3 === 1, 'Subscriber receives a new value after it is emitted.');
  subject3.next(2);
  assert(receivedValue3 === 2, 'Subscriber receives a second new value.');

  // Test Case 4: Multiple subscribers
  console.log('\n--- Test Case 4: Multiple subscribers ---');
  const subject4 = new BehaviorSubject<string>('A');
  let received4A: string | undefined;
  let received4B: string | undefined;

  subject4.subscribe(v => received4A = v);
  assert(received4A === 'A', 'First subscriber gets initial value.');

  subject4.next('B');
  assert(received4A === 'B', 'First subscriber gets new value.');

  subject4.subscribe(v => received4B = v);
  assert(received4B === 'B', 'Second subscriber gets current value upon subscription.');
  assert(received4A === 'B', 'First subscriber value remains unchanged.');

  subject4.next('C');
  assert(received4A === 'C', 'First subscriber gets the third value.');
  assert(received4B === 'C', 'Second subscriber also gets the third value.');

  console.log('\n--- All BehaviorSubject tests completed ---');
};