import { EndPoint } from '@dooboostore/simple-boot-http-server/endpoints/EndPoint';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';

export class CloseLogEndPoint implements EndPoint {

    async onInit(app: SimpleBootHttpServer) {
        console.log('CloseLogEndPoint onInit')
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        const startTime = rr.reqSessionGet<number>('startTime');
        let duration = 'unknown';
        if (startTime){
            duration = (Date.now() - startTime) + 'ms';
        }
        const requestMap = new Map<string, number | string | undefined>();
        requestMap.set('ip', rr.reqRemoteAddress);
        requestMap.set('method', rr.reqMethod());
        requestMap.set('url', rr.reqUrl);
        requestMap.set('userAgent', rr.reqHeaderFirst(HttpHeaders.UserAgent));
        requestMap.set('accept', rr.reqHeaderFirst(HttpHeaders.Accept));
        requestMap.set('contentLength', rr.reqHeaderFirst(HttpHeaders.ContentLength));
        requestMap.set('contentType', rr.reqHeaderFirst(HttpHeaders.ContentType));
        const request  = Array.from(requestMap.entries()).filter(([k, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join(', ');

        const responseMap = new Map<string, number | string | undefined>();
        responseMap.set('statusCode', rr.resStatusCode());
        responseMap.set('contentType', rr.resHeaderFirst(HttpHeaders.ContentType));
        const response  = Array.from(responseMap.entries()).filter(([k, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join(', ');
        console.info(`close:: request => ${request};response => ${response};duration: ${duration}`);
    }
}
