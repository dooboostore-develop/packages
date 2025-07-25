# 제5장: 프레임워크의 기반 - Simple-Boot Core 연동

`Simple-Boot-Front`는 `Simple-Boot Core`의 강력한 기능들을 프론트엔드 환경에서 활용할 수 있도록 긴밀하게 연동되어 있습니다. 이 장에서는 `Simple-Boot-Front`가 `Simple-Boot Core`의 의존성 주입(DI), 관점 지향 프로그래밍(AOP), 예외 처리 시스템을 어떻게 통합하고 활용하는지 알아봅니다.

## 5.1. Simple-Boot Core의 DI, AOP, 예외 처리 활용

`Simple-Boot-Front`는 `SimpleApplication` (Simple-Boot Core의 메인 클래스)을 상속받습니다. 이는 `Simple-Boot-Front` 인스턴스가 곧 `SimpleApplication` 인스턴스이기도 하다는 것을 의미합니다. 따라서 `Simple-Boot Core`에서 제공하는 모든 핵심 기능들을 프론트엔드 환경에서 그대로 사용할 수 있습니다.

-   **의존성 주입 (DI):**
    -   `@Sim` 데코레이터로 정의된 모든 클래스(서비스, 컴포넌트 등)는 `Simple-Boot-Front`의 DI 컨테이너(`SimstanceManager`)에 의해 관리됩니다.
    -   생성자 주입을 통해 필요한 의존성을 자동으로 주입받을 수 있습니다.
    -   `app.sim(MyService)`와 같이 `SimpleBootFront` 인스턴스를 통해 DI 컨테이너로부터 객체를 조회할 수 있습니다.

-   **관점 지향 프로그래밍 (AOP):**
    -   `@Before`, `@After`, `@Around` 데코레이터를 사용하여 메소드 호출 전후에 공통 로직을 삽입할 수 있습니다.
    -   이는 로깅, 성능 측정, 권한 확인 등 횡단 관심사를 비즈니스 로직과 분리하는 데 매우 효과적입니다.

-   **예외 처리 시스템:**
    -   `@ExceptionHandler` 데코레이터를 사용하여 메소드나 클래스 레벨에서 발생하는 예외를 선언적으로 처리할 수 있습니다.
    -   전역 `advice`를 등록하여 애플리케이션 전반의 예외를 일관되게 관리할 수 있습니다.

### 예제: Simple-Boot Core 기능 활용

먼저, 예제 컴포넌트의 템플릿과 스타일을 별도 파일로 정의합니다.

**`./core-features-example.component.html`**
```html
<h1>Simple-Boot Core Features</h1>
<button dr-event-click="@this@.fetchUser(1)">Fetch User 1</button>
<button dr-event-click="@this@.fetchUser(3)">Fetch User 3 (Not Found)</button>
<button dr-event-click="@this@.fetchUser(-1)">Fetch User -1 (Around Test)</button>
<button dr-event-click="@this@.createUser('JohnDoe', 25)">Create Valid User</button>
<button dr-event-click="@this@.createUser('123Invalid', -5)">Create Invalid User</button>
```

**`./core-features-example.component.css`**
```css
button { 
  padding: 8px 15px; 
  margin: 5px; 
  cursor: pointer; 
}
```

이제 이 파일들을 사용하여 전체 예제 코드를 작성합니다.

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Before, After, Around, AroundForceReturn } from '@dooboostore/simple-boot/decorators/aop/AOPDecorator';
import { ExceptionHandler } from '@dooboostore/simple-boot/decorators/exception/ExceptionDecorator';
import { ValidException, NotEmpty, Validation, Regexp, execValidationInValid } from '@dooboostore/simple-boot/decorators/validate/Validation';

// 템플릿 및 스타일 파일 임포트
import template from './core-features-example.component.html';
import styles from './core-features-example.component.css';

// 1. DI, AOP, 예외 처리 기능을 포함하는 서비스
@Sim
class UserService {
  private users: { id: number; name: string }[] = [];

