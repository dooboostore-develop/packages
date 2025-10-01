import { Runnable } from '@dooboostore/core/runs/Runnable';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

export class FunctionExample implements Runnable {
  run(): void {
    console.log('\n=== Function Utils Example ===\n');
    
    console.log('1. Get parameter names:');
    function testFunc(param1: string, param2: number, param3: boolean) {
      return param1 + param2 + param3;
    }
    const paramNames = FunctionUtils.getParameterNames(testFunc);
    console.log('  Function:', testFunc.toString().substring(0, 50) + '...');
    console.log('  Parameter names:', paramNames);
    
    console.log('\n2. Get parameter names from object method:');
    const obj = {
      myMethod(arg1: string, arg2: number) {
        return arg1 + arg2;
      }
    };
    const methodParams = FunctionUtils.getParameterNames(obj, 'myMethod');
    console.log('  Method parameter names:', methodParams);
    
    console.log('\n3. Eval script:');
    const result1 = FunctionUtils.eval<number>('1 + 2 + 3');
    console.log('  Eval "1 + 2 + 3":', result1);
    
    const result2 = FunctionUtils.eval<string>('"Hello " + "World"');
    console.log('  Eval "Hello" + "World":', result2);
    
    console.log('\n4. Eval with object context:');
    const context = { x: 10, y: 20 };
    const result3 = FunctionUtils.eval<number>('return this.x + this.y;', context);
    console.log('  Context:', context);
    console.log('  Eval "this.x + this.y":', result3);
    
    console.log('\n=========================\n');
  }
}
