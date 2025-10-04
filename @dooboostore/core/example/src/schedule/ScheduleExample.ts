import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ScheduleBase, Schedule } from '@dooboostore/core/schedule/Schedule';

// Example schedule implementations
class DataBackupSchedule extends ScheduleBase<{ backupPath: string }> {
  spec = '0 2 * * *'; // Daily at 2 AM
  name = 'DataBackupSchedule';
  description = 'Daily data backup schedule';

  async execute(data: { backupPath: string }): Promise<void> {
    console.log(`  [${this.name}] Starting backup to: ${data.backupPath}`);
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`  [${this.name}] Backup completed successfully`);
  }
}

class HealthCheckSchedule extends ScheduleBase<void> {
  spec = '*/5 * * * *'; // Every 5 minutes
  name = 'HealthCheckSchedule';
  description = 'System health check schedule';

  async execute(data: void): Promise<void> {
    console.log(`  [${this.name}] Performing health check...`);
    
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`  [${this.name}] Health check completed - System OK`);
  }
}

class ReportGenerationSchedule extends ScheduleBase<{ reportType: string }> {
  spec = '0 9 * * 1'; // Every Monday at 9 AM
  name = 'ReportGenerationSchedule';
  description = 'Weekly report generation schedule';

  async execute(data: { reportType: string }): Promise<void> {
    console.log(`  [${this.name}] Generating ${data.reportType} report...`);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`  [${this.name}] ${data.reportType} report generated successfully`);
  }
}

class ErrorSchedule extends ScheduleBase<void> {
  spec = '0 0 * * *'; // Daily at midnight
  name = 'ErrorSchedule';
  description = 'Schedule that will throw an error';

  async execute(data: void): Promise<void> {
    console.log(`  [${this.name}] This schedule will throw an error...`);
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 300));
    
    throw new Error('Simulated schedule error');
  }
}

export class ScheduleExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Schedule Example ===\n');
    
    // Create schedule instances
    const backupSchedule = new DataBackupSchedule();
    const healthCheckSchedule = new HealthCheckSchedule();
    const reportSchedule = new ReportGenerationSchedule();
    const errorSchedule = new ErrorSchedule();
    
    console.log('1. Schedule Information:');
    console.log(`  ${backupSchedule.name}: ${backupSchedule.description}`);
    console.log(`    Spec: ${backupSchedule.spec}`);
    console.log(`    State: ${backupSchedule.state}`);
    console.log(`    Is Ready: ${backupSchedule.isReady}`);
    
    console.log(`  ${healthCheckSchedule.name}: ${healthCheckSchedule.description}`);
    console.log(`    Spec: ${healthCheckSchedule.spec}`);
    console.log(`    State: ${healthCheckSchedule.state}`);
    console.log(`    Is Ready: ${healthCheckSchedule.isReady}`);
    
    console.log(`  ${reportSchedule.name}: ${reportSchedule.description}`);
    console.log(`    Spec: ${reportSchedule.spec}`);
    console.log(`    State: ${reportSchedule.state}`);
    console.log(`    Is Ready: ${reportSchedule.isReady}`);
    
    // Run successful schedules
    console.log('\n2. Running Successful Schedules:');
    
    console.log('  Running backup schedule:');
    await backupSchedule.run({ backupPath: '/backup/data' });
    
    console.log('  Running health check schedule:');
    await healthCheckSchedule.run();
    
    console.log('  Running report generation schedule:');
    await reportSchedule.run({ reportType: 'Weekly Sales Report' });
    
    // Check schedule statistics
    console.log('\n3. Schedule Statistics:');
    console.log(`  Backup Schedule:`);
    console.log(`    Total runs: ${backupSchedule.totalCount}`);
    console.log(`    Success count: ${backupSchedule.successCount}`);
    console.log(`    Error count: ${backupSchedule.errorCount}`);
    console.log(`    Current state: ${backupSchedule.state}`);
    
    console.log(`  Health Check Schedule:`);
    console.log(`    Total runs: ${healthCheckSchedule.totalCount}`);
    console.log(`    Success count: ${healthCheckSchedule.successCount}`);
    console.log(`    Error count: ${healthCheckSchedule.errorCount}`);
    console.log(`    Current state: ${healthCheckSchedule.state}`);
    
    // Run schedule with error
    console.log('\n4. Running Schedule with Error:');
    console.log('  Running error schedule:');
    await errorSchedule.run();
    
    console.log(`  Error Schedule Statistics:`);
    console.log(`    Total runs: ${errorSchedule.totalCount}`);
    console.log(`    Success count: ${errorSchedule.successCount}`);
    console.log(`    Error count: ${errorSchedule.errorCount}`);
    console.log(`    Current state: ${errorSchedule.state}`);
    
    // Check history
    console.log('\n5. Schedule History:');
    console.log(`  Backup Schedule History:`);
    backupSchedule.history?.forEach((entry, index) => {
      console.log(`    ${index + 1}. ${entry.state} at ${entry.date.toISOString()}`);
    });
    
    console.log(`  Error Schedule History:`);
    errorSchedule.history?.forEach((entry, index) => {
      console.log(`    ${index + 1}. ${entry.state} at ${entry.date.toISOString()}`);
    });
    
    // Multiple runs demonstration
    console.log('\n6. Multiple Runs Demonstration:');
    const multiRunSchedule = new HealthCheckSchedule();
    
    console.log('  Running health check multiple times:');
    for (let i = 1; i <= 3; i++) {
      console.log(`    Run ${i}:`);
      await multiRunSchedule.run();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between runs
    }
    
    console.log(`  Final Statistics:`);
    console.log(`    Total runs: ${multiRunSchedule.totalCount}`);
    console.log(`    Success count: ${multiRunSchedule.successCount}`);
    console.log(`    Error count: ${multiRunSchedule.errorCount}`);
    
    // Schedule state transitions
    console.log('\n7. Schedule State Transitions:');
    const stateSchedule = new DataBackupSchedule();
    
    console.log(`  Initial state: ${stateSchedule.state}`);
    console.log(`  Is ready: ${stateSchedule.isReady}`);
    
    console.log('  Starting schedule...');
    const runPromise = stateSchedule.run({ backupPath: '/test/backup' });
    
    // Wait a bit to see the state change
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`  State during execution: ${stateSchedule.state}`);
    console.log(`  Is ready during execution: ${stateSchedule.isReady}`);
    
    await runPromise;
    console.log(`  Final state: ${stateSchedule.state}`);
    console.log(`  Is ready after completion: ${stateSchedule.isReady}`);
    
    console.log('\n=========================\n');
  }
}