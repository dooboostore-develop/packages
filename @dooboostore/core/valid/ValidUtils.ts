import { FilterFalsy, FilterNullish, NonNullable, Nullish } from '../types';

export class ValidUtils {
    static isNullOrUndefined(data: any): boolean {
        return data == null || undefined === data;
    }

    static isNullish<T = any>(data: T | null | undefined): data is null | undefined {
        return ValidUtils.isNotNullish(data);
    }
    static isNotNullish<T>(data: T | null | undefined): data is NonNullable<T> {
        if ((Array.isArray(data) || ValidUtils.isString(data) )) {
            return data.length > 0;
        }

        if (data instanceof Set || data instanceof Map) {
            return data.size > 0;
        }

        if (typeof data === 'object'){
            return Object.keys(data).length > 0;
        }

        return data !== null && data !== undefined;
    }

    static isNotNullUndefined<T>(data: T | null | undefined): data is NonNullable<T> {
        return data !== null && data !== undefined;
    }

    static isNull(data: any): data is null {
       return data === null;
    }

    static isUndefined(data: any): data is undefined {
       return data === undefined;
    }

    static isArray(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Array]'
        }
    }

    static isNumber(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Number]'
        }
    }

    static isString(object_o: any): object_o is string {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object String]'
        }
    }

    static isFunction(object_o: any): boolean {
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

    static isObject(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Object]'
        }
    }

    static isMap(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Map]'
        }
    }


    public static isEmpty = (object_o: any): boolean => {
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


    public static isSet = <T = any>(data: any): data is Set<T> => {
        return data instanceof Set;
    };

    public static isNullishFiltered = <T>(value: unknown): value is FilterNullish<T> => {
        if (Array.isArray(value)) {
            return value.every(it => it !== undefined && it !== null);
        }
        return value !== undefined && value !== null;
    };

    public static isFalsyFiltered = <T>(value: unknown): value is FilterFalsy<T> => {
        if (Array.isArray(value)) {
            return value.every(it => {
                return it;
            });
        }
        return !!value;
    };

    public static includeValue = (obj: object, value: any): boolean => {
        return Object.values(obj).includes(value);
    };
    public static includeKey = (obj: object, key: string): boolean => {
        return Object.keys(obj).includes(key);
    };

    /** 종성이 있는지 확인하는 함수 */
    public static lastConsonantLetter = (value: string): boolean => {
        const lastLetter = value.charCodeAt(value.length - 1);
        return (lastLetter - 0xac00) % 28 > 0;
    };

    public static inRange = (value: number, min: number, max: number) => {
        return min <= value && value <= max;
    };
}
