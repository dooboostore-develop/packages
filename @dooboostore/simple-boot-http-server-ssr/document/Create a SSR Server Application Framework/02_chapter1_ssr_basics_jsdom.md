# 제1장: SSR의 기본 - SimpleBootHttpSSRServer와 JSDOM 통합

서버사이드 렌더링(SSR)은 클라이언트 측 JavaScript 애플리케이션을 서버에서 미리 렌더링하여 초기 HTML을 생성하는 기술입니다. 이 장에서는 `Simple-Boot-HTTP-SSR`의 핵심인 `SimpleBootHttpSSRServer`의 역할과, 서버 환경에서 브라우저와 유사한 DOM 환경을 구축하기 위한 JSDOM 통합, 그리고 `SimpleBootFront` 인스턴스 풀 관리 메커니즘에 대해 알아봅니다.

## 1.1. SimpleBootHttpSSRServer의 역할과 초기화

`SimpleBootHttpSSRServer`는 `SimpleBootHttpServer`를 상속받아 HTTP 서버 기능을 제공하면서, SSR에 특화된 로직을 추가합니다. 주요 역할은 다음과 같습니다.

-   **SSR 요청 처리:** 클라이언트로부터 HTML 페이지 요청이 들어오면, 이를 서버에서 렌더링하여 응답합니다.
-   **`SimpleBootFront` 인스턴스 관리:** 프론트엔드 애플리케이션(`SimpleBootFront`) 인스턴스를 생성하고 관리합니다.
-   **JSDOM 환경 제공:** 서버에서 프론트엔드 코드를 실행할 수 있도록 JSDOM을 통해 가상 브라우저 환경을 제공합니다.

`SimpleBootHttpSSRServer` 인스턴스는 `new SimpleBootHttpSSRServer(option)` 형태로 생성되며, `run()` 메소드를 호출하여 서버를 시작합니다.

```typescript
// SimpleBootHttpSSRServer.ts (개념적)
import { SimpleBootHttpServer } from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { HttpSSRServerOption } from './option/HttpSSRServerOption';

export class SimpleBootHttpSSRServer extends SimpleBootHttpServer {
  constructor(option?: HttpSSRServerOption) {
    super(option); // SimpleBootHttpServer 상속
  }

  // run 메소드는 SimpleBootHttpServer의 run을 호출하여 서버를 시작합니다.
  // SSR 관련 로직은 주로 SSRFilter에서 처리됩니다.
}

// server.ts (서버 진입점 예시)
import 'reflect-metadata';
import { SimpleBootHttpSSRServer } from '@dooboostore/simple-boot-http-server-ssr/SimpleBootHttpSSRServer';
import { HttpSSRServerOption } from '@dooboostore/simple-boot-http-server-ssr/option/HttpSSRServerOption';
import { SSRFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/SSRFilter';
import Factory from './bootfactory'; // SimpleBootFront 인스턴스 생성을 위한 팩토리

const ssrOption = {
  frontDistPath: './dist/front',
  factorySimFrontOption: (window: any) => new SimFrontOption(window).setUrlType('path'),
  factory: Factory,
  poolOption: { max: 5, min: 2 }, // SimpleBootFront 인스턴스 풀 설정
  using: [],
  domExcludes: [],
};

const option = new HttpSSRServerOption({
  listen: { port: 3000 },
  filters: [new SSRFilter(ssrOption)], // SSRFilter 등록
});

const app = new SimpleBootHttpSSRServer(option);
app.run();

console.log('SSR Server started on port 3000');
```

## 1.2. JSDOM을 활용한 서버 측 가상 DOM 환경 구축

프론트엔드 애플리케이션은 브라우저의 DOM(Document Object Model) 환경에 의존하여 동작합니다. 서버에서 이 코드를 실행하려면 브라우저와 유사한 DOM 환경을 모의(mock)해야 합니다. `Simple-Boot-HTTP-SSR`은 `jsdom` 라이브러리를 사용하여 이를 구현합니다.

-   **`jsdom`:** Node.js 환경에서 웹 표준을 구현한 JavaScript 라이브러리로, HTML 문서를 파싱하고 DOM 트리를 생성하며, `window`, `document` 객체 등을 제공합니다.
-   **`JsdomInitializer`:** `jsdom` 인스턴스를 생성합니다.

### 구현 원리

