import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Range } from '@dooboostore/core/iterators/Range';

export class IteratorExample implements Runnable {
  run(): void {
    console.log('\n=== Range Iterator Example ===\n');
    
    // Basic range examples
    console.log('1. Basic Range:');
    const range1 = Range.range(5);
    console.log('  Range(5):', Array.from(range1));
    
    const range2 = Range.range(1, 10);
    console.log('  Range(1, 10):', Array.from(range2));
    
    const range3 = Range.range(0, 20, 2);
    console.log('  Range(0, 20, 2):', Array.from(range3));
    
    // String range examples
    console.log('\n2. String Range:');
    const stringRange1 = Range.range('1..10');
    console.log('  Range("1..10"):', Array.from(stringRange1));
    
    const stringRange2 = Range.range('0..20,2');
    console.log('  Range("0..20,2"):', Array.from(stringRange2));
    
    const stringRange3 = Range.range('10..1');
    console.log('  Range("10..1"):', Array.from(stringRange3));
    
    // Range mapping
    console.log('\n3. Range Mapping:');
    const range = Range.range(1, 6);
    const squares = range.map(n => n * n);
    console.log('  Range(1, 6):', Array.from(range));
    console.log('  Squares:', squares);
    
    const evens = range.map(n => n * 2);
    console.log('  Even numbers:', evens);
    
    // Iterator usage
    console.log('\n4. Iterator Usage:');
    const iterator = Range.range(1, 5)[Symbol.iterator]();
    console.log('  Manual iteration:');
    let result = iterator.next();
    while (!result.done) {
      console.log(`    Value: ${result.value}, Done: ${result.done}`);
      result = iterator.next();
    }
    console.log(`    Final: Value: ${result.value}, Done: ${result.done}`);
    
    // For-of loop
    console.log('\n5. For-of Loop:');
    console.log('  Iterating Range(10, 20, 2):');
    for (const value of Range.range(10, 20, 2)) {
      console.log(`    ${value}`);
    }
    
    // Negative ranges
    console.log('\n6. Negative Ranges:');
    const negativeRange = Range.range(10, 1);
    console.log('  Range(10, 1):', Array.from(negativeRange));
    
    const negativeStepRange = Range.range(10, 1, -1);
    console.log('  Range(10, 1, -1):', Array.from(negativeStepRange));
    
    // Large ranges (limited output)
    console.log('\n7. Large Ranges:');
    const largeRange = Range.range(0, 100, 10);
    console.log('  Range(0, 100, 10) - first 5 values:', Array.from(largeRange).slice(0, 5));
    console.log('  Total count:', Array.from(largeRange).length);
    
    // Range properties
    console.log('\n8. Range Properties:');
    const testRange = Range.range(5, 15, 2);
    console.log('  Range(5, 15, 2):');
    console.log(`    First: ${testRange.first}`);
    console.log(`    Last: ${testRange.last}`);
    console.log(`    Step: ${testRange.step}`);
    console.log(`    Is Range: ${testRange.isRange}`);
    
    // Practical examples
    console.log('\n9. Practical Examples:');
    
    // Generate IDs
    const idRange = Range.range(1000, 1005);
    const ids = Array.from(idRange).map(n => `user_${n}`);
    console.log('  Generated IDs:', ids);
    
    // Generate coordinates
    const coordRange = Range.range(0, 3);
    const coordinates = Array.from(coordRange).map(x => 
      Array.from(coordRange).map(y => ({ x, y }))
    ).flat();
    console.log('  Coordinates (0,0 to 2,2):', coordinates);
    
    // Generate time slots
    const timeRange = Range.range(9, 18, 2);
    const timeSlots = Array.from(timeRange).map(hour => `${hour}:00 - ${hour + 2}:00`);
    console.log('  Time slots:', timeSlots);
    
    console.log('\n=========================\n');
  }
}