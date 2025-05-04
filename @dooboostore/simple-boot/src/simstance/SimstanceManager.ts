import 'reflect-metadata'
import { ConstructorType, isDefined } from '@dooboostore/core/types';
import { SimNoSuch } from '../throwable/SimNoSuch'
import { getPostConstructs, getSim, Lifecycle, sims } from '../decorators/SimDecorator';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';
import { SimAtomic } from './SimAtomic';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';
import { getInject, SaveInjectConfig, SituationTypeContainer, SituationTypeContainers } from '../decorators/inject/Inject';
import { SimOption } from '../SimOption';
import { SimProxyHandler } from '../proxy/SimProxyHandler';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import { Runnable } from '@dooboostore/core/runs/Runnable';
import { isOnSimCreate } from '../lifecycle/OnSimCreate';
import { isOnSimCreateProxyCompleted } from '../lifecycle/OnSimCreateCompleted';
import { SimpleApplication } from '../SimpleApplication';

export type FirstCheckMaker = (obj: { target: Object, targetKey?: string | symbol }, token: ConstructorType<any>, idx: number, saveInjectConfig?: SaveInjectConfig) => any | undefined;
export type Carrier = { newInstances: any[], depth: number };
export class SimstanceManager implements Runnable<void, Map<ConstructorType<any> | Function, any>> {
  private _storage = new Map<ConstructorType<any> | Function, Map<ConstructorType<any> | Function, undefined | any>>()
  private simProxyHandler: SimProxyHandler;
  private otherInstanceSim?: Map<ConstructorType<any> | Function, any>;

  constructor(private simpleApplication: SimpleApplication, private option: SimOption) {
    this.setStoreSet(SimpleApplication, this.simpleApplication);
    this.setStoreSet(SimstanceManager, this);
    this.setStoreSet((option as any).constructor, option);
    this.setStoreSet(SimOption, option);
    this.simProxyHandler = new SimProxyHandler(this.simpleApplication,this, option);
  }

  get storage() {
    return this._storage
  }

  getSimAtomics(): SimAtomic[] {
    const r: SimAtomic[] = [];
    Array.from(this.storage.values()).forEach(it => {
      r.push(...Array.from(Array.from(it.keys())).map(sit => new SimAtomic(sit, this)));
    });
    return r;
  }

  getSimConfig(schemeOrSymbol: string | Symbol | undefined): SimAtomic<any>[] {
    const newVar = this.getSimAtomics().filter(it => {
      const config = it?.getConfig();
      const symbols = ConvertUtils.flatArray(config?.symbol);
      const schemes = ConvertUtils.flatArray(config?.scheme);
      if (typeof schemeOrSymbol === 'symbol') {
        return schemeOrSymbol && it && symbols.includes(schemeOrSymbol)
      } else if (typeof schemeOrSymbol === 'string') {
        return schemeOrSymbol && it && schemes.includes(schemeOrSymbol)
      } else {
        return false;
      }
    }) || [];
    return newVar;
  }

  findSims<T = any>(symbol: Symbol): SimAtomic<T>[] ;
  findSims<T = any>(data: { scheme?: string, type?: ConstructorType<any> }): SimAtomic<T>[] ;
  findSims<T = any>(data: { scheme?: string, type?: ConstructorType<any> } | Symbol): SimAtomic<T>[] {
    let r: SimAtomic<T>[] = []
    if (data) {
      const simAtomics = this.getSimAtomics();
      r = simAtomics.filter(it => {
        let b = false;
        const config = it.getConfig();
        const symbols = ConvertUtils.flatArray(config?.symbol);
        const schemes = ConvertUtils.flatArray(config?.scheme);
        if (typeof data === 'symbol') {
          b = symbols.includes(data);
        } else {
          const {scheme, type} = data as { scheme?: string, type?: ConstructorType<any> };
          b = (scheme ? schemes.includes(scheme) : true) && (type ? it.type === type : true);
        }
        return b
      }) as unknown as SimAtomic<T>[];

    }
    return r;
  }

