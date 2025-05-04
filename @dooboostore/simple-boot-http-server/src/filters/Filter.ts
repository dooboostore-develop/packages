import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import {RequestResponse} from '../models/RequestResponse';
import {OnInit} from '../lifecycle/OnInit';

export interface Filter extends OnInit {
    // false  뒤로는 안흐르게 해주세요
    // true  나를 스킵스켜주새요 (내뒤로 흐르게해주세요)
    proceedBefore(data: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}): Promise<boolean>;
    proceedAfter(data: {rr: RequestResponse, app: SimpleBootHttpServer, before: boolean, carrier: Map<string, any>}): Promise<boolean>;
}
