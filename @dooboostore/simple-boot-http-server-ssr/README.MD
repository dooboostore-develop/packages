# SIMPLE-BOOT-HTTP-SSR

### A framework for building Server-Side Rendered (SSR) applications.

This package seamlessly integrates `@dooboostore/simple-boot-front` and `@dooboostore/simple-boot-http-server` to provide a powerful solution for building fast, SEO-friendly, and dynamic web applications.

- **Server-Side Rendering**: Renders your single-page application on the server before sending it to the client.
- **JSDOM Integration**: Uses `jsdom` to create a virtual DOM environment on the server, allowing front-end code to run.
- **Component Pooling**: Manages a pool of `SimpleBootFront` instances to handle concurrent SSR requests efficiently.
- **Data Hydration**: Automatically serializes data fetched on the server and hydrates it on the client, avoiding redundant API calls. The `SaveAroundAfter` and `LoadAroundBefore` decorators facilitate this by saving data to `window.server_side_data` on the server and retrieving it on the client.
- **Unified Codebase**: Enables sharing of routing, services, and components between the server and the client.
- **Intent-based Communication**: Provides a mechanism for client-server communication using custom HTTP headers and intent publishing, allowing for flexible data fetching and action triggering.

### Dependencies

- **@dooboostore/simple-boot-front**: The front-end framework for building components and managing UI state.
- **@dooboostore/simple-boot-http-server**: The underlying HTTP server for handling requests.

## 🚀 Quick Start

```
npm init @dooboostore/simple-boot-http-server-ssr projectname
cd projectname
npm start
```

## 🚀 How It Works

The core of this package is the `SSRFilter`. When a request for an HTML page comes in, the filter does the following:

1.  **Intercepts the Request**: It captures the request before it would normally serve a static `index.html` file.
2.  **Acquires a Browser Environment**: It takes a pre-initialized `jsdom` instance from a pool. This instance acts as a virtual browser on the server.
3.  **Initializes a Front-End App**: It uses a `SimpleBootFront` application instance (also from a pool) and sets its context to the `jsdom` window.
4.  **Executes Routing**: It triggers the front-end router within the `jsdom` environment, using the path from the incoming request.
5.  **Renders Components**: The front-end components render into the virtual DOM.
6.  **Handles Data Fetching**: If components fetch data during their lifecycle, this happens on the server. The `SaveAroundAfter` and `LoadAroundBefore` decorators automatically handle the serialization of this data into `window.server_side_data`.
7.  **Serializes the DOM**: Once rendering is complete, it captures the `outerHTML` of the `jsdom` document.
8.  **Injects Hydration Data**: The serialized data from step 6 is injected into the HTML inside a `<script>` tag.
9.  **Sends Response**: The fully rendered HTML is sent to the client.

The client-side application then boots up, sees the pre-rendered HTML and the hydration data, and takes over without needing to re-render the initial view or re-fetch the initial data.

Additionally, the `IntentSchemeFilter` handles specific client-server communication. When a request with `Accept: application/json-post+simple-boot-ssr-intent-scheme` and `X-Simple-Boot-Ssr-Intent-Scheme` headers is received, this filter intercepts it, publishes an intent, and returns the result, enabling a robust intent-based API.

# 😃 Example Setup

### Common Factory (`factory.ts`)

This factory is used by both the server (for SSR) and the client (for browser rendering).

```typescript
import { SimpleBootHttpSSRFactory, SimFrontOption, SimpleBootFront } from '@dooboostore/simple-boot-http-server-ssr';
import { ConstructorType } from '@dooboostore/core';
import { IndexRouterComponent } from './components/index.router.component';

// Function to create a standard front-end option object
export const MakeSimFrontOption = (window: any): SimFrontOption => {
    return new SimFrontOption(window).setUrlType('path');
}

// The factory class that creates instances of the front-end application
class Factory extends SimpleBootHttpSSRFactory {
    factory(simFrontOption: SimFrontOption, using: ConstructorType<any>[] = [], domExcludes: ConstructorType<any>[] = []): Promise<SimpleBootFront> {
        const simpleBootFront = new SimpleBootFront(IndexRouterComponent, simFrontOption);
        // Exclude certain types from being proxied by the DOM renderer
        simpleBootFront.domRendoerExcludeProxy.push(...domExcludes);
        return Promise.resolve(simpleBootFront);
    }
}

export default new Factory();
```

### Server Entry Point (`server.ts`)

This sets up the HTTP server with the `SSRFilter` and `IntentSchemeFilter`.

