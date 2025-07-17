import { Intent } from '../intent/Intent';
import { ConstructorType } from '@dooboostore/core/types';
import { RouterModule } from './RouterModule';
import { Route, RouterConfig, RouterMetadataKey } from '../decorators/route/Router';
import { SimAtomic } from '../simstance/SimAtomic';
import { SimstanceManager } from '../simstance/SimstanceManager';
import { getOnRoute, onRoutes } from '../decorators/route/OnRoute';
import { RouteFilter } from './RouteFilter';
import { Sim } from '../decorators/SimDecorator';
import { Expression } from '@dooboostore/core/expression/Expression';
import { isRouterAction } from '../route/RouterAction';

@Sim
export class RouterManager {
  public activeRouterModule?: RouterModule<SimAtomic, any>;

  constructor(private simstanceManager: SimstanceManager, private rootRouter?: ConstructorType<any> | Function) {
  }

  public routingMap(prefix: string = '', router = this.rootRouter): { [key: string]: string | any } {
    const map = {} as { [key: string]: string | any };
    if (router) {
      const routerAtomic = new SimAtomic(router, this.simstanceManager);
      const routerData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey);
      if (routerData) {
        const currentPrefix = prefix + routerData.path;
        if (routerData.route) {
          Object.entries(routerData.route).forEach(([key, value]) => {
            map[currentPrefix + key] = value;
          });
        }
        routerData.routers?.forEach(it => {
          Object.assign(map, this.routingMap(currentPrefix, it));
        })
      }
    }
    return map;
  }

  public async routing<R = SimAtomic, M = any>(intent: Intent): Promise<RouterModule<R, M>> {
    if (!this.rootRouter) {
      throw new Error('no root router');
    }
    // await new Promise((r)=> setTimeout(r, 0)); // <-- 이거 넣어야지 두번불러지는게 없어지는듯? 뭐지 event loop 변경된건가?
    const routers: SimAtomic[] = [];
    const routerAtomic = new SimAtomic(this.rootRouter, this.simstanceManager);
    const rootRouter = routerAtomic.getValue()!;
    const executeModule = this.getExecuteModule(routerAtomic, intent, routers);
    if (executeModule?.router) {
      executeModule.routerChains = routers;
      if (executeModule.routerChains?.length && executeModule.routerChains?.length > 0) {
        for (let i = 0; i < executeModule.routerChains.length; i++) {
          const current = executeModule.routerChains[i];
          const next = executeModule.routerChains[i + 1];
          const value = current.getValue()! as any;
          if (isRouterAction(value)) {
            // console.log('routerAction!!!!!!!!!')
            if (next) {
              await value.canActivate({intent, routerModule: executeModule, routerManager: this}, next?.getValue() ?? null);
            }
          }
        }
      }
      this.activeRouterModule = executeModule;

      // not found page TODO: notFound 됐을때 처음 router있을시 canActivate 호출
      const moduleInstance = executeModule.getModuleInstance();
      if (!executeModule?.module) {
        const routerChain = executeModule.routerChains[executeModule.routerChains.length - 1];
        const value = routerChain?.getValue() as any;
        if (isRouterAction(value)) {
          await value.canActivate({intent, routerModule: executeModule, routerManager: this}, moduleInstance);
        }
      } else { // find page
        const value = executeModule.router?.getValue()! as any;
        if (isRouterAction(value)) {
          await value.canActivate({intent, routerModule: executeModule, routerManager: this}, moduleInstance);
        }
      }

      // 라우팅 완료된 후 호출 되어야 할 decoration TODO: 리펙토링 필요
      const otherStorage = new Map<ConstructorType<any>, any>();
      otherStorage.set(Intent, intent);
      otherStorage.set(RouterModule, executeModule);
      for (const [key, value] of Array.from(onRoutes)) {
        try {
          const sim = this.simstanceManager.findLastSim({type: key});
          for (const v of value) {
            const onRouteConfig = getOnRoute(key, v);
            let r;
            if (!onRouteConfig?.isActivateMe) {
              r = sim?.getValue()[v]?.(...this.simstanceManager.getParameterSim({target: sim?.getValue(), targetKey: v, otherStorage} ));
            } else if (this.activeRouterModule?.routerChains?.some((it: SimAtomic) => (it.getValue() as any)?.hasActivate?.(sim?.getValue()))) {
              r = sim?.getValue()[v]?.(...this.simstanceManager.getParameterSim({target: sim?.getValue(), targetKey: v, otherStorage} ));
            }
            if (r instanceof Promise) {
              await r
            }
          }
        } catch (error) {
          // skip catch
        }
      }
      return this.activeRouterModule as RouterModule<any, any>;
    } else {
      const routerModule = new RouterModule(this.simstanceManager, rootRouter, undefined, routers);
      if (routers.length && routers.length > 0) {
        for (let i = 0; i < routers.length; i++) {
          const current = routers[i];
          const next = routers[i + 1];
          const value = current.getValue()! as any;
            // console.log('routerAction!!!!!!!!!3')
          if (isRouterAction(value)) {
            await value.canActivate({intent, routerModule: routerModule, routerManager: this}, next?.getValue() ?? null);
          }
        }
      }
      this.activeRouterModule = routerModule;
      return this.activeRouterModule as RouterModule<any, any>;
    }
  }

  private getExecuteModule(router: SimAtomic, intent: Intent, parentRouters: SimAtomic[]): RouterModule | undefined {
    const path = intent.pathname;
    const routerConfig = router.getConfig<RouterConfig>(RouterMetadataKey);
    if (routerConfig) {
      // filter

      const filters: (RouteFilter | ConstructorType<any>)[] = [];
      if (Array.isArray(routerConfig.filters)) {
        filters.push(...routerConfig.filters);
      } else if (routerConfig.filters) {
        filters.push(routerConfig.filters);
      }
      const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it)?.isAccept(intent) === false);
      if (noAccept) {
        return;
      }

      const routerStrings = parentRouters.slice(1).map(it => it.getConfig<RouterConfig>(RouterMetadataKey)?.path || '');
      const isRoot = this.isRootUrl(routerConfig.path, routerStrings, path)
      // console.log('----------routerConfig.path', routerConfig.path, 'isRoot', isRoot, 'routerStrings', routerStrings, 'path', path);
      if (isRoot) {
        parentRouters.push(router);
        // first find child routers
        if (routerConfig.routers && routerConfig.routers.length > 0) {
          for (const child of routerConfig.routers) {
            const routerAtomic = new SimAtomic(child, this.simstanceManager);
            const router = routerAtomic.getValue()!;
            const executeModule = this.getExecuteModule(routerAtomic, intent, parentRouters)
            if (router && executeModule) {
              return executeModule
            }
          }
        }
        // second find my child routers
        const module = this.findRouting(router, routerConfig, routerStrings, intent)
        if (module?.module) {
          module.intent = intent;
          return module;
        }
      }
    }
  }

  private isRootUrl(path: string | undefined, parentRoots: string[], url: string): boolean {
    const searchString = parentRoots.join('') + (path || '');
    const searchs  = searchString.split('/')
    const urls = url.split('/')
    const trimmedUrls = urls.slice(0, searchs.length).join('/');
    // console.log('!!searchString', searchString, 'url', trimmedUrls);
    return !!Expression.Path.pathNameData(trimmedUrls, searchString);
    // return url.startsWith(searchString)
  }

  private findRouting(router: SimAtomic, routerData: RouterConfig, parentRoots: string[], intent: Intent): RouterModule | undefined {
    // console.log('findRouting', routerData.route);
    const urlRoot = parentRoots.join('') + routerData.path
    if (routerData.route) {
      for (const it of Object.keys(routerData.route).filter(it => !it.startsWith('_'))) {
        const path = urlRoot + it;
        const pathnameData = intent.getPathnameData(path);
        if (pathnameData) {
          try {
            const dataSet = this.findRouteProperty(routerData.route, it, intent);
            const rm = new RouterModule(this.simstanceManager, router, dataSet.child);
            rm.data = dataSet.data;
            rm.path = path;
            rm.pathData = pathnameData;
            rm.propertyKeys = dataSet.propertyKeys;
            return rm;
          } catch (e) {
          }
        }
      }
    }
  }

  private findRouteProperty(route: Route, propertyName: string, intent: Intent): { child?: ConstructorType<any> | Function, data?: any, propertyKeys?: (string | symbol)[] } {
    let child: ConstructorType<any> | Function| undefined;
    let data: any;
    let propertyKeys: undefined | (string | symbol)[];
    const routeElement = route[propertyName];
    if (typeof routeElement === 'function') {
      child = routeElement;
    } else if (typeof routeElement === 'symbol') {
      child = this.simstanceManager.findLastSim(routeElement)?.type;
    } else if (typeof routeElement === 'string') {
      return this.findRouteProperty(route, routeElement, intent)
    } else if (Array.isArray(routeElement)) {
      const r = routeElement?.[0];
      if (typeof r === 'object' && 'filters' in r && 'target' in r) {
        const filters: (RouteFilter | ConstructorType<any>)[] = [];
        if (Array.isArray(r.filters)) {
          filters.push(...r.filters);
        } else if (r.filters) {
          filters.push(r.filters);
        }
        const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it)?.isAccept(intent) === false);
        if (!noAccept) {
          child = r.target;
        }
      } else {
        child = r;
      }
      data = routeElement?.[1];
    } else if (typeof routeElement === 'object' && 'target' in routeElement && 'propertyKeys' in routeElement) { // RouteTargetMethod
      const noAccept = routeElement.filters?.filter(it => it).some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it)?.isAccept(intent) === false);
      if (!noAccept) {
        child = routeElement.target;
        propertyKeys = routeElement.propertyKeys as (string | symbol)[];
      }
    } else if (typeof routeElement === 'object' && 'filters' in routeElement && 'target' in routeElement) {
      const filters: (RouteFilter | ConstructorType<any>)[] = [];
      if (Array.isArray(routeElement.filters)) {
        filters.push(...routeElement.filters);
      } else if (routeElement.filters) {
        filters.push(routeElement.filters);
      }
      const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target:it}) : it)?.isAccept(intent) === false);
      if (!noAccept) {
        child = routeElement.target;
      }
    }
    return {
      child,
      data,
      propertyKeys
    }
  }
}
