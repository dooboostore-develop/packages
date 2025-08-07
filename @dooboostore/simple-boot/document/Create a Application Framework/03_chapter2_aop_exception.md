# 제2장: 횡단 관심사 처리 - AOP와 예외 처리

애플리케이션 개발에서 로깅, 보안, 트랜잭션 관리 등 여러 모듈에 걸쳐 반복적으로 나타나는 공통 기능들을 **횡단 관심사(Cross-cutting Concerns)**라고 합니다. 관점 지향 프로그래밍(AOP)은 이러한 횡단 관심사를 모듈화하여 코드의 중복을 줄이고 유지보수성을 높이는 프로그래밍 패러다임입니다. 이 장에서는 Simple-Boot이 AOP와 강력한 예외 처리 시스템을 어떻게 구현하는지 알아봅니다.

## 2.1. 관점 지향 프로그래밍(AOP)의 이해

AOP는 핵심 비즈니스 로직과 횡단 관심사를 분리하여 개발하는 방식입니다. AOP의 주요 개념은 다음과 같습니다.

-	**관점(Aspect):** 횡단 관심사를 모듈화한 단위 (예: 로깅 관점, 보안 관점).
-	**조인 포인트(Join Point):** 메소드 호출, 필드 접근 등 프로그램 실행 중 특정 시점.
-	**어드바이스(Advice):** 조인 포인트에서 실행될 코드 (예: `Before` 어드바이스는 메소드 실행 전, `After` 어드바이스는 메소드 실행 후).
-	**포인트컷(Pointcut):** 어드바이스가 적용될 조인 포인트를 지정하는 표현식.

Simple-Boot은 데코레이터를 사용하여 메소드 호출을 가로채는 AOP를 구현합니다.

## 2.2. `@Before`, `@After`, `@Around` 데코레이터

Simple-Boot은 메소드 레벨에서 AOP를 적용할 수 있도록 `@Before`, `@After`, `@Around` 데코레이터를 제공합니다. 이 데코레이터들은 `SimProxyHandler`에서 메소드 호출을 가로채는 방식으로 동작합니다.

-	**`@Before`:** 타겟 메소드가 실행되기 전에 실행될 로직을 정의합니다. (예: 입력 값 유효성 검사, 권한 확인)
-	**`@After`:** 타겟 메소드가 실행된 후에 실행될 로직을 정의합니다. 메소드 실행 결과와 관계없이 항상 실행됩니다. (예: 로깅, 리소스 정리)
-	**`@Around`:** 타겟 메소드 호출 자체를 감싸서, 메소드 실행 전후의 모든 과정을 제어할 수 있습니다. 메소드의 인자를 변경하거나, 메소드 실행을 막고 다른 값을 반환하는 등 가장 강력한 제어력을 제공합니다.

### 구현 원리

`@Before`, `@After`, `@Around` 데코레이터는 `Reflect.defineMetadata`를 사용하여 메소드에 AOP 관련 메타데이터를 추가합니다. `SimstanceManager`가 객체를 생성할 때, 이 객체의 메소드들을 `SimProxyHandler`로 감싸게 됩니다.

`SimProxyHandler`의 `apply` 트랩은 메소드 호출을 가로채어, 해당 메소드에 적용된 `@Before`, `@After`, `@Around` 메타데이터를 확인하고, 정의된 어드바이스 로직을 실행합니다.

```typescript
// proxy/SimProxyHandler.ts (개념적)
export class SimProxyHandler implements ProxyHandler<any> {
  // ... constructor, get, set ...

  apply(target: Function, thisArg: any, argumentsList?: any[]): any {
    let result;
    try {
      // 1. @Before 어드바이스 실행
      this.aopBefore(thisArg, target);

      // 2. @Around 어드바이스의 before 로직 실행 및 인자 변경
      // (실제 구현은 @Around 데코레이터 내부에서 메소드를 래핑하는 방식으로 이루어짐)

      // 3. 원본 메소드 실행
      result = Reflect.apply(target, thisArg, argumentsList);

    } finally {
      // 4. @After 어드바이스 실행
      this.aopAfter(thisArg, target);

      // 5. @Around 어드바이스의 after 로직 실행 및 반환 값 변경
    }
    return result;
  }

  // ... aopBefore, aopAfter 메소드 ...
}
```