  findFirstSim<T = any>(symbol: Symbol): SimAtomic<T> | undefined ;
  findFirstSim<T = any>(data: { scheme?: string, type?: ConstructorType<any> }): SimAtomic<T> | undefined ;
  findFirstSim<T = any>(data: { scheme?: string, type?: ConstructorType<any> } | Symbol): SimAtomic<T> | undefined {
    if (typeof data === 'symbol') {
      return this.findSims(data)[0];
    } else {
      return this.findSims(data as { scheme?: string, type?: ConstructorType<any> })[0];
    }
  }

  findLastSim<T = any>(symbol: Symbol): SimAtomic<T> | undefined ;
  findLastSim<T = any>(data: { scheme?: string, type?: ConstructorType<any> }): SimAtomic<T> | undefined ;
  findLastSim<T = any>(data: { scheme?: string, type?: ConstructorType<any> } | Symbol): SimAtomic<T> | undefined {
    if (typeof data === 'symbol') {
      return this.findSims(data).reverse()[0];
    } else {
      return this.findSims(data as { scheme?: string, type?: ConstructorType<any> }).reverse()[0];
    }
  }

  flatStoreSets() {
    return new Map(Array.from(this.storage.values()).map(it => Array.from(it.entries())).flat());
  }

  getStoreSets<T>(targetKey: ConstructorType<T> | Function): { type: ConstructorType<T> | Function, instance?: T } [] {
    const map = this.storage.get(targetKey);
    const datas = (Array.from(map?.entries?.() ?? []) ?? []).reverse();
    return datas.map(it => ({type: it[0], instance: it[1]}));
  }

  getStoreSet<T>(targetKey: ConstructorType<T> | Function, target?: ConstructorType<any> | Function): { type: ConstructorType<T> | Function, instance?: T } | undefined {
    const find = this.getStoreSets(targetKey).find(it => it.type === target);
    // console.log('getStoreSet', targetKey, target, find)
    if (!find?.instance) {
      const type = target ?? targetKey;
      const flatStoreSets = this.flatStoreSets();
      const data = flatStoreSets.get(type);
      // console.log('--->target?', target, targetKey, type, data);
      if (data) {
        this.setStoreSet(targetKey, data, type);
      }
      return {type: targetKey, instance: data};
    } else {
      return find;
    }
    // return find ?? this.getStoreSets(targetKey)[0];
  }

  setStoreSet(targetKey: ConstructorType<any> | Function, obj: any, target: ConstructorType<any> | Function = targetKey): void {
    const itemMap = this.storage.get(targetKey) ?? new Map<ConstructorType<any>, any>();
    itemMap.set(target, obj);
    this.storage.set(targetKey, itemMap)
  }

  getStoreInstance<T>(targetKey: ConstructorType<T>, target?: ConstructorType<any>) {
    return this.getStoreSet(targetKey, target)?.instance;
  }

  getOrNewSim<T>({target, originTypeTarget = target, newInstanceCarrier}: { target?: ConstructorType<T> | Function, newInstanceCarrier?: Carrier, originTypeTarget?: ConstructorType<T> | Function }): T | undefined {
    if (target) {
      const registed = this.getStoreSet(target, originTypeTarget);
      if (registed?.type && !registed?.instance) {
        return this.resolve({targetKey: target, target:originTypeTarget, newInstanceCarrier: newInstanceCarrier});
      }
      return registed?.instance
    }
  }

  register(keyType: ConstructorType<any> | Function, regTyps: Set<ConstructorType<any> | Function>): void {
    const itemMap = this.storage.get(keyType) ?? new Map<ConstructorType<any> | Function, any>();
    regTyps.forEach(it => {
      if (!itemMap.has(it)) {
        itemMap.set(it, undefined);
      }
    })
    this.storage.set(keyType, itemMap);
  }

