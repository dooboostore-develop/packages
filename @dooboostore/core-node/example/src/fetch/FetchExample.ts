import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { HttpPageDownloader } from '@dooboostore/core-node/fetch/HttpPageDownloader';
import * as path from 'node:path';
import * as os from 'node:os';

export class FetchExample implements Runnable {
  async run(): Promise<void> {
    clack.intro('📥 HttpPageDownloader Example');
    
    // Basic download example
    clack.log.step('Downloading from JSONPlaceholder API...');
    const jsonDownloader = new HttpPageDownloader('https://jsonplaceholder.typicode.com');
    try {
      const json = await jsonDownloader.download('/posts/1');
      const data = JSON.parse(json);
      clack.log.info(`Downloaded post: "${data.title}"`);
      clack.log.info(`User ID: ${data.userId}`);
      clack.log.info(`Body: ${data.body.substring(0, 100)}...`);
    } catch (error) {
      clack.log.error(`Error: ${error}`);
    }
    
    // Download and save example
    clack.log.step('Downloading and saving multiple pages...');
    const tmpDir = path.join(os.tmpdir(), 'dooboo-download-test');
    const staticDownloader = new HttpPageDownloader('https://jsonplaceholder.typicode.com');
    
    try {
      // Download single page and save
      await staticDownloader.downloadAndSave(tmpDir, '/posts/1');
      clack.log.success(`Saved post 1 to: ${path.join(tmpDir, 'posts/1/index.html')}`);
      
      // Download multiple pages
      const routes = ['/posts/2', '/posts/3', '/users/1'];
      await staticDownloader.downloadAndSaveAll(tmpDir, routes);
      clack.log.success(`Downloaded and saved ${routes.length} pages`);
      
      // List downloaded files
      clack.log.info('Downloaded files:');
      routes.forEach(route => {
        const filePath = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
        clack.log.info(`  - ${filePath}`);
      });
      
    } catch (error) {
      clack.log.error(`Error during download and save: ${error}`);
    }
    
    // HTML page download example
    clack.log.step('Downloading HTML page...');
    const htmlDownloader = new HttpPageDownloader('https://httpbin.org');
    try {
      const html = await htmlDownloader.download('/html');
      clack.log.info(`Downloaded HTML (first 200 chars):\n${html.substring(0, 200)}...`);
      clack.log.success(`Total length: ${html.length} characters`);
    } catch (error) {
      clack.log.error(`Error downloading HTML: ${error}`);
    }
    
    // Error handling example
    clack.log.step('Error handling example...');
    const errorDownloader = new HttpPageDownloader('https://httpbin.org');
    try {
      await errorDownloader.download('/status/404');
      clack.log.warn('Unexpected: 404 should have failed');
    } catch (error) {
      clack.log.info(`Expected error caught: ${error.message}`);
    }
    
    clack.outro('✅ Fetch example completed!');
  }
}