### 예제: AOP 데코레이터 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Before, After, Around, AroundForceReturn } from '@dooboostore/simple-boot';

@Sim
class Calculator {
    @Before({ property: 'add' })
    logBeforeAdd() {
        console.log('Preparing to add...');
    }

    @After({ property: 'add' })
    logAfterAdd() {
        console.log('Addition complete.');
    }

    @Around({
        before: (obj, propertyKey, args) => {
            console.log(`[${String(propertyKey)}] Before with args:`, args);
            // 인자를 두 배로 수정
            return args.map(arg => typeof arg === 'number' ? arg * 2 : arg);
        },
        after: (obj, propertyKey, args, beforeReturn) => {
            console.log(`[${String(propertyKey)}] After with result:`, beforeReturn);
            // 반환 값이 10보다 크면 예외 발생시켜 강제 반환
            if (beforeReturn > 10) {
                throw new AroundForceReturn("Value is too high!");
            }
            return beforeReturn;
        }
    })
    add(a: number, b: number): number {
        console.log('Executing add method');
        return a + b;
    }
}

const app = new SimpleApplication();
app.run();

const calculator = app.sim(Calculator);

console.log('-- Calling add(3, 4) --');
try {
    const result1 = calculator?.add(3, 4);
    console.log('Result 1:', result1);
} catch (e: any) {
    console.error('Error 1:', e.message);
}

console.log('\n-- Calling add(1, 1) --');
try {
    const result2 = calculator?.add(1, 1);
    console.log('Result 2:', result2);
} catch (e: any) {
    console.error('Error 2:', e.message);
}

