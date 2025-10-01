import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { MemoryUtils } from '@dooboostore/core-node/memory/MemoryUtils';

export class MemoryExample implements Runnable {
  async run(): Promise<void> {
    clack.intro('💾 Memory Utils Example');
    
    const memUsage = MemoryUtils.memoryUsage();
    
    clack.log.info('Memory Usage:');
    clack.log.info(`  RSS: ${Math.round(memUsage.rss / 1024 / 1024 * 100) / 100} MB`);
    clack.log.info(`  Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`);
    clack.log.info(`  Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`);
    clack.log.info(`  External: ${Math.round(memUsage.external / 1024 / 1024 * 100) / 100} MB`);
    
    // Memory allocation test
    const before = MemoryUtils.memoryUsage();
    const bigArray = new Array(1000000).fill('test');
    const after = MemoryUtils.memoryUsage();
    
    const increase = Math.round((after.heapUsed - before.heapUsed) / 1024 / 1024 * 100) / 100;
    clack.log.success(`Memory increase after allocation: ${increase} MB`);
    
    clack.outro('✅ Memory example completed!');
  }
}
