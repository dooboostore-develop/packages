# 제2장: SSR 필터 - 요청 처리 파이프라인의 핵심

`Simple-Boot-HTTP-SSR`에서 서버사이드 렌더링(SSR)의 핵심 로직은 `SSRFilter`에 캡슐화되어 있습니다. 이 필터는 클라이언트의 HTML 페이지 요청을 가로채어 서버에서 프론트엔드 애플리케이션을 실행하고, 렌더링된 HTML을 클라이언트에 반환하는 역할을 합니다. 이 장에서는 `SSRFilter`의 동작 원리와 SSR 요청 처리 흐름, 그리고 데이터 하이드레이션 메커니즘에 대해 알아봅니다.

## 2.1. SSRFilter의 동작 원리

`SSRFilter`는 `simple-boot-http-server`의 `Filter` 인터페이스를 구현합니다. 이는 HTTP 요청 처리 파이프라인의 일부로서, 다른 필터들과 함께 요청을 가로채고 처리할 수 있음을 의미합니다.

-   **`proceedBefore` 메소드:** `SSRFilter`의 핵심 로직이 구현되는 곳입니다. 이 메소드는 HTML 페이지 요청을 감지하고, `SimpleBootFront` 인스턴스를 사용하여 SSR을 수행합니다.
-   **`ssrExcludeFilter`:** 특정 URL 패턴(예: `/api`, `/assets`)에 대해서는 SSR을 수행하지 않고, 정적 파일 서빙이나 API 라우팅 등 다른 필터나 라우트 핸들러로 요청을 넘기도록 설정할 수 있습니다.

### 구현 원리

`SSRFilter`의 `proceedBefore` 메소드는 다음과 같은 단계로 SSR 요청을 처리합니다.

1.  **요청 가로채기:** `rr.reqHasAcceptHeader(Mimes.TextHtml)` 등을 통해 HTML 페이지 요청인지 확인합니다.
2.  **`SimpleBootFront` 인스턴스 획득:** 1장에서 설명한 `simpleBootFrontQueue`에서 사용 가능한 `SimpleBootFront` 인스턴스를 가져옵니다.
3.  **JSDOM 환경 설정:** 획득한 `SimpleBootFront` 인스턴스에 연결된 JSDOM `window` 객체의 `location.href`를 현재 요청 URL로 설정하여, 프론트엔드 라우터가 올바른 경로를 인식하도록 합니다.
4.  **프론트엔드 라우팅 실행:** `SimpleBootFront` 인스턴스의 `goRouting()` 메소드를 호출하여 JSDOM 환경 내에서 프론트엔드 라우팅 및 컴포넌트 렌더링을 실행합니다. 이 과정에서 컴포넌트의 `onInit` 등 생명주기 훅이 호출되고, 필요한 데이터가 서버에서 로드됩니다.
5.  **HTML 추출:** 렌더링이 완료되면, JSDOM `document`의 `documentElement.outerHTML`을 통해 완성된 HTML 문자열을 추출합니다.
6.  **데이터 하이드레이션 주입:** 서버에서 로드된 데이터(`window.server_side_data`)를 HTML 내부에 `<script>` 태그로 삽입하여 클라이언트로 전달합니다. (자세한 내용은 2.3절에서 다룹니다.)
7.  **응답 전송:** 생성된 HTML을 클라이언트에 응답으로 보냅니다.
8.  **인스턴스 반환:** 사용이 완료된 `SimpleBootFront` 인스턴스를 다시 풀(`simpleBootFrontQueue`)에 반환합니다.

```typescript
// filters/SSRFilter.ts (개념적 - proceedBefore 메소드)
export class SSRFilter implements Filter {
  // ... constructor, onInit, makeFront 등 ...

  async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
    // 1. SSR 제외 필터링 (예: /api, /assets 경로)
    if (this.config.ssrExcludeFilter?.(rr)) {
      return false; // SSR 건너뛰고 다음 필터로 진행
    }

    // 2. HTML 요청인지 확인
    if (rr.reqHasAcceptHeader(Mimes.TextHtml) || rr.reqHasAcceptHeader(Mimes.All))) {
      // 3. SimpleBootFront 인스턴스 획득
      const simpleBootFront = await this.simpleBootFrontQueue.dequeue();
      try {
        // 4. JSDOM 환경 설정 및 프론트엔드 라우팅 실행
        const url = rr.reqUrlObj({host: 'localhost'}); // 서버 측 URL을 JSDOM 환경에 맞게 설정
        simpleBootFront.goRouting(url.toString()); // 프론트엔드 라우팅 실행

        // 5. HTML 추출 및 데이터 하이드레이션 주입
        let html = simpleBootFront.option.window.document.documentElement.outerHTML;
        const serverSideData = (simpleBootFront.option.window as any).server_side_data; // 서버에서 로드된 데이터
        if (serverSideData) {
          // ... <script> 태그로 HTML에 데이터 주입 로직 ...
        }

        // 6. 응답 전송
        await this.writeOkHtmlAndEnd({rr}, html);
      } finally {
        // 7. 인스턴스 반환
        this.simpleBootFrontQueue.enqueue(simpleBootFront);
      }
      return false; // SSR이 응답을 처리했으므로 다음 필터로 진행하지 않음
    }
    return true; // HTML 요청이 아니면 다음 필터로 진행
  }
}
```

