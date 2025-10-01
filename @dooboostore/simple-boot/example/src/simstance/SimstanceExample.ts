import { Runnable } from '@dooboostore/core/runs/Runnable';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim, Lifecycle } from '@dooboostore/simple-boot/decorators/SimDecorator';

// Example 1: Basic singleton service
@Sim
class UserService {
  private users: Map<string, any> = new Map();

  constructor() {
    console.log('  [UserService] Created (singleton - only once)');
  }

  addUser(id: string, name: string) {
    this.users.set(id, { id, name });
    console.log(`  [UserService] Added user: ${name}`);
  }

  getUser(id: string) {
    return this.users.get(id);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }
}

// Example 2: Transient service (new instance each time)
@Sim({ scope: Lifecycle.Transient })
class RequestLogger {
  private requestId: string;

  constructor() {
    this.requestId = `req-${Math.random().toString(36).substring(7)}`;
    console.log(`  [RequestLogger] Created with ID: ${this.requestId}`);
  }

  logRequest(method: string, path: string) {
    console.log(`  [${this.requestId}] ${method} ${path}`);
  }

  getRequestId() {
    return this.requestId;
  }
}

// Example 3: Dependency injection (NotificationService depends on UserService)
@Sim
class NotificationService {
  constructor(private userService: UserService) {
    console.log('  [NotificationService] Created with injected UserService');
  }

  notifyUser(userId: string, message: string) {
    const user = this.userService.getUser(userId);
    if (user) {
      console.log(`  📧 Sending notification to ${user.name}: "${message}"`);
    } else {
      console.log(`  ⚠️  User ${userId} not found`);
    }
  }
}

export class SimstanceExample implements Runnable {
  async run() {
    console.log('\n� Simstance (DI Container) Example\n');
    console.log('='.repeat(50));

    // Create SimpleApplication - the DI container
    const app = new SimpleApplication().run();
    console.log(require.resolve("reflect-metadata"));
    console.log('\n1️⃣  Singleton Pattern');
    console.log('   Getting UserService instances...');
    const service1 = app.sim(UserService);
    const service2 = app.sim(UserService);
    console.log(`   Are they the same instance? ${service1 === service2 ? '✅ Yes (Singleton)' : '❌ No'}`);

    console.log('\n2️⃣  Transient Pattern');
    console.log('   Getting RequestLogger instances...');
    const logger1 = app.sim(RequestLogger);
    const logger2 = app.sim(RequestLogger);
    console.log(`   Logger 1 ID: ${logger1.getRequestId()}`);
    console.log(`   Logger 2 ID: ${logger2.getRequestId()}`);
    console.log(`   Are they different instances? ${logger1 !== logger2 ? '✅ Yes (Transient)' : '❌ No'}`);

    console.log('\n3️⃣  Using Services');
    const userService = app.sim(UserService);
    userService.addUser('user1', 'Alice');
    userService.addUser('user2', 'Bob');
    const logger = app.sim(RequestLogger);
    logger.logRequest('GET', '/users');

    console.log('\n4️⃣  Dependency Injection');
    console.log('   NotificationService automatically gets UserService injected:');
    const notificationService = app.sim(NotificationService);
    notificationService.notifyUser('user1', 'Welcome to the platform!');
    console.log();

    console.log('  Key Features:');
    console.log('    • @Sim creates singleton instances');
    console.log('    • Dependencies are auto-injected via constructor');
    console.log('    • Reduces boilerplate code');
    console.log('    • Improves testability');
  }
}
