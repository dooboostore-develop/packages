import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { HttpPageDownloader } from '@dooboostore/core-node/fetch/HttpPageDownloader';

export class FetchExample implements Runnable {
  async run(): Promise<void> {
    clack.intro('📥 HttpPageDownloader Example');
    
    clack.log.step('Downloading from Google...');
    const downloader = new HttpPageDownloader('https://www.google.com');
    const html = await downloader.download('/');
    
    clack.log.info(`Downloaded HTML (first 200 chars):\n${html.substring(0, 200)}...`);
    clack.log.success(`Total length: ${html.length} characters`);
    
    clack.log.step('Downloading JSON from API...');
    const jsonDownloader = new HttpPageDownloader('https://jsonplaceholder.typicode.com');
    try {
      const json = await jsonDownloader.download('/posts/1');
      const data = JSON.parse(json);
      clack.log.info(`Downloaded post: "${data.title}"`);
      clack.log.info(`User ID: ${data.userId}`);
    } catch (error) {
      clack.log.error(`Error: ${error}`);
    }
    
    clack.outro('✅ Fetch example completed!');
  }
}
