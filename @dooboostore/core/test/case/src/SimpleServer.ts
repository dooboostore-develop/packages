
import { OpenApi } from '../../../src/open-api/OpenApi';

// 🎯 타입 추론이 되는 서버 인터페이스

// 서버 호출 매개변수의 모든 가능한 조합 타입
type ServerCallParams<T_Spec extends OpenApi.Spec> = {
    [Path in keyof T_Spec["paths"]]: {
        [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
        ? OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
        ? ReqContent extends Record<string, any>
        ? OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: { readonly "200": { readonly content: infer ResContent } } }
        ? ResContent extends Record<string, any>
        ? {
            [ReqContentType in keyof ReqContent]: {
                [ResContentType in keyof ResContent]: {
                    path: Path;
                    method: Method;
                    requestContentType: ReqContentType;
                    responseContentType: ResContentType;
                } & OpenApi.ExtractPathParams<Path>
            }
        }[keyof ReqContent][keyof ResContent]
        : never
        : never
        : never
        : OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: { readonly "200": { readonly content: infer ResContent } } }
        ? ResContent extends Record<string, any>
        ? {
            [ResContentType in keyof ResContent]: {
                path: Path;
                method: Method;
                requestContentType?: never;
                responseContentType: ResContentType;
            } & OpenApi.ExtractPathParams<Path>
        }[keyof ResContent]
        : {
            path: Path;
            method: Method;
            requestContentType?: never;
            responseContentType?: never;
        } & OpenApi.ExtractPathParams<Path>
        : {
            path: Path;
            method: Method;
            requestContentType?: never;
            responseContentType?: never;
        } & OpenApi.ExtractPathParams<Path>
        : never;
    }
}[keyof T_Spec["paths"]][keyof T_Spec["paths"][keyof T_Spec["paths"]]];



// Path에 따른 가능한 Method 추출
type ExtractMethods<T_Spec extends OpenApi.Spec, T_Path extends keyof T_Spec["paths"]> =
    keyof T_Spec["paths"][T_Path] & ("get" | "post" | "put" | "delete");

// 특정 Path와 Method에서 가능한 Request Content-Type 추출
type ExtractRequestContentTypes<T_Spec extends OpenApi.Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
    OpenApi.GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly requestBody: { readonly content: infer Content } }
    ? Content extends Record<string, any>
    ? keyof Content
    : never
    : never;

// 특정 Path와 Method에서 가능한 Response Content-Type 추출
type ExtractResponseContentTypes<T_Spec extends OpenApi.Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
    OpenApi.GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly responses: { readonly "200": { readonly content: infer Content } } }
    ? Content extends Record<string, any>
    ? keyof Content
    : never
    : never;

// Path, Method, Content-Type 조합 타입
type PathMethodContentTypePair<T_Spec extends OpenApi.Spec> = {
    [Path in keyof T_Spec["paths"]]: {
        [Method in ExtractMethods<T_Spec, Path>]:
        // requestBody가 있는 경우
        ExtractRequestContentTypes<T_Spec, Path, Method> extends never
        ? {
            // requestBody 없음 (GET 등)
            path: Path;
            method: Method;
            requestContentType?: never;
            responseContentType: ExtractResponseContentTypes<T_Spec, Path, Method>;
        }
        : {
            // requestBody 있음 (POST 등)
            path: Path;
            method: Method;
            requestContentType: ExtractRequestContentTypes<T_Spec, Path, Method>;
            responseContentType: ExtractResponseContentTypes<T_Spec, Path, Method>;
        }
    }[ExtractMethods<T_Spec, Path>]
}[keyof T_Spec["paths"]];

// Body 타입 추론
type ExtractBodyType<T_Spec extends OpenApi.Spec, T_Target> =
    T_Target extends { path: infer Path; method: infer Method; requestContentType: infer ReqContentType }
    ? Path extends keyof T_Spec["paths"]
    ? Method extends keyof T_Spec["paths"][Path]
    ? ReqContentType extends string
    ? OpenApi.ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, ReqContentType>
    : undefined
    : never
    : never
    : undefined;

// Path Parameters 타입 추론
type ExtractPathParamsType<T_Spec extends OpenApi.Spec, T_Target> =
    T_Target extends { path: infer Path }
    ? Path extends keyof T_Spec["paths"]
    ? OpenApi.ExtractPathParams<Path>
    : {}
    : {};

// Query Parameters 타입 추론
type ExtractQueryParamsType<T_Spec extends OpenApi.Spec, T_Target> =
    T_Target extends { path: infer Path; method: infer Method }
    ? Path extends keyof T_Spec["paths"]
    ? Method extends keyof T_Spec["paths"][Path]
    ? OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly parameters?: infer P_raw extends readonly any[] }
    ? ((resolved: OpenApi.ResolveParams<P_raw, T_Spec>) => void) extends (p: infer P extends readonly any[]) => void
    ? {
        [Param in Extract<P[number], { readonly in: "query" }> as Param["name"]]?:
        OpenApi.SchemaToTsType<Param["schema"], T_Spec>
    }
    : {}
    : {}
    : {}
    : {}
    : {};

// Header Parameters 타입 추론
type ExtractHeaderParamsType<T_Spec extends OpenApi.Spec, T_Target> =
    T_Target extends { path: infer Path; method: infer Method }
    ? Path extends keyof T_Spec["paths"]
    ? Method extends keyof T_Spec["paths"][Path]
    ? OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly parameters?: infer P_raw extends readonly any[] }
    ? ((resolved: OpenApi.ResolveParams<P_raw, T_Spec>) => void) extends (p: infer P extends readonly any[]) => void
    ? {
        [Param in Extract<P[number], { readonly in: "header"; readonly required: true }> as Param["name"]]:
        OpenApi.SchemaToTsType<Param["schema"], T_Spec>
    } & {
        [Param in Extract<P[number], { readonly in: "header"; readonly required?: false | undefined }> as Param["name"]]?:
        OpenApi.SchemaToTsType<Param["schema"], T_Spec>
    }
    : {}
    : {}
    : {}
    : {}
    : {};

