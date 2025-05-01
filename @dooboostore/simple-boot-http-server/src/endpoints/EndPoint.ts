import {RequestResponse} from '../models/RequestResponse';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';
import {OnInit} from '../lifecycle/OnInit';

export interface EndPoint extends OnInit {
    endPoint(rr: RequestResponse, app: SimpleBootHttpServer): Promise<any>;
}