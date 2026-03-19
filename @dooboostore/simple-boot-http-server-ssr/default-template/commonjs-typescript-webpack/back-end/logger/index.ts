import { Logger, LoggerLevel } from '@dooboostore/core/logger/Logger';
import { environment } from '@lazycollect-back-end//environments/environment';


export const backLogger = new Logger(environment.loggerConfig);