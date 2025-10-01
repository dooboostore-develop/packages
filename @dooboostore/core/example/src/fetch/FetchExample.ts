import { Runnable } from '@dooboostore/core/runs/Runnable';
import { HttpFetcher } from '@dooboostore/core/fetch/HttpFetcher';
import { HttpJsonFetcher } from '@dooboostore/core/fetch/HttpJsonFetcher';

export class FetchExample implements Runnable {
  async run(): Promise<void> {
    console.log('\n=== Fetch Example ===\n');
    
    console.log('1. HttpFetcher - Creating instance:');
    const fetcher = new HttpFetcher();
    console.log('  HttpFetcher created:', fetcher);
    
    console.log('\n2. HttpJsonFetcher - Creating instance:');
    const jsonFetcher = new HttpJsonFetcher();
    console.log('  HttpJsonFetcher created:', jsonFetcher);
    
    console.log('\n3. Fetch target types:');
    console.log('  HttpFetcher supports various target types:');
    console.log('  - URL string: "https://api.example.com/data"');
    console.log('  - URL object: new URL("https://api.example.com/data")');
    
    console.log('\n4. Fetch target types:');
    console.log('  Can fetch from URL string, URL object, or object with url and searchParams');
    console.log('  Example targets:');
    console.log('    - "https://api.example.com/data"');
    console.log('    - new URL("https://api.example.com/data")');
    console.log('    - { url: "https://api.example.com/data", searchParams: { page: 1 } }');
    
    console.log('\n=========================\n');
  }
}
