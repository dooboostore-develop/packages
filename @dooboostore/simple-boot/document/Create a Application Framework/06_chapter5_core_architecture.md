# 제5장: 프레임워크의 기반 - 코어 아키텍처

Simple-Boot은 다양한 기능들을 유기적으로 연결하고 관리하는 견고한 코어 아키텍처 위에 구축되어 있습니다. 이 장에서는 프레임워크의 심장인 `SimpleApplication`의 역할과, 메타데이터 관리, 그리고 프록시(Proxy)를 활용한 동적 확장 메커니즘에 대해 깊이 탐구합니다.

## 5.1. SimpleApplication의 역할

`SimpleApplication`은 Simple-Boot 프레임워크의 진입점(Entry Point)이자 모든 핵심 컴포넌트들을 통합 관리하는 컨테이너입니다. 애플리케이션이 시작될 때 `SimpleApplication` 인스턴스가 생성되며, 이 인스턴스를 통해 의존성 주입, 라우팅, Intent 발행 등 프레임워크의 모든 기능을 사용할 수 있습니다.

`SimpleApplication`은 내부적으로 다음과 같은 핵심 관리자(Manager)들을 초기화하고 관리합니다.

-   **`SimstanceManager`:** 의존성 주입(DI) 컨테이너의 핵심으로, `@Sim`으로 등록된 모든 객체들의 생성, 관리, 의존성 해결을 담당합니다.
-   **`IntentManager`:** Intent 기반 이벤트 시스템을 관리하며, Intent의 발행과 구독을 중재합니다.
-   **`RouterManager`:** 애플리케이션의 라우팅 시스템을 관리하며, 요청을 적절한 모듈이나 메소드로 연결합니다.

`SimpleApplication`은 이들 관리자 인스턴스를 생성하고, 서로 간의 의존성을 주입하여 프레임워크의 모든 기능이 유기적으로 연동되도록 합니다. 또한, `SimOption` 객체를 통해 애플리케이션 전반의 설정을 관리합니다.

```typescript
// SimpleApplication.ts (개념적)
export class SimpleApplication {
  public simstanceManager: SimstanceManager;
  public intentManager: IntentManager;
  public routerManager: RouterManager;

  constructor(public option: SimOption = new SimOption()) {
    // SimstanceManager 초기화 및 자신(SimpleApplication)과 SimstanceManager 자신을 등록
    this.simstanceManager = new SimstanceManager(this, option);
    this.simstanceManager.setStoreSet(SimpleApplication, this);
    this.simstanceManager.setStoreSet(SimstanceManager, this.simstanceManager);

    // IntentManager와 RouterManager 초기화 및 프록시 적용
    this.intentManager = this.simstanceManager.proxy(new IntentManager(this.simstanceManager));
    this.routerManager = this.simstanceManager.proxy(new RouterManager(this.simstanceManager, option.rootRouter));

    // 초기화된 관리자들을 SimstanceManager에 등록
    this.simstanceManager.setStoreSet(IntentManager, this.intentManager);
    this.simstanceManager.setStoreSet(RouterManager, this.routerManager);
  }

  public run() {
    // SimstanceManager를 통해 모든 @Sim 객체들을 초기화하고 생명주기 관리 시작
    this.simstanceManager.run();
  }

  // ... sim(), publishIntent(), routing() 등 외부에서 접근 가능한 메소드 ...
}
```

## 5.2. 메타데이터 관리와 Reflect API

Simple-Boot의 핵심 기능들(DI, AOP, 라우팅, 캐싱, 유효성 검증)은 모두 **메타데이터(Metadata)**를 기반으로 동작합니다. 메타데이터는 코드 자체에 대한 정보(예: 클래스, 메소드, 속성에 대한 추가 정보)를 의미하며, 런타임에 이 정보를 활용하여 동적인 동작을 구현합니다.

Simple-Boot은 TypeScript의 데코레이터와 `reflect-metadata` 라이브러리를 사용하여 메타데이터를 관리합니다.

-   **데코레이터:** `@Sim`, `@PostConstruct`, `@Before`, `@Router` 등 모든 데코레이터는 클래스, 메소드, 속성, 파라미터에 메타데이터를 추가하는 역할을 합니다.
-   **`reflect-metadata`:** JavaScript의 `Reflect` 객체를 확장하여, 런타임에 메타데이터를 정의하고 조회할 수 있는 API를 제공합니다. `Reflect.defineMetadata`, `Reflect.getMetadata` 등의 메소드가 사용됩니다.

### `ReflectUtils`의 역할

