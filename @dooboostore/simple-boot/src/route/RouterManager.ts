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
import { isRouterAction, RoutingDataSet } from '../route/RouterAction';
import { isOnRouting } from '../lifecycle/OnRouting';
import { SimOption } from '../SimOption';

export type RoutingOption = { router?: ConstructorType<any> | any, find?: { router: 'last' | 'first' } };

@Sim
export class RouterManager {
  public activeRouterModule?: RouterModule<SimAtomic, any>;

  constructor(private simstanceManager: SimstanceManager, private simOption: SimOption) {
  }

  public routingMap(prefix: string = '',  option?: RoutingOption): { [key: string]: string | any } {
    const targetRouter = option?.router ?? this.simOption.rootRouter;
    if (!targetRouter) {
      throw new Error('no router');
    }
    const map = {} as { [key: string]: string | any };
    if (targetRouter) {
      const targetType = (typeof targetRouter === 'object') ? targetRouter.constructor : targetRouter;
      const targetValue = (typeof targetRouter === 'object') ? targetRouter : undefined;
      const routerAtomic = new SimAtomic({targetKeyType: targetType, originalType: targetType, value: targetValue}, this.simstanceManager);
      const routerData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey);
      if (routerData) {
        const currentPrefix = prefix + routerData.path;
        if (routerData.route) {
          Object.entries(routerData.route).forEach(([key, value]) => {
            map[currentPrefix + key] = value;
          });
        }
        routerData.routers?.forEach(it => {
          Object.assign(map, this.routingMap(currentPrefix, {...option, router: it}));
        })
      }
    }
    return map;
  }

  public async routings<R = SimAtomic, M = any>(intent: Intent, option?: RoutingOption): Promise<RouterModule<R, M>[]> {
    const targetRouter = option?.router ?? this.simOption.rootRouter;
    if (!targetRouter) {
      throw new Error('no router');
    }
    const targetType = (typeof targetRouter === 'object') ? targetRouter.constructor : targetRouter;
    const targetValue = (typeof targetRouter === 'object') ? targetRouter : undefined;

    const routerAtomic = new SimAtomic({targetKeyType: targetType, originalType: targetType, value: targetValue}, this.simstanceManager);
    const allMatches = this._collectAllMatchingModules(routerAtomic, intent, []);

    // Priority 1: Exact path match with a module
    const exactModuleMatches = allMatches.filter(rm => rm.path === intent.pathname && rm.module);
    if (exactModuleMatches.length > 0) {
      return exactModuleMatches as RouterModule<R, M>[];
    }

    // Priority 2: Exact path match without a module (if no module matches found)
    const exactPathMatches = allMatches.filter(rm => rm.path === intent.pathname);
    if (exactPathMatches.length > 0) {
      return exactPathMatches as RouterModule<R, M>[];
    }

    return [] as RouterModule<R, M>[];
  }

  public async routing<R = SimAtomic, M = any>(intent: Intent, option?: RoutingOption): Promise<RouterModule<R, M>> {
    const targetRouter = option?.router ?? this.simOption.rootRouter;
    if (!targetRouter) {
      throw new Error('no router');
    }
    // await new Promise((r)=> setTimeout(r, 0)); // <-- 이거 넣어야지 두번불러지는게 없어지는듯? 뭐지 event loop 변경된건가?
    const targetType = (typeof targetRouter === 'object') ? targetRouter.constructor : targetRouter;
    const targetValue = (typeof targetRouter === 'object') ? targetRouter : undefined;

    const routerAtomic = new SimAtomic({targetKeyType: targetType, originalType: targetType, value: targetValue}, this.simstanceManager);
    const rootRouter = routerAtomic.getValue()!;
    const executeModuleResult = this.getExecuteModule(routerAtomic, intent, [], option);
    if (executeModuleResult) {
      const [executeModule, routerChains] = executeModuleResult;
      executeModule.routerChains = routerChains;
      this.activeRouterModule = executeModule;
      const routingDataSet: RoutingDataSet = {intent, routerModule: executeModule, routerManager: this};
      if (routerChains.length > 0) {
        for (let i = 0; i < routerChains.length; i++) {
          const current = routerChains[i];
          const next = routerChains[i + 1];
          const value = current.getValue()! as any;
          if (isRouterAction(value)) {
            if (next) {
              await value.canActivate(routingDataSet, next.getValue());
            }
          }
          if (isOnRouting(value)) {
            await value.onRouting(routingDataSet);
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
          await value.canActivate(routingDataSet, moduleInstance);
        }
        if (isOnRouting(value)) {
          await value.onRouting(routingDataSet);
        }
      } else { // find page
        const value = executeModule.router?.getValue()! as any;
        if (isRouterAction(value)) {
          await value.canActivate(routingDataSet, moduleInstance);
        }
        if (isOnRouting(value)) {
          await value.onRouting(routingDataSet);
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
              r = sim?.getValue()[v]?.(...this.simstanceManager.getParameterSim({target: sim?.getValue(), targetKey: v, otherStorage}));
            } else if (this.activeRouterModule?.routerChains?.some((it: SimAtomic) => (it.getValue() as any)?.hasActivate?.(sim?.getValue()))) {
              r = sim?.getValue()[v]?.(...this.simstanceManager.getParameterSim({target: sim?.getValue(), targetKey: v, otherStorage}));
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
      const routers: SimAtomic[] = [];
      const routerModule = new RouterModule(this.simstanceManager, rootRouter, undefined, routers);
      const routingDataSet = {intent, routerModule: routerModule, routerManager: this};
      if (routers.length && routers.length > 0) {
        for (let i = 0; i < routers.length; i++) {
          const current = routers[i];
          const next = routers[i + 1];
          const value = current.getValue()! as any;
          // console.log('routerAction!!!!!!!!!3')
          if (isRouterAction(value)) {
            await value.canActivate(routingDataSet, next?.getValue() ?? null);
          }
          if (isOnRouting(value)) {
            await value.onRouting(routingDataSet);
          }
        }
      }
      this.activeRouterModule = routerModule;
      return this.activeRouterModule as RouterModule<any, any>;
    }
  }

  private getExecuteModule(router: SimAtomic, intent: Intent, parentRouters: SimAtomic[], option?: RoutingOption): [RouterModule, SimAtomic[]] | undefined {
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
      const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it)?.isAccept(intent) === false);
      if (noAccept) {
        return;
      }

      const routerStrings = parentRouters.map(it => it.getConfig<RouterConfig>(RouterMetadataKey)?.path || '');
      const isRoot = this.isRootUrl(routerConfig.path, routerStrings, path)
      // console.log('----------routerConfig.path', routerConfig.path, 'isRoot', isRoot, 'routerStrings', routerStrings, 'path', path);
      if (isRoot) {
        const currentParentRouters = [...parentRouters, router];
        // first find child routers
        if (routerConfig.routers && routerConfig.routers.length > 0) {
          let bestMatchModule: [RouterModule<SimAtomic, any>, SimAtomic[]] | undefined = undefined;
          let bestMatchLength = -1;

          for (const child of routerConfig.routers) {
            const routerAtomic = new SimAtomic({targetKeyType: child, originalType: child}, this.simstanceManager);
            const executeModule = this.getExecuteModule(routerAtomic, intent, currentParentRouters, option)

            if (executeModule) {
              const [rm, chains] = executeModule;
              const currentMatchLength = rm.path?.length || 0;
              if (currentMatchLength > bestMatchLength) {
                bestMatchLength = currentMatchLength;
                bestMatchModule = executeModule;
              } else if (currentMatchLength === bestMatchLength) {
                if (option?.find?.router === 'last') {
                  bestMatchModule = executeModule;
                }
              }
            }
          }
          if (bestMatchModule) {
            return bestMatchModule;
          }
        }
        // second find my child routers
        const module = this.findRouterOrModule(router, routerConfig, routerStrings, intent)
        if (module) {
          return [module, currentParentRouters];
        }
      }
    }
  }

  private isRootUrl(path: string | undefined, parentRoots: string[], url: string): boolean {
    const searchString = parentRoots.join('') + (path || '');
    const searchs = searchString.split('/')
    const urls = url.split('/')
    const trimmedUrls = urls.slice(0, searchs.length).join('/');
    // console.log('!!searchString', searchString, 'url', trimmedUrls);
    return !!Expression.Path.pathNameData(trimmedUrls, searchString);
    // return url.startsWith(searchString)
  }

  private _collectAllMatchingModules(router: SimAtomic, intent: Intent, parentRouters: SimAtomic[]): RouterModule[] {
    const matches: RouterModule[] = [];
    const path = intent.pathname;
    const routerConfig = router.getConfig<RouterConfig>(RouterMetadataKey);

    if (routerConfig) {
      const filters: (RouteFilter | ConstructorType<any>)[] = [];
      if (Array.isArray(routerConfig.filters)) {
        filters.push(...routerConfig.filters);
      } else if (routerConfig.filters) {
        filters.push(routerConfig.filters);
      }
      const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it)?.isAccept(intent) === false);
      if (noAccept) {
        return matches;
      }

      const routerStrings = parentRouters.map(it => it.getConfig<RouterConfig>(RouterMetadataKey)?.path || '');
      const isRoot = this.isRootUrl(routerConfig.path, routerStrings, path)

      if (isRoot) {
        const currentParentRouters = [...parentRouters, router];

        // Collect matches from child routers
        if (routerConfig.routers && routerConfig.routers.length > 0) {
          for (const child of routerConfig.routers) {
            const routerAtomic = new SimAtomic({targetKeyType:child, originalType: child}, this.simstanceManager);
            matches.push(...this._collectAllMatchingModules(routerAtomic, intent, currentParentRouters));
          }
        }

        // Collect matches from current router's routes or the router itself
        const module = this.findRouterOrModule(router, routerConfig, routerStrings, intent);
        if (module) {
          module.routerChains = currentParentRouters;
          matches.push(module);
        }
      }
    }
    return matches;
  }

  private findRouterOrModule(router: SimAtomic, routerData: RouterConfig, parentRoots: string[], intent: Intent): RouterModule | undefined {
    // 1. Try to find an exact route module match
    const module = this.findRouting(router, routerData, parentRoots, intent);
    if (module?.module) {
      module.intent = intent;
      return module;
    }

    // 2. If no exact module, check if the intent path matches the router's path
    const urlRoot = parentRoots.join('') + (routerData.path || '');
    if (this.isRootUrl(routerData.path, parentRoots, intent.pathname)) {
      const rm = new RouterModule(this.simstanceManager, router);
      rm.intent = intent;
      rm.path = urlRoot;
      rm.pathData = intent.getPathnameData(urlRoot);
      return rm;
    }
    return undefined;
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

  private findRouteProperty(route: Route, propertyName: string, intent: Intent): { child?: {targetKeyType? : ConstructorType<any> | Function, originalType: ConstructorType<any> | Function}, data?: any, propertyKeys?: (string | symbol)[] } {
    let child: {targetKeyType? : ConstructorType<any> | Function, originalType: ConstructorType<any> | Function} | undefined;
    let data: any;
    let propertyKeys: undefined | (string | symbol)[];
    const routeElement = route[propertyName];
    if (typeof routeElement === 'function') {
      child = {targetKeyType: routeElement, originalType: routeElement};
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
        const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it)?.isAccept(intent) === false);
        if (!noAccept) {
          child = {targetKeyType: r.target, originalType: r.target};
        }
      } else {
        child = {targetKeyType: r, originalType:r};
      }
      data = routeElement?.[1];
    } else if (typeof routeElement === 'object' && 'target' in routeElement && 'propertyKeys' in routeElement) { // RouteTargetMethod
      const noAccept = routeElement.filters?.filter(it => it).some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it)?.isAccept(intent) === false);
      if (!noAccept) {
        child = {targetKeyType: routeElement.target, originalType: routeElement.target};
        propertyKeys = routeElement.propertyKeys as (string | symbol)[];
      }
    } else if (typeof routeElement === 'object' && 'filters' in routeElement && 'target' in routeElement) {
      const filters: (RouteFilter | ConstructorType<any>)[] = [];
      if (Array.isArray(routeElement.filters)) {
        filters.push(...routeElement.filters);
      } else if (routeElement.filters) {
        filters.push(routeElement.filters);
      }
      const noAccept = filters.some(it => (typeof it === 'function' ? this.simstanceManager.getOrNewSim({target: it}) : it)?.isAccept(intent) === false);
      if (!noAccept) {
        child = {targetKeyType: routeElement.target, originalType:routeElement.target};
      }
    }
    return {
      child,
      data,
      propertyKeys
    }
  }
}
