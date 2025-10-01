import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { ConvertUtils } from '@dooboostore/core-node/convert/ConvertUtils';

export class ConvertExample implements Runnable {
  run(): void {
    clack.intro('🔄 Convert Utils Example');
    
    // Buffer to String
    const buffer = Buffer.from('Hello, World!', 'utf-8');
    clack.log.info(`Buffer to String: ${ConvertUtils.toString(buffer)}`);
    
    // Korean text
    const buffer2 = Buffer.from('안녕하세요', 'utf-8');
    clack.log.info(`Korean text: ${ConvertUtils.toString(buffer2, { encoding: 'utf-8' })}`);
    
    // Buffer with range
    const buffer3 = Buffer.from('0123456789', 'utf-8');
    clack.log.info(`Full: ${ConvertUtils.toString(buffer3)}`);
    clack.log.info(`Substring [2:5]: ${ConvertUtils.toString(buffer3, { start: 2, end: 5 })}`);
    
    // String passthrough
    clack.log.success(`String passthrough: ${ConvertUtils.toString('Direct string')}`);
    
    // Base64
    const data = 'Hello, Node.js!';
    const base64 = Buffer.from(data, 'utf-8').toString('base64');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    clack.log.info(`Original: ${data}`);
    clack.log.info(`Base64: ${base64}`);
    clack.log.success(`Decoded: ${decoded}`);
    
    clack.outro('✅ Convert example completed!');
  }
}
