import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import {RequestResponse} from '../models/RequestResponse';
import {OnInit} from '../lifecycle/OnInit';

export interface Filter extends OnInit {
    before(rr: RequestResponse, app: SimpleBootHttpServer): Promise<boolean>;
    after(rr: RequestResponse, app: SimpleBootHttpServer, sw: boolean): Promise<boolean>;
}
