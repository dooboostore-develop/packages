import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { PathUtils } from '@dooboostore/core-node/path/PathUtils';

export class PathExample implements Runnable {
  run(): void {
    clack.intro('📁 Path Utils Example');
    
    // Join paths
    const joined = PathUtils.join('users', 'john', 'documents', 'file.txt');
    clack.log.info(`Join paths: ${joined}`);
    
    // Resolve paths
    const resolved = PathUtils.resolve('src', 'components', 'Button.tsx');
    clack.log.info(`Resolved path: ${resolved}`);
    
    // Basename
    const fullPath = '/users/john/documents/report.pdf';
    clack.log.info(`Basename: ${PathUtils.basename(fullPath)}`);
    clack.log.info(`Basename (no ext): ${PathUtils.basename(fullPath, '.pdf')}`);
    
    // Dirname
    clack.log.info(`Directory: ${PathUtils.dirname(fullPath)}`);
    
    // Extension
    clack.log.info(`Extension of "file.txt": ${PathUtils.extname('file.txt')}`);
    clack.log.info(`Extension of "archive.tar.gz": ${PathUtils.extname('archive.tar.gz')}`);
    
    // Parse path
    const parsed = PathUtils.parse('/home/user/documents/report.pdf');
    clack.log.info(`Parsed path: ${JSON.stringify(parsed, null, 2)}`);
    
    // Format path
    const formatted = PathUtils.format({
      dir: '/home/user/documents',
      name: 'report',
      ext: '.pdf'
    });
    clack.log.success(`Formatted: ${formatted}`);
    
    // Is absolute
    clack.log.info(`"/home/user" is absolute: ${PathUtils.isAbsolute('/home/user')}`);
    clack.log.info(`"./relative" is absolute: ${PathUtils.isAbsolute('./relative')}`);
    
    // Relative path
    const relative = PathUtils.relative('/data/projects/app', '/data/projects/lib/utils.js');
    clack.log.info(`Relative path: ${relative}`);
    
    // Normalize
    const normalized = PathUtils.normalize('/users/john/../jane/./documents//file.txt');
    clack.log.success(`Normalized: ${normalized}`);
    
    clack.outro('✅ Path example completed!');
  }
}
