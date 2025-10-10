export namespace OpenApi {
    // --- OpenAPI 3.0 타입 정의 ---
    export interface ReferenceObject {
        readonly $ref: string;
    }

    export interface SchemaObject {
        readonly type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
        readonly properties?: Record<string, SchemaObject | ReferenceObject>;
        readonly required?: readonly string[];
        readonly enum?: readonly any[];
        readonly items?: SchemaObject | ReferenceObject;
        readonly description?: string;
        readonly format?: string;
    }

    export interface ParameterObject {
        readonly name: string;
        readonly in: "query" | "path" | "header" | "cookie";
        readonly required?: boolean;
        readonly schema?: SchemaObject | ReferenceObject;
        readonly description?: string;
    }

    export interface RequestBodyObject {
        readonly required?: boolean;
        readonly content: {
            readonly [mediaType: string]: {
                readonly schema?: SchemaObject | ReferenceObject;
            };
        };
        readonly description?: string;
    }

    export interface ResponseObject {
        readonly description: string;
        readonly content?: {
            readonly [mediaType: string]: {
                readonly schema?: SchemaObject | ReferenceObject;
            };
        };
    }

    export interface OperationObject {
        readonly summary?: string;
        readonly parameters?: readonly (ParameterObject | ReferenceObject)[];
        readonly requestBody?: RequestBodyObject | ReferenceObject;
        readonly responses: {
            readonly [statusCode: string]: ResponseObject | ReferenceObject;
        };
    }

    export interface PathItemObject {
        readonly get?: OperationObject;
        readonly post?: OperationObject;
        readonly put?: OperationObject;
        readonly delete?: OperationObject;
    }

    export interface ComponentsObject {
        readonly schemas?: Record<string, SchemaObject | ReferenceObject>;
        readonly parameters?: Record<string, ParameterObject | ReferenceObject>;
        readonly responses?: Record<string, ResponseObject | ReferenceObject>;
        readonly requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
    }

    export interface ServerObject {
        readonly url: string;
        readonly description?: string;
        readonly variables?: Record<string, {
            readonly enum?: readonly string[];
            readonly default: string;
            readonly description?: string;
        }>;
    }

    export interface Spec {
        readonly openapi?: "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3";
        readonly info?: {
            readonly title: string;
            readonly version: string;
        };
        readonly servers?: readonly ServerObject[];
        readonly paths: Record<string, PathItemObject>;
        readonly components?: ComponentsObject;
    }

    // --- 타입 추론 로직 (재귀 깊이 제한 추가) ---

    export type ResolveRef<T, T_Spec extends Spec> = T extends { readonly $ref: infer R }
        ? R extends `#/components/schemas/${infer S}`
        ? T_Spec extends { readonly components: { readonly schemas: { readonly [K in S]: infer Schema } } }
        ? ResolveRef<Schema, T_Spec>
        : never
        : R extends `#/components/parameters/${infer P}`
        ? T_Spec extends { readonly components: { readonly parameters: { readonly [K in P]: infer Param } } }
        ? ResolveRef<Param, T_Spec>
        : never
        : never
        : T;

    // [최종 수정] 재귀 깊이를 제한하는 Depth 파라미터를 추가하여 무한 루프 오류를 방지합니다.
    export type SchemaToTsType<S, T_Spec extends Spec, Depth extends any[] = []> = Depth["length"] extends 8
        ? any
        : S extends { readonly $ref: any }
        ? SchemaToTsType<ResolveRef<S, T_Spec>, T_Spec, [...Depth, any]>
        : S extends { readonly enum: readonly (infer E)[] }
        ? E
        : S extends { readonly type: "string" }
        ? string
        : S extends { readonly type: "number" | "integer" }
        ? number
        : S extends { readonly type: "boolean" }
        ? boolean
        : S extends { readonly type: "array"; readonly items: infer I }
        ? SchemaToTsType<I, T_Spec, [...Depth, any]>[]
        : S extends { readonly type: "object"; readonly properties?: infer P }
        ? {
            [K in (S extends { readonly required: infer R extends readonly string[] } ? R[number] : never) & keyof P]: SchemaToTsType<P[K], T_Spec, [...Depth, any]>;
        } & {
            [K in Exclude<keyof P, (S extends { readonly required: infer R extends readonly string[] } ? R[number] : never)>]?: SchemaToTsType<P[K], T_Spec, [...Depth, any]>;
        }
        : any;

    export type ResolveParams<P extends readonly any[], T_Spec extends Spec> = {
        [I in keyof P]: ResolveRef<P[I], T_Spec>;
    };

    export type GetOperation<T_PathSpec, T_Method> = T_PathSpec extends { readonly [key in T_Method & keyof T_PathSpec]: infer O }
        ? O
        : never;

    export type ExtractApiArgs<T_Spec extends Spec, T_PathSpec, T_Method> =
        (GetOperation<T_PathSpec, T_Method> extends { readonly parameters?: infer P_raw extends readonly any[] }
            ? ((resolved: ResolveParams<P_raw, T_Spec>) => void) extends (p: infer P extends readonly any[]) => void
            ? {
                path: {
                    [Param in Extract<P[number], { readonly in: "path"; readonly required: true }> as Param["name"]]:
                    SchemaToTsType<Param["schema"], T_Spec>
                } & {
                    [Param in Extract<P[number], { readonly in: "path"; readonly required?: false | undefined }> as Param["name"]]?:
                    SchemaToTsType<Param["schema"], T_Spec>
                };
                query?: {
                    [Param in Extract<P[number], { readonly in: "query"; readonly required: true }> as Param["name"]]:
                    SchemaToTsType<Param["schema"], T_Spec>
                } & {
                    [Param in Extract<P[number], { readonly in: "query"; readonly required?: false | undefined }> as Param["name"]]?:
                    SchemaToTsType<Param["schema"], T_Spec>
                };
                header?: {
                    [Param in Extract<P[number], { readonly in: "header"; readonly required: true }> as Param["name"]]:
                    SchemaToTsType<Param["schema"], T_Spec>
                } & {
                    [Param in Extract<P[number], { readonly in: "header"; readonly required?: false | undefined }> as Param["name"]]?:
                    SchemaToTsType<Param["schema"], T_Spec>
                };
            }
            : { path?: never; query?: never; header?: never }
            : { path?: never; query?: never; header?: never }) &
        (GetOperation<T_PathSpec, T_Method> extends { readonly requestBody: { readonly content: infer Content } }
            ? Content extends Record<string, any>
            ? {
                body: {
                    [K in keyof Content]: {
                        type: K;
                        data: Content[K] extends { readonly schema: infer Schema }
                        ? SchemaToTsType<ResolveRef<Schema, T_Spec>, T_Spec>
                        : any;
                    }
                }[keyof Content];
            }
            : { body?: never }
            : { body?: never });

    export type SuccessStatusCode = "200" | "201" | "202" | "204";
    export type ExtractSuccessResponse<R, T_Spec extends Spec> = {
        [Code in keyof R & SuccessStatusCode]: R[Code] extends { readonly content: infer Content }
        ? Content extends Record<string, any>
        ? {
            [ContentType in keyof Content]: Content[ContentType] extends { readonly schema: infer S_raw }
            ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
            : any;
        }[keyof Content]
        : void
        : void;
    }[keyof R & SuccessStatusCode];

    export type ExtractResponse<T_Spec extends Spec, T_PathSpec, T_Method> = GetOperation<T_PathSpec, T_Method> extends {
        readonly responses: infer R;
    } ? ExtractSuccessResponse<R, T_Spec> : never;

    // Accept 타입에 따른 특정 응답 타입 추론
    export type ApiResponseWithAccept<T_Spec extends Spec, T_PathSpec, T_Method, T_Accept extends string> = GetOperation<T_PathSpec, T_Method> extends {
        readonly responses: infer R;
    } ? {
        [Code in keyof R]: R[Code] extends { readonly content: infer Content }
        ? Content extends Record<string, any>
        ? T_Accept extends keyof Content
        ? Content[T_Accept] extends { readonly schema: infer S_raw }
        ? {
            status: Code;
            data: SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>;
        }
        : { status: Code; data: any }
        : never  // Accept가 해당 Content에 없으면 never
        : { status: Code; data: void }
        : { status: Code; data: void }
    }[keyof R] : never;

    // Multiple content types를 지원하는 ApiResponse (기본)
    export type ApiResponse<T_Spec extends Spec, T_PathSpec, T_Method> = GetOperation<T_PathSpec, T_Method> extends {
        readonly responses: infer R;
    } ? {
        [Code in keyof R]: R[Code] extends { readonly content: infer Content }
        ? Content extends Record<string, any>
        ? {
            status: Code;
            data: {
                [ContentType in keyof Content]: Content[ContentType] extends { readonly schema: infer S_raw }
                ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
                : any;
            }[keyof Content];
        }
        : { status: Code; data: void }
        : { status: Code; data: void }
    }[keyof R] : never;

    export type MethodPathKey<T_Spec extends Spec> = {
        [P in keyof T_Spec["paths"]]: {
            [M in keyof T_Spec["paths"][P]]: `[${string & M}]:${string & P}`;
        }[keyof T_Spec["paths"][P]];
    }[keyof T_Spec["paths"]];



    // Extract server URLs from spec
    export type ExtractServerUrls<T_Spec extends Spec> = T_Spec extends { readonly servers: infer Servers }
        ? Servers extends readonly any[]
        ? {
            [K in keyof Servers]: Servers[K] extends { readonly url: infer Url }
            ? Url
            : never;
        }[number]
        : string
        : string;

    // Enhanced target type with server selection
    // Extract response content types
    export type ExtractResponseContentTypes<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
        GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? {
            [Code in keyof R]: R[Code] extends { readonly content: infer Content }
            ? Content extends Record<string, any>
            ? keyof Content
            : never
            : never;
        }[keyof R]
        : never
        : never;

    export type ApiTarget<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> = {
        path: T_Path;
        method: T_Method;
        serverUrl?: ExtractServerUrls<T_Spec>;
        responseContentType?: ExtractResponseContentTypes<T_Spec, T_Path, T_Method>;
    };


    export type ResponseImplements<T_Spec extends Spec> = {
        [K in MethodPathKey<T_Spec>]: K extends `[${infer Method}]:${infer Path}`
        ? Path extends keyof T_Spec["paths"]
        ? Method extends keyof T_Spec["paths"][Path]
        ? (
            args: ExtractApiArgs<T_Spec, T_Spec["paths"][Path], Method>
        ) => Promise<ApiResponse<T_Spec, T_Spec["paths"][Path], Method>>
        : never
        : never
        : never;
    };
    export type ResponseImplementOptions<T_Spec extends Spec> = Partial<ResponseImplements<T_Spec>>;



    // === Request Parameter Extraction Types ===

    // Type for implementing request parameter extraction from raw input
    export type RequestImplements<T_Spec extends Spec> = {
        [K in MethodPathKey<T_Spec>]: K extends `[${infer Method}]:${infer Path}`
        ? Path extends keyof T_Spec["paths"]
        ? Method extends keyof T_Spec["paths"][Path]
        ? (
            ...input: any[]  // Raw input (e.g., HTTP request object)
        ) => Promise<ApiResponse<T_Spec, T_Spec["paths"][Path], Method>>
        // ) => Promise<ExtractApiArgs<T_Spec, T_Spec["paths"][Path], Method>>
        : never
        : never
        : never;
    };
    export type RequestImplementOptions<T_Spec extends Spec> = Partial<RequestImplements<T_Spec>>;

    // === Server-side Implementation Types ===

    // Extract request body content types
    export type ExtractRequestContentTypes<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
        GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly requestBody: { readonly content: infer Content } }
        ? Content extends Record<string, any>
        ? keyof Content
        : never
        : never;

    // Extract request body type for specific content-type
    export type ExtractRequestBodyType<T_Spec extends Spec, T_PathSpec, T_Method, T_ContentType extends string> =
        GetOperation<T_PathSpec, T_Method> extends { readonly requestBody: { readonly content: infer Content } }
        ? Content extends Record<string, any>
        ? T_ContentType extends keyof Content
        ? Content[T_ContentType] extends { readonly schema: infer S_raw }
        ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
        : any
        : never
        : never
        : never;

    // Extract response type for specific content-type and status code
    export type ExtractResponseType<T_Spec extends Spec, T_PathSpec, T_Method, T_StatusCode extends string, T_ContentType extends string> =
        GetOperation<T_PathSpec, T_Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? T_StatusCode extends keyof R
        ? R[T_StatusCode] extends { readonly content: infer Content }
        ? Content extends Record<string, any>
        ? T_ContentType extends keyof Content
        ? Content[T_ContentType] extends { readonly schema: infer S_raw }
        ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
        : any
        : never
        : void
        : void
        : never
        : never
        : never;

    // 서버 구현을 위한 간단한 타입들
    export type ServerMethodKey<T_Method extends string, T_ReqContentType extends string, T_Path extends string> =
        `[${T_Method}:${T_ReqContentType}]:${T_Path}`;

    // 모든 응답 content-type의 union 타입 추출
    export type ExtractAllResponseTypes<T_Spec extends Spec, T_PathSpec, T_Method> =
        GetOperation<T_PathSpec, T_Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? {
            [StatusCode in keyof R]: R[StatusCode] extends { readonly content: infer Content }
            ? Content extends Record<string, any>
            ? {
                [ContentType in keyof Content]: Content[ContentType] extends { readonly schema: infer S_raw }
                ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
                : any;
            }[keyof Content]
            : void
            : void;
        }[keyof R]
        : never
        : never;

    // 실용적인 자동 타입 생성 접근법

    // 메서드 시그니처 힌트 타입들
    export type PathMethodSignatures<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"]> = {
        [Method in keyof T_Spec["paths"][T_Path]]: Method extends "get" | "post" | "put" | "delete"
        ? GetOperation<T_Spec["paths"][T_Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
        ? ReqContent extends Record<string, any>
        ? {
            [ReqContentType in keyof ReqContent]: `[${Method}:${string & ReqContentType}]:${string & T_Path}`
        }[keyof ReqContent]
        : never
        : `[${Method}:void]:${string & T_Path}`
        : never;
    }[keyof T_Spec["paths"][T_Path]];

    // 모든 경로의 메서드 시그니처들
    export type AllMethodSignatures<T_Spec extends Spec> = {
        [Path in keyof T_Spec["paths"]]: PathMethodSignatures<T_Spec, Path>
    }[keyof T_Spec["paths"]];

    // 타입 힌트 헬퍼들
    export type GetMethodSignatures<T_Spec extends Spec> = AllMethodSignatures<T_Spec>;
    export type GetPathMethodSignatures<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"]> = PathMethodSignatures<T_Spec, T_Path>;

    // 구체적인 메서드 시그니처 생성을 위한 타입들
    export type GenerateServerMethods<T_Spec extends Spec> = {
        [Path in keyof T_Spec["paths"]]: {
            [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
            ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
            ? ReqContent extends Record<string, any>
            ? {
                [ReqContentType in keyof ReqContent]: {
                    [K in `[${Method}:${string & ReqContentType}]:${string & Path}`]: (
                        body: ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, string & ReqContentType>
                    ) => Promise<ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
                }
            }[keyof ReqContent]
            : never
            : {
                [K in `[${Method}:void]:${string & Path}`]: () => Promise<ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
            }
            : never;
        }[keyof T_Spec["paths"][Path]]
    }[keyof T_Spec["paths"]];

    // 단일 경로 메서드 생성
    export type GeneratePathMethods<T_PathSpec, T_Spec extends Spec, T_Path extends string> = {
        [Method in keyof T_PathSpec]: Method extends "get" | "post" | "put" | "delete"
        ? GetOperation<T_PathSpec, Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
        ? ReqContent extends Record<string, any>
        ? {
            [ReqContentType in keyof ReqContent]: {
                [K in `[${Method}:${string & ReqContentType}]:${T_Path}`]: (
                    body: ExtractRequestBodyType<T_Spec, T_PathSpec, Method, string & ReqContentType>
                ) => Promise<ExtractAllResponseTypes<T_Spec, T_PathSpec, Method>>
            }
        }[keyof ReqContent]
        : never
        : {
            [K in `[${Method}:void]:${T_Path}`]: () => Promise<ExtractAllResponseTypes<T_Spec, T_PathSpec, Method>>
        }
        : never;
    }[keyof T_PathSpec];

    // 실제 구현 가능한 타입들
    export type OpenApiImplements<T_Spec extends Spec> = GenerateServerMethods<T_Spec>;
    export type OpenApiPathImplements<T_PathSpec, T_Spec extends Spec = any, T_Path extends string = string> = GeneratePathMethods<T_PathSpec, T_Spec, T_Path>;

    // 동적 메서드 생성 방식 - 런타임에 메서드 자동 생성!

    // 단계별 개선된 서버 구현 함수 - 타입 추론 지원
    // 통일된 핸들러 매개변수 타입
    export type UnifiedHandlerArgs<T_Spec extends Spec, T_PathSpec, T_Method> = {
        parameters: ExtractApiArgs<T_Spec, T_PathSpec, T_Method> extends { path?: infer P; query?: infer Q; header?: infer H }
            ? {
                path: P extends undefined ? {} : P;
                query: Q extends undefined ? {} : Q;
                header: H extends undefined ? {} : H;
            }
            : {
                path: {};
                query: {};
                header: {};
            };
        body: ExtractApiArgs<T_Spec, T_PathSpec, T_Method> extends { body: infer B }
            ? B extends { data: infer BodyData }
                ? BodyData
                : never
            : undefined;
    };

    export function createServerImplementation<const T_Spec extends Spec>(
        spec: T_Spec,
        handlers: {
            [Path in keyof T_Spec["paths"]]: {
                [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
                    ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
                        ? ReqContent extends Record<string, any>
                            ? {
                                [ReqContentType in keyof ReqContent]: (
                                    args: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>
                                ) => Promise<ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
                            }
                            : never
                        : (
                            args: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>
                        ) => Promise<ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
                    : never;
            }
        }
    ) {
        const server = {} as any;

        // 동적으로 메서드 생성
        const typedPaths = spec.paths as { [K in keyof T_Spec["paths"]]: T_Spec["paths"][K] };
        for (const pathKey in typedPaths) {
            if (Object.prototype.hasOwnProperty.call(typedPaths, pathKey)) {
                const path = pathKey as keyof T_Spec["paths"];
                const pathSpec = typedPaths[path];

                for (const methodKey in pathSpec) {
                    if (Object.prototype.hasOwnProperty.call(pathSpec, methodKey)) {
                        const method = methodKey as keyof typeof pathSpec;
                        const operation = pathSpec[method];

                        if (operation && typeof operation === 'object') {
                            // requestBody가 있는 경우
                            if ('requestBody' in operation && operation.requestBody) {
                                const requestBody = operation.requestBody as any;
                                if (requestBody.content) {
                                    for (const contentType in requestBody.content) {
                                        const methodSignature = `[${String(method)}:${contentType}]:${String(path)}`;
                                        const handler = handlers[path]?.[method]?.[contentType as keyof any];
                                        if (handler) {
                                            server[methodSignature] = handler;
                                        }
                                    }
                                }
                            } else {
                                // requestBody가 없는 경우 (GET 등)
                                const methodSignature = `[${String(method)}:void]:${String(path)}`;
                                const handler = handlers[path]?.[method];
                                if (handler) {
                                    server[methodSignature] = handler;
                                }
                            }
                        }
                    }
                }
            }
        }

        return server as GenerateServerMethods<T_Spec>;
    }

    // 더 간단한 빌더 패턴 (기존 방식 유지)
    export function createServer<const T_Spec extends Spec>(spec: T_Spec) {
        type ServerMethods = GenerateServerMethods<T_Spec>;

        return {
            implement<T extends ServerMethods>(implementation: T): T {
                return implementation;
            },

            // 타입 힌트를 위한 헬퍼
            getMethodSignatures(): ServerMethods {
                return {} as ServerMethods;
            }
        };
    }

    // 기존 클래스 방식도 유지 (하위 호환성)
    export abstract class ServerBase<const T_Spec extends Spec> {
        [methodSignature: string]: (...args: any[]) => Promise<any>;
        constructor() { }
    }

    export abstract class PathServerBase<const T_PathSpec, const T_Spec extends Spec = any> {
        [methodSignature: string]: (...args: any[]) => Promise<any>;
        constructor() { }
    }



    // @ts-ignore
    // implements OpenApiRequestImplementOptions<T_Spec>
    // export export abstract class Provider<const T_Spec extends OpenApi.Spec> implements OpenApiRequestImplementOptions<T_Spec> {
    /**
     * open api spect as const type!!
     */
    // export abstract class Fetcher<const T_Spec extends OpenApi.Spec> {
    //     constructor(private option?: { defaultServerUrl?: string, before?: () => void, completed?: () => void, error?: (e: any) => void, finally?: () => void, executor?: (url: string, requestInit: RequestInit) => Promise<Response> }) {
    //     }
    //
    //     // 오버로드 1: accept가 없는 경우
    //     async fetch<const T_Path extends keyof T_Spec["paths"], const T_Method extends keyof T_Spec["paths"][T_Path]>
    //         (target: ApiTarget<T_Spec, T_Path, T_Method>, args: ExtractApiArgs<T_Spec, T_Spec["paths"][T_Path], T_Method>): Promise<ApiResponse<T_Spec, T_Spec["paths"][T_Path], T_Method>>;
    //
    //     // 오버로드 2: accept가 있는 경우 - 특정 content-type으로 응답 타입 제한
    //     async fetch<const T_Path extends keyof T_Spec["paths"], const T_Method extends keyof T_Spec["paths"][T_Path], const T_Accept extends string>
    //         (target: ApiTarget<T_Spec, T_Path, T_Method> & { responseContentType: T_Accept }, args: ExtractApiArgs<T_Spec, T_Spec["paths"][T_Path], T_Method>): Promise<ApiResponseWithAccept<T_Spec, T_Spec["paths"][T_Path], T_Method, T_Accept>>;
    //
    //     // 실제 구현
    //     async fetch<const T_Path extends keyof T_Spec["paths"], const T_Method extends keyof T_Spec["paths"][T_Path]>
    //         (target: ApiTarget<T_Spec, T_Path, T_Method> & { responseContentType?: string }, args: ExtractApiArgs<T_Spec, T_Spec["paths"][T_Path], T_Method>): Promise<any> {
    //
    //         // Call optional fetching callback
    //         this.option?.before?.();
    //
    //         // Build base URL with server selection
    //         let baseUrl = '';
    //         if (target.serverUrl) {
    //             baseUrl = target.serverUrl;
    //         } else if (this.option?.defaultServerUrl) {
    //             // Use first server as default
    //             baseUrl = this.option?.defaultServerUrl;
    //         }
    //
    //         // Build URL with path parameters
    //         let url = baseUrl + String(target.path);
    //         if (args?.path) {
    //             Object.entries(args.path).forEach(([key, value]) => {
    //                 url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    //             });
    //         }
    //
    //         // Build query string
    //         const searchParams = new URLSearchParams();
    //         if (args?.query) {
    //             Object.entries(args.query).forEach(([key, value]) => {
    //                 if (value !== undefined && value !== null) {
    //                     searchParams.append(key, String(value));
    //                 }
    //             });
    //         }
    //
    //         if (searchParams.toString()) {
    //             url += `?${searchParams.toString()}`;
    //         }
    //
    //         // Build headers
    //         const headers: Record<string, string> = {};
    //
    //         // Add Accept header if specified
    //         if (target.responseContentType) {
    //             headers['Accept'] = target.responseContentType;
    //         }
    //
    //         // Add user-provided headers first
    //         if (args?.header) {
    //             Object.entries(args.header).forEach(([key, value]) => {
    //                 if (value !== undefined && value !== null) {
    //                     headers[key] = String(value);
    //                 }
    //             });
    //         }
    //
    //         // Build fetch options
    //         const fetchOptions: RequestInit = {
    //             method: String(target.method).toUpperCase(),
    //             headers,
    //         };
    //
    //         // Handle body with content type selection
    //         if (args?.body && ['post', 'put', 'patch'].includes(String(target.method).toLowerCase())) {
    //             const bodyData = args.body as { type: string; data: any };
    //
    //             // Set Content-Type from body.type
    //             if (bodyData.type) {
    //                 headers['Content-Type'] = bodyData.type;
    //             } else {
    //                 // Fallback to default JSON if no type specified
    //                 headers['Content-Type'] = 'application/json';
    //             }
    //
    //             // Serialize body based on content type
    //             const contentType = headers['Content-Type'];
    //
    //             if (contentType.includes('application/json')) {
    //                 fetchOptions.body = JSON.stringify(bodyData.data || bodyData);
    //             } else if (contentType.includes('application/x-www-form-urlencoded')) {
    //                 const formData = new URLSearchParams();
    //                 const dataToProcess = bodyData.data || bodyData;
    //                 Object.entries(dataToProcess as Record<string, any>).forEach(([key, value]) => {
    //                     if (value !== undefined && value !== null) {
    //                         formData.append(key, String(value));
    //                     }
    //                 });
    //                 fetchOptions.body = formData.toString();
    //             } else if (contentType.includes('multipart/form-data')) {
    //                 const formData = new FormData();
    //                 const dataToProcess = bodyData.data || bodyData;
    //                 Object.entries(dataToProcess as Record<string, any>).forEach(([key, value]) => {
    //                     if (value !== undefined && value !== null) {
    //                         if (value instanceof File || value instanceof Blob) {
    //                             formData.append(key, value);
    //                         } else {
    //                             formData.append(key, String(value));
    //                         }
    //                     }
    //                 });
    //                 fetchOptions.body = formData;
    //                 // Remove Content-Type header for FormData (browser sets it automatically with boundary)
    //                 delete headers['Content-Type'];
    //             } else {
    //                 // For other content types, assume string body
    //                 fetchOptions.body = String(bodyData.data || bodyData);
    //             }
    //         }
    //
    //         try {
    //             console.log(`🚀 Fetching: ${fetchOptions.method} ${url}`);
    //             console.log(`📋 Headers:`, headers);
    //             if (fetchOptions.body) {
    //                 console.log(`📦 Body:`, fetchOptions.body);
    //             }
    //
    //             const response = await fetch(url, fetchOptions);
    //
    //             console.log(`📡 Response Status: ${response.status}`);
    //
    //             // Handle different response types
    //             let data: any;
    //             const contentType = response.headers.get('content-type');
    //
    //             if (response.status === 204 || response.status === 304) {
    //                 // No content responses
    //                 data = undefined;
    //             } else if (contentType?.includes('application/json')) {
    //                 // JSON responses
    //                 const text = await response.text();
    //                 data = text ? JSON.parse(text) : undefined;
    //             } else {
    //                 // Other content types
    //                 data = await response.text();
    //             }
    //
    //             // Build typed response
    //             const apiResponse = {
    //                 status: String(response.status) as any,
    //                 data: data
    //             } as any;
    //
    //             console.log(`✅ Response:`, apiResponse);
    //
    //             if (!response.ok) {
    //                 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    //             }
    //
    //             this.option?.completed();
    //
    //             return apiResponse;
    //
    //         } catch (error) {
    //             console.error(`❌ Fetch Error:`, error);
    //             this.option?.error?.(error);
    //             throw error;
    //         }
    //     }
    //
    // }

    // === 🎯 Simple Fetcher Interface ===

    // Fetcher 옵션 타입
    export interface FetcherOptions {
        defaultServerUrl?: string;
        before?: () => void;
        completed?: () => void;
        error?: (e: any) => void;
        finally?: () => void;
        executor?: (url: string, requestInit: RequestInit) => Promise<Response>;
    }

    // Fetcher 타겟 타입 (createSimpleServer와 유사)
    export type FetcherTarget<T_Spec extends Spec> = {
        [Path in keyof T_Spec["paths"]]: {
            [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
            ? {
                path: Path;
                method: Method;
                serverUrl?: ExtractServerUrls<T_Spec>;
                responseContentType?: ExtractResponseContentTypes<T_Spec, Path, Method> & string;
            }
            : never;
        }[keyof T_Spec["paths"][Path]]
    }[keyof T_Spec["paths"]];

    // 단순한 응답 데이터 타입 추출
    type ExtractSimpleResponseData<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path], T_ResponseContentType extends string> =
        GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? {
            [StatusCode in keyof R]: StatusCode extends SuccessStatusCode
            ? R[StatusCode] extends { readonly content: infer Content }
            ? Content extends Record<string, any>
            ? T_ResponseContentType extends keyof Content
            ? Content[T_ResponseContentType] extends { readonly schema: infer S_raw }
            ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
            : any
            : never
            : void
            : void
            : never;
        }[keyof R]
        : never
        : never;

    // 모든 성공 상태 코드의 응답 데이터 union 타입
    type ExtractAllResponseData<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
        GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? {
            [StatusCode in keyof R]: StatusCode extends SuccessStatusCode
            ? R[StatusCode] extends { readonly content: infer Content }
            ? Content extends Record<string, any>
            ? {
                [ContentType in keyof Content]: Content[ContentType] extends { readonly schema: infer S_raw }
                ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
                : any;
            }[keyof Content]
            : void
            : void
            : never;
        }[keyof R]
        : never
        : never;

    // Fetcher 함수 타입 (단순한 데이터만 반환)
    export type TypedFetcher<T_Spec extends Spec> = {
        <T_Target extends FetcherTarget<T_Spec>>(
            target: T_Target,
            args: ExtractApiArgs<T_Spec, T_Spec["paths"][T_Target["path"]], T_Target["method"]> & {
                options?: FetcherOptions;
            }
        ): Promise<T_Target extends { responseContentType: infer ResContentType }
            ? ResContentType extends string
            ? ExtractSimpleResponseData<T_Spec, T_Target["path"], T_Target["method"], ResContentType>
            : ExtractAllResponseData<T_Spec, T_Target["path"], T_Target["method"]>
            : ExtractAllResponseData<T_Spec, T_Target["path"], T_Target["method"]>
        >;
    };


    // === 🎯 Simplified Server Interface ===
    
    // Path parameter 추출 타입
    export type ExtractPathParams<T_Path> = T_Path extends `${string}{${infer Param}}${infer Rest}`
        ? { [K in Param]: string | number } & ExtractPathParams<Rest>
        : {};

    // 서버 호출 매개변수 타입
    export type ServerCallParams<T_Spec extends Spec> = {
        [Path in keyof T_Spec["paths"]]: {
            [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
                ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
                    ? ReqContent extends Record<string, any>
                        ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: { readonly "200": { readonly content: infer ResContent } } }
                            ? ResContent extends Record<string, any>
                                ? {
                                    [ReqContentType in keyof ReqContent]: {
                                        [ResContentType in keyof ResContent]: {
                                            path: Path;
                                            method: Method;
                                            contentType: ReqContentType;
                                            accept: ResContentType;
                                        } & ExtractPathParams<Path>
                                    }
                                }[keyof ReqContent][keyof ResContent]
                                : never
                            : never
                        : never
                    : {
                        path: Path;
                        method: Method;
                        contentType?: never;
                        accept?: string;
                    } & ExtractPathParams<Path>
                : never;
        }
    }[keyof T_Spec["paths"]][keyof T_Spec["paths"][keyof T_Spec["paths"]]];

    // 간단한 서버 함수 타입
    export type SimplifiedServer<T_Spec extends Spec> = {
        <T_Params extends ServerCallParams<T_Spec>>(
            params: T_Params,
            ...args: T_Params extends { contentType: string }
                ? [body: any]
                : []
        ): Promise<any>;
    };

    // 🚀 간단하고 직관적인 서버 구현 함수
    export function createSimplifiedServer<const T_Spec extends Spec>(
        spec: T_Spec,
        handlers: {
            [Path in keyof T_Spec["paths"]]: {
                [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
                    ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
                        ? ReqContent extends Record<string, any>
                            ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: { readonly "200": { readonly content: infer ResContent } } }
                                ? ResContent extends Record<string, any>
                                    ? {
                                        [ReqContentType in keyof ReqContent]: {
                                            [ResContentType in keyof ResContent]: (
                                                args: {
                                                    parameters: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>["parameters"];
                                                    body: ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, string & ReqContentType>;
                                                    accept: ResContentType;
                                                }
                                            ) => Promise<ExtractResponseType<T_Spec, T_Spec["paths"][Path], Method, "200", string & ResContentType>>
                                        }
                                    }
                                    : never
                                : never
                            : never
                        : (
                            args: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>
                        ) => Promise<ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>>
                    : never;
            }
        }
    ): SimplifiedServer<T_Spec> {
        
        // 핸들러 맵 생성
        const handlerMap = new Map<string, Function>();
        
        // 동적으로 핸들러 맵 구성
        const typedPaths = spec.paths as { [K in keyof T_Spec["paths"]]: T_Spec["paths"][K] };
        for (const pathKey in typedPaths) {
            if (Object.prototype.hasOwnProperty.call(typedPaths, pathKey)) {
                const path = pathKey as keyof T_Spec["paths"];
                const pathSpec = typedPaths[path];
                
                for (const methodKey in pathSpec) {
                    if (Object.prototype.hasOwnProperty.call(pathSpec, methodKey)) {
                        const method = methodKey as keyof typeof pathSpec;
                        const operation = pathSpec[method];
                        
                        if (operation && typeof operation === 'object') {
                            const hasRequestBody = 'requestBody' in operation && operation.requestBody;
                            const responses = (operation as any).responses;
                            const response200 = responses?.['200'];
                            const hasMultipleResponseTypes = response200?.content && 
                                typeof response200.content === 'object' &&
                                Object.keys(response200.content).length > 1;
                            
                            if (hasRequestBody && hasMultipleResponseTypes) {
                                // 매트릭스 구조
                                const requestBody = operation.requestBody as any;
                                const responseContent = response200?.content;
                                
                                if (requestBody.content && responseContent) {
                                    for (const reqContentType in requestBody.content) {
                                        for (const resContentType in responseContent) {
                                            const key = `${String(path)}:${String(method)}:${reqContentType}:${resContentType}`;
                                            const handler = handlers[path]?.[method]?.[reqContentType as keyof any]?.[resContentType as keyof any];
                                            if (handler) {
                                                handlerMap.set(key, handler);
                                            }
                                        }
                                    }
                                }
                            } else if (hasRequestBody) {
                                // 단일 응답 타입
                                const requestBody = operation.requestBody as any;
                                if (requestBody.content) {
                                    for (const contentType in requestBody.content) {
                                        const key = `${String(path)}:${String(method)}:${contentType}`;
                                        const handler = handlers[path]?.[method]?.[contentType as keyof any];
                                        if (handler) {
                                            handlerMap.set(key, handler);
                                        }
                                    }
                                }
                            } else {
                                // parameter만 있는 경우
                                const key = `${String(path)}:${String(method)}`;
                                const handler = handlers[path]?.[method];
                                if (handler && typeof handler === 'function') {
                                    handlerMap.set(key, handler);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // 🎯 간단한 서버 함수 반환
        return async function server(params: any, body?: any) {
            const { path, method, contentType, accept, ...pathParams } = params;
            
            // 핸들러 키 생성
            let key: string;
            if (contentType && accept) {
                key = `${path}:${method}:${contentType}:${accept}`;
            } else if (contentType) {
                key = `${path}:${method}:${contentType}`;
            } else {
                key = `${path}:${method}`;
            }
            
            const handler = handlerMap.get(key);
            if (!handler) {
                throw new Error(`Handler not found for: ${key}`);
            }
            
            // 매개변수 구성
            const args = {
                parameters: {
                    path: pathParams,
                    query: {},
                    header: {}
                },
                body,
                accept
            };
            
            return await handler(args);
        } as SimplifiedServer<T_Spec>;
    }

    // === 🎯 Advanced Simple Server Interface ===

    // Path에 따른 가능한 Method 추출
    type ExtractMethods<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"]> =
        keyof T_Spec["paths"][T_Path] & ("get" | "post" | "put" | "delete");

    // 특정 Path와 Method에서 가능한 Request Content-Type 추출
    type ExtractRequestContentTypesAdvanced<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
        GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly requestBody: { readonly content: infer Content } }
        ? Content extends Record<string, any>
        ? keyof Content
        : never
        : never;

    // 특정 Path와 Method에서 가능한 Response Content-Type 추출 (모든 성공 상태 코드 지원)
    type ExtractResponseContentTypesAdvanced<T_Spec extends Spec, T_Path extends keyof T_Spec["paths"], T_Method extends keyof T_Spec["paths"][T_Path]> =
        GetOperation<T_Spec["paths"][T_Path], T_Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? {
            [StatusCode in keyof R]: StatusCode extends SuccessStatusCode
            ? R[StatusCode] extends { readonly content: infer Content }
            ? Content extends Record<string, any>
            ? keyof Content & string  // string으로 제한
            : never
            : never
            : never;
        }[keyof R]
        : never
        : never;

    // Path, Method, Content-Type 조합 타입
    export type PathMethodContentTypePair<T_Spec extends Spec> = {
        [Path in keyof T_Spec["paths"]]: {
            [Method in ExtractMethods<T_Spec, Path>]:
            // requestBody가 있는 경우
            ExtractRequestContentTypesAdvanced<T_Spec, Path, Method> extends never
            ? {
                // requestBody 없음 (GET 등)
                path: Path;
                method: Method;
                requestContentType?: never;
                responseContentType: ExtractResponseContentTypesAdvanced<T_Spec, Path, Method>;
            }
            : {
                // requestBody 있음 (POST 등)
                path: Path;
                method: Method;
                requestContentType: ExtractRequestContentTypesAdvanced<T_Spec, Path, Method>;
                responseContentType: ExtractResponseContentTypesAdvanced<T_Spec, Path, Method>;
            }
        }[ExtractMethods<T_Spec, Path>]
    }[keyof T_Spec["paths"]];

    // Body 타입 추론
    type ExtractBodyTypeAdvanced<T_Spec extends Spec, T_Target> =
        T_Target extends { path: infer Path; method: infer Method; requestContentType: infer ReqContentType }
        ? Path extends keyof T_Spec["paths"]
        ? Method extends keyof T_Spec["paths"][Path]
        ? ReqContentType extends string
        ? ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, ReqContentType>
        : undefined
        : never
        : never
        : undefined;

    // Path Parameters 타입 추론
    type ExtractPathParamsTypeAdvanced<T_Spec extends Spec, T_Target> =
        T_Target extends { path: infer Path }
        ? Path extends keyof T_Spec["paths"]
        ? ExtractPathParams<Path>
        : {}
        : {};

    // Query Parameters 타입 추론
    type ExtractQueryParamsTypeAdvanced<T_Spec extends Spec, T_Target> =
        T_Target extends { path: infer Path; method: infer Method }
        ? Path extends keyof T_Spec["paths"]
        ? Method extends keyof T_Spec["paths"][Path]
        ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly parameters?: infer P_raw extends readonly any[] }
        ? ((resolved: ResolveParams<P_raw, T_Spec>) => void) extends (p: infer P extends readonly any[]) => void
        ? {
            [Param in Extract<P[number], { readonly in: "query" }> as Param["name"]]?:
            SchemaToTsType<Param["schema"], T_Spec>
        }
        : {}
        : {}
        : {}
        : {}
        : {};

    // Header Parameters 타입 추론
    type ExtractHeaderParamsTypeAdvanced<T_Spec extends Spec, T_Target> =
        T_Target extends { path: infer Path; method: infer Method }
        ? Path extends keyof T_Spec["paths"]
        ? Method extends keyof T_Spec["paths"][Path]
        ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly parameters?: infer P_raw extends readonly any[] }
        ? ((resolved: ResolveParams<P_raw, T_Spec>) => void) extends (p: infer P extends readonly any[]) => void
        ? {
            [Param in Extract<P[number], { readonly in: "header"; readonly required: true }> as Param["name"]]:
            SchemaToTsType<Param["schema"], T_Spec>
        } & {
            [Param in Extract<P[number], { readonly in: "header"; readonly required?: false | undefined }> as Param["name"]]?:
            SchemaToTsType<Param["schema"], T_Spec>
        }
        : {}
        : {}
        : {}
        : {}
        : {};

    // Response 타입 추론 (모든 성공 상태 코드 지원)
    type ExtractResponseTypeFromTarget<T_Spec extends Spec, T_Target> =
        T_Target extends { path: infer Path; method: infer Method; responseContentType: infer ResContentType }
        ? Path extends keyof T_Spec["paths"]
        ? Method extends keyof T_Spec["paths"][Path]
        ? ResContentType extends string
        ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly responses: infer R }
        ? R extends Record<string, any>
        ? {
            [StatusCode in keyof R]: StatusCode extends SuccessStatusCode
            ? R[StatusCode] extends { readonly content: infer Content }
            ? Content extends Record<string, any>
            ? ResContentType extends keyof Content
            ? Content[ResContentType] extends { readonly schema: infer S_raw }
            ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
            : any
            : never
            : void
            : void
            : never;
        }[keyof R]
        : never
        : never
        : ExtractAllResponseTypes<T_Spec, T_Spec["paths"][Path], Method>
        : never
        : never
        : any;

    // 완전한 타입 추론이 되는 서버 함수 타입
    export type TypedSimpleServer<T_Spec extends Spec> = {
        // 오버로드 1: requestContentType이 있는 경우 (POST 등)
        <T_Target extends PathMethodContentTypePair<T_Spec> & { requestContentType: string }>(
            target: T_Target,
            args: {
                parameters: {
                    path: ExtractPathParamsTypeAdvanced<T_Spec, T_Target>;
                    query?: ExtractQueryParamsTypeAdvanced<T_Spec, T_Target>;  // 🎯 정확한 query 타입 추론!
                    header?: ExtractHeaderParamsTypeAdvanced<T_Spec, T_Target>; // 🎯 정확한 header 타입 추론!
                };
                body: ExtractBodyTypeAdvanced<T_Spec, T_Target>;  // 🎯 정확한 body 타입 추론!
            }
        ): Promise<ExtractResponseTypeFromTarget<T_Spec, T_Target>>;

        // 오버로드 2: requestContentType이 없는 경우 (GET 등)
        <T_Target extends PathMethodContentTypePair<T_Spec> & { requestContentType?: never }>(
            target: T_Target,
            args: {
                parameters: {
                    path: ExtractPathParamsTypeAdvanced<T_Spec, T_Target>;
                    query?: ExtractQueryParamsTypeAdvanced<T_Spec, T_Target>;  // 🎯 정확한 query 타입 추론!
                    header?: ExtractHeaderParamsTypeAdvanced<T_Spec, T_Target>; // 🎯 정확한 header 타입 추론!
                };
                body?: undefined;
            }
        ): Promise<ExtractResponseTypeFromTarget<T_Spec, T_Target>>;
    };

    // 🚀 타입 추론이 되는 서버 구현 함수 (실용적 버전)
    export function createProvider<const T_Spec extends Spec>(
        spec: T_Spec,
        handlers: {
            [Path in keyof T_Spec["paths"]]: {
                [Method in keyof T_Spec["paths"][Path]]: Method extends "get" | "post" | "put" | "delete"
                ? GetOperation<T_Spec["paths"][Path], Method> extends { readonly requestBody: { readonly content: infer ReqContent } }
                ? ReqContent extends Record<string, any>
                ? {
                    [ReqContentType in keyof ReqContent]: {
                        [ResContentType in string]: (
                            args: {
                                parameters: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>["parameters"];
                                body: ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, string & ReqContentType>;
                                accept: ResContentType;
                            }
                        ) => Promise<any>
                    } | ((
                        args: {
                            parameters: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>["parameters"];
                            body: ExtractRequestBodyType<T_Spec, T_Spec["paths"][Path], Method, string & ReqContentType>;
                        }
                    ) => Promise<any>)
                }
                : never
                : ExtractResponseContentTypesAdvanced<T_Spec, Path, Method> extends never
                ? ((
                    args: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>
                ) => Promise<any>)
                : {
                    'void': {
                        [ResContentType in ExtractResponseContentTypesAdvanced<T_Spec, Path, Method> & string]: (
                            args: {
                                parameters: UnifiedHandlerArgs<T_Spec, T_Spec["paths"][Path], Method>["parameters"];
                                body: undefined;
                                accept: ResContentType;
                            }
                        ) => Promise<any>
                    }
                }
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

    // 🚀 타입 추론이 되는 Fetcher 구현 함수
    export function createFetcher<const T_Spec extends Spec>(
        spec: T_Spec,
        defaultOptions?: FetcherOptions
    ): TypedFetcher<T_Spec> {

        return async function fetcher(target: any, args: any) {
            const { path, method, serverUrl, responseContentType } = target;
            const { options, ...apiArgs } = args;

            // 옵션 병합 (args.options가 우선)
            const mergedOptions: FetcherOptions = {
                ...defaultOptions,
                ...options
            };

            // Call optional fetching callback
            mergedOptions.before?.();

            try {
                // Build base URL with server selection
                let baseUrl = '';
                if (serverUrl) {
                    baseUrl = serverUrl;
                } else if (mergedOptions.defaultServerUrl) {
                    baseUrl = mergedOptions.defaultServerUrl;
                }

                // Build URL with path parameters
                let url = baseUrl + String(path);
                if (apiArgs?.path) {
                    Object.entries(apiArgs.path).forEach(([key, value]) => {
                        url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
                    });
                }

                // Build query string
                const searchParams = new URLSearchParams();
                if (apiArgs?.query) {
                    Object.entries(apiArgs.query).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            searchParams.append(key, String(value));
                        }
                    });
                }

                if (searchParams.toString()) {
                    url += `?${searchParams.toString()}`;
                }

                // Build headers
                const headers: Record<string, string> = {};

                // Add Accept header if specified
                if (responseContentType) {
                    headers['Accept'] = responseContentType;
                }

                // Add user-provided headers
                if (apiArgs?.header) {
                    Object.entries(apiArgs.header).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            headers[key] = String(value);
                        }
                    });
                }

                // Build fetch options
                const fetchOptions: RequestInit = {
                    method: String(method).toUpperCase(),
                    headers,
                };

                // Handle body with content type selection
                if (apiArgs?.body && ['post', 'put', 'patch'].includes(String(method).toLowerCase())) {
                    const bodyData = apiArgs.body as { type: string; data: any };

                    // Set Content-Type from body.type
                    if (bodyData.type) {
                        headers['Content-Type'] = bodyData.type;
                    } else {
                        // Fallback to default JSON if no type specified
                        headers['Content-Type'] = 'application/json';
                    }

                    // Serialize body based on content type
                    const contentType = headers['Content-Type'];

                    if (contentType.includes('application/json')) {
                        fetchOptions.body = JSON.stringify(bodyData.data || bodyData);
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
                        const formData = new URLSearchParams();
                        const dataToProcess = bodyData.data || bodyData;
                        Object.entries(dataToProcess as Record<string, any>).forEach(([key, value]) => {
                            if (value !== undefined && value !== null) {
                                formData.append(key, String(value));
                            }
                        });
                        fetchOptions.body = formData.toString();
                    } else if (contentType.includes('multipart/form-data')) {
                        const formData = new FormData();
                        const dataToProcess = bodyData.data || bodyData;
                        Object.entries(dataToProcess as Record<string, any>).forEach(([key, value]) => {
                            if (value !== undefined && value !== null) {
                                if (value instanceof File || value instanceof Blob) {
                                    formData.append(key, value);
                                } else {
                                    formData.append(key, String(value));
                                }
                            }
                        });
                        fetchOptions.body = formData;
                        // Remove Content-Type header for FormData (browser sets it automatically with boundary)
                        delete headers['Content-Type'];
                    } else {
                        // For other content types, assume string body
                        fetchOptions.body = String(bodyData.data || bodyData);
                    }
                }

                console.log(`🚀 Fetching: ${fetchOptions.method} ${url}`);
                console.log(`📋 Headers:`, headers);
                if (fetchOptions.body) {
                    console.log(`📦 Body:`, fetchOptions.body);
                }

                // Use custom executor if provided, otherwise use global fetch
                const executor = mergedOptions.executor || fetch;
                const response = await executor(url, fetchOptions);

                console.log(`📡 Response Status: ${response.status}`);

                // Handle different response types
                let data: any;
                const contentType = response.headers.get('content-type');

                if (response.status === 204 || response.status === 304) {
                    // No content responses
                    data = undefined;
                } else if (contentType?.includes('application/json')) {
                    // JSON responses
                    const text = await response.text();
                    data = text ? JSON.parse(text) : undefined;
                } else {
                    // Other content types
                    data = await response.text();
                }

                // Build typed response
                const apiResponse = {
                    status: String(response.status) as any,
                    data: data
                } as any;

                console.log(`✅ Response:`, apiResponse);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                mergedOptions.completed?.();

                // 단순히 데이터만 반환 (status 정보 제거)
                return data;

            } catch (error) {
                console.error(`❌ Fetch Error:`, error);
                mergedOptions.error?.(error);
                throw error;
            } finally {
                mergedOptions.finally?.();
            }
        } as TypedFetcher<T_Spec>;
    }

}

