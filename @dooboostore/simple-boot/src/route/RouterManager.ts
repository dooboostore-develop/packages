import { Intent } from '../intent/Intent';
import { ConstructorType } from '@dooboostore/core/types';
import { RouterModule } from './RouterModule';
import { Route, RouterConfig, RouterMetadataKey } from '../decorators/route/Router';
import { SimAtomic } from '../simstance/SimAtomic';
import { SimstanceManager } from '../simstance/SimstanceManager';
import { RouteFilter } from './RouteFilter';
import { Sim } from '../decorators/SimDecorator';
import { Expression } from '@dooboostore/core/expression/Expression';
import { RouterAction } from '../route/RouterAction';
import { SimOption } from '../SimOption';
import { Subject } from '@dooboostore/core/message/Subject';

export type RoutingOption = { router?: ConstructorType<any> | any, find?: { router: 'last' | 'first' } };
export type RoutingDataSet = {
  intent: Intent, routerModule: RouterModule, routerManager: RouterManager
}

@Sim
export class RouterManager {
  public activeRouterModule?: RouterModule<SimAtomic, any>;
  private subject = new Subject<RoutingDataSet>()
  constructor(private simstanceManager: SimstanceManager, private simOption: SimOption) {
  }

  // @SimNoProxy
  get observable() {
    // this.subject.asObservable
    return this.subject.asObservable();
  }

