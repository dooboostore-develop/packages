import {SimpleApplication} from '@dooboostore/simple-boot';
import {HttpServerOption} from './option/HttpServerOption';
import {ConstructorType} from '@dooboostore/core';
import {IncomingMessage, Server as HttpServer, ServerResponse} from 'http'
import {Server as HttpsServer} from 'https'; // Add HTTPS support
import {WebSocketServer, WebSocket} from 'ws';
import {RequestResponse} from './models/RequestResponse';
import {getUrlMapping, getUrlMappings, SaveMappingConfig, UrlMappingSituationType} from './decorators/MethodMapping';
import {HttpStatus} from './codes/HttpStatus';
import {HttpHeaders} from './codes/HttpHeaders';
import {Mimes} from './codes/Mimes';
import {Filter} from './filters/Filter';
import {ExceptionHandlerSituationType, targetExceptionHandler} from '@dooboostore/simple-boot';
import {getInject, SituationTypeContainer, SituationTypeContainers} from '@dooboostore/simple-boot';
import {EndPoint} from './endpoints/EndPoint';
import {ReflectUtils, ValidUtils} from '@dooboostore/core';
import {ReqFormUrlBody} from './models/datas/body/ReqFormUrlBody';
import {ReqJsonBody} from './models/datas/body/ReqJsonBody';
import {ReqHeader} from './models/datas/ReqHeader';
import {RouterModule} from '@dooboostore/simple-boot';
import {ReqMultipartFormBody} from './models/datas/body/ReqMultipartFormBody';
import {execValidationInValid, getValidIndex} from '@dooboostore/simple-boot';
import {ValidException} from '@dooboostore/simple-boot';
import {HttpError} from './errors/HttpError';
import {getRoute} from '@dooboostore/simple-boot';
import {OnInit} from './lifecycle/OnInit';
import {URLSearchParams} from 'url';
import {HttpMethod} from './codes/HttpMethod';
import {SessionManager} from './session/SessionManager';
import {InjectSituationType} from './inject/InjectSituationType';
import {ContentTypeGenerator} from './generators/ContentTypeGenerator';
import {ReqSearchParamsObj} from "./models/datas/path/ReqSearchParamsObj";
import {SimConfig} from '@dooboostore/simple-boot';
import {ReqPathData} from './models/datas/path/ReqPathData';
import {WebSocketEndPoint} from './endpoints/WebSocketEndPoint';

export class SimpleBootHttpServer extends SimpleApplication {
  public server?: HttpServer | HttpsServer;
  private sessionManager: SessionManager;
  private webSocketClients = new Map<WebSocket, { request: IncomingMessage }>();

  constructor(public option: HttpServerOption = new HttpServerOption()) {
    super(option);
    this.sessionManager = new SessionManager(this.option);
  }

  /**
   * Final response flush that can never escape as an unhandled rejection.
   * When the response is already gone (sent, closed, or destroyed mid-write),
   * there is nobody left to send to, so gone-response write errors
   * (ERR_HTTP_HEADERS_SENT, ERR_STREAM_ALREADY_FINISHED,
   * ERR_STREAM_DESTROYED, ECONNRESET) are swallowed; anything else still throws.
   */
  private async safeResEnd(rr: RequestResponse): Promise<void> {
    if (rr.resIsDone()) {
      return;
    }
    try {
      await rr.resEnd();
    } catch (e: any) {
      const code = e && (e.code || '');
      if (code !== 'ERR_HTTP_HEADERS_SENT' && code !== 'ERR_STREAM_ALREADY_FINISHED' && code !== 'ERR_STREAM_DESTROYED' && code !== 'ECONNRESET') {
        throw e;
      }
    }
  }


