import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { FileUtils } from '@dooboostore/core-node/file/FileUtils';
import * as path from 'node:path';
import * as os from 'node:os';

export class FileExample implements Runnable {
  async run(): Promise<void> {
    clack.intro('📁 File Utils Example');
    
    const tmpDir = os.tmpdir();
    const testFile = path.join(tmpDir, 'dooboo-test.txt');
    
    // Write file
    const content = 'Hello from DoobooStore Core-Node!';
    FileUtils.write(Buffer.from(content), { path: testFile });
    clack.log.success(`Written to: ${testFile}`);
    
    // Read file
    const readContent = FileUtils.readSync(testFile);
    clack.log.info(`Read content: ${readContent.toString()}`);
    
    // File exists check
    const exists = FileUtils.existsSync(testFile);
    clack.log.info(`File exists: ${exists}`);
    
    // File class
    const file = new FileUtils.File({ path: testFile });
    clack.log.info(`File name: ${file.fileName}, Extension: ${file.extension}, Directory: ${file.directory}`);
    
    // Delete file
    FileUtils.deleteFileSync(testFile);
    const existsAfter = FileUtils.existsSync(testFile);
    clack.log.success(`File deleted, exists now: ${existsAfter}`);
    
    // Directory operations
    const testDir = path.join(tmpDir, 'dooboo-test-dir');
    await FileUtils.mkdir(testDir, { recursive: true });
    clack.log.success(`Created directory: ${testDir}`);
    
    FileUtils.deleteDirSync(testDir);
    clack.log.success(`Directory removed`);
    
    clack.outro('✅ File example completed!');
  }
}