  public routingMap(option?: RoutingOption & {prefix?: string}): { [key: string]: string | any } {
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
        const currentPrefix = (option?.prefix??'') + routerData.path;
        // Add the current router's path if it has a default route
        if (routerData.route && routerData.route['']) {
          map[currentPrefix] = routerData.route[''];
        }
        if (routerData.route) {
          Object.entries(routerData.route).forEach(([key, value]) => {
            map[currentPrefix + key] = value;
          });
        }
        routerData.routers?.forEach(it => {
          Object.assign(map, this.routingMap({...option, router: it, prefix: currentPrefix}));
        })
      }
    }
    return map;
  }

  /** 일반적인 lifecycle 타지않는 그냥 find.. 의미가없을듯.
   * @deprecated
   */
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
      exactModuleMatches.forEach(it => this.subject.next(({intent, routerManager: this, routerModule: it})))
      return exactModuleMatches as RouterModule<R, M>[];
    }

    // Priority 2: Exact path match without a module (if no module matches found)
    const exactPathMatches = allMatches.filter(rm => rm.path === intent.pathname);
    if (exactPathMatches.length > 0) {
      exactPathMatches.forEach(it => this.subject.next(({intent, routerManager: this, routerModule: it})))
      return exactPathMatches as RouterModule<R, M>[];
    }

    return [] as RouterModule<R, M>[];
  }

  public async routing<R = SimAtomic, M = any>(intent: string, option?: RoutingOption): Promise<RouterModule<R, M>> ;
  public async routing<R = SimAtomic, M = any>(intent: Intent, option?: RoutingOption): Promise<RouterModule<R, M>> ;
  public async routing<R = SimAtomic, M = any>(intent: Intent | string, option?: RoutingOption): Promise<RouterModule<R, M>> {
    if (typeof intent === 'string') {
      intent = new Intent(intent);
    }
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

      // --- 라우팅 경로(Chain)에 있는 모든 라우터의 라이프사이클 훅 호출 ---
      // 최종 목적지에 도달하기까지 거쳐온 모든 중간 라우터들(예: RootRouter -> UserRouter)을 순회하며
      // 각 라우터의 canActivate와 onRouting을 호출합니다.
      // 이를 통해 각 단계에서 라우팅을 검사하거나 공통 작업을 수행할 수 있습니다.
      if (routerChains.length > 0) {
        for (let i = 0; i < routerChains.length; i++) {
          const current = routerChains[i];
          const next = routerChains[i + 1];
          const value = current.getValue()! as any;
          if (RouterAction.isCanActivate(value) && next) {
              await value.canActivate(routingDataSet, next.getValue());
          }
          if (RouterAction.isOnRouting(value) && next) {
            await value.onRouting(routingDataSet);
          }
        }
      }
      this.activeRouterModule = executeModule;

      const moduleInstance = executeModule.getModuleInstance();

      // --- Case 1: 부분 일치 (라우터는 찾았지만, 특정 모듈은 찾지 못한 경우) ---
      // URL이 라우터의 경로와는 일치하지만, 그 안의 특정 `route` 항목과는 일치하지 않을 때 발생합니다.
      // 이 경우, 일치한 마지막 라우터의 라이프사이클 훅을 호출합니다.
      if (!executeModule?.module) {
        const routerChain = executeModule.routerChains[executeModule.routerChains.length - 1];
        const value = routerChain?.getValue() as any;
        if (RouterAction.isCanActivate(value)) {
          await value.canActivate(routingDataSet, moduleInstance);
        }
        if (RouterAction.isOnRouting(value)) {
          await value.onRouting(routingDataSet);
        }
      } 
      // --- Case 2: 완전 일치 (라우터와 특정 모듈을 모두 찾은 경우) ---
      // 표준 성공 케이스입니다.
      // 모듈을 포함하는 라우터와 모듈 인스턴스 자체의 라이프사이클 훅을 호출합니다.
      else { // find page
        const value = executeModule.router?.getValue()! as any;
        if (RouterAction.isCanActivate(value)) {
          await value.canActivate(routingDataSet, moduleInstance);
        }
        if (RouterAction.isOnRouting(value)) {
          await value.onRouting(routingDataSet);
        }

        if (moduleInstance && RouterAction.isOnRouting(moduleInstance)) {
          await moduleInstance.onRouting(routingDataSet);
        }
      }

      const find = this.activeRouterModule as RouterModule<any, any>;
      this.subject.next({intent: intent, routerModule: find, routerManager: this});
      return find;
    } else {
      const empty = await this._handleNotFoundRouting(rootRouter, intent);
      this.subject.next({intent: intent, routerModule: empty, routerManager: this});
      return empty;
    }
  }

  /**
   * URL과 일치하는 라우트를 찾지 못했을 경우를 처리합니다.
   * "Not Found" 상태를 나타내는 비어있는 RouterModule 객체를 생성하여 반환합니다.
   * 이 과정에서 rootRouter의 라이프사이클을 호출하여 공통 레이아웃등을 처리할 수 있습니다.
   * @param rootRouter 앱의 최상위 라우터 인스턴스
   * @param intent 확인에 실패한 원본 Intent 객체
   * @private
   */
  private async _handleNotFoundRouting(rootRouter: any, intent: Intent): Promise<RouterModule<any, any>> {
    /*
     * 이전 원본 로직 (참고용)
     * const routers: SimAtomic[] = []; 로 인해 if문이 항상 false가 되어 실제로는 동작하지 않았음.
     *
     * const routers: SimAtomic[] = [];
     * const routerModule = new RouterModule(this.simstanceManager, rootRouter, undefined, routers);
     * const routingDataSet = {intent, routerModule: routerModule, routerManager: this};
     * if (routers.length && routers.length > 0) {
     *   for (let i = 0; i < routers.length; i++) {
     *     const current = routers[i];
     *     const next = routers[i + 1];
     *     const value = current.getValue()! as any;
     *     // console.log('routerAction!!!!!!!!!3')
     *     if (RouterAction.isCanActivate(value)) {
     *       await value.canActivate(routingDataSet, next?.getValue() ?? null);
     *     }
     *     if (RouterAction.isOnRouting(value)) {
     *       await value.onRouting(routingDataSet);
     *     }
     *   }
     * }
     * this.activeRouterModule = routerModule;
     * return this.activeRouterModule as RouterModule<any, any>;
    */
    const routerModule = new RouterModule(this.simstanceManager, rootRouter, undefined, []);
    const routingDataSet: RoutingDataSet = {intent, routerModule: routerModule, routerManager: this};

    const value = rootRouter;
    if (RouterAction.isCanActivate(value)) {
      await value.canActivate(routingDataSet, null);
    }
    if (RouterAction.isOnRouting(value)) {
      await value.onRouting(routingDataSet);
    }

    this.activeRouterModule = routerModule;
    return this.activeRouterModule;
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
  // path: 지금 내 라우터의 path,  parentRoots: 부모router path들,  url: 사용자가 원하는 full intent url
  private isRootUrl(path: string | undefined, parentRoots: string[], url: string): boolean {
    const searchString = parentRoots.join('') + (path || '');//현재까지 경로 내포함
    if (searchString === '/') {
      return true;
    }
    const searchs = searchString.split('/');
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
