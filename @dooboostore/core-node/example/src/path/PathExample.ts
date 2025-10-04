import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { PathUtils } from '@dooboostore/core-node/path/PathUtils';

export class PathExample implements Runnable {
  run(): void {
    clack.intro('📁 Path Utils Example');
    
    // Join paths
    clack.log.step('Path joining:');
    const joined = PathUtils.join('users', 'john', 'documents', 'file.txt');
    clack.log.info(`Join paths: ${joined}`);
    
    const joinedWithArray = PathUtils.join(...['src', 'components', 'ui', 'Button.tsx']);
    clack.log.info(`Join with array: ${joinedWithArray}`);
    
    // Resolve paths
    clack.log.step('Path resolution:');
    const resolved = PathUtils.resolve('src', 'components', 'Button.tsx');
    clack.log.info(`Resolved path: ${resolved}`);
    
    const resolvedAbsolute = PathUtils.resolve('/home/user', 'projects', 'app');
    clack.log.info(`Resolved absolute: ${resolvedAbsolute}`);
    
    // Basename operations
    clack.log.step('Basename operations:');
    const fullPath = '/users/john/documents/report.pdf';
    clack.log.info(`Full path: ${fullPath}`);
    clack.log.info(`Basename: ${PathUtils.basename(fullPath)}`);
    clack.log.info(`Basename (no ext): ${PathUtils.basename(fullPath, '.pdf')}`);
    
    const archivePath = '/downloads/archive.tar.gz';
    clack.log.info(`Archive basename: ${PathUtils.basename(archivePath)}`);
    clack.log.info(`Archive basename (no .gz): ${PathUtils.basename(archivePath, '.gz')}`);
    clack.log.info(`Archive basename (no .tar.gz): ${PathUtils.basename(archivePath, '.tar.gz')}`);
    
    // Dirname operations
    clack.log.step('Directory operations:');
    clack.log.info(`Directory of ${fullPath}: ${PathUtils.dirname(fullPath)}`);
    clack.log.info(`Directory of ${archivePath}: ${PathUtils.dirname(archivePath)}`);
    
    // Extension operations
    clack.log.step('Extension operations:');
    const extensions = ['file.txt', 'archive.tar.gz', 'image.png', 'script.js', 'style.css'];
    extensions.forEach(file => {
      clack.log.info(`Extension of "${file}": ${PathUtils.extname(file)}`);
    });
    
    // Parse path
    clack.log.step('Path parsing:');
    const pathsToParse = [
      '/home/user/documents/report.pdf',
      'C:\\Users\\John\\Documents\\file.txt',
      './relative/path/file.js',
      'file-without-extension'
    ];
    
    pathsToParse.forEach(pathStr => {
      const parsed = PathUtils.parse(pathStr);
      clack.log.info(`Parsed "${pathStr}":`);
      clack.log.info(`  Root: ${parsed.root}`);
      clack.log.info(`  Dir: ${parsed.dir}`);
      clack.log.info(`  Base: ${parsed.base}`);
      clack.log.info(`  Name: ${parsed.name}`);
      clack.log.info(`  Ext: ${parsed.ext}`);
    });
    
    // Format path
    clack.log.step('Path formatting:');
    const pathObjects = [
      {
        dir: '/home/user/documents',
        name: 'report',
        ext: '.pdf'
      },
      {
        root: 'C:\\',
        dir: 'C:\\Users\\John',
        base: 'file.txt',
        name: 'file',
        ext: '.txt'
      },
      {
        name: 'config',
        ext: '.json'
      }
    ];
    
    pathObjects.forEach((pathObj, index) => {
      const formatted = PathUtils.format(pathObj);
      clack.log.info(`Formatted path ${index + 1}: ${formatted}`);
    });
    
    // Absolute path detection
    clack.log.step('Absolute path detection:');
    const testPaths = [
      '/home/user',
      './relative',
      '../parent',
      'C:\\Windows',
      'relative/path',
      '/',
      '.'
    ];
    
    testPaths.forEach(path => {
      clack.log.info(`"${path}" is absolute: ${PathUtils.isAbsolute(path)}`);
    });
    
    // Relative path calculation
    clack.log.step('Relative path calculation:');
    const relativeTests = [
      { from: '/data/projects/app', to: '/data/projects/lib/utils.js' },
      { from: '/home/user', to: '/home/user/documents/file.txt' },
      { from: 'C:\\Users\\John', to: 'C:\\Users\\John\\Documents\\file.txt' },
      { from: '/app/src', to: '/app/dist/bundle.js' }
    ];
    
    relativeTests.forEach(({ from, to }) => {
      const relative = PathUtils.relative(from, to);
      clack.log.info(`From "${from}" to "${to}": ${relative}`);
    });
    
    // Path normalization
    clack.log.step('Path normalization:');
    const pathsToNormalize = [
      '/users/john/../jane/./documents//file.txt',
      'C:\\Users\\John\\..\\Jane\\.\\Documents\\\\file.txt',
      './src/../dist/./bundle.js',
      '/home/user/././documents/../downloads/file.zip'
    ];
    
    pathsToNormalize.forEach(path => {
      const normalized = PathUtils.normalize(path);
      clack.log.info(`"${path}" → "${normalized}"`);
    });
    
    // Cross-platform examples
    clack.log.step('Cross-platform examples:');
    const crossPlatformPaths = [
      ['users', 'john', 'documents', 'file.txt'],
      ['src', '..', 'dist', 'bundle.js'],
      ['C:', 'Users', 'John', 'Documents'],
      ['/home', 'user', 'projects', 'app']
    ];
    
    crossPlatformPaths.forEach(pathParts => {
      const joined = PathUtils.join(...pathParts);
      const resolved = PathUtils.resolve(...pathParts);
      clack.log.info(`Join: ${joined}`);
      clack.log.info(`Resolve: ${resolved}`);
    });
    
    clack.outro('✅ Path example completed!');
  }
}
