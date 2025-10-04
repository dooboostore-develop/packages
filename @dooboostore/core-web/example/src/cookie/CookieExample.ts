import { Runnable } from '@dooboostore/core/runs/Runnable';
import { CookieUtils } from '@dooboostore/core-web/cookie/CookieUtils';
import { showResult } from '../index';

export class CookieExample implements Runnable {
  async run(): Promise<void> {
    showResult('Cookie Utils', 'Testing cookie creation, reading, and management');
    
    // Get all cookie names
    const cookieNames = CookieUtils.names();
    showResult('Cookie Names', `Current cookies: ${cookieNames.join(', ') || 'None'}`, true);
    
    // Create a simple cookie
    const simpleCookie = CookieUtils.make('test-simple', 'simple-value');
    showResult('Simple Cookie', `Created: ${simpleCookie}`, true);
    
    // Create a cookie with options
    const advancedCookie = CookieUtils.make('test-advanced', 'advanced-value', {
      expireSecond: 3600, // 1 hour
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict'
    });
    showResult('Advanced Cookie', `Created with options: ${advancedCookie}`, true);
    
    // Set cookies
    CookieUtils.set('test-session', 'session-data', {
      path: '/',
      secure: false
    });
    showResult('Set Cookie', 'Set session cookie', true);
    
    // Read cookie
    const sessionValue = CookieUtils.get('test-session');
    showResult('Read Cookie', `Session value: ${sessionValue}`, true);
    
    // Create a cookie that expires in 5 seconds for testing
    CookieUtils.set('test-expire', 'expire-data', {
      expireSecond: 5,
      path: '/'
    });
    showResult('Expiring Cookie', 'Created cookie that expires in 5 seconds', true);
    
    // Remove a cookie
    CookieUtils.remove('test-session', { path: '/' });
    showResult('Remove Cookie', 'Removed session cookie', true);
    
    // Verify removal
    const removedValue = CookieUtils.get('test-session');
    showResult('Verify Removal', `Session value after removal: ${removedValue || 'null'}`, true);
    
    showResult('Info', 'CookieUtils provides comprehensive cookie management with advanced options');
  }
}