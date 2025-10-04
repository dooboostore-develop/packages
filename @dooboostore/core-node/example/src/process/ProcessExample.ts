import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { ProcessUtils } from '@dooboostore/core-node/process/ProcessUtils';

export class ProcessExample implements Runnable {
  run(): void {
    clack.intro('⚙️ Process Utils Example');
    
    // Basic process information
    clack.log.step('Basic process information:');
    clack.log.info(`Process ID: ${ProcessUtils.getPid()}`);
    clack.log.info(`Platform: ${ProcessUtils.getPlatform()}`);
    clack.log.info(`Node version: ${ProcessUtils.getNodeVersion()}`);
    clack.log.info(`Architecture: ${ProcessUtils.getArch()}`);
    
    // Current working directory
    clack.log.info(`Current working directory: ${ProcessUtils.getCwd()}`);
    
    // Environment variables
    clack.log.step('Environment variables:');
    const envVars = ['HOME', 'USER', 'SHELL', 'PATH', 'NODE_ENV'];
    envVars.forEach(envVar => {
      const value = ProcessUtils.getEnv(envVar);
      if (value) {
        const displayValue = envVar === 'PATH' ? 
          `${value.substring(0, 100)}...` : 
          value;
        clack.log.info(`${envVar}: ${displayValue}`);
      } else {
        clack.log.info(`${envVar}: (not set)`);
      }
    });
    
    // Process uptime and performance
    clack.log.step('Process performance:');
    clack.log.info(`Uptime: ${ProcessUtils.getUptime().toFixed(2)} seconds`);
    
    const cpuUsage = ProcessUtils.getCpuUsage();
    clack.log.info(`CPU usage - User: ${cpuUsage.user}μs, System: ${cpuUsage.system}μs`);
    
    // Command line arguments
    clack.log.step('Command line arguments:');
    const argv = ProcessUtils.getArgv();
    clack.log.info(`Total arguments: ${argv.length}`);
    clack.log.info(`Arguments: ${argv.slice(0, 5).join(', ')}${argv.length > 5 ? '...' : ''}`);
    
    // Process title
    clack.log.info(`Process title: ${ProcessUtils.getTitle()}`);
    
    // Environment variable manipulation
    clack.log.step('Environment variable manipulation:');
    const testKey = 'DOOBOO_TEST';
    const testValue = `example-value-${Date.now()}`;
    
    ProcessUtils.setEnv(testKey, testValue);
    const retrievedValue = ProcessUtils.getEnv(testKey);
    clack.log.success(`Set ${testKey} = ${retrievedValue}`);
    
    // Environment detection
    clack.log.step('Environment detection:');
    clack.log.info(`Is production: ${ProcessUtils.isProduction()}`);
    clack.log.info(`Is development: ${ProcessUtils.isDevelopment()}`);
    clack.log.info(`Is test: ${ProcessUtils.isTest()}`);
    
    // Process versions
    clack.log.step('Process versions:');
    const versions = ProcessUtils.getVersions();
    const importantVersions = ['node', 'v8', 'uv', 'zlib', 'openssl'];
    
    importantVersions.forEach(version => {
      if (versions[version]) {
        clack.log.info(`${version}: ${versions[version]}`);
      }
    });
    
    // Platform-specific information
    clack.log.step('Platform-specific information:');
    const platform = ProcessUtils.getPlatform();
    switch (platform) {
      case 'darwin':
        clack.log.info('Running on macOS');
        break;
      case 'linux':
        clack.log.info('Running on Linux');
        break;
      case 'win32':
        clack.log.info('Running on Windows');
        break;
      default:
        clack.log.info(`Running on ${platform}`);
    }
    
    // Architecture information
    const arch = ProcessUtils.getArch();
    switch (arch) {
      case 'x64':
        clack.log.info('64-bit architecture');
        break;
      case 'arm64':
        clack.log.info('ARM64 architecture');
        break;
      case 'ia32':
        clack.log.info('32-bit architecture');
        break;
      default:
        clack.log.info(`${arch} architecture`);
    }
    
    // Cleanup test environment variable
    ProcessUtils.setEnv(testKey, '');
    clack.log.info(`Cleaned up test environment variable: ${testKey}`);
    
    clack.outro('✅ Process example completed!');
  }
}
