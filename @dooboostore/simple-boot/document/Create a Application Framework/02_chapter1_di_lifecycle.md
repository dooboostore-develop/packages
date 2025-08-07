# 제1장: 핵심 관리 시스템 - DI와 생명주기

모든 애플리케이션 프레임워크의 핵심에는 객체들을 생성하고 관리하는 시스템이 있습니다. 이 시스템은 객체 간의 의존성을 효율적으로 처리하고, 객체의 생명주기를 관리하여 코드의 유연성과 재사용성을 극대화합니다. 이 장에서는 Simple-Boot의 의존성 주입(DI) 컨테이너와 객체 생명주기 관리 메커니즘을 설계하고 구현하는 방법을 알아봅니다.

## 1.1. 의존성 주입(Dependency Injection)의 필요성

의존성 주입(DI)은 객체들이 자신이 필요로 하는 다른 객체(의존성)를 직접 생성하거나 찾는 대신, 외부(DI 컨테이너)로부터 주입받는 디자인 패턴입니다. 이는 다음과 같은 이점을 제공합니다.

-   **느슨한 결합(Loose Coupling):** 객체들이 서로의 구현에 직접적으로 의존하지 않아, 한 객체의 변경이 다른 객체에 미치는 영향을 최소화합니다.
-   **재사용성 증가:** 특정 환경이나 의존성에 묶이지 않아, 다양한 컨텍스트에서 객체를 재사용하기 용이합니다.
-   **테스트 용이성:** 테스트 시 실제 의존성 대신 Mock 객체를 쉽게 주입할 수 있어 단위 테스트를 용이하게 합니다.

Simple-Boot은 `@Sim` 데코레이터를 사용하여 클래스를 DI 컨테이너에 등록하고, 생성자 기반의 의존성 주입을 지원합니다.

## 1.2. `@Sim` 데코레이터와 SimstanceManager

`@Sim` 데코레이터는 클래스를 Simple-Boot의 DI 컨테이너(`SimstanceManager`)에 등록하는 역할을 합니다. `@Sim`이 붙은 클래스는 컨테이너에 의해 관리되며, 필요할 때 컨테이너로부터 인스턴스를 주입받거나 조회할 수 있습니다.

### `@Sim` 데코레이터의 구현

`@Sim` 데코레이터는 `Reflect.defineMetadata`를 사용하여 클래스에 메타데이터를 추가합니다. 이 메타데이터는 해당 클래스가 DI 컨테이너에 의해 관리되어야 함을 나타내며, `Lifecycle` (Singleton 또는 Transient), `scheme`, `symbol` 등 객체 관리 정책을 정의할 수 있습니다.

```typescript
// decorators/SimDecorator.ts
export const SimMetadataKey = Symbol('Sim');

export function Sim(configOrTarget: SimConfig | ConstructorType<any> | Function): void | GenericClassDecorator<ConstructorType<any> | Function> {
  if (typeof configOrTarget === 'function') {
    // @Sim 데코레이터가 인자 없이 사용될 때 (예: @Sim)
    simProcess({}, configOrTarget);
  } else {
    // @Sim 데코레이터가 인자와 함께 사용될 때 (예: @Sim({ scope: Lifecycle.Transient }))
    return (target: ConstructorType<any> | Function) => {
      simProcess(configOrTarget, target);
    }
  }
}

const simProcess = (config: SimConfig, target: ConstructorType<any> | Function | any) => {
  // 클래스에 SimMetadataKey 심볼로 config 메타데이터를 정의합니다.
  ReflectUtils.defineMetadata(SimMetadataKey, config, target);
  // ... 컨테이너에 클래스 등록 로직 ...
}
```

### `SimstanceManager`의 역할

`SimstanceManager`는 Simple-Boot의 DI 컨테이너 핵심입니다. 이 클래스는 다음과 같은 주요 기능을 수행합니다.

-   **객체 등록:** `@Sim` 데코레이터가 붙은 모든 클래스를 내부적으로 관리합니다.
-   **의존성 해결:** 객체를 생성할 때, 해당 객체의 생성자(constructor)에 필요한 의존성들을 자동으로 찾아 주입합니다. 이는 `Reflect.getMetadata('design:paramtypes', target)`를 사용하여 생성자 파라미터의 타입을 얻어내는 방식으로 구현됩니다.
-   **객체 생명주기 관리:** `Lifecycle.Singleton`으로 설정된 객체는 한 번만 생성하여 재사용하고, `Lifecycle.Transient` 객체는 요청 시마다 새로 생성합니다.
-   **프록시 적용:** AOP, 예외 처리 등 횡단 관심사를 적용하기 위해 객체 생성 시점에 프록시(Proxy)를 적용합니다.

