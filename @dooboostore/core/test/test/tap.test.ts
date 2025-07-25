import { Observable } from '@dooboostore/core/message/Observable';
import { tap } from '@dooboostore/core/message/operators/tap';

export const tapTest = () => {
  console.log('--- Tap Operator Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Test Case 1: Tap on Next
  console.log('\n--- Test Case 1: Tap on Next ---');
  let tapNextCount = 0;
  const source1 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.complete();
  });
  const received1: number[] = [];
  source1.pipe(
    tap(v => { tapNextCount++; })
  ).subscribe(v => received1.push(v));
  assert(tapNextCount === 2, 'Tap should be called for each next emission.');
  assert(JSON.stringify(received1) === JSON.stringify([1, 2]), 'Values should be passed through.');

  // Test Case 2: Tap on Error
  console.log('\n--- Test Case 2: Tap on Error ---');
  let tapErrorCalled = false;
  let receivedError: any;
  const source2 = new Observable<string>(subscriber => {
    subscriber.next('data');
    subscriber.error('Error!');
  });
  source2.pipe(
    tap(null, err => { tapErrorCalled = true; })
  ).subscribe({
    next: () => {},
    error: err => { receivedError = err; }
  });
  assert(tapErrorCalled, 'Tap error handler should be called on error.');
  assert(receivedError === 'Error!', 'Error should be passed through.');

  // Test Case 3: Tap on Complete
  console.log('\n--- Test Case 3: Tap on Complete ---');
  let tapCompleteCalled = false;
  let completed: boolean = false;
  const source3 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.complete();
  });
  source3.pipe(
    tap(null, null, () => { tapCompleteCalled = true; })
  ).subscribe({
    next: () => {},
    complete: () => { completed = true; }
  });
  assert(tapCompleteCalled, 'Tap complete handler should be called on complete.');
  assert(completed, 'Complete should be passed through.');

  // Test Case 4: Tap with Observer Object
  console.log('\n--- Test Case 4: Tap with Observer Object ---');
  let tapNextCount4 = 0;
  let tapErrorCalled4 = false;
  let tapCompleteCalled4 = false;
  const source4 = new Observable<number>(subscriber => {
    subscriber.next(1);
    subscriber.error('Obj Error');
    subscriber.complete(); // Won't be called
  });
  let receivedError4: any;
  source4.pipe(
    tap({
      next: () => { tapNextCount4++; },
      error: () => { tapErrorCalled4 = true; },
      complete: () => { tapCompleteCalled4 = true; }
    })
  ).subscribe({
    next: () => {},
    error: err => { receivedError4 = err; }
  });
  assert(tapNextCount4 === 1, 'Tap next in object should be called.');
  assert(tapErrorCalled4, 'Tap error in object should be called.');
  assert(tapCompleteCalled4 === false, 'Tap complete in object should not be called after error.');
  assert(receivedError4 === 'Obj Error', 'Error should be passed through with object observer.');

  console.log('\n--- All Tap Operator tests completed ---');
};