  // 진입점
  resolve<T>({target, targetKey, newInstanceCarrier = {newInstances: [], depth: 0}}:{targetKey: ConstructorType<any> | Function, target?: ConstructorType<any> | Function, newInstanceCarrier?: Carrier}): T {
    // console.group('resolve')
    const registed = this.getStoreSet(targetKey, target);
    if (registed?.instance) {
      return registed.instance;
    }

    // console.log('resolve--', targetKey, target, registed?.instance);
    if (this.storage.has(targetKey) && undefined === registed?.instance) {
      newInstanceCarrier.depth++;
      const newSim = this.newSim({
        target: registed?.type ?? targetKey,
        newInstanceCarrier: newInstanceCarrier,
        simCreateAfter: (data) => {
          // console.log('resolve--newSim', targetKey, target, data);
          if (getSim(registed?.type ?? target ?? targetKey)?.scope === Lifecycle.Singleton) {
            this.setStoreSet(targetKey, data, target)
            // console.log('-----------set', targetKey, data, target, this.storage.get(targetKey))
          }
        }
      });
      newInstanceCarrier.depth--;
      // 한그룹이 끝났을때
      if (newInstanceCarrier.depth === 0) {
        newInstanceCarrier.newInstances.forEach(it => {
          this.callBindPostConstruct(it);
        })
      }
      // console.log('%c *************************','color: blue', registed?.type ?? targetKey ,newInstanceCarrier, newInstanceCarrier?.newInstances.length)
      // console.dir(newInstanceCarrier, {depth:10});
      // console.table(newInstanceCarrier);
      if (isOnSimCreate(newSim)) {
        newSim.onSimCreate();
      }
      // console.groupEnd();
      return newSim
    }
    const simNoSuch = new SimNoSuch('SimNoSuch: no simple instance(resolve) ' + 'name:' + targetKey?.prototype?.constructor?.name + ',' + targetKey);
    console.error(simNoSuch);
    // console.groupEnd();
    throw simNoSuch
  }

  public newSim<T = any>(
    {target, simCreateAfter, otherStorage, newInstanceCarrier}: { target: ConstructorType<T> | Function, simCreateAfter?: (data: T) => void, newInstanceCarrier?: Carrier, otherStorage?: Map<ConstructorType<any>, any> }
  ): T {
    // @ts-ignore TODO: 여기서 생성
    const r = new target(...this.getParameterSim({target: target, otherStorage:otherStorage, newInstanceCarrier: newInstanceCarrier}))
    let p = this.proxy(r);
    const config = getSim(target);
    if (config?.proxy) {
      const proxys = (Array.isArray(config.proxy) ? config.proxy : [config.proxy]).filter(isDefined);
      proxys.forEach(it => {
        // console.log('proxy-----------------', p)
        if (typeof it === 'object') {
          p = new Proxy(p, it);
        } else {
          const simConfig = getSim(it);
          p = new Proxy(p, simConfig ? this.getOrNewSim({target: it}) : this.newSim({target: it}));
        }
        // console.log('proxy-pp----------------', p)
      })
    }
    newInstanceCarrier?.newInstances.push(p);
    // 순환참조 막기위한 콜백 처리
    simCreateAfter?.(p);
    if (isOnSimCreateProxyCompleted(p)) {
      p.onSimCreateProxyCompleted(p);
    }
    // this.callBindPostConstruct(p);
    return p;
  }

  public callBindPostConstruct(obj: any) {
    // const set = new Set(ObjectUtils.getAllProtoTypeName(obj));
    // console.log('callBindPostConstruct', obj, set, ObjectUtils.getAllProtoTypeName(obj));
    // set.forEach(it => {
    //   const postConstruct = getPostConstruct(obj, it);
    //   if (postConstruct) {
    //     (obj as any)[it](...this.getParameterSim({target: obj, targetKey: it}))
    //   }
    // })
    const postConstruct = getPostConstructs(obj);
    postConstruct.forEach(it => {
      (obj as any)[it.property](...this.getParameterSim({target: obj, targetKey: it.property}))
    })
  }

