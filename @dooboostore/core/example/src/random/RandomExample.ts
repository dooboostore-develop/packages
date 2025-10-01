import { Runnable } from '@dooboostore/core/runs/Runnable';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

export class RandomExample implements Runnable {
  run(): void {
    console.log('\n=== Random Utils Example ===\n');
    
    console.log('1. Random integers:');
    console.log('  Random int (0-100):', RandomUtils.int(0, 100));
    console.log('  Random int (1-10):', RandomUtils.int(1, 10));
    console.log('  Random int (-50, 50):', RandomUtils.int(-50, 50));
    
    console.log('\n2. Random floats:');
    console.log('  Random float (0-1):', RandomUtils.float());
    console.log('  Random float (10-20):', RandomUtils.float(10, 20));
    console.log('  Random float (0-100):', RandomUtils.float(0, 100));
    
    console.log('\n3. Unique integers:');
    console.log('  5 unique ints (1-20):', RandomUtils.uniqueInts(1, 20, 5));
    console.log('  3 unique ints (1-10):', RandomUtils.uniqueInts(1, 10, 3));
    
    console.log('\n4. Random chance:');
    console.log('  50% chance:', RandomUtils.chance(0.5));
    console.log('  70% chance:', RandomUtils.chance(0.7));
    console.log('  30% chance:', RandomUtils.chance(0.3));
    
    console.log('\n5. Random hex color:');
    console.log('  Hex color:', '#' + RandomUtils.hex());
    console.log('  Hex color:', '#' + RandomUtils.hex());
    
    console.log('\n6. Random UUIDs:');
    console.log('  UUID v4:', RandomUtils.uuid4());
    console.log('  Custom format:', RandomUtils.uuid('xxxx-yyyy-zzzz'));
    
    console.log('\n7. Random RGB:');
    console.log('  RGB color:', RandomUtils.rgb());
    console.log('  RGB color:', RandomUtils.rgb());
    
    console.log('\n=========================\n');
  }
}
