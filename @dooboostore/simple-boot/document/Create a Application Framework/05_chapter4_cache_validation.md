# 제4장: 성능과 유효성 - 캐싱과 검증

애플리케이션의 성능을 최적화하고 데이터의 무결성을 보장하는 것은 사용자 경험과 시스템 안정성에 직결됩니다. 이 장에서는 Simple-Boot이 제공하는 메소드 레벨 캐싱 시스템과 선언적인 데이터 유효성 검증 시스템을 설계하고 구현하는 방법을 알아봅니다.

## 4.1. 메소드 레벨 캐싱 구현

캐싱은 자주 사용되는 데이터를 메모리에 저장하여, 동일한 데이터에 대한 반복적인 접근 시 원본 소스(예: 데이터베이스, 외부 API)에 접근하는 비용을 줄이는 기법입니다. Simple-Boot은 메소드 호출의 결과를 캐싱하는 기능을 제공합니다.

### 구현 원리

Simple-Boot의 캐싱 시스템은 `@Cache` 데코레이터와 `SimProxyHandler`를 통해 구현됩니다. 핵심 아이디어는 다음과 같습니다.

1.  **`@Cache` 데코레이터:** 메소드에 `@Cache` 데코레이터를 적용하면, 해당 메소드의 메타데이터에 캐싱 관련 설정(캐시 키 생성 방식, TTL 등)이 저장됩니다.
2.  **`SimProxyHandler`의 메소드 래핑:** `SimstanceManager`가 `@Sim` 객체를 생성할 때, 해당 객체의 모든 메소드를 `SimProxyHandler`로 래핑합니다. `SimProxyHandler`는 메소드 호출을 가로채어 캐싱 로직을 수행합니다.
3.  **캐시 조회 및 저장:** 메소드가 호출될 때, `SimProxyHandler`는 먼저 캐시 스토리지(`simpleApplicationCache`)에서 해당 메소드의 캐시 키에 해당하는 데이터가 있는지 확인합니다.
    -   **캐시 히트(Cache Hit):** 데이터가 있다면, 실제 메소드를 실행하지 않고 캐시된 데이터를 즉시 반환합니다.
    -   **캐시 미스(Cache Miss)::** 데이터가 없다면, 원본 메소드를 실행하고 그 결과를 캐시 스토리지에 저장한 후 반환합니다. 이때 TTL(Time To Live)이 설정되어 있다면, 일정 시간 후에 캐시가 만료되도록 타이머를 설정합니다.
4.  **캐시 무효화:** `@Cache({ deleteKey: ... })`와 같이 `deleteKey` 옵션을 사용하면, 해당 메소드가 호출될 때 특정 캐시 키에 해당하는 데이터를 캐시에서 삭제하여 캐시를 무효화할 수 있습니다.

```typescript
// decorators/cache/CacheDecorator.ts (개념적)
const cacheProcess = <M extends Method>(data: CacheOption<M>, target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
  const originalMethod = descriptor.value; // 원본 메소드

  descriptor.value = function (...args: Parameters<M>) {
    const simpleApplication: SimpleApplication = (this as any)._SimpleBoot_application; // SimpleApplication 인스턴스 접근
    const cacheStorage = simpleApplicationCache.get(simpleApplication)?.storage; // 캐시 스토리지

    // 1. 캐시 키 생성 (data.key, data.deleteKey 등에 따라 동적으로 생성)
    const cacheKey = generateCacheKey(target, propertyKey, args, data);

    // 2. 캐시 조회
    if (cacheStorage && cacheKey && !isUpdate(data)) {
      const cachedResult = cacheStorage.get(cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult; // 캐시 히트: 캐시된 값 반환
      }
    }

    // 3. 원본 메소드 실행
    const result = originalMethod.apply(this, args);

    // 4. 캐시 저장 또는 무효화
    if (cacheStorage && cacheKey) {
      if (isDeleteKey(data)) {
        cacheStorage.delete(cacheKey); // 캐시 무효화
      } else if (isKey(data) || isSetKey(data)) {
        cacheStorage.set(cacheKey, result); // 캐시 저장
        // ... TTL 설정 로직 ...
      }
    }
    return result;
  };
};
```

## 4.2. `@Cache` 데코레이터

`@Cache` 데코레이터는 메소드에 적용되며, 다양한 옵션을 통해 캐싱 동작을 세밀하게 제어할 수 있습니다.

-   **기본 캐싱:** 인자 없이 `@Cache`만 사용하면, 클래스 이름과 메소드 이름을 조합한 기본 캐시 키가 생성됩니다.
-   **`key` 옵션:** 캐시 키를 직접 지정하거나, 메소드 인자를 기반으로 동적으로 키를 생성하는 함수를 제공할 수 있습니다.
-   **`ms` 옵션:** 캐시의 유효 시간(밀리초)을 설정합니다. 시간이 지나면 캐시가 자동으로 만료됩니다.
-   **`deleteKey` 옵션:** 특정 메소드 호출 시 지정된 캐시 키를 무효화합니다. (예: 데이터 업데이트 메소드에서 관련 조회 메소드의 캐시 무효화)
-   **`setKey` 옵션:** 메소드의 반환 값을 캐시 키로 사용하여 캐시를 저장합니다. (예: 생성된 리소스의 ID를 키로 사용)

