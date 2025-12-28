import { SimstanceManager } from './simstance/SimstanceManager';
import { SimOption } from './SimOption';
import { IntentManager, isRouterPublishType, RouterPublishType } from './intent/IntentManager';
import { RouterManager, RoutingOption } from './route/RouterManager';
import { Intent } from './intent/Intent';
import { ConstructorType, GenericClassDecorator } from '@dooboostore/core/types';
import { RouterModule } from './route/RouterModule';
import { SimAtomic } from './simstance/SimAtomic';
import { SimNoSuch } from './throwable/SimNoSuch';
import { containers, Sim, SimConfig } from './decorators/SimDecorator';

export class SimpleApplication {
  public simstanceManager: SimstanceManager;
  public intentManager: IntentManager;
  public routerManager: RouterManager;
  // public rootRouter?: ConstructorType<any>;

  // constructor();
  // constructor(option: SimOption);
  // constructor(rootRouter?: ConstructorType<Object> | Function);
  // constructor(rootRouter?: ConstructorType<Object> | Function, option?: SimOption);
  // constructor(rootRouter?: (ConstructorType<Object> | Function) | SimOption, option = new SimOption()) {
  constructor(public option: SimOption = new SimOption()) {
    // if (option.rootRouter instanceof SimOption) {
    //   option = rootRouter;
    // } else if (typeof option.rootRouter === 'function') {
    //   this.rootRouter = rootRouter;
    // }

    this.simstanceManager = new SimstanceManager(this, option);
    // this.simstanceManager.setStoreSet(SimpleApplication, this);
    this.simstanceManager.setStoreSet(SimstanceManager, this.simstanceManager);
    // cacheManager는 사용자가 불러다 사용할때 뜨도록. 미리 추가안해준다.
    this.routerManager = this.simstanceManager.proxy(new RouterManager(this.simstanceManager, option));
    this.intentManager = this.simstanceManager.proxy(new IntentManager(this.simstanceManager, this.routerManager,option));
    this.simstanceManager.setStoreSet(IntentManager, this.intentManager);
    this.simstanceManager.setStoreSet(RouterManager, this.routerManager);
    containers.add(this);
  }

  public getSimstanceManager() {
    return this.simstanceManager;
  }

  public getIntentManager() {
    return this.intentManager;
  }

  public getRouterManager() {
    return this.routerManager;
  }

  public run(otherInstanceSim?: Map<ConstructorType<any> | Function | SimConfig | Symbol, any>) {
    this.simstanceManager.run(otherInstanceSim);
    return this;
    // return this.simstanceManager;
  }

  public simAtomic<T>(type: ConstructorType<T> | Function | Symbol) {
    if (typeof type === 'symbol') {
      return this.simstanceManager.findFirstSim(type);
    } else if (typeof type === 'function') {
      return this.simstanceManager.findFirstSim({type:type});
      // return new SimAtomic<T>(type, this.simstanceManager);
    }
  }
  public simAtomics<T>(type: ConstructorType<T> | Function | Symbol) {
    if (typeof type === 'symbol') {
      return this.simstanceManager.findSims(type) ?? [];
    } else if (typeof type === 'function') {
      return this.simstanceManager.findSims({type}) ?? [];
    } else {
      return [];
    }
  }

  public getInstance<T>(type: ConstructorType<T>) {
    const i = this.sim<T>(type);
    if (i) {
      return i;
    } else {
      throw new SimNoSuch('SimNoSuch: no simple instance(getInstance) ' + 'name:' + type?.prototype?.constructor?.name + ',' + type)
    }
  }

  public sim<T>(type: ConstructorType<T> | Function | Symbol): T | undefined {
    return this.simAtomic<T>(type)?.getValue();
  }
  public sims<T>(type: ConstructorType<T> | Function | Symbol): T[] {
    return this.simAtomics(type).map(it => it.getValue())
  }

  public addSim(target: ConstructorType<any> | Function): void;
  public addSim(config: SimConfig, target: ConstructorType<any> | Function | any): GenericClassDecorator<ConstructorType<any> | Function>;
  public addSim(configOrTarget: SimConfig | ConstructorType<any> | Function, target?: ConstructorType<any> | Function | any): void | GenericClassDecorator<ConstructorType<any> | Function> {
    const r: any = Sim(configOrTarget as any);
    if (typeof r === 'function' && target) {
      r(target);
    }
  }


  public publishIntent(i: string, data?: any): Promise<any[]>;
  public publishIntent(i: RouterPublishType): Promise<any[]>;
  public publishIntent(i: Intent): Promise<any[]>;
  public publishIntent(i: Intent | string | RouterPublishType, data?: any): Promise<any[]> {
    if (i instanceof Intent) {
      return this.intentManager.publish(i);
    } else if (isRouterPublishType(i)) {
      return this.intentManager.publish(i, data);
    } else {
      return this.intentManager.publish(i, data);
    }
  }

  public routing<R = SimAtomic, M = any>(i: string, option?: RoutingOption): Promise<RouterModule<R, M>>;
  public routing<R = SimAtomic, M = any>(i: { path: string, data?: any }, option?: RoutingOption): Promise<RouterModule<R, M>>;
  public routing<R = SimAtomic, M = any>(i: Intent, option?: RoutingOption): Promise<RouterModule<R, M>>;
  public routing<R = SimAtomic, M = any>(i: { path: string, data?: any } | string | Intent, option?: RoutingOption): Promise<RouterModule<R, M>> {
    if (i instanceof Intent) {
      return this.routerManager.routing<R, M>(i, option);
    } else if (typeof i === 'string') {
      const intent = new Intent(i);
      return this.routerManager.routing<R, M>(intent, option);
    } else {
      const intent = new Intent(i.path, i.data);
      return this.routerManager.routing<R, M>(intent, option);
    }
  }
}
