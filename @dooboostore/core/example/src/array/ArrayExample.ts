import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ArrayUtils } from '@dooboostore/core/array/ArrayUtils';

export class ArrayExample implements Runnable {
  run(): void {
    console.log('\n=== Array Utils Example ===\n');
    
    // Create 2D Array example
    console.log('1. Create 2D Array:');
    const grid = ArrayUtils.create2DArray(3, 3, (row, col) => `(${row},${col})`);
    console.log('  3x3 Grid:', grid);
    
    // Shuffle example
    console.log('\n2. Shuffle Array:');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log('  Original:', numbers);
    console.log('  Shuffled:', ArrayUtils.toShuffle(numbers));
    console.log('  Original (unchanged):', numbers);
    
    // Pick random elements
    console.log('\n3. Pick Random Elements:');
    const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
    console.log('  Fruits:', fruits);
    console.log('  Pick one:', ArrayUtils.pick(fruits));
    console.log('  Pick three:', ArrayUtils.pick(fruits, 3));
    
    // Pop pick (removes from original)
    console.log('\n4. Pop Pick (removes from array):');
    const colors = ['Red', 'Green', 'Blue', 'Yellow'];
    console.log('  Original colors:', colors);
    const picked = ArrayUtils.popPick(colors);
    console.log('  Picked color:', picked);
    console.log('  Remaining colors:', colors);
    
    // Chance pick with weighted selection
    console.log('\n5. Chance Pick (weighted selection):');
    const weightedItems = [
      { data: 'Common Item', chance: 0.7 },
      { data: 'Rare Item', chance: 0.2 },
      { data: 'Legendary Item', chance: 0.1 }
    ];
    console.log('  Weighted items:', weightedItems);
    console.log('  Picked item:', ArrayUtils.chancePick(weightedItems));
    
    // Array operations
    console.log('\n6. Array Operations:');
    const numbers1 = [1, 2, 3, 4, 5];
    const numbers2 = [4, 5, 6, 7, 8];
    console.log('  Array 1:', numbers1);
    console.log('  Array 2:', numbers2);
    
    const relations = ArrayUtils.relation(numbers1, numbers2);
    console.log('  Intersection (common elements):', relations.intersection);
    console.log('  Union (all unique elements):', relations.union);
    console.log('  Difference (only in array 1):', relations.difference);
    console.log('  Symmetric difference:', relations.symmetricDifference);
    
    // Array filtering and manipulation
    console.log('\n7. Array Filtering:');
    const mixed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log('  Original:', mixed);
    console.log('  Filter even numbers:', ArrayUtils.toFilter(mixed, n => n % 2 === 0));
    console.log('  Filter out odd numbers:', ArrayUtils.toFilterOut(mixed, n => n % 2 !== 0));
    
    // Array checking
    console.log('\n8. Array Checking:');
    const testArray = [1, 2, 3, 4, 5];
    console.log('  Test array:', testArray);
    console.log('  Has 1 and 2:', ArrayUtils.hasAll(testArray, 1, 2));
    console.log('  Has 1 or 6:', ArrayUtils.has(testArray, 1, 6));
    console.log('  Has not 6 and 7:', ArrayUtils.hasNot(testArray, 6, 7));
    console.log('  Has all not 6 and 7:', ArrayUtils.hasAllNot(testArray, 6, 7));
    
    // Array manipulation
    console.log('\n9. Array Manipulation:');
    const baseArray = [1, 2, 3];
    console.log('  Base array:', baseArray);
    console.log('  Push 4, 5:', ArrayUtils.toPush(baseArray, 4, 5));
    console.log('  Remove 2, 3:', ArrayUtils.toRemove(baseArray, 2, 3));
    
    // 2D Array analysis
    console.log('\n10. 2D Array Analysis:');
    const matrix = [
      [1, 2, 3],
      [4, 5],
      [6, 7, 8, 9]
    ];
    console.log('  Matrix:', matrix);
    const analysis = ArrayUtils.maxLength(matrix);
    console.log('  Max rows:', analysis.maxRows);
    console.log('  Max cols:', analysis.maxCols);
    console.log('  Max rows/cols:', analysis.maxRowsCols);
    console.log('  Total elements:', analysis.total);
    
    console.log('\n=========================\n');
  }
}