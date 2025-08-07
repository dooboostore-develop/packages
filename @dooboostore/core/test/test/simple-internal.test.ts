import { 
  of, 
  fromArray, 
  empty, 
  range, 
  defer,
  skip,
  take,
  startWith
} from '../../src/message/internal';

export const simpleInternalTest = () => {
  console.log('--- Simple Internal Functions Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing basic of function ---');
    
    const values1: number[] = [];
    of(1, 2, 3).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 3, 'of should emit 3 values');
        assert(values1[0] === 1 && values1[1] === 2 && values1[2] === 3, 'of should emit correct values');
        testFromArray();
      }
    });

    function testFromArray() {
      console.log('\n--- Testing fromArray function ---');
      
      const values2: string[] = [];
      fromArray(['a', 'b', 'c']).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          assert(values2.length === 3, 'fromArray should emit 3 values');
          assert(values2.join('') === 'abc', 'fromArray should emit correct values');
          testEmpty();
        }
      });
    }

    function testEmpty() {
      console.log('\n--- Testing empty function ---');
      
      let nextCalled = false;
      let completeCalled = false;
      empty().subscribe({
        next: () => nextCalled = true,
        complete: () => {
          completeCalled = true;
          assert(!nextCalled, 'empty should not emit values');
          assert(completeCalled, 'empty should complete');
          testRange();
        }
      });
    }

    function testRange() {
      console.log('\n--- Testing range function ---');
      
      const values3: number[] = [];
      range(5, 3).subscribe({
        next: (value) => values3.push(value),
        complete: () => {
          assert(values3.length === 3, 'range should emit 3 values');
          assert(values3[0] === 5 && values3[1] === 6 && values3[2] === 7, 'range should emit correct sequence');
          testSkip();
        }
      });
    }

    function testSkip() {
      console.log('\n--- Testing skip operator ---');
      
      const values4: number[] = [];
      of(1, 2, 3, 4, 5).pipe(
        skip(2)
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 3, 'skip should emit 3 values after skipping 2');
          assert(values4[0] === 3, 'first value after skip should be 3');
          testTake();
        }
      });
    }

    function testTake() {
      console.log('\n--- Testing take operator ---');
      
      const values5: number[] = [];
      range(1, 10).pipe(
        take(3)
      ).subscribe({
        next: (value) => values5.push(value),
        complete: () => {
          assert(values5.length === 3, 'take should emit exactly 3 values');
          assert(values5[0] === 1 && values5[1] === 2 && values5[2] === 3, 'take should emit first 3 values');
          testStartWith();
        }
      });
    }

    function testStartWith() {
      console.log('\n--- Testing startWith operator ---');
      
      const values6: any[] = [];
      of('world').pipe(
        startWith('hello', ' ')
      ).subscribe({
        next: (value) => values6.push(value),
        complete: () => {
          assert(values6.length === 3, 'startWith should emit 3 values total');
          assert(values6[0] === 'hello', 'first value should be from startWith');
          assert(values6[1] === ' ', 'second value should be from startWith');
          assert(values6[2] === 'world', 'third value should be from source');
          testSimpleDefer();
        }
      });
    }

    function testSimpleDefer() {
      console.log('\n--- Testing simple defer function ---');
      
      let callCount = 0;
      const deferredObs = defer(() => {
        callCount++;
        return of(`result-${callCount}`);
      });

      deferredObs.subscribe({
        next: (value) => {
          assert(value === 'result-1', 'defer should emit result-1');
          assert(callCount === 1, 'factory should be called once');
        },
        complete: () => {
          console.log('\n--- Testing defer second subscription ---');
          deferredObs.subscribe({
            next: (value) => {
              assert(value === 'result-2', 'defer should emit result-2 on second subscription');
              assert(callCount === 2, 'factory should be called twice');
            },
            complete: () => {
              console.log('\n--- All simple internal tests completed ---');
              resolve();
            }
          });
        }
      });
    }
  });
};