```typescript
// simstance/SimstanceManager.ts (개념적)
export class SimstanceManager {
  private storage = new Map<ConstructorType<any> | Function, Map<ConstructorType<any> | Function, any>>();

  // ... constructor ...

  resolve<T>({ targetKey, newInstanceCarrier }: { targetKey: ConstructorType<any> | Function, newInstanceCarrier?: Carrier }): T {
    // 1. 이미 생성된 싱글톤 인스턴스가 있는지 확인
    const registed = this.getStoreSet(targetKey);
    if (registed?.instance) {
      return registed.instance;
    }

    // 2. 생성자 파라미터의 타입(의존성)을 얻어 재귀적으로 resolve 호출
    const paramTypes = ReflectUtils.getParameterTypes(targetKey);
    const dependencies = paramTypes.map(depType => this.resolve({ targetKey: depType, newInstanceCarrier }));

    // 3. 객체 생성
    const instance = new (targetKey as ConstructorType<T>)(...dependencies);

    // 4. 프록시 적용
    const proxiedInstance = this.proxy(instance);

    // 5. 생명주기(Singleton)에 따라 저장
    const simConfig = getSim(targetKey);
    if (simConfig?.scope === Lifecycle.Singleton) {
      this.setStoreSet(targetKey, proxiedInstance);
    }

    return proxiedInstance;
  }

  // ... setStoreSet, proxy 등 다른 메소드 ...
}
```

### 예제: `@Sim` 데코레이터와 DI 컨테이너 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Lifecycle } from '@dooboostore/simple-boot';

// 의존성으로 주입될 서비스 클래스
@Sim // @Sim 데코레이터로 DI 컨테이너에 등록
class ProjectService {
  sum(x: number, y: number): number {
    return x + y;
  }
}

// ProjectService에 의존하는 클래스
@Sim() // @Sim() 또는 @Sim 모두 가능
class User {
  // 생성자 파라미터로 ProjectService를 주입받음
  constructor(private projectService: ProjectService) {}

  calculate() {
    const result = this.projectService.sum(5, 25);
    console.log(`Calculation result is: ${result}`);
  }
}

// SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication();
app.run();

// DI 컨테이너로부터 User 인스턴스 조회
const user = app.sim(User);
user?.calculate(); //-> Calculation result is: 30

// @Sim 데코레이터에 설정 객체 전달
@Sim({ scope: Lifecycle.Transient, scheme: 'MyTransientService' })
class MyTransientService {
  private id: number;
  constructor() {
    this.id = Math.random();
    console.log(`MyTransientService instance created with ID: ${this.id}`);
  }
}

const service1 = app.sim(MyTransientService);
const service2 = app.sim(MyTransientService);
// service1과 service2는 다른 인스턴스 (Transient 스코프)
```

## 1.3. 객체 생명주기 콜백

Simple-Boot은 객체가 생성되고 초기화되는 특정 시점에 개발자가 코드를 실행할 수 있도록 생명주기 콜백을 제공합니다. 이는 객체의 초기 설정이나 리소스 로딩 등에 유용합니다.

-   **`OnSimCreate` 인터페이스:** 객체 인스턴스가 생성된 직후에 호출됩니다. 생성자에서 할 수 없는 복잡한 초기화 로직이나 다른 의존성을 사용하는 로직을 여기에 배치할 수 있습니다.

    ```typescript
    // lifecycle/OnSimCreate.ts
    export interface OnSimCreate {
        onSimCreate(): void;
    }
    ```

-   **`@PostConstruct` 데코레이터:** 특정 메소드에 적용하여, 객체 인스턴스가 생성된 후 해당 메소드가 자동으로 호출되도록 합니다. `OnSimCreate`와 유사하지만, 메소드 단위로 세밀하게 제어할 수 있습니다.

    ```typescript
    // decorators/SimDecorator.ts
    export const PostConstruct = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      // ... 메타데이터 정의 ...
    }
    ```

-   **`OnSimCreateCompleted` 인터페이스:** 객체 인스턴스가 생성되고, 모든 프록시 및 AOP 기능이 적용된 후에 호출됩니다. 완전히 초기화된 객체 자신(`proxyThis`)을 인자로 받으므로, 프록시가 적용된 최종 객체에 대한 추가 작업이 필요할 때 유용합니다.

    ```typescript
    // lifecycle/OnSimCreateCompleted.ts
    export interface OnSimCreateCompleted<T = any> {
        onSimCreateProxyCompleted(proxyThis: T): void;
    }
    ```

`SimstanceManager`는 객체를 생성하는 과정에서 이들 인터페이스의 구현 여부나 `@PostConstruct` 데코레이터의 존재 여부를 확인하고, 해당 메소드를 적절한 시점에 호출합니다.

### 예제: 객체 생명주기 콜백 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, OnSimCreate, PostConstruct, OnSimCreateCompleted } from '@dooboostore/simple-boot';

@Sim
class MyComponent implements OnSimCreate, OnSimCreateCompleted<MyComponent> {
  constructor() {
    console.log('1. Constructor called');
  }

  onSimCreate(): void {
    console.log('2. onSimCreate called');
  }

  @PostConstruct()
  initialize() {
      console.log('3. @PostConstruct method called');
  }

  onSimCreateProxyCompleted(proxyThis: MyComponent): void {
    console.log('4. onSimCreateProxyCompleted called');
    // proxyThis는 완전히 초기화되고 프록시가 적용된 인스턴스입니다.
    // 이 시점에서 AOP, 예외 처리 등의 기능이 모두 활성화됩니다.
  }
}

const app = new SimpleApplication();
app.run();

// MyComponent 인스턴스를 조회하면 위 콜백들이 순서대로 호출됩니다.
app.sim(MyComponent);
```

이 장에서는 Simple-Boot의 핵심인 DI 컨테이너와 객체 생명주기 관리 시스템을 살펴보았습니다. 다음 장에서는 이 객체 관리 시스템을 기반으로, 애플리케이션의 횡단 관심사를 처리하는 AOP와 강력한 예외 처리 시스템을 구현하는 방법을 알아봅니다.