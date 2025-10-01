import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Schedule } from '@dooboostore/core/schedule/Schedule';

export class ScheduleExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Schedule Example ===\n');
    
    console.log('1. Schedule class:');
    console.log('  Schedule provides utilities for task scheduling');
    console.log('  Can schedule one-time or recurring tasks');
    
    console.log('\n2. Example scheduling patterns:');
    console.log('  - Delayed execution');
    console.log('  - Periodic tasks');
    console.log('  - Cron-like scheduling');
    console.log('  - Task cancellation');
    
    console.log('\n3. Use with setTimeout/setInterval:');
    console.log('  Scheduling a task to run in 1 second...');
    await new Promise(resolve => setTimeout(() => {
      console.log('  Task executed!');
      resolve(null);
    }, 1000));
    
    console.log('\n4. Periodic task example:');
    let count = 0;
    const interval = setInterval(() => {
      count++;
      console.log(`  Periodic task ${count}`);
      if (count >= 2) {
        clearInterval(interval);
        console.log('  Periodic task stopped');
      }
    }, 500);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('\n=========================\n');
  }
}
