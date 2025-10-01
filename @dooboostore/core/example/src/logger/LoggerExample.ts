import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Logger, LoggerLevel } from '@dooboostore/core/logger/Logger';

export class LoggerExample implements Runnable {
  run(): void {
    console.log('\n=== Logger Example ===\n');
    
    console.log('1. Create logger with configuration:');
    const logger = new Logger({
      level: LoggerLevel.INFO,
      format: "${date:'yyyy-MM-dd HH:mm:ss'} [${level}] ${file}:${line} ${message}"
    });
    console.log('  Logger created with format');
    
    console.log('\n2. Logging messages:');
    logger.log('This is a log message');
    logger.error('This is an error message');
    logger.warn('This is a warning');
    logger.info('This is an info message');
    logger.debug('This is debug info');
    
    console.log('\n3. Logger with different config:');
    const simpleLogger = new Logger({
      level: LoggerLevel.DEBUG,
      format: "[${level}] ${message}"
    });
    simpleLogger.info('Simple format message');
    
    console.log('\n4. Logger levels:');
    console.log('  Available levels:', Object.keys(LoggerLevel));
    
    console.log('\n5. Update logger config:');
    simpleLogger.setConfig({
      level: LoggerLevel.ERROR,
      format: "ERROR: ${message}"
    });
    simpleLogger.error('Updated config error');
    
    console.log('\n=========================\n');
  }
}
