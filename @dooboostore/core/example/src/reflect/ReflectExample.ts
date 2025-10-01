import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

class SampleClass {
  public name: string = 'Sample';
  private id: number = 123;
  
  public greet(name: string): string {
    return `Hello, ${name}!`;
  }
  
  public calculate(a: number, b: number): number {
    return a + b;
  }
}

export class ReflectExample implements Runnable {
  run(): void {
    console.log('\n=== Reflect Utils Example ===\n');
    
    const instance = new SampleClass();
    
    console.log('1. ReflectUtils for reflection operations');
    console.log('  Instance:', instance);
    
    console.log('\n2. Using standard JavaScript reflection:');
    console.log('  Constructor name:', instance.constructor.name);
    console.log('  Own property names:', Object.getOwnPropertyNames(instance));
    console.log('  Prototype:', Object.getPrototypeOf(instance));
    
    console.log('\n3. Check properties:');
    console.log('  Has "name"?', 'name' in instance);
    console.log('  Has "id"?', 'id' in instance);
    console.log('  Has "missing"?', 'missing' in instance);
    
    console.log('\n4. Get property values:');
    console.log('  name:', (instance as any).name);
    console.log('  id:', (instance as any).id);
    
    console.log('\n5. Call methods:');
    console.log('  greet("World"):', instance.greet('World'));
    console.log('  calculate(10, 20):', instance.calculate(10, 20));
    
    console.log('\n6. Get method names:');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      .filter(name => name !== 'constructor');
    console.log('  Methods:', methods);
    
    console.log('\n=========================\n');
  }
}
