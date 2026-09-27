import {RequestResponse} from '../models/RequestResponse';
import { ResponseMappingConfig } from '../decorators';

export interface Resolver<T = any> {
  resolve(data: T, rr: RequestResponse, responseMappingConfig: ResponseMappingConfig): Promise<void>;
}
