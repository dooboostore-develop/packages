# 제5장: 프레임워크의 기반 - Simple-Boot Core 및 Front 연동

`Simple-Boot-HTTP-SSR`은 `Simple-Boot Core`와 `Simple-Boot-Front`라는 두 개의 강력한 프레임워크를 통합하여 서버사이드 렌더링(SSR) 환경을 구축합니다. 이 장에서는 이 세 프레임워크가 어떻게 유기적으로 연동되어 SSR 애플리케이션을 효율적으로 개발할 수 있도록 돕는지 알아봅니다.

## 5.1. Simple-Boot Core의 DI, AOP, 라우팅 활용

`Simple-Boot-HTTP-SSR`은 `SimpleBootHttpServer`를 상속받고, `SimpleBootHttpServer`는 다시 `SimpleApplication` (Simple-Boot Core의 메인 클래스)을 상속받습니다. 이러한 상속 구조를 통해 `Simple-Boot-HTTP-SSR`은 `Simple-Boot Core`의 모든 핵심 기능들을 서버 환경에서 그대로 활용합니다.

-   **의존성 주입 (DI):**
    -   `@Sim` 데코레이터로 정의된 모든 클래스(서비스, 컨트롤러 등)는 `Simple-Boot-HTTP-SSR`의 DI 컨테이너(`SimstanceManager`)에 의해 관리됩니다.
    -   서버 측 서비스나 라우트 핸들러는 생성자 주입을 통해 필요한 의존성을 자동으로 주입받을 수 있습니다.
-   **관점 지향 프로그래밍 (AOP):**
    -   `@Before`, `@After`, `@Around` 데코레이터를 사용하여 서버 측 메소드 호출 전후에 로깅, 성능 측정, 권한 확인 등 횡단 관심사를 적용할 수 있습니다.
-   **예외 처리 시스템:**
    -   `@ExceptionHandler` 데코레이터를 사용하여 서버 측 메소드나 클래스 레벨에서 발생하는 예외를 선언적으로 처리할 수 있습니다.
    -   전역 `advice`를 등록하여 서버 애플리케이션 전반의 예외를 일관되게 관리할 수 있습니다.
-   **라우팅:**
    -   `@Router`와 `@Route` 데코레이터를 사용하여 HTTP 요청을 서버 측 라우트 핸들러에 매핑합니다.
    -   `Simple-Boot-HTTP-SSR`은 이 라우팅 시스템을 통해 클라이언트의 HTML 페이지 요청을 `SSRFilter`로 전달하거나, API 요청을 해당 컨트롤러로 전달합니다.

### 예제: Simple-Boot Core 기능 활용 (서버 측)

```typescript
// server.ts (서버 측 코드)
import 'reflect-metadata';
import { SimpleBootHttpSSRServer, HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr';
import { Sim, Router, Route, Before, ExceptionHandler } from '@dooboostore/simple-boot';
import { GET, Mimes, RequestResponse, HttpStatus } from '@dooboostore/simple-boot-http-server';

// 1. DI, AOP, 예외 처리 기능을 포함하는 서비스
@Sim
class ProductService {
    private products: { id: number; name: string }[] = [
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Mouse' }
    ];

    // AOP: 메소드 실행 전 로깅
    @Before({ property: 'getProductById' })
    logBeforeProductFetch() {
        console.log('[AOP] Before fetching product.');
    }

    getProductById(id: number) {
        console.log(`[ProductService] Fetching product with ID: ${id}`);
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found.`);
        }
        return product;
    }

    // 예외 처리: 특정 에러 타입 처리
    @ExceptionHandler({ type: Error })
    handleProductError(rr: RequestResponse, error: Error) {
        console.error(`[ProductService] Caught error in handler: ${error.message}`);
        rr.resStatusCode(HttpStatus.NotFound).resWriteJson({ error: 'Product Not Found', message: error.message }).resEnd();
    }
}

// 2. 서버 측 라우터 (ProductService를 주입받아 사용)
@Sim
@Router({ path: '' })
class ServerAppRouter {
    constructor(private productService: ProductService) {}

    @Route({ path: '/api/products/{id}' })
    @GET({ res: { contentType: Mimes.ApplicationJson } })
    getProduct(rr: RequestResponse, routerModule: RouterModule) {
        const id = parseInt(routerModule.pathData?.id || '0');
        return this.productService.getProductById(id);
    }

    @Route({ path: '/api/hello' })
    @GET({ res: { contentType: Mimes.TextPlain } })
    helloApi() {
        return 'Hello from API!';
    }
}

const httpServerOption = new HttpSSRServerOption({
    listen: { port: 3000 },
    rootRouter: ServerAppRouter,
    // ... SSRFilter 설정 (이전 장 참조) ...
});

const app = new SimpleBootHttpSSRServer(httpServerOption);
app.run();

console.log('Simple-Boot-HTTP-SSR Core features example started.');

