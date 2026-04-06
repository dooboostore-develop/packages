import { OpenApi } from '../../../src/open-api/OpenApi';
import { createSimpleServer } from './SimpleServer';

// 🎯 최종 데모: Content-Type 매트릭스 구조로 완전한 타입 추론

const MyApiSpec = {
    paths: {
        '/posts/add': {
            post: {
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    body: { type: 'string' },
                                    userId: { type: 'number' }
                                },
                                required: ['title', 'body', 'userId']
                            }
                        },
                        'application/json+v2': {
                            schema: {
                                type: 'object',
                                properties: {
                                    body: { type: 'string' },
                                    userId: { type: 'number' }
                                },
                                required: ['body', 'userId']
                            }
                        },
                        'application/json+v3': {
                            schema: {
                                type: 'object',
                                properties: {
                                    content: { type: 'string' },
                                    authorId: { type: 'number' }
                                },
                                required: ['content', 'authorId']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        title: { type: 'string' },
                                        userId: { type: 'number' }
                                    },
                                    required: ['id', 'title', 'userId']
                                }
                            },
                            'application/json+v2': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        userId: { type: 'number' }
                                    },
                                    required: ['title', 'userId']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/posts/{id}': {
            get: {
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'number'
                        },
                        description: 'Post ID'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Get post by ID',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        title: { type: 'string' },
                                        body: { type: 'string' },
                                        userId: { type: 'number' }
                                    },
                                    required: ['id', 'title', 'body', 'userId']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/office/{id}/add': {
            post: {
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'number'
                        },
                        description: 'Office ID'
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' }
                                },
                                required: ['title']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Add to office',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        officeId: { type: 'number' },
                                        title: { type: 'string' }
                                    },
                                    required: ['id', 'officeId', 'title']
                                }
                            }
                        }
                    }
                }
            }
        }
    }
} as const;

// 🚀 간단하고 직관적인 서버 인터페이스!
const server = createSimpleServer(MyApiSpec, {
    '/posts/add': {
        post: {
            // 🎯 요청 Content-Type: application/json
            'application/json': {
                // 🎯 응답 Accept: application/json
                'application/json': async (args) => {
                    console.log('Request: application/json → Response: application/json');
                    console.log('Body:', args.body); // { title: string, body: string, userId: number }
                    console.log('Accept:', args.accept); // 'application/json'
                    
                    return {
                        id: 1,
                        title: args.body.title,
                        userId: args.body.userId
                    };
                },
                // 🎯 응답 Accept: application/json+v2
                'application/json+v2': async (args) => {
                    console.log('Request: application/json → Response: application/json+v2');
                    console.log('Body:', args.body); // { title: string, body: string, userId: number }
                    console.log('Accept:', args.accept); // 'application/json+v2'
                    
                    return {
                        title: args.body.title,
                        userId: args.body.userId
                    };
                }
            },
            // 🎯 요청 Content-Type: application/json+v2
            'application/json+v2': {
                'application/json': async (args) => {
                    console.log('Request: application/json+v2 → Response: application/json');
                    console.log('Body:', args.body); // { body: string, userId: number }
                    
                    return {
                        id: 1,
                        title: 'Default Title',
                        userId: args.body.userId
                    };
                },
                'application/json+v2': async (args) => {
                    console.log('Request: application/json+v2 → Response: application/json+v2');
                    console.log('Body:', args.body); // { body: string, userId: number }
                    
                    return {
                        title: 'Default Title',
                        userId: args.body.userId
                    };
                }
            },
            // 🎯 요청 Content-Type: application/json+v3
            'application/json+v3': {
                'application/json': async (args) => {
                    console.log('Request: application/json+v3 → Response: application/json');
                    console.log('Body:', args.body); // { content: string, authorId: number }
                    
                    return {
                        id: 1,
                        title: 'Generated Title',
                        userId: args.body.authorId
                    };
                },
                'application/json+v2': async (args) => {
                    console.log('Request: application/json+v3 → Response: application/json+v2');
                    console.log('Body:', args.body); // { content: string, authorId: number }
                    
                    return {
                        title: 'Generated Title',
                        userId: args.body.authorId
                    };
                }
            }
        }
    },
    '/posts/{id}': {
        get: {
            void: {
                'application/json': async (args) => {
                    // 🎯 일관된 구조: requestBody가 없으면 'void' 사용
                    console.log('Post ID:', args.parameters.path.id); // number 타입
                    console.log('Body:', args.body); // undefined

                    return {
                        id: args.parameters.path.id,
                        title: `Post ${args.parameters.path.id}`,
                        body: 'This is a sample post',
                        userId: 1
                    };
                }
            }
        }
        // get: {
        //     // 🎯 일관된 구조: requestBody가 없으면 'void' 사용
        //     'void': {
        //         'application/json': async (args) => {
        //             // ✅ path parameter 접근
        //             console.log('Post ID:', args.parameters.path.id); // number 타입
        //             console.log('Body:', args.body); // undefined
        //
        //             return {
        //                 id: args.parameters.path.id,
        //                 title: `Post ${args.parameters.path.id}`,
        //                 body: 'This is a sample post',
        //                 userId: 1
        //             };
        //         }
        //     }
        // }
    },
    '/office/{id}/add': {
        post: {
            'application/json': {
                'application/json': async (args) => {
                    // 🎯 핵심! path parameter + body 모두 접근!
                    console.log('Office ID:', args.parameters.path.id); // number
                    console.log('Body title:', args.body.title); // string
                    console.log('Body description:', args.body.description); // string | undefined

                    return {
                        id: 1,
                        officeId: args.parameters.path.id, // path parameter 사용
                        title: args.body.title // body 사용
                    };
                }
            }
        }
    }
});

