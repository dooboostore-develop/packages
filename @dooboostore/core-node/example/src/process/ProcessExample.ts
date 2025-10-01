import { Runnable } from '@dooboostore/core/runs/Runnable';
import * as clack from '@clack/prompts';
import { ProcessUtils } from '@dooboostore/core-node/process/ProcessUtils';

export class ProcessExample implements Runnable {
  run(): void {
    clack.intro('⚙️ Process Utils Example');
    
    // Process info
    clack.log.info(`Process ID: ${ProcessUtils.getPid()}`);
    clack.log.info(`Platform: ${ProcessUtils.getPlatform()}`);
    clack.log.info(`Node version: ${ProcessUtils.getNodeVersion()}`);
    clack.log.info(`Architecture: ${ProcessUtils.getArch()}`);
    
    // Current working directory
    clack.log.info(`CWD: ${ProcessUtils.getCwd()}`);
    
    // Environment variables
    clack.log.info(`HOME: ${ProcessUtils.getEnv('HOME')}`);
    const pathEnv = ProcessUtils.getEnv('PATH');
    clack.log.info(`PATH (first 100 chars): ${pathEnv?.substring(0, 100)}...`);
    
    // Process uptime
    clack.log.info(`Uptime: ${ProcessUtils.getUptime().toFixed(2)} seconds`);
    
    // CPU usage
    const cpuUsage = ProcessUtils.getCpuUsage();
    clack.log.info(`CPU - User: ${cpuUsage.user}μs, System: ${cpuUsage.system}μs`);
    
    // Command line arguments
    const argv = ProcessUtils.getArgv();
    clack.log.info(`Arguments: ${argv.slice(0, 3).join(', ')}...`);
    
    // Process title
    clack.log.info(`Title: ${ProcessUtils.getTitle()}`);
    
    // Set/Get environment variable
    ProcessUtils.setEnv('DOOBOO_TEST', 'example-value');
    clack.log.success(`Set DOOBOO_TEST = ${ProcessUtils.getEnv('DOOBOO_TEST')}`);
    
    // Check environment
    clack.log.info(`Is production: ${ProcessUtils.isProduction()}`);
    clack.log.info(`Is development: ${ProcessUtils.isDevelopment()}`);
    clack.log.info(`Is test: ${ProcessUtils.isTest()}`);
    
    // Process versions
    const versions = ProcessUtils.getVersions();
    clack.log.info(`Node: ${versions.node}, V8: ${versions.v8}`);
    
    clack.outro('✅ Process example completed!');
  }
}
