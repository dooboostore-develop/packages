import 'reflect-metadata';
import { SimpleBootHttpSSRServer } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRServer';
import { HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr/option/HttpSSRServerOption';
import { environment } from './environments/environment';
import { NotFoundError } from '@dooboostore/simple-boot-http-server/errors/NotFoundError';
import Factory, { MakeSimFrontOption } from '@src/bootfactory';
import { FactoryAndParams, SSRFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/SSRFilter';
import { RootRouter } from '@back-end/root.router';
import { IntentSchemeFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/IntentSchemeFilter';
import { SimpleBootHttpSSRFactory } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRFactory';
import { Runnable } from '@dooboostore/core/runs/Runnable';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { ResourceFilter } from '@dooboostore/simple-boot-http-server/filters/ResourceFilter';
import { services } from '@back-end/service';
import { CloseLogEndPoint } from './endpoints/CloseLogEndPoint';
import { ErrorLogEndPoint } from './endpoints/ErrorLogEndPoint';
import { GlobalAdvice } from './advices/GlobalAdvice';


class Server implements Runnable<void, void> {
  async run() {
    const ssrOption: FactoryAndParams = {
      frontDistPath: environment.frontDistPath,
      frontDistIndexFileName: environment.frontDistIndexFileName,
      factorySimFrontOption: (window: any) => MakeSimFrontOption(window),
      factory: Factory as SimpleBootHttpSSRFactory,
      using: [...services],
      ssrExcludeFilter: (rr) => /^\/api\//.test(rr.reqUrl), // Exclude API routes from SSR
      poolOption: {
        max: 50,
        min: 5
      },
    };

    const resourceFilter = new ResourceFilter(environment.frontDistPath,
      [
        'assets/privacy.html', 'assets/.*', '\.js$', '\.map$', '\.ico$', '\.png$', '\.jpg$', '\.jpeg$', '\.gif$', 'offline\.html$', 'webmanifest$', 'manifest\.json', 'service-worker\.js$', 'googlebe4b1abe81ab7cf3\.html$',
        {request:'afdbb6c5792b6c672142773e362326ee.txt',dist: 'assets/afdbb6c5792b6c672142773e362326ee.txt'},
        {request:'robots.txt', dist:'assets/robots.txt'},
        {request:'Ads.txt', dist:'assets/Ads.txt'},
        {request:'ads.txt', dist:'assets/Ads.txt'},
      ]
    );


    const ssrFilter = new SSRFilter(ssrOption);

    const option = new HttpSSRServerOption({
        listen: environment.httpServerConfig.listen,
        globalAdvice: new GlobalAdvice(),
        closeEndPoints: [new CloseLogEndPoint()],
        errorEndPoints: [new ErrorLogEndPoint()],
        noSuchRouteEndPointMappingThrow: () => new NotFoundError(),
        filters: [
          resourceFilter,
          ssrFilter,
          IntentSchemeFilter
        ],
      },
      {
        rootRouter: RootRouter,
      });

    option.listen.hostname = '0.0.0.0'
    option.listen.listeningListener = (server: SimpleBootHttpServer) => {
      console.log(`http server startUP! listening on ${server.option.address}`);
    };

    const ssr = new SimpleBootHttpSSRServer(option);
    await ssr.run();
    return ssr;
  }
}

new Server().run().then(ssr => {
  console.log(`server started!!`);
});