import { ConstructorType } from '../types';

export namespace ReflectUtils {
  export const getParameterTypes = (target: any, propertyKey?: string | symbol): ConstructorType<any>[] => {
    if (propertyKey) {
      return Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
    } else {
      return Reflect.getMetadata('design:paramtypes', target) || [];
    }
  };

  export const getReturnType = (target: any, propertyKey: string | symbol): any => {
    return Reflect.getMetadata('design:returntype', target, propertyKey);
  };

  export const getType = (target: any, propertyKey?: string | symbol): any => {
    if (propertyKey) {
      return Reflect.getMetadata('design:type', target, propertyKey);
    } else {
      return Reflect.getMetadata('design:type', target);
    }
  };

  export const getMetadata = <T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T | undefined => {
    if (propertyKey) {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    } else {
      return Reflect.getMetadata(metadataKey, target);
    }
  };

  export const findMetadata = <T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T | undefined => {
    if (target == null) return undefined;
    let searchTarget = typeof target === 'object' && typeof target !== 'function' ? target.constructor : target;

    while (searchTarget && searchTarget !== Object) {
      const data = propertyKey ? Reflect.getOwnMetadata(metadataKey, searchTarget, propertyKey) : Reflect.getOwnMetadata(metadataKey, searchTarget);
      if (data !== undefined) return data;
      const proto = Object.getPrototypeOf(searchTarget);
      searchTarget = proto && typeof proto === 'function' ? proto : proto?.constructor || null;
      if (searchTarget === target) break;
    }
    return undefined;
  };

  /**
   * 프로토타입 체인의 모든 메타데이터를 수집하여 리스트로 반환합니다. (부모 -> 자식 순)
   */
  export const findAllMetadata = <T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T[] => {
    const results: T[] = [];
    if (target == null) return results;
    let searchTarget = typeof target === 'object' && typeof target !== 'function' ? target.constructor : target;

    while (searchTarget && searchTarget !== Object) {
      const data = propertyKey ? Reflect.getOwnMetadata(metadataKey, searchTarget, propertyKey) : Reflect.getOwnMetadata(metadataKey, searchTarget);
      if (data !== undefined) results.unshift(data); // 부모 데이터를 앞에 추가
      const proto = Object.getPrototypeOf(searchTarget);
      searchTarget = proto && typeof proto === 'function' ? proto : proto?.constructor || null;
      if (searchTarget === target) break;
    }
    return results;
  };

  /**
   * 모든 메타데이터(배열 형태)를 수집하여 하나의 배열로 합칩니다. (부모 -> 자식 순)
   */
  export const findAllMetadataFlatten = <T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T[] => {
    const results: T[] = [];
    const metaList = findAllMetadata<T[]>(metadataKey, target, propertyKey);
    metaList.forEach(data => {
      if (Array.isArray(data)) results.push(...data);
    });
    return [...new Set(results)];
  };

  /**
   * 프로토타입 체인의 모든 메타데이터(맵 형태)를 수집하여 합칩니다. (부모 -> 자식 순)
   */
  export const findAllMapMetadata = <K, V>(metadataKey: any, target: any): Map<K, V[]> => {
    const finalMap = new Map<K, V[]>();
    const metaList = findAllMetadata<Map<K, V[]>>(metadataKey, target);

    metaList.forEach(data => {
      if (data instanceof Map) {
        data.forEach((values, key) => {
          if (!finalMap.has(key)) finalMap.set(key, []);
          const valArr = Array.isArray(values) ? values : [values];
          finalMap.get(key)!.push(...(valArr as any));
        });
      }
    });
    return finalMap;
  };

  export const getMetadataKeys = (target: any) => {
    return Reflect.getMetadataKeys(target);
  };

  export const getOwnMetadata = (metadataKey: any, target: any, propertyKey?: string | symbol): any => {
    if (propertyKey) {
      return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    } else {
      return Reflect.getOwnMetadata(metadataKey, target);
    }
  };

  export const getMetadatas = (target: any) => {
    return getMetadataKeys(target).map(it => getMetadata(it, target));
  };

  export const metadata = (metadataKey: any, data: any) => {
    return Reflect.metadata(metadataKey, data);
  };

  export const defineMetadata = (metadataKey: any, value: any, target: any, propertyKey?: string | symbol) => {
    if (propertyKey && Reflect.defineMetadata) {
      Reflect.defineMetadata(metadataKey, value, target, propertyKey);
    } else if (Reflect.defineMetadata) {
      Reflect.defineMetadata(metadataKey, value, target);
    }
  };

  /**
   * 한 타겟에서 다른 타겟으로 모든 메타데이터를 복사합니다. (이미 등록된 클래스 갱신용)
   */
  export const copyMetadata = (from: any, to: any, propertyKey?: string | symbol) => {
    const keys = propertyKey ? (Reflect as any).getOwnMetadataKeys(from, propertyKey) : (Reflect as any).getOwnMetadataKeys(from);
    for (const key of keys) {
      const data = propertyKey ? Reflect.getOwnMetadata(key, from, propertyKey) : Reflect.getOwnMetadata(key, from);
      if (propertyKey) {
        (Reflect as any).defineMetadata(key, data, to, propertyKey);
      } else {
        (Reflect as any).defineMetadata(key, data, to);
      }
    }
  };
}
