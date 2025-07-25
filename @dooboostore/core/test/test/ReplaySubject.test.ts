import { ReplaySubject } from '@dooboostore/core/message/ReplaySubject';

export const replaySubjectTest = () => {
  console.log('--- ReplaySubject Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Replays buffered values to new subscribers
  console.log('\n--- Test Case 1: Replays buffered values ---');
  const subject1 = new ReplaySubject<number>(3);
  const receivedValues1: number[] = [];
  subject1.next(1);
  subject1.next(2);
  subject1.next(3);
  subject1.subscribe(v => receivedValues1.push(v));
  assert(JSON.stringify(receivedValues1) === JSON.stringify([1, 2, 3]), 'New subscriber receives buffered values.');

  // Test Case 2: Respects buffer size
  console.log('\n--- Test Case 2: Respects buffer size ---');
  const subject2 = new ReplaySubject<number>(2);
  const receivedValues2: number[] = [];
  subject2.next(1);
  subject2.next(2);
  subject2.next(3); // This should push '1' out of the buffer
  subject2.subscribe(v => receivedValues2.push(v));
  assert(JSON.stringify(receivedValues2) === JSON.stringify([2, 3]), 'Subscriber receives values within the buffer size limit.');

  // Test Case 3: Receives new values after replay
  console.log('\n--- Test Case 3: Receives new values after replay ---');
  const subject3 = new ReplaySubject<string>(2);
  const receivedValues3: string[] = [];
  subject3.next('a');
  subject3.next('b');
  subject3.subscribe(v => receivedValues3.push(v));
  assert(JSON.stringify(receivedValues3) === JSON.stringify(['a', 'b']), 'Subscriber receives replayed values.');
  subject3.next('c');
  assert(JSON.stringify(receivedValues3) === JSON.stringify(['a', 'b', 'c']), 'Subscriber also receives new values.');

  // Test Case 4: Subscribing to an empty ReplaySubject
  console.log('\n--- Test Case 4: Subscribing to an empty subject ---');
  const subject4 = new ReplaySubject<any>();
  const receivedValues4: any[] = [];
  subject4.subscribe(v => receivedValues4.push(v));
  assert(receivedValues4.length === 0, 'Subscribing to an empty subject results in no immediate emissions.');
  subject4.next('first');
  assert(receivedValues4[0] === 'first', 'It receives values after they are emitted.');

  console.log('\n--- All ReplaySubject tests completed ---');
};