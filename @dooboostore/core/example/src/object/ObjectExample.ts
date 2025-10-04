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
    
    // Path utilities example
    console.log('\n5. Path utilities:');
    const complexObject = {
      user: {
        profile: {
          name: 'John Doe',
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        posts: [
          { title: 'First Post', content: 'Hello World' },
          { title: 'Second Post', content: 'Another post' }
        ]
      }
    };

    // Get values using path
    const userName = ObjectUtils.Path.get(complexObject, 'user.profile.name');
    const theme = ObjectUtils.Path.get(complexObject, 'user.profile.settings.theme');
    const firstPostTitle = ObjectUtils.Path.get(complexObject, 'user.posts[0].title');
    const nonExistent = ObjectUtils.Path.get(complexObject, 'user.profile.age', 'default');

    console.log('  User name:', userName);
    console.log('  Theme:', theme);
    console.log('  First post title:', firstPostTitle);
    console.log('  Non-existent with default:', nonExistent);

    // Set values using path
    const newObject = {};
    ObjectUtils.Path.set(newObject, 'user.profile.name', 'Jane Doe');
    ObjectUtils.Path.set(newObject, 'user.profile.settings.theme', 'light');
    ObjectUtils.Path.set(newObject, 'user.posts[0].title', 'New Post');
    ObjectUtils.Path.set(newObject, 'user.posts[1].title', 'Another Post');

    console.log('  Object after setting paths:', newObject);

    // Available paths
    const availablePaths = ObjectUtils.Path.availablePath(complexObject);
    console.log('  Available paths:', availablePaths.slice(0, 5), '... (showing first 5)');

    // Optional chain path conversion
    const path1 = 'user.profile.name';
    const optionalPath1 = ObjectUtils.Path.toOptionalChainPath(path1);
    console.log(`  Path: ${path1} -> Optional: ${optionalPath1}`);

    const path2 = 'user.posts[0].title';
    const optionalPath2 = ObjectUtils.Path.toOptionalChainPath(path2);
    console.log(`  Path: ${path2} -> Optional: ${optionalPath2}`);

    // Script evaluation example
    console.log('\n6. Script evaluation:');
    const context = {
      name: 'John',
      age: 30,
      calculate: (x: number, y: number) => x + y
    };

    const result1 = ObjectUtils.Script.evaluate('name + " is " + age + " years old"', context);
    console.log('  Script result 1:', result1);

    const result2 = ObjectUtils.Script.evaluate('calculate(10, 20)', context);
    console.log('  Script result 2:', result2);

    const result3 = ObjectUtils.Script.evaluateReturn({
      bodyScript: 'const doubled = age * 2',
      returnScript: 'doubled'
    }, context);
    console.log('  Script result 3:', result3);

    // Path detection from script
    const script = 'user.profile.name + " " + user.profile.settings.theme';
    const detectedPaths = ObjectUtils.Path.detectPathFromScript(script, { excludeThis: true });
    console.log('  Detected paths from script:', Array.from(detectedPaths));
    
    console.log('\n=========================\n');
  }
}