  public async executeBindParameterSimPromise({target, targetKey, firstCheckMaker}: { target: Object, targetKey?: string | symbol, firstCheckMaker?: FirstCheckMaker[] },
                                              otherStorage?: Map<ConstructorType<any>, any>) {
    let value = this.executeBindParameterSim({target, targetKey, firstCheckMaker}, otherStorage);
    if (value instanceof Promise) {
      value = await value;
    }
    return value;
  }

  public executeBindParameterSim({target, targetKey, firstCheckMaker}: { target: Object, targetKey?: string | symbol, firstCheckMaker?: FirstCheckMaker[] },
                                 otherStorage?: Map<ConstructorType<any>, any>) {
    const binds = this.getParameterSim({target, targetKey, firstCheckMaker, otherStorage});
    if (typeof target === 'object' && targetKey) {
      const targetMethod = (target as any)[targetKey];
      return targetMethod?.bind(target)?.(...binds);
    } else if (typeof target === 'function' && !targetKey) {
      return new (target as ConstructorType<any>)(...binds);
    }
  }

  public getParameterSim({target, targetKey, firstCheckMaker, otherStorage, newInstanceCarrier}: { target: Object, targetKey?: string | symbol, firstCheckMaker?: FirstCheckMaker[], newInstanceCarrier?: Carrier, otherStorage?: Map<ConstructorType<any>, any> } ): any[] {
    const paramTypes = ReflectUtils.getParameterTypes(target, targetKey);
    // const paramNames = FunctionUtils.getParameterNames(target, targetKey);
    // const a = ReflectUtils.getType(target, 'user');
    let injections = [];
    const injects = getInject(target, targetKey);
    // const da = JSON.stringify(this.storage);
    // this.storage map to json String


    injections = paramTypes.map((token: ConstructorType<any>, idx: number) => {
      const saveInject = injects?.find(it => it.index === idx);
      if (saveInject?.config.disabled) {
        return undefined;
      }
      for (const f of firstCheckMaker ?? []) {
        const firstCheckObj = f({target, targetKey}, token, idx, saveInject);
        if (undefined !== firstCheckObj) {
          return firstCheckObj;
        }
      }
      if (saveInject) {
        const inject = saveInject.config;
        let obj = otherStorage?.get(token);
        // console.log('vvvvv----->', obj, token, inject);
        if (token === Array && (inject.type || inject.scheme || inject.symbol)) {
          const p = [];
          if (inject.type) {
            p.push(...this.getStoreSets(inject.type).map(it => this.resolve({targetKey:inject.type!, target:it.type, newInstanceCarrier: newInstanceCarrier})).reverse());
          }
          if (inject.symbol) {
            p.push(...this.getSimConfig(inject.symbol).map(it => it.getValue({newInstanceCarrier: newInstanceCarrier})));
          }
          if (inject.scheme) {
            p.push(...this.getSimConfig(inject.scheme).map(it => it.getValue({newInstanceCarrier: newInstanceCarrier})));
          }
          return p;
        }

        // situational
        if (inject.situationType && otherStorage) {
          // TODO: 왜 other에서 가져오는걸까?
          const situations = otherStorage.get(SituationTypeContainers) as SituationTypeContainers;
          const situation = otherStorage.get(SituationTypeContainer) as SituationTypeContainer;
          if (inject.situationType === situation?.situationType) {
            obj = situation.data;
          } else if (situations && situations.length > 0) {
            const find = situations.find(a => {
              if (a.index !== undefined) {
                return a.situationType === inject.situationType && a.index === idx
              } else {
                return a.situationType === inject.situationType
              }
            })
            if (find) {
              obj = find.data;
            }
          }
        }

        if (!obj) {
          const findLastSim = inject.symbol ? this.findLastSim(inject.symbol) : this.findLastSim({scheme: inject.scheme, type: inject.type});
          try {
            obj = findLastSim ? this.resolve<any>({targetKey:findLastSim?.type ?? token, newInstanceCarrier: newInstanceCarrier}) : this.resolve<any>({targetKey:token, newInstanceCarrier:newInstanceCarrier});
          } catch (e) {
            // Inject optional 처리
            if (inject.optional) {
              return undefined;
            } else {
              throw e;
            }
          }
        }

        if (inject.applyProxy && obj) {
          if (inject.applyProxy.param) {
            obj = new Proxy(obj, new inject.applyProxy.type(...inject.applyProxy.param));
          } else {
            obj = new Proxy(obj, new inject.applyProxy.type());
          }
        }
        return obj;
      } else if (token) {
        // TODO: 왜 other에서 가져오는걸까?  -> 와부에서 전달해주는걸 먼저 처리 해주기위해 추측
        // console.log('oooooooooooooooo', token, otherStorage)
        return otherStorage?.get(token) ?? this.resolve<any>({targetKey:token, newInstanceCarrier});
      }
      return undefined;
    });
    return injections;
  }

