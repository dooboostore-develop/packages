# 제4장: 동적 스크립트와 서비스 - 프레임워크 확장

프레임워크는 핵심 기능 외에도 애플리케이션 개발을 돕는 다양한 유틸리티와 확장 메커니즘을 제공해야 합니다. `Simple-Boot-Front`는 동적 스크립트와 내장 서비스, 그리고 커스텀 서비스 개발을 통해 프레임워크의 기능을 확장하고 재사용 가능한 로직을 관리하는 방법을 제공합니다. 이 장에서는 이러한 확장 메커니즘의 설계와 사용법을 알아봅니다.

## 4.1. `@Script` 데코레이터와 동적 스크립트

`@Script` 데코레이터는 특정 클래스를 템플릿 내에서 직접 호출할 수 있는 동적 스크립트로 등록하는 역할을 합니다. 이는 템플릿에서 복잡한 로직을 직접 작성하는 대신, 미리 정의된 JavaScript 함수를 호출하여 데이터를 처리하거나 포맷팅하는 데 유용합니다.

-   **`@Script`:** 클래스에 적용되며, `name` 속성을 통해 템플릿에서 호출될 스크립트의 이름을 지정합니다. 이 클래스는 `ScriptRunnable` 인터페이스를 구현해야 합니다.
-   **`ScriptRunnable`:** `run(...arg: any): any` 메소드를 정의하는 인터페이스입니다. 템플릿에서 스크립트가 호출될 때 이 `run` 메소드가 실행됩니다.

### 구현 원리

`SimpleBootFront`는 초기화 과정에서 `@Script`로 등록된 모든 클래스들을 수집하여 `dom-render`의 `config.scripts` 객체에 등록합니다. 템플릿 내에서 `${$scripts.scriptName(...)}$` 형태로 호출되면, `dom-render`는 `config.scripts`에 등록된 해당 함수를 찾아 실행합니다. 이때 `ScriptRunnable` 인스턴스의 `run` 메소드가 호출됩니다.

```typescript
// decorators/Script.ts (개념적)
export const scripts = new Map<string, ConstructorType<ScriptRunnable>>();

export const Script = (config?: ScriptConfig): GenericClassDecorator<ConstructorType<ScriptRunnable>> => {
    return (target: ConstructorType<any>) => {
        // config.name이 없으면 클래스 이름을 기본값으로 사용
        if (!config || !config.name) {
            config = { ...config, name: target.name };
        }
        scripts.set(config.name, target); // 스크립트 이름과 클래스 매핑 저장
        ReflectUtils.defineMetadata(ScriptMetadataKey, config, target);
        return target;
    }
}

// SimpleBootFront.ts (개념적)
private initDomRenderScripts() {
  const simstanceManager = this.simstanceManager;
  scripts.forEach((scriptClass, name) => {
    this.domRenderConfig.scripts![name] = function (...args: any) {
      // 템플릿에서 스크립트 호출 시, DI 컨테이너를 통해 ScriptRunnable 인스턴스 생성/조회
      const scriptRunnableInstance = simstanceManager.getOrNewSim({ target: scriptClass });
      // ScriptRunnable의 run 메소드 호출
      return scriptRunnableInstance.run(...args);
    }
  });
}
```

### 예제: `@Script` 데코레이터와 동적 스크립트 사용

먼저, 컴포넌트의 템플릿을 별도 파일로 정의합니다.

**`./dynamic-script-example.component.html`**
```html
<h1>Dynamic Scripts Example</h1>
<p>Current Date: ${$scripts.dateFormat(@this@.currentDate, 'YYYY/MM/DD HH:mm:ss')}$</p>
<p>Short Text: ${$scripts.truncateText(@this@.longText, 20)}$</p>
<p>Original Text: ${@this@.longText}$</p>
```

이제 스크립트와 컴포넌트의 전체 코드를 작성합니다.

