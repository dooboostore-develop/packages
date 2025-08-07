import { Observable } from '@dooboostore/core/message/Observable';
import { map } from '@dooboostore/core/message/operators/map';
import { filter } from '@dooboostore/core/message/operators/filter';
import { tap } from '@dooboostore/core/message/operators/tap';

export const pipeTest = () => {
  console.log('--- Pipe Method Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Basic Chaining
  console.log('\n--- Test Case 1: Basic Chaining ---');
  const source1 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.next(4);
    subscriber.complete();
  });
  const received1: string[] = [];
  source1.pipe(
    filter(x => x % 2 === 0), // 2, 4
    map(x => x * 10),         // 20, 40
    tap(x => received1.push(String(x))) // Convert to string for assertion
  ).subscribe(it => {
    console.log('------->',it)
  });
  assert(JSON.stringify(received1) === JSON.stringify(['20', '40']), 'Should correctly chain multiple operators.');

  // Test Case 2: Empty Pipe
  console.log('\n--- Test Case 2: Empty Pipe ---');
  const source2 = new Observable<number>(subscriber => {
    subscriber.next(10);
    subscriber.complete();
  });
  const received2: number[] = [];
  const piped2 = source2.pipe();
  piped2.subscribe(v => received2.push(v));
  assert(JSON.stringify(received2) === JSON.stringify([10]), 'Calling pipe with no arguments should return the original observable.');
  assert(piped2 === source2, 'Empty pipe should return the same observable instance.');

  // Test Case 3: Error Propagation
  console.log('\n--- Test Case 3: Error Propagation ---');
  const source3 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.error('Pipe Error');
  });
  let error3: any;
  source3.pipe(
    map(x => x * 2),
    filter(x => true)
  ).subscribe({
    next: () => {},
    error: err => error3 = err
  });
  assert(error3 === 'Pipe Error', 'Errors should propagate through the pipe.');

  // Test Case 4: Completion Propagation
  console.log('\n--- Test Case 4: Completion Propagation ---');
  const source4 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.complete();
  });
  let completed4 = false;
  source4.pipe(
    map(x => x * 2),
    filter(x => true)
  ).subscribe({
    next: () => {},
    complete: () => completed4 = true
  });
  assert(completed4, 'Completion should propagate through the pipe.');

  console.log('\n--- All Pipe Method tests completed ---');
};