import { DomRenderProxy } from './DomRenderProxy';
import { Config } from './configs/Config';
import { PathRouter } from './routers/PathRouter';
import { HashRouter } from './routers/HashRouter';
import { ConstructorType } from '@dooboostore/core/types';
import { DomRenderFinalProxy } from './types/Types';
import { RawSet } from './rawsets/RawSet';
import { DefaultMessenger } from './messenger/DefaultMessenger';
import { Router } from './routers/Router';

export type RunConfig<T = any> = Omit<Config<T>, 'router'> & { routerType?: 'path' | 'hash' | ((obj: T, window: Window) => Router) | Router };

export class DomRender {
  public static run<T extends object>({ rootObject, target, config }: { rootObject: T | (() => T), target?: Element | null, config?: RunConfig }): T {
    rootObject = typeof rootObject === 'function' ? rootObject() : rootObject;
    const targetConfig = Object.assign({}, config) as Config;
    let targetObject = rootObject;
    if ('_DomRender_isProxy' in rootObject) {
      if (target) {
        ((rootObject as any)._DomRender_proxy as DomRenderProxy<T>).initRender(target);
      }
      targetObject = rootObject;
      return targetObject; // { rootObject: targetObject, target, config: targetConfig };
    }

    // const domRenderConfig = Object.assign()
    // if (config && !config.window) {
    //   config.window = window;
    // }
    // config.routerType = config.routerType || 'none';
    targetConfig.messenger = DomRenderFinalProxy.final(targetConfig.messenger ?? new DefaultMessenger(targetConfig));
    targetConfig.proxyExcludeTyps = targetConfig.proxyExcludeTyps ?? [];
    if (typeof Window !== 'undefined') {
      targetConfig.proxyExcludeTyps.push(Window);
    }
    if (typeof Map !== 'undefined') {
      targetConfig.proxyExcludeTyps.push(Map);
    }
    targetConfig.proxyExcludeTyps.push(RawSet);
    const domRender = new DomRenderProxy(rootObject, target, targetConfig);
    const dest = new Proxy(rootObject, domRender);
    targetObject = dest;

    // proxy 된 targetObject를 넣어줘야되서 뒤쪽에서 router를 생성해야함
    let targetRouter: Router<any> | undefined;
    if (config?.routerType === 'hash') {
      targetRouter = new HashRouter({ rootObject: targetObject, window: targetConfig.window });
    } else if (config?.routerType === 'path') {
      targetRouter = new PathRouter({ rootObject: targetObject, window: targetConfig.window });
    } else if (typeof config?.routerType === 'function') {
      targetRouter = config.routerType(targetObject, targetConfig.window);
    } else if (typeof config?.routerType === 'object') {
      targetRouter = config.routerType;
    }
    targetConfig.router = targetRouter;

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
    return targetObject; // { rootObject: targetObject, config: targetConfig, target };
  }

  public static createComponent(param: { type: ConstructorType<any> | any, tagName?: string, template?: string, styles?: string[] | string }) {
    // console.log('===>', typeof param.type, param.type.name, param.type.constructor.name)
    const component = RawSet.createComponentTargetElement(
      param.tagName ?? (typeof param.type === 'function' ? param.type.name : param.type.constructor.name),
      (e, o, r2, counstructorParam) => {
        return typeof param.type === 'function' ? new param.type(...counstructorParam) : param.type;
      },
      param.template ?? '',
      Array.isArray(param.styles) ? param.styles : (param.styles ? [param.styles] : undefined)
    );
    return component;
  }

  public static createAttribute(attrName: string, getThisObj: (element: Element, attrValue: string, obj: any, rawSet: RawSet) => any, factory: (element: Element, attrValue: string, obj: any, rawSet: RawSet) => DocumentFragment) {
    const targetAttribute = RawSet.createComponentTargetAttribute(
      attrName,
      getThisObj,
      factory
    );
    return targetAttribute;
  }
}
