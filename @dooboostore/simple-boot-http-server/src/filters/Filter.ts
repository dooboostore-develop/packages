import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import {RequestResponse} from '../models/RequestResponse';
import {OnInit} from '../lifecycle/OnInit';

export interface Filter extends OnInit {
    // false 나를 스킵스켜주새요 (내뒤로 흐르게해주세요)
    // true  뒤로는 안흐르게 해주세요
    before(rr: RequestResponse, app: SimpleBootHttpServer): Promise<boolean>;
    after(rr: RequestResponse, app: SimpleBootHttpServer, sw: boolean): Promise<boolean>;
}
