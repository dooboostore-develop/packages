import { ConstructorType } from '@dooboostore/core/types';
import { SimConfigUsing } from './decorators/SimDecorator';
import { Storage } from '@dooboostore/core/storage/Storage';
import { CacheStorage } from './decorators/cache/CacheDecorator';

export type ProxyHandlerType = { onAfterProxy: <T>(it: T) => T };
export type InitOptionType = {
  rootRouter?: ConstructorType<any>;
  container?: string;
  excludeSim?: (ConstructorType<any> | Function)[];
  advice?: ConstructorType<any>[];
  excludeProxys?: (ConstructorType<any> | Function)[];
  proxy?: ProxyHandlerType;
  using?: SimConfigUsing;
  cache?: CacheConfig;
};
type CacheConfig = {
  ms?: number;
  storage?: CacheStorage;
  enable?: boolean;
};

export class SimOption {
  public rootRouter?: ConstructorType<any>;
  public container?: string;
  public advice: ConstructorType<any>[];
  public excludeProxys?: (ConstructorType<any> | Function )[];
  public proxy?: ProxyHandlerType;
  // public excludeSim: ((ConstructorType<any> | Function)[]) | ((type: (ConstructorType<any> | Function)) => boolean);
  public using?: SimConfigUsing;
  public cache?: CacheConfig;

  constructor({ rootRouter, container, cache, advice = [], excludeProxys, proxy, using }: InitOptionType = {}) {
    this.rootRouter = rootRouter;
    this.container = container;
    this.advice = advice;
    this.excludeProxys = excludeProxys;
    // this.excludeSim = excludeSim;
    this.proxy = proxy;
    this.using = using;
    this.cache = cache;
  }

  addAdvicce(advice: ConstructorType<any>) {
    this.advice ??= [];
    this.advice.push(advice);
  }

  setAdvice(...advice: ConstructorType<any>[]): SimOption {
    this.advice = advice;
    return this;
  }
}
