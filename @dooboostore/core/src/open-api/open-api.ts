// --- OpenAPI 3.0 타입 정의 ---

// @ts-ignore
interface ReferenceObject {
  readonly $ref: string;
}

interface SchemaObject {
  readonly type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
  readonly properties?: Record<string, SchemaObject | ReferenceObject>;
  readonly required?: readonly string[];
  readonly enum?: readonly any[];
  readonly items?: SchemaObject | ReferenceObject;
  readonly description?: string;
  readonly format?: string;
}

interface ParameterObject {
  readonly name: string;
  readonly in: "query" | "path" | "header" | "cookie";
  readonly required?: boolean;
  readonly schema?: SchemaObject | ReferenceObject;
  readonly description?: string;
}

interface RequestBodyObject {
  readonly required?: boolean;
  readonly content: {
    readonly [mediaType: string]: {
      readonly schema?: SchemaObject | ReferenceObject;
    };
  };
  readonly description?: string;
}

interface ResponseObject {
  readonly description: string;
  readonly content?: {
    readonly [mediaType: string]: {
      readonly schema?: SchemaObject | ReferenceObject;
    };
  };
}

interface OperationObject {
  readonly summary?: string;
  readonly parameters?: readonly (ParameterObject | ReferenceObject)[];
  readonly requestBody?: RequestBodyObject | ReferenceObject;
  readonly responses: {
    readonly [statusCode: string]: ResponseObject | ReferenceObject;
  };
}

interface PathItemObject {
  readonly get?: OperationObject;
  readonly post?: OperationObject;
  readonly put?: OperationObject;
  readonly delete?: OperationObject;
}

interface ComponentsObject {
  readonly schemas?: Record<string, SchemaObject | ReferenceObject>;
  readonly parameters?: Record<string, ParameterObject | ReferenceObject>;
  readonly responses?: Record<string, ResponseObject | ReferenceObject>;
  readonly requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
}

interface OpenAPI {
  readonly openapi: "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3";
  readonly info: {
    readonly title: string;
    readonly version: string;
  };
  readonly paths: Record<string, PathItemObject>;
  readonly components?: ComponentsObject;
}

// --- 실제 API 명세 객체 ---
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "LazyCollect API",
    version: "1.0.0",
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
        required: ["id", "name"],
      },
      NewUser: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
        required: ["name", "email"],
      },
      UpdateUser: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
    },
    parameters: {
      LangQueryParam: {
        name: "lang",
        in: "query",
        schema: { type: "string", enum: ["ko", "en", "jp"] },
      },
      RequestIdHeader: {
        name: "X-Request-ID",
        in: "header",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "A unique identifier for the request.",
      },
    },
  },
  paths: {
    "/users/{id}": {
      get: {
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { "$ref": "#/components/parameters/LangQueryParam" },
        ],
        responses: {
          "200": {
            description: "A single user.",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/User" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a user",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Bearer token for authentication",
          },
        ],
        responses: {
          "204": {
            description: "User deleted successfully",
          },
        },
      },
    },
    "/users": {
      post: {
        summary: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                "$ref": "#/components/schemas/NewUser",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/users/{id}/profile": {
      put: {
        summary: "Update a user's profile",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { "$ref": "#/components/parameters/RequestIdHeader" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/UpdateUser" },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
  },
} as const;

// --- 타입 추론 로직 (재귀 깊이 제한 추가) ---

type ResolveRef<T, T_Spec extends OpenAPI> = T extends { readonly $ref: infer R }
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
type SchemaToTsType<S, T_Spec extends OpenAPI, Depth extends any[] = []> = Depth["length"] extends 8
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

type ResolveParams<P extends readonly any[], T_Spec extends OpenAPI> = {
  [I in keyof P]: ResolveRef<P[I], T_Spec>;
};

type GetOperation<T_PathSpec, T_Method> = T_PathSpec extends { readonly [key in T_Method & keyof T_PathSpec]: infer O }
  ? O
  : never;

type ExtractApiArgs<T_Spec extends OpenAPI, T_PathSpec, T_Method> =
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
            [Param in Extract<P[number], { readonly in: "query" }> as Param["name"]]?:
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
  (GetOperation<T_PathSpec, T_Method> extends { readonly requestBody: { readonly content: { readonly "application/json": { readonly schema: infer S_raw } } } }
    ? { body: SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec> }
    : { body?: never });

type SuccessStatusCode = "200" | "201" | "202" | "204";
type ExtractSuccessResponse<R, T_Spec extends OpenAPI> = {
  [Code in keyof R & SuccessStatusCode]: R[Code] extends { readonly content: { readonly "application/json": { readonly schema: infer S_raw } } }
    ? SchemaToTsType<ResolveRef<S_raw, T_Spec>, T_Spec>
    : void;
}[keyof R & SuccessStatusCode];

type ExtractResponse<T_Spec extends OpenAPI, T_PathSpec, T_Method> = GetOperation<T_PathSpec, T_Method> extends {
  readonly responses: infer R;
} ? ExtractSuccessResponse<R, T_Spec> : never;


// --- API 호출 함수 ---

async function apiCall<
  const T_Spec extends OpenAPI,
  P extends keyof T_Spec["paths"],
  M extends keyof T_Spec["paths"][P]
>(
  spec: T_Spec,
  path: P,
  method: M,
  args: ExtractApiArgs<T_Spec, T_Spec["paths"][P], M>
): Promise<ExtractResponse<T_Spec, T_Spec["paths"][P], M>> {
  const { path: pathParams, query: queryParams, header: headerParams, body: requestBody } = args as any;

  const url = String(path).replace(
    /{([^}]+)}/g,
    (_, key) => (pathParams as Record<string, string>)[key]
  );

  console.log(`
--- API Call ---`);
  console.log(`Making ${String(method).toUpperCase()} request to: ${url}`);

  if (headerParams && Object.keys(headerParams).length > 0) {
    console.log(`With headers: ${JSON.stringify(headerParams)}`);
  }

  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
    console.log(`With query params: ${queryString}`);
  }

  if (requestBody) {
    console.log(`With body: ${JSON.stringify(requestBody, null, 2)}`);
  }

  return new Promise((resolve) => {
    let mockResponse: any;
    if (method === 'post') {
        mockResponse = {
            id: `new-user-${Date.now()}`,
            ...(requestBody as object)
        }
    } else if (method === 'put') {
        mockResponse = {
            id: pathParams.id,
            ...(requestBody as object)
        }
    } else if (method === 'delete') {
        mockResponse = undefined;
    } else { // get
        mockResponse = {
            id: pathParams.id,
            name: "Mock User",
            email: "mock@example.com",
        };
    }
    console.log(`Mock response: ${JSON.stringify(mockResponse, null, 2)}`);
    resolve(mockResponse);
  });
}

