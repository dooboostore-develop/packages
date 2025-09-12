import { ListenData } from '@dooboostore/simple-boot-http-server/option/HttpServerOption';
import { LoggerConfig, LoggerLevel } from '@dooboostore/core/logger/Logger';

export const environment = {
    name: 'default-template',
    environment: 'local',
    host: 'http://localhost:8081',
    production: false,
    frontDistPath: 'dist-front-end',
    frontDistIndexFileName: 'index.html',
    loggerConfig: {
      level: LoggerLevel.DEBUG,
      format: '[${date:\'yyyy-MM-dd HH:mm:ss\'}] ${file}(${line}):${message}'
    } as LoggerConfig,
    httpServerConfig: {
      listen: {
        port: 8081
      } as ListenData
    }
};
