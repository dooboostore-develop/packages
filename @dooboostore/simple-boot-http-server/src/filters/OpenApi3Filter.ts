import {Filter} from './Filter';
import {HttpStatus} from '../codes/HttpStatus';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';
import {RequestResponse} from '../models/RequestResponse';
import {getUrlMappings} from '../decorators/MethodMapping';

type MethodType = {
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: {
        name: string;
        in: string;
        required: boolean;
        schema: {
            type: string;
            format?: string;
            items?: {
                type: string;
                format?: string;
            }
        }
    }[];
    responses: {
        [code: string]: {
            description: string;
            content?: {
                [type: string]: {
                    schema: {
                        type: string;
                        format?: string;
                        items?: {
                            type: string;
                            format?: string;
                        }
                    }
                }
            }
        }
    }
};
type PathType = {
    [method: string]: MethodType
};
type PathsType = {
    [path: string]: PathType
};
export type OpenApiType = {
    openapi: string;
    info?: {
        title?: string;
        description?: string;
        contact?: {
            name?: string;
            email?: string;
        }
    }
    servers?: { url: string }[],
    paths?: PathsType
    components?: {
        schemas?: {
            [key: string]: {
                type: string;
                required?: string[];
                properties?: {
                    [key: string]: {
                        type: string;
                        format?: string;
                        items?: {
                            type: string;
                            format?: string;
                        }
                    }
                }
            }
        }
        securitySchemes?: {
            [key: string]: {
                type: string;
                description?: string;
                in?: string;
                name?: string;
                scheme?: string;
                bearerFormat?: string;
                flows?: {
                    [key: string]: {
                        authorizationUrl?: string;
                        tokenUrl?: string;
                        refreshUrl?: string;
                        scopes?: {
                            [key: string]: {
                                description?: string;
                            }
                        }
                    }
                }
            }
        }
    }
}
export type OpenApi3FilterConfig = {
    info?: {
        title?: string;
        description?: string;
        contact?: {
            name?: string;
            email?: string;
        }
    }
    servers?: { url: string }[],
}
const DefulatData: OpenApiType = {
    openapi: '3.0.1',
    info: {
        title: 'SimpleBootHttpServer OpenApi3',
        description: 'SimpleBootHttpServer OpenApi3',
    }
}

export class OpenApi3Filter implements Filter {
    private openApiConfig: any;

    constructor(public config: { path: string, excludePath?: { method: string, path: string }[] }, openApiConfig?: OpenApi3FilterConfig) {
        this.openApiConfig = Object.assign(Object.assign({}, DefulatData), openApiConfig ?? {})
    }
    async onInit(app: SimpleBootHttpServer){
    }
    async before(rr: RequestResponse, app: SimpleBootHttpServer) {
        if (rr.reqUrl === this.config.path) {
            const map = app.routerManager.routingMap();
            // let routers = app.simstanceManager.getSimAtomics().filter((it: SimAtomic) => it.getConfig(RouterMetadataKey));
            const data = {
                paths: {} as PathsType
            } as OpenApiType;

            Object.entries(map).filter(([k, v]) => typeof v !== 'string').forEach(([k, v]) => {
                const method = data.paths![k] = {} as PathType;
                getUrlMappings(v)?.forEach(it => {
                    method[it.config.method] = {
                        summary: it.propertyKey,
                        description: it.propertyKey
                        // operationId: it.operationId,
                        // parameters: it.parameters,
                        // responses: it.responses,
                    } as MethodType
                });
            })

            rr.resWriteJson(Object.assign(Object.assign({}, this.openApiConfig), data)).resStatusCode(HttpStatus.Ok).resEnd();
            return false;
        }
        return true;
    }

    async after(rr: RequestResponse, app: SimpleBootHttpServer) {
        return true;
    }
}