### 예제: `@Cache` 데코레이터 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Cache, CacheManager } from '@dooboostore/simple-boot';

@Sim
class DataService {
    private callCount = 0;

    // 기본 캐싱: 클래스명.메소드명 (DataService.fetchHeavyData)을 키로 사용
    @Cache
    fetchHeavyData() {
        this.callCount++;
        console.log(`[DataService] Fetching heavy data... (Call count: ${this.callCount})`);
        return { id: 1, data: 'some-heavy-data' };
    }

    // 동적 키와 TTL 설정
    @Cache({ key: (id: string) => `user:${id}`, ms: 3000 }) // 'user:ID' 형태의 키, 3초 TTL
    getUserById(id: string) {
        console.log(`[DataService] Fetching user ${id} from DB...`);
        return { id, name: `User ${id}` };
    }

    // 캐시 무효화: updateUser 호출 시 'user:ID' 캐시를 삭제
    @Cache({ deleteKey: (id: string) => `user:${id}` })
    updateUser(id: string, newName: string) {
        console.log(`[DataService] Updating user ${id} to ${newName}, cache will be cleared.`);
        // 실제 DB 업데이트 로직...
        return { id, name: newName };
    }

    // 반환 값을 캐시 키로 사용
    @Cache({ setKey: (createdId: string) => `product:${createdId}` })
    createProduct(name: string) {
        const newId = `prod-${Date.now()}`;
        console.log(`[DataService] Creating product ${name} with ID: ${newId}`);
        return newId; // 이 ID가 캐시 키로 사용됨
    }
}

// SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication();
app.run();

const dataService = app.sim(DataService);
const cacheManager = app.sim(CacheManager); // 캐시를 직접 제어하기 위한 CacheManager 주입

async function runCacheExamples() {
    console.log('\n--- Basic Caching Example ---');
    dataService?.fetchHeavyData(); // 첫 호출: 실제 메소드 실행
    dataService?.fetchHeavyData(); // 두 번째 호출: 캐시된 데이터 반환

    console.log('\n--- Dynamic Key & TTL Caching Example ---');
    const user1 = dataService?.getUserById('user-001'); // 첫 호출: 실제 메소드 실행
    console.log('User 001:', user1);
    const user1Cached = dataService?.getUserById('user-001'); // 두 번째 호출: 캐시된 데이터 반환
    console.log('User 001 (cached):', user1Cached);

    console.log('Waiting for 3.5 seconds for TTL...');
    await new Promise(resolve => setTimeout(resolve, 3500));

    const user1AfterTTL = dataService?.getUserById('user-001'); // TTL 만료 후: 실제 메소드 다시 실행
    console.log('User 001 (after TTL):', user1AfterTTL);

    console.log('\n--- Cache Invalidation Example ---');
    dataService?.getUserById('user-002'); // 캐시 생성
    console.log('User 002 (cached):', dataService?.getUserById('user-002'));
    dataService?.updateUser('user-002', 'New Name'); // 캐시 무효화
    console.log('User 002 (after update):', dataService?.getUserById('user-002')); // 실제 메소드 다시 실행

    console.log('\n--- SetKey Caching Example ---');
    const productId = dataService?.createProduct('Laptop');
    console.log('Created Product ID:', productId);
    // CacheManager를 통해 직접 캐시 조회
    const cachedProduct = cacheManager?.findCacheByKey(`product:${productId}`);
    console.log('Cached Product:', cachedProduct?.data);
}

runCacheExamples();
```

## 4.3. 데이터 유효성 검증 시스템

데이터 유효성 검증은 애플리케이션의 안정성과 보안을 위해 필수적입니다. Simple-Boot은 클래스 속성에 선언적으로 유효성 검증 규칙을 적용할 수 있는 시스템을 제공합니다.

### 구현 원리

Simple-Boot의 유효성 검증 시스템은 `@Validation` 데코레이터와 `execValidation` 함수를 통해 구현됩니다.

1.  **`@Validation` 데코레이터:** 클래스 속성에 `@Validation` 데코레이터를 적용하고, 인자로 유효성 검증 함수(Validator)를 전달합니다. 이 데코레이터는 `Reflect.defineMetadata`를 사용하여 해당 속성에 검증 함수 메타데이터를 저장합니다.
2.  **Validator 함수:** `NotNull`, `NotEmpty`, `Regexp` 등 미리 정의된 유효성 검증 함수들을 제공합니다. 개발자는 필요에 따라 커스텀 검증 함수를 작성할 수도 있습니다.
3.  **`execValidation` 함수:** 검증이 필요한 객체를 `execValidation(obj)` 함수에 전달하면, 해당 객체의 모든 속성에 적용된 `@Validation` 메타데이터를 찾아 각 속성의 현재 값에 대해 검증 함수를 실행합니다. 검증 결과는 `ValidationResult` 배열로 반환되며, 유효성 검증에 실패한 속성들의 목록을 포함합니다.
4.  **`ValidException`:** `execValidationInValid` 함수를 통해 유효성 검증에 실패한 항목이 있을 경우 `ValidException`을 발생시켜, 예외 처리 시스템과 연동하여 일관된 오류 처리를 할 수 있도록 합니다.

```typescript
// decorators/validate/Validation.ts (개념적)
export const Validation = (validator: Validator): ReflectField => {
    return (target: Object, propertyKey: string | symbol) => {
        // 클래스 속성에 validator 함수를 메타데이터로 저장
        ReflectUtils.defineMetadata(ValidationMetadataKey, validator, target, propertyKey);
    }
}