  public proxy<T = any>(target: T): T {
    if (target !== null && getSim(target) && (typeof target === 'object') && (!('isProxy' in target))) {
      for (const key in target) {
        target[key] = this.proxy(target[key]);
      }

      // function apply proxy
      const protoTypeName = ObjectUtils.ownPropertyNames(target);
      protoTypeName.filter(it => typeof (target as any)[it] === 'function').forEach(it => {
        (target as any)[it] = new Proxy((target as any)[it], this.simProxyHandler!);
      });

      if (this.simProxyHandler) {
        target = new Proxy(target, this.simProxyHandler);
      }
    }

    if (this.option.proxy) {
      target = this.option.proxy.onProxy(target);
    }
    return target;
  }

  run(otherInstanceSim: Map<ConstructorType<any> | Function, any> = new Map()) {
    this.otherInstanceSim = otherInstanceSim;
    const types = Array.from(this.otherInstanceSim?.entries()).map(it => ({type: it[0], value: it[1], action: this.setStoreSet.bind(this)}));
    types.push(...Array.from(sims.entries()).map(it => ({type: it[0], value: it[1], action: this.register.bind(this)})));
    const myContainers = ConvertUtils.flatArray(this.option.container);
    types.forEach(it => {
      const targetContainers = ConvertUtils.flatArray(getSim(it.type)?.container);
      let isInclude = false;
      if (myContainers.length <= 0 && targetContainers.length <= 0) {
        isInclude = true;
      } else if (targetContainers.length <= 0) {
        isInclude = true;
      } else {
        isInclude = myContainers.some(it => targetContainers.includes(it));
      }
      // const isInclude = (myContainers.length <= 0 || targetContainers.length <= 0) ? true : myContainers.some(it => targetContainers.includes(it));
      // const isInclude = (targetContainers.length <= 0) ? true : (myContainers.length > 0 ? true : (myContainers.some(it => targetContainers.includes(it))));
      // const isInclude = (myContainers.length <= 0 || targetContainers.length <= 0) ? true : (myContainers.some(it => containers.includes(it)));
      if (typeof this.option.excludeSim === 'function' && this.option.excludeSim(it.type)) {
        if (isInclude) {
          it.action(it.type, it.value);
        }
      } else if (Array.isArray(this.option.excludeSim) && !this.option.excludeSim.includes(it.type)) {
        if (isInclude) {
          it.action(it.type, it.value);
        }
      }
    });

    this.callBindPostConstruct(this);

    // auto start run
    this.getSimAtomics().forEach(it => {
      if (it.getConfig()?.autoCreate) {
        // console.log('autoStart---?', it.type);
        it.getValue();
      }
    })
  }
}
