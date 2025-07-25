# 제5장: 프레임워크의 기반 - Simple-Boot Core 연동

`Simple-Boot-HTTP-Server`는 `Simple-Boot Core`의 강력한 기능들을 Node.js 서버 환경에서 활용할 수 있도록 긴밀하게 연동되어 있습니다. 이 장에서는 `Simple-Boot-HTTP-Server`가 `Simple-Boot Core`의 의존성 주입(DI), 관점 지향 프로그래밍(AOP), 예외 처리 시스템을 어떻게 통합하고 활용하는지 알아봅니다.

## 5.1. Simple-Boot Core의 DI, AOP, 예외 처리 활용

`Simple-Boot-HTTP-Server`는 `SimpleApplication` (Simple-Boot Core의 메인 클래스)을 상속받습니다. 이는 `Simple-Boot-HTTP-Server` 인스턴스가 곧 `SimpleApplication` 인스턴스이기도 하다는 것을 의미합니다. 따라서 `Simple-Boot Core`에서 제공하는 모든 핵심 기능들을 서버 환경에서 그대로 사용할 수 있습니다.

-   **의존성 주입 (DI):**
    -   `@Sim` 데코레이터로 정의된 모든 클래스(서비스, 컨트롤러 등)는 `Simple-Boot-HTTP-Server`의 DI 컨테이너(`SimstanceManager`)에 의해 관리됩니다.
    -   생성자 주입을 통해 필요한 의존성을 자동으로 주입받을 수 있습니다.
    -   `app.sim(MyService)`와 같이 `SimpleBootHttpServer` 인스턴스를 통해 DI 컨테이너로부터 객체를 조회할 수 있습니다.

-   **관점 지향 프로그래밍 (AOP):**
    -   `@Before`, `@After`, `@Around` 데코레이터를 사용하여 메소드 호출 전후에 공통 로직을 삽입할 수 있습니다.
    -   이는 로깅, 성능 측정, 권한 확인 등 횡단 관심사를 비즈니스 로직과 분리하는 데 매우 효과적입니다.

-   **예외 처리 시스템:**
    -   `@ExceptionHandler` 데코레이터를 사용하여 메소드나 클래스 레벨에서 발생하는 예외를 선언적으로 처리할 수 있습니다.
    -   전역 `advice`를 등록하여 애플리케이션 전반의 예외를 일관되게 관리할 수 있습니다.

### 예제: Simple-Boot Core 기능 활용

