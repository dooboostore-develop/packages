import {HttpServerOption} from 'simple-boot-http-server/option/HttpServerOption';
import {SimpleBootHttpServer} from 'simple-boot-http-server';
import {FirstFilter} from './app/filters/FirstFilter';
import {NotFoundError} from 'simple-boot-http-server/errors/NotFoundError';
import {Advice} from './app/advices/Advice';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {Route, Router} from 'simple-boot-core/decorators/route/Router';
import {Injection} from 'simple-boot-core/decorators/inject/Injection';
import {GET} from 'simple-boot-http-server/decorators/MethodMapping';
import {Mimes} from 'simple-boot-http-server/codes/Mimes';
import {RequestResponse} from 'simple-boot-http-server/models/RequestResponse';
import {ReqHeader} from 'simple-boot-http-server/models/datas/ReqHeader';
import {RouterModule} from 'simple-boot-core/route/RouterModule';
import {EndPoint} from 'simple-boot-http-server/endpoints/EndPoint';
import {SubAppRouter} from './app/SubAppRouter';
@Sim @Router({path: '', routers: [SubAppRouter]})
export class AppRouter {
    @Route({path: '/'}) @GET({res: {contentType: Mimes.ApplicationJson}})
    index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return {name: 'visualkhh'}
    }

    @Route({path: '/infos/{uuid}'}) @GET({res: {contentType: Mimes.ApplicationJson}})
    inde22x(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return {name: 'visualkhh'+routerModule.pathData?.uuid}
    }
}

@Sim
class CloseEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) {
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log('close request response')
    }
}
@Sim
class ErrorEndPoint implements EndPoint {
    async onInit(app: SimpleBootHttpServer) {
    }

    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log('error')
    }
}
const httpServerOption = new HttpServerOption({
    filters: [new FirstFilter()],
    globalAdvice: Advice,
    errorEndPoints: [CloseEndPoint],
    closeEndPoints: [ErrorEndPoint],
    noSuchRouteEndPointMappingThrow: rr => new NotFoundError(),
    listen: {
        listeningListener: (server, httpServer) => {
            console.log('server on', httpServer.address());
        }
    }
});

const app = new SimpleBootHttpServer(AppRouter, httpServerOption);
app.run();
