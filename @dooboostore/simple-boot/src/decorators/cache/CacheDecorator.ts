import 'reflect-metadata'
import { ReflectUtils } from '../../utils/reflect/ReflectUtils';
import { ConstructorType, Method } from '@dooboostore/core/types';
import { Storage } from '@dooboostore/core/storage/Storage';
import { SimstanceManager } from '../../simstance/SimstanceManager';
import { SimOption } from '../../SimOption';
import { SimpleApplication } from '../../SimpleApplication';

export type CacheStorage = {
  get: <T>(key: string) => T | undefined;
  set: <T>(key: string, value: T) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
}
type Key<M extends Method> = string | ((...args: Parameters<M>) => string);
type SetChildrenCache = { key: string, data: any, ms?: number };
type ReturnChildrenKey<M extends Method> = ((r: ReturnType<M>) => (SetChildrenCache) | (SetChildrenCache[]));
type ReturnDeleteChildrenKey<M extends Method> = ((r: ReturnType<M>) => string | string[]);
type ChildrenKey<M extends Method> = { key: Key<M>, childrenKey: ReturnChildrenKey<M>, join?: string };
type ChildrenDeleteKey<M extends Method> = { key: Key<M>, childrenKey: ReturnDeleteChildrenKey<M>, join?: string };
type CacheOption<M extends Method> = { ms?: number } & (
{
  // 아무것도 없는 옵션은 cache save로 하고 기본키는 counstructor name + method name
} | {
  key: Key<M>;
} | {
  key: ChildrenKey<M>
} | {
  deleteKey: Key<M>;
} | {
  deleteKey: ChildrenDeleteKey<M>;
})

export class DefaultCacheStorage implements CacheStorage {
  private storage: Map<string, any> = new Map<string, any>();

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  get<T>(key: string): T | undefined {
    return this.storage.get(key) as T;
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }
}

const isNoKey = <M extends Method>(cacheOption: CacheOption<M>): cacheOption is {  } => {
  return !('key' in cacheOption) && !('deleteKey' in cacheOption);
}
const isSingleKey = <M extends Method>(cacheOption: CacheOption<M>): cacheOption is { key: Key<M> } => {
  return 'key' in cacheOption && (typeof (cacheOption as any).key === 'string' || typeof (cacheOption as any).key === 'function');
}
const isChildrenKey = <M extends Method>(cacheOption: CacheOption<M>): cacheOption is { key: ChildrenKey<M> } => {
  return 'key' in cacheOption && typeof (cacheOption as any).key === 'object' && (cacheOption as any).key !== null && 'key' in (cacheOption as any).key && 'childrenKey' in (cacheOption as any).key;
}
const isDeleteKey = <M extends Method>(cacheOption: CacheOption<M>): cacheOption is { deleteKey: Key<M> } => {
  return 'deleteKey' in cacheOption && (typeof (cacheOption as any).deleteKey === 'string' || typeof (cacheOption as any).deleteKey === 'function');
}
const isDeleteChildrenKey = <M extends Method>(cacheOption: CacheOption<M>): cacheOption is { deleteKey: ChildrenDeleteKey<M> } => {
  return 'deleteKey' in cacheOption && typeof (cacheOption as any).deleteKey === 'object' && (cacheOption as any).deleteKey !== null && 'key' in (cacheOption as any).deleteKey && 'childrenKey' in (cacheOption as any).deleteKey;
}

export type ConfigDataSet = { data: CacheOption<any>, expireTimeout?: NodeJS.Timeout };
const simpleApplicationCache = new Map<
  SimpleApplication,
  {
    storage: CacheStorage,
    config: Map<string, ConfigDataSet>
  }
>();

// setInterval(() => {
//   // console.log('debug cache', simpleApplicationCache.values())
//   console.dir(simpleApplicationCache.values(), {depth: 10, colors: true});
// }, 1000)

