import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';
import { backLogger } from '@back-end/logger';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';

export class RequestLogEndPoint implements EndPoint {

    async onInit(app: SimpleBootHttpServer) {
        console.log('RequestLogEndPoint onInit')
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        // backLogger.info('requestLogEndPoint start===')
        rr.reqSessionSet('startTime', Date.now());
    }
}
