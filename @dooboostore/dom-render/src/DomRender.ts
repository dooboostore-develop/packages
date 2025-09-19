import { DomRenderProxy } from './DomRenderProxy';
import { DomRenderConfig } from 'configs/DomRenderConfig';
import { PathRouter } from './routers/PathRouter';
import { HashRouter } from './routers/HashRouter';
import { ConstructorType } from '@dooboostore/core/types';
import { DomRenderFinalProxy } from './types/Types';
import { RawSet } from './rawsets/RawSet';
import { DefaultMessenger } from './messenger/DefaultMessenger';
import { Router } from './routers/Router';
import { drComponent } from './components';
import { EventManager } from './events/EventManager';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

export type DomRenderRunConfig<T = any> = Omit<DomRenderConfig<T>, 'router' | 'uuid' | 'eventManager' | 'messenger' | 'root' | 'rootElement'> & { routerType?: 'path' | 'hash' | ((obj: T, window: Window) => Router) | Router };
export type CreateComponentParam = { type: ConstructorType<any> | any, tagName?: string, noStrip?: boolean, template?: string, styles?: string[] | string };
let eventManager: EventManager | null = null;
export type DomRenderRunParameter<T extends object> = { rootObject: T | (() => T), target?: Element | null, config?: DomRenderRunConfig | DomRenderConfig };

export class DomRender<T extends object = any> {
  private _config: DomRenderConfig;
  private _target: Element | null | undefined;
  private _rootObject: T;

  constructor(parameter: DomRenderRunParameter<T>, executeConfig?: { autoGo?: string }) {
    const s = DomRender.runSet(parameter);
    this._config = s.config;
    this._target = s.target;
    this._rootObject = s.rootObject;
    if (executeConfig && executeConfig?.autoGo) {
      this._config.router?.go(executeConfig.autoGo);
    }
  }

  public get rootObject(): T {
    return this._rootObject;
  }

  public get config(): DomRenderConfig {
    return this._config;
  }

  public get target(): Element | null |undefined {
    return this._target;
  }

  public static run<T extends object>(data: DomRenderRunParameter<T>): T {
    return DomRender.runSet(data).rootObject;
  }

