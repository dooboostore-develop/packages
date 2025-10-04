import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { MemoryUtils } from '@dooboostore/core-node/memory/MemoryUtils';

export class MemoryExample implements Runnable {
  async run(): Promise<void> {
    clack.intro('💾 Memory Utils Example');
    
    // Initial memory usage
    clack.log.step('Initial memory usage:');
    const initialMem = MemoryUtils.memoryUsage();
    this.displayMemoryUsage(initialMem, 'Initial');
    
    // Memory allocation tests
    clack.log.step('Memory allocation tests:');
    
    // Test 1: Large array allocation
    const beforeArray = MemoryUtils.memoryUsage();
    const bigArray = new Array(1000000).fill('test');
    const afterArray = MemoryUtils.memoryUsage();
    this.displayMemoryUsage(afterArray, 'After array allocation');
    this.displayMemoryIncrease(beforeArray, afterArray, 'Array allocation');
    
    // Test 2: Object allocation
    const beforeObjects = MemoryUtils.memoryUsage();
    const objects = [];
    for (let i = 0; i < 100000; i++) {
      objects.push({
        id: i,
        name: `Object ${i}`,
        data: new Array(100).fill(`data-${i}`),
        timestamp: Date.now()
      });
    }
    const afterObjects = MemoryUtils.memoryUsage();
    this.displayMemoryUsage(afterObjects, 'After object allocation');
    this.displayMemoryIncrease(beforeObjects, afterObjects, 'Object allocation');
    
    // Test 3: String allocation
    const beforeStrings = MemoryUtils.memoryUsage();
    const strings = [];
    for (let i = 0; i < 50000; i++) {
      strings.push(`This is a long string with some data ${i} and more content to make it larger`);
    }
    const afterStrings = MemoryUtils.memoryUsage();
    this.displayMemoryUsage(afterStrings, 'After string allocation');
    this.displayMemoryIncrease(beforeStrings, afterStrings, 'String allocation');
    
    // Test 4: Buffer allocation
    const beforeBuffers = MemoryUtils.memoryUsage();
    const buffers = [];
    for (let i = 0; i < 10000; i++) {
      buffers.push(Buffer.alloc(1024, `buffer-data-${i}`));
    }
    const afterBuffers = MemoryUtils.memoryUsage();
    this.displayMemoryUsage(afterBuffers, 'After buffer allocation');
    this.displayMemoryIncrease(beforeBuffers, afterBuffers, 'Buffer allocation');
    
    // Memory cleanup test
    clack.log.step('Memory cleanup test:');
    const beforeCleanup = MemoryUtils.memoryUsage();
    
    // Clear references to allow garbage collection
    bigArray.length = 0;
    objects.length = 0;
    strings.length = 0;
    buffers.length = 0;
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      clack.log.info('Garbage collection triggered');
    } else {
      clack.log.info('Garbage collection not available (run with --expose-gc flag)');
    }
    
    // Wait a bit for GC to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const afterCleanup = MemoryUtils.memoryUsage();
    this.displayMemoryUsage(afterCleanup, 'After cleanup');
    this.displayMemoryIncrease(beforeCleanup, afterCleanup, 'Cleanup');
    
    // Memory usage patterns
    clack.log.step('Memory usage patterns:');
    const patterns = [];
    for (let i = 0; i < 5; i++) {
      const mem = MemoryUtils.memoryUsage();
      patterns.push(mem);
      clack.log.info(`Pattern ${i + 1}: Heap Used: ${this.formatBytes(mem.heapUsed)}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate average memory usage
    const avgHeapUsed = patterns.reduce((sum, mem) => sum + mem.heapUsed, 0) / patterns.length;
    clack.log.info(`Average heap usage: ${this.formatBytes(avgHeapUsed)}`);
    
    // Memory efficiency tips
    clack.log.step('Memory efficiency tips:');
    clack.log.info('• Use Buffer.allocUnsafe() for temporary buffers');
    clack.log.info('• Clear large arrays with array.length = 0');
    clack.log.info('• Use WeakMap/WeakSet for object references');
    clack.log.info('• Monitor memory usage in production with --expose-gc');
    clack.log.info('• Use streaming for large data processing');
    
    clack.outro('✅ Memory example completed!');
  }
  
  private displayMemoryUsage(memUsage: NodeJS.MemoryUsage, label: string): void {
    clack.log.info(`${label} Memory Usage:`);
    clack.log.info(`  RSS: ${this.formatBytes(memUsage.rss)}`);
    clack.log.info(`  Heap Total: ${this.formatBytes(memUsage.heapTotal)}`);
    clack.log.info(`  Heap Used: ${this.formatBytes(memUsage.heapUsed)}`);
    clack.log.info(`  External: ${this.formatBytes(memUsage.external)}`);
    clack.log.info(`  Array Buffers: ${this.formatBytes(memUsage.arrayBuffers)}`);
  }
  
  private displayMemoryIncrease(before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage, operation: string): void {
    const rssIncrease = after.rss - before.rss;
    const heapIncrease = after.heapUsed - before.heapUsed;
    const externalIncrease = after.external - before.external;
    
    clack.log.info(`${operation} Memory Increase:`);
    clack.log.info(`  RSS: ${this.formatBytes(rssIncrease)}`);
    clack.log.info(`  Heap Used: ${this.formatBytes(heapIncrease)}`);
    clack.log.info(`  External: ${this.formatBytes(externalIncrease)}`);
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
  }
}
