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
    
    // Base64 conversion
    clack.log.step('Base64 conversion examples:');
    const data = 'Hello, Node.js!';
    const base64 = Buffer.from(data, 'utf-8').toString('base64');
    clack.log.info(`Original: ${data}`);
    clack.log.info(`Base64: ${base64}`);
    
    // Using ConvertUtils.toBuffer for base64
    const bufferFromBase64 = ConvertUtils.toBuffer(base64, { encoding: 'base64' });
    const decoded = bufferFromBase64.toString('utf-8');
    clack.log.success(`Decoded from base64: ${decoded}`);
    
    // Data URL with base64
    const dataUrl = `data:text/plain;base64,${base64}`;
    const base64FromDataUrl = dataUrl.split(';base64,').pop() || '';
    const bufferFromDataUrl = ConvertUtils.toBuffer(base64FromDataUrl, { encoding: 'base64' });
    const decodedFromDataUrl = bufferFromDataUrl.toString('utf-8');
    clack.log.info(`Data URL: ${dataUrl}`);
    clack.log.success(`Decoded from data URL: ${decodedFromDataUrl}`);
    
    // Binary data example
    const binaryData = Buffer.from([72, 101, 108, 108, 111]); // "Hello" in ASCII
    clack.log.info(`Binary data: ${ConvertUtils.toString(binaryData)}`);
    
    // Different encodings
    const utf16Buffer = Buffer.from('Hello', 'utf16le');
    clack.log.info(`UTF-16 buffer: ${ConvertUtils.toString(utf16Buffer, { encoding: 'utf16le' })}`);
    
    clack.outro('✅ Convert example completed!');
  }
}
