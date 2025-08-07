# 제5장: 프레임워크 연동과 확장성

`@dooboostore/app-system`은 독립적인 유틸리티 및 서비스 모음이지만, `@dooboostore` 생태계의 다른 프레임워크들(`simple-boot`, `simple-boot-front`, `dom-render` 등)과 긴밀하게 연동될 때 그 진정한 가치를 발휘합니다. 이 장에서는 `app-system`이 다른 프레임워크들과 어떻게 통합되는지, 그리고 시스템의 확장성을 어떻게 설계하는지 알아봅니다.

## 5.1. Simple-Boot 생태계와의 연동

`app-system`은 `simple-boot-core`의 의존성 주입(DI) 컨테이너를 기반으로 구축됩니다. 이는 `app-system`의 모든 서비스와 컴포넌트가 `@Sim` 데코레이터로 등록되어 DI 컨테이너의 관리를 받는다는 것을 의미합니다.

-   **DI를 통한 통합:** `ApiService`, `AlertService` 등 `app-system`의 모든 서비스는 `simple-boot-core`의 `SimstanceManager`에 의해 관리됩니다. 따라서 `simple-boot-front`의 컴포넌트나 `simple-boot-http-server`의 라우트 핸들러에서 필요한 `app-system` 서비스를 생성자 주입을 통해 쉽게 사용할 수 있습니다.
-   **`dom-render`와의 통합:** `app-system`의 UI 컴포넌트들(Checkbox, Details, PromiseSwitch 등)은 `simple-boot-front`의 `@Component` 데코레이터와 `dom-render`의 템플릿 문법을 사용하여 구현됩니다. `simple-boot-front`는 `app-system`의 컴포넌트들을 `dom-render`가 렌더링할 수 있는 형태로 변환하여 통합합니다.
-   **`simple-boot-http-server-ssr`와의 통합:** `ApiService`의 `SymbolIntentApiServiceProxy`와 `simple-boot-http-server-ssr`의 `IntentSchemeFilter`는 Intent 기반의 클라이언트-서버 통신을 가능하게 하여, SSR 환경에서 서버와 클라이언트 간의 데이터 교환을 효율적으로 처리합니다.

### 예제: Simple-Boot 생태계 통합

```typescript
// 이 예제는 여러 파일에 걸쳐 구현되므로, 개념적인 코드 흐름을 보여줍니다.
// 실제 실행을 위해서는 각 프레임워크의 설정과 빌드 과정이 필요합니다.

// common/services/MySharedService.ts (Simple-Boot Core를 사용하는 공통 서비스)
import 'reflect-metadata';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

@Sim
export class MySharedService {
  getSharedData(): string {
    return 'Data from MySharedService';
  }
}

// front/components/MyFrontComponent.ts (Simple-Boot-Front 컴포넌트)
import 'reflect-metadata';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { MySharedService } from '../../common/services/MySharedService'; // 공통 서비스 주입
import { ApiService } from '@dooboostore/app-system/fetch/ApiService'; // app-system의 ApiService 주입
import { CheckBox } from '@dooboostore/app-system/component/checkBox/CheckBox'; // app-system의 UI 컴포넌트 사용

@Sim
@Component({
  template: `
    <h1>Front-end Component</h1>
    <p>Shared Data: ${this.sharedData}$</p>
    <button dr-event-click="this.fetchApiData()">Fetch API Data</button>
    <System:CheckBox checked="${this.isApiDataLoaded}$">API Data Loaded</System:CheckBox>
  `,
  styles: [`h1 { color: blue; }`]
})
class MyFrontComponent {
  sharedData: string;
  isApiDataLoaded: boolean = false;

  constructor(private mySharedService: MySharedService, private apiService: ApiService) {
    this.sharedData = this.mySharedService.getSharedData();
  }

  async fetchApiData() {
    console.log('Fetching data from API...');
    try {
      const data = await this.apiService.get({ target: 'https://jsonplaceholder.typicode.com/todos/1' });
      console.log('API Data:', data);
      this.isApiDataLoaded = true;
    } catch (e) {
      console.error('API Fetch Error:', e);
      this.isApiDataLoaded = false;
    }
  }
}

// server/routers/MyApiRouter.ts (Simple-Boot-HTTP-Server 라우터)
import 'reflect-metadata';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { GET, Mimes, RequestResponse } from '@dooboostore/simple-boot-http-server';
import { MySharedService } from '../../common/services/MySharedService'; // 공통 서비스 주입

@Sim
@Router({ path: '/api' })
class MyApiRouter {
  constructor(private mySharedService: MySharedService) {}

  @Route({ path: '/shared-data' })
  @GET({ res: { contentType: Mimes.ApplicationJson } })
  getSharedData() {
    console.log('API: getSharedData called.');
    return { data: this.mySharedService.getSharedData(), serverTime: new Date().toISOString() };
  }
}

// server/main.ts (Simple-Boot-HTTP-SSR 서버)
// ... (SimpleBootHttpSSRServer 초기화 및 MyApiRouter 등록)
// ... (SimpleBootFront 인스턴스 생성 시 MyFrontComponent를 루트 컴포넌트로 설정)

// 이 예제는 MySharedService가 Simple-Boot Core의 DI 컨테이너에 의해 관리되며,
// 프론트엔드 컴포넌트와 백엔드 API 라우터 모두에서 주입받아 사용될 수 있음을 보여줍니다.
// 또한, MyFrontComponent는 app-system의 ApiService와 CheckBox 컴포넌트를 활용합니다.
```

## 5.2. 시스템의 확장성 설계

`app-system`은 다음과 같은 메커니즘을 통해 높은 확장성을 가집니다.

-   **인터페이스 기반 확장:** `AlertFactory`, `ApiServiceInterceptor`와 같은 인터페이스를 제공하여, 개발자가 자신만의 커스텀 구현체를 쉽게 추가할 수 있도록 합니다.
-   **DI 컨테이너 활용:** `@Sim` 데코레이터와 DI 컨테이너를 통해 새로운 서비스나 컴포넌트를 추가하고, 기존 모듈에 영향을 주지 않으면서 의존성을 주입할 수 있습니다.
-   **모듈화된 컴포넌트:** 각 UI 컴포넌트가 독립적인 모듈로 설계되어, 필요한 컴포넌트만 선택적으로 사용하거나 커스텀 컴포넌트를 쉽게 추가할 수 있습니다.
-   **프록시 시스템:** `ApiService`의 프록시 시스템은 API 요청/응답을 가로채어 다양한 횡단 관심사를 동적으로 주입할 수 있는 강력한 확장 지점을 제공합니다.

이러한 설계 원칙들은 `app-system`이 현재의 요구사항을 충족시키면서도, 미래의 변화와 확장에 유연하게 대응할 수 있도록 돕습니다.

이 장에서는 `app-system`이 `Simple-Boot` 생태계의 다른 프레임워크들과 어떻게 연동되며, 시스템의 확장성을 어떻게 설계하는지 알아보았습니다. 이로써 우리는 `app-system`의 모든 주요 기능과 그 기반이 되는 설계 원리를 탐구했습니다.

다음 부록에서는 `app-system` 아키텍처의 장단점을 객관적으로 평가하고, 시스템의 발전 방향에 대한 아이디어를 공유하겠습니다.
