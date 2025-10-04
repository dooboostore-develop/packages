import { Runnable } from '@dooboostore/core/runs/Runnable';
import { TransactionManager } from '@dooboostore/core/transaction/TransactionManager';
import { Transaction } from '@dooboostore/core/transaction/Transaction';

// Example transaction implementations
class DatabaseTransaction implements Transaction<string, string, string, void> {
  private data: string[] = [];

  async try(data: string): Promise<string> {
    console.log('  [DatabaseTransaction] Starting transaction with data:', data);
    this.data.push(data);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate DB operation
    console.log('  [DatabaseTransaction] Transaction completed successfully');
    return `Saved: ${data}`;
  }

  async catch(e: any): Promise<string> {
    console.log('  [DatabaseTransaction] Rolling back transaction due to error:', e.message);
    this.data.pop(); // Rollback
    return `Rolled back: ${e.message}`;
  }

  async finally(): Promise<void> {
    console.log('  [DatabaseTransaction] Cleaning up transaction resources');
    // Cleanup resources
  }
}

class FileTransaction implements Transaction<string, string, string, void> {
  private files: string[] = [];

  async try(data: string): Promise<string> {
    console.log('  [FileTransaction] Writing file:', data);
    this.files.push(data);
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate file operation
    console.log('  [FileTransaction] File written successfully');
    return `File created: ${data}`;
  }

  async catch(e: any): Promise<string> {
    console.log('  [FileTransaction] Deleting file due to error:', e.message);
    this.files.pop(); // Rollback
    return `File deleted: ${e.message}`;
  }

  async finally(): Promise<void> {
    console.log('  [FileTransaction] Closing file handles');
    // Close file handles
  }
}

export class TransactionExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Transaction Manager Example ===\n');
    console.log('TransactionManager provides a way to manage multiple transactions with try-catch-finally pattern.\n');
    
    const transactionManager = new TransactionManager();
    
    // Register transactions
    transactionManager.setTransaction('database', new DatabaseTransaction());
    transactionManager.setTransaction('file', new FileTransaction());
    
    console.log('1. Testing successful transaction:');
    try {
      await transactionManager.try();
      
      const dbTransaction = transactionManager.getTransaction('database');
      const fileTransaction = transactionManager.getTransaction('file');
      
      if (dbTransaction && fileTransaction) {
        const dbResult = await dbTransaction.try('user_data.json');
        const fileResult = await fileTransaction.try('config.txt');
        
        console.log('  Database result:', dbResult);
        console.log('  File result:', fileResult);
      }
      
      await transactionManager.finally();
      console.log('  All transactions completed successfully');
      
    } catch (error) {
      await transactionManager.catch(error);
      console.log('  Error occurred, transactions rolled back');
    }
    
    console.log('\n2. Testing transaction with error:');
    try {
      await transactionManager.try();
      
      const dbTransaction = transactionManager.getTransaction('database');
      const fileTransaction = transactionManager.getTransaction('file');
      
      if (dbTransaction && fileTransaction) {
        const dbResult = await dbTransaction.try('user_data.json');
        console.log('  Database result:', dbResult);
        
        // Simulate an error
        throw new Error('Network connection failed');
      }
      
    } catch (error) {
      await transactionManager.catch(error);
      console.log('  Error handled, all transactions rolled back');
    } finally {
      await transactionManager.finally();
      console.log('  Transaction cleanup completed');
    }
    
    console.log('\n=========================\n');
  }
}