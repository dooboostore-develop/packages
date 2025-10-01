import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Code } from '@dooboostore/core/code/Code';

export class CodeExample implements Runnable {
  run(): void {
    console.log('\n=== Code Example ===\n');
    
    console.log('1. Code type with data:');
    const successCode: Code<{ userId: number }> = {
      description: 'User created successfully',
      data: { userId: 123 }
    };
    console.log('  Success Code:', successCode);
    console.log('  Description:', successCode.description);
    console.log('  Data:', successCode.data);
    
    console.log('\n2. Error Code:');
    const errorCode: Code<{ error: string; details: string }> = {
      description: 'Operation failed',
      data: {
        error: 'NETWORK_ERROR',
        details: 'Connection timeout'
      }
    };
    console.log('  Error Code:', errorCode);
    console.log('  Data:', errorCode.data);
    
    console.log('\n3. Code without description:');
    const simpleCode: Code<string> = {
      data: 'Simple string data'
    };
    console.log('  Simple Code:', simpleCode);
    
    console.log('\n=========================\n');
  }
}
