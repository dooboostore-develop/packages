import { ConstructorType, GenericClassDecorator } from '@dooboostore/core';
import { ReflectUtils } from '@dooboostore/core';
import { SimpleApplication } from '../SimpleApplication';
import { ValidUtils } from '@dooboostore/core';

export enum Lifecycle {
  /**
   * The default registration scope, Each resolve will return the same instance (including resolves from child containers)
   */
  Singleton = 'Singleton',
  /**
   * a new instance will be created with each resolve
   */
  Transient = 'Transient'
}

export const sims = new Map<ConstructorType<any> | Function, Set<ConstructorType<any> | Function | any>>();
export const containers = new Set<SimpleApplication>();
// console.log('-->',sims)

export type SimConfigProxy = ((ProxyHandler<any> | ConstructorType<any> | Function)) | (ProxyHandler<any> | ConstructorType<any> | Function)[];
export type SimConfigUsing = (ConstructorType<any> | Function | object) | ((ConstructorType<any> | Function | object)[]);

export interface SimConfig {
  symbol?: symbol | (symbol[]);
  scheme?: string | (string[]);
  scope?: Lifecycle;
  container?: SimpleApplication | symbol | (SimpleApplication | symbol)[];
  autoCreate?: boolean;
  proxy?: SimConfigProxy;
  type?: (ConstructorType<any> | Function) | (ConstructorType<any> | Function)[];
  using?: SimConfigUsing;
}

export const SimMetadataKey = Symbol.for('simple-boot:sim-metadata');

const isNotNullObjetInstance = (target: any) => target != null && target !== undefined && typeof target === 'object';

export const simProcess = (config: SimConfig, inputTarget: ConstructorType<any> | Function | any) => {
  // default setting
  /*
  // Sim({symbol: TTSymbol, scope: Lifecycle.Transient})(function (){
  //   console.log('new TT')
  //   return {a: 'name'}
  // })
  // Sim({symbol: TTSymbol, scope: Lifecycle.Transient})(() =>{
  //   console.log('new TT')
  //   return {a: 'name'}
  // })
  Sim({symbol: TTSymbol, scope: Lifecycle.Transient})({a: 'name'})
   */
  const target = (() => {
    if (typeof inputTarget === 'object') {
      return config.scope === Lifecycle.Singleton ? inputTarget : (ValidUtils.isPlainObject(inputTarget) ? { ...inputTarget }: inputTarget);
    }
    if (ValidUtils.isArrowFunction(inputTarget)) {
      return () => (inputTarget as Function)();
    }
    return inputTarget;
  })();




  let targetType: ConstructorType<any> | Function;
  if (isNotNullObjetInstance(target)) {
    targetType = target.constructor;
  } else {
    targetType = target;
  }
  config.scope = config?.scope ?? Lifecycle.Singleton;
  ReflectUtils.defineMetadata(SimMetadataKey, config, targetType);
  const adding = (targetKey: ConstructorType<any> | Function, target: ConstructorType<any> | Function | any = targetKey) => {
    const items = sims.get(targetKey) ?? new Set<ConstructorType<any> | Function | any>();
    items.add(target);
    sims.set(targetKey, items);
  }


  if (Array.isArray(config?.type)) {
    config?.type.forEach(it => {
      adding(it, target);
    })
  } else if (config.type) {
    adding(config?.type, target);
  } else {
    adding(target)
  }
  // adding(targetType)
  // console.log('----------->', sims)
}
// const a = Math.random()+Date.now();
export function Sim(target: ConstructorType<any> | Function): void;
export function Sim(config: SimConfig): GenericClassDecorator<ConstructorType<any> | Function | any>;
export function Sim(configOrTarget: SimConfig | ConstructorType<any> | Function): void | GenericClassDecorator<ConstructorType<any> | Function | any> {
  // console.group('sim')
  // sims.forEach((v,k) => {
  //   console.log('sssss->', v, k)
  // })
  // console.groupEnd()
  if (typeof configOrTarget === 'function') {
    simProcess({}, configOrTarget);
    // console.log('---!', Reflect.getMetadata('design:paramtypes', configOrTarget))
  } else {
    return (target: ConstructorType<any> | Function | any) => {
      simProcess(configOrTarget, target);
    }
  }
}

// Alias for @sim (lowercase)
export const sim = Sim;

export const getSim = (target: ConstructorType<any> | Function | any): SimConfig | undefined => {
  if (target != null && target !== undefined && typeof target === 'object') {
    // proxy 걸린거떄문에 이렇게 한다. 안걸린것도 잘된다.
    target = Object.getPrototypeOf(target).constructor;
    // target = target.constructor;
  }
  try {
    return ReflectUtils.getMetadata(SimMetadataKey, target);
  } catch (e) {
  }
}

const PostConstructMetadataKey = Symbol.for('simple-boot:post-construct-metadata');
export type PostConstructMetaType = {property: string};
const postConstructProcess = (target: any, config: PostConstructMetaType) => {
  const metas = getPostConstructs(target) ?? [];
  metas.push(config);
  ReflectUtils.defineMetadata(PostConstructMetadataKey, metas, target);
}
export const PostConstruct = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  postConstructProcess(target, {property: propertyKey});
}
export const getPostConstructs = (target: any): PostConstructMetaType[] => {
  return ReflectUtils.getMetadata(PostConstructMetadataKey, target) ?? [];
}

// Alias for @postConstruct (lowercase)
export const postConstruct = PostConstruct;
