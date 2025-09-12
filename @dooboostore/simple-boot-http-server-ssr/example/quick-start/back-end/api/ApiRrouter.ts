import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Route, Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';
import { Mimes } from '@dooboostore/simple-boot-http-server-ssr/codes/Mimes';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';

@Sim
@Router({
    path: '/api',
})
export class ApiRrouter {
    constructor() {
    }


  @Route({path: '/hello'})
  @GET({ res: { header: { [HttpHeaders.ContentType]: Mimes.ApplicationJson } } })
  worlds(rr: RequestResponse): any {
      return {hello:'hello api router', date: new Date().toISOString()}
  }
}
