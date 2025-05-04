import { FilterFalsy, FilterNullish, NonNullable, Nullish } from '../types';

export namespace ValidUtils {
  export const isNullOrUndefined = (data: any): boolean => {
    return data == null || undefined === data;
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

    if (typeof data === 'object') {
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

  export const isFunction = (object_o: any): boolean => {
    if (ValidUtils.isNullOrUndefined(object_o)) {
      return false
    } else {
      return Object.prototype.toString.call(object_o).trim() === '[object Function]'
    }
    // if (typeof object_o === 'function') {
    //     return true;
    // }else {
    //     return false;
    // }
  }

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
}