// --- API 클라이언트 팩토리 ---

type ApiClient<T_Spec extends OpenAPI> = {
  [P in keyof T_Spec["paths"]]: {
    [M in keyof T_Spec["paths"][P]]: (
      args: ExtractApiArgs<T_Spec, T_Spec["paths"][P], M>
    ) => Promise<ExtractResponse<T_Spec, T_Spec["paths"][P], M>>;
  };
};

// Helper type to extract literal keys from an object type
type LiteralKeys<T> = {
  [K in keyof T]: K;
}[keyof T];

function createApiCall<const T_Spec extends OpenAPI>(
  spec: T_Spec
): ApiClient<T_Spec> {
  const client = {} as ApiClient<T_Spec>;

  const typedPaths = spec.paths as { [K in keyof T_Spec["paths"]]: T_Spec["paths"][K] };

  for (const pathKey in typedPaths) {
    if (Object.prototype.hasOwnProperty.call(typedPaths, pathKey)) {
      const path = pathKey as keyof T_Spec["paths"];
      client[path] = {} as any;

      const pathSpec = typedPaths[path];

      for (const methodKey in pathSpec) {
        if (Object.prototype.hasOwnProperty.call(pathSpec, methodKey)) {
          const method = methodKey as keyof typeof pathSpec;
          client[path][method] = ((args: any) => {
            return apiCall(spec, path, method, args);
          }) as any;
        }
      }
    }
  }

  return client;
}


// --- 사용법 ---

const api = createApiCall(openApiSpec);

// GET 요청
api["/users/{id}"].get({
  path: { id: "456" },
  query: { lang: "jp" },
});

// POST 요청
api["/users"].post({
  body: {
    name: "New Gemini User",
    email: "gemini@google.com",
  },
});

// PUT 요청 (헤더 포함)
api["/users/{id}/profile"].put({
  path: { id: "789" },
  header: {
    "X-Request-ID": "abc-def-123-456",
  },
  body: {
    name: "Updated Gemini User",
  },
});

// DELETE 요청 (다른 헤더 포함)
api["/users/{id}"].delete({
  path: { id: "101" },
  header: {
    Authorization: "Bearer xyz-token-789",
  },
});