// 🎯 생성된 메서드 시그니처들
console.log('Generated server methods:');
console.log('=== Content-Type Matrix ===');
console.log('- [post:application/json:application/json]:/posts/add');
console.log('- [post:application/json:application/json+v2]:/posts/add');
console.log('- [post:application/json+v2:application/json]:/posts/add');
console.log('- [post:application/json+v2:application/json+v2]:/posts/add');
console.log('- [post:application/json+v3:application/json]:/posts/add');
console.log('- [post:application/json+v3:application/json+v2]:/posts/add');
console.log('=== Path Parameters ===');
console.log('- [get:application/json]:/posts/{id}');
console.log('=== Mixed (Path + Body) ===');
console.log('- [post:application/json:application/json]:/office/{id}/add');

// 🎯 간단하고 직관적인 사용법 테스트!
async function testSimplifiedInterface() {
    console.log('=== Simplified Server Interface Test ===');

    // 1. GET 요청 (requestContentType 없음)
    const result0 = await server({
        path: '/posts/{id}',
        method: 'get',
        responseContentType: 'application/json'
    }, {
        parameters: {
            path: { id: 123 },
            query: {},
            header: {}
        }
    });

    // 2. POST 요청: application/json → application/json
    const result1 = await server({
        path: '/posts/add',
        method: 'post',
        requestContentType: 'application/json',
        responseContentType: 'application/json'
    }, {
        parameters: {
            path: {},
            query: {},
            header: {}
        },
        body: {
            title: 'Test Post',
            body: 'Content',
            userId: 1
        }
    });

    // 3. POST 요청: application/json → application/json+v2
    const result2 = await server({
        path: '/posts/add',
        method: 'post',
        requestContentType: 'application/json',
        responseContentType: 'application/json+v2'
    }, {
        parameters: {
            path: {},
            query: {},
            header: {}
        },
        body: {
            title: 'Test Post',
            body: 'Content',
            userId: 1
        }
    });
    
    // 4. POST 요청: application/json+v2 → application/json
    const result3 = await server({
        path: '/posts/add',
        method: 'post',
        requestContentType: 'application/json+v2',
        responseContentType: 'application/json'
    }, {
        parameters: {
            path: {},
            query: {},
            header: {}
        },
        body: {
            body: 'Content only',
            userId: 2
        }
    });
    
    // 5. POST 요청: application/json+v3 → application/json+v2
    const result4 = await server({
        path: '/posts/add',
        method: 'post',
        requestContentType: 'application/json+v3',
        responseContentType: 'application/json+v2'
    }, {
        parameters: {
            path: {},
            query: {},
            header: {}
        },
        body: {
            content: 'New content',
            authorId: 3
        }
    });
    
    // 6. GET 요청 with path parameter
    const result5 = await server({
        path: '/posts/{id}',
        method: 'get',
        responseContentType: 'application/json'
    }, {
        parameters: {
            path: { id: 123 },
            query: {},
            header: {}
        }
    });
    
    // 7. POST 요청 with path parameter + body
    const result6 = await server({
        path: '/office/{id}/add',
        method: 'post',
        requestContentType: 'application/json',
        responseContentType: 'application/json'
    }, {
        parameters: {
            path: { id: 456 },
            query: {},
            header: {}
        },
        body: {
            title: 'Office Document',
            description: 'Important doc'
        }
    });
    
    console.log('Simplified interface results:', {
        result1, result2, result3, result4, result5, result6
    });
}

