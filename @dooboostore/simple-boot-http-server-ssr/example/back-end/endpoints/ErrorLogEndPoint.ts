import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';
import { backLogger } from '@back-end/logger';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';

export class ErrorLogEndPoint implements EndPoint {

    async onInit(app: SimpleBootHttpServer) {
        console.log('ErrorLogEndPoint onInit')
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        backLogger.error(`CloseLogEndPoint: request => url: ${rr.reqUrl}, accept: ${rr.reqHeaderFirst(HttpHeaders.Accept)}, contentLength: ${rr.reqHeaderFirst(HttpHeaders.ContentLength)}, contentType: ${rr.reqHeaderFirst(HttpHeaders.ContentType)};response => status: ${rr.resStatusCode}`);
    }
}
