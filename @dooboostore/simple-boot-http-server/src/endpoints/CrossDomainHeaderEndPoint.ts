import {EndPoint} from './EndPoint';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';
import {RequestResponse} from '../models/RequestResponse';
import { HttpHeaders } from '../codes/HttpHeaders';

export type CrossDomainHeaderEndPointConfig = {
    accessControlAllowOrigin?: string | string[],
    accessControlAllowMethods?: string | string[],
    accessControlAllowHeaders?: string | string[]
}
export class CrossDomainHeaderEndPoint implements EndPoint {
    constructor(private config?: CrossDomainHeaderEndPointConfig) {
    }

    /*
        rr.resSetHeader("Access-Control-Allow-Origin", "*")
        rr.resSetHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
        rr.resSetHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
     */
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        if (this.config?.accessControlAllowOrigin) {
            rr.resSetHeader(HttpHeaders.AccessControlAllowOrigin, Array.isArray(this.config.accessControlAllowOrigin) ? this.config.accessControlAllowOrigin.join(', ') : this.config.accessControlAllowOrigin);
        }
        if (this.config?.accessControlAllowMethods) {
            rr.resSetHeader(HttpHeaders.AccessControlAllowMethods, Array.isArray(this.config.accessControlAllowMethods) ? this.config.accessControlAllowMethods.join(', ') : this.config.accessControlAllowMethods);
        }
        if (this.config?.accessControlAllowHeaders) {
            rr.resSetHeader(HttpHeaders.AccessControlAllowHeaders, Array.isArray(this.config.accessControlAllowHeaders) ? this.config.accessControlAllowHeaders.join(', ') : this.config.accessControlAllowHeaders);
        }
    }

    async onInit(app: SimpleBootHttpServer) {
    }
}