export const execValidation = (obj: any) => {
    const results: ValidationResult[] = [];
    // 객체의 모든 속성에 적용된 @Validation 메타데이터를 찾습니다. 
    const validators = getValidators(obj); 

    validators.forEach(it => {
        const value = obj[it.propertyKey]; // 속성의 현재 값
        const isValid = it.validator(value); // validator 함수 실행
        results.push({
            name: it.propertyKey,
            valid: isValid,
            message: isValid ? '' : 'Validation failed'
        });
    });
    return results;
}
```

## 4.4. `@Validation` 데코레이터

`@Validation` 데코레이터는 클래스 속성에 적용되어 유효성 검증 규칙을 정의합니다. Simple-Boot은 `NotNull`, `NotEmpty`, `Regexp`와 같은 내장 Validator 함수들을 제공하며, 필요에 따라 커스텀 Validator를 구현할 수 있습니다.

### 예제: `@Validation` 데코레이터 사용

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Validation, NotEmpty, NotNull, Regexp, execValidationInValid, ValidException } from '@dooboostore/simple-boot';

// 사용자 프로필 클래스
@Sim
class UserProfile {
    @Validation(NotEmpty) // 이름은 비어있으면 안 됨
    @Validation(Regexp(/^[a-zA-Z가-힣]+$/)) // 이름은 한글 또는 영어 알파벳만 허용
    name: string = '';

    @Validation(NotNull) // 나이는 null이 아니어야 함
    @Validation((value: number) => value >= 0 && value <= 150) // 나이는 0에서 150 사이
    age: number | null = null;

    @Validation(NotEmpty) // 이메일은 비어있으면 안 됨
    @Validation(Regexp(/^[^
@]+@[^
@]+\.[^
@]+$/)) // 이메일 형식 검증
    email: string = '';
}

// SimpleApplication 인스턴스 생성 및 실행
const app = new SimpleApplication();
app.run();

const userProfile = app.sim(UserProfile);

async function runValidationExamples() {
    console.log('\n--- Validating UserProfile (Invalid) ---');
    if (userProfile) {
        userProfile.name = '123'; // 이름: 숫자 포함 (유효성 실패)
        userProfile.age = -10;   // 나이: 음수 (유효성 실패)
        userProfile.email = 'invalid-email'; // 이메일: 형식 오류 (유효성 실패)

        try {
            const validationErrors = execValidationInValid(userProfile);
            if (validationErrors.length > 0) {
                throw new ValidException(validationErrors);
            }
            console.log('UserProfile is valid.');
        } catch (e: any) {
            if (e instanceof ValidException) {
                console.error('Validation Failed:', JSON.stringify(e.result, null, 2));
            } else {
                console.error('An unexpected error occurred:', e);
            }
        }
    }

    console.log('\n--- Validating UserProfile (Valid) ---');
    if (userProfile) {
        userProfile.name = '홍길동';
        userProfile.age = 30;
        userProfile.email = 'hong.gildong@example.com';

        try {
            const validationErrors = execValidationInValid(userProfile);
            if (validationErrors.length > 0) {
                throw new ValidException(validationErrors);
            }
            console.log('UserProfile is valid.');
        } catch (e: any) {
            if (e instanceof ValidException) {
                console.error('Validation Failed:', JSON.stringify(e.result, null, 2));
            } else {
                console.error('An unexpected error occurred:', e);
            }
        }
    }
}

runValidationExamples();
```

캐싱과 유효성 검증 시스템은 Simple-Boot 애플리케이션의 성능을 향상시키고, 데이터의 신뢰성을 확보하는 데 필수적인 요소입니다. 이로써 우리는 Simple-Boot의 주요 기능들을 모두 살펴보았습니다.

다음 장에서는 Simple-Boot의 기반이 되는 코어 아키텍처와 `SimpleApplication`의 역할에 대해 더 깊이 탐구하겠습니다.