  constructor() {
    this.users.push({ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' });
  }

  // AOP: 메소드 실행 전후 로깅
  @Before({ property: 'getUser' })
  logBeforeGetUser() {
    console.log('[AOP] Before getUser method.');
  }

  @After({ property: 'getUser' })
  logAfterGetUser() {
    console.log('[AOP] After getUser method.');
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
        throw new AroundForceReturn('User not found!'); // 강제 반환
      }
      return result;
    }
  })
  getUser(id: number) {
    console.log(`[UserService] Fetching user with ID: ${id}`);
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    return user;
  }

  // 예외 처리: 특정 에러 타입 처리
  @ExceptionHandler({ type: Error })
  handleUserNotFoundError(error: Error) {
    console.error(`[UserService] Caught error: ${error.message}`);
    return null; // 에러 처리 후 null 반환
  }

  // 유효성 검증을 위한 사용자 모델
  @Validation(NotEmpty)
  @Validation(Regexp(/^[a-zA-Z]+$/))
  userName: string = '';

  @Validation((value: number) => value > 0)
  userAge: number = 0;

  // 사용자 생성 메소드 (유효성 검증 포함)
  createUser(name: string, age: number) {
    this.userName = name;
    this.userAge = age;

    try {
      const errors = execValidationInValid(this);
      if (errors.length > 0) {
        throw new ValidException(errors);
      }
      const newId = this.users.length + 1;
      this.users.push({ id: newId, name: name });
      console.log(`[UserService] User created: ${name} (ID: ${newId})`);
      return { id: newId, name: name };
    } catch (e: any) {
      if (e instanceof ValidException) {
        console.error('[UserService] Validation failed:', JSON.stringify(e.result));
      } else {
        console.error('[UserService] An unexpected error occurred:', e.message);
      }
      return null;
    }
  }
}

// 2. 애플리케이션 루트 컴포넌트
@Sim
@Component({ template, styles })
class AppRootComponent {
  constructor(private userService: UserService) {}

  fetchUser(id: number) {
    const user = this.userService.getUser(id);
    console.log(`Fetched User Result:`, user);
  }

  createUser(name: string, age: number) {
    this.userService.createUser(name, age);
  }
}

// 3. SimpleBootFront 인스턴스 생성 및 실행
const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Simple-Boot-Front Core features example started.');
```

## 5.2. 프론트엔드 환경에 최적화된 통합

`Simple-Boot-Front`는 `Simple-Boot Core`의 기능을 활용하면서도, 프론트엔드 환경의 특성을 고려하여 최적화된 통합을 제공합니다.

-   **`dom-render`와의 연동:** `Simple-Boot-Front`는 `dom-render`를 UI 렌더링 엔진으로 사용합니다. `@Component`로 정의된 클래스 인스턴스는 `Simple-Boot Core`의 DI 컨테이너에 의해 생성되고 관리되지만, 실제 DOM 렌더링은 `dom-render`가 담당합니다. `SimpleBootFront`는 이 두 프레임워크 간의 브릿지 역할을 하여, `@Component` 클래스가 `dom-render`의 컴포넌트로 인식되도록 합니다.
-   **브라우저 API 접근:** `SimFrontOption`을 통해 `window` 객체를 주입받아, `CookieService`, `StorageService` 등 브라우저의 전역 객체나 API를 활용하는 서비스들을 DI 컨테이너에 등록하고 관리합니다.
-   **클라이언트 측 라우팅:** `Simple-Boot Core`의 라우팅 시스템을 기반으로, `PathRouter` 또는 `HashRouter`를 사용하여 브라우저의 URL 변경을 감지하고 SPA 내비게이션을 처리합니다.

이러한 통합을 통해 개발자는 백엔드에서 사용하던 익숙한 DI, AOP, 예외 처리 패턴을 프론트엔드에서도 그대로 적용할 수 있으며, `dom-render`의 반응형 UI 기능과 결합하여 일관되고 효율적인 애플리케이션 개발 경험을 얻을 수 있습니다.

이 장에서는 `Simple-Boot-Front`가 `Simple-Boot Core`의 강력한 기능들을 어떻게 활용하여 프론트엔드 환경에 최적화된 통합을 이루는지 알아보았습니다. 이로써 우리는 `Simple-Boot-Front`의 모든 주요 기능과 그 기반이 되는 설계 원리를 탐구했습니다.

다음 부록에서는 `Simple-Boot-Front` 아키텍처의 장단점을 객관적으로 평가하고, 프레임워크를 확장하거나 기여하는 방안, 그리고 프론트엔드 프레임워크 개발자로서의 성장 로드맵에 대한 아이디어를 공유하겠습니다.
