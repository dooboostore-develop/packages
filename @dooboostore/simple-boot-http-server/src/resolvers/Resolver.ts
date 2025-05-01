import {RequestResponse} from '../models/RequestResponse';

export interface Resolver<T = any> {
    resolve(data: T, rr: RequestResponse): Promise<void>;
}
