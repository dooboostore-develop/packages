import { OpenApi } from '@dooboostore/core/open-api/OpenApi';

// 🎯 테스트용 OpenAPI 스펙 정의
const TestSpec = {
    openapi: "3.0.0",
    info: {
        title: "Test API",
        version: "1.0.0",
    },
    servers: [
        {
            url: "https://api.example.com/v1",
            description: "Production server"
        },
        {
            url: "https://staging-api.example.com/v1",
            description: "Staging server"
        },
        {
            url: "http://localhost:3000/v1",
            description: "Development server"
        }
    ],
    paths: {
        "/users": {
            get: {
                responses: {
                    "200": {
                        description: "Users list",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                            email: { type: "string" }
                                        },
                                        required: ["id", "name"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" }
                                },
                                required: ["name", "email"]
                            }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "User created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" }
                                    },
                                    required: ["id", "name", "email"]
                                }
                            }
                        }
                    }
                }
            }
        },
        "/users/{id}": {
            get: {
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                    { name: "lang", in: "query", required: true, schema: { type: "string" } },
                    { name: "Authorization", in: "header", required: true, schema: { type: "string" } }
                ],
                responses: {
                    "200": {
                        description: "User details",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" }
                                    },
                                    required: ["id", "name"]
                                }
                            },
                            "application/xml": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            put: {
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" }
                                }
                            }
                        },
                        "application/xml": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "User updated",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" }
                                    }
                                }
                            },
                            "application/xml": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
} as const;

// 간단한 assert 함수
function assert(condition: any, message: string) {
    if (!condition) {
        throw new Error(`❌ ${message}`);
    }
    console.log(`✅ ${message}`);
}

function deepEqual(actual: any, expected: any): boolean {
    return JSON.stringify(actual) === JSON.stringify(expected);
}

