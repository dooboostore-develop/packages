# Chapter 4: Performance and Validity - Caching and Validation

Optimizing application performance and ensuring data integrity are directly related to user experience and system stability. This chapter explores how to design and implement Simple-Boot's method-level caching system and declarative data validation system.

## 4.1. Implementing Method-Level Caching

Caching is a technique that stores frequently accessed data in memory to reduce the cost of repeatedly accessing the original source (e.g., database, external API) for the same data. Simple-Boot provides functionality to cache the results of method calls.

### Implementation Principle

Simple-Boot's caching system is implemented through the `@Cache` decorator and `SimProxyHandler`. The core ideas are as follows:

1.  **`@Cache` Decorator:** When the `@Cache` decorator is applied to a method, caching-related settings (cache key generation method, TTL, etc.) are stored in the method's metadata.
2.  **Method Wrapping with `SimProxyHandler`:** When `SimstanceManager` creates a `@Sim` object, it wraps all methods of that object with `SimProxyHandler`. `SimProxyHandler` intercepts method calls and performs caching logic.
3.  **Cache Lookup and Storage:** When a method is called, `SimProxyHandler` first checks the cache storage (`simpleApplicationCache`) to see if data corresponding to the method's cache key exists.
    *   **Cache Hit:** If the data exists, the cached data is returned immediately without executing the actual method.
    *   **Cache Miss:** If the data does not exist, the original method is executed, its result is stored in the cache storage, and then returned. If a TTL (Time To Live) is set, a timer is set to expire the cache after a certain period.
4.  **Cache Invalidation:** By using the `deleteKey` option, such as `@Cache({ deleteKey: ... })`, data corresponding to a specific cache key can be deleted from the cache when that method is called, thereby invalidating the cache.

```typescript
// decorators/cache/CacheDecorator.ts (conceptual)
const cacheProcess = <M extends Method>(data: CacheOption<M>, target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
  const originalMethod = descriptor.value; // Original method

  descriptor.value = function (...args: Parameters<M>) {
    const simpleApplication: SimpleApplication = (this as any)._SimpleBoot_application; // Access SimpleApplication instance
    const cacheStorage = simpleApplicationCache.get(simpleApplication)?.storage; // Cache storage

    // 1. Generate cache key (dynamically based on data.key, data.deleteKey, etc.)
    const cacheKey = generateCacheKey(target, propertyKey, args, data);

    // 2. Cache lookup
    if (cacheStorage && cacheKey && !isUpdate(data)) {
      const cachedResult = cacheStorage.get(cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult; // Cache hit: return cached value
      }
    }

    // 3. Execute original method
    const result = originalMethod.apply(this, args);

    // 4. Cache storage or invalidation
    if (cacheStorage && cacheKey) {
      if (isDeleteKey(data)) {
        cacheStorage.delete(cacheKey); // Invalidate cache
      } else if (isKey(data) || isSetKey(data)) {
        cacheStorage.set(cacheKey, result); // Store cache
        // ... TTL setting logic ...
      }
    }
    return result;
  };
};
```

## 4.2. `@Cache` Decorator

The `@Cache` decorator is applied to methods and allows fine-grained control over caching behavior through various options.

-   **Basic Caching:** If only `@Cache` is used without arguments, a default cache key combining the class name and method name is generated.
-   **`key` Option:** You can directly specify the cache key or provide a function to dynamically generate the key based on method arguments.
-   **`ms` Option:** Sets the cache's time-to-live (in milliseconds). The cache automatically expires after this time.
-   **`deleteKey` Option:** Invalidates a specified cache key when a particular method is called. (e.g., invalidating the cache of related query methods in a data update method)
-   **`setKey` Option:** Uses the method's return value as the cache key to store the cache. (e.g., using the ID of a created resource as the key)

### Example: Using the `@Cache` Decorator

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Cache, CacheManager } from '@dooboostore/simple-boot';

@Sim
class DataService {
    private callCount = 0;

    // Basic caching: Uses class name.method name (DataService.fetchHeavyData) as key
    @Cache
    fetchHeavyData() {
        this.callCount++;
        console.log(`[DataService] Fetching heavy data... (Call count: ${this.callCount})`);
        return { id: 1, data: 'some-heavy-data' };
    }

    // Dynamic key and TTL setting
    @Cache({ key: (id: string) => `user:${id}`, ms: 3000 }) // Key in 'user:ID' format, 3-second TTL
    getUserById(id: string) {
        console.log(`[DataService] Fetching user ${id} from DB...`);
        return { id, name: `User ${id}` };
    }

    // Cache invalidation: Deletes 'user:ID' cache when updateUser is called
    @Cache({ deleteKey: (id: string) => `user:${id}` })
    updateUser(id: string, newName: string) {
        console.log(`[DataService] Updating user ${id} to ${newName}, cache will be cleared.`);
        // Actual DB update logic...
        return { id, name: newName };
    }

    // Uses return value as cache key
    @Cache({ setKey: (createdId: string) => `product:${createdId}` })
    createProduct(name: string) {
        const newId = `prod-${Date.now()}`;
        console.log(`[DataService] Creating product ${name} with ID: ${newId}`);
        return newId; // This ID will be used as the cache key
    }
}

// Create and run SimpleApplication instance
const app = new SimpleApplication();
app.run();

const dataService = app.sim(DataService);
const cacheManager = app.sim(CacheManager); // Inject CacheManager for direct cache control

