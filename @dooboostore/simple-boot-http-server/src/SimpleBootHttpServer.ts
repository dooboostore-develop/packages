import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { HttpServerOption } from './option/HttpServerOption';
import { ConstructorType } from '@dooboostore/core/types';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http'
import { Server as HttpsServer } from 'https'; // Add HTTPS support
import { RequestResponse } from './models/RequestResponse';
import { getUrlMapping, getUrlMappings, SaveMappingConfig, UrlMappingSituationType } from './decorators/MethodMapping';
import { HttpStatus } from './codes/HttpStatus';
import { HttpHeaders } from './codes/HttpHeaders';
import { Mimes } from './codes/Mimes';
import { Filter } from './filters/Filter';
import { ExceptionHandlerSituationType, targetExceptionHandler } from '@dooboostore/simple-boot/decorators/exception/ExceptionDecorator';
import { getInject, SituationTypeContainer, SituationTypeContainers } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { EndPoint } from './endpoints/EndPoint';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { ReqFormUrlBody } from './models/datas/body/ReqFormUrlBody';
import { ReqJsonBody } from './models/datas/body/ReqJsonBody';
import { ReqHeader } from './models/datas/ReqHeader';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { ReqMultipartFormBody } from './models/datas/body/ReqMultipartFormBody';
import { execValidationInValid, getValidIndex } from '@dooboostore/simple-boot/decorators/validate/Validation';
import { ValidException } from '@dooboostore/simple-boot/errors/ValidException';
import { HttpError } from './errors/HttpError';
import { getRoute } from '@dooboostore/simple-boot/decorators/route/Router';
import { OnInit } from './lifecycle/OnInit';
import { URLSearchParams } from 'url';
import { HttpMethod } from './codes/HttpMethod';
import { SessionManager } from './session/SessionManager';
import { InjectSituationType } from './inject/InjectSituationType';
import {ReqSearchParamsObj} from "./models/datas/search/ReqSearchParamsObj";
import { SimConfig } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ReqPathData } from './models/datas/body/ReqPathData';

export class SimpleBootHttpServer extends SimpleApplication {
    public server?: HttpServer | HttpsServer;
    private sessionManager: SessionManager;
    constructor(public option: HttpServerOption = new HttpServerOption()) {
        super(option);
        this.sessionManager = new SessionManager(this.option);
    }


