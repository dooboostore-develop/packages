import { ConstructorType } from '@dooboostore/core/types';
import { ReflectMethod } from '@dooboostore/simple-boot/types/Types';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { Resolver } from '../resolvers/Resolver';
import { Mimes } from '../codes/Mimes';
import { HttpMethod } from '../codes/HttpMethod';

export enum UrlMappingSituationType {
    REQ_JSON_BODY = 'SIMPLE_BOOT_HTTP_SERVER://URLMAPPING/REQ_JSON_BODY',
    REQ_PATH_DATA = 'SIMPLE_BOOT_HTTP_SERVER://URLMAPPING/REQ_PATH_DATA',
    // REQ_URL_SEARCH_PARAMS = 'SIMPLE_BOOT_HTTP_SERVER://URLMAPPING/REQ_URL_SEARCH_PARAMS',
    REQ_URL_SEARCH_PARAMS_OBJ = 'SIMPLE_BOOT_HTTP_SERVER://URLMAPPING/REQ_URL_SEARCH_PARAMS_OBJ',
    REQ_FORM_URL_BODY = 'SIMPLE_BOOT_HTTP_SERVER://URLMAPPING/REQ_FORM_URL_BODY'
}
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
export type SaveMappingConfig = {propertyKey: string | symbol; config: MappingConfig}
const MappingMetadataKey = Symbol('MappingMetadataKey');
// const GETSMappingMetadataKey = Symbol('GET_METHODS');
// const GETMappingMetadataKey = Symbol('GET_METHOD');

const process = (config: MappingConfig, target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const saveMappingConfigs = (ReflectUtils.getMetadata(MappingMetadataKey, target.constructor) ?? []) as SaveMappingConfig[];
    saveMappingConfigs.push({propertyKey, config});
    ReflectUtils.defineMetadata(MappingMetadataKey, saveMappingConfigs, target.constructor);
    ReflectUtils.defineMetadata(MappingMetadataKey, config, target, propertyKey);
}
export function UrlMapping(config: MappingConfig): ReflectMethod;
export function UrlMapping(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function UrlMapping(configOrtarget?: MappingConfig | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.GET}, configOrtarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            process(configOrtarget, target, propertyKey, descriptor);
        }
    }
}
export const getUrlMapping = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return ReflectUtils.getMetadata(MappingMetadataKey, target, propertyKey);
}

export const getUrlMappings = (target: any): SaveMappingConfig[] => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(MappingMetadataKey, target);
}
export function GET(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function GET(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function GET(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.GET}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.GET;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getGET = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getGETS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.GET);
}
export function POST(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function POST(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function POST(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.POST}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.POST;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getPOST = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getPOSTS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.POST);
}
export function DELETE(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function DELETE(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function DELETE(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.DELETE}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.DELETE;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getDELETE = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getDELETES = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.DELETE);
}
export function PUT(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function PUT(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function PUT(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.PUT}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.PUT;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getPUT = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getPUTS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.PUT);
}
export function PATCH(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function PATCH(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function PATCH(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.PATCH}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.PATCH;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getPATCH = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getPATCHS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.GET);
}
export function OPTIONS(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function OPTIONS(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function OPTIONS(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.OPTIONS}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.OPTIONS;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getOPTIONS = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getOPTIONSS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.OPTIONS);
}
export function HEAD(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function HEAD(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function HEAD(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.HEAD}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.HEAD;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getHEAD = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getHEADS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.GET);
}
export function TRACE(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function TRACE(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function TRACE(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.TRACE}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.TRACE;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getTRACE = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getTRACES = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.TRACE);
}
export function CONNECT(config: Omit<MappingConfig, 'method'>): ReflectMethod;
export function CONNECT(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function CONNECT(configOrTarget?: Omit<MappingConfig, 'method'> | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): ReflectMethod | void {
    if (propertyKey && descriptor) {
        process({method: HttpMethod.CONNECT}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            configOrTarget.method = HttpMethod.CONNECT;
            process(configOrTarget, target, propertyKey, descriptor);
        }
    }
}

export const getCONNECT = (target: any, propertyKey: string | symbol): MappingConfig | undefined => {
    return getUrlMapping(target, propertyKey);
}
export const getCONNECTS = (target: any): SaveMappingConfig[] => {
    return getUrlMappings(target)?.filter(it => it.config?.method.toUpperCase() === HttpMethod.CONNECT);
}
