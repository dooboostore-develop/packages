import { DomRenderProxy, getDomRenderProxy } from '../DomRenderProxy';
import { EventManager } from '../events/EventManager';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import { Observable, Store, Subject } from '@dooboostore/core/message';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;
import { Expression } from '@dooboostore/core/expression/Expression';
export type RouteData = {
  path: string;
  url: string;
  data?: any;
  searchParams: URLSearchParams;
  pathData?: any;
  router: Router;
  currentTarget?:PopCurrentState;
}
export type PopStateCurrentTargetDomrenderRouter = { currentTargetName: 'domRenderRouter' };
export type PopCurrentState = PopStateCurrentTargetDomrenderRouter;
export const isPopStateCurrentTargetDomrenderRouter = (obj: any): obj is PopStateCurrentTargetDomrenderRouter =>
  obj?.currentTargetName === 'domRenderRouter';

export type RouterConfig<T = any> = { rootObject?: T, window: Window, disableAttach?: boolean,
  // changeStateConvertDate?:(data: any)=>any
};
export type ChangeStateResult = {data?: any}
export type RouteAction = string | { path?: string, searchParams?: ToURLSearchParamsParams };

/*
    this.option.window.addEventListener('popstate', (event) => { // history.back, forward에만 popstate 발생되고 값이 도출된다
   console.log('popstate-------!!', event.state, this.domRenderConfig.window.history.state)
   })
 */
export abstract class Router<T = any> {
  private subject = new Subject<RouteData>();
  private _config: RouterConfig<T>;

  get observable(): Observable<RouteData> {
    return this.subject.asObservable();
  }
  get searchParamObject() {
    return ConvertUtils.toObject(this.getSearchParams());
  }

  get config() {
    return this._config;
  }

  constructor(config: RouterConfig<any>) {
    this._config = config;
    this.config.window.addEventListener('popstate', (event: PopStateEvent) => {
      if(!isPopStateCurrentTargetDomrenderRouter(event.state)) {
        // console.log('-------');
        const routeData = this.getRouteData();
        this.subject.next(routeData);

      }
    })
  }



  public getSearchFirstParamsObject<T = any>(defaultValue?: T) {
    const a = ConvertUtils.toObject<T>(this.getSearchParams(), {firstValue: true});
    return Object.assign({}, defaultValue, a);
  }

  public getHashSearchFirstParamsObject<T = any>() {
    return ConvertUtils.toObject<T>(this.getHashSearchParams(), {firstValue: true});
  }

  async attach(): Promise<void> {
    const proxy = getDomRenderProxy(this.config.rootObject)
    if (proxy) {
      const key = `___${EventManager.ROUTER_VARNAME}`;
      await proxy.render(key);
    }
  }

  testRegexp(regexp: string): boolean {
    const b = RegExp(regexp).test(this.getPathName());
    return b;
  }

  test(urlExpression: string): boolean {
    if (this.getPathData(urlExpression)) {
      return true;
    } else {
      return false;
    }
  }

  getRouteData(config?: {urlExpression?: string, currentTarget?: PopCurrentState}): RouteData {
    const newVar = {
      path: this.getPathName(),
      url: this.getUrl(),
      searchParams: this.getSearchParams()
    } as RouteData;

    const data = this.getData();
    if (data) {
      newVar.data = data;
    }
    if (config?.urlExpression) {
      const data = this.getPathData(config.urlExpression);
      if (data) {
        newVar.pathData = data;
      }
    }
    newVar.router = this;
    newVar.currentTarget = config?.currentTarget;
    return Object.freeze(newVar);
  }

  pushState(data: any, title: string | undefined, path: string):ChangeStateResult {
    // data = this.config.changeStateConvertDate?this.config.changeStateConvertDate(data): data;
    // console.log('--->pushState', data);
    this.config.window.history.pushState(data, title??'', path);
    this.subject.next(this.getRouteData({currentTarget: {currentTargetName: 'domRenderRouter'}}));
    return {data};
  }

  replaceState(data: any, title: string | undefined, path: string):ChangeStateResult {
    // data = this.config.changeStateConvertDate?this.config.changeStateConvertDate(data): data;
    // console.log('--->replaceState', data);
    this.config.window.history.replaceState(data, title??'', path);
    this.subject.next(this.getRouteData({currentTarget: {currentTargetName: 'domRenderRouter'}}));
    return {data};
  }

  private dispatchPopStateEvent(data?: any) {
    this.config.window.dispatchEvent(new PopStateEvent('popstate', {state: {...data, currentTargetName: 'domRenderRouter'}}));
  }

  reload(data?: any) {
    this.config.window.dispatchEvent(new PopStateEvent('popstate', {state: data}));
  }

  getData(): any {
    return this.config.window.history.state;
  }

  getPathData(urlExpression: string, currentUrl = this.getPathName()): any {
    return Expression.Path.pathNameData(currentUrl, urlExpression);
  }

  async go(config: { path: RouteAction, data?: any, replace?: boolean, title?: string, disabledPopEvent?: boolean } | string): Promise<void> {
    if (typeof config === 'string') {
      config = {path: config};
    }

    // let data: ChangeStateResult | undefined = undefined;
    if (config?.replace) {
      this.replace(config.path, config.data, config.title);
    } else {
      this.push(config.path, config.data, config.title);
    }
    if (!this.config.disableAttach) {
      await this.attach();
    }
    // console.log('----------', data, config)
    if (!config.disabledPopEvent) {
      this.dispatchPopStateEvent(config?.data);
    }
  }

  toUrl(data: RouteAction) {
    let targetPath: string;
    if (typeof data === 'string') {
      targetPath = data;
    } else {
      const tpath = data.path ?? this.getPathName();
      const s = data.searchParams ? ConvertUtils.toURLSearchParams(data.searchParams).toString() : '';
      // data.searchParams
      targetPath = `${tpath}${s.length > 0 ? '?' : ''}${s}`;
    }
    return targetPath;
  }


  abstract push(path: RouteAction, data?: any, title?: string): void;

  abstract replace(path: RouteAction, data?: any, title?: string): void;

  abstract pushDeleteSearchParam(name: string | string[], data?: any, title?: string): void;

  abstract pushDeleteHashSearchParam(name: string | string[], data?: any, title?: string): void;

  abstract pushAddSearchParam(params:[[string, string]], data?: any, title?: string): void;

  abstract replaceDeleteSearchParam(name: string | string[], data?: any, title?: string): void;

  abstract replaceDeleteHashSearchParam(name: string | string[], data?: any, title?: string): void;

  abstract replaceAddSearchParam(params:[[string, string]], data?: any, title?: string): void;

  abstract getSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams;

  abstract getHashSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams;

  abstract getUrl(): string;

  abstract getHref(): string;

  abstract getPathName(): string;
}
