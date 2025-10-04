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
    const testDir = path.join(tmpDir, 'dooboo-test-dir');
    
    // Basic file operations
    clack.log.step('Basic file operations:');
    const content = 'Hello from DoobooStore Core-Node!\nThis is a test file.';
    FileUtils.write(Buffer.from(content), { path: testFile });
    clack.log.success(`Written to: ${testFile}`);
    
    // Read file
    const readContent = FileUtils.readSync(testFile);
    clack.log.info(`Read content: ${readContent.toString()}`);
    
    // File exists check
    const exists = FileUtils.existsSync(testFile);
    clack.log.info(`File exists: ${exists}`);
    
    // File class operations
    clack.log.step('File class operations:');
    const file = new FileUtils.File({ path: testFile });
    clack.log.info(`File name: ${file.fileName}`);
    clack.log.info(`Extension: ${file.extension}`);
    clack.log.info(`Directory: ${file.directory}`);
    clack.log.info(`Full path: ${file.path}`);
    
    // File operations with File class
    const newPath = path.join(tmpDir, 'dooboo-test-copied.txt');
    await file.copy(newPath);
    clack.log.success(`File copied to: ${newPath}`);
    
    // Rename file
    await file.rename('dooboo-test-renamed.txt');
    clack.log.success(`File renamed to: ${file.fileName}`);
    
    // Move file
    const moveDir = path.join(tmpDir, 'dooboo-move-dir');
    await FileUtils.mkdir(moveDir, { recursive: true });
    const movePath = path.join(moveDir, 'moved-file.txt');
    await file.move(movePath);
    clack.log.success(`File moved to: ${movePath}`);
    
    // Directory operations
    clack.log.step('Directory operations:');
    await FileUtils.mkdir(testDir, { recursive: true });
    clack.log.success(`Created directory: ${testDir}`);
    
    // Create nested directories
    const nestedDir = path.join(testDir, 'nested', 'deep');
    await FileUtils.mkdir(nestedDir, { recursive: true });
    clack.log.success(`Created nested directory: ${nestedDir}`);
    
    // Write file in nested directory
    const nestedFile = path.join(nestedDir, 'nested-file.txt');
    FileUtils.write('Nested file content', { path: nestedFile });
    clack.log.success(`Created file in nested directory: ${nestedFile}`);
    
    // File operations with different data types
    clack.log.step('Different data types:');
    const jsonFile = path.join(testDir, 'data.json');
    const jsonData = JSON.stringify({ name: 'DoobooStore', version: '1.0.0' }, null, 2);
    FileUtils.write(jsonData, { path: jsonFile });
    clack.log.success(`JSON file created: ${jsonFile}`);
    
    // Append to file
    const logFile = path.join(testDir, 'app.log');
    FileUtils.write('First log entry\n', { path: logFile });
    FileUtils.writeAppend('Second log entry\n', { path: logFile });
    FileUtils.writeAppend('Third log entry\n', { path: logFile });
    clack.log.success(`Log file with append operations: ${logFile}`);
    
    // Read appended file
    const logContent = FileUtils.readSync(logFile);
    clack.log.info(`Log content:\n${logContent.toString()}`);
    
    // Path utilities
    clack.log.step('Path utilities:');
    const pathArray = ['users', 'john', 'documents', 'file.txt'];
    const joinedPath = FileUtils.path(pathArray);
    clack.log.info(`Joined path from array: ${joinedPath}`);
    
    const singlePath = FileUtils.path('/single/path/file.txt');
    clack.log.info(`Single path: ${singlePath}`);
    
    // Cleanup
    clack.log.step('Cleanup:');
    FileUtils.deleteFileSync(movePath);
    FileUtils.deleteDirSync(moveDir);
    FileUtils.deleteDirSync(testDir);
    clack.log.success(`Cleaned up test files and directories`);
    
    clack.outro('✅ File example completed!');
  }
}
