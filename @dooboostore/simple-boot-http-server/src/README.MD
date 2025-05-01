SIMPLE-BOOT-HTTP-SERVER
===
http web server  
![typescript](https://img.shields.io/badge/-typescript-black?logo=typescript) [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-http-server) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)

* URL, Method, Mapping
* Filter
* EndPoint
* Advice(ExceptionHandler)


### dependencies  
* simple-boot-core [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-core) 


## 🚀 Quick start
```shell
npm init -y
npm install simple-boot-http-server
tsc --init --experimentalDecorators --emitDecoratorMetadata
```

```typescript
import {HttpServerOption} from 'simple-boot-http-server/option/HttpServerOption';
import {SimpleBootHttpServer} from 'simple-boot-http-server';
import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {Route, Router} from '@dooboostore/simple-boot/decorators/route/Router';
import {GET} from 'simple-boot-http-server/decorators/MethodMapping';
import {Mimes} from 'simple-boot-http-server/codes/Mimes';
import {RequestResponse} from 'simple-boot-http-server/models/RequestResponse';
import {ReqHeader} from 'simple-boot-http-server/models/datas/ReqHeader';
import {RouterModule} from '@dooboostore/simple-boot/route/RouterModule';

@Sim() @Router({path: ''})
export class AppRouter {
    @Route({path: '/'}) @GET({res: {contentType: Mimes.ApplicationJson}})
    index(rr: RequestResponse, header: ReqHeader, routerModule: RouterModule) {
        return {name: 'visualkhh'}
    }
}

const httpServerOption = new HttpServerOption({
    listen: {
        listeningListener: (server, httpServer) => {
            console.log('server on', httpServer.address());
        }
    }
});

const app = new SimpleBootHttpServer(AppRouter, httpServerOption);
app.run();

// 💥 GET /
// {"name": "visualkhh"}
```
```shell
npx ts-node index.ts
```
```shell
curl -XGET http://localhost:8081
#result: {"name": "visualkhh"}
```

# 😃 examples
- [examples](./examples)

## URL, Method, Mapping
### URL MAPPING
* @Route({path: '/'})
### METHOD MAPPING
> * @GET
> * @POST
> * @PATCH
> * @OPTIONS
> * @HEAD
> * @TRACE
> * @CONNECT
> * OTHER
>   * @UrlMapping
### Method Decorator options
```typescript
export type MappingConfig = {
    method: HttpMethod | string,
    description?: {
        name?: string;
        detail?: string;
    };

    req?: {
        contentType?: (Mimes|string)[];
        accept?: (Mimes|string)[];
    };

    res?: {
        status?: number;
        header?: {[key: string]: string};
        contentType?: Mimes | string;
    }
    resolver?: Resolver|ConstructorType<Resolver>;
}
```  


## Filter
return
 - true: after call chain 
 - false: after NoCall chain
```typescript
export class FirstFilter implements Filter {
    async before(rr: RequestResponse, app: SimpleBootHttpServer): Promise<boolean> {
        console.log('filter before')
        return true;
    }
    
    async after(rr: RequestResponse, app: SimpleBootHttpServer, sw: boolean): Promise<boolean> {
        console.log('filter after')
        return true;
    }    
}
const httpServerOption = new HttpServerOption({
    filters: [new FirstFilter()],
    listen: {
        listeningListener: (server, httpServer) => {
            console.log('server on', httpServer.address());
        }
    }
});

const app = new SimpleBootHttpServer(AppRouter, httpServerOption);
app.run();
// 💥 CALL
// filter before
// filter after
```

## Advice(ExceptionHandler)
```typescript
import {NotFoundError} from './NotFoundError';

@Sim
export class Advice {
    @ExceptionHandler({type: NotFoundError})
    catch(rr: RequestResponse, e: any) {
        rr.resSetHeaders({error: 'NotFound'});
        console.log('exception--->', rr.reqUrl, e);
    }
}

const httpServerOption = new HttpServerOption({
    globalAdvice: Advice,
    noSuchRouteEndPointMappingThrow: rr => new NotFoundError(),
    listen: {
        listeningListener: (server, httpServer) => {
            console.log('server on', httpServer.address());
        }
    }
});

const app = new SimpleBootHttpServer(AppRouter, httpServerOption);
app.run();
// 💥 CALL
// exception---> NotFound
```

## EndPoint
```typescript
@Sim
class CloseEndPoint implements EndPoint {
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log('close request response')
    }
}
@Sim
class ErrorEndPoint implements EndPoint {
    async endPoint(rr: RequestResponse, app: SimpleBootHttpServer) {
        console.log('error')
    }
}
const httpServerOption = new HttpServerOption({
    errorEndPoints: [CloseEndPoint],
    closeEndPoints: [ErrorEndPoint],
    listen: {
        listeningListener: (server, httpServer) => {
            console.log('server on', httpServer.address());
        }
    }
});

const app = new SimpleBootHttpServer(AppRouter, httpServerOption);
app.run();
// 💥 normal CALL
// close request response
// 💥 error
// error
```
