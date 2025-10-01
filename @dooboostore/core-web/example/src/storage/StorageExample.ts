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
    const objValue = { name: 'John', age: 30 };
    
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
    
    // Cleanup
    StorageUtils.removeLocalStorageItem(key, window);
    StorageUtils.removeLocalStorageItem(objKey, window);
    showResult('Cleanup', 'Removed test data from storage', true);
  }
}
