import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET, POST } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { WebSocketSet } from '@dooboostore/simple-boot-http-server/endpoints/WebSocketEndPoint';
import { WebSocketManager, WebSocketRequest } from '@dooboostore/simple-boot-http-server/websocket/WebSocketManager';

@Sim({})
@Router({ path: '/api' })
export class ApiRouter {
  constructor() {
    console.log('📡 ApiRouter initialized with UserService');
  }

  @Route({ path: '/test' })
  good(data: any, data2: WebSocketSet, data3: WebSocketManager) {
    console.log('!!data', data);
    return {
      zzz:'22222'
    }
  }

  @Route({ path: '/test' })
  async good2(data: any, data2: WebSocketRequest) {
    console.log('!!data', data);
    const eventData = await data2.sendEvent('gaga', { hello: 'world' }, {responseTimeout: 1000});
    console.log('!!eventData', eventData);
    // data3.sendEventDataByUUID()
    return {
      zzz: '22222'
    };
  }
  @Route({ path: '/time' })
  @GET({ res: { contentType: 'application/json' } })
  getTime(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      unix: now.getTime(),
      formatted: now.toLocaleString('ko-KR'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}