    public run(otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | Symbol, any>) {
        super.run(otherInstanceSim);
        const targets = [...this.option.closeEndPoints ?? [], ...this.option.errorEndPoints ?? [], ...this.option.requestEndPoints ?? [], ...this.option.filters ?? []];
        Promise.all(targets.map(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it as ConstructorType<any>}) : it) as OnInit).map(it => it.onInit(this))).then(it => {
            this.startServer();
        });
        return this;
    }

    private startServer() {

        // const a = this.option.serverOption as HttpsServerOption;
        // this.option.serverOption?.

        if (this.option.serverOption && 'key' in this.option.serverOption && 'cert' in this.option.serverOption) {
            this.server = new HttpsServer(this.option.serverOption);
            const httpServer = new HttpServer();
            httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
                res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
                res.end();
            });
            httpServer.listen(80, this.option.listen.hostname, () => {
                console.log('HTTP redirect server running on port 80');
            });
        } else if (this.option.serverOption) {
            this.server =  new HttpServer(this.option.serverOption);
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
                            const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it) as EndPoint;
                            const endPoint = execute?.endPoint(rr, this);
                            if (endPoint instanceof Promise) {
                                await endPoint;
                            }
                        } catch (e) {
                        }
                    }
                }

                if (!rr.resIsDone()) {
                    rr.resEnd();
                }
            });
            res.on('error', async () => {
                if (this.option.errorEndPoints) {
                    for (const it of this.option.errorEndPoints) {
                        try {
                            const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it) as EndPoint;
                            const endPoint = execute?.endPoint(rr, this);
                            if (endPoint instanceof Promise) {
                                await endPoint;
                            }
                        } catch (e) {
                        }
                    }
                }

                if (!rr.resIsDone()) {
                    rr.resEnd();
                }
            });

            const rr = new RequestResponse(req, res,{sessionManager:  this.sessionManager, option: this.option});
            /*
                default setting first
             */
            rr.resSetHeader(HttpHeaders.Server, 'simple-boot-http-server');
            const cookie = rr.reqCookieGet(this.option.sessionOption.key);
            if (!cookie) {
                const session = await this.sessionManager.session();

                const cookieParts: string[] = [];
                cookieParts.push(`${this.option.sessionOption.key}=${session.uuid}`);
                cookieParts.push(`Path=${this.option.sessionOption.path}`);
                if (this.option.sessionOption.httpOnly) cookieParts.push('HttpOnly');
                if (this.option.sessionOption.secure) cookieParts.push('Secure');
                if (this.option.sessionOption.sameSite != null && this.option.sessionOption.sameSite) cookieParts.push(`SameSite=${this.option.sessionOption.sameSite}`);
                const maxAge = (this.option.sessionOption as any).maxAge ?? (this.sessionManager.sessionOption)?.maxAge;
                if (maxAge != null) cookieParts.push(`Max-Age=${maxAge}`);
                rr.resSetHeader(HttpHeaders.SetCookie, cookieParts.join('; '));
            }

            const otherStorage = new Map<ConstructorType<any>, any>();
            otherStorage.set(RequestResponse, rr);
            otherStorage.set(IncomingMessage, req);
            otherStorage.set(ServerResponse, res);
            try {
                transactionManager?.try();
                if (this.option.requestEndPoints) {
                    for (const it of this.option.requestEndPoints) {
                        try {
                            const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim<EndPoint>({target:it}) : it) as EndPoint;
                            execute?.endPoint(rr, this);
                        } catch (e) {
                        }
                    }
                }

                const filter = {
                    carrier: new Map<string, any>(),
                    filters: [] as { filter: Filter, sw: boolean }[]
                };
                for (let i = 0; this.option.filters && i < this.option.filters.length; i++) {
                    const it = this.option.filters[i];
                    const execute = (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it) as Filter;
                    let sw = true;
                    if (execute?.proceedBefore) {
                        sw = await execute.proceedBefore({rr, app: this, carrier: filter.carrier});
                        filter.filters.push({filter: execute, sw});
                    }
                    if (!sw) {
                        break;
                    }
                }

                // body.. something..
                if (!rr.resIsDone()) {
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
                                const isTransactionManager = injects.find(it => it.config?.situationType === InjectSituationType.TransactionManager);
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
                                    if (data!==null && isJson.type) {
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

                                if (isTransactionManager && isTransactionManager.type && transactionManager && transactionManager.hasTransaction(isTransactionManager.type)) {
                                    let data = await transactionManager.getTransaction(isTransactionManager.type);
                                    if (data) {
                                        data = await data.try(isTransactionManager.config.argument);
                                        siturationContainers.push(new SituationTypeContainer({situationType: InjectSituationType.TransactionManager, data, index: isTransactionManager.index}));
                                    }
                                }
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
                                }else if (paramType === URLSearchParams) {
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
                            if (it.config?.resolver) {
                                const execute = typeof it.config.resolver === 'function' ? this.simstanceManager.getOrNewSim({target:it.config.resolver}) : it.config.resolver;
                                data = await execute?.resolve?.(data, rr);
                            }
                            const status = it.config?.res?.status ?? HttpStatus.Ok;
                            const headers = it.config?.res?.header ?? {};
                            if (it.config?.res?.contentType) {
                                headers[HttpHeaders.ContentType] = it.config?.res?.contentType;
                            }
                            if ((it.config?.res?.contentType?.toLowerCase().indexOf(Mimes.ApplicationJson.toLowerCase()) ?? -1) > -1) {
                                data = JSON.stringify(data);
                            } else if (data && typeof data === 'object') {
                                data = JSON.stringify(data);
                            }
                            rr.resSetHeaders(headers)
                            rr.resSetStatusCode(status); 
                            rr.resWrite(data);
                        }
                    }

                    if (this.option.noSuchRouteEndPointMappingThrow && methods.length <= 0 && rr.reqMethod()?.toUpperCase() !== HttpMethod.OPTIONS) {
                        throw this.option.noSuchRouteEndPointMappingThrow(rr);
                    }
                }

                // after
                for (const it of filter.filters.reverse()) {
                    if (it.filter?.proceedAfter && !await it.filter.proceedAfter({rr, app:this, before: it.sw, carrier: filter.carrier})) {
                        break;
                    }
                }
            } catch (e) {
                console.error('request error:', e);
                transactionManager?.catch(e);
                rr.resStatusCode(e instanceof HttpError ? e.status : HttpStatus.InternalServerError)
                const execute = typeof this.option.globalAdvice === 'function' ? this.simstanceManager.getOrNewSim(this.option.globalAdvice) : this.option.globalAdvice;
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
                rr.resEnd();
            }
        });

        this.server.listen(this.option.listen.port, this.option.listen.hostname, this.option.listen.backlog, () => {
            this.option.listen.listeningListener?.(this, this.server);
        });
    }
}
