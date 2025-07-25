# Chapter 5: Adding Type-Safe Custom Alert Types

A great advantage of `AlertSystem` is the ease with which new types of alerts can be added. However, simply adding a `case` to `FrontAlertFactory` and calling it with a string like `alertService.createFromFactory('MY_CUSTOM_TYPE')` does not fully utilize TypeScript's powerful type inference capabilities and is vulnerable to typos.

In this chapter, we will learn how to register and extend our own custom alert types in a type-safe manner without directly modifying the library, using TypeScript's **Module Augmentation** technique.

## 5.1. Why is Type Extension Necessary?

Suppose we need an 'Order Complete' alert in our application. We can add logic to `FrontAlertFactory` to handle the 'ORDER_COMPLETE' type. However, when a developer calls `alertService.createFromFactory('ORDER_COMPLETE')`, the TypeScript compiler does not know if this string is a valid type, and the return value's type is inferred as a generic `Alert<any>`.

What we want is as follows:
1.  If a string other than 'ORDER_COMPLETE' is used, a compile-time error should occur.
2.  The compiler should know that the return value of `createFromFactory('ORDER_COMPLETE')` is a concrete type, `OrderCompleteAlert`.
3.  All of this should be achieved without directly modifying the library (`@dooboostore/simple-boot`) code.

## 5.2. Extending `FrontAlertFactory`

First, we add the actual runtime behavior. We modify `FrontAlertFactory` to recognize new custom types and create the corresponding `Alert` objects.

**`apps/lazycollect/front/service/alert/FrontAlertFactory.ts`**
```typescript
// ...
import { OrderCompleteAlert } from './OrderCompleteAlert'; // Newly created Alert class

// ...
export class FrontAlertFactory<T = any> implements AlertFactory<T> {
  // ...
  create(data?: { type?: AlertType | string; ... }): Alert<T> | undefined {
    switch (data?.type) {
      // ... existing cases
      case 'ORDER_COMPLETE': // Handle custom type as a string
        return new OrderCompleteAlert(this.alertService, data.config);
    }
    // ...
  }
}
```

## 5.3. Ensuring Type Safety with TypeScript Module Augmentation

Now it's time to inform the TypeScript compiler about the custom types we've added. Create a type declaration file like `alert-augmentation.d.ts` in your project's `types` folder and add the following content.

The core of this method is to **overload** and extend the `create` method signature of the `AlertFactory` interface used by `AlertService`.

**`types/alert-augmentation.d.ts`**
```typescript
import { Alert, AlertType } from '@dooboostore/simple-boot/alert';
import { AlertFactoryConfig } from '@dooboostore/simple-boot/alert/AlertFactoryConfig';
import { OrderCompleteAlert } from '../service/alert/OrderCompleteAlert';

// 1. Start augmentation by specifying the module where the original AlertFactory is declared.
declare module '@dooboostore/simple-boot/alert/AlertFactory' {

  // 2. Merge the new signature into the AlertFactory interface.
  interface AlertFactory<T> {
    // 3. 'ORDER_COMPLETE' 타입을 위한 구체적인 오버로드를 추가합니다.
    // 이 시그니처 덕분에 컴파일러는 type이 'ORDER_COMPLETE'일 때
    // 반환값이 OrderCompleteAlert 타입임을 정확히 알게 됩니다.
    create(data?: {
        caller?: any;
        type?: 'ORDER_COMPLETE';
        config?: AlertFactoryConfig<T>;
    }): OrderCompleteAlert | undefined;

    // 4. 다른 커스텀 타입들도 여기에 계속 추가할 수 있습니다.

    // 5. 기존의 일반적인 시그니처도 유지되어야 합니다.
    // 타입스크립트는 가장 구체적인 오버로드부터 순서대로 타입을 체크합니다.
    create(data?: {
        caller?: any;
        type?: AlertType | string;
        config?: AlertFactoryConfig<T>;
    }): Alert<T> | undefined;
  }
}
```

## 5.4. Using Type-Safe Custom Alerts

Now all preparations are complete. Although we haven't modified a single line of `AlertService` code, we can use custom alerts much more safely and conveniently with the help of the type system.

```typescript
// Now, when calling createFromFactory...

// 1. The magic of type inference!
// TypeScript sees the string 'ORDER_COMPLETE' and selects the first
// create signature we augmented.
// Therefore, the type of the myAlert variable is accurately inferred as `OrderCompleteAlert | undefined`.
const myAlert = alertService.createFromFactory('ORDER_COMPLETE', { ... });

// 2. Type safety
// If a typo occurs, a compile error is immediately displayed.
// Error: Argument of type '"ORDER_COMPLEET"' is not assignable to parameter of type...
const typoAlert = alertService.createFromFactory('ORDER_COMPLEET', { ... });

// 3. Existing types still work
// The type of the dangerAlert variable is inferred as `Alert<any> | undefined`.
const dangerAlert = alertService.createFromFactory(AlertType.DANGER, { ... });
```

As such, interface overloading through module augmentation is a very powerful and elegant TypeScript technique for extending types to meet project requirements without directly modifying the library. Through this, we can achieve both system flexibility and type safety.

In the next chapter, we will gather all the pieces we've built so far and summarize how the entire system works.
