import { Runnable } from '@dooboostore/core/runs/Runnable';
import { CookieUtils } from '@dooboostore/core-web/cookie/CookieUtils';
import { showResult } from '../index';

export class CookieExample implements Runnable {
  async run(): Promise<void> {
    showResult('Cookie API', 'Testing cookie operations');
    
    // Set cookie
    const cookieName = 'test-cookie';
    const cookieValue = 'cookie-value';
    const cookieStr = CookieUtils.make(cookieName, cookieValue, {
      path: '/',
      expireSecond: 3600, // 1 hour
    });
    document.cookie = cookieStr;
    showResult('Set Cookie', `Set "${cookieName}" = "${cookieValue}"`, true);
    
    // Get cookie
    const retrieved = CookieUtils.get(cookieName);
    showResult('Get Cookie', `Retrieved: "${retrieved}"`, true);
    
    // Get all cookie names
    const names = CookieUtils.names();
    showResult('All Cookies', `Cookie names: ${names.join(', ')}`, true);
    
    // Delete cookie
    const deleteCookie = CookieUtils.make(cookieName, null, { expireSecond: null });
    document.cookie = deleteCookie;
    showResult('Delete Cookie', `Deleted "${cookieName}"`, true);
    
    const afterDelete = CookieUtils.get(cookieName);
    showResult('Verify Delete', `Cookie after delete: ${afterDelete || 'null'}`, true);
  }
}
