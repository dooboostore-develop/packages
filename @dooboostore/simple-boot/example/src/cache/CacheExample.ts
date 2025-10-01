import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Cache } from '@dooboostore/simple-boot/decorators/cache/CacheDecorator';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';

// Example service with caching
@Sim
class DataService {
  private callCount = 0;

  @Cache({
    key: (userId: string) => `user-${userId}`
  })
  fetchUserData(userId: string): any {
    this.callCount++;
    console.log(`  💾 Database call #${this.callCount} for user: ${userId}`);
    
    // Simulate expensive database operation
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      timestamp: new Date().toISOString()
    };
  }

  @Cache({
    key: (n: number) => `calc-${n}`,
    ms: 5000  // Cache for 5 seconds
  })
  expensiveCalculation(n: number): number {
    this.callCount++;
    console.log(`  🔢 Calculation #${this.callCount} for: ${n}`);
    
    // Simulate expensive computation
    let result = 0;
    for (let i = 0; i < n; i++) {
      result += i;
    }
    return result;
  }

  getCallCount(): number {
    return this.callCount;
  }
}

export class CacheExample implements Runnable {
  async run() {
    console.log('\n� Method Caching Example\n');
    console.log('='.repeat(50));

    const app = new SimpleApplication().run();
    const dataService = app.sim(DataService);

    console.log('\n1️⃣  Basic Caching');
    console.log('   First call (cache MISS):');
    const data1 = dataService.fetchUserData('123');
    console.log(`   Result: ${data1.name} - ${data1.email}`);

    console.log('\n   Second call with same parameter (cache HIT):');
    const data2 = dataService.fetchUserData('123');
    console.log(`   Result: ${data2.name} - ${data2.email}`);
    console.log('   ✅ No database call made!');

    console.log('\n   Third call with different parameter (cache MISS):');
    const data3 = dataService.fetchUserData('456');
    console.log(`   Result: ${data3.name} - ${data3.email}`);

    console.log('\n2️⃣  Performance Benefits');
    console.log('   Running expensive calculation...');
    dataService.expensiveCalculation(1000000);
    console.log('   Running same calculation (cached):');
    dataService.expensiveCalculation(1000000);
    console.log(`   Total expensive operations: ${dataService.getCallCount()}`);

    console.log('\n' + '='.repeat(50));
    console.log('✨ Example completed!\n');

    console.log('  Caching Benefits:');
    console.log('    • Reduce database/API calls');
    console.log('    • Speed up expensive computations');
    console.log('    • Automatic cache management');
    console.log('    • Method-level caching with @Cache');
  }
}
