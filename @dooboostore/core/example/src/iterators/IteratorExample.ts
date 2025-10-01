import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Range } from '@dooboostore/core/iterators/Range';

export class IteratorExample implements Runnable {
  run(): void {
    console.log('\n=== Iterator Example ===\n');
    
    console.log('1. Range iterator (0 to 5):');
    const range1 = new Range(0, 5);
    console.log('  Values:', Array.from(range1));
    
    console.log('\n2. Range with step (0 to 10, step 2):');
    const range2 = new Range(0, 10, 2);
    console.log('  Values:', Array.from(range2));
    
    console.log('\n3. Range with negative step (10 to 0, step -2):');
    const range3 = new Range(10, 0, -2);
    console.log('  Values:', Array.from(range3));
    
    console.log('\n4. Using range in for...of loop:');
    console.log('  Squares of 1 to 5:');
    for (const num of new Range(1, 6)) {
      console.log(`    ${num}² = ${num * num}`);
    }
    
    console.log('\n5. Range operations:');
    const range4 = new Range(1, 11);
    const filtered = Array.from(range4).filter(n => n % 2 === 0);
    console.log('  Even numbers from 1 to 10:', filtered);
    
    const mapped = Array.from(new Range(1, 6)).map(n => n * 2);
    console.log('  Doubled values of 1 to 5:', mapped);
    
    console.log('\n6. Sum using range:');
    const sum = Array.from(new Range(1, 101)).reduce((a, b) => a + b, 0);
    console.log('  Sum of 1 to 100:', sum);
    
    console.log('\n=========================\n');
  }
}
