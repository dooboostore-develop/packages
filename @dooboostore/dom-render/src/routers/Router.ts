import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import { Observable } from '@dooboostore/core/message/Observable';
import { BehaviorSubject } from '@dooboostore/core/message/BehaviorSubject';
import { Expression } from '@dooboostore/core/expression/Expression';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;

export type RouteData = {
  path: string;
  url: string;
  data?: any;
  searchParams: URLSearchParams;
  pathData?: any;
  router: Router;
}

export type RouterConfig<T = any> = { rootObject?: T, window: Window, firstUrl?: string};
export type ChangeStateResult = {data?: any}
export type RouteAction = string | { path?: string, searchParams?: ToURLSearchParamsParams };

type RouterEventType = RouteData & { triggerPoint: 'start' | 'end' };

export abstract class Router<T = any> {
  private behaviorSubject: BehaviorSubject<RouterEventType>;
  private _config: RouterConfig<T>;

  constructor(config: RouterConfig<any>) {
    this._config = config;

    let routeData: RouterEventType;
    if (config?.firstUrl) {
      const path = config.firstUrl.split('?');
      routeData = {
        url: config.firstUrl,
        path: path[0],
        searchParams: new URLSearchParams(path[1]??''),
        router: this,
        triggerPoint: 'end'
      }
      this.behaviorSubject = new BehaviorSubject<RouterEventType>(routeData);
      this.go(config.firstUrl);
    } else {
      routeData = {...this.getRouteData(), triggerPoint: 'end'};
      this.behaviorSubject = new BehaviorSubject<RouterEventType>(routeData);
    }
    this.config.window.addEventListener('popstate', (event: PopStateEvent) => {
      // domrender에서 발생하지 않은 즉 back, previous 일떄에도 이벤트가도록 처리
      // if(!isPopStateCurrentTargetDomrenderRouter(event.state)) {
      // console.log('-------');
      const routeData: RouterEventType = {...this.getRouteData(), triggerPoint: 'end'};
      this.behaviorSubject.next(routeData);
      // }
    })
  }


  get observable(): Observable<RouterEventType> {
    return this.behaviorSubject.asObservable();
  }

  get searchParamObject() {
    return ConvertUtils.toObject(this.getSearchParams());
  }

  get config() {
    return this._config;
  }

  public getSearchFirstParamsObject<T = any>(defaultValue?: T) {
    const a = ConvertUtils.toObject<T>(this.getSearchParams(), {firstValue: true});
    return Object.assign({}, defaultValue, a);
  }

  public getHashSearchFirstParamsObject<T = any>() {
    return ConvertUtils.toObject<T>(this.getHashSearchParams(), {firstValue: true});
  }

  // async attach(): Promise<void> {
  //   // const proxy = getDomRenderProxy(this.config.rootObject)
  //   // if (proxy) {
  //   //   const key = `___${EventManager.ROUTER_VARNAME}`;
  //   //   await proxy.render(key);
  //   // }
  // }

  testRegexp(regexp?: string): boolean {
    if (regexp) {
      const b = RegExp(regexp).test(this.getPathName());
      return b;
    }else {
      return false;
    }
  }

  test(urlExpression?: string): boolean {
    if (urlExpression && this.getPathData(urlExpression)) {
      return true;
    } else {
      return false;
    }
  }

  getRouteData(config?: {pathOrUrl?: string, urlExpression?: string}): RouteData {

    let path = '';
    let url ='';
    if (config?.pathOrUrl) {
      let isUrl = false;
      try {
        new URL(config.pathOrUrl);
        isUrl = true;
      } catch {
        isUrl = false;
      }
      if(isUrl){
        const u = new URL(config.pathOrUrl);
        path = u.pathname;
        url = u.pathname + u.search;
      } else {
        path = config.pathOrUrl.split('?')[0];
      }
    } else {
      path = this.getPathName();
      url = this.getUrl();
    }
    const newVar = {
      path: path,
      url: url,
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
    // newVar.currentTarget = config?.currentTarget;
    return Object.freeze(newVar);
  }

  pushState(data: any, title: string | undefined, path: string):ChangeStateResult {
    // data = this.config.changeStateConvertDate?this.config.changeStateConvertDate(data): data;
    // console.log('--->pushState', data);
    this.behaviorSubject.next({ ...this.getRouteData({pathOrUrl:path}), triggerPoint: 'start' });
    this.config.window.history?.pushState(data, title ?? '', path);
    this.behaviorSubject.next({ ...this.getRouteData({pathOrUrl:path}), triggerPoint: 'end' });
    return {data};
  }

  replaceState(data: any, title: string | undefined, path: string):ChangeStateResult {
    // data = this.config.changeStateConvertDate?this.config.changeStateConvertDate(data): data;
    // console.log('--->replaceState', data);
    this.behaviorSubject.next({ ...this.getRouteData({pathOrUrl:path}), triggerPoint: 'start' });
    this.config.window.history?.replaceState(data, title ?? '', path);
    this.behaviorSubject.next({ ...this.getRouteData({pathOrUrl:path}), triggerPoint: 'end' });
    return {data};
  }

  getData(): any {
    return this.config.window.history?.state;
  }

  getPathData(urlExpression: string, currentUrl = this.getPathName()): any {
    return Expression.Path.pathNameData(currentUrl, urlExpression);
  }

  back(): void {
    this.behaviorSubject.next({...this.getRouteData(),triggerPoint:'start'});
    this.config.window.history.back();
    //en부분은 constructo의  this.config.window.addEventListener('popstate'   에서 받아서 처리된다 호출된다.
  }

  forward(): void {
    this.behaviorSubject.next({...this.getRouteData(),triggerPoint:'start'});
    this.config.window.history?.forward();
    //end부분은 constructor의  this.config.window.addEventListener('popstate'   에서 받아서 처리된다 호출된다.
  }

  go(i: number): void;
  async go(config:  string | { path: RouteAction, data?: any, replace?: boolean, title?: string, scrollToTop?: boolean } | string): Promise<void> ;
  go(config: number | string | { path: RouteAction, data?: any, replace?: boolean, title?: string, scrollToTop?: boolean } | string): Promise<void> | void {
    if (typeof config === 'number') {
      this.behaviorSubject.next({...this.getRouteData(),triggerPoint:'start'});
      this.config.window.history?.go(config);
      //end부분은 constructor의  this.config.window.addEventListener('popstate'   에서 받아서 처리된다 호출된다.
      return;
    }

    if (typeof config === 'string') {
      config = { path: config };
    }

    // let data: ChangeStateResult | undefined = undefined;
    if (config?.replace) {
      this.replace(config.path, config.data, config.title);
    } else {
      this.push(config.path, config.data, config.title);
    }
    // if (!this.config.disableAttach) {
    //   await this.attach();
    // }

    // 스크롤 제어 (기본값: true - 맨 위로 스크롤)
    if (config.scrollToTop !== false) {
      try {
        this._config.window?.scrollTo?.(0, 0);
      }catch (e){}
    }

    // console.log('----------', data, config)
    // if (!config.disabledPopEvent) {
    //   this.dispatchPopStateEvent(config?.data);
    // }
  }

  toUrl(data: RouteAction) {
    console.log('toUrl', data);
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
