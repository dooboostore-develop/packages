import { Runnable } from '@dooboostore/core/runs/Runnable';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';

// Event types
class UserCreatedEvent {
  constructor(public userId: string, public name: string) {}
}

class OrderPlacedEvent {
  constructor(public orderId: string, public amount: number) {}
}

class PaymentProcessedEvent {
  constructor(public orderId: string, public success: boolean) {}
}

export class IntentExample implements Runnable {
  async run() {
    console.log('\n� Intent Event System Example\n');
    console.log('='.repeat(50));

    const app = new SimpleApplication().run();
    const intentManager = app.getIntentManager();

    console.log('\n1️⃣  URI-based Intent Publishing');
    console.log('   Publishing intent to /user/created...');
    const intent1 = new Intent('/user/created', { userId: 'user-123', name: 'Alice' });
    await intentManager.publish(intent1);
    console.log('   ✅ Intent published!');

    console.log('\n2️⃣  Scheme-based Intent');
    console.log('   Publishing intent with custom scheme...');
    const intent2 = new Intent('myapp://order/placed', { orderId: 'order-456', amount: 99.99 });
    await intentManager.publish(intent2);
    console.log('   ✅ Intent published!');

    console.log('\n3️⃣  Symbol-based Intent');
    console.log('   Publishing intent with Symbol...');
    const intent3 = new Intent(
      { symbol: Symbol.for('payment'), uri: '/processed' },
      { orderId: 'order-456', success: true }
    );
    await intentManager.publish(intent3);
    console.log('   ✅ Intent published!');

    console.log('\n4️⃣  Simple String Intent');
    const result = await intentManager.publish('/api/hello', { message: 'Hello World!' });
    console.log(`   ✅ Published to /api/hello`);

    console.log('\n' + '='.repeat(50));
    console.log('✨ Example completed!\n');
  }
}
