// // --- 실제 API 명세 객체 ---
// import {ApiResponse, OpenApi} from "./OpenApi";
//
// const openApiSpec = {
//     openapi: "3.0.0",
//     info: {
//         title: "LazyCollect API",
//         version: "1.0.0",
//     },
//     components: {
//         schemas: {
//             User: {
//                 type: "object",
//                 properties: {
//                     id: {type: "string", description: "User ID"},
//                     name: {type: "string"},
//                     email: {type: "string", format: "email"},
//                 },
//                 required: ["id", "name"],
//             },
//             NewUser: {
//                 type: "object",
//                 properties: {
//                     name: {type: "string"},
//                     email: {type: "string", format: "email"},
//                 },
//                 required: ["name", "email"],
//             },
//             UpdateUser: {
//                 type: "object",
//                 properties: {
//                     name: {type: "string"},
//                     email: {type: "string", format: "email"},
//                 },
//             },
//         },
//         parameters: {
//             LangQueryParam: {
//                 name: "lang",
//                 in: "query",
//                 schema: {type: "string", enum: ["ko", "en", "jp"]},
//             },
//             RequestIdHeader: {
//                 name: "X-Request-ID",
//                 in: "header",
//                 required: true,
//                 schema: {type: "string", format: "uuid"},
//                 description: "A unique identifier for the request.",
//             },
//         },
//     },
//     paths: {
//         "/users/{id}": {
//             get: {
//                 parameters: [
//                     {name: "id", in: "path", required: true, schema: {type: "string"}},
//                     {"$ref": "#/components/parameters/LangQueryParam"},
//                 ],
//                 responses: {
//                     "200": {
//                         description: "A single user.",
//                         content: {
//                             "application/json": {
//                                 schema: {"$ref": "#/components/schemas/User"},
//                             },
//                         },
//                     },
//                 },
//             },
//             delete: {
//                 summary: "Delete a user",
//                 parameters: [
//                     {name: "id", in: "path", required: true, schema: {type: "string"}},
//                     {
//                         name: "Authorization",
//                         in: "header",
//                         required: true,
//                         schema: {type: "string"},
//                         description: "Bearer token for authentication",
//                     },
//                 ],
//                 responses: {
//                     "204": {
//                         description: "User deleted successfully",
//                     },
//                 },
//             },
//         },
//         "/users": {
//             post: {
//                 summary: "Create a new user",
//                 requestBody: {
//                     required: true,
//                     content: {
//                         "application/json": {
//                             schema: {
//                                 "$ref": "#/components/schemas/NewUser",
//                             },
//                         },
//                         "application/json+2": {
//                             schema: {
//                                 "$ref": "#/components/schemas/User",
//                             },
//                         },
//                     },
//                 },
//                 responses: {
//                     "201": {
//                         description: "User created successfully",
//                         content: {
//                             "application/json": {
//                                 schema: {"$ref": "#/components/schemas/User"},
//                             },
//                         },
//                     },
//                 },
//             },
//         },
//         "/users/{id}/profile": {
//             put: {
//                 summary: "Update a user's profile",
//                 parameters: [
//                     {name: "id", in: "path", required: true, schema: {type: "string"}},
//                     {"$ref": "#/components/parameters/RequestIdHeader"},
//                 ],
//                 requestBody: {
//                     required: true,
//                     content: {
//                         "application/json": {
//                             schema: {"$ref": "#/components/schemas/UpdateUser"},
//                         },
//                     },
//                 },
//                 responses: {
//                     "200": {
//                         description: "Profile updated successfully",
//                         content: {
//                             "application/json": {
//                                 schema: {"$ref": "#/components/schemas/User"},
//                             },
//                         },
//                     },
//                 },
//             },
//         },
//     },
// } satisfies OpenApi.Spec;
// type UserSpec = typeof openApiSpec;
//
// class TT extends OpenApi.Request<UserSpec> {
//     async "[get]:/users/{id}"(input: any): Promise<OpenApi.ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "get">> {
//         return {
//             status: "200",
//             data: {
//                 id: "a",
//                 name: "TT User",
//                 email: "e"
//             }
//         }
//     }
//     // async "[delete]:/users/{id}"(input: any): Promise<OpenApi.ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">> {
//     //     return {
//     //         path: {id: '1'}
//     //     }
//     // }
//     //
//
//     // async "[get]:/users/{id}"(input: any, a: number): Promise<OpenApi.ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "get">> {
//     //     return {
//     //         status: "200",
//     //     }
//     // }
//     //
//     // "[post]:/users"(input: any): Promise<OpenApi.ExtractApiArgs<UserSpec, UserSpec["paths"]["/users"], "post">> {
//     //     return Promise.resolve(undefined);
//     // }
//     //
//     // "[put]:/users/{id}/profile"(input: any): Promise<OpenApi.ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}/profile"], "put">> {
//     //     return Promise.resolve(undefined);
//     // }
// }
//
// // export class TTA implements OpenApi.OpenApiRequestImplementOptions<UserSpec> {
// //     async "[delete]:/users/{id}"(input: any): Promise<OpenApi.ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">> {
// //         const aa: OpenApi.ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "delete"> = {
// //             path: {id:'ss'}
// //         }
// //         return aa;
// //     }
// //
// //     // async "[delete]:/users/{id}"(input: any): Promise<ExtractApiArgs<typeof UserSpec, typeof UserSpec["paths"]["/users/{id}"], "delete">> {
// //     //     // Extract parameters from raw HTTP request input
// //     //     return {
// //     //         path: {
// //     //             id: input.params?.id || input.pathParams?.id || "default-id"
// //     //         },
// //     //         header: {
// //     //             Authorization: input.headers?.authorization || input.headers?.Authorization || "Bearer default-token"
// //     //         }
// //     //     };
// //     // }
// // }
// // new TTA();
// new TT(openApiSpec)["[get]:/users/{id}"]('', 2);
// // // --- OpenAPI 3.0 타입 정의 ---
// //
// // // @ts-ignore
// // interface ReferenceObject {
// //     readonly $ref: string;
// // }
// //
// // interface SchemaObject {
// //     readonly type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
// //     readonly properties?: Record<string, SchemaObject | ReferenceObject>;
// //     readonly required?: readonly string[];
// //     readonly enum?: readonly any[];
// //     readonly items?: SchemaObject | ReferenceObject;
// //     readonly description?: string;
// //     readonly format?: string;
// // }
// //
// // interface ParameterObject {
// //     readonly name: string;
// //     readonly in: "query" | "path" | "header" | "cookie";
// //     readonly required?: boolean;
// //     readonly schema?: SchemaObject | ReferenceObject;
// //     readonly description?: string;
// // }
// //
// // interface RequestBodyObject {
// //     readonly required?: boolean;
// //     readonly content: {
// //         readonly [mediaType: string]: {
// //             readonly schema?: SchemaObject | ReferenceObject;
// //         };
// //     };
// //     readonly description?: string;
// // }
// //
// // interface ResponseObject {
// //     readonly description: string;
// //     readonly content?: {
// //         readonly [mediaType: string]: {
// //             readonly schema?: SchemaObject | ReferenceObject;
// //         };
// //     };
// // }
// //
// // interface OperationObject {
// //     readonly summary?: string;
// //     readonly parameters?: readonly (ParameterObject | ReferenceObject)[];
// //     readonly requestBody?: RequestBodyObject | ReferenceObject;
// //     readonly responses: {
// //         readonly [statusCode: string]: ResponseObject | ReferenceObject;
// //     };
// // }
// //
// // interface PathItemObject {
// //     readonly get?: OperationObject;
// //     readonly post?: OperationObject;
// //     readonly put?: OperationObject;
// //     readonly delete?: OperationObject;
// // }
// //
// // interface ComponentsObject {
// //     readonly schemas?: Record<string, SchemaObject | ReferenceObject>;
// //     readonly parameters?: Record<string, ParameterObject | ReferenceObject>;
// //     readonly responses?: Record<string, ResponseObject | ReferenceObject>;
// //     readonly requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
// // }
// //
// // interface OpenAPI {
// //     readonly openapi: "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3";
// //     readonly info: {
// //         readonly title: string;
// //         readonly version: string;
// //     };
// //     readonly paths: Record<string, PathItemObject>;
// //     readonly components?: ComponentsObject;
// // }
// //
//
// //
// // type ResolveRef<T, T_Spec extends OpenAPI> = T extends { readonly $ref: infer R }
// //     ? R extends `#/components/schemas/${infer S}`
// //     ? T_Spec extends { readonly components: { readonly schemas: { readonly [K in S]: infer Schema } } }
// //     ? ResolveRef<Schema, T_Spec>
// //     : never
// //     : R extends `#/components/parameters/${infer P}`
// //     ? T_Spec extends { readonly components: { readonly parameters: { readonly [K in P]: infer Param } } }
// //     ? ResolveRef<Param, T_Spec>
// //     : never
// //     : never
// //     : T;
// //
// // // [최종 수정] 재귀 깊이를 제한하는 Depth 파라미터를 추가하여 무한 루프 오류를 방지합니다.
// // type SchemaToTsType<S, T_Spec extends OpenAPI, Depth extends any[] = []> = Depth["length"] extends 8
// //     ? any
// //     : S extends { readonly $ref: any }
// //     ? SchemaToTsType<ResolveRef<S, T_Spec>, T_Spec, [...Depth, any]>
// //     : S extends { readonly enum: readonly (infer E)[] }
// //     ? E
// //     : S extends { readonly type: "string" }
// //     ? string
// //     : S extends { readonly type: "number" | "integer" }
// //     ? number
// //     : S extends { readonly type: "boolean" }
// //     ? boolean
// //     : S extends { readonly type: "array"; readonly items: infer I }
// //     ? SchemaToTsType<I, T_Spec, [...Depth, any]>[]
// //     : S extends { readonly type: "object"; readonly properties?: infer P }
// //     ? {
// //         [K in (S extends { readonly required: infer R extends readonly string[] } ? R[number] : never) & keyof P]: SchemaToTsType<P[K], T_Spec, [...Depth, any]>;
// //     } & {
// //         [K in Exclude<keyof P, (S extends { readonly required: infer R extends readonly string[] } ? R[number] : never)>]?: SchemaToTsType<P[K], T_Spec, [...Depth, any]>;
// //     }
// //     : any;
// //
// // type ResolveParams<P extends readonly any[], T_Spec extends OpenAPI> = {
// //     [I in keyof P]: ResolveRef<P[I], T_Spec>;
// // };
// //
// // type GetOperation<T_PathSpec, T_Method> = T_PathSpec extends { readonly [key in T_Method & keyof T_PathSpec]: infer O }
// //     ? O
// //     : never;
// //
// // type ExtractApiArgs<T_Spec extends OpenAPI, T_PathSpec, T_Method> =
// //     (GetOperation<T_PathSpec, T_Method> extends { readonly parameters?: infer P_raw extends readonly any[] }
// //         ? ((resolved: ResolveParams<P_raw, T_Spec>) => void) extends (p: infer P extends readonly any[]) => void
// //         ? {
// //             path: {
// //                 [Param in Extract<P[number], { readonly in: "path"; readonly required: true }> as Param["name"]]:
// //                 SchemaToTsType<Param["schema"], T_Spec>
// //             } & {
// //                 [Param in Extract<P[number], { readonly in: "path"; readonly required?: false | undefined }> as Param["name"]]?:
// //                 SchemaToTsType<Param["schema"], T_Spec>
// //             };
// //             query?: {
// //                 [Param in Extract<P[number], { readonly in: "query" }> as Param["name"]]?:
// //                 SchemaToTsType<Param["schema"], T_Spec>
// //             };
// //             header?: {
// //                 [Param in Extract<P[number], { readonly in: "header"; readonly required: true }> as Param["name"]]:
// //                 SchemaToTsType<Param["schema"], T_Spec>
// //             } & {
// //                 [Param in Extract<P[number], { readonly in: "header"; readonly required?: false | undefined }> as Param["name"]]?:
// //                 SchemaToTsType<Param["schema"], T_Spec>
// //             };
// //         }
// //         : { path?: never; query?: never; header?: never }
// //         : { path?: never; query?: never; header?: never }) &
// //     (GetOperation<T_PathSpec, T_Method> extends { readonly requestBody: { readonly content: { readonly "application/json": { readonly schema: infer S_raw } } } }
// //         ? { body: SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec> }
// //         : { body?: never });
// //
// // type SuccessStatusCode = "200" | "201" | "202" | "204";
// // type ExtractSuccessResponse<R, T_Spec extends OpenAPI> = {
// //     [Code in keyof R & SuccessStatusCode]: R[Code] extends { readonly content: { readonly "application/json": { readonly schema: infer S_raw } } }
// //     ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
// //     : void;
// // }[keyof R & SuccessStatusCode];
// //
// // type ExtractResponse<T_Spec extends OpenAPI, T_PathSpec, T_Method> = GetOperation<T_PathSpec, T_Method> extends {
// //     readonly responses: infer R;
// // } ? ExtractSuccessResponse<R, T_Spec> : never;
// //
// //
// // // --- API 호출 함수 ---
// //
// // async function apiCall<
// //     const T_Spec extends OpenAPI,
// //     P extends keyof T_Spec["paths"],
// //     M extends keyof T_Spec["paths"][P]
// // >(
// //     spec: T_Spec,
// //     path: P,
// //     method: M,
// //     args: ExtractApiArgs<T_Spec, T_Spec["paths"][P], M>
// // ): Promise<ExtractResponse<T_Spec, T_Spec["paths"][P], M>> {
// //     const { path: pathParams, query: queryParams, header: headerParams, body: requestBody } = args as any;
// //
// //     const url = String(path).replace(
// //         /{([^}]+)}/g,
// //         (_, key) => (pathParams as Record<string, string>)[key]
// //     );
// //
// //     console.log(`
// // --- API Call ---`);
// //     console.log(`Making ${String(method).toUpperCase()} request to: ${url}`);
// //
// //     if (headerParams && Object.keys(headerParams).length > 0) {
// //         console.log(`With headers: ${JSON.stringify(headerParams)}`);
// //     }
// //
// //     if (queryParams && Object.keys(queryParams).length > 0) {
// //         const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
// //         console.log(`With query params: ${queryString}`);
// //     }
// //
// //     if (requestBody) {
// //         console.log(`With body: ${JSON.stringify(requestBody, null, 2)}`);
// //     }
// //
// //     return new Promise((resolve) => {
// //         let mockResponse: any;
// //         if (method === 'post') {
// //             mockResponse = {
// //                 id: `new-user-${Date.now()}`,
// //                 ...(requestBody as object)
// //             }
// //         } else if (method === 'put') {
// //             mockResponse = {
// //                 id: pathParams.id,
// //                 ...(requestBody as object)
// //             }
// //         } else if (method === 'delete') {
// //             mockResponse = undefined;
// //         } else { // get
// //             mockResponse = {
// //                 id: pathParams.id,
// //                 name: "Mock User",
// //                 email: "mock@example.com",
// //             };
// //         }
// //         console.log(`Mock response: ${JSON.stringify(mockResponse, null, 2)}`);
// //         resolve(mockResponse);
// //     });
// // }
// //
// // // --- API 클라이언트 팩토리 ---
// //
// // type ApiClient<T_Spec extends OpenAPI> = {
// //     [P in keyof T_Spec["paths"]]: {
// //         [M in keyof T_Spec["paths"][P]]: (
// //             args: ExtractApiArgs<T_Spec, T_Spec["paths"][P], M>
// //         ) => Promise<ExtractResponse<T_Spec, T_Spec["paths"][P], M>>;
// //     };
// // };
// //
// // // Helper type to extract literal keys from an object type
// // type LiteralKeys<T> = {
// //     [K in keyof T]: K;
// // }[keyof T];
// //
// // function createApiCall<const T_Spec extends OpenAPI>(
// //     spec: T_Spec
// // ): ApiClient<T_Spec> {
// //     const client = {} as ApiClient<T_Spec>;
// //
// //     const typedPaths = spec.paths as { [K in keyof T_Spec["paths"]]: T_Spec["paths"][K] };
// //
// //     for (const pathKey in typedPaths) {
// //         if (Object.prototype.hasOwnProperty.call(typedPaths, pathKey)) {
// //             const path = pathKey as keyof T_Spec["paths"];
// //             client[path] = {} as any;
// //
// //             const pathSpec = typedPaths[path];
// //
// //             for (const methodKey in pathSpec) {
// //                 if (Object.prototype.hasOwnProperty.call(pathSpec, methodKey)) {
// //                     const method = methodKey as keyof typeof pathSpec;
// //                     client[path][method] = ((args: any) => {
// //                         return apiCall(spec, path, method, args);
// //                     }) as any;
// //                 }
// //             }
// //         }
// //     }
// //
// //     return client;
// // }
// //
// //
// // // --- OpenAPI 구현 인터페이스 ---
// //
// // // 응답 타입 (성공/에러 모두 포함)
// // type ApiResponse<T_Spec extends OpenAPI, T_PathSpec, T_Method> = GetOperation<T_PathSpec, T_Method> extends {
// //     readonly responses: infer R;
// // } ? {
// //     [Code in keyof R]: R[Code] extends { readonly content: { readonly "application/json": { readonly schema: infer S_raw } } }
// //     ? { status: Code; data: SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec> }
// //     : { status: Code; data: void }
// // }[keyof R] : never;
// //
// // // HTTP 메서드와 경로를 조합한 키 타입 생성
// // type MethodPathKey<T_Spec extends OpenAPI> = {
// //     [P in keyof T_Spec["paths"]]: {
// //         [M in keyof T_Spec["paths"][P]]: `[${string & M}]:${string & P}`;
// //     }[keyof T_Spec["paths"][P]];
// // }[keyof T_Spec["paths"]];
// //
// // // "[method]:path" 형태의 OpenAPI 구현 인터페이스
// // type OpenApiImplements<T_Spec extends OpenAPI> = {
// //     [K in MethodPathKey<T_Spec>]: K extends `[${infer Method}]:${infer Path}`
// //     ? Path extends keyof T_Spec["paths"]
// //     ? Method extends keyof T_Spec["paths"][Path]
// //     ? (
// //         args: ExtractApiArgs<T_Spec, T_Spec["paths"][Path], Method>
// //     ) => Promise<ApiResponse<T_Spec, T_Spec["paths"][Path], Method>>
// //     : never
// //     : never
// //     : never;
// // };
// // type OpenApiImplementOptions<T_Spec extends OpenAPI> = Partial<OpenApiImplements<T_Spec>>;
// //
// //
// // // === Request Parameter Extraction Types ===
// //
// // // Type for implementing request parameter extraction from raw input
// // type OpenApiRequestImplements<T_Spec extends OpenAPI> = {
// //     [K in MethodPathKey<T_Spec>]: K extends `[${infer Method}]:${infer Path}`
// //     ? Path extends keyof T_Spec["paths"]
// //     ? Method extends keyof T_Spec["paths"][Path]
// //     ? (
// //         input: any  // Raw input (e.g., HTTP request object)
// //     ) => Promise<ExtractApiArgs<T_Spec, T_Spec["paths"][Path], Method>>
// //     : never
// //     : never
// //     : never;
// // };
// //
// // // Example UserSpec for testing
// // const UserSpec = {
// //     openapi: "3.0.0",
// //     info: {
// //         title: "User API",
// //         version: "1.0.0",
// //     },
// //     paths: {
// //         "/users/{id}": {
// //             delete: {
// //                 parameters: [
// //                     { name: "id", in: "path", required: true, schema: { type: "string" } },
// //                     {
// //                         name: "Authorization",
// //                         in: "header",
// //                         required: true,
// //                         schema: { type: "string" },
// //                     },
// //                 ],
// //                 responses: {
// //                     "204": { description: "User deleted successfully" },
// //                 },
// //             },
// //         },
// //     },
// // } as const;
// //
// // // Correct implementation
// // export class TT implements OpenApiRequestImplements<typeof UserSpec> {
// //     async "[delete]:/users/{id}"(input: any): Promise<ExtractApiArgs<typeof UserSpec, typeof UserSpec["paths"]["/users/{id}"], "delete">> {
// //         // Extract parameters from raw HTTP request input
// //         return {
// //             path: {
// //                 id: input.params?.id || input.pathParams?.id || "default-id"
// //             },
// //             header: {
// //                 Authorization: input.headers?.authorization || input.headers?.Authorization || "Bearer default-token"
// //             }
// //         };
// //     }
// // }
// //
// // // === Usage Example ===
// //
// // const requestExtractor = new TT();
// //
// // // Example: Extract parameters from HTTP request
// // const mockRequest = {
// //     params: { id: "user123" },
// //     headers: { Authorization: "Bearer abc123" }
// // };
// //
// // requestExtractor["[delete]:/users/{id}"](mockRequest).then(extractedParams => {
// //     // extractedParams is fully typed!
// //     // extractedParams.path.id: string
// //     // extractedParams.header.Authorization: string
// //     console.log(`Extracted ID: ${extractedParams.path.id}`);
// //     console.log(`Extracted Auth: ${extractedParams.header.Authorization}`);
// // });
// //
// // // === TypeScript 타입 추론 차이점 분석 ===
// //
// // // 1. implements 방식의 한계:
// // // - 클래스 멤버를 개별적으로 검사하므로 전체 타입 컨텍스트를 잃음
// // // - 복잡한 조건부 타입에서 타입 추론이 제대로 작동하지 않음
// // // - 런타임에 가까운 구조적 타입 검사로 인한 한계
// //
// // // 2. const generic constraints의 장점:
// // // - 함수 호출 시점에서 지연 평가(lazy evaluation)
// // // - 전체 객체 구조를 한 번에 분석 가능
// //
// //
// // // - 제네릭 타입 매개변수가 실제 값과 함께 추론되어 더 정확함
// // type Z = ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">;
// //
// // class MY implements OpenApiImplementOptions<UserSpec> {
// //
// //     async "[delete]:/users/{id}"(args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">> {
// //         console.log(`Deleting user ${args.path.id} with auth: ${args.header.Authorization}`);
// //         return {
// //             status: "204",
// //             data: undefined
// //         };
// //     }
// //
// //     async "[get]:/users/{id}"(args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "get">): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "get">> {
// //         console.log(`Getting user ${args.path.id} with lang: ${args.query?.lang}`);
// //
// //         return {
// //             status: "200",
// //             data: {
// //                 id: args.path.id,
// //                 name: "MY User",
// //                 email: "my@example.com"
// //             }
// //         };
// //     }
// //
// //     async "[post]:/users"(args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users"], "post">): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users"], "post">> {
// //         console.log(`Creating user: ${args.body.name} (${args.body.email})`);
// //
// //         return {
// //             status: "201",
// //             data: {
// //                 id: `my-${Date.now()}`,
// //                 name: args.body.name,
// //                 email: args.body.email
// //             }
// //         };
// //     }
// //
// //     async "[put]:/users/{id}/profile"(args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}/profile"], "put">): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}/profile"], "put">> {
// //         console.log(`Updating user ${args.path.id} profile with request ID: ${args.header["X-Request-ID"]}`);
// //
// //         return {
// //             status: "200",
// //             data: {
// //                 id: args.path.id,
// //                 name: args.body.name || "Updated MY User",
// //                 email: args.body.email || "updated-my@example.com"
// //             }
// //         };
// //     }
// // }
// //
// //
// // // 팩토리 함수를 사용한 구현 방식 (개선된 버전)
// // function createOpenApiImplementation<const T_Spec extends OpenAPI>(
// //     spec: T_Spec,
// //     handlers: OpenApiImplements<T_Spec>
// // ): OpenApiImplements<T_Spec> {
// //     return handlers;
// // }
// //
// //
// // // 팩토리 함수 사용 예시 - 완벽한 타입 추론!
// // const myApiImpl = createOpenApiImplementation(openApiSpec, {
// //     "[get]:/users/{id}": async (args) => {
// //         // args는 정확한 타입으로 추론됨!
// //         // args.path.id: string
// //         // args.query?.lang: "ko" | "en" | "jp" | undefined
// //         console.log(`Getting user ${args.path.id} with lang: ${args.query?.lang}`);
// //
// //         return {
// //             status: "200" as const,
// //             data: { id: args.path.id, name: "Factory User", email: "factory@example.com" }
// //         };
// //     },
// //     "[delete]:/users/{id}": async (args) => ({
// //         status: "204" as const,
// //         data: undefined
// //     }),
// //     "[post]:/users": async (args) => {
// //         // args.body.name: string, args.body.email: string (완벽한 타입 추론!)
// //         console.log(`Creating user: ${args.body.name} (${args.body.email})`);
// //
// //         return {
// //             status: "201" as const,
// //             data: { id: "new-id", ...args.body }
// //         };
// //     },
// //     "[put]:/users/{id}/profile": async (args) => ({
// //         status: "200" as const,
// //         data: { id: args.path.id, name: args.body.name || "Updated", email: args.body.email || "updated@example.com" }
// //     })
// // });
// //
// // // --- 사용법 ---
// //
// // const api = createApiCall(openApiSpec);
// //
// // // GET 요청
// // api["/users/{id}"].get({
// //     path: { id: "456" },
// //     query: { lang: "jp" },
// // });
// //
// // // POST 요청
// // api["/users"].post({
// //     body: {
// //         name: "New Gemini User",
// //         email: "gemini@google.com",
// //     },
// // });
// //
// // // PUT 요청 (헤더 포함)
// // api["/users/{id}/profile"].put({
// //     path: { id: "789" },
// //     header: {
// //         "X-Request-ID": "abc-def-123-456",
// //     },
// //     body: {
// //         name: "Updated Gemini User",
// //     },
// // });
// //
// // // DELETE 요청 (다른 헤더 포함)
// // api["/users/{id}"].delete({
// //     path: { id: "101" },
// //     header: {
// //         Authorization: "Bearer xyz-token-789",
// //     },
// // });
// //
// //
// // // === The Real Problem in OpenAPI Implementation ===
// //
// // // This is exactly the problem we face in our OpenAPI implementation!
// // class ProblematicOpenApiImpl implements OpenApiImplements<UserSpec> {
// //     async "[get]:/users/{id}"(args) {  // ❌ args is inferred as any
// //         // TypeScript cannot infer parameter types from complex conditional types
// //         console.log(args.path.id);  // No type safety
// //         return { status: "200" as const, data: { id: args.path.id, name: "test", email: "test" } };
// //     }
// //
// //     // Same problem for all other methods...
// //     async "[post]:/users"(args) {
// //         return { status: "201" as const, data: { id: "1", name: args.body.name, email: args.body.email } };
// //     }
// //     async "[delete]:/users/{id}"(args) {
// //         return { status: "204" as const, data: undefined };
// //     }
// //     async "[put]:/users/{id}/profile"(args) {
// //         return { status: "200" as const, data: { id: args.path.id, name: "test", email: "test" } };
// //     }
// // }
// //
// // // But factory functions work perfectly!
// // const workingImpl = createOpenApiImplementation(openApiSpec, {
// //     "[get]:/users/{id}": async (args) => {  // ✅ args is perfectly inferred!
// //         console.log(args.path.id);  // Perfect type safety
// //         return { status: "200" as const, data: { id: args.path.id, name: "test", email: "test" } };
// //     },
// //     "[post]:/users": async (args) => ({ status: "201" as const, data: { id: "1", ...args.body } }),
// //     "[delete]:/users/{id}": async (args) => ({ status: "204" as const, data: undefined }),
// //     "[put]:/users/{id}/profile": async (args) => ({ status: "200" as const, data: { id: args.path.id, name: "test", email: "test" } })
// // });
// //
// // console.log("=== Type Inference Comparison ===");
// // console.log("implements: Parameter types are NOT inferred (any)");
// // console.log("Factory function: Parameter types are PERFECTLY inferred!");
// // console.log("Parameters utility: Clean extraction with perfect inference!");
// //
// // class ExplicitTypedAPI implements OpenApiImplements<UserSpec> {
// //     async "[delete]:/users/{id}"(
// //         args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">
// //     ): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "delete">> {
// //         console.log(`Deleting user ${args.path.id} with auth: ${args.header.Authorization}`);
// //
// //         // Return type must match: { status: "204"; data: void }
// //         return {
// //             status: "204" as const,
// //             data: undefined
// //         };
// //     }
// //
// //     async "[get]:/users/{id}"(
// //         args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}"], "get">
// //     ): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}"], "get">> {
// //         console.log(`Getting user ${args.path.id} with lang: ${args.query?.lang}`);
// //
// //         // Return type must match: { status: "200"; data: { id: string; name: string; email?: string } }
// //         return {
// //             status: "200" as const,
// //             data: {
// //                 id: args.path.id,
// //                 name: "Explicit User",
// //                 email: "explicit@example.com"
// //             }
// //         };
// //     }
// //
// //     async "[post]:/users"(
// //         args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users"], "post">
// //     ): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users"], "post">> {
// //         console.log(`Creating user: ${args.body.name} (${args.body.email})`);
// //
// //         // Return type must match: { status: "201"; data: { id: string; name: string; email?: string } }
// //         return {
// //             status: "201" as const,
// //             data: {
// //                 id: `explicit-${Date.now()}`,
// //                 name: args.body.name,
// //                 email: args.body.email
// //             }
// //         };
// //     }
// //
// //     async "[put]:/users/{id}/profile"(
// //         args: ExtractApiArgs<UserSpec, UserSpec["paths"]["/users/{id}/profile"], "put">
// //     ): Promise<ApiResponse<UserSpec, UserSpec["paths"]["/users/{id}/profile"], "put">> {
// //         console.log(`Updating user ${args.path.id} profile with request ID: ${args.header["X-Request-ID"]}`);
// //         console.log(`Profile data:`, args.body);
// //
// //         // Return type must match: { status: "200"; data: { id: string; name: string; email?: string } }
// //         return {
// //             status: "200" as const,
// //             data: {
// //                 id: args.path.id,
// //                 name: args.body.name || "Updated User",
// //                 email: args.body.email || "updated@example.com"
// //             }
// //         };
// //     }
// // }
// //
// // // === Usage Example with Perfect Type Safety ===
// //
// // const myExplicitApi = new ExplicitTypedAPI();
// //
// // // All method calls have perfect type inference and safety
// // myExplicitApi["[get]:/users/{id}"]({
// //     path: { id: "123" },
// //     query: { lang: "ko" }
// // }).then(response => {
// //     // response.status is "200"
// //     // response.data has { id: string; name: string; email?: string }
// //     console.log(`Explicit API User: ${response.data.name} (${response.data.email})`);
// // });
// //
// // myExplicitApi["[post]:/users"]({
// //     body: { name: "Explicit User", email: "explicit@example.com" }
// // }).then(response => {
// //     // response.status is "201"
// //     // response.data has { id: string; name: string; email?: string }
// //     console.log(`Explicit API Created: ${response.data.id}`);
// // });
// //
// // myExplicitApi["[delete]:/users/{id}"]({
// //     path: { id: "456" },
// //     header: { Authorization: "Bearer token123" }
// // }).then(response => {
// //     // response.status is "204"
// //     // response.data is undefined
// //     console.log(`Explicit API Deleted: Status ${response.status}`);
// // });
// //
// // myExplicitApi["[put]:/users/{id}/profile"]({
// //     path: { id: "789" },
// //     header: { "X-Request-ID": "req-456" },
// //     body: { name: "Updated Name", email: "updated@example.com" }
// // }).then(response => {
// //     // response.status is "200"
// //     // response.data has { id: string; name: string; email?: string }
// //     console.log(`Explicit API Updated: ${response.data.name}`);
// // });
// //
// // console.log("=== Explicit Type Implementation Complete ===");
// // console.log("✅ All methods have proper return types matching OpenAPI spec");
// // console.log("✅ Perfect type safety with explicit type annotations");
// // console.log("✅ Args parameters are fully typed (no 'any')");
// // console.log("✅ Return values match expected ApiResponse structure");
// // // Duplicate removed - using the implementation above
// //
// // // === Usage Example ===
// //
// // const requestHandler = new TT();
// //
// // // Simulate HTTP request input
// // const mockHttpRequest = {
// //     params: { id: "user123" },
// //     headers: { authorization: "Bearer abc123" }
// // };
// //
// // // Extract typed parameters
// // requestHandler["[delete]:/users/{id}"](mockHttpRequest).then(extractedArgs => {
// //     // extractedArgs is fully typed!
// //     // extractedArgs.path.id: string
// //     // extractedArgs.header.Authorization: string
// //     console.log(`Extracted ID: ${extractedArgs.path.id}`);
// //     console.log(`Extracted Auth: ${extractedArgs.header.Authorization}`);
// // });
// //
// // // === Alternative: More Practical Implementation ===
// //
// // // If you want to return the parameters in a different structure:
// // type ParameterExtractor<T_Spec extends OpenAPI> = {
// //     [K in MethodPathKey<T_Spec>]: K extends `[${infer Method}]:${infer Path}`
// //     ? Path extends keyof T_Spec["paths"]
// //     ? Method extends keyof T_Spec["paths"][Path]
// //     ? (
// //         input: any
// //     ) => Promise<{
// //         parameters: {
// //             path?: Record<string, any>;
// //             query?: Record<string, any>;
// //             header?: Record<string, any>;
// //         };
// //     }>
// //     : never
// //     : never
// //     : never;
// // };
// //
// // export class ParameterExtractorImpl implements ParameterExtractor<typeof UserSpec> {
// //     async "[delete]:/users/{id}"(input: any): Promise<{
// //         parameters: {
// //             path?: Record<string, any>;
// //             query?: Record<string, any>;
// //             header?: Record<string, any>;
// //         };
// //     }> {
// //         return {
// //             parameters: {
// //                 path: {
// //                     id: input.params?.id || "z"
// //                 },
// //                 header: {
// //                     Authorization: input.headers?.authorization || "Bearer token"
// //                 }
// //             }
// //         };
// //     }
// //
// //     async "[get]:/users/{id}"(input: any): Promise<{
// //         parameters: {
// //             path?: Record<string, any>;
// //             query?: Record<string, any>;
// //             header?: Record<string, any>;
// //         };
// //     }> {
// //         return {
// //             parameters: {
// //                 path: {
// //                     id: input.params?.id || "default"
// //                 }
// //             }
// //         };
// //     }
// // }
// //
// // console.log("=== Request Parameter Implementation ===");
// // console.log("✅ OpenApiRequestImplements type defined");
// // console.log("✅ UserSpec example created");
// // console.log("✅ Correct return types for parameter extraction");
// // console.log("✅ Both structured and flexible implementations provided");