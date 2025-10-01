import { Runnable } from '@dooboostore/core/runs/Runnable';

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

// Simple advice interface
interface ErrorHandler {
  isSupport(e: Error): boolean;
  handle(e: Error): string;
}

// Error handler implementations
class NetworkErrorHandler implements ErrorHandler {
  isSupport(e: Error): boolean {
    return e instanceof NetworkError;
  }

  handle(e: Error): string {
    console.log('  [NetworkErrorHandler] Handling network error:', e.message);
    return `Network error handled: ${e.message}`;
  }
}

class ValidationErrorHandler implements ErrorHandler {
  isSupport(e: Error): boolean {
    return e instanceof ValidationError;
  }

  handle(e: Error): string {
    console.log('  [ValidationErrorHandler] Handling validation error:', e.message);
    return `Validation error handled: ${e.message}`;
  }
}

class GenericErrorHandler implements ErrorHandler {
  isSupport(e: Error): boolean {
    return true; // Supports all errors as fallback
  }

  handle(e: Error): string {
    console.log('  [GenericErrorHandler] Handling generic error:', e.message);
    return `Generic error handled: ${e.message}`;
  }
}

export class AdviceExample implements Runnable {
  run(): void {
    console.log('\n=== Advice Pattern Example ===\n');
    console.log('Advice pattern provides a way to handle exceptions in a structured way.\n');
    
    const handlers: ErrorHandler[] = [
      new NetworkErrorHandler(),
      new ValidationErrorHandler(),
      new GenericErrorHandler()
    ];
    
    const handleError = (error: Error): string => {
      for (const handler of handlers) {
        if (handler.isSupport(error)) {
          return handler.handle(error);
        }
      }
      return 'Unhandled error';
    };
    
    // Test different error types
    console.log('1. Testing NetworkError:');
    const networkError = new NetworkError('Connection timeout');
    const result1 = handleError(networkError);
    console.log('  Result:', result1);
    
    console.log('\n2. Testing ValidationError:');
    const validationError = new ValidationError('Invalid email format');
    const result2 = handleError(validationError);
    console.log('  Result:', result2);
    
    console.log('\n3. Testing Generic Error:');
    const genericError = new Error('Something went wrong');
    const result3 = handleError(genericError);
    console.log('  Result:', result3);
    
    console.log('\n=========================\n');
  }
}