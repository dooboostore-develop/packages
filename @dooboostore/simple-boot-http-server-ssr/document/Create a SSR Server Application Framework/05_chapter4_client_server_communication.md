# 제4장: 타입-세이프(Type-Safe) 클라이언트-서버 통신: SymbolIntentApiServiceProxy

웹 애플리케이션, 특히 SSR(서버사이드 렌더링) 환경에서는 프론트엔드와 백엔드 간의 원활하고 효율적인 데이터 통신이 필수적입니다. 하지만 전통적인 REST API 방식은 DTO(Data Transfer Object)의 불일치, 반복적인 API 클라이언트 코드 작성, URL 관리의 번거로움 등 여러 문제를 야기할 수 있습니다.

`Simple-Boot-HTTP-SSR`은 이러한 문제들을 해결하기 위해 심볼(Symbol) 기반의 프록시(Proxy) 통신 메커니즘을 제공합니다. 이 아키텍처의 핵심은 **프론트엔드와 백엔드가 동일한 서비스 인터페이스를 공유**하고, **프록시가 실제 네트워크 통신을 자동으로 처리**하여 마치 백엔드 서비스를 로컬에서 직접 호출하는 것처럼 만들어주는 것입니다.

이 장에서는 `SymbolIntentApiServiceProxy`와 `IntentSchemeFilter`를 사용하여 타입 안전성을 보장하고 개발 생산성을 극대화하는 통신 방법을 `LayerService` 예제를 통해 알아보겠습니다.

## 4.1. 핵심 구성 요소

이 통신 모델은 몇 가지 핵심 요소로 구성됩니다.

-   **서비스 인터페이스 (Shared Interface)**: 프론트엔드와 백엔드에서 공통으로 사용할 서비스의 규약입니다. TypeScript의 `interface`와 고유한 `Symbol`로 정의되며, 양쪽 코드베이스에서 모두 참조됩니다.
-   **`SymbolIntentApiServiceProxy`**: 프론트엔드 서비스에 적용되는 프록시입니다. 서비스의 메소드 호출을 가로채, 약속된 규칙(예: `POST /api/{서비스심볼}/{메소드명}`)에 따라 HTTP 요청을 자동으로 생성하여 서버에 전송합니다.
-   **`IntentSchemeFilter`**: 백엔드의 게이트웨이 역할을 하는 필터입니다. 프록시가 보낸 요청을 받아, URL에 명시된 서비스 심볼과 메소드명을 기반으로 실제 백엔드 서비스를 찾아 해당 메소드를 실행하고 그 결과를 반환합니다.
-   **백엔드 서비스 (Backend Service)**: 서비스 인터페이스의 실제 구현체로, 비즈니스 로직을 수행합니다.
-   **프론트엔드 서비스 (Frontend Service)**: 서비스 인터페이스의 프론트엔드 구현체로, 실제 내용은 비어있고 프록시 설정만으로 동작합니다.

## 4.2. 구현 예제: `LayerService` 통신 과정

`lazycollect` 애플리케이션의 `LayerService`가 어떻게 프록시 통신을 구현했는지 단계별로 살펴보겠습니다.

### 1단계: (공통) 서비스 인터페이스 정의

가장 먼저 프론트엔드와 백엔드가 공유할 `LayerService` 인터페이스를 정의합니다. 이 파일은 공용 `src` 디렉토리에 위치하여 양쪽에서 모두 `import` 할 수 있어야 합니다.

**`apps/lazycollect/src/service/LayerService.ts`**
```typescript
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { Config } from '@dooboostore/app-system/proxy/SymbolIntentApiServiceProxy';
import { Layers } from '@src/entities/Layers';

// 서비스의 고유 식별자로 사용될 심볼
export namespace LayerService {
  export const SYMBOL = Symbol.for('LayerService');
  // ... 요청/응답 타입 정의 ...
  export type MyWorldLayersRequest = { sort?: Sort<Layers> };
  export type MyWorldLayersResponse = Layers[];
}

// 프론트/백엔드가 공유하는 인터페이스
export interface LayerService {
  // ... 다른 메소드들 ...

  myWorldLayers(
    request: LayerService.MyWorldLayersRequest,
    // 이 두 번째 인수는 프록시에 의해 자동으로 주입될 콜백 함수입니다.
    // 프론트엔드에서는 이 함수를 호출하여 API 요청을 보냅니다.
    // 백엔드에서는 이 인수로 실제 RequestResponse 객체를 받습니다.
    data?: RequestResponse | ((config?: Config<LayerService.MyWorldLayersRequest>) => Promise<LayerService.MyWorldLayersResponse>)
  ): Promise<LayerService.MyWorldLayersResponse>;
}
```
인터페이스의 각 메소드는 두 번째 인수로 `data`를 가집니다. 이 인수는 프록시 메커니즘의 핵심으로, 프론트엔드에서는 API 호출 함수로, 백엔드에서는 `RequestResponse` 객체로 동작합니다.

### 2단계: (프론트엔드) 프록시 서비스 구현

프론트엔드에서는 `LayerService` 인터페이스를 구현하고, `@Sim` 데코레이터에 `proxy` 설정을 추가합니다.

