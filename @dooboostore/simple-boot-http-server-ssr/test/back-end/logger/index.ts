import { Logger, LoggerLevel } from '@dooboostore/core/logger/Logger';
import { environment } from '@back-end//environments/environment';


export const backLogger = new Logger(environment.loggerConfig);