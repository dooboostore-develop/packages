# 제5장: 타입-세이프한 커스텀 알림 타입 추가

`AlertSystem`의 큰 장점은 새로운 종류의 알림을 쉽게 추가할 수 있다는 점입니다. 하지만 단순히 `FrontAlertFactory`에 `case`를 추가하고 `alertService.createFromFactory('MY_CUSTOM_TYPE')`처럼 문자열로 호출하는 방식은 타입스크립트의 강력한 타입 추론 기능을 제대로 활용하지 못하며, 오타에도 취약합니다.

이번 장에서는 TypeScript의 **모듈 보강(Module Augmentation)** 기법을 사용하여, 라이브러리를 직접 수정하지 않고도 우리만의 커스텀 알림 타입을 시스템에 타입-세이프하게 등록하고 확장하는 방법을 알아봅니다.

## 5.1. 왜 타입 확장이 필요한가?

애플리케이션에 '주문 완료' 알림이 필요하다고 가정해 봅시다. 우리는 `FrontAlertFactory`에 `'ORDER_COMPLETE'` 타입을 처리하는 로직을 추가할 수 있습니다. 하지만 개발자가 `alertService.createFromFactory('ORDER_COMPLETE')`를 호출할 때, TypeScript 컴파일러는 이 문자열이 유효한 타입인지 알지 못하며, 반환되는 값의 타입도 `Alert<any>`라는 일반적인 타입으로 추론할 뿐입니다.

우리가 원하는 것은 다음과 같습니다.
1.  `'ORDER_COMPLETE'`가 아닌 다른 문자열을 사용하면 컴파일 시점에 에러를 발생시킨다.
2.  `createFromFactory('ORDER_COMPLETE')`의 반환값이 `OrderCompleteAlert`라는 구체적인 타입임을 컴파일러가 알게 한다.
3.  이 모든 것을 라이브러리(`@dooboostore/simple-boot`) 코드를 직접 수정하지 않고 달성한다.

## 5.2. `FrontAlertFactory` 확장

먼저, 런타임에 실제 동작을 추가합니다. `FrontAlertFactory`가 새로운 커스텀 타입을 인식하고 그에 맞는 `Alert` 객체를 생성하도록 수정합니다.

**`apps/lazycollect/front/service/alert/FrontAlertFactory.ts`**
```typescript
// ...
import { OrderCompleteAlert } from './OrderCompleteAlert'; // 새로 만든 Alert 클래스

// ...
export class FrontAlertFactory<T = any> implements AlertFactory<T> {
  // ...
  create(data?: { type?: AlertType | string; ... }): Alert<T> | undefined {
    switch (data?.type) {
      // ... 기존 case들
      case 'ORDER_COMPLETE': // 커스텀 타입을 문자열로 처리
        return new OrderCompleteAlert(this.alertService, data.config);
    }
    // ...
  }
}
```

## 5.3. TypeScript 모듈 보강으로 타입 안정성 확보

이제 타입스크립트 컴파일러에게 우리가 추가한 커스텀 타입을 알려줄 차례입니다. 프로젝트의 `types` 폴더 등에 `alert-augmentation.d.ts`와 같은 타입 선언 파일을 생성하고 아래와 같이 작성합니다.

이 방법의 핵심은 `AlertService`가 사용하는 `AlertFactory` 인터페이스의 `create` 메소드 시그니처를 **오버로드(overload)**하여 확장하는 것입니다.

**`types/alert-augmentation.d.ts`**
```typescript
import { Alert, AlertType } from '@dooboostore/simple-boot/alert';
import { AlertFactoryConfig } from '@dooboostore/simple-boot/alert/AlertFactoryConfig';
import { OrderCompleteAlert } from '../service/alert/OrderCompleteAlert';

// 1. 원본 AlertFactory가 선언된 모듈을 지정하여 보강을 시작합니다.
declare module '@dooboostore/simple-boot/alert/AlertFactory' {

  // 2. AlertFactory 인터페이스에 새로운 시그니처를 병합(merge)합니다.
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

## 5.4. 타입-세이프한 커스텀 알림 사용

이제 모든 준비가 끝났습니다. `AlertService`의 코드는 단 한 줄도 수정하지 않았지만, 우리는 타입 시스템의 도움을 받아 훨씬 안전하고 편리하게 커스텀 알림을 사용할 수 있습니다.

```typescript
// 이제 createFromFactory를 호출하면...

// 1. 타입 추론의 마법!
// TypeScript는 'ORDER_COMPLETE' 문자열을 보고 우리가 보강한
// 첫 번째 create 시그니처를 선택합니다.
// 따라서 myAlert 변수의 타입은 `OrderCompleteAlert | undefined`로 정확하게 추론됩니다.
const myAlert = alertService.createFromFactory('ORDER_COMPLETE', { ... });

// 2. 타입 안정성
// 오타가 발생하면 즉시 컴파일 에러를 표시합니다.
// Error: Argument of type '"ORDER_COMPLEET"' is not assignable to parameter of type...
const typoAlert = alertService.createFromFactory('ORDER_COMPLEET', { ... });

// 3. 기존 타입은 그대로 동작
// dangerAlert 변수의 타입은 `Alert<any> | undefined`로 추론됩니다.
const dangerAlert = alertService.createFromFactory(AlertType.DANGER, { ... });
```

이처럼 모듈 보강을 통한 인터페이스 오버로딩은, 라이브러리를 직접 수정하지 않으면서도 프로젝트의 요구사항에 맞게 타입을 확장하는 매우 강력하고 우아한 TypeScript 기법입니다. 이를 통해 우리는 시스템의 유연성과 타입 안정성이라는 두 마리 토끼를 모두 잡을 수 있습니다.

다음 장에서는 지금까지 만든 모든 조각들을 모아, 전체 시스템이 어떻게 동작하는지 최종적으로 정리해보겠습니다.
