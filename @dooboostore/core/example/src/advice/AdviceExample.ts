import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Advice } from '@dooboostore/core/advice/Advice';

// Custom error types
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handler implementations using Advice interface
class NetworkErrorHandler extends Advice<Error, string, any> {
  async isSupport(e: Error, context?: any): Promise<boolean> {
    return e instanceof NetworkError;
  }

  async exception(e: Error, context?: any): Promise<string> {
    console.log('  [NetworkErrorHandler] Handling network error:', e.message);
    return `Network error handled: ${e.message}`;
  }
}

class ValidationErrorHandler extends Advice<Error, string, any> {
  async isSupport(e: Error, context?: any): Promise<boolean> {
    return e instanceof ValidationError;
  }

  async exception(e: Error, context?: any): Promise<string> {
    console.log('  [ValidationErrorHandler] Handling validation error:', e.message);
    return `Validation error handled: ${e.message}`;
  }
}

class GenericErrorHandler extends Advice<Error, string, any> {
  async isSupport(e: Error, context?: any): Promise<boolean> {
    return true; // Supports all errors as fallback
  }

  async exception(e: Error, context?: any): Promise<string> {
    console.log('  [GenericErrorHandler] Handling generic error:', e.message);
    return `Generic error handled: ${e.message}`;
  }
}

export class AdviceExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Advice Pattern Example ===\n');
    console.log('Advice pattern provides a way to handle exceptions in a structured way using the Advice interface.\n');
    
    const handlers: Advice<Error, string, any>[] = [
      new NetworkErrorHandler(),
      new ValidationErrorHandler(),
      new GenericErrorHandler()
    ];
    
    const handleError = async (error: Error): Promise<string> => {
      for (const handler of handlers) {
        if (await handler.isSupport(error)) {
          return await handler.exception(error);
        }
      }
      return 'Unhandled error';
    };
    
    // Test different error types
    console.log('1. Testing NetworkError:');
    const networkError = new NetworkError('Connection timeout');
    const result1 = await handleError(networkError);
    console.log('  Result:', result1);
    
    console.log('\n2. Testing ValidationError:');
    const validationError = new ValidationError('Invalid email format');
    const result2 = await handleError(validationError);
    console.log('  Result:', result2);
    
    console.log('\n3. Testing Generic Error:');
    const genericError = new Error('Something went wrong');
    const result3 = await handleError(genericError);
    console.log('  Result:', result3);
    
    console.log('\n=========================\n');
  }
}