```typescript
import 'reflect-metadata';
import { ConstructorType } from '@dooboostore/core/types';
import { SimpleBootHttpSSRServer } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRServer';
import { HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr/option/HttpSSRServerOption';
import { environment } from './environments/environment';
import { NotFoundError } from '@dooboostore/simple-boot-http-server/errors/NotFoundError';
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import Factory, { MakeSimFrontOption } from '@src/bootfactory';
import { FactoryAndParams, SSRFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/SSRFilter';
import { ResourceFilter } from '@dooboostore/simple-boot-http-server/filters/ResourceFilter';
import { RootRouter } from '@backend/root.router';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { DataSource } from 'typeorm';
import { DatabaseService } from '@backend/service/database/DatabaseService';
import { services } from '@backend/service';
import { IntentSchemeFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/IntentSchemeFilter';
import { ErrorLogEndPoint } from '@backend/endpoints/ErrorLogEndPoint';
import { CloseLogEndPoint } from '@backend/endpoints/CloseLogEndPoint';
import { RequestLogEndPoint } from '@backend/endpoints/RequestLogEndPoint';
import { GlobalAdvice } from '@backend/advices/GlobalAdvice';
import { SimpleBootHttpSSRFactory } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRFactory';
import { Runnable } from '@dooboostore/core/runs/Runnable';
import { CrossDomainHeaderEndPoint } from '@dooboostore/simple-boot-http-server/endpoints/CrossDomainHeaderEndPoint';
import { SyncManager } from '@backend/manager';
import { SecurityService } from '@backend/service/SecurityService';

type ENV_MODE = 'ONLY_SYNC' | 'NO_SYNC' | undefined;
type WORLD = undefined | string;

type RunParams = { mode: ENV_MODE, world: WORLD };

class Server implements Runnable<void, RunParams> {
  async run(config?: RunParams) {
    const securityService = new SecurityService();
    const databaseService = new DatabaseService(securityService);
    await databaseService.run();
    if (mode !== 'NO_SYNC') {
      const syncManager = new SyncManager(databaseService);
      await syncManager.run(config?.world ? Number(config.world) : undefined);
    }

    if (mode === 'ONLY_SYNC') {
      return;
    }


    // const cacheManager = new CacheManager(databaseService);
    // await cacheManager.run();

    const otherInstanceSim = new Map<ConstructorType<any>, any>();
    otherInstanceSim.set(SecurityService, securityService);
    otherInstanceSim.set(DatabaseService, databaseService);
    // otherInstanceSim.set(CacheManager, cacheManager);

    const ssrOption: FactoryAndParams = {
      frontDistPath: environment.frontDistPath,
      frontDistIndexFileName: environment.frontDistIndexFileName,
      factorySimFrontOption: (window: any) => MakeSimFrontOption(window),
      factory: Factory as SimpleBootHttpSSRFactory,
      poolOption: {
        max: 50,
        min: 5
      },
      using: [...services],
      domExcludes: [DataSource] as ConstructorType<any>[],
      ssrExcludeFilter: (rr: RequestResponse) => {
        const firstExcludeFilter = [
          /^\/signs\/confirm-email.*/,
          /^\/assets\/.*/,
          /^\/api\/.*/
        ];
        for (const excludeRegExp of firstExcludeFilter) {
          if (excludeRegExp.test(rr.reqUrl)) {
            return true;
          }
        }
        return false;
      },
      simpleBootFront: {
        notFoundError: true
      }
    };
    // const ssrFilter = new SSRFilter(ssrOption, otherInstanceSim);

    const resourceFilter = new ResourceFilter(environment.frontDistPath,
      [
        'assets/privacy.html', 'assets/.*', '\.js$', '\.map$', '\.ico$', '\.png$', '\.jpg$', '\.jpeg$', '\.gif$', 'offline\.html$', 'webmanifest$', 'manifest\.json', 'service-worker\.js$', 'googlebe4b1abe81ab7cf3\.html$',
        {
          request: (rr) => {
            return RegExp('/.*').test(rr.reqUrlPathName) && rr.reqMethod()?.toUpperCase() === 'GET';
          },
          dist: 'index.html'
        }
      ]
    );
    const uploadResourceFilter = new ResourceFilter(environment.uploadTempPath,
      ['public/.*']
    );

    const option = new HttpSSRServerOption();
    option.cache = {
      enable: true
    }
    option.rootRouter = RootRouter;
    option.listen = environment.httpServerConfig.listen;
    option.globalAdvice = new GlobalAdvice();
    option.requestEndPoints = [
      new RequestLogEndPoint(),
      new CrossDomainHeaderEndPoint({accessControlExposeHeaders: 'Set-Cookie', accessControlAllowHeaders: '*', accessControlAllowMethods: '*', accessControlAllowOrigin: '*'}),
    ];
    option.closeEndPoints = [new CloseLogEndPoint()];
    option.errorEndPoints = [new ErrorLogEndPoint()];
    option.noSuchRouteEndPointMappingThrow = () => new NotFoundError();
    option.fileUploadTempPath = environment.uploadTempPath;
    option.filters = [
      resourceFilter,
      uploadResourceFilter,
      // ssrFilter,
      // SecurityFilter,
      IntentSchemeFilter
    ];
    // option.serverOption = {
    //  key: fs.readFileSync(path.resolve(__dirname, '../data/certificates/localhost-key.pem')),
    //  cert: fs.readFileSync(path.resolve(__dirname, '../data/certificates/localhost.pem')),
    // }
    option.listen.listeningListener = (server: SimpleBootHttpServer) => {
      console.log(`http server startUP! listening on ${server.option.listen.port}`);
    };

    const ssr = new SimpleBootHttpSSRServer(option);
    await ssr.run(otherInstanceSim);
    return ssr;
  }
}

const mode = process.env.MODE as ENV_MODE;
const world = process.env.WORLD as ENV_MODE;
new Server().run({mode, world}).then(ssr => {
  console.log(`server started!! (mode:${mode})`);
});
console.log(`server wait... (mode:${mode})`);



```