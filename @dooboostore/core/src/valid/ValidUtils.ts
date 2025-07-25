import { ConstructorType, FilterFalsy, FilterNullish, NonNullable, Nullable, Nullish, NullOrUndefined } from '../types';

export namespace ValidUtils {

  export const  isArrowFunction = (fn: any): fn is Function  => {
    // 1. 함수가 아니면 false
    if (typeof fn !== 'function') {
      return false;
    }
    // 2. prototype 속성이 없으면 화살표 함수 (또는 prototype이 없는 다른 callable)
    // 3. 클래스는 'class' 키워드로 시작하므로 제외
    return typeof fn.prototype === 'undefined' && !fn.toString().startsWith('class');
  }

  function isConstructorLike(fn: any): boolean {
    // 1. 함수여야 하고,
    // 2. prototype 속성을 가져야 함
    return typeof fn === 'function' && typeof fn.prototype !== 'undefined';
  }




  export const isNullOrUndefined = (data: unknown): data is (null | undefined) => {
  return data == null || undefined === data;
}

  export const isConstructor = (obj: ConstructorType<any> | ((e: any) => void)): obj is ConstructorType<any> => {
    // 함수이면서 prototype 속성이 있고 prototype이 객체인지 확인
    return typeof obj === 'function'
      && obj.prototype !== undefined
      && obj.prototype.constructor === obj
      // && Object.getOwnPropertyNames(obj.prototype).length > 1; // constructor 외에 다른 속성이 있는지 확인
  }
  export const isFunction = (obj: ConstructorType<any> | ((e: any) => void)): obj is ((e: any) => void) => {
    return typeof obj === 'function' && !isConstructor(obj);
  }
  export const isNullish = <T = any>(data: T | null | undefined): data is null | undefined => {
    return ValidUtils.isNotNullish(data);
  }
  export const isNotNullish = <T>(data: T | null | undefined): data is NonNullable<T> => {
    if ((Array.isArray(data) || ValidUtils.isString(data))) {
      return data.length > 0;
    }

    if (data instanceof Set || data instanceof Map) {
      return data.size > 0;
    }

    if (typeof data === 'object' && data !== null) {
      return Object.keys(data).length > 0;
    }

    return data !== null && data !== undefined;
  }

  export const isNotNullUndefined = <T>(data: T | null | undefined): data is NonNullable<T> => {
    return data !== null && data !== undefined;
  }

  export const isNull = (data: any): data is null => {
    return data === null;
  }

  export const isUndefined = (data: any): data is undefined => {
    return data === undefined;
  }