/* 예상 출력:
-- Calling add(3, 4) --
Preparing to add...
[add] Before with args: [ 3, 4 ]
Executing add method
[add] After with result: 14
Error 1: Value is too high!

-- Calling add(1, 1) --
Preparing to add...
[add] Before with args: [ 1, 1 ]
Executing add method
[add] After with result: 2
Result 2: 2
*/
```

## 2.3. 강력한 예외 처리 시스템

애플리케이션에서 발생하는 예외(Exception)를 일관되고 효과적으로 처리하는 것은 매우 중요합니다. Simple-Boot은 `@ExceptionHandler` 데코레이터를 통해 로컬 및 전역 예외 처리 시스템을 제공합니다.

-	**로컬 예외 처리:** 특정 클래스 내에서 발생하는 예외를 해당 클래스의 `@ExceptionHandler` 메소드에서 처리합니다. 특정 예외 타입(`type`)을 지정하여 세밀하게 제어할 수 있습니다.
-	**전역 예외 처리(Advice):** `SimpleApplication` 설정 시 `advice` 옵션에 등록된 클래스들은 전역 예외 핸들러 역할을 합니다. 애플리케이션 전반에서 발생하는 예외를 한곳에서 처리하여 일관된 오류 응답을 제공하거나 로깅할 수 있습니다.

### 구현 원리

`@ExceptionHandler` 데코레이터는 메소드에 예외 처리 관련 메타데이터를 추가합니다. `SimProxyHandler`의 `apply` 트랩에서 메소드 실행 중 예외가 발생하면, 다음과 같은 순서로 예외 핸들러를 찾고 실행합니다.

1.	**로컬 핸들러 탐색:** 현재 예외가 발생한 객체(`thisArg`) 내에서 예외 타입에 맞는 `@ExceptionHandler` 메소드를 찾습니다.
2.	**전역 핸들러 탐색:** 로컬 핸들러가 없거나, 로컬 핸들러가 예외를 다시 던지는 경우(`throw: true`), `SimpleApplication`에 등록된 `advice` 클래스들에서 예외 타입에 맞는 `@ExceptionHandler` 메소드를 찾습니다.
3.	**핸들러 실행:** 찾아진 예외 핸들러 메소드를 실행합니다. 이때 예외 객체(`Error`)와 원본 메소드의 인자(`argumentsList`) 등을 주입받을 수 있습니다.

```typescript
// proxy/SimProxyHandler.ts (개념적)
export class SimProxyHandler implements ProxyHandler<any> {
  // ... apply 메소드 내부의 catch 블록 ...
  try {
    // ... 원본 메소드 실행 ...
  } catch (e: Error | any) {
    // 1. 예외 핸들러 탐색
    const inHandlers = this.getExceptionHandler(e, thisArg, target); // 로컬 및 전역 핸들러 탐색

    if (inHandlers.length > 0 && inHandlers[0]) {
      const inHandler = inHandlers[0];
      // 2. 예외 핸들러 실행
      this.executeExceptionHandler(e, inHandler, argumentsList);
    } else {
      // 3. 처리할 핸들러가 없으면 예외를 다시 던짐
      throw e;
    }
  }
  // ...
}
```

### 예제: `@ExceptionHandler` 데코레이터 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, ExceptionHandler, SimOption } from '@dooboostore/simple-boot';

// 커스텀 에러 클래스
class MyCustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MyCustomError';
    }
}

@Sim
class UserService {
    // MyCustomError 타입의 예외만 처리하는 로컬 핸들러
    @ExceptionHandler({ type: MyCustomError })
    handleMyCustomError(e: MyCustomError) {
        console.error(`[UserService] Caught MyCustomError: ${e.message}`);
    }

    // 모든 다른 예외를 처리하는 로컬 핸들러 (가장 일반적인 예외를 처리)
    @ExceptionHandler()
    handleGenericError(e: Error) {
        console.error(`[UserService] Caught generic error: ${e.message}`);
    }

    doSomethingRisky(value: number) {
        if (value < 0) {
            throw new MyCustomError('Value cannot be negative');
        } else if (value === 0) {
            throw new Error('Value cannot be zero');
        }
        console.log(`Processing value: ${value}`);
    }
}

// 전역 예외 처리를 위한 Advice 클래스
@Sim
class GlobalErrorAdvice {
    @ExceptionHandler({ type: Error }) // 모든 Error 타입을 처리
    handleAllErrorsGlobally(e: Error) {
        console.log(`[GlobalAdvice] A global error occurred: ${e.message}`);
    }
}

// 애플리케이션 설정
const appOption = new SimOption({
    advice: [GlobalErrorAdvice] // 전역 예외 핸들러 등록
});
const app = new SimpleApplication(appOption);
app.run();

const userService = app.sim(UserService);

console.log('-- Calling doSomethingRisky(-5) --');
userService?.doSomethingRisky(-5);
// 예상 출력:
// [UserService] Caught MyCustomError: Value cannot be negative

console.log('\n-- Calling doSomethingRisky(0) --');
userService?.doSomethingRisky(0);
// 예상 출력:
// [UserService] Caught generic error: Value cannot be zero

console.log('\n-- Calling doSomethingRisky(10) --');
userService?.doSomethingRisky(10);
// 예상 출력:
// Processing value: 10

// UserService에 핸들러가 없는 예외 발생 시 전역 핸들러가 동작
@Sim
class AnotherService {
    doAnotherRiskyThing() {
        throw new TypeError('This is a TypeError');
    }
}

const anotherService = app.sim(AnotherService);
console.log('\n-- Calling doAnotherRiskyThing() --');
anotherService?.doAnotherRiskyThing();
// 예상 출력:
// [GlobalAdvice] A global error occurred: This is a TypeError
```

이러한 AOP와 예외 처리 시스템을 통해 Simple-Boot은 핵심 비즈니스 로직과 횡단 관심사를 명확히 분리하고, 애플리케이션의 안정성을 높이는 강력한 도구를 제공합니다.

다음 장에서는 애플리케이션의 흐름을 제어하는 라우팅 시스템과 느슨하게 결합된 통신을 위한 Intent 시스템을 구현하는 방법을 알아보겠습니다.