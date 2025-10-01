import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';

export class ObjectExample implements Runnable {
  run(): void {
    console.log('\n=== Object Utils Example ===\n');
    
    // Deep copy
    const original = {
      name: 'John',
      age: 30,
      address: {
        city: 'Seoul',
        country: 'Korea'
      }
    };
    
    console.log('1. Deep copy:');
    const copied = ObjectUtils.deepCopy(original);
    copied.address.city = 'Busan';
    console.log('  Original city:', original.address.city);
    console.log('  Copied city:', copied.address.city);
    
    // Unique keys
    console.log('\n2. Unique keys from objects:');
    const objects = [
      { id: 1, name: 'Alice' },
      { id: 2, email: 'bob@example.com' },
      { id: 3, name: 'Charlie', phone: '123-456' }
    ];
    console.log('  Objects:', objects);
    console.log('  All unique keys:', ObjectUtils.uniqueKeys(objects));
    
    // Prototype operations
    console.log('\n3. Prototype operations:');
    class Animal {
      eat() { return 'eating'; }
      sleep() { return 'sleeping'; }
    }
    class Dog extends Animal {
      bark() { return 'woof'; }
    }
    
    const dog = new Dog();
    console.log('  Constructor name:', ObjectUtils.constructorName(dog));
    console.log('  Prototype names:', ObjectUtils.protoTypeName(dog));
    console.log('  All prototype names:', ObjectUtils.allProtoTypeName(dog));
    
    // Seal object
    console.log('\n4. Seal object:');
    const obj = { a: 1, b: 2 };
    console.log('  Original:', obj);
    const sealed = ObjectUtils.seal(obj);
    sealed.a = 10; // Can modify existing properties
    console.log('  After modifying existing property:', sealed);
    
    console.log('\n=========================\n');
  }
}