  export const isArray = (object_o: any): boolean => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return false
    } else {
      return Object.prototype.toString.call(object_o).trim() === '[object Array]'
    }
  }

  export const isNumber = (object_o: any): boolean => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return false
    } else {
      return Object.prototype.toString.call(object_o).trim() === '[object Number]'
    }
  }

  export const isIterator = <T>(object_o: any): object_o is Iterable<T> => {
    return object_o != null && typeof object_o[Symbol.iterator] === 'function';
  };

  export const isString = (object_o: any): object_o is string => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return false
    } else {
      return Object.prototype.toString.call(object_o).trim() === '[object String]'
    }
  }

  // export const isFunction = (object_o: any): boolean => {
  //   if (ValidUtils.isNullOrUndefined(object_o)) {
  //     return false
  //   } else {
  //     return Object.prototype.toString.call(object_o).trim() === '[object Function]'
  //   }
  //   // if (typeof object_o === 'function') {
  //   //     return true;
  //   // }else {
  //   //     return false;
  //   // }
  // }

  export const isObject = (object_o: any): boolean => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return false
    } else {
      return Object.prototype.toString.call(object_o).trim() === '[object Object]'
    }
  }

  export const isMap = (object_o: any): boolean => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return false
    } else {
      return Object.prototype.toString.call(object_o).trim() === '[object Map]'
    }
  }


  export const isEmpty = (object_o: any): boolean => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return true;
    } else if (ValidUtils.isArray(object_o)) {
      return object_o.length === 0;
    } else if (ValidUtils.isString(object_o)) {
      return object_o.trim().length === 0;
    } else if (ValidUtils.isMap(object_o)) {
      return object_o.size === 0;
    } else if (ValidUtils.isObject(object_o)) {
      return Object.keys(object_o).length === 0;
    } else {
      return false;
    }
  };


  export const isSet = <T = any>(data: any): data is Set<T> => {
    return data instanceof Set;
  };

  export const isNullishFiltered = <T>(value: unknown): value is FilterNullish<T> => {
    if (Array.isArray(value)) {
      return value.every(it => it !== undefined && it !== null);
    }
    return value !== undefined && value !== null;
  };

  export const isFalsyFiltered = <T>(value: unknown): value is FilterFalsy<T> => {
    if (Array.isArray(value)) {
      return value.every(it => {
        return it;
      });
    }
    return !!value;
  };

  export const includeValue = (obj: object, value: any): boolean => {
    return Object.values(obj).includes(value);
  };
  export const includeKey = (obj: object, key: string): boolean => {
    return Object.keys(obj).includes(key);
  };

  /** 종성이 있는지 확인하는 함수 */
  export const lastConsonantLetter = (value: string): boolean => {
    const lastLetter = value.charCodeAt(value.length - 1);
    return (lastLetter - 0xac00) % 28 > 0;
  };

  export const inRange = (value: number, min: number, max: number) => {
    return min <= value && value <= max;
  };

  export const isBase64 = (inputString: string) => {
    // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAA
    // const isValidBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    // return isValidBase64.test(base64String);

    let base64Data = inputString;

    // Data URL 접두사 제거 (예: "data:image/png;base64,")
    const parts = inputString.split(';base64,');
    if (parts.length > 1) {
      base64Data = parts[1];
    } else {
      // "data:"만 있고 ";base64,"가 없는 경우도 고려 (엄밀히는 base64가 아닐 수 있음)
      if (inputString.startsWith('data:')) {
        // 이 경우는 유효한 base64로 간주할지 정책에 따라 다름
        // 여기서는 일단 base64 부분이 없다고 가정하고 false 처리
        // return false;
        // 또는 접두사만 제거하고 남은 부분을 테스트할 수도 있음
        const commaIndex = inputString.indexOf(',');
        if (commaIndex > -1) {
          base64Data = inputString.substring(commaIndex + 1);
        } else {
          // 순수 base64가 아닐 가능성 높음
          // return false;
        }
      }
    }


    // Base64 유효성 검사 정규식
    // - 문자열 길이는 4의 배수여야 함 (패딩 제외)
    // - 패딩 '='는 최대 2개까지 문자열 끝에만 올 수 있음
    // - 패딩이 1개일 경우, 그 앞 문자는 [A-Za-z0-9+/]
    // - 패딩이 2개일 경우, 그 앞 두 문자는 [A-Za-z0-9+/]
    // 조금 더 엄격하고 효율적인 정규식:
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    // 추가적으로, 실제 base64 문자열은 패딩을 제외한 길이가 4의 배수여야 합니다.
    // 정규식만으로는 이 부분을 완벽히 커버하기 어려울 수 있어, 길이 체크를 추가하는 것이 좋습니다.
    // 하지만 현재 제공된 정규식은 이 부분을 어느 정도 고려하고 있습니다.
    // (([A-Za-z0-9+/]{4})* 부분과 패딩 부분)

    if (base64Data === '' || base64Data.length % 4 !== 0) {
      // 빈 문자열이거나, 길이가 4의 배수가 아니면 (일반적으로) 유효한 base64가 아님.
      // (단, 일부 라이브러리는 패딩이 없는 base64도 허용하므로, 엄격한 기준에 따라 다름)
      // 현재 정규식은 패딩이 올바르게 적용된 경우 길이가 4의 배수가 아닌 경우도 통과시킬 수 있음
      // 예: "QQ" (길이 2) -> false, "QQQ" (길이 3) -> false
      // "QQ==" (길이 4) -> true, "QQQ=" (길이 4) -> true
      // "QQQ"는 `base64Regex.test("QQQ")`는 false이지만, `Buffer.from("QQQ", "base64").toString("base64")`는 "QQ=="를 반환.
      // 엄밀하게는 디코딩 시도 후 다시 인코딩해서 원본과 같은지 비교하는 것이 가장 확실하지만, 성능 이슈가 있을 수 있음.
    }


    return base64Regex.test(base64Data);
  }
}