export const findCacheByKey = (simpleApplication: SimpleApplication, key: string) => {
  const storage = simpleApplicationCache.get(simpleApplication)
  if (storage) {
    return Array.from(storage.config.entries()).find(([k, v]) => k === key)
  }
}

export const findCacheByKeyStartWith = (simpleApplication: SimpleApplication, key: string) => {
  const storage = simpleApplicationCache.get(simpleApplication)
  if (storage) {
    return Array.from(storage.config.entries()).filter(([k, v]) => k.startsWith(key))
  } else {
    return [];
  }
}

export const deleteCacheByKey = (simpleApplication: SimpleApplication, key: string) => {
  const storage = simpleApplicationCache.get(simpleApplication)
  if (storage) {
    // delete에서 rootKey 지우면 자식들 다 지워쟈야한다.
    storage.storage.delete(key);
    findCacheByKeyStartWith(simpleApplication, key).forEach(([k, v]) => storage.storage.delete(k))

    const data = storage.config.get(key);
    if (data?.expireTimeout) {
      clearTimeout(data.expireTimeout);
    }
    storage.config.delete(key);
  }
}

export const deleteCacheByKeyStartWith = (simpleApplication: SimpleApplication, key: string) => {
  findCacheByKeyStartWith(simpleApplication, key).forEach(([key, data]) => deleteCacheByKey(simpleApplication, key));
}

