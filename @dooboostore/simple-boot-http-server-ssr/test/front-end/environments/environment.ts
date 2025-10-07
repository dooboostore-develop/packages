import { LoggerConfig, LoggerLevel } from '@dooboostore/core/logger/Logger';

export const environment = {
  production: false,
  environment: 'local',
  apiPrefix: '/assets/api',
  loggerConfig: {
    level: LoggerLevel.LOG,
    format: '[${date:\'yyyy-MM-dd HH:mm:ss\'}] ${file}(${line}):${message}'
  } as LoggerConfig,

};
