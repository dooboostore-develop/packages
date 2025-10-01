import { Runnable } from '@dooboostore/core/runs/Runnable';
import { UrlUtils } from '@dooboostore/core/url/UrlUtils';

export class UrlExample implements Runnable {
  run(): void {
    console.log('\n=== URL Utils Example ===\n');
    
    console.log('1. Get origin from URL:');
    const url1 = 'https://api.example.com:8080/path/to/resource?query=value';
    console.log('  URL:', url1);
    console.log('  Origin:', UrlUtils.origin(url1));
    
    const url2 = 'http://localhost:3000/api/users';
    console.log('\n  URL:', url2);
    console.log('  Origin:', UrlUtils.origin(url2));
    
    console.log('\n2. Convert to URL object:');
    const url3 = 'https://github.com/user/repo/blob/main/README.md';
    console.log('  URL string:', url3);
    const urlObj = UrlUtils.toUrl(url3);
    console.log('  URL object:', urlObj);
    console.log('  Hostname:', urlObj.hostname);
    console.log('  Pathname:', urlObj.pathname);
    console.log('  Protocol:', urlObj.protocol);
    
    console.log('\n3. Working with URL parameters:');
    const url4 = 'https://example.com?page=1&limit=10&sort=name';
    console.log('  URL:', url4);
    const parsed = new URL(url4);
    console.log('  Search params:', parsed.searchParams.toString());
    console.log('  Get page:', parsed.searchParams.get('page'));
    console.log('  Get limit:', parsed.searchParams.get('limit'));
    
    console.log('\n=========================\n');
  }
}
