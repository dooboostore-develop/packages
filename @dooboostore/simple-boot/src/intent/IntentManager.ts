import { Intent } from './Intent';
import { SimstanceManager } from '../simstance/SimstanceManager';
import { Sim } from '../decorators/SimDecorator';
import { SimAtomic } from '../simstance/SimAtomic';
import { Subject } from '@dooboostore/core/message/Subject';
import { RouterManager } from '../route/RouterManager';
import { RouterMetadataKey, RouterConfig } from '../decorators/route/Router';
import { ConstructorType } from '@dooboostore/core/types';
import { SimOption } from '../SimOption';
import { isIntentSubscribe } from './IntentSubscribe';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { getInject, isTargetFactory, isTargetScheme, isTargetSymbol, isTargetType } from '../decorators';
import { SimpleApplication } from '../SimpleApplication';

export type RouterPublishType = {
  router: `Router(${string}):${string}`;
  rootRouter: ConstructorType<any>;
};
export const isRouterPublishType = (it: any): it is RouterPublishType => typeof it === 'object' && it !== null && typeof it.router === 'string' && typeof it.rootRouter === 'function';

export type SymbolPublishType = { symbol: Symbol | Symbol[]; path: string };
export const isSymbolPublishType = (it: any): it is SymbolPublishType => typeof it === 'object' && it !== null && 'symbol' in it && 'path' in it;

export type SymbolForPublishType = `Symbol.for(${string}):/${string}`;

export type SchemePublishType = { scheme: string; path: string };
export const isSchemePublishType = (it: any): it is SchemePublishType => typeof it === 'object' && it !== null && 'scheme' in it && 'path' in it;

export type PublishData = Intent | string | RouterPublishType | SymbolPublishType | SymbolForPublishType | SchemePublishType;

// @Sim
export class IntentManager {
  private subject = new Subject<Intent>();

  constructor(
    private simpleApplication: SimpleApplication,
    private simstanceManager: SimstanceManager,
    private routerManager: RouterManager,
    private simOption: SimOption
  ) {}

  get observable() {
    return this.subject.asObservable();
  }

  private async makeIntentData(it: PublishData, data?: any) {
    const target: SimAtomic<any> | any[] = [];
    const rootRouter = isRouterPublishType(it) ? it.rootRouter : this.simOption.rootRouter;

    if (isRouterPublishType(it)) {
      it = it.router;
    }

    const routerMatch = typeof it === 'string' && it.match(/^Router\((.+)\):\/(.*)$/); // Escaped parentheses and slash, no quotes
    if (routerMatch && typeof it === 'string') {
      const routerBasePath = routerMatch[1];
      const actualPath = routerMatch[2];
      const routerModule = await this.routerManager.routing(routerBasePath, {
        router: rootRouter
      });
      const instance = routerModule.getModuleInstance();
      if (instance) {
        target.push(instance);
      }
      it = new Intent(actualPath, data);
    } else if (isSymbolPublishType(it)) {
      it = new Intent({ symbol: it.symbol, uri: it.path as any }, data);
    } else if (isSchemePublishType(it)) {
      it = new Intent(`${it.scheme}://${it.path}`, data);
    } else if (typeof it === 'string') {
      it = new Intent(it, data);
    }

    const intent = it as Intent;

    if (!routerMatch) {
      if (intent.symbols) {
        target.push(...intent.symbols.map(sym => this.simstanceManager.findSims(sym)).flat());
      } else if (intent.scheme) {
        target.push(...this.simstanceManager.getSimConfig(intent.scheme));
      } else {
        target.push(...this.simstanceManager.getSimAtomics());
      }
    }

    return { intent, target };
  }

  public async publishMeta(it: PublishData, data?: any): Promise<{ return: any[]; target: any[] }> {
    const { intent, target } = await this.makeIntentData(it, data);
    const r: any[] = [];
    const targetInstances = target.map(it => {
      if (it instanceof SimAtomic) {
        return it.getValue();
      } else {
        return it;
      }
    });

    this.subject.next(intent);

    for (let data of targetInstances) {
      let orNewSim = data;
      if (orNewSim) {
        const filteredPaths = intent.paths.filter(i => i);
        if (filteredPaths.length > 0) {
          let callthis = orNewSim;
          let lastProp = '';
          // path '/' 로해서 계속 파고든다.
          filteredPaths.forEach(i => {
            callthis = orNewSim;
            orNewSim = orNewSim?.[i];
            lastProp = i;
          });
          if (orNewSim && typeof orNewSim === 'function') {
            const intentData = Array.isArray(intent.data) ? intent.data : intent.data !== undefined ? [intent.data] : [];
            const result = await this.simstanceManager.executeBindParameterSimPromise({
              target: callthis,
              targetKey: lastProp,
              parameterCount: intentData.length,
              inputParameters: intentData,
              firstCheckMaker: [
                (obj, token, idx) => {
                  if (idx < intentData.length) {
                    return intentData[idx];
                  }
                  if (token === Intent && idx === 0) {
                    return intent;
                  }
                }
              ]
            });
            r.push(result);
          } else if (orNewSim) {
            callthis[lastProp] = intent.data;
            r.push(callthis[lastProp]);
          }
        } else {
          const intentData = Array.isArray(intent.data) ? intent.data : intent.data !== undefined ? [intent.data] : [];
          if (isIntentSubscribe(orNewSim)) {
            r.push(orNewSim.intentSubscribe(...intentData));
          }
        }
      }
    }
    return { return: r, target };
  }

  public async publish(it: PublishData, data?: any): Promise<any[]> {
    const rdata = await this.publishMeta(it, data);
    return rdata.return;
  }
}