/*
터미널에서 다음 명령어로 테스트:
curl http://localhost:3000/api/products/1
curl http://localhost:3000/api/products/3 (존재하지 않는 상품)
curl http://localhost:3000/api/hello
*/
```

## 5.2. Simple-Boot-Front와의 통합 및 코드 공유

`Simple-Boot-HTTP-SSR`은 `SimpleBootFront` 인스턴스를 서버에서 직접 생성하고 실행합니다. 이는 서버와 클라이언트 간의 코드 공유를 가능하게 하는 핵심 메커니즘입니다.

-   **`SimpleBootHttpSSRFactory`:** `SimpleBootFront` 인스턴스를 생성하는 팩토리 클래스입니다. 서버와 클라이언트 모두에서 동일한 `SimpleBootFront` 설정을 공유할 수 있도록 돕습니다.
-   **`SSRFilter`:** 이 필터는 `SimpleBootFront` 인스턴스를 JSDOM 환경에서 실행하여 프론트엔드 컴포넌트들을 서버에서 렌더링합니다.
-   **코드 공유:** 라우팅 규칙, 서비스 로직, 컴포넌트 정의 등 많은 코드를 서버와 클라이언트에서 재사용할 수 있습니다. 이는 개발 생산성을 높이고 코드의 일관성을 유지하는 데 큰 이점이 있습니다.

### 예제: Simple-Boot-Front와의 통합 (개념적)

```typescript
// common-factory.ts (서버와 클라이언트 모두에서 사용)
import { SimpleBootHttpSSRFactory, SimFrontOption, SimpleBootFront } from '@dooboostore/simple-boot-http-server-ssr';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';

// 프론트엔드 컴포넌트 (서버와 클라이언트 모두에서 사용)
@Sim
@Component({ template: '<div>User ID: ${this.userId}$</div>' })
class UserProfileComponent {
  userId: string = '';
  onInit(routerModule: any) { // 클라이언트 측에서 라우팅 후 호출될 메소드
    this.userId = routerModule.pathData?.id;
  }
}

// 프론트엔드 라우터 (서버와 클라이언트 모두에서 사용)
@Sim
@Router({ path: '' })
@Component({ template: `<router dr-this="this.child"></router>` })
class FrontAppRouter {
  child?: any;
  canActivate(url: any, module: any) { this.child = module; }
  @Route({ path: '/users/{id}', target: UserProfileComponent })
  userRoute() {}
}

// SimpleBootFront 인스턴스 생성을 위한 팩토리
class FrontAppFactory extends SimpleBootHttpSSRFactory {
  async factory(simFrontOption: SimFrontOption, using: any[], domExcludes: any[]): Promise<SimpleBootFront> {
    const simpleBootFront = new SimpleBootFront(simFrontOption);
    // 루트 라우터 설정
    simpleBootFront.option.setRootRouter(FrontAppRouter);
    return simpleBootFront;
  }
}

export const frontAppFactory = new FrontAppFactory();
export const makeSimFrontOption = (window: any) => new SimFrontOption(window).setUrlType('path');

// server.ts (서버 측 코드 - SSRFilter 설정 부분)
// ...
const ssrOption = {
  frontDistPath: './dist/front',
  factorySimFrontOption: (window: any) => makeSimFrontOption(window),
  factory: frontAppFactory,
  // ...
};
const option = new HttpSSRServerOption({
  listen: { port: 3000 },
  filters: [new SSRFilter(ssrOption)],
});
const app = new SimpleBootHttpSSRServer(option);
app.run();
// ...

// client.ts (클라이언트 측 코드 - SimpleBootFront 초기화 부분)
// ...
const config = makeSimFrontOption(window);
const app = new SimpleBootFront(config);
app.run();
// ...
```

## 5.3. SSR 환경에 최적화된 통합

`Simple-Boot-HTTP-SSR`은 SSR 환경의 특성을 고려하여 `Simple-Boot Core` 및 `Simple-Boot-Front`와의 통합을 최적화합니다.

-   **JSDOM 환경에서의 실행:** `SimpleBootFront` 인스턴스는 실제 브라우저가 아닌 JSDOM 환경에서 실행됩니다. `Simple-Boot-HTTP-SSR`은 `JsdomInitializer`를 통해 `window`, `document`, `history`, `fetch` 등 필요한 전역 객체들을 JSDOM 환경에 맞게 모의(mock)하여 프론트엔드 코드가 오류 없이 실행되도록 합니다.
-   **데이터 하이드레이션:** `SaveAroundAfter`와 `LoadAroundBefore` 데코레이터를 통해 서버에서 가져온 데이터를 클라이언트로 효율적으로 전달하고 재활용하여 초기 로딩 성능을 최적화합니다.
-   **인스턴스 풀링:** `SimpleBootFront` 인스턴스를 풀로 관리하여 SSR 요청 처리의 오버헤드를 줄이고 동시성을 높입니다.
-   **Intent 기반 클라이언트-서버 통신:** `IntentSchemeFilter`를 통해 클라이언트와 서버 간의 동적인 데이터 통신을 `simple-boot-core`의 Intent 시스템을 활용하여 구현합니다.

이러한 통합을 통해 개발자는 단일 코드베이스로 서버와 클라이언트 모두에서 동작하는 고성능의 SSR 애플리케이션을 효율적으로 구축할 수 있습니다.

이 장에서는 `Simple-Boot-HTTP-SSR`이 `Simple-Boot Core` 및 `Simple-Boot-Front`와 어떻게 연동되어 SSR 환경에 최적화된 통합을 이루는지 알아보았습니다. 이로써 우리는 `Simple-Boot-HTTP-SSR`의 모든 주요 기능과 그 기반이 되는 설계 원리를 탐구했습니다.

다음 부록에서는 `Simple-Boot-HTTP-SSR` 아키텍처의 장단점을 객관적으로 평가하고, 프레임워크를 확장하거나 기여하는 방안, 그리고 SSR 프레임워크 개발자로서의 성장 로드맵에 대한 아이디어를 공유하겠습니다.