**`apps/lazycollect/front/service/FrontLayerService.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { LayerService } from '@src/service/LayerService';
import { Config, SymbolIntentApiServiceProxy } from '@dooboostore/app-system/proxy/SymbolIntentApiServiceProxy';

@Sim({
  symbol: LayerService.SYMBOL, // 백엔드와 동일한 심볼 사용
  proxy: SymbolIntentApiServiceProxy // 프록시 적용
})
export class FrontLayerService implements LayerService {
  // 메소드의 실제 구현은 단 한 줄입니다.
  // 프록시가 주입해준 data 함수를 호출하여 요청 데이터를 전달합니다.
  myWorldLayers(request: LayerService.MyWorldLayersRequest, data?: ((config?: Config<...>) => Promise<...>): Promise<LayerService.MyWorldLayersResponse> {
    return data!({ body: request });
  }

  // ... 다른 메소드들도 동일한 패턴으로 구현 ...
}
```
`@Sim` 데코레이터에 `proxy: SymbolIntentApiServiceProxy`를 추가하는 것만으로 모든 설정이 끝납니다. 각 메소드는 프록시가 주입한 `data` 함수를 호출하기만 하면, 프록시가 알아서 서버로 HTTP 요청을 보내고 응답을 반환해 줍니다.

### 3단계: (백엔드) 서비스 구현

백엔드에서는 `LayerService` 인터페이스의 실제 비즈니스 로직을 구현합니다.

**`apps/lazycollect/backend/service/layer/BackLayerService.ts`**
```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { LayerService } from '@src/service/LayerService';
import { DatabaseService } from '@backend/service/database';
import { SecurityService } from '@backend/service/SecurityService';
// ...

@Sim({ symbol: LayerService.SYMBOL }) // 프론트엔드와 동일한 심볼 사용
export class BackLayerService implements LayerService {
  constructor(
    private databaseService: DatabaseService,
    private securityService: SecurityService
  ) {}

  // 실제 비즈니스 로직 구현
  async myWorldLayers(request: LayerService.MyWorldLayersRequest, rr?: RequestResponse): Promise<LayerService.MyWorldLayersResponse> {
    return await this.databaseService.transaction(async (entityManager) => {
      const user = await this.securityService.verifyAccessToken({ rr, entityManager });
      if (user.worldSeq) {
        // ... 데이터베이스 조회 로직 ...
        return await layersRepository.find({ where: { worldSeq: user.worldSeq, ... } });
      } else {
        throw new NotFoundError();
      }
    });
  }

  // ... 다른 메소드들 구현 ...
}
```
백엔드 서비스는 프론트엔드와 동일한 `LayerService.SYMBOL`을 사용하여 `Sim` 컨테이너에 등록됩니다. `IntentSchemeFilter`는 이 심볼을 사용하여 요청을 처리할 올바른 서비스를 찾습니다.

### 4단계: (백엔드) 서버 필터 설정

마지막으로, 백엔드 서버의 `Filter` 목록에 `IntentSchemeFilter`를 추가합니다.

**`apps/lazycollect/backend/index.ts`**
```typescript
// ...
import { IntentSchemeFilter } from '@dooboostore/simple-boot-http-server-ssr/filters/IntentSchemeFilter';

// ... 서버 설정 ...
const option = new HttpSSRServerOption({
    // ...
    filters: [
      // ... 다른 필터들 ...
      IntentSchemeFilter // 프록시 요청을 처리할 필터 등록
    ],
    // ...
});

const ssr = new SimpleBootHttpSSRServer(option);
await ssr.run(otherInstanceSim);
```
`IntentSchemeFilter`는 `/api/{서비스심볼}/{메소드명}` 형태의 URL로 들어오는 모든 요청을 감지하고 처리하는 역할을 합니다.

## 4.3. 통신 과정 요약

모든 설정이 완료되면, 다음과 같은 흐름으로 통신이 이루어집니다.

1.  프론트엔드 컴포넌트에서 `layerService.myWorldLayers({ sort: [...] })`를 호출합니다.
2.  `SymbolIntentApiServiceProxy`가 이 호출을 가로챕니다.
3.  프록시는 `POST /api/LayerService/myWorldLayers` 와 같은 HTTP 요청을 생성합니다. 요청 본문(body)에는 `myWorldLayers`의 첫 번째 인자인 `request` 객체가 직렬화되어 포함됩니다.
4.  백엔드의 `IntentSchemeFilter`가 이 요청을 수신합니다.
5.  필터는 URL에서 서비스 심볼(`LayerService`)과 메소드명(`myWorldLayers`)을 파싱합니다.
6.  `Sim` 컨테이너에서 `LayerService.SYMBOL`을 키로 가진 `BackLayerService` 인스턴스를 찾습니다.
7.  찾아낸 인스턴스의 `myWorldLayers` 메소드를 요청 본문 데이터와 `RequestResponse` 객체를 인자로 하여 실행합니다.
8.  메소드 실행 결과를 직렬화하여 HTTP 응답으로 반환합니다.
9.  프론트엔드의 프록시는 이 응답을 받아 역직렬화한 후, 원래 호출자에게 `Promise` 결과로 전달합니다.

## 4.4. 결론

`SymbolIntentApiServiceProxy`를 사용하는 아키텍처는 다음과 같은 강력한 장점을 제공합니다.

-   **타입 안전성**: 클라이언트와 서버가 동일한 인터페이스를 공유하므로, API 명세가 변경되면 컴파일 시점에 오류를 발견할 수 있습니다.
-   **코드 중복 제거**: 반복적인 `fetch`나 `axios` 같은 API 클라이언트 코드를 작성할 필요가 전혀 없습니다.
-   **개발 생산성 향상**: 개발자는 네트워크 통신이라는 부가적인 작업을 신경 쓸 필요 없이, 양쪽의 비즈니스 로직 구현에만 집중할 수 있습니다.

이처럼 `Simple-Boot-HTTP-SSR`이 제공하는 심볼 기반 프록시 통신은 현대적인 웹 애플리케이션에 필수적인 견고하고 유지보수하기 쉬운 클라이언트-서버 아키텍처를 구축하는 최고의 방법입니다.