async function runCacheExamples() {
    console.log('\n--- Basic Caching Example ---');
    dataService?.fetchHeavyData(); // First call: actual method execution
    dataService?.fetchHeavyData(); // Second call: cached data returned

    console.log('\n--- Dynamic Key & TTL Caching Example ---');
    const user1 = dataService?.getUserById('user-001'); // First call: actual method execution
    console.log('User 001:', user1);
    const user1Cached = dataService?.getUserById('user-001'); // Second call: cached data returned
    console.log('User 001 (cached):', user1Cached);

    console.log('Waiting for 3.5 seconds for TTL...');
    await new Promise(resolve => setTimeout(resolve, 3500));

    const user1AfterTTL = dataService?.getUserById('user-001'); // After TTL expiration: actual method executed again
    console.log('User 001 (after TTL):', user1AfterTTL);

    console.log('\n--- Cache Invalidation Example ---');
    dataService?.getUserById('user-002'); // Create cache
    console.log('User 002 (cached):', dataService?.getUserById('user-002'));
    dataService?.updateUser('user-002', 'New Name'); // Invalidate cache
    console.log('User 002 (after update):', dataService?.getUserById('user-002')); // Actual method executed again

    console.log('\n--- SetKey Caching Example ---');
    const productId = dataService?.createProduct('Laptop');
    console.log('Created Product ID:', productId);
    // Directly query cache via CacheManager
    const cachedProduct = cacheManager?.findCacheByKey(`product:${productId}`);
    console.log('Cached Product:', cachedProduct?.data);
}

runCacheExamples();
```

## 4.3. Data Validation System

Data validation is essential for application stability and security. Simple-Boot provides a system that allows declarative application of validation rules to class properties.

### Implementation Principle

Simple-Boot's validation system is implemented through the `@Validation` decorator and the `execValidation` function.

1.  **`@Validation` Decorator:** Apply the `@Validation` decorator to a class property and pass a validation function (Validator) as an argument. This decorator uses `Reflect.defineMetadata` to store the validation function metadata on that property.
2.  **Validator Functions:** Provides predefined validation functions such as `NotNull`, `NotEmpty`, `Regexp`. Developers can also write custom validation functions as needed.
3.  **`execValidation` Function:** When an object requiring validation is passed to the `execValidation(obj)` function, it finds all `@Validation` metadata applied to the object's properties and executes the validation function for the current value of each property. The validation result is returned as an array of `ValidationResult`, including a list of properties that failed validation.
4.  **`ValidException`:** If there are any failed validation items through the `execValidationInValid` function, a `ValidException` is thrown, allowing for consistent error handling in conjunction with the exception handling system.

```typescript
// decorators/validate/Validation.ts (conceptual)
export const Validation = (validator: Validator): ReflectField => {
    return (target: Object, propertyKey: string | symbol) => {
        // Store validator function as metadata on the class property
        ReflectUtils.defineMetadata(ValidationMetadataKey, validator, target, propertyKey);
    }
}

export const execValidation = (obj: any) => {
    const results: ValidationResult[] = [];
    // Find @Validation metadata applied to all properties of the object.
    const validators = getValidators(obj);

    validators.forEach(it => {
        const value = obj[it.propertyKey]; // Current value of the property
        const isValid = it.validator(value); // Execute validator function
        results.push({
            name: it.propertyKey,
            valid: isValid,
            message: isValid ? '' : 'Validation failed'
        });
    });
    return results;
}
```

## 4.4. `@Validation` Decorator

The `@Validation` decorator is applied to class properties to define validation rules. Simple-Boot provides built-in Validator functions such as `NotNull`, `NotEmpty`, and `Regexp`, and custom Validators can be implemented as needed.

### Example: Using the `@Validation` Decorator

```typescript
import 'reflect-metadata';
import { SimpleApplication, Sim, Validation, NotEmpty, NotNull, Regexp, execValidationInValid, ValidException } from '@dooboostore/simple-boot';

// User Profile Class
@Sim
class UserProfile {
    @Validation(NotEmpty) // Name must not be empty
    @Validation(Regexp(/^[a-zA-Z가-힣]+$/)) // Name only allows Korean or English alphabets
    name: string = '';

    @Validation(NotNull) // Age must not be null
    @Validation((value: number) => value >= 0 && value <= 150) // Age between 0 and 150
    age: number | null = null;

    @Validation(NotEmpty) // Email must not be empty
    @Validation(Regexp(/^[^@]+@[^@]+\.[^@]+$/)) // Email format validation
    email: string = '';
}

// Create and run SimpleApplication instance
const app = new SimpleApplication();
app.run();

const userProfile = app.sim(UserProfile);

async function runValidationExamples() {
    console.log('\n--- Validating UserProfile (Invalid) ---');
    if (userProfile) {
        userProfile.name = '123'; // Name: contains numbers (validation failed)
        userProfile.age = -10;   // Age: negative (validation failed)
        userProfile.email = 'invalid-email'; // Email: format error (validation failed)

        try {
            const validationErrors = execValidationInValid(userProfile);
            if (validationErrors.length > 0) {
                throw new ValidException(validationErrors);
            }
            console.log('UserProfile is valid.');
        } catch (e: any) {
            if (e instanceof ValidException) {
                console.error('Validation Failed:', JSON.stringify(e.result, null, 2));
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
            }
        }
    }
}

runValidationExamples();
```

Caching and validation systems are essential components for improving the performance of Simple-Boot applications and ensuring data reliability. With this, we have covered all the main features of Simple-Boot.

In the next chapter, we will delve deeper into Simple-Boot's core architecture and the role of `SimpleApplication`.