```typescript
import 'reflect-metadata';
import { SimpleBootHttpServer, HttpServerOption, RequestResponse, GET, Mimes, HttpStatus } from '@dooboostore/simple-boot-http-server';
import { Sim, Router, Route, Before, After, Around, ExceptionHandler, SimOption } from '@dooboostore/simple-boot';
import { ReqHeader } from '@dooboostore/simple-boot-http-server/models/datas/ReqHeader';

// 1. DI, AOP, 예외 처리 기능을 포함하는 서비스
@Sim
class UserService {
    private users: { id: number; name: string }[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ];

    // AOP: 메소드 실행 전 로깅
    @Before({ property: 'getUserById' })
    logBeforeGetUser() {
        console.log('[AOP] Before getUserById method.');
    }

    // AOP: 메소드 실행 후 로깅
    @After({ property: 'getUserById' })
    logAfterGetUser() {
        console.log('[AOP] After getUserById method.');
    }

    // AOP: Around를 사용하여 인자 수정 및 반환 값 검증
    @Around({
        before: (obj, prop, args) => {
            console.log(`[AOP] Around before ${String(prop)} with args:`, args);
            // 인자가 0보다 작으면 0으로 변경
            return args.map(arg => (typeof arg === 'number' && arg < 0) ? 0 : arg);
        },
        after: (obj, prop, args, result) => {
            console.log(`[AOP] Around after ${String(prop)} with result:`, result);
            if (!result) {
                throw new Error('User not found after processing!'); // 강제 에러 발생
            }
            return result;
        }
    })
    getUserById(id: number) {
        console.log(`[UserService] Fetching user with ID: ${id}`);
        const user = this.users.find(u => u.id === id);
        if (!user) {
            throw new Error(`User with ID ${id} not found in DB.`);
        }
        return user;
    }

    // 예외 처리: 특정 에러 타입 처리
    @ExceptionHandler({ type: Error })
    handleAnyError(rr: RequestResponse, error: Error) {
        console.error(`[UserService] Caught error in handler: ${error.message}`);
        rr.resStatusCode(HttpStatus.InternalServerError).resWriteJson({ error: 'Server Error', message: error.message }).resEnd();
    }
}

// 2. 라우터: UserService를 주입받아 사용
@Sim
@Router({ path: '' })
export class AppRouter {
    constructor(private userService: UserService) {}

    @Route({ path: '/user/{id}' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getUser(rr: RequestResponse, routerModule: RouterModule) {
        const id = parseInt(routerModule.pathData?.id || '0');
        try {
            const user = this.userService.getUserById(id);
            return user;
        } catch (e: any) {
            // UserService의 @ExceptionHandler가 처리하므로 여기서는 catch되지 않음
            // 만약 UserService에 핸들러가 없었다면 여기서 catch 가능
            console.error('This should not be reached if UserService handles the error.', e.message);
            throw e; // 다시 던져서 전역 핸들러로 보낼 수도 있음
        }
    }

    @Route({ path: '/hello' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    hello(rr: RequestResponse, header: ReqHeader) {
        return `Hello from Simple-Boot-HTTP-Server! Your User-Agent is: ${header['user-agent']}`;
    }
}

// 3. 서버 옵션 설정
const httpServerOption = new HttpServerOption({
    listen: { port: 3000 },
    // globalAdvice: GlobalErrorHandlerAdvice, // 필요시 전역 예외 핸들러 등록
});

// 4. SimpleBootHttpServer 인스턴스 생성 및 실행
const app = new SimpleBootHttpServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-Server Core features example started.');

/*
터미널에서 다음 명령어로 테스트:
curl http://localhost:3000/user/1
curl http://localhost:3000/user/3 (존재하지 않는 사용자)
curl http://localhost:3000/user/-5 (Around 데코레이터 테스트)
curl http://localhost:3000/hello
*/
```

## 5.2. 서버 환경에 최적화된 통합

`Simple-Boot-HTTP-Server`는 `Simple-Boot Core`의 기능을 활용하면서도, Node.js 서버 환경의 특성을 고려하여 최적화된 통합을 제공합니다.

-   **Node.js `http`/`https` 모듈 직접 활용:** Node.js의 내장 HTTP 서버 모듈을 직접 사용하여, 저수준(low-level)의 요청/응답 제어와 성능 최적화를 가능하게 합니다.
-   **스트림 기반 요청/응답 처리:** `RequestResponse` 객체는 요청 바디를 스트림으로 읽고, 응답 바디를 스트림으로 쓸 수 있도록 설계되어 대용량 데이터 처리에도 효율적입니다.
-   **미들웨어/필터/엔드포인트 시스템:** Express나 Koa와 유사한 미들웨어 패턴을 필터와 엔드포인트 시스템으로 추상화하여, 요청 처리 파이프라인을 유연하게 구성할 수 있습니다.
-   **세션 관리:** 웹 애플리케이션의 상태 유지를 위한 세션 관리 기능을 내장하여 개발 편의성을 높입니다.
-   **파일 업로드 처리:** `multipart/form-data` 요청을 자동으로 파싱하여 파일 업로드를 쉽게 처리할 수 있도록 돕습니다.

이러한 통합을 통해 개발자는 백엔드 개발에 필요한 DI, AOP, 예외 처리 패턴을 일관되게 적용할 수 있으며, Node.js의 강력한 비동기 처리 능력과 결합하여 고성능의 웹 서버 애플리케이션을 구축할 수 있습니다.

이 장에서는 `Simple-Boot-HTTP-Server`가 `Simple-Boot Core`의 강력한 기능들을 어떻게 활용하여 서버 환경에 최적화된 통합을 이루는지 알아보았습니다. 이로써 우리는 `Simple-Boot-HTTP-Server`의 모든 주요 기능과 그 기반이 되는 설계 원리를 탐구했습니다.

다음 부록에서는 `Simple-Boot-HTTP-Server` 아키텍처의 장단점을 객관적으로 평가하고, 프레임워크를 확장하거나 기여하는 방안, 그리고 웹 서버 프레임워크 개발자로서의 성장 로드맵에 대한 아이디어를 공유하겠습니다.
