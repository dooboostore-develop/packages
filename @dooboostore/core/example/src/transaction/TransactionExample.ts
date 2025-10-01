import { Runnable } from '@dooboostore/core/runs/Runnable';
import { TransactionManager } from '@dooboostore/core/transaction/TransactionManager';
import { Transaction } from '@dooboostore/core/transaction/Transaction';

export class TransactionExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Transaction Example ===\n');
    
    console.log('1. Create Transaction Manager:');
    const txManager = new TransactionManager();
    console.log('  TransactionManager created:', txManager);
    
    console.log('\n2. Transaction pattern:');
    console.log('  Transaction interface requires:');
    console.log('  - try(): execute transaction logic');
    console.log('  - catch(): handle errors');
    console.log('  - finally(): cleanup');
    
    console.log('\n3. Example transaction flow:');
    console.log('  1. Begin transaction');
    console.log('  2. Execute operations in try()');
    console.log('  3. If error, rollback in catch()');
    console.log('  4. Clean up resources in finally()');
    console.log('  5. Commit if successful');
    
    console.log('\n4. Use cases:');
    console.log('  - Database transactions');
    console.log('  - Multi-step operations');
    console.log('  - Atomic updates');
    console.log('  - Rollback on failure');
    
    console.log('\n=========================\n');
  }
}
