import {ResourceResorver} from '@dooboostore/simple-boot-http-server/resolvers/ResourceResorver';
import {Inject} from '@dooboostore/simple-boot/decorators/inject/Inject';
import {HttpServerOption} from '@dooboostore/simple-boot-http-server/option/HttpServerOption';
import {RouterModule} from '@dooboostore/simple-boot/route/RouterModule';
import {GET, POST, UrlMappingSituationType} from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import {Route, Router} from '@dooboostore/simple-boot/decorators/route/Router';
import {RequestResponse} from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import {Mimes} from '@dooboostore/simple-boot-http-server/codes/Mimes';
import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {ReqHeader} from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';
import {Intent} from '@dooboostore/simple-boot/intent/Intent';

@Sim @Router({path: ''})
export class AppRouter {
    // @Route({path: '/'}) @GET
    // index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    //     const resource = new Resource('index.html');
    //     return resource.write(rr);
    // }
    //
    // @Route({path: '/resources/index.css'}) @GET
    // css(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    //     const resource = new Resource(rr);
    //     console.log('------>', resource.absolutePath)
    //     return resource.write(rr);
    // }
    //
    // @Route({path: '/resources/img.png'}) @GET
    // img(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    //     const resource = new Resource(rr);
    //     console.log('------>', resource.absolutePath)
    //     return resource.write(rr);
    // }
    @Route({
        path: '/', filters: [{
            isAccept(intent: Intent): boolean {
                return true;
            }
        }]
    }) @GET({resolver: ResourceResorver})
    @Route({path: '/good'})
    index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return 'index.html'
    }

    @Route({path: '/data'}) @GET({resolver: ResourceResorver})
    gdata(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return 'index.html'
    }

    @Route({path: '/data'}) @POST
    data(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule, @Inject({situationType: UrlMappingSituationType.REQ_FORM_URL_BODY}) data: {}) {
        return data
    }

    @Route({path: '/resources/index.css'}) @GET({resolver: ResourceResorver})
    css(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    }

    @Route({path: '/resources/img.png'}) @GET({resolver: ResourceResorver})
    img(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
    }

    @Route({path: '/json'}) @GET({res: {contentType: Mimes.ApplicationJson}})
    json(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return {name: 'visualkhh222'}
    }

    @Route({path: ['/w', '/z']}) @GET({res: {contentType: Mimes.ApplicationJson}})
    index2(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return {name: 'visualkh99h' + rr.reqUrl}
    }
}

const httpServerOption = new HttpServerOption({
    sessionOption: {
        expiredTime: 5000
    },
    listen: {
        listeningListener: (server, httpServer) => {
            console.log('server on', httpServer.address());
        }
    }
}, {rootRouter: AppRouter});

const app = new SimpleBootHttpServer(httpServerOption);
app.run();