  public static runSet<T extends object>({rootObject, target, config}: DomRenderRunParameter<T>): { rootObject: T, target?: Element | null, config: DomRenderConfig } {
    // public static run<T extends object>({rootObject, target, config}: DomRenderRunParameter<T>): T {
    //   console.log('runSet')
    rootObject = typeof rootObject === 'function' ? rootObject() : rootObject;
    let targetObject = rootObject;
    if ('_DomRender_isProxy' in rootObject) {
      if (target) {
        ((rootObject as any)._DomRender_proxy as DomRenderProxy<T>).initRender(target);
      }
      targetObject = rootObject;
      // return targetObject;
      return {rootObject: targetObject, target, config: (rootObject as any)._domRender_config};
    }
    const targetConfig = Object.assign({}, config) as DomRenderConfig;
    eventManager ??= new EventManager(targetConfig.window);

    targetConfig.uuid = RandomUtils.uuid4();
    targetConfig.messenger = DomRenderFinalProxy.final(targetConfig.messenger ?? new DefaultMessenger(targetConfig));
    targetConfig.proxyExcludeTyps = targetConfig.proxyExcludeTyps ?? [];
    targetConfig.targetElements ??= [];


    if (typeof Window !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === Window)) {
      targetConfig.proxyExcludeTyps.push(Window);
    }
    if (typeof Map !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === Map)) {
      targetConfig.proxyExcludeTyps.push(Map);
    }
    if (typeof Set !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === Set)) {
      targetConfig.proxyExcludeTyps.push(Set);
    }
    if (typeof Promise !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === Promise)) {
      targetConfig.proxyExcludeTyps.push(Promise);
    }
    if (typeof ResizeObserver !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === ResizeObserver)) {
      targetConfig.proxyExcludeTyps.push(ResizeObserver);
    }
    if (typeof ImageBitmap !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === ImageBitmap)) {
      targetConfig.proxyExcludeTyps.push(ImageBitmap);
    }
    if (typeof CanvasRenderingContext2D !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === CanvasRenderingContext2D)) {
      targetConfig.proxyExcludeTyps.push(CanvasRenderingContext2D);
    }
    if (typeof HTMLCanvasElement !== 'undefined' && !targetConfig.proxyExcludeTyps.some(it => it === HTMLCanvasElement)) {
      targetConfig.proxyExcludeTyps.push(HTMLCanvasElement);
    }
    if (!targetConfig.proxyExcludeTyps.some(it => it === RawSet)) {
      targetConfig.proxyExcludeTyps.push(RawSet);
    }
    if (!targetConfig.proxyExcludeTyps.some(it => it === DomRender)) {
      targetConfig.proxyExcludeTyps.push(DomRender);
    }
    targetConfig.rootElement = target;
    targetConfig.eventManager = eventManager;
    // (targetConfig.window as any).domRender ??= {configs: []};
    // (targetConfig.window as any).domRender.configs.push(targetConfig);
    const domRender = new DomRenderProxy(rootObject, target, targetConfig);
    const dest = new Proxy(rootObject, domRender);
    targetObject = dest;
    targetConfig.root = targetObject;

    // proxy 된 targetObject를 넣어줘야되서 뒤쪽에서 router를 생성해야함
    if (!targetConfig.router) {
      let targetRouter: Router<any> | undefined;
      if ('routerType' in config && config?.routerType === 'hash') {
        targetRouter = new HashRouter({rootObject: targetObject, window: targetConfig.window});
      } else if ('routerType' in config && config?.routerType === 'path') {
        targetRouter = new PathRouter({rootObject: targetObject, window: targetConfig.window});
      } else if ('routerType' in config && typeof config?.routerType === 'function') {
        targetRouter = config.routerType(targetObject, targetConfig.window);
      } else if ('routerType' in config && typeof config?.routerType === 'object') {
        targetRouter = config.routerType;
      }
      targetConfig.router = targetRouter;
    }

    for (const value of Object.values(drComponent)) {
      const a = value(targetConfig, DomRender);
      if (!targetConfig.targetElements.some(it => it.name === a.name)) {
        targetConfig.targetElements.push(a);
      }
    }
    // console.log('cccccccccccccccccc', targetRouter)
    // targetRouter.go({path: targetRouter.getUrl()})
    // if (!config.router) {
    //   if (config.routerType === 'path') {
    //     config.router = new PathRouter(targetObject, config.window);
    //   } else if (config.routerType === 'hash') {
    //     config.router = new HashRouter(targetObject, config.window);
    //   } else { // none
    //     config.router = new HashRouter(targetObject, config.window);
    //   }
    // }
    domRender.run(targetObject);
    return {rootObject: targetObject, config: targetConfig, target};
    // return targetObject;
  }

  public static createComponent(param: CreateComponentParam) {
    // console.log('===>', typeof param.type, param.type.name, param.type.constructor.name)
    const component = RawSet.createComponentTargetElement(
      {
        name: param.tagName ?? (typeof param.type === 'function' ? param.type.name : param.type.constructor.name),
        objFactory: (e, o, r2, counstructorParam) => {
          return typeof param.type === 'function' ? new param.type(...counstructorParam) : param.type;
        },
        noStrip: param.noStrip,
        template: param.template ?? '',
        styles: Array.isArray(param.styles) ? param.styles : (param.styles ? [param.styles] : undefined)
      }
    );
    return component;
  }

  // ?? 언제 쓰는거지?? 훔..
  public static createAttribute(attrName: string, getThisObj: (element: Element, attrValue: string, obj: any, rawSet: RawSet) => any, factory: (element: Element, attrValue: string, obj: any, rawSet: RawSet) => DocumentFragment) {
    const targetAttribute = RawSet.createComponentTargetAttribute(
      attrName,
      getThisObj,
      factory
    );
    return targetAttribute;
  }
}