// 🎯 OpenApi Simple Server 테스트 실행
async function runOpenApiTests() {
    console.log('\n🚀 OpenApi Simple Server 테스트 시작\n');

    try {
        // 🎯 테스트 1: GET /users - 기본 GET 요청 테스트
        console.log('📋 테스트 1: GET /users - 기본 GET 요청');
        const server1 = OpenApi.createProvider(TestSpec, {
            "/users": {
                get: {
                    void: {
                        "application/json": async (args) => {
                            console.log('  GET /users 핸들러 호출됨:', args);
                            return [
                                { id: "1", name: "John", email: "john@example.com" },
                                { id: "2", name: "Jane", email: "jane@example.com" }
                            ];
                        }
                    }
                },
                post: {
                    "application/json": {
                        "application/json": async (args) => {
                            console.log('  POST /users 핸들러 호출됨:', args);
                            const newUser = args.body;
                            // 올바른 타입의 응답 반환 (id, name, email 모두 필수)
                            return {
                                id: "new-id-123",
                                name: newUser.name,
                                email: newUser.email
                            };
                        }
                    }
                }
            },
            "/users/{id}": {
                get: {
                    void: {
                        "application/json": async (args) => {
                            const userId = args.parameters.path.id;
                            return { id: userId, name: "John Doe", email: "john@example.com" };
                        },
                        "application/xml": async (args) => {
                            const userId = args.parameters.path.id;
                            return { id: userId, name: "John Doe (XML)", email: "john@example.com" };
                        }
                    }
                },
                put: {
                    "application/json": {
                        "application/json": async (args) => {
                            const userId = args.parameters.path.id;
                            const updateData = args.body;
                            return {
                                id: userId,
                                name: updateData.name || "Updated Name",
                                email: updateData.email || "updated@example.com"
                            };
                        },
                        "application/xml": async (args) => {
                            const userId = args.parameters.path.id;
                            const updateData = args.body;
                            return {
                                id: userId,
                                name: `${updateData.name} (XML)`,
                                email: updateData.email || "updated@example.com"
                            };
                        }
                    },
                    "application/xml": {
                        "application/json": async (args) => {
                            const userId = args.parameters.path.id;
                            const updateData = args.body;
                            return {
                                id: userId,
                                name: `${updateData.name} (from XML)`,
                                email: updateData.email || "updated@example.com"
                            };
                        },
                        "application/xml": async (args) => {
                            const userId = args.parameters.path.id;
                            const updateData = args.body;
                            return {
                                id: userId,
                                name: `${updateData.name} (XML→XML)`,
                                email: updateData.email || "updated@example.com"
                            };
                        }
                    }
                }
            }
        });

        const result1 = await server1(
            {
                path: "/users",
                method: "get",
                responseContentType: "application/json"
            },
            {
                parameters: {
                    path: {},
                    query: {},
                    header: {}
                }
            }
        );

        assert(
            deepEqual(result1, [
                { id: "1", name: "John", email: "john@example.com" },
                { id: "2", name: "Jane", email: "jane@example.com" }
            ]),
            "GET /users 결과가 예상과 일치함"
        );

        // 🎯 테스트 2: GET /users/{id} - Path Parameter와 Multiple Content-Type 테스트 (server1 재사용)
        console.log('\n📋 테스트 2: GET /users/{id} - Path Parameter와 Multiple Content-Type');

        // JSON 응답 테스트
        const jsonResult = await server1(
            {
                path: "/users/{id}",
                method: "get",
                responseContentType: "application/json"
            },
            {
                parameters: {
                    path: { id: "123" },
                    query: { lang: "ko" },
                    header: { Authorization: "Bearer token123" }
                }
            }
        );

        assert(
            deepEqual(jsonResult, { id: "123", name: "John Doe", email: "john@example.com" }),
            "GET /users/{id} JSON 결과가 예상과 일치함"
        );

        // XML 응답 테스트
        const xmlResult = await server1(
            {
                path: "/users/{id}",
                method: "get",
                responseContentType: "application/xml"
            },
            {
                parameters: {
                    path: { id: "456" },
                    query: { lang: "en" },
                    header: { Authorization: "Bearer token456" }
                }
            }
        );

        assert(
            deepEqual(xmlResult, { id: "456", name: "John Doe (XML)", email: "john@example.com" }),
            "GET /users/{id} XML 결과가 예상과 일치함"
        );

        // 🎯 테스트 3: POST /users - Request Body 테스트 (server1 재사용)
        console.log('\n📋 테스트 3: POST /users - Request Body');

        const result3 = await server1(
            {
                path: "/users",
                method: "post",
                requestContentType: "application/json",
                responseContentType: "application/json"
            },
            {
                parameters: {
                    path: {},
                    query: {},
                    header: {}
                },
                body: {
                    name: "New User",
                    email: "newuser@example.com"
                }
            }
        );

        assert(
            deepEqual(result3, {
                id: "new-id-123",
                name: "New User",
                email: "newuser@example.com"
            }),
            "POST /users 결과가 예상과 일치함"
        );

        // 🎯 테스트 4: PUT /users/{id} - 매트릭스 구조 (Request + Response Content-Type) 테스트 (server1 재사용)
        console.log('\n📋 테스트 4: PUT /users/{id} - 매트릭스 구조');

        // JSON → JSON 테스트
        const jsonToJsonResult = await server1(
            {
                path: "/users/{id}",
                method: "put",
                requestContentType: "application/json",
                responseContentType: "application/json"
            },
            {
                parameters: {
                    path: { id: "update-123" },
                    query: {},
                    header: {}
                },
                body: {
                    name: "Updated User",
                    email: "updated@example.com"
                }
            }
        );

        assert(
            deepEqual(jsonToJsonResult, {
                id: "update-123",
                name: "Updated User",
                email: "updated@example.com"
            }),
            "PUT /users/{id} JSON→JSON 결과가 예상과 일치함"
        );

        // JSON → XML 테스트
        const jsonToXmlResult = await server1(
            {
                path: "/users/{id}",
                method: "put",
                requestContentType: "application/json",
                responseContentType: "application/xml"
            },
            {
                parameters: {
                    path: { id: "update-456" },
                    query: {},
                    header: {}
                },
                body: {
                    name: "Updated User XML",
                    email: "updated-xml@example.com"
                }
            }
        );

        assert(
            deepEqual(jsonToXmlResult, {
                id: "update-456",
                name: "Updated User XML (XML)",
                email: "updated-xml@example.com"
            }),
            "PUT /users/{id} JSON→XML 결과가 예상과 일치함"
        );

        // 🎯 테스트 5: 에러 처리 테스트
        console.log('\n📋 테스트 5: 에러 처리 - 존재하지 않는 핸들러');

        // try {
        //     await server1(
        //         {
        //             path: "/nonexistent",
        //             method: "get",
        //             responseContentType: "application/json"
        //         },
        //         {
        //             parameters: { path: {}, query: {}, header: {} }
        //         }
        //     );
        //     assert(false, "에러가 발생해야 하는데 발생하지 않음");
        // } catch (error) {
        //     assert(
        //         error instanceof Error && error.message.includes('Handler not found'),
        //         "존재하지 않는 핸들러에 대해 올바른 에러가 발생함"
        //     );
        // }

        // 🎯 테스트 6: createFetcher 테스트
        console.log('\n📋 테스트 6: createFetcher - 타입 안전한 HTTP 클라이언트');

        // Mock fetch 함수 생성
        const mockFetch = async (url: string, init: RequestInit): Promise<Response> => {
            console.log(`  Mock fetch called: ${init.method} ${url}`);

            // URL에 따른 mock 응답
            if (url.includes('/users/123')) {
                return new Response(JSON.stringify({
                    id: "123",
                    name: "Mock User",
                    email: "mock@example.com"
                }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            } else if (url.includes('/users') && init.method === 'POST') {
                const body = JSON.parse(init.body as string);
                return new Response(JSON.stringify({
                    id: "new-mock-id",
                    name: body.name,
                    email: body.email
                }), {
                    status: 201,
                    headers: { 'content-type': 'application/json' }
                });
            }

            return new Response('Not Found', { status: 404 });
        };

        // createFetcher로 타입 안전한 클라이언트 생성
        const fetcher = OpenApi.createFetcher(TestSpec, {
            defaultServerUrl: 'https://api.example.com',
            executor: mockFetch,
            before: () => console.log('  🔄 요청 시작'),
            completed: () => console.log('  ✅ 요청 완료'),
            error: (e) => console.log('  ❌ 요청 에러:', e.message)
        });

        // GET 요청 테스트
        const getUserResult = await fetcher(
            {
                path: "/users/{id}",
                method: "get",
                responseContentType: "application/json"
            },
            {
                path: { id: "123" },
                query: { lang: "ko" },
                header: { Authorization: "Bearer test-token" }
            }
        );

        assert(
            deepEqual(getUserResult, { id: "123", name: "Mock User", email: "mock@example.com" }),
            "createFetcher GET 요청 결과가 예상과 일치함 (단순 데이터 반환)"
        );

        // // POST 요청 테스트
        // const createUserResult = await fetcher(
        //     {
        //         path: "/users",
        //         method: "post",
        //         serverUrl: "https://custom-server.com" // 개별 요청에서 서버 URL 오버라이드
        //     },
        //     {
        //         body: {
        //             type: "application/json",
        //             data: {
        //                 name: "New Fetcher User",
        //                 email: "fetcher@example.com"
        //             }
        //         },
        //         options: {
        //             before: () => console.log('  🚀 POST 요청 시작 (커스텀 콜백)')
        //         }
        //     }
        // );
        //
        // assert(
        //     deepEqual(createUserResult, {
        //         id: "new-mock-id",
        //         name: "New Fetcher User",
        //         email: "fetcher@example.com"
        //     }),
        //     "createFetcher POST 요청 결과가 예상과 일치함 (단순 데이터 반환)"
        // );

        // 🎯 테스트 7: 서버 URL 선택 테스트
        console.log('\n📋 테스트 7: 서버 URL 선택 - OpenAPI servers 활용');

        // 다양한 서버 URL로 테스트
        const mockFetchWithUrlCheck = async (url: string, init: RequestInit): Promise<Response> => {
            console.log(`  서버 URL 확인: ${url}`);

            if (url.startsWith('https://staging-api.example.com')) {
                return new Response(JSON.stringify({
                    id: "staging-123",
                    name: "Staging User",
                    email: "staging@example.com",
                    environment: "staging"
                }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            } else if (url.startsWith('http://localhost:3000')) {
                return new Response(JSON.stringify({
                    id: "dev-123",
                    name: "Dev User",
                    email: "dev@example.com",
                    environment: "development"
                }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            }

            return new Response('Server not found', { status: 404 });
        };

        const fetcherWithServers = OpenApi.createFetcher(TestSpec, {
            executor: mockFetchWithUrlCheck
        });

        // Staging 서버 테스트
        const stagingResults = await fetcherWithServers(
            {
                path: "/users/{id}",
                method: "get",
                serverUrl: "https://staging-api.example.com/v1", // OpenAPI servers에서 선택
                responseContentType: "application/xml"
            },
            {
                path: { id: "123" },
                query: { lang: "ko" }, // required query parameter 추가
                header: { Authorization: "Bearer staging-token" }
            }
        );
        // Staging 서버 테스트
        const stagingResult = await fetcherWithServers(
            {
                path: "/users/{id}",
                method: "get",
                serverUrl: "https://staging-api.example.com/v1", // OpenAPI servers에서 선택
                responseContentType: "application/json"
            },
            {
                path: { id: "123" },
                query: { lang: "ko" }, // required query parameter 추가
                header: { Authorization: "Bearer staging-token" }
            }
        );

        assert(
            stagingResult.environment === "staging",
            "Staging 서버 URL이 올바르게 사용됨 (단순 데이터 반환)"
        );

        // Development 서버 테스트
        const devResult = await fetcherWithServers(
            {
                path: "/users/{id}",
                method: "get",
                serverUrl: "http://localhost:3000/v1", // OpenAPI servers에서 선택
                responseContentType: "application/json"
            },
            {
                path: { id: "123" },
                query: { lang: "en" }, // required query parameter 추가
                header: { Authorization: "Bearer dev-token" }
            }
        );

        assert(
            devResult.environment === "development",
            "Development 서버 URL이 올바르게 사용됨 (단순 데이터 반환)"
        );

        console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');

    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:', error);
        throw error;
    }
}

// 테스트 실행
runOpenApiTests().catch(console.error);
