import { scan, reduce } from '../../src/message/operators';
import { of, empty, throwError } from '../../src/message/internal';

export const scanReduceTest = () => {
  console.log('--- Scan & Reduce Operators Test ---');

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  return new Promise<void>((resolve) => {
    console.log('\n--- Test Case 1: Basic scan functionality ---');
    
    const values1: number[] = [];
    of(1, 2, 3, 4).pipe(
      scan((acc, val) => acc + val, 0)
    ).subscribe({
      next: (value) => values1.push(value),
      complete: () => {
        assert(values1.length === 4, 'Scan should emit intermediate results');
        assert(values1[0] === 1, 'First scan result should be 1 (0+1)');
        assert(values1[1] === 3, 'Second scan result should be 3 (1+2)');
        assert(values1[2] === 6, 'Third scan result should be 6 (3+3)');
        assert(values1[3] === 10, 'Fourth scan result should be 10 (6+4)');
        testScanWithoutSeed();
      }
    });

    function testScanWithoutSeed() {
      console.log('\n--- Test Case 2: Scan without seed ---');
      
      const values2: number[] = [];
      of(1, 2, 3, 4).pipe(
        scan((acc, val) => acc + val)
      ).subscribe({
        next: (value) => values2.push(value),
        complete: () => {
          assert(values2.length === 4, 'Scan without seed should emit all values');
          assert(values2[0] === 1, 'First value should be the first source value');
          assert(values2[1] === 3, 'Second value should be 1+2');
          assert(values2[2] === 6, 'Third value should be 3+3');
          assert(values2[3] === 10, 'Fourth value should be 6+4');
          testScanWithIndex();
        }
      });
    }

    function testScanWithIndex() {
      console.log('\n--- Test Case 3: Scan with index parameter ---');
      
      const values3: string[] = [];
      of('a', 'b', 'c').pipe(
        scan((acc, val, index) => `${acc}-${val}${index}`, 'start')
      ).subscribe({
        next: (value) => values3.push(value),
        complete: () => {
          assert(values3.length === 3, 'Should emit 3 accumulated values');
          assert(values3[0] === 'start-a0', 'Should include index in accumulation');
          assert(values3[1] === 'start-a0-b1', 'Should continue accumulation with index');
          assert(values3[2] === 'start-a0-b1-c2', 'Should complete accumulation with index');
          testScanError();
        }
      });
    }

    function testScanError() {
      console.log('\n--- Test Case 4: Scan error handling ---');
      
      const values4: number[] = [];
      let errorReceived = false;
      
      of(1, 2, 3).pipe(
        scan((acc, val) => {
          if (val === 2) {
            throw new Error('Scan error');
          }
          return acc + val;
        }, 0)
      ).subscribe({
        next: (value) => values4.push(value),
        error: (err) => {
          errorReceived = true;
          assert(values4.length === 1, 'Should emit values before error');
          assert(values4[0] === 1, 'Should emit first accumulated value');
          assert(err.message === 'Scan error', 'Should propagate accumulator error');
          testBasicReduce();
        }
      });
    }

    function testBasicReduce() {
      console.log('\n--- Test Case 5: Basic reduce functionality ---');
      
      const values5: number[] = [];
      of(1, 2, 3, 4).pipe(
        reduce((acc, val) => acc + val, 0)
      ).subscribe({
        next: (value) => values5.push(value),
        complete: () => {
          assert(values5.length === 1, 'Reduce should emit only final result');
          assert(values5[0] === 10, 'Reduce result should be sum of all values');
          testReduceWithoutSeed();
        }
      });
    }

    function testReduceWithoutSeed() {
      console.log('\n--- Test Case 6: Reduce without seed ---');
      
      const values6: number[] = [];
      of(1, 2, 3, 4).pipe(
        reduce((acc, val) => acc * val)
      ).subscribe({
        next: (value) => values6.push(value),
        complete: () => {
          assert(values6.length === 1, 'Reduce without seed should emit one value');
          assert(values6[0] === 24, 'Should multiply all values (1*2*3*4=24)');
          testReduceEmpty();
        }
      });
    }

    function testReduceEmpty() {
      console.log('\n--- Test Case 7: Reduce with empty source ---');
      
      let errorReceived = false;
      empty().pipe(
        reduce((acc, val) => acc + val)
      ).subscribe({
        next: () => assert(false, 'Should not emit for empty source without seed'),
        error: (err) => {
          errorReceived = true;
          assert(err.message.includes('empty sequence'), 'Should error for empty sequence without seed');
          testReduceEmptyWithSeed();
        }
      });
    }

    function testReduceEmptyWithSeed() {
      console.log('\n--- Test Case 8: Reduce with empty source and seed ---');
      
      const values8: number[] = [];
      empty().pipe(
        reduce((acc, val) => acc + val, 42)
      ).subscribe({
        next: (value) => values8.push(value),
        complete: () => {
          assert(values8.length === 1, 'Should emit seed value for empty source');
          assert(values8[0] === 42, 'Should emit the seed value');
          testReduceError();
        }
      });
    }

    function testReduceError() {
      console.log('\n--- Test Case 9: Reduce error handling ---');
      
      let errorReceived = false;
      of(1, 2, 3).pipe(
        reduce((acc, val) => {
          if (val === 2) {
            throw new Error('Reduce error');
          }
          return acc + val;
        }, 0)
      ).subscribe({
        next: () => assert(false, 'Should not emit when accumulator throws'),
        error: (err) => {
          errorReceived = true;
          assert(err.message === 'Reduce error', 'Should propagate accumulator error');
          testScanReduceComparison();
        }
      });
    }

    function testScanReduceComparison() {
      console.log('\n--- Test Case 10: Scan vs Reduce comparison ---');
      
      const scanValues: number[] = [];
      const reduceValues: number[] = [];
      let scanCompleted = false;
      let reduceCompleted = false;
      
      const checkCompletion = () => {
        if (scanCompleted && reduceCompleted) {
          assert(scanValues.length === 3, 'Scan should emit 3 intermediate values');
          assert(reduceValues.length === 1, 'Reduce should emit 1 final value');
          assert(scanValues[2] === reduceValues[0], 'Final scan value should equal reduce value');
          assert(scanValues[0] === 1 && scanValues[1] === 3 && scanValues[2] === 6, 'Scan should show progression');
          assert(reduceValues[0] === 6, 'Reduce should show final result');
          
          console.log('\n--- All scan & reduce tests completed ---');
          resolve();
        }
      };

      // Test scan
      of(1, 2, 3).pipe(
        scan((acc, val) => acc + val, 0)
      ).subscribe({
        next: (value) => scanValues.push(value),
        complete: () => {
          scanCompleted = true;
          checkCompletion();
        }
      });

      // Test reduce
      of(1, 2, 3).pipe(
        reduce((acc, val) => acc + val, 0)
      ).subscribe({
        next: (value) => reduceValues.push(value),
        complete: () => {
          reduceCompleted = true;
          checkCompletion();
        }
      });
    }
  });
};