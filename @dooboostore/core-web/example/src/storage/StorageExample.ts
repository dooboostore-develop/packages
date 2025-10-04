import { Runnable } from '@dooboostore/core/runs/Runnable';
import { StorageUtils } from '@dooboostore/core-web/storage/StorageUtils';
import { showResult } from '../index';

export class StorageExample implements Runnable {
  async run(): Promise<void> {
    showResult('Storage API', 'Testing LocalStorage and SessionStorage');
    
    // LocalStorage operations
    const key = 'test-key';
    const value = 'test-value';
    const objKey = 'test-object';
    const objValue = { name: 'John', age: 30, city: 'Seoul' };
    
    StorageUtils.setLocalStorageItem(key, value, window);
    showResult('LocalStorage Set', `Set "${key}" = "${value}"`, true);
    
    const retrieved = StorageUtils.getLocalStorageItem(key, window);
    showResult('LocalStorage Get', `Retrieved: "${retrieved}"`, true);
    
    StorageUtils.setLocalStorageItem(objKey, objValue, window);
    showResult('LocalStorage Set Object', `Set object: ${JSON.stringify(objValue)}`, true);
    
    const retrievedObj = StorageUtils.getLocalStorageJsonItem(objKey, window);
    showResult('LocalStorage Get Object', `Retrieved: ${JSON.stringify(retrievedObj)}`, true);
    
    // SessionStorage operations
    StorageUtils.setSessionStorageItem('session-key', 'session-value', window);
    const sessionValue = StorageUtils.getSessionStorageItem('session-key', window);
    showResult('SessionStorage', `Session value: "${sessionValue}"`, true);
    
    // Test JSON operations with SessionStorage
    const sessionObj = { timestamp: Date.now(), user: 'test-user' };
    StorageUtils.setSessionStorageItem('session-object', sessionObj, window);
    const retrievedSessionObj = StorageUtils.getSessionStorageJsonItem('session-object', window);
    showResult('SessionStorage JSON', `Retrieved session object: ${JSON.stringify(retrievedSessionObj)}`, true);
    
    // Test cut operations (get and remove)
    const cutValue = StorageUtils.cutLocalStorageItem(key, window);
    showResult('Cut LocalStorage', `Cut value: "${cutValue}"`, true);
    
    const cutSessionValue = StorageUtils.cutSessionStorageItem('session-key', window);
    showResult('Cut SessionStorage', `Cut session value: "${cutSessionValue}"`, true);
    
    // Test JSON cut operations
    const cutJsonValue = StorageUtils.cutLocalStorageJsonItem(objKey, window);
    showResult('Cut LocalStorage JSON', `Cut JSON value: ${JSON.stringify(cutJsonValue)}`, true);
    
    const cutSessionJsonValue = StorageUtils.cutSessionStorageJsonItem('session-object', window);
    showResult('Cut SessionStorage JSON', `Cut session JSON value: ${JSON.stringify(cutSessionJsonValue)}`, true);
    
    // Test storage with different data types
    const testData = {
      string: 'Hello World',
      number: 42,
      boolean: true,
      array: [1, 2, 3, 4, 5],
      object: { nested: { value: 'deep' } },
      null: null,
      undefined: undefined
    };
    
    StorageUtils.setLocalStorageItem('complex-data', testData, window);
    const retrievedComplexData = StorageUtils.getLocalStorageJsonItem('complex-data', window);
    showResult('Complex Data', `Retrieved complex data: ${JSON.stringify(retrievedComplexData)}`, true);
    
    // Test storage capacity
    const largeData = 'x'.repeat(1000); // 1KB string
    StorageUtils.setLocalStorageItem('large-data', largeData, window);
    const retrievedLargeData = StorageUtils.getLocalStorageItem('large-data', window);
    showResult('Large Data', `Large data length: ${retrievedLargeData?.length || 0}`, true);
    
    // Test storage error handling
    try {
      // Try to store a circular reference (should fail)
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      StorageUtils.setLocalStorageItem('circular-data', circularObj, window);
    } catch (error) {
      showResult('Circular Reference', `Caught error: ${error}`, true);
    }
    
    // Test storage with expiration
    const expiringData = { value: 'This will expire', timestamp: Date.now() };
    StorageUtils.setLocalStorageItem('expiring-data', expiringData, window);
    showResult('Expiring Data', 'Set data with timestamp for expiration tracking', true);
    
    // Test storage cleanup
    StorageUtils.clearLocalStorage(window);
    showResult('Clear LocalStorage', 'Cleared all LocalStorage data', true);
    
    StorageUtils.clearSessionStorage(window);
    showResult('Clear SessionStorage', 'Cleared all SessionStorage data', true);
    
    // Verify cleanup
    const remainingLocalData = StorageUtils.getLocalStorageItem('complex-data', window);
    const remainingSessionData = StorageUtils.getSessionStorageItem('session-key', window);
    showResult('Verify Cleanup', `Remaining data: Local=${remainingLocalData || 'null'}, Session=${remainingSessionData || 'null'}`, true);
    
    showResult('Info', 'StorageUtils provides comprehensive browser storage management with JSON support');
  }
}
