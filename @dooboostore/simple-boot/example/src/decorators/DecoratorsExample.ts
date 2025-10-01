import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Sim, PostConstruct } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ExceptionHandler } from '@dooboostore/simple-boot/decorators/exception/ExceptionDecorator';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';

// Custom error types
class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Service that handles exceptions
@Sim
class PaymentService {
  processPayment(amount: number): string {
    console.log(`  � Processing payment of $${amount}...`);
    
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    
    if (amount > 10000) {
      throw new PaymentError('Amount exceeds maximum limit');
    }
    
    const txId = `TX-${Date.now()}`;
    console.log(`  ✅ Payment completed. Transaction ID: ${txId}`);
    return txId;
  }

  withdraw(amount: number): void {
    console.log(`  � Withdrawing $${amount}...`);
    
    if (amount > 1000) {
      throw new Error('Insufficient funds');
    }
    
    console.log(`  ✅ Withdrawal successful`);
  }
}

// Global exception handler
@Sim
class GlobalExceptionHandler {
  @PostConstruct
  init() {
    console.log('  [GlobalExceptionHandler] Initialized');
  }

  @ExceptionHandler({ type: PaymentError })
  handlePaymentError(e: PaymentError) {
    console.log(`  � [PaymentError Handler] ${e.message}`);
    console.log('     Notifying payment team...');
  }

  @ExceptionHandler({ type: ValidationError })
  handleValidationError(e: ValidationError) {
    console.log(`  ⚠️  [ValidationError Handler] ${e.message}`);
    console.log('     Please check your input and try again');
  }

  @ExceptionHandler({ type: Error })
  handleGenericError(e: Error) {
    console.log(`  ❌ [Error Handler] ${e.message}`);
    console.log('     Logging error to monitoring system...');
  }
}

export class DecoratorsExample implements Runnable {
  async run() {
    console.log('\n🎯 Exception Handling Example\n');
    console.log('='.repeat(50));

    const app = new SimpleApplication().run();
    const exceptionHandler = app.sim(GlobalExceptionHandler);
    const paymentService = app.sim(PaymentService);

    console.log('\n1️⃣  Successful Payment');
    try {
      paymentService.processPayment(100);
    } catch (error) {
      // Exception handled by @ExceptionHandler
    }

    console.log('\n2️⃣  Validation Error');
    try {
      paymentService.processPayment(-50);
    } catch (error) {
      // ValidationError handled by @ExceptionHandler
    }

    console.log('\n3️⃣  Payment Error');
    try {
      paymentService.processPayment(15000);
    } catch (error) {
      // PaymentError handled by @ExceptionHandler
    }

    console.log('\n4️⃣  Generic Error');
    try {
      paymentService.withdraw(2000);
    } catch (error) {
      // Generic Error handled by @ExceptionHandler
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Example completed!\n');
  }
}