## 2.2. SSR 요청 처리 흐름

클라이언트의 HTML 페이지 요청이 `Simple-Boot-HTTP-SSR`에 도달했을 때의 전체 흐름은 다음과 같습니다.

1.  **요청 수신:** `SimpleBootHttpServer`가 클라이언트 요청을 수신합니다.
2.  **필터 체인 시작:** `HttpServerOption`에 등록된 필터들이 순서대로 실행됩니다.
3.  **`SSRFilter` 실행:** `SSRFilter`의 `proceedBefore` 메소드가 호출됩니다.
    a.  요청이 SSR 대상인지 확인합니다 (`ssrExcludeFilter`).
    b.  `SimpleBootFront` 인스턴스 풀에서 인스턴스를 가져옵니다.
    c.  가져온 인스턴스의 JSDOM 환경에 요청 URL을 설정합니다.
    d.  `SimpleBootFront`의 `goRouting()`을 호출하여 프론트엔드 라우팅 및 컴포넌트 렌더링을 서버에서 실행합니다.
    e.  렌더링 과정에서 컴포넌트들이 필요한 데이터를 서버에서 가져옵니다.
    f.   렌더링이 완료되면, JSDOM `document`에서 HTML을 추출하고, 서버에서 가져온 데이터를 HTML에 삽입합니다.
    g.  생성된 HTML을 클라이언트에 응답으로 전송합니다.
    h.  `SimpleBootFront` 인스턴스를 풀에 반환합니다.
4.  **응답 완료:** 클라이언트는 서버에서 완전히 렌더링된 HTML을 받아 즉시 페이지를 표시할 수 있습니다.
5.  **클라이언트 측 하이드레이션:** 클라이언트의 브라우저에서 JavaScript가 로드되면, `SimpleBootFront`는 이미 렌더링된 HTML을 재사용하고, 서버에서 전달받은 데이터를 사용하여 UI를 활성화(하이드레이션)합니다. 이 과정에서 중복된 API 호출은 발생하지 않습니다.

## 2.3. 데이터 하이드레이션(Data Hydration) 메커니즘

데이터 하이드레이션은 SSR의 핵심 개념 중 하나로, 서버에서 렌더링 시 사용된 데이터를 클라이언트로 전달하여, 클라이언트 측 JavaScript가 페이지를 다시 렌더링하지 않고도 UI를 활성화할 수 있도록 하는 기술입니다. `Simple-Boot-HTTP-SSR`은 `SaveAroundAfter`와 `LoadAroundBefore` 데코레이터를 통해 이를 자동화합니다.

-   **`window.server_side_data`:** `Simple-Boot-HTTP-SSR`은 서버에서 렌더링된 데이터를 JSDOM `window` 객체의 `server_side_data` 속성에 저장합니다. 이 데이터는 최종 HTML에 `<script>` 태그 형태로 삽입되어 클라이언트로 전달됩니다.

### 구현 원리 (개념적)

1.  **서버 측 데이터 저장 (`SaveAroundAfter`):**
    -   `@dooboostore/simple-boot`의 `@Around` 데코레이터와 유사하게 동작합니다.
    -   서버에서 실행되는 서비스 메소드(예: 데이터베이스 조회, 외부 API 호출)에 `SaveAroundAfter`를 적용하면, 해당 메소드의 반환 값이 자동으로 `window.server_side_data`에 저장됩니다.
    -   이때, 메소드가 속한 `@Sim` 클래스의 `scheme`과 메소드 이름을 조합하여 고유한 키를 생성합니다.

2.  **클라이언트 측 데이터 로드 (`LoadAroundBefore`):**
    -   클라이언트에서 실행되는 서비스 메소드에 `LoadAroundBefore`를 적용하면, 해당 메소드가 호출되기 전에 `window.server_side_data`에서 동일한 키로 저장된 데이터가 있는지 확인합니다.
    -   데이터가 있다면, 실제 메소드 실행을 건너뛰고 `window.server_side_data`에 있는 데이터를 즉시 반환합니다. 이는 클라이언트에서 중복 API 호출을 방지합니다.

이러한 메커니즘을 통해 서버에서 데이터를 가져와 렌더링한 후, 그 데이터를 클라이언트에 그대로 전달하여 클라이언트 측에서 다시 데이터를 가져올 필요 없이 UI를 활성화할 수 있습니다. 이는 초기 로딩 속도를 크게 향상시키고 서버 부하를 줄이는 데 기여합니다.

다음 장에서는 데이터 하이드레이션의 핵심인 `SaveAroundAfter`와 `LoadAroundBefore` 데코레이터의 상세 구현과 사용법을 더 깊이 탐구하겠습니다.