```typescript
import 'reflect-metadata';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Script } from '@dooboostore/simple-boot-front/decorators/Script';
import { ScriptRunnable } from '@dooboostore/simple-boot-front/script/ScriptRunnable';

// 템플릿 파일 임포트
import template from './dynamic-script-example.component.html';

// 1. 날짜 포맷팅 스크립트 정의
@Sim
@Script({ name: 'dateFormat' }) // 템플릿에서 $scripts.dateFormat로 호출
class DateFormatScript implements ScriptRunnable {
  run(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    let formatted = format;
    formatted = formatted.replace('YYYY', String(year));
    formatted = formatted.replace('MM', month);
    formatted = formatted.replace('DD', day);
    formatted = formatted.replace('HH', hours);
    formatted = formatted.replace('mm', minutes);
    formatted = formatted.replace('ss', seconds);
    return formatted;
  }
}

// 2. 텍스트 자르기 스크립트 정의
@Sim
@Script({ name: 'truncateText' })
class TruncateTextScript implements ScriptRunnable {
  run(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}

// 3. 애플리케이션 루트 컴포넌트
@Sim
@Component({ template })
class AppRootComponent {
  currentDate: Date = new Date();
  longText: string = 'This is a very long text that needs to be truncated for display purposes.';
}

// 4. SimpleBootFront 인스턴스 생성 및 실행
const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Dynamic scripts example started.');
```

## 4.2. 내장 서비스 활용 (Cookie, Storage, MetaTag)

`Simple-Boot-Front`는 프론트엔드 개발에서 자주 사용되는 기능들을 서비스 형태로 내장하여 제공합니다. 이 서비스들은 DI 컨테이너에 `@Sim`으로 등록되어 있으므로, 필요한 곳에서 주입받아 사용할 수 있습니다.

-   **`CookieService`:** 브라우저 쿠키를 읽고, 쓰고, 삭제하는 기능을 제공합니다.
-   **`StorageService`:** `localStorage`와 `sessionStorage`를 쉽게 사용할 수 있도록 래핑합니다.
-   **`MetaTagService`:** 동적으로 HTML `<meta>` 태그를 조작하여 SEO나 SNS 공유(OG Tag)에 필요한 정보를 설정합니다.

### 예제: 내장 서비스 활용

컴포넌트의 템플릿과 스타일을 별도 파일로 분리합니다.

**`./builtin-services-example.component.html`**
```html
<h1>Built-in Services Example</h1>
<section>
  <h2>Cookie Service</h2>
  <input type="text" dr-value-link="@this@.cookieValue" placeholder="Enter cookie value">
  <button dr-event-click="@this@.setCookie()">Set Cookie</button>
  <button dr-event-click="@this@.getCookie()">Get Cookie</button>
  <button dr-event-click="@this@.deleteCookie()">Delete Cookie</button>
  <p>Current Cookie: ${@this@.displayCookieValue}$</p>
</section>

<section>
  <h2>Storage Service (LocalStorage)</h2>
  <input type="text" dr-value-link="@this@.storageValue" placeholder="Enter storage value">
  <button dr-event-click="@this@.setStorage()">Set Storage</button>
  <button dr-event-click="@this@.getStorage()">Get Storage</button>
  <button dr-event-click="@this@.removeStorage()">Remove Storage</button>
  <p>Current Storage: ${@this@.displayStorageValue}$</p>
</section>

<section>
  <h2>Meta Tag Service</h2>
  <button dr-event-click="@this@.setMetaTags()">Set OG Meta Tags</button>
  <p>Check browser's head section for meta tags after clicking.</p>
</section>
```

