import { Runnable } from '@dooboostore/core/runs/Runnable';
import { MathUtil } from '@dooboostore/core/math/MathUtil';

export class MathExample implements Runnable {
  run(): void {
    console.log('\n=== Math Utils Example ===\n');
    
    console.log('1. Pythagorean theorem:');
    console.log('  For a=3, b=4: c =', MathUtil.pythagorean(3, 4));
    console.log('  For a=5, b=12: c =', MathUtil.pythagorean(5, 12));
    
    console.log('\n2. Hypot (Euclidean distance):');
    console.log('  2D (3, 4):', MathUtil.hypot(3, 4));
    console.log('  3D (3, 4, 5):', MathUtil.hypot(3, 4, 5));
    console.log('  4D (1, 2, 3, 4):', MathUtil.hypot(1, 2, 3, 4));
    
    console.log('\n3. Get min/max from object array:');
    const items = [
      { id: 1, score: 85 },
      { id: 2, score: 92 },
      { id: 3, score: 78 },
      { id: 4, score: 95 }
    ];
    console.log('  Items:', items);
    console.log('  Min score:', MathUtil.getMinByObjectArray(items, 'score'));
    console.log('  Max score:', MathUtil.getMaxByObjectArray(items, 'score'));
    
    console.log('\n4. Sum function:');
    const numbers = [10, 20, 30, 40, 50];
    console.log('  Numbers:', numbers);
    console.log('  Sum:', MathUtil.sum(numbers));
    
    console.log('\n=========================\n');
  }
}
