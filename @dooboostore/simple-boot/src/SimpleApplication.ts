import 'reflect-metadata'
import { SimstanceManager } from './simstance/SimstanceManager';
import { SimOption } from './SimOption';
import { IntentManager } from './intent/IntentManager';
import { RouterManager } from './route/RouterManager';
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
  constructor(public option: SimOption = new SimOption()){
    // if (option.rootRouter instanceof SimOption) {
    //   option = rootRouter;
    // } else if (typeof option.rootRouter === 'function') {
    //   this.rootRouter = rootRouter;
    // }

    this.simstanceManager = new SimstanceManager(this, option);
    // this.simstanceManager.setStoreSet(SimpleApplication, this);
    this.simstanceManager.setStoreSet(SimstanceManager, this.simstanceManager);

    this.intentManager = this.simstanceManager.proxy(new IntentManager(this.simstanceManager));
    this.routerManager = this.simstanceManager.proxy(new RouterManager(this.simstanceManager, option.rootRouter));
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

  public run(otherInstanceSim?: Map<ConstructorType<any> | Function, any>) {
    this.simstanceManager.run(otherInstanceSim);
    return this.simstanceManager;
  }

  public simAtomic<T>(type: ConstructorType<T> | Function) {
    const routerAtomic = new SimAtomic<T>(type, this.simstanceManager);
    return routerAtomic;
  }

  public getInstance<T>(type: ConstructorType<T>) {
    const i = this.sim<T>(type);
    if (i) {
      return i;
    } else {
      throw new SimNoSuch('SimNoSuch: no simple instance(getInstance) ' + 'name:' + type?.prototype?.constructor?.name + ',' + type)
    }
  }

  public sim<T>(type: ConstructorType<T> | Function) {
    return this.simAtomic<T>(type).getValue();
  }

  public addSim(target: ConstructorType<any> | Function): void;
  public addSim(config: SimConfig, target: ConstructorType<any>): GenericClassDecorator<ConstructorType<any> | Function>;
  public addSim(configOrTarget: SimConfig | ConstructorType<any> | Function, target?:ConstructorType<any>): void | GenericClassDecorator<ConstructorType<any> | Function> {
    const r: any = Sim(configOrTarget as any);
    if (typeof r === 'function' && target) {
      r(target);
    }
  }


public publishIntent(i: string, data?: any): any[];
  public publishIntent(i: Intent): any[];
  public publishIntent(i: Intent | string, data?: any): any[] {
    if (i instanceof Intent) {
      return this.intentManager.publish(i);
    } else {
      return this.intentManager.publish(i, data);
    }
  }

  public routing<R = SimAtomic, M = any>(i: string, data?: any): Promise<RouterModule<R, M>>;
  public routing<R = SimAtomic, M = any>(i: Intent): Promise<RouterModule<R, M>>;
  public routing<R = SimAtomic, M = any>(i: Intent | string, data?: any): Promise<RouterModule<R, M>> {
    if (i instanceof Intent) {
      return this.routerManager.routing<R, M>(i);
    } else {
      return this.routerManager.routing<R, M>(new Intent(i, data));
    }
  }
}