const CacheMetadataKey = Symbol('Cache');
const cacheProcess = <M extends Method>(data: CacheOption<M>, target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {


  // 원본 메서드 저장
  const originalMethod = descriptor.value;

  // function으로 해야지 proxy가 먹힌 this를 사용할 수 있다.
  descriptor.value = function (...args: Parameters<M>) {

    const data = ReflectUtils.getMetadata<CacheOption<M>>(CacheMetadataKey, target, propertyKey);
    const simpleApplication: SimpleApplication = (this as any)._SimpleBoot_application as SimpleApplication;
    const simstanceManager: SimstanceManager = (this as any)._SimpleBoot_simstanceManager as SimstanceManager;
    const simOption: SimOption = (this as any)._SimpleBoot_simOption as SimOption;
    if (simpleApplication && simstanceManager && simOption && simOption.cache?.enable && data) {
      const simpleApplicationStorage = simpleApplicationCache.get(simpleApplication) ?? {storage: simOption.cache?.storage ?? new DefaultCacheStorage(), config: new Map<string, ConfigDataSet>()};
      simpleApplicationCache.set(simpleApplication, simpleApplicationStorage);


      let rootKey: undefined | string;
      if (isNoKey(data)) {
        (data as any).key = target.constructor.name + '.' + propertyKey.toString();
      }
      if (isSingleKey(data)) {
        rootKey = typeof data.key === 'function' ? data.key.apply(this, args) : data.key;
        const findTarget = findCacheByKey(simpleApplication, rootKey);
        // console.log('findSingleKey', findTarget, data)
        if (findTarget) {
          const key = findTarget[0];
          return simpleApplicationStorage.storage.get(key)
        }
      } else if (isChildrenKey(data)) {
        rootKey = typeof data.key.key === 'function' ? data.key.key.apply(this, args) : data.key.key;
        const findTargets = findCacheByKeyStartWith(simpleApplication, rootKey);
        const rdata = findTargets.filter(([k, v]) => simpleApplicationStorage.storage.has(k)).map(([k, v]) => simpleApplicationStorage.storage?.get(k));
        if (rdata.length > 0) {
          return rdata;
        }
      } else if (isDeleteKey(data)) {
        rootKey = typeof data.deleteKey === 'function' ? data.deleteKey.apply(this, args) : data.deleteKey;
      } else if (isDeleteChildrenKey(data)) {
        rootKey = typeof data.deleteKey.key === 'function' ? data.deleteKey.key.apply(this, args) : data.deleteKey.key;
      }

      const result = originalMethod.apply(this, args);

      if (isDeleteKey(data) && rootKey) {
        deleteCacheByKey(simpleApplication, rootKey);
      } else if (isDeleteChildrenKey(data) && rootKey) {
        const key = typeof data.deleteKey.childrenKey === 'function' ? data.deleteKey.childrenKey.call(this, result) : data.deleteKey.childrenKey;
        const keys = key instanceof Array ? key : [key];
        keys.forEach(it => deleteCacheByKey(simpleApplication, it));
      } else if (isSingleKey(data) && rootKey) {
        const ms = data.ms ?? simOption.cache?.ms;
        const expireTimeout = ms !== undefined ? setTimeout(() => deleteCacheByKey(simpleApplication, rootKey!), ms) : undefined;
        simpleApplicationStorage.config.set(rootKey, {data: data as CacheOption<any>, expireTimeout});
        simpleApplicationStorage.storage?.set(rootKey, result);
      } else if (isChildrenKey(data) && rootKey) {
        const childrenKeys = typeof data.key.childrenKey === 'function' ? data.key.childrenKey.call(this, result) : data.key.childrenKey;
        const keys = childrenKeys instanceof Array ? childrenKeys : [childrenKeys];
        keys.forEach(it => {
          const childKey = `${rootKey}${data.key.join ?? '.'}${it.key}`;
          const ms = data.ms ?? data.ms ?? simOption.cache?.ms;
          const expireTimeout = ms !== undefined ? setTimeout(() => deleteCacheByKey(simpleApplication, childKey), ms) : undefined;
          simpleApplicationStorage.config.set(childKey, {data: data as CacheOption<any>, expireTimeout});
          simpleApplicationStorage.storage?.set(childKey, it.data);
        });
      }
      return result;
    } else {
      return originalMethod.apply(this, args);
    }
  };
  // console.log('--------->', (target as any)._SimpleBoot_simstanceManager);
  // console.log('--------->', target, propertyKey, descriptor);
  ReflectUtils.defineMetadata(CacheMetadataKey, data, target, propertyKey);

}

export function Cache<M extends Method>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void;
export function Cache<M extends Method>(data: CacheOption<M>): MethodDecorator;
export function Cache<M extends Method>(targetOrOption: Object | CacheOption<M>, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): MethodDecorator | void {
  if (typeof targetOrOption === 'object' && propertyKey && descriptor) {
    // @Cache
    cacheProcess({}, targetOrOption as Object, propertyKey, descriptor as TypedPropertyDescriptor<any>);
  } else if (typeof targetOrOption === 'object') {
    // @Cache({})
    return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
      const data = targetOrOption as CacheOption<M>;
      return cacheProcess(data, target, propertyKey, descriptor);
    }
  } else {
    throw new Error('Invalid arguments for Cache decorator');
  }


  // return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
  //   // 원본 메서드 저장
  //   const originalMethod = descriptor.value;
  //
  //   // function으로 해야지 proxy가 먹힌 this를 사용할 수 있다.
  //   descriptor.value = function (...args: Parameters<M>) {
  //
  //     const data = ReflectUtils.getMetadata<CacheOption<M>>(CacheMetadataKey, target, propertyKey);
  //     const simpleApplication: SimpleApplication = (this as any)._SimpleBoot_application as SimpleApplication;
  //     const simstanceManager: SimstanceManager = (this as any)._SimpleBoot_simstanceManager as SimstanceManager;
  //     const simOption: SimOption = (this as any)._SimpleBoot_simOption as SimOption;
  //     if (simpleApplication && simstanceManager && simOption && simOption.cache?.enable && data) {
  //       const simpleApplicationStorage = simpleApplicationCache.get(simpleApplication) ?? {storage: simOption.cache?.storage ?? new DefaultCacheStorage(), config: new Map<string, ConfigDataSet>()};
  //       simpleApplicationCache.set(simpleApplication, simpleApplicationStorage);
  //
  //
  //       let rootKey: undefined | string;
  //       if (isSingleKey(data)) {
  //         rootKey = typeof data.key === 'function' ? data.key.apply(this, args) : data.key;
  //         const findTarget = findCacheByKey(simpleApplication, rootKey);
  //         // console.log('findSingleKey', findTarget, data)
  //         if (findTarget) {
  //           const key = findTarget[0];
  //           return simpleApplicationStorage.storage.get(key)
  //         }
  //       } else if (isChildrenKey(data)) {
  //         rootKey = typeof data.key.key === 'function' ? data.key.key.apply(this, args) : data.key.key;
  //         const findTargets = findCacheByKeyStartWith(simpleApplication, rootKey);
  //         const rdata = findTargets.filter(([k,v]) => simpleApplicationStorage.storage.has(k)).map(([k, v]) => simpleApplicationStorage.storage?.get(k));
  //         if (rdata.length > 0) {
  //           return rdata;
  //         }
  //       } else if (isDeleteKey(data)) {
  //         rootKey = typeof data.deleteKey === 'function' ? data.deleteKey.apply(this, args) : data.deleteKey;
  //       } else if (isDeleteChildrenKey(data)) {
  //         rootKey = typeof data.deleteKey.key === 'function' ? data.deleteKey.key.apply(this, args) : data.deleteKey.key;
  //       }
  //
  //       const result = originalMethod.apply(this, args);
  //
  //       if (isDeleteKey(data) && rootKey) {
  //         deleteCacheByKey(simpleApplication, rootKey);
  //       } else if (isDeleteChildrenKey(data) && rootKey) {
  //         const key = typeof data.deleteKey.childrenKey === 'function' ? data.deleteKey.childrenKey.call(this, result) : data.deleteKey.childrenKey;
  //         const keys = key instanceof Array ? key : [key];
  //         keys.forEach(it =>deleteCacheByKey(simpleApplication, it));
  //       } else if (isSingleKey(data) && rootKey) {
  //         const ms = data.ms ?? simOption.cache?.ms;
  //         const expireTimeout = ms !== undefined ? setTimeout(() => deleteCacheByKey(simpleApplication, rootKey!), ms) : undefined;
  //         simpleApplicationStorage.config.set(rootKey, {data: data as CacheOption<any> , expireTimeout});
  //         simpleApplicationStorage.storage?.set(rootKey, result);
  //       } else if (isChildrenKey(data) && rootKey) {
  //         const childrenKeys = typeof data.key.childrenKey === 'function' ? data.key.childrenKey.call(this, result) : data.key.childrenKey;
  //         const keys = childrenKeys instanceof Array ? childrenKeys : [childrenKeys];
  //         keys.forEach(it => {
  //           const childKey = `${rootKey}${data.key.join ?? '.'}${it.key}`;
  //           const ms = data.ms ?? data.ms ?? simOption.cache?.ms;
  //           const expireTimeout = ms !== undefined ? setTimeout(() => deleteCacheByKey(simpleApplication, childKey), ms) : undefined;
  //           simpleApplicationStorage.config.set(childKey, {data: data as CacheOption<any>, expireTimeout});
  //           simpleApplicationStorage.storage?.set(childKey, it.data);
  //         });
  //       }
  //
  //       return result;
  //
  //       // simOption.cache.storage.
  //       // const s = typeof data.type === 'symbol'
  //       //      ? simstanceManager.findFirstSim<Storage>(data.type)
  //       //      : simstanceManager.findFirstSim<Storage>({ type: data.type as ConstructorType<any> });
  //       // const storage = s?.getValue();
  //       // if (storage) {
  //       //
  //       // }
  //     } else {
  //       return originalMethod.apply(this, args);
  //     }
  //   };
  //   // console.log('--------->', (target as any)._SimpleBoot_simstanceManager);
  //   // console.log('--------->', target, propertyKey, descriptor);
  //   ReflectUtils.defineMetadata(CacheMetadataKey, data, target, propertyKey);
  // }
}