**`./builtin-services-example.component.css`**
```css
section { 
  border: 1px solid #eee; 
  padding: 15px; 
  margin-bottom: 20px; 
}
input { 
  margin-right: 10px; 
  padding: 5px; 
}
button { 
  padding: 5px 10px; 
  margin-right: 5px; 
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
import { CookieService } from '@dooboostore/simple-boot-front/service/CookieService';
import { StorageService } from '@dooboostore/simple-boot-front/service/StorageService';
import { MetaTagService } from '@dooboostore/simple-boot-front/service/MetaTagService';

// 템플릿 및 스타일 파일 임포트
import template from './builtin-services-example.component.html';
import styles from './builtin-services-example.component.css';

@Sim
@Component({ template, styles })
class AppRootComponent {
  cookieValue: string = '';
  displayCookieValue: string = '';
  storageValue: string = '';
  displayStorageValue: string = '';

  constructor(
    private cookieService: CookieService,
    private storageService: StorageService,
    private metaTagService: MetaTagService
  ) {}

  setCookie() {
    this.cookieService.set('myAppCookie', this.cookieValue, 3600 * 1000); // 1시간 유효
    this.displayCookieValue = this.cookieService.get('myAppCookie') || '';
    console.log('Cookie set:', this.displayCookieValue);
  }

  getCookie() {
    this.displayCookieValue = this.cookieService.get('myAppCookie') || '';
    console.log('Cookie get:', this.displayCookieValue);
  }

  deleteCookie() {
    this.cookieService.delete('myAppCookie');
    this.displayCookieValue = this.cookieService.get('myAppCookie') || '';
    console.log('Cookie deleted.');
  }

  setStorage() {
    this.storageService.setLocalStorageItem('myAppStorage', this.storageValue);
    this.displayStorageValue = this.storageService.getLocalStorageItem('myAppStorage') || '';
    console.log('Storage set:', this.displayStorageValue);
  }

  getStorage() {
    this.displayStorageValue = this.storageService.getLocalStorageItem('myAppStorage') || '';
    console.log('Storage get:', this.displayStorageValue);
  }

  removeStorage() {
    this.storageService.removeLocalStorageItem('myAppStorage');
    this.displayStorageValue = this.storageService.getLocalStorageItem('myAppStorage') || '';
    console.log('Storage removed.');
  }

  setMetaTags() {
    this.metaTagService.setMetaTag('meta[property="og:title"]', { content: 'My Awesome App' });
    this.metaTagService.setMetaTag('meta[property="og:description"]', { content: 'This is a description for my awesome app.' });
    this.metaTagService.setMetaTag('meta[property="og:image"]', { content: 'https://example.com/image.jpg' });
    console.log('Meta tags set. Check browser console and head section.');
  }
}

const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Built-in services example started.');
```

## 4.3. 커스텀 서비스 개발

`Simple-Boot-Front`는 `Simple-Boot Core`의 DI 컨테이너를 사용하므로, 커스텀 서비스를 개발하는 것은 매우 간단합니다. `@Sim` 데코레이터를 사용하여 일반 TypeScript 클래스를 DI 컨테이너에 등록하기만 하면 됩니다. 이렇게 등록된 서비스는 다른 `@Sim` 클래스나 `@Component` 클래스에서 의존성 주입을 통해 사용할 수 있습니다.

### 예제: 커스텀 서비스 개발

먼저, 커스텀 서비스를 사용하는 컴포넌트의 템플릿과 스타일을 별도 파일로 정의합니다.

**`./custom-service-example.component.html`**
```html
<h1>Custom Service Example</h1>
<p>Result of 5 + 3: ${@this@.sumResult}$</p>
<p>Result of 10 - 4: ${@this@.diffResult}$</p>
<button dr-event-click="@this@.performCalculations()">Perform Calculations</button>
```

**`./custom-service-example.component.css`**
```css
button { 
  padding: 8px 15px; 
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

// 템플릿 및 스타일 파일 임포트
import template from './custom-service-example.component.html';
import styles from './custom-service-example.component.css';

// 1. 커스텀 서비스 정의
@Sim // DI 컨테이너에 등록
class MathService {
  add(a: number, b: number): number {
    console.log(`[MathService] Adding ${a} and ${b}`);
    return a + b;
  }

  subtract(a: number, b: number): number {
    console.log(`[MathService] Subtracting ${b} from ${a}`);
    return a - b;
  }
}

// 2. 커스텀 서비스를 사용하는 컴포넌트
@Sim
@Component({ template, styles })
class AppRootComponent {
  sumResult: number = 0;
  diffResult: number = 0;

  // 생성자 주입을 통해 MathService 인스턴스를 받음
  constructor(private mathService: MathService) {}

  performCalculations() {
    this.sumResult = this.mathService.add(5, 3);
    this.diffResult = this.mathService.subtract(10, 4);
    console.log('Calculations performed.');
  }
}

// 3. SimpleBootFront 인스턴스 생성 및 실행
const config = new SimFrontOption(window)
  .setRootRouter(AppRootComponent)
  .setUrlType(UrlType.hash)
  .setSelector('#app');

const app = new SimpleBootFront(config);
app.run();

console.log('Custom service example started.');
```

동적 스크립트와 서비스는 `Simple-Boot-Front` 애플리케이션의 기능을 확장하고, 코드의 재사용성을 높이며, 모듈 간의 깔끔한 의존성 관리를 가능하게 합니다. 이를 통해 복잡한 프론트엔드 로직을 체계적으로 구성할 수 있습니다.

다음 장에서는 `Simple-Boot-Front`가 `Simple-Boot Core`의 강력한 기능들을 어떻게 활용하여 프론트엔드 환경에 최적화된 통합을 이루는지 알아보겠습니다.
