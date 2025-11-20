import {Intent, PublishType} from './Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';
import {Sim} from '../decorators/SimDecorator';
import {SimAtomic} from '../simstance/SimAtomic';
import {Subject} from '@dooboostore/core/message/Subject';
import {RouterManager} from '../route/RouterManager';
import {RouterMetadataKey, RouterConfig} from '../decorators/route/Router';
import {ConstructorType} from '@dooboostore/core/types';
import {SimOption} from '../SimOption';
import {isIntentSubscribe} from "./IntentSubscribe";
import {ReflectUtils} from "@dooboostore/core/reflect/ReflectUtils";
import {getInject } from "../decorators";
import {isInjectFactory} from "../decorators/inject/Inject";

export type RouterPublishType = { router: `Router(${string}):${string}`; rootRouter: ConstructorType<any> };
export const isRouterPublishType = (it: any): it is RouterPublishType =>
  typeof it === 'object' &&
  typeof it.router === 'string' &&
  typeof it.rootRouter === 'function';

@Sim
export class IntentManager {
  private subject = new Subject<Intent>();

  constructor(
    private simstanceManager: SimstanceManager,
    private routerManager: RouterManager,
    private simOption: SimOption
  ) {
  }

  get observable() {
    return this.subject.asObservable();
  }

  public async publish(it: string, data?: any): Promise<any[]>;
  public async publish(it: RouterPublishType, data?: any): Promise<any[]>;
  public async publish(it: Intent): Promise<any[]>;
  public async publish(it: Intent | string | RouterPublishType, data?: any): Promise<any[]> {
    const target: SimAtomic<any> | any[] = [];
    const rootRouter = isRouterPublishType(it) ? it.rootRouter : this.simOption.rootRouter;
    it = isRouterPublishType(it) ? it.router : it;

    const routerMatch = typeof it === 'string' && it.match(/^Router\((.+)\):\/(.*)$/); // Escaped parentheses and slash, no quotes
    if (routerMatch && typeof it === 'string') {
      const routerBasePath = routerMatch[1];
      const actualPath = routerMatch[2];
      const routerModule = await this.routerManager.routing(routerBasePath, {router: rootRouter});
      const instance = routerModule.getModuleInstance();
      if (instance) {
        target.push(instance);
      }
      it = new Intent(actualPath, data);
    } else if (typeof it === 'string') {
      it = new Intent(it, data);
    }

    const intent = it as Intent;
    const r: any[] = [];

    if (!routerMatch) {
      if (intent.symbols) {
        target.push(...intent.symbols.map(sym => this.simstanceManager.findSims(sym)).flat());
      } else if (intent.scheme) {
        target.push(...this.simstanceManager.getSimConfig(intent.scheme));
      } else {
        target.push(...this.simstanceManager.getSimAtomics());
      }
    }
    const targetInstances = target.map(it => {
      if (it instanceof SimAtomic) {
        return it.getValue();
      } else {
        return it;
      }
    });

    this.subject.next(it);

    for (let data of targetInstances) {
      let orNewSim = data;
      if (orNewSim) {
        if (intent.paths.length > 0) {
          let callthis = orNewSim;
          let lastProp = '';
          // path '/' 로해서 계속 파고든다.
          intent.paths
            .filter(i => i)
            .forEach(i => {
              callthis = orNewSim;
              orNewSim = orNewSim?.[i];
              lastProp = i;
            });
          if (orNewSim && typeof orNewSim === 'function') {
            const injects = getInject(callthis, orNewSim.name);
            // console.log('-------params', injects);
            if (injects) {
              for (const inject of injects) {
                let v = this.simstanceManager.findLastSim(inject.config).getValue();
                if (isInjectFactory(v)) {
                  v = await v.injectFactory(intent.data, inject);
                }
                intent.data[inject.index] = v
              }
            }

            if (PublishType.DATA_PARAMETERS === intent.publishType) {
              r.push(orNewSim.call(callthis, intent.data));
            } else if (PublishType.INLINE_DATA_PARAMETERS === intent.publishType) {
              r.push(orNewSim.call(callthis, ...intent.data));
            } else {
              r.push(orNewSim.call(callthis, intent));
            }
          } else if (orNewSim) {
            callthis[lastProp] = intent.data;
            r.push(callthis[lastProp]);
          }
        } else {
          if (PublishType.DATA_PARAMETERS === intent.publishType) {
            if (isIntentSubscribe(orNewSim)) {
              r.push(orNewSim.intentSubscribe(intent.data));
            }
          } else if (PublishType.INLINE_DATA_PARAMETERS === intent.publishType) {
            if (isIntentSubscribe(orNewSim)) {
              r.push(orNewSim.intentSubscribe(...intent.data));
            }
          } else {
            if (isIntentSubscribe(orNewSim)) {
              r.push(orNewSim?.intentSubscribe?.(intent));
            }
          }
        }
      }
    }
    ;
    return r;
  }
}