// 🎯 타입 에러 테스트
function testTypeErrors() {
    console.log('=== Type Error Tests ===');
    
    // ❌ 이 코드들은 타입 에러를 발생시켜야 함!
    
    // 1. 잘못된 body 타입
    // server['[post:application/json:application/json]:/posts/add']({
    //     parameters: { path: {}, query: {}, header: {} },
    //     body: { wrongField: 'error' }, // 타입 에러!
    //     accept: 'application/json'
    // });
    
    // 2. 잘못된 응답 타입
    // const wrongServer = OpenApi.createServerImplementation(MyApiSpec, {
    //     '/posts/add': {
    //         post: {
    //             'application/json': {
    //                 'application/json': async (args) => {
    //                     return { wrongField: 'error' }; // 타입 에러!
    //                 }
    //             }
    //         }
    //     }
    // });
    
    console.log('Type error tests completed (commented out to avoid compilation errors)');
}

export { MyApiSpec, server, testSimplifiedInterface, testTypeErrors };

console.log('🎉 Final Demo: Simplified Server Interface Completed!');
// Type checking test
async function testTypeChecking() {
    // ✅ 올바른 사용법
    const result1 = await server({
        path: '/posts/add',
        method: 'post',
        requestContentType: 'application/json',
        responseContentType: 'application/json'
    }, {
        parameters: { path: {}, query: {}, header: {} },
        body: { title: 'Test', body: 'Content', userId: 1 }
    });

    // ✅ GET 요청 사용법
    const result3 = await server({
        path: '/posts/{id}',
        method: 'get',
        responseContentType: 'application/json'
    }, {
        parameters: { path: { id: 456 }, query: {}, header: {} }
    });

    // ❌ 잘못된 requestContentType 사용 시 타입 에러!
    // const result4 = await server({
    //     path: '/posts/add',
    //     method: 'post',
    //     requestContentType: 'text/plain',  // ❌ Type error: not assignable to valid content-types
    //     responseContentType: 'application/json'
    // }, { title: 'Test' });

    // ❌ 잘못된 responseContentType 사용 시 타입 에러!
    // const result5 = await server({
    //     path: '/posts/add',
    //     method: 'post',
    //     requestContentType: 'application/json',
    //     responseContentType: 'text/xml'  // ❌ Type error: not assignable to valid response types
    // }, { title: 'Test', body: 'Content', userId: 1 });

    console.log('Type checking test completed');
}

// Query & Header Parameters test spec
const QueryHeaderSpec = {
    paths: {
        '/posts/search': {
            get: {
                parameters: [
                    {
                        name: 'q',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Search query'
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        required: false,
                        schema: { type: 'number' },
                        description: 'Result limit'
                    },
                    {
                        name: 'Authorization',
                        in: 'header',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Auth token'
                    },
                    {
                        name: 'X-Custom-Header',
                        in: 'header',
                        required: false,
                        schema: { type: 'string' },
                        description: 'Custom header'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Search results',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            title: { type: 'string' }
                                        },
                                        required: ['id', 'title']
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

// 🚀 Query & Header Parameters 타입 추론 테스트
const queryHeaderServer = createSimpleServer(QueryHeaderSpec, {
    '/posts/search': {
        get: {
            'void': {
                'application/json': async (args) => {
                    // 🎯 완전한 타입 추론!
                    console.log('Query params:', args.parameters.query?.q);      // string (required)
                    console.log('Limit:', args.parameters.query?.limit);        // number | undefined (optional)
                    console.log('Auth:', args.parameters.header?.Authorization); // string (required)
                    console.log('Custom:', args.parameters.header?.['X-Custom-Header']); // string | undefined (optional)
                    
                    return [
                        { id: 1, title: 'Result 1' },
                        { id: 2, title: 'Result 2' }
                    ];
                }
            }
        }
    }
});

// 🎯 Query & Header Parameters 사용 테스트
async function testQueryHeaderParams() {
    console.log('=== Query & Header Parameters Test ===');
    
    const result = await queryHeaderServer({
        path: '/posts/search',
        method: 'get',
        responseContentType: 'application/json'
    }, {
        parameters: {
            path: {},
            query: {
                q: 'typescript',        // ✅ required string
                limit: 10              // ✅ optional number
            },
            header: {
                Authorization: 'Bearer token123',  // ✅ required string
                'X-Custom-Header': 'custom-value'  // ✅ optional string
            }
        }
    });
    
    console.log('Query & Header test result:', result);
}

export { QueryHeaderSpec, queryHeaderServer, testQueryHeaderParams };