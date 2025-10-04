import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Logger, LoggerLevel } from '@dooboostore/core/logger/Logger';

export class LoggerExample implements Runnable {
  run(): void {
    console.log('\n=== Logger Example ===\n');
    
    // Basic logger without configuration
    console.log('1. Basic Logger (no configuration):');
    const basicLogger = new Logger();
    basicLogger.log('This is a log message');
    basicLogger.info('This is an info message');
    basicLogger.warn('This is a warning message');
    basicLogger.error('This is an error message');
    basicLogger.debug('This is a debug message');
    basicLogger.trace('This is a trace message');
    
    // Logger with custom format
    console.log('\n2. Logger with Custom Format:');
    const customLogger = new Logger({
      level: LoggerLevel.DEBUG,
      format: '${date:\'yyyy-MM-dd HH:mm:ss\'} [${level}] ${file}:${line} - ${message}'
    });
    
    customLogger.log('Custom formatted log message');
    customLogger.info('Custom formatted info message');
    customLogger.warn('Custom formatted warning message');
    customLogger.error('Custom formatted error message');
    customLogger.debug('Custom formatted debug message');
    
    // Logger with different levels
    console.log('\n3. Logger with Different Levels:');
    
    const errorOnlyLogger = new Logger({
      level: LoggerLevel.ERROR,
      format: '[${level}] ${message}'
    });
    
    console.log('  Error level only:');
    errorOnlyLogger.log('This log message will not appear');
    errorOnlyLogger.info('This info message will not appear');
    errorOnlyLogger.warn('This warning message will not appear');
    errorOnlyLogger.error('This error message will appear');
    errorOnlyLogger.debug('This debug message will not appear');
    
    const infoLogger = new Logger({
      level: LoggerLevel.INFO,
      format: '[${level}] ${message}'
    });
    
    console.log('  Info level and above:');
    infoLogger.log('This log message will not appear');
    infoLogger.info('This info message will appear');
    infoLogger.warn('This warning message will appear');
    infoLogger.error('This error message will appear');
    infoLogger.debug('This debug message will not appear');
    
    // Logger with OFF level
    console.log('\n4. Logger with OFF Level:');
    const offLogger = new Logger({
      level: LoggerLevel.OFF,
      format: '[${level}] ${message}'
    });
    
    console.log('  All messages should be suppressed:');
    offLogger.log('This should not appear');
    offLogger.info('This should not appear');
    offLogger.warn('This should not appear');
    offLogger.error('This should not appear');
    offLogger.debug('This should not appear');
    
    // Logger with dynamic configuration
    console.log('\n5. Dynamic Configuration:');
    const dynamicLogger = new Logger();
    
    console.log('  Initial configuration (default):');
    dynamicLogger.info('Message with default config');
    
    dynamicLogger.setConfig({
      level: LoggerLevel.WARN,
      format: '${date:\'HH:mm:ss\'} [${level}] ${message}'
    });
    
    console.log('  After changing to WARN level:');
    dynamicLogger.info('This info message will not appear');
    dynamicLogger.warn('This warning message will appear');
    dynamicLogger.error('This error message will appear');
    
    // Logger with complex format
    console.log('\n6. Complex Format Example:');
    const complexLogger = new Logger({
      level: LoggerLevel.DEBUG,
      format: '${date:\'yyyy-MM-dd HH:mm:ss.SSS\'} [${level}] ${file}:${line} - ${message}'
    });
    
    complexLogger.log('Complex formatted message with timestamp and location');
    complexLogger.info('Another complex formatted message');
    complexLogger.warn('Warning with complex format');
    complexLogger.error('Error with complex format');
    complexLogger.debug('Debug with complex format');
    
    // Logger with multiple arguments
    console.log('\n7. Logger with Multiple Arguments:');
    const multiArgLogger = new Logger({
      level: LoggerLevel.INFO,
      format: '[${level}] ${message}'
    });
    
    multiArgLogger.log('Single argument message');
    multiArgLogger.info('Multiple arguments:', 'arg1', 'arg2', { key: 'value' });
    multiArgLogger.warn('Object logging:', { user: 'john', age: 30, active: true });
    multiArgLogger.error('Error with details:', new Error('Something went wrong'));
    
    // Logger level hierarchy demonstration
    console.log('\n8. Logger Level Hierarchy:');
    const levels = [
      LoggerLevel.TRACE,
      LoggerLevel.DEBUG,
      LoggerLevel.INFO,
      LoggerLevel.WARN,
      LoggerLevel.ERROR,
      LoggerLevel.LOG,
      LoggerLevel.OFF
    ];
    
    levels.forEach(level => {
      const logger = new Logger({
        level: level,
        format: `[${level}] ${level === LoggerLevel.OFF ? 'SUPPRESSED' : '${message}'}`
      });
      
      console.log(`  ${level} level:`);
      logger.trace('Trace message');
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.log('Log message');
    });
    
    console.log('\n=========================\n');
  }
}