import { Runnable } from '@dooboostore/core/runs/Runnable';
import { AsyncBlockingQueue } from '@dooboostore/core/queues/AsyncBlockingQueue';

export class QueueExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Queue Example ===\n');
    
    console.log('1. AsyncBlockingQueue - Create queue:');
    const queue = new AsyncBlockingQueue<string>();
    console.log('  AsyncBlockingQueue created');
    
    // Enqueue items
    console.log('\n2. Enqueue items:');
    await queue.enqueue('Task 1');
    console.log('  Enqueued: Task 1');
    await queue.enqueue('Task 2');
    console.log('  Enqueued: Task 2');
    await queue.enqueue('Task 3');
    console.log('  Enqueued: Task 3');
    
    console.log('\n3. Check isEmpty:');
    console.log('  Is empty?', queue.isEmpty());
    
    // Dequeue items
    console.log('\n4. Dequeue items:');
    const item1 = await queue.dequeue();
    console.log('  Dequeued:', item1);
    const item2 = await queue.dequeue();
    console.log('  Dequeued:', item2);
    const item3 = await queue.dequeue();
    console.log('  Dequeued:', item3);
    
    console.log('\n5. Check isEmpty after dequeue:');
    console.log('  Is empty?', queue.isEmpty());
    
    console.log('\n6. Producer-Consumer pattern:');
    const taskQueue = new AsyncBlockingQueue<number>();
    
    // Producer
    const producer = async () => {
      for (let i = 1; i <= 3; i++) {
        await taskQueue.enqueue(i);
        console.log(`  Producer: Added task ${i}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };
    
    // Consumer
    const consumer = async () => {
      for (let i = 0; i < 3; i++) {
        const task = await taskQueue.dequeue();
        console.log(`  Consumer: Processing task ${task}`);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    };
    
    await Promise.all([producer(), consumer()]);
    
    console.log('\n=========================\n');
  }
}
