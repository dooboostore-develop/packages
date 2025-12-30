import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { ApiRouter } from './ApiRouter';
import { ResourceResolver } from '@dooboostore/simple-boot-http-server/resolvers/ResourceResolver';

@Sim
@Router({
  path: '',
  routers: [ApiRouter]
})
export class AppRouter {
  /**
   * Home page - serves index.html
   */
  @Route({ path: '/' })
  @GET({res: {contentType: 'text/html; charset=utf-8'}})
  index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {

    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Boot HTTP Server Example</title>
    <link rel="stylesheet" href="/resources/index.css">
</head>
<body>
hi
</body>
</html>
    `;
    
   return html;
  }

  @Route({path: '/resources/index.css'})
  @GET({resolver: ResourceResolver})
  img(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    return 'src/resources/index.css'
  }
}
