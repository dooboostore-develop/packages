import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';

export class ValidExample implements Runnable {
  run(): void {
    console.log('\n=== Valid Utils Example ===\n');
    
    console.log('1. Type checks:');
    console.log('  isString("hello"):', ValidUtils.isString('hello'));
    console.log('  isNumber(42):', ValidUtils.isNumber(42));
    console.log('  isArray([1,2,3]):', ValidUtils.isArray([1, 2, 3]));
    console.log('  isObject({}):', ValidUtils.isObject({}));
    console.log('  isFunction(() => {}):', ValidUtils.isFunction(() => {}));
    
    console.log('\n2. Empty checks:');
    console.log('  isEmpty(""):', ValidUtils.isEmpty(''));
    console.log('  isEmpty("  "):', ValidUtils.isEmpty('  '));
    console.log('  isEmpty("hello"):', ValidUtils.isEmpty('hello'));
    console.log('  isEmpty([]):', ValidUtils.isEmpty([]));
    console.log('  isEmpty({}):', ValidUtils.isEmpty({}));
    console.log('  isEmpty(null):', ValidUtils.isEmpty(null));
    console.log('  isEmpty(undefined):', ValidUtils.isEmpty(undefined));
    
    console.log('\n3. Null/Undefined checks:');
    console.log('  isNull(null):', ValidUtils.isNull(null));
    console.log('  isUndefined(undefined):', ValidUtils.isUndefined(undefined));
    console.log('  isNullOrUndefined(null):', ValidUtils.isNullOrUndefined(null));
    console.log('  isNullOrUndefined(0):', ValidUtils.isNullOrUndefined(0));
    console.log('  isNullOrUndefined(undefined):', ValidUtils.isNullOrUndefined(undefined));
    
    console.log('\n4. Type comparison:');
    console.log('  123 is number?', ValidUtils.isNumber(123));
    console.log('  "123" is number?', ValidUtils.isNumber('123'));
    console.log('  {} is object?', ValidUtils.isObject({}));
    console.log('  [] is array?', ValidUtils.isArray([]));
    console.log('  () => {} is function?', ValidUtils.isFunction(() => {}));
    
    console.log('\n=========================\n');
  }
}
