import { Runnable } from '@dooboostore/core/runs/Runnable';
import { MemoryStorage } from '@dooboostore/core/storage/MemoryStorage';

export class StorageExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Storage Example ===\n');
    
    console.log('1. MemoryStorage - Basic operations:');
    const storage = new MemoryStorage();
    
    await storage.setItem('user', JSON.stringify({ name: 'John', age: 30 }));
    await storage.setItem('token', 'abc123');
    await storage.setItem('count', '42');
    
    console.log('  Get user:', await storage.getItem('user'));
    console.log('  Get token:', await storage.getItem('token'));
    console.log('  Get count:', await storage.getItem('count'));
    
    console.log('\n2. Storage operations:');
    console.log('  Get key by index(0):', await storage.key(0));
    console.log('  Get key by index(1):', await storage.key(1));
    console.log('  Length:', storage.length);
    
    console.log('\n3. Remove items:');
    await storage.removeItem('count');
    console.log('  After removing count, length:', storage.length);
    console.log('  Get count (should be null):', await storage.getItem('count'));
    
    console.log('\n4. Store complex data:');
    const userData = {
      id: 123,
      name: 'Alice',
      preferences: {
        theme: 'dark',
        language: 'ko'
      }
    };
    await storage.setItem('userData', JSON.stringify(userData));
    const retrieved = JSON.parse(await storage.getItem('userData') || '{}');
    console.log('  Retrieved user data:', retrieved);
    
    console.log('\n5. Clear all:');
    await storage.clear();
    console.log('  After clear, length:', storage.length);
    
    console.log('\n=========================\n');
  }
}
