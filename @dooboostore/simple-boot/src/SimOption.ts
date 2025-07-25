import { ConstructorType } from '@dooboostore/core/types';
import { SimConfigUsing } from './decorators/SimDecorator';
import { Storage } from '@dooboostore/core/storage/Storage';
import { CacheStorage } from './decorators/cache/CacheDecorator';

export type ProxyHandlerType = { onProxy: <T>(it: T) => T };
export type InitOptionType = {
  rootRouter?: ConstructorType<any>,
  container?: string,
  excludeSim?: (ConstructorType<any> | Function)[],
  advice?: ConstructorType<any>[],
  proxy?: ProxyHandlerType,
  using?: SimConfigUsing,
  cache?: CacheConfig,
};
type CacheConfig = {
  ms?: number;
  storage?: CacheStorage;
  enable?: boolean;
};

export class SimOption {
  public rootRouter?: ConstructorType<any>
  public container?: string;
  public advice: ConstructorType<any>[];
  public proxy?: ProxyHandlerType;
  // public excludeSim: ((ConstructorType<any> | Function)[]) | ((type: (ConstructorType<any> | Function)) => boolean);
  public using?: SimConfigUsing;
  public cache?: CacheConfig

  constructor({rootRouter, container, cache,  advice = [], proxy, using}: InitOptionType = {}) {
    this.rootRouter = rootRouter;
    this.container = container;
    this.advice = advice;
    // this.excludeSim = excludeSim;
    this.proxy = proxy;
    this.using = using;
    this.cache = cache;
  }

  addAdvicce(advice: ConstructorType<any>) {
    this.advice??= [];
    this.advice.push(advice);
  }

  setAdvice(...advice: ConstructorType<any>[]): SimOption {
    this.advice = advice;
    return this;
  }
}
