import { ConstructorType, isDefined } from '../types';
import { ValidUtils } from '../valid/ValidUtils';

export namespace ObjectUtils {
  export const deepCopy = <T = any>(obj: T):T => {
    if (obj instanceof Map) {
      return new Map<any, any>(JSON.parse(JSON.stringify(Array.from(obj.entries())))) as T;
    } else if (obj instanceof Set) {
      return new Set<any>(JSON.parse(JSON.stringify(Array.from(obj.values())))) as T;
    } else if (ValidUtils.isNullOrUndefined(obj)) {
      return obj;
    }

    return JSON.parse(JSON.stringify(obj));
  };
  export const getAllProtoTypeName = (target?: any): string[] => {
    let data: string[] = [];
    if (target) {
      const proto = Object.getPrototypeOf(target);
      if (proto && (data = Object.keys(proto) || []).length > 0) {
        data = data.concat(ObjectUtils.getAllProtoTypeName(proto));
      }
    }
    return data.filter(it => it !== 'constructor');
  };

  export const uniqueKeys = (obj: (object[]) | object) => {
    const allKeys = Array.from(new Set((Array.isArray(obj) ? obj : [obj]).flatMap(item => Object.keys(item))));
    return allKeys;
  };
  export const getOwnPropertyNames = (target?: any): string[] => {
    const data: string[] = [];
    if (target) {
      if (!target.prototype) {
        const a = Object.getPrototypeOf(target);
        data.push(...Object.getOwnPropertyNames(a));
      } else {
        data.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(target)));
      }
    }
    return data.filter(it => it !== 'constructor');
  };

  export const getProtoTypeName = (target?: any): string[] => {
    let data: string[] = [];
    if (target) {
      const proto = Object.getPrototypeOf(target);
      data = Object.keys(proto) || [];
    }
    return data.filter(it => it !== 'constructor');
  };

  export const getProtoTypes = (target?: any): Function[] => {
    const data: Function[] = [];
    if (target) {
      const proto = Object.getPrototypeOf(target);
      (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
        data.push(proto[it]);
      });
    }
    return data;
  };

  export const seal = <T>(target: T): T => {
    return Object.seal(target);
  };

  /*
  Object.prototype.isPrototypeOf()
  isPrototypeOf() 메소드는 해당 객체가 다른 객체의 프로토타입 체인에 속한 객체인지 확인하기 위해 사용됩니다.
   */
  export const isPrototypeOfTarget = (start: ConstructorType<any> | Function | null | undefined, target: any | null | undefined): boolean => {
    if (start && target) {
      return Object.prototype.isPrototypeOf.call(start.prototype, target);
    } else {
      return false;
    }
  };

  export const getPrototypeOfDepth = (target: any, dest: ConstructorType<any> | Function | null | undefined): object[] => {
    let object = target;
    const r = [];
    if (dest) {
      do {
        object = Object.getPrototypeOf(object);
        if (object?.constructor === dest) {
          break;
        }
        r.push(object);
      } while (object);
    }
    return r;
  };

  export const getAllProtoType = (start: ConstructorType<any> | Function): (ConstructorType<any> | Function)[] => {
    const depth = (target: ConstructorType<any> | Function, bowl: (ConstructorType<any> | Function)[] = []) => {
      if (target.prototype) {
        bowl.push(target);
        depth(Object.getPrototypeOf(target), bowl);
      }
      return bowl;
    };
    const d = depth(start);
    return d;
    // const protos: (ConstructorType<any> | Function)[] = []
    // while (start) {
    //     protos.push(start);
    //     start = Object.getPrototypeOf(start)
    // }
    // return protos;
  };

  export const getPrototypeOf = (start: any) => {
    return Object.getPrototypeOf(start);
  };

  export const getPrototypeKeyMap = (target: any): Map<Function, string> => {
    const data = new Map<Function, string>();
    if (target) {
      const proto = Object.getPrototypeOf(target);
      (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
        data.set(proto[it], it);
      });
    }
    return data;
  };

  export const getPrototypeName = (target: any, fnc: Function): string | undefined => {
    return ObjectUtils.getPrototypeKeyMap(target).get(fnc);
  };


  export const getRandomKey = <T>(target: T): keyof T => {
    
    const keys = Object.keys(target as any) as Array<keyof T>;
    return keys[Math.floor(Math.random() * keys.length)];
  };

  export const getRandomValue = <T>(target: T): T[keyof T] => {
    const keys = Object.keys(target as any) as Array<keyof T>;
    return target[keys[Math.floor(Math.random() * keys.length)]];
  };

  export const getRandomKeyValue = <T>(target: T): { key: keyof T, value: T[keyof T] } => {
    const keys = Object.keys(target as any) as Array<keyof T>;
    const key = keys[Math.floor(Math.random() * keys.length)];
    return { key, value: target[key] };
  };

  export const getKeyValues = <T>(target: T): { key: keyof T, value: T[keyof T] }[] => {
    const keys = Object.keys(target as any) as Array<keyof T>;
    return keys.map(key => ({ key, value: target[key] }));
  };

  export const getValues = <T>(target: T): (T[keyof  T])[] => {
    return Object.values(target as any);
  }

  export const getKeys = <T>(target: T): (keyof T)[] => {
    return Object.keys(target as any) as (keyof T)[];
  }


  export const toDeleteUndefinedAndNull = <T>(target: T, config?: { deep?: boolean }): T => {
    const cleanValue = (value: any): any => {
      if (Array.isArray(value)) {
        return value.filter(item => item !== undefined && item !== null).map(cleanValue);
      } else if (value && typeof value === 'object') {
        if (config?.deep) {
          return Object.fromEntries(Object.entries(value).filter(([_, v]) => v !== undefined && v !== null).map(([k, v]) => [k, cleanValue(v)])
          );
        } else {
          return Object.fromEntries(
            Object.entries(value).filter(([_, v]) => v !== undefined && v !== null)
          );
        }
      }
      return value;
    };

    return cleanValue(target) as T;
  };


  export namespace Path {
    export const to = <T = any>(obj: any) => {
      const destination: T = {} as any;
      Object.entries(obj).forEach(([path, value]) => {
        set(destination, path, value);
      });

      return destination;
    };
    export const set = (obj: any, path: string, value: any) => {
      const pathParts = path.split('.');
      let current = obj;

      for (let i = 0; i < pathParts.length; i++) {
        let key = pathParts[i];
        const isArrayItem = key.includes('[') && key.includes(']');
        const isLastKey = i === pathParts.length - 1;

        if (isArrayItem) {
          let [arrayKey, indexStr] = key.split('[');
          const index = parseInt(indexStr.replace(']', ''), 10);

          if (!Array.isArray(current[arrayKey])) {
            current[arrayKey] = [];
          }

          if (isLastKey) {
            current[arrayKey][index] = value;
          } else {
            if (!current[arrayKey][index]) {
              current[arrayKey][index] = {};
            }
            current = current[arrayKey][index];
          }
        } else {
          if (isLastKey) {
            current[key] = value;
          } else {
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }
        }
      }
    };
  }

  export const toDeleteKey = (obj: any, keys: (null |string)[]) => {
    const target = {...obj};
    ObjectUtils.deleteKey(target, keys);
    return target;
  }
  export const deleteKey = (obj: any, keys: (null |string)[]) => {
    keys.filter(it=>isDefined(it)).forEach(it => {
      delete obj[it];
    })
  }

}