`JsdomInitializer`는 프론트엔드 애플리케이션의 `index.html` 파일을 읽어와 `JSDOM.JSDOM.fromFile()` 메소드를 사용하여 `jsdom` 인스턴스를 생성합니다. 

```typescript
// initializers/JsdomInitializer.ts (개념적)
import * as JSDOM from 'jsdom';
import fs from 'fs';
import path from 'path';

export class JsdomInitializer {
  constructor(private frontDistPath: string, private frontDistIndexFileName: string, private reconfigureSettings?: JSDOM.ReconfigureSettings) {}

  async run(): Promise<JSDOM.JSDOM> {
    const pathStr = path.join(this.frontDistPath, this.frontDistIndexFileName);
    const jsdom = await JSDOM.JSDOM.fromFile(pathStr, {});
    return jsdom;
  }
}
```

## 1.3. SimpleBootFront 인스턴스 풀 관리

SSR은 요청이 들어올 때마다 프론트엔드 애플리케이션을 초기화하고 렌더링해야 합니다. 이 과정은 비용이 많이 들 수 있으므로, `Simple-Boot-HTTP-SSR`은 `SimpleBootFront` 인스턴스를 풀(Pool)로 관리하여 성능을 최적화합니다.

-   **인스턴스 풀:** 미리 생성된 `SimpleBootFront` 인스턴스들을 모아두는 곳입니다.
-   **`AsyncBlockingQueue`:** `SimpleBootFront` 인스턴스들을 관리하는 큐(Queue)로, 요청이 들어오면 풀에서 인스턴스를 가져오고, 사용이 끝나면 다시 풀에 반환합니다. 풀에 인스턴스가 없으면 새로운 인스턴스를 생성합니다.

### 구현 원리

`SSRFilter`는 `onInit` 메소드에서 `config.poolOption.min` 설정에 따라 최소 개수의 `SimpleBootFront` 인스턴스를 미리 생성하여 큐에 넣어둡니다. 요청이 들어오면 `simpleBootFrontQueue.dequeue()`를 통해 풀에서 인스턴스를 가져오고, SSR 렌더링이 완료되면 `simpleBootFrontQueue.enqueue()`를 통해 다시 풀에 반환합니다. 이를 통해 인스턴스 생성 비용을 줄이고, 동시 요청을 효율적으로 처리할 수 있습니다.

```typescript
// filters/SSRFilter.ts (개념적)
import { AsyncBlockingQueue } from '@dooboostore/core/queues/AsyncBlockingQueue';

export class SSRFilter implements Filter {
    private simpleBootFrontPool: SimpleBootFront[] = []; // 실제 인스턴스 저장
    private simpleBootFrontQueue = new AsyncBlockingQueue<SimpleBootFront>(); // 큐

    constructor(public config: FactoryAndParams, public otherInstanceSim?: Map<ConstructorType<any>, any>) {
        // ...
    }

    async onInit(app: SimpleBootHttpServer) {
        // 서버 시작 시 최소 개수의 인스턴스 미리 생성하여 큐에 추가
        for (let i = 0; i < this.config.poolOption.min; i++) {
            this.enqueueFrontApp(await this.makeFront(await this.makeJsdom()));
        }
    }

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        // ... SSR 제외 필터링 ...

        // 큐에서 SimpleBootFront 인스턴스 가져오기
        const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
        try {
            // ... SSR 렌더링 로직 ...
        } finally {
            // 사용 완료 후 인스턴스를 다시 큐에 반환
            this.simpleBootFrontQueue.enqueue(simpleBootFront);
        }
        return false; // SSR이 응답을 처리했으므로 다음 필터로 진행하지 않음
    }

    // makeFront: JSDOM 환경에서 SimpleBootFront 인스턴스를 생성하는 메소드
    // enqueueFrontApp: 생성된 인스턴스를 풀과 큐에 추가하는 메소드
}
```

이 장에서는 `Simple-Boot-HTTP-SSR`의 기본적인 구조와 SSR을 위한 JSDOM 환경 구축, 그리고 `SimpleBootFront` 인스턴스 풀 관리 메커니즘을 살펴보았습니다. 다음 장에서는 SSR 요청 처리의 핵심인 `SSRFilter`의 동작 원리와 데이터 하이드레이션에 대해 더 깊이 탐구하겠습니다.
