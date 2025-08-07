import { 
  skip, 
  takeWhile, 
  startWith, 
  concat, 
  merge, 
  of, 
  range 
} from '../../src/message/internal';

export const internalOperatorsTest = () => {
  console.log('--- Internal Operators Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Testing skip operator ---');

    // Test Case 1: skip operator
    console.log('\n--- Test Case 1: skip operator ---');
    const values1: number[] = [];
    of(1, 2, 3, 4, 5).pipe(
      skip(2)
    ).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 3, 'Should skip first 2 values');
        assert(values1[0] === 3, 'First emitted value should be 3');
        assert(values1[1] === 4, 'Second emitted value should be 4');
        assert(values1[2] === 5, 'Third emitted value should be 5');
        testTakeWhileOperator();
      }
    });

    function testTakeWhileOperator() {
      console.log('\n--- Testing takeWhile operator ---');

      // Test Case 2: takeWhile operator
      console.log('\n--- Test Case 2: takeWhile operator ---');
      const values2: number[] = [];
      of(1, 2, 3, 4, 5).pipe(
        takeWhile(x => x < 4)
      ).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          assert(values2.length === 3, 'Should take while condition is true');
          assert(values2[0] === 1, 'First value should be 1');
          assert(values2[1] === 2, 'Second value should be 2');
          assert(values2[2] === 3, 'Third value should be 3');

          // Test Case 3: takeWhile with inclusive
          console.log('\n--- Test Case 3: takeWhile with inclusive ---');
          const values3: number[] = [];
          of(1, 2, 3, 4, 5).pipe(
            takeWhile(x => x < 4, true)
          ).subscribe({
            next: (value) => values3.push(value),
            complete: () => {
              assert(values3.length === 4, 'Should include the value that failed predicate');
              assert(values3[3] === 4, 'Should include the failing value');
              testStartWithOperator();
            }
          });
        }
      });
    }

    function testStartWithOperator() {
      console.log('\n--- Testing startWith operator ---');

      // Test Case 4: startWith operator
      console.log('\n--- Test Case 4: startWith operator ---');
      const values4: any[] = [];
      of('world').pipe(
        startWith('hello', ' ')
      ).subscribe({
        next: (value) => values4.push(value),
        complete: () => {
          assert(values4.length === 3, 'Should emit starting values first');
          assert(values4[0] === 'hello', 'First value should be "hello"');
          assert(values4[1] === ' ', 'Second value should be " "');
          assert(values4[2] === 'world', 'Third value should be "world"');
          testConcatFunction();
        }
      });
    }

    function testConcatFunction() {
      console.log('\n--- Testing concat function ---');

      // Test Case 5: concat function
      console.log('\n--- Test Case 5: concat function ---');
      const values5: number[] = [];
      concat(
        of(1, 2),
        of(3, 4),
        of(5, 6)
      ).subscribe({
        next: (value) => values5.push(value),
        complete: () => {
          assert(values5.length === 6, 'Should emit all values sequentially');
          assert(values5[0] === 1, 'First value should be 1');
          assert(values5[1] === 2, 'Second value should be 2');
          assert(values5[2] === 3, 'Third value should be 3');
          assert(values5[3] === 4, 'Fourth value should be 4');
          assert(values5[4] === 5, 'Fifth value should be 5');
          assert(values5[5] === 6, 'Sixth value should be 6');
          testMergeFunction();
        }
      });
    }

    function testMergeFunction() {
      console.log('\n--- Testing merge function ---');

      // Test Case 6: merge function
      console.log('\n--- Test Case 6: merge function ---');
      const values6: number[] = [];
      merge(
        of(1, 3, 5),
        of(2, 4, 6)
      ).subscribe({
        next: (value) => values6.push(value),
        complete: () => {
          assert(values6.length === 6, 'Should emit all values from all sources');
          // Note: merge emits concurrently, so order might vary
          // We'll just check that all values are present
          const sortedValues = values6.sort();
          assert(sortedValues[0] === 1, 'Should contain value 1');
          assert(sortedValues[1] === 2, 'Should contain value 2');
          assert(sortedValues[2] === 3, 'Should contain value 3');
          assert(sortedValues[3] === 4, 'Should contain value 4');
          assert(sortedValues[4] === 5, 'Should contain value 5');
          assert(sortedValues[5] === 6, 'Should contain value 6');
          testComplexChaining();
        }
      });
    }

    function testComplexChaining() {
      console.log('\n--- Testing complex operator chaining ---');

      // Test Case 7: Complex chaining
      console.log('\n--- Test Case 7: Complex chaining ---');
      const values7: number[] = [];
      range(1, 10).pipe(
        skip(2),           // Skip first 2: [3,4,5,6,7,8,9,10]
        takeWhile(x => x < 8), // Take while < 8: [3,4,5,6,7]
        startWith(0)       // Start with 0: [0,3,4,5,6,7]
      ).subscribe({
        next: (value) => values7.push(value),
        complete: () => {
          assert(values7.length === 6, 'Should have 6 values after chaining');
          assert(values7[0] === 0, 'First value should be 0 (from startWith)');
          assert(values7[1] === 3, 'Second value should be 3');
          assert(values7[2] === 4, 'Third value should be 4');
          assert(values7[3] === 5, 'Fourth value should be 5');
          assert(values7[4] === 6, 'Fifth value should be 6');
          assert(values7[5] === 7, 'Sixth value should be 7');

          console.log('\n--- All internal operators tests completed ---');
          resolve();
        }
      });
    }
  });
};