  public run(otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | symbol, any>) {
    otherInstanceSim ??= new Map<ConstructorType<any> | Function | SimConfig | symbol, any>();
    otherInstanceSim.set(SimpleBootHttpServer, this);
    super.run(otherInstanceSim);
    const targets = [...this.option.closeEndPoints ?? [], ...this.option.errorEndPoints ?? [], ...this.option.requestEndPoints ?? [], ...(this.option.filters ?? []).map(it=>it.filter)];
    Promise.all(targets.map(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it as ConstructorType<any>}) : it) as OnInit).map(it => it.onInit(this))).then(it => {
      this.startServer();
    });
    return this;
  }

  /**
   * Graceful shutdown, in the order that makes hooks safe (the contract
   * Fastify documents, and the reason a bare `server.close()` can hang):
   *
   * 1. stop accepting new connections,
   * 2. drop idle keep-alive sockets so the server can actually reach "closed"
   *    (without this, `close()` waits forever on browsers' pooled sockets),
   * 3. wait for in-flight requests to finish,
   * 4. run the option's `closeEndPoints`.
   *
   * Resolves once the socket is closed; rejects on a close error.
   */
  async close(): Promise<void> {
    const server = this.server as any;
    if (!server) return;
    const dropIdle = () => {
      try {
        server.closeIdleConnections?.();
      } catch {
        // Already closed.
      }
    };
    dropIdle();
    await new Promise<void>((resolve, reject) => {
      // Keep dropping sockets that go idle as in-flight requests finish;
      // otherwise keep-alive connections keep the handle open until their
      // timeout (seconds of unnecessary wait).
      const nudge = setInterval(dropIdle, 50);
      nudge.unref?.();
      server.close((err?: Error) => {
        clearInterval(nudge);
        if (err && (err as any).code !== 'ERR_SERVER_NOT_RUNNING') {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private startServer() {

    // const a = this.option.serverOption as HttpsServerOption;
    // this.option.serverOption?.

    if (this.option.serverOption && 'key' in this.option.serverOption && 'cert' in this.option.serverOption) {
      this.server = new HttpsServer(this.option.serverOption);
      const httpServer = new HttpServer();
      httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`});
        res.end();
      });
      httpServer.listen(80, this.option.listen.hostname, () => {
        console.log('HTTP redirect server running on port 80');
      });
    } else if (this.option.serverOption) {
      this.server = new HttpServer(this.option.serverOption);
    } else {
      this.server = new HttpServer();
    }
    // const thisRef = this;
    this.server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
      // console.log('request', req.url);
      const transactionManager = this.option.transactionManagerFactory ? await this.option.transactionManagerFactory() : undefined;
      res.on('close', async () => {
        if (this.option.closeEndPoints) {
          for (const it of this.option.closeEndPoints) {
            try {
              const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it) as EndPoint;
              const endPoint = execute?.endPoint(rr, this);
              if (endPoint instanceof Promise) {
                await endPoint;
              }
            } catch (e) {
            }
          }
        }

        if (!rr.resIsDone()) {
          await this.safeResEnd(rr);
        }
      });
      res.on('error', async () => {
        if (this.option.errorEndPoints) {
          for (const it of this.option.errorEndPoints) {
            try {
              const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it) as EndPoint;
              const endPoint = execute?.endPoint(rr, this);
              if (endPoint instanceof Promise) {
                await endPoint;
              }
            } catch (e) {
            }
          }
        }

        if (!rr.resIsDone()) {
          await this.safeResEnd(rr);
        }
      });

      const rr = new RequestResponse(req, res, {sessionManager: this.sessionManager, option: this.option});
      /*
          default setting first
       */
      rr.resSetHeader(HttpHeaders.Server, 'simple-boot-http-server');
      // Sessions are created lazily by rr.reqSession*() (SessionManager issues the cookie then).
      // Creating one for every cookieless request let any client grow the session Map without bound.

      const otherStorage = new Map<ConstructorType<any>, any>();
      otherStorage.set(RequestResponse, rr);
      otherStorage.set(IncomingMessage, req);
      otherStorage.set(ServerResponse, res);
      // 클라이언트가 응답 완료 전에 끊으면 abort. 핸들러는 파라미터 타입 AbortSignal 로 주입받아
      // fetch/timers/events.once 등에 넘기면 대기 중이어도 바로 풀린다 (제너레이터 스트림의 이벤트 대기 누수 방지)
      const abortController = new AbortController();
      res.once('close', () => {
        if (!res.writableFinished) abortController.abort();
      });
      otherStorage.set(AbortSignal, abortController.signal);
      try {
        transactionManager?.try();
        if (this.option.requestEndPoints) {
          for (const it of this.option.requestEndPoints) {
            try {
              const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim<EndPoint>({target: it}) : it) as EndPoint;
              execute?.endPoint(rr, this);
            } catch (e) {
            }
          }
        }

        const filter = {
          carrier: new Map<string, any>(),
          filters: [] as { filter: Filter, sw: boolean }[],
          halted: false
        };
        for (let i = 0; this.option.filters && i < this.option.filters.length; i++) {
          const it = this.option.filters[i];

          let isSkip = false;
          if (typeof it.isSupport === 'boolean') {
            isSkip = !it.isSupport;
          } else if (typeof it.isSupport === 'object') {
            isSkip = !it.isSupport.test(rr.reqUrlPathName)
          } else if (typeof it.isSupport === 'function') {
            isSkip = !it.isSupport(rr);
          }
          if(isSkip) {
            continue;
          }

          let sw = true;
          const itFilter = it.filter;
          const execute = (typeof itFilter === 'function' ? this.simstanceManager.getOrNewSim({target: itFilter}) : itFilter) as Filter;
          if (execute?.proceedBefore) {
            sw = await execute.proceedBefore({rr, app: this, carrier: filter.carrier});
            filter.filters.push({filter: execute, sw});
          }
          if (!sw) {
            // The filter stops the chain. Its response may still be in flight
            // (resEnd is async), so resIsDone() alone must not decide routing:
            // mark the halt explicitly and skip the router below.
            filter.halted = true;
            break;
          }
        }

        // body.. something..
        // 라우터 없이 필터만으로 도는 서버(예: SSR 전용)면, 어느 필터도 처리하지 않은 요청은 404 로 끝낸다
        // (브라우저가 알아서 보내는 /favicon.ico, /.well-known/... 같은 것 — 예전엔 'no router' 에러로 500 + 로그)
        // 필터가 false 를 돌려줬으면(체인 중단) 그 응답이 아직 전송 중일 수 있으므로 resIsDone() 만으로
        // 라우팅을 결정하지 않는다 — halted 면 라우터를 건너뛴다 (핸들러가 돌면 안 됨).
        if (filter.halted) {
          // 응답은 필터가 끝낸다 (이미 끝났으면 그대로).
        } else if (!rr.resIsDone() && !this.option.rootRouter) {
          rr.resStatusCode(HttpStatus.NotFound);
        } else if (!rr.resIsDone()) {
          const routerModule = await super.routing(rr.reqIntent);
          otherStorage.set(RouterModule, routerModule);
          const moduleInstance = routerModule?.getModuleInstance?.();
          let methods: SaveMappingConfig[] = [];
          if (routerModule && moduleInstance) {
            // router 클래스 내부에서 선언된 Route일때
            if (routerModule.propertyKeys) {
              const map = routerModule.propertyKeys?.map((it: string | symbol) => {
                return {propertyKey: it, config: getUrlMapping(moduleInstance, it)} as SaveMappingConfig
              });
              methods.push(...(map ?? []));
            } else {
              methods.push(...(getUrlMappings(moduleInstance).filter(it => !getRoute(moduleInstance, it.propertyKey)) ?? []));
            }

            // options로 요청오면은 allow로 넣고 그냥 200처리해야됨.
            if (rr.reqMethod()?.toUpperCase() === HttpMethod.OPTIONS.toUpperCase()) {
              rr.resSetHeader(HttpHeaders.Allow, methods.map(it => it.config.method).join(', '));
              rr.resStatusCode(HttpStatus.Ok);
            }

            // method 찾기
            methods = methods.filter(it => it && it.propertyKey && it.config && rr.reqMethod()?.toUpperCase() === it.config.method.toUpperCase());
            methods.sort((a, b) => {
              return ((b.config?.req?.contentType?.length ?? 0) + (b.config?.req?.accept?.length ?? 0)) - ((a.config?.req?.contentType?.length ?? 0) + (a.config?.req?.accept?.length ?? 0));
            });
            methods = methods
              .filter(it => it.config?.req?.contentType ? (!!it.config?.req?.contentType?.find(sit => rr.reqHasContentTypeHeader(sit))) : true)
              .filter(it => it.config?.req?.accept ? (!!it.config?.req?.accept?.find(sit => rr.reqHasAcceptHeader(sit))) : true);

            if (methods[0]) {
              const it = methods[0];
              const paramTypes = ReflectUtils.getParameterTypes(moduleInstance, it.propertyKey)
              const injects = getInject(moduleInstance, it.propertyKey);
              const validIndexs = getValidIndex(moduleInstance, it.propertyKey);
              if (injects) {
                const isPathData = injects.find(it => it.config?.situationType === UrlMappingSituationType.REQ_PATH_DATA);
                const isJson = injects.find(it => it.config?.situationType === UrlMappingSituationType.REQ_JSON_BODY);
                const isSearchParamsObj = injects.find(it => it.config?.situationType === UrlMappingSituationType.REQ_URL_SEARCH_PARAMS_OBJ);
                const isFormUrl = injects.find(it => it.config?.situationType === UrlMappingSituationType.REQ_FORM_URL_BODY);
                // 우선 다시 제거한다.. 트랜젝션 어떻게 할지 다시 생각
                // const isTransactionManager = injects.find(it => it.config?.situationType === InjectSituationType.TransactionManager);
                const siturationContainers = new SituationTypeContainers();
                if (isPathData) {
                  let data = await routerModule.pathData
                  if (isPathData.type) {
                    data = Object.assign(new isPathData.type(), data);
                  }
                  if (validIndexs.includes(isPathData.index)) {
                    const inValid = execValidationInValid(data);
                    if ((inValid?.length ?? 0) > 0) {
                      throw new ValidException(inValid);
                    }
                  }
                  siturationContainers.push(new SituationTypeContainer({
                    situationType: UrlMappingSituationType.REQ_PATH_DATA,
                    data
                  }));
                }
                if (isJson) {
                  let data = await rr.reqBodyJsonData();
                  if (data !== null && isJson.type) {
                    data = Object.assign(new isJson.type(), data);
                  }
                  if (validIndexs.includes(isJson.index)) {
                    const inValid = execValidationInValid(data);
                    if ((inValid?.length ?? 0) > 0) {
                      throw new ValidException(inValid);
                    }
                  }
                  siturationContainers.push(new SituationTypeContainer({
                    situationType: UrlMappingSituationType.REQ_JSON_BODY,
                    data
                  }));
                }
                if (isSearchParamsObj) {
                  let data = rr.reqUrlSearchParamsObj
                  if (validIndexs.includes(isSearchParamsObj.index)) {
                    const inValid = execValidationInValid(data);
                    if ((inValid?.length ?? 0) > 0) {
                      throw new ValidException(inValid);
                    }
                  }
                  siturationContainers.push(new SituationTypeContainer({
                    situationType: UrlMappingSituationType.REQ_URL_SEARCH_PARAMS_OBJ,
                    data
                  }));
                }
                if (isFormUrl) {
                  let data = await rr.reqBodyFormUrlData()
                  if (isFormUrl.type) {
                    data = Object.assign(new isFormUrl.type(), data);
                  }
                  if (validIndexs.includes(isFormUrl.index)) {
                    const inValid = execValidationInValid(data);
                    if ((inValid?.length ?? 0) > 0) {
                      throw new ValidException(inValid);
                    }
                  }
                  siturationContainers.push(new SituationTypeContainer({situationType: UrlMappingSituationType.REQ_FORM_URL_BODY, data}));
                }
                // 트랜젝션 우선 제거 나중에 어떻게 구현할지 생각..
                // if (isTransactionManager && isTransactionManager.type && transactionManager && transactionManager.hasTransaction(isTransactionManager.type)) {
                //   let data = await transactionManager.getTransaction(isTransactionManager.type);
                //   if (data) {
                //     data = await data.try(isTransactionManager.config.argument);
                //     siturationContainers.push(new SituationTypeContainer({situationType: InjectSituationType.TransactionManager, data, index: isTransactionManager.index}));
                //   }
                // }
                if (siturationContainers.length) {
                  otherStorage.set(SituationTypeContainers, siturationContainers);
                }
              }

              for (const paramType of paramTypes) {
                if (paramType === ReqFormUrlBody) {
                  otherStorage.set(ReqFormUrlBody, await rr.reqBodyReqFormUrlBody())
                } else if (paramType === ReqPathData) {
                  otherStorage.set(ReqPathData, routerModule.pathData)
                } else if (paramType === ReqJsonBody) {
                  otherStorage.set(ReqJsonBody, await rr.reqBodyReqJsonBody())
                } else if (paramType === ReqSearchParamsObj) {
                  otherStorage.set(ReqSearchParamsObj, rr.reqUrlSearchParamsObj)
                } else if (paramType === URLSearchParams) {
                  otherStorage.set(URLSearchParams, rr.reqUrlSearchParams)
                } else if (paramType === ReqMultipartFormBody) {
                  otherStorage.set(ReqMultipartFormBody, rr.reqBodyMultipartFormData())
                } else if (paramType === ReqHeader) {
                  otherStorage.set(ReqHeader, rr.reqHeaderObj)
                }
              }

              // execute !!!
              let data = await this.simstanceManager.executeBindParameterSimPromise({
                target: moduleInstance,
                targetKey: it.propertyKey
              }, otherStorage);
              /*
                  여기에서 정해진 타입 리턴에 따른 조치
                  ...
               */
              const resConfig = it.config?.res;
              if (resConfig === 'manual') {
                // 핸들러가 ServerResponse를 직접 주입받아 스스로 write/end를 제어한다 (예: SSE 스트리밍)
              } else if (ValidUtils.isGenerator(data) || ValidUtils.isAsyncGenerator(data)) {
                // 제너레이터 리턴: 헤더 먼저 보내고, yield 된 값을 하나씩 바로 body 로 흘려보낸다 (예: SSE)
                // ContentTypeGenerator.Stream 이면 Content-Type(boundary 포함)·압축 여부를 스트림이 정한다
                const stream = ContentTypeGenerator.isStream(data) ? data : undefined;
                const headers = resConfig?.header ?? {};
                const contentType = stream?.contentType ?? resConfig?.contentType;
                if (contentType) {
                  headers[HttpHeaders.ContentType] = contentType;
                }
                rr.resSetHeaders(headers);
                if (resConfig?.status !== undefined) {
                  // Explicit decorator status wins. The Node default (200) is left
                  // alone otherwise so a handler-set status (e.g. via resEnd(Response))
                  // is not clobbered back to 200.
                  rr.resSetStatusCode(resConfig.status);
                }
                await rr.resStream(data, { compress: stream?.compress });
              } else {
                if (it.config?.resolver) {
                  const execute = typeof it.config.resolver === 'function' ? this.simstanceManager.getOrNewSim({target: it.config.resolver}) : it.config.resolver;
                  data = await execute?.resolve?.(data, rr, resConfig);
                }
                const headers = resConfig?.header ?? {};
                if (resConfig?.contentType) {
                  headers[HttpHeaders.ContentType] = resConfig.contentType;
                }
                if ((resConfig?.contentType?.toLowerCase().indexOf(Mimes.ApplicationJson.toLowerCase()) ?? -1) > -1) {
                  data = JSON.stringify(data);
                } else if (data && typeof data === 'object') {
                  data = JSON.stringify(data);
                }
                rr.resSetHeaders(headers)
                if (resConfig?.status !== undefined) {
                  // An explicit decorator status wins. Otherwise leave the status
                  // alone (Node defaults to 200) so a handler-set status is not
                  // clobbered back to 200.
                  rr.resSetStatusCode(resConfig.status);
                }
                rr.resWrite(data);
              }
            }
          }

          if (this.option.noSuchRouteEndPointMappingThrow && methods.length <= 0 && rr.reqMethod()?.toUpperCase() !== HttpMethod.OPTIONS) {
            throw this.option.noSuchRouteEndPointMappingThrow(rr);
          }
        }

        // after
        for (const it of filter.filters.reverse()) {
          if (it.filter?.proceedAfter && !await it.filter.proceedAfter({rr, app: this, before: it.sw, carrier: filter.carrier})) {
            break;
          }
        }
      } catch (e) {
        console.error('request error:', e);
        transactionManager?.catch(e);
        rr.resStatusCode(e instanceof HttpError ? e.status : HttpStatus.InternalServerError)
        const globalAdvice = this.option.globalAdvice;
        // getOrNewSim takes { target }; passing the class directly
        // destructures to undefined and silently disables globalAdvice.
        const execute = typeof globalAdvice === 'function' ? this.simstanceManager.getOrNewSim({ target: globalAdvice }) : globalAdvice;
        if (!execute) {
          rr.resEnd();
          // rr.resEnd().catch(e => {
          // });
          return;
        }
        if (e && typeof e === 'object') {
          otherStorage.set(e.constructor as ConstructorType<any>, e);
          otherStorage.set(SituationTypeContainer, new SituationTypeContainer({
            situationType: ExceptionHandlerSituationType.ERROR_OBJECT,
            data: e
          }));
        }
        const target = targetExceptionHandler(execute, e);
        if (target) {
          await this.simstanceManager.executeBindParameterSimPromise({
            target: execute,
            targetKey: target.propertyKey
          }, otherStorage);
        }
      } finally {
        transactionManager?.finally();
      }

      if (!rr.resIsDone()) {
        await this.safeResEnd(rr);
      }
    });

    if (this.option.webSocketEndPoints) {
      const webSocketServer = new WebSocketServer({server: this.server});
      const execute = this.option.webSocketEndPoints.map(it => typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it);
      webSocketServer.on('connection', async (ws, request) => {
        this.webSocketClients.set(ws, {request});
        const wsSet = {socket: ws, request};
        execute.forEach(it => it.connect?.(wsSet));
        ws.on('error', err => execute.forEach(it => it.error?.(wsSet, err)));
        ws.on('message', (data, isBinary) => execute.forEach(it => it.message(wsSet, {data, isBinary})));
        ws.on('ping', () => execute.forEach(it => it.ping?.(wsSet)));
        ws.on('close', () => {
          this.webSocketClients.delete(ws);
          execute.forEach(it => it.close?.(wsSet));
        });
      });
    }
    this.server.listen(this.option.listen.port, this.option.listen.hostname, this.option.listen.backlog, () => {
      this.option.listen.listeningListener?.(this, this.server);
    });
  }
}
