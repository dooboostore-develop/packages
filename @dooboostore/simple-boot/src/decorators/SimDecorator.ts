import 'reflect-metadata'
import { ConstructorType, GenericClassDecorator } from '@dooboostore/core/types';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';
import { SimpleApplication } from '../SimpleApplication';

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

export const sims = new Map<ConstructorType<any> | Function, Set<ConstructorType<any> | Function>>();
export const containers = new Set<SimpleApplication>();


export type SimConfigProxy = ((ProxyHandler<any> | ConstructorType<any> | Function)) | (ProxyHandler<any> | ConstructorType<any> | Function)[];
export type SimConfigUsing = (ConstructorType<any> | Function | object) | ((ConstructorType<any> | Function | object)[]);

export interface SimConfig {
  symbol?: Symbol | (Symbol[]);
  scheme?: string | (string[]);
  scope?: Lifecycle;
  container?: string | (string[]);
  autoCreate?: boolean;
  proxy?: SimConfigProxy;
  type?: (ConstructorType<any> | Function) | (ConstructorType<any> | Function)[];
  using?: SimConfigUsing;
}

export const SimMetadataKey = Symbol('Sim');

export const simProcess = (config: SimConfig, target: ConstructorType<any> | Function | any) => {
  // default setting
  if (target != null && target !== undefined && typeof target === 'object') {
    target = target.constructor;
  }
  config.scope = config?.scope ?? Lifecycle.Singleton;
  ReflectUtils.defineMetadata(SimMetadataKey, config, target);
  const adding = (targetKey: ConstructorType<any> | Function, target: ConstructorType<any> | Function = targetKey) => {
    const items = sims.get(targetKey) ?? new Set<ConstructorType<any> | Function>();
    items.add(target);
    sims.set(targetKey, items);
  }


  if (Array.isArray(config?.type)) {
    config?.type.forEach(it => {
      adding(it, target);
    })
  } else if (config.type) {
    adding(config?.type, target);
  }
  // else {
  //   adding(target)
  // }
  adding(target)
  // console.log('----------->', sims)
}
 const a = Math.random()+Date.now();
export function Sim(target: ConstructorType<any> | Function): void;
export function Sim(config: SimConfig): GenericClassDecorator<ConstructorType<any> | Function>;
export function Sim(configOrTarget: SimConfig | ConstructorType<any> | Function): void | GenericClassDecorator<ConstructorType<any> | Function> {
  // console.log('ssssssssssssssssssssssss', configOrTarget, typeof configOrTarget === 'function');
  // console.group('sim')
  // sims.forEach((v,k) => {
  //   console.log('sssss->', v, k)
  // })
  // console.groupEnd()
  if (typeof configOrTarget === 'function') {
    simProcess({}, configOrTarget);
    // console.log('---!', Reflect.getMetadata('design:paramtypes', configOrTarget))
  } else {
    return (target: ConstructorType<any> | Function) => {
      simProcess(configOrTarget, target);
    }
  }
}

export const getSim = (target: ConstructorType<any> | Function | any): SimConfig | undefined => {
  if (target != null && target !== undefined && typeof target === 'object') {
    target = target.constructor;
  }
  try {
    return ReflectUtils.getMetadata(SimMetadataKey, target);
  } catch (e) {
  }
}

const PostConstructMetadataKey = Symbol('PostConstruct');
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