// Response 타입 추론
type ExtractResponseTypeFromTarget<T_Spec extends OpenApi.Spec, T_Target> =
    T_Target extends { path: infer Path; method: infer Method; responseContentType: infer ResContentType }
    ? Path extends keyof T_Spec["paths"]
    ? Method extends keyof T_Spec["paths"][Path]
    ? ResContentType extends string
    ? OpenApi.ExtractResponseType<T_Spec, T_Spec["paths"][Path], Method, "200", ResContentType>
    : OpenApi.ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>
    : never
    : never
    : any;

// 완전한 타입 추론이 되는 서버 함수 타입
type TypedSimpleServer<T_Spec extends OpenApi.Spec> = {
    // 오버로드 1: requestContentType이 있는 경우 (POST 등)
    <T_Target extends PathMethodContentTypePair<T_Spec> & { requestContentType: string }>(
        target: T_Target,
        args: {
            parameters: {
                path: ExtractPathParamsType<T_Spec, T_Target>;
                query?: ExtractQueryParamsType<T_Spec, T_Target>;  // 🎯 정확한 query 타입 추론!
                header?: ExtractHeaderParamsType<T_Spec, T_Target>; // 🎯 정확한 header 타입 추론!
            };
            body: ExtractBodyType<T_Spec, T_Target>;  // 🎯 정확한 body 타입 추론!
        }
    ): Promise<ExtractResponseTypeFromTarget<T_Spec, T_Target>>;

    // 오버로드 2: requestContentType이 없는 경우 (GET 등)
    <T_Target extends PathMethodContentTypePair<T_Spec> & { requestContentType?: never }>(
        target: T_Target,
        args: {
            parameters: {
                path: ExtractPathParamsType<T_Spec, T_Target>;
                query?: ExtractQueryParamsType<T_Spec, T_Target>;  // 🎯 정확한 query 타입 추론!
                header?: ExtractHeaderParamsType<T_Spec, T_Target>; // 🎯 정확한 header 타입 추론!
            };
            body?: undefined;
        }
    ): Promise<ExtractResponseTypeFromTarget<T_Spec, T_Target>>;
};

// 🚀 타입 추론이 되는 서버 구현 함수
export function createSimpleServer<const T_Spec extends OpenApi.Spec>(
    spec: T_Spec,
    handlers: {
        [Path in keyof T_Spec["paths"]]: {
            [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
            ? OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
            ? ReqContent extends Record<string, any>
            ? OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: { readonly "200": { readonly content: infer ResContent } } }
            ? ResContent extends Record<string, any>
            ? {
                [ReqContentType in keyof ReqContent]: {
                    [ResContentType in keyof ResContent]: (
                        args: {
                            parameters: OpenApi.UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>["parameters"];
                            body: OpenApi.ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, string & ReqContentType>;
                            accept: ResContentType;
                        }
                    ) => Promise<OpenApi.ExtractResponseType<T_Spec, T_Spec["paths"][Path], Method, "200", string & ResContentType>>
                }
            }
            : never
            : never
            : never
            : OpenApi.GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: { readonly "200": { readonly content: infer ResContent } } }
            ? ResContent extends Record<string, any>
            ? {
                'void': {
                    [ResContentType in keyof ResContent]: (
                        args: {
                            parameters: OpenApi.UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>["parameters"];
                            body: undefined;
                            accept: ResContentType;
                        }
                    ) => Promise<OpenApi.ExtractResponseType<T_Spec, T_Spec["paths"][Path], Method, "200", string & ResContentType>>
                }
            }
            : (
                args: OpenApi.UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>
            ) => Promise<OpenApi.ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
            : (
                args: OpenApi.UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>
            ) => Promise<OpenApi.ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
            : never;
        }
    }
): TypedSimpleServer<T_Spec> {

    // 🎯 완전한 타입 추론이 되는 서버 함수 반환
    return async function server(target: any, args: any) {
        const { path, method, requestContentType, responseContentType } = target;

        // 객체 중첩 구조로 직접 핸들러 찾기
        let handler: Function | undefined;

        // 1. 매트릭스 구조 (requestContentType + responseContentType)
        if (requestContentType && responseContentType) {
            handler = handlers[path]?.[method]?.[requestContentType]?.[responseContentType];
        }
        
        // 2. GET 등에서 responseContentType만 있는 경우 (void 키 사용)
        if (!handler && !requestContentType && responseContentType) {
            handler = handlers[path]?.[method]?.['void']?.[responseContentType];
        }
        
        // 3. requestContentType만 있는 경우 (단일 응답 타입)
        if (!handler && requestContentType && !responseContentType) {
            handler = handlers[path]?.[method]?.[requestContentType];
        }
        
        // 4. 기존 방식 (하위 호환성)
        if (!handler) {
            const directHandler = handlers[path]?.[method];
            if (typeof directHandler === 'function') {
                handler = directHandler;
            }
        }

        if (!handler) {
            throw new Error(`Handler not found for path: ${path}, method: ${method}, requestContentType: ${requestContentType}, responseContentType: ${responseContentType}`);
        }

        // 핸들러에 전달할 args 구성 (accept 추가)
        const handlerArgs = {
            ...args,
            accept: responseContentType
        };

        return await handler(handlerArgs);
    } as TypedSimpleServer<T_Spec>;
}

export { TypedSimpleServer };