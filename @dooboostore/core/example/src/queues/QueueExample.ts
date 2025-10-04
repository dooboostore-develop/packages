import { Runnable } from '@dooboostore/core/runs/Runnable';
import { AsyncBlockingQueue } from '@dooboostore/core/queues/AsyncBlockingQueue';

export class QueueExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== AsyncBlockingQueue Example ===\n');
    
    const queue = new AsyncBlockingQueue<string>();
    
    console.log('1. Basic Queue Operations:');
    console.log('  Initial state:');
    console.log(`    Is empty: ${queue.isEmpty()}`);
    console.log(`    Is blocked: ${queue.isBlocked()}`);
    console.log(`    Length: ${queue.length}`);
    
    // Enqueue some items
    console.log('\n2. Enqueueing Items:');
    queue.enqueue('First item');
    queue.enqueue('Second item');
    queue.enqueue('Third item');
    
    console.log('  After enqueueing 3 items:');
    console.log(`    Is empty: ${queue.isEmpty()}`);
    console.log(`    Is blocked: ${queue.isBlocked()}`);
    console.log(`    Length: ${queue.length}`);
    
    // Dequeue items
    console.log('\n3. Dequeueing Items:');
    const item1 = await queue.dequeue();
    console.log(`  Dequeued: ${item1}`);
    console.log(`    Length: ${queue.length}`);
    
    const item2 = await queue.dequeue();
    console.log(`  Dequeued: ${item2}`);
    console.log(`    Length: ${queue.length}`);
    
    const item3 = await queue.dequeue();
    console.log(`  Dequeued: ${item3}`);
    console.log(`    Length: ${queue.length}`);
    console.log(`    Is empty: ${queue.isEmpty()}`);
    
    console.log('\n4. Producer-Consumer Pattern:');
    
    // Producer function
    const producer = async () => {
      for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
        const item = `Task ${i}`;
        queue.enqueue(item);
        console.log(`  [Producer] Enqueued: ${item}`);
      }
    };
    
    // Consumer function
    const consumer = async () => {
      for (let i = 1; i <= 5; i++) {
        const item = await queue.dequeue();
        console.log(`  [Consumer] Dequeued: ${item}`);
        await new Promise(resolve => setTimeout(resolve, 150)); // Simulate processing
      }
    };
    
    // Run producer and consumer concurrently
    await Promise.all([producer(), consumer()]);
    
    console.log('\n5. Blocking Behavior:');
    console.log('  Queue is now empty, consumer will block...');
    
    // Start a consumer that will block
    const blockingConsumer = async () => {
      console.log('  [Blocking Consumer] Waiting for item...');
      const item = await queue.dequeue();
      console.log(`  [Blocking Consumer] Received: ${item}`);
    };
    
    // Start the blocking consumer
    const consumerPromise = blockingConsumer();
    
    // Wait a bit, then enqueue an item
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('  [Producer] Enqueueing item after delay...');
    queue.enqueue('Delayed item');
    
    // Wait for consumer to finish
    await consumerPromise;
    
    console.log('\n6. Multiple Consumers:');
    const multiQueue = new AsyncBlockingQueue<number>();
    
    // Enqueue some numbers
    for (let i = 1; i <= 6; i++) {
      multiQueue.enqueue(i);
    }
    
    // Create multiple consumers
    const consumers = Array.from({ length: 3 }, (_, index) => 
      async () => {
        for (let i = 0; i < 2; i++) {
          const item = await multiQueue.dequeue();
          console.log(`  [Consumer ${index + 1}] Processed: ${item}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    );
    
    // Run all consumers concurrently
    await Promise.all(consumers.map(consumer => consumer()));
    
    console.log('\n7. Queue State Monitoring:');
    const monitorQueue = new AsyncBlockingQueue<string>();
    
    // Function to monitor queue state
    const monitor = () => {
      console.log(`    Queue state - Empty: ${monitorQueue.isEmpty()}, Blocked: ${monitorQueue.isBlocked()}, Length: ${monitorQueue.length}`);
    };
    
    console.log('  Initial state:');
    monitor();
    
    // Enqueue items
    monitorQueue.enqueue('Item 1');
    monitorQueue.enqueue('Item 2');
    console.log('  After enqueueing 2 items:');
    monitor();
    
    // Dequeue one item
    await monitorQueue.dequeue();
    console.log('  After dequeuing 1 item:');
    monitor();
    
    // Dequeue remaining items
    await monitorQueue.dequeue();
    console.log('  After dequeuing all items:');
    monitor();
    
    console.log('\n=========================\n');
  }
}