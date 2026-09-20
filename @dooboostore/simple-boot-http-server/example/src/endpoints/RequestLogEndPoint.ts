import { EndPoint, SimpleBootHttpServer, RequestResponse } from '@dooboostore/simple-boot-http-server';

export class RequestLogEndPoint implements EndPoint {

    async onInit(app: SimpleBootHttpServer) {
        console.log('RequestLogEndPoint onInit')
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        // 요청 하나의 수명 안에서만 의미있는 값이라 세션(cross-request, 쿠키 기반)이 아니라
        // RequestResponse의 요청별 attribute 저장소를 쓴다 (동기, 레이스 없음).
        rr.setAttribute('startTime', Date.now());
    }
}
