import { Runnable } from '@dooboostore/core/runs/Runnable';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { AlertType } from '@dooboostore/simple-boot/alert/AlertType';

export class AlertExample implements Runnable {
  async run() {
    console.log('\n🔔 Alert System Example\n');
    console.log('='.repeat(50));

    const app = new SimpleApplication().run();
    
    console.log('\n1️⃣  Alert Types');
    console.log('   Available alert types:');
    console.log(`      - ${AlertType.DANGER}: Critical errors`);
    console.log(`      - ${AlertType.SUCCESS}: Success messages`);
    console.log(`      - ${AlertType.INFO}: Informational messages`);
    console.log(`      - ${AlertType.WARNING}: Warning messages`);
    console.log(`      - ${AlertType.ERROR}: Error messages`);
    console.log(`      - ${AlertType.PROGRESS}: Progress indicators`);

    console.log('\n2️⃣  Alert System Architecture');
    console.log('   Components:');
    console.log('      - AlertService: Manages alerts and subscriptions');
    console.log('      - AlertFactory: Creates alert instances');
    console.log('      - Alert: Individual alert instances');
    console.log('      - AlertAction: Actions (SHOW, HIDE, UPDATE, REMOVE)');

    console.log('\n3️⃣  Usage Pattern');
    console.log('   1. Create AlertFactory with @Sim decorator');
    console.log('   2. AlertService auto-injected with AlertFactory');
    console.log('   3. Create alerts: alertService.danger(), .success(), etc.');
    console.log('   4. Subscribe to observable: alertService.observable.subscribe()');
    console.log('   5. Perform actions on alerts: show(), hide(), update()');

    console.log('\n' + '='.repeat(50));
    console.log('✨ Example completed!\n');
  }
}
