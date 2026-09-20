import { EndPoint, SimpleBootHttpServer, RequestResponse, HttpHeaders } from '@dooboostore/simple-boot-http-server';

export class ErrorLogEndPoint implements EndPoint {

    async onInit(app: SimpleBootHttpServer) {
        console.log('ErrorLogEndPoint onInit')
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.error(`ErrorLogEndPoint: request => url: ${rr.reqUrl}, accept: ${rr.reqHeaderFirst(HttpHeaders.Accept)}, contentLength: ${rr.reqHeaderFirst(HttpHeaders.ContentLength)}, contentType: ${rr.reqHeaderFirst(HttpHeaders.ContentType)};response => status: ${rr.resStatusCode()}`);
    }
}
