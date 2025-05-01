import {EndPoint} from './EndPoint';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';
import {RequestResponse} from '../models/RequestResponse';

export class HeaderEndPoint implements EndPoint {
    constructor(private headers?: { [key: string]: string | string[] }) {
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        if (this.headers) {
            rr.resSetHeaders(this.headers);
        }
    }

    async onInit(app: SimpleBootHttpServer) {
    }
}
