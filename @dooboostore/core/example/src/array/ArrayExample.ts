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
    
    // PickChance example (if available)
    console.log('\n3. Working with Arrays:');
    const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];
    console.log('  Fruits:', fruits);
    console.log('  Shuffled fruits:', ArrayUtils.toShuffle(fruits));
    
    console.log('\n=========================\n');
  }
}