`ReflectUtils`는 `reflect-metadata`의 API를 래핑하여 Simple-Boot 내부에서 메타데이터를 일관되고 안전하게 다룰 수 있도록 돕는 유틸리티 클래스입니다. `ReflectUtils.getMetadata('design:paramtypes', target)`와 같이 사용하여 생성자나 메소드의 파라미터 타입을 얻어내 의존성 주입에 활용하는 것이 대표적인 예입니다.

```typescript
// utils/reflect/ReflectUtils.ts (개념적)
export class ReflectUtils {
  static getParameterTypes(target: any, propertyKey?: string | symbol): ConstructorType<any>[] {
    // 'design:paramtypes' 메타데이터는 TypeScript 컴파일러가 생성자/메소드 파라미터의 타입을 기록한 것입니다.
    return Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
  }

  static defineMetadata(metadataKey: any, value: any, target: any, propertyKey?: string | symbol) {
    // 특정 키로 메타데이터를 정의합니다.
    Reflect.defineMetadata(metadataKey, value, target, propertyKey);
  }

  static getMetadata<T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T | undefined {
    // 특정 키로 정의된 메타데이터를 조회합니다.
    return Reflect.getMetadata(metadataKey, target, propertyKey);
  }
  // ... 다른 메타데이터 관련 유틸리티 메소드 ...
}
```

## 5.3. 프록시(Proxy)를 활용한 동적 확장

Simple-Boot의 AOP, 예외 처리, 캐싱 등 많은 기능들은 JavaScript의 `Proxy` 객체를 활용하여 구현됩니다. `Proxy`는 객체에 대한 연산(속성 접근, 메소드 호출 등)을 가로채어 커스텀 동작을 추가할 수 있는 강력한 메커니즘입니다.

### `SimProxyHandler`의 역할

`SimProxyHandler`는 `Proxy` 객체의 핸들러로 사용되며, `@Sim`으로 관리되는 객체들의 메소드 호출을 가로채어 AOP, 예외 처리, 캐싱 로직을 적용합니다. `SimstanceManager`는 객체를 생성한 후, 이 `SimProxyHandler`를 사용하여 객체를 프록시로 감쌉니다.

-   **`apply` 트랩:** 메소드 호출을 가로채어 `@Before`, `@After`, `@Around` 어드바이스를 실행하고, 예외 발생 시 `@ExceptionHandler`를 호출합니다.
-   **`get`, `set` 트랩:** 객체의 속성 접근 및 할당을 가로채어 `SimpleApplication`, `SimstanceManager` 등 프레임워크 내부 객체에 대한 접근을 제공하거나, 다른 프록시를 재귀적으로 적용합니다.

```typescript
// proxy/SimProxyHandler.ts (개념적)
export class SimProxyHandler implements ProxyHandler<any> {
  // ... constructor ...

  apply(target: Function, thisArg: any, argumentsList?: any[]): any {
    // 메소드 호출을 가로채는 핵심 로직
    // 1. AOP @Before, @Around(before) 실행
    // 2. 원본 메소드 실행
    // 3. AOP @After, @Around(after) 실행
    // 4. 예외 발생 시 @ExceptionHandler 실행
    // ...
  }

  get(target: any, name: string): any {
    // 특정 속성 접근 시 프레임워크 내부 객체 반환
    if (name === '_SimpleBoot_application') {
      return this.simpleApplication;
    } else if (name === '_SimpleBoot_simstanceManager') {
      return this.simstanceManager;
    } // ...
    return target[name];
  }

  set(obj: any, prop: string, value: any, receiver: any): boolean {
    // 속성 할당 시 재귀적으로 프록시 적용
    value = this.simstanceManager?.proxy(value);
    obj[prop] = value;
    return true;
  }
  // ...
}
```

`Proxy`를 통해 Simple-Boot은 핵심 비즈니스 로직을 변경하지 않고도 다양한 횡단 관심사를 동적으로 주입하고, 객체의 동작을 확장할 수 있는 강력하고 유연한 아키텍처를 구축합니다.

이 장에서는 Simple-Boot의 코어 아키텍처를 구성하는 `SimpleApplication`, 메타데이터 관리, 그리고 `Proxy` 활용에 대해 알아보았습니다. 이로써 우리는 Simple-Boot의 모든 주요 기능과 그 기반이 되는 설계 원리를 탐구했습니다.

다음 부록에서는 Simple-Boot 아키텍처의 장단점을 객관적으로 평가하고, 프레임워크를 확장하거나 기여하는 방안, 그리고 프레임워크 개발자로서의 성장 로드맵에 대한 아이디어를 공유하겠습니다.
