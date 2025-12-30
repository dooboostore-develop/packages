import {ConvertUtils} from '@dooboostore/core/convert/ConvertUtils';
import {Observable} from '@dooboostore/core/message/Observable';
import {BehaviorSubject} from '@dooboostore/core/message/BehaviorSubject';
import {Expression} from '@dooboostore/core/expression/Expression';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;
import {ValidUtils} from "@dooboostore/core/valid/ValidUtils";

export type RouteData = {
  path: string;
  url: string;
  data?: any;
  search: string;
  searchParams: URLSearchParams;
  pathData?: any;
  router: Router;
}

export type RouterConfig<T = any> = { rootObject?: T, window: Window, firstUrl?: string };
export type ChangeStateResult = { data?: any }
export type RouteAction = string | { path?: string, searchParams?: ToURLSearchParamsParams };
export type ChangeStateConfig = { noEventAndPublish?: boolean };
export type StateOptions = { data?: any, title?: string, config?: ChangeStateConfig };
export type RouterMethodOptions = { data?: any, title?: string, config?: ChangeStateConfig };

type RouterEventType = RouteData & { triggerPoint: 'start' | 'end' };

// popstate 이벤트 무시를 위한 마커
const ROUTER_NO_EVENT_MARKER = '__ROUTER_NO_EVENT__';

export abstract class Router<T = any> {
  private behaviorSubject: BehaviorSubject<RouterEventType>;
  private _config: RouterConfig<T>;

  constructor(config: RouterConfig<any>) {
    this._config = config;

    let routeData: RouterEventType;
    if (config?.firstUrl) {
      const path = config.firstUrl.split('?');
      const urlSearchParams = new URLSearchParams(path[1] ?? '');
      routeData = {
        url: config.firstUrl,
        path: path[0],
        searchParams: urlSearchParams,
        router: this,
        search: urlSearchParams.size > 0 ? `?${urlSearchParams.toString()}` : '',
        triggerPoint: 'end'
      }
      this.behaviorSubject = new BehaviorSubject<RouterEventType>(routeData);
      this.go(config.firstUrl);
    } else {
      routeData = {...this.getRouteData(), triggerPoint: 'end'};
      this.behaviorSubject = new BehaviorSubject<RouterEventType>(routeData);
    }
    this.config.window.addEventListener('popstate', (event: PopStateEvent) => {
      // console.log('----->', event.state)
      // noEventAndPublish 마커가 있으면 이벤트 발행하지 않음
      // if (event.state && event.state[ROUTER_NO_EVENT_MARKER]) {
      // } else {
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

  getSearchParamObject<T>() {
    return this.searchParamObject as unknown as T;
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
    } else {
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

  getRouteData(config?: { pathOrUrl?: string, urlExpression?: string }): RouteData {

    let path =  this.getPathName();
    let url = this.getUrl();
    let searchParams = this.getSearchParams();
    let search = this.getSearch();

    // console.log('pppppppppppppp', path,url,searchParams,search);
    // 요청 URL이 있을경우 해당 URL로 파싱
    if (config?.pathOrUrl) {
      const paths = config.pathOrUrl.split('?');
      search = paths[1] ? `?${paths[1]}`: '';
      searchParams = new URLSearchParams(search);
      const firstUrl = paths[0];
      if (ValidUtils.isUrl(firstUrl)) {
        path = new URL(firstUrl).pathname;
      } else {
        path = firstUrl;
      }
      url = config.pathOrUrl;
      // }
    }
    // console.log('url', url);
    const newVar: RouteData = {
      path: path,
      url: url,
      searchParams: searchParams,
      // 이렇게 하면 진짜 문자열이 변형이 될수 있다 따라서 그냥 문자열 자른 원본을넣어줘야한다
      // search: searchParams.size > 0 ? `?${searchParams.toString()}` : '',
      search: search,
      router: this
    };

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
    // newVar.router = this;
    // newVar.currentTarget = config?.currentTarget;
    return Object.freeze(newVar);
  }

  pushState(data: any, title: string | undefined, path: string, config?: ChangeStateConfig): ChangeStateResult {
    // noEventAndPublish가 true이면 마커 추가
    const stateData = config?.noEventAndPublish 
      ? { ...data, [ROUTER_NO_EVENT_MARKER]: true }
      : data;
    
    if (!config?.noEventAndPublish) {
      this.behaviorSubject.next({...this.getRouteData({pathOrUrl: path}), triggerPoint: 'start'});
    }
    
    this.config.window.history?.pushState(stateData, title ?? '', path);
    
    if (!config?.noEventAndPublish) {
      this.behaviorSubject.next({...this.getRouteData({pathOrUrl: path}), triggerPoint: 'end'});
    }
    
    return {data: stateData};
  }

  replaceState(data: any, title: string | undefined, path: string, config?: ChangeStateConfig): ChangeStateResult {
    // console.log('-re?->', data, title, path, config);
    // noEventAndPublish가 true이면 마커 추가
    const stateData = config?.noEventAndPublish 
      ? { ...data, [ROUTER_NO_EVENT_MARKER]: true }
      : data;
    
    if (!config?.noEventAndPublish) {
      this.behaviorSubject.next({...this.getRouteData({pathOrUrl: path}), triggerPoint: 'start'});
    }
    
    this.config.window.history?.replaceState(stateData, title ?? '', path);
    
    if (!config?.noEventAndPublish) {
      this.behaviorSubject.next({...this.getRouteData({pathOrUrl: path}), triggerPoint: 'end'});
    }
    
    return {data: stateData};
  }

  getData(): any {
    return this.config.window.history?.state;
  }

  getPathData(urlExpression: string, currentUrl = this.getPathName()): any {
    return Expression.Path.pathNameData(currentUrl, urlExpression);
  }

  back(config?: ChangeStateConfig): void {
    if (!config?.noEventAndPublish) {
      this.behaviorSubject.next({...this.getRouteData(), triggerPoint: 'start'});
    }
    this.config.window.history.back();
    // end부분은 constructor의 this.config.window.addEventListener('popstate')에서 받아서 처리된다
  }

  forward(config?: ChangeStateConfig): void {
    if (!config?.noEventAndPublish) {
      this.behaviorSubject.next({...this.getRouteData(), triggerPoint: 'start'});
    }
    this.config.window.history?.forward();
    // end부분은 constructor의 this.config.window.addEventListener('popstate')에서 받아서 처리된다
  }

  go(i: number, config?: ChangeStateConfig): void;
  async go(config: string | { path: RouteAction, state?: RouterMethodOptions, replace?: boolean, scrollToTop?: boolean }): Promise<void>;
  go(config: number | string | { path: RouteAction, state?: RouterMethodOptions, replace?: boolean, scrollToTop?: boolean }, changeStateConfig?: ChangeStateConfig): Promise<void> | void {
    if (typeof config === 'number') {
      if (!changeStateConfig?.noEventAndPublish) {
        this.behaviorSubject.next({...this.getRouteData(), triggerPoint: 'start'});
      }
      this.config.window.history?.go(config);
      // end부분은 constructor의 this.config.window.addEventListener('popstate')에서 받아서 처리된다
      return;
    }

    if (typeof config === 'string') {
      config = {path: config};
    }

    if (config?.replace) {
      this.replace(config.path, config.state);
    } else {
      this.push(config.path, config.state);
    }

    // 스크롤 제어 (기본값: true - 맨 위로 스크롤)
    if (config.scrollToTop !== false) {
      try {
        this._config.window?.scrollTo?.(0, 0);
      } catch (e) {
      }
    }
  }

  toUrl(data: RouteAction) {
    // console.log('toUrl', data);
    let targetPath: string;
    if (typeof data === 'string') {
      targetPath = data;
    } else {
      const tpath = data.path ?? this.getPathName();
      const s = data.searchParams ? ConvertUtils.toRawQueryString(data.searchParams, {valueEncodeURIComponent: true}) : '';
      // data.searchParams
      targetPath = `${tpath}${s.length > 0 ? '?' : ''}${s}`;
    }
    return targetPath;
  }


  abstract push(path: RouteAction, state?: RouterMethodOptions): void;

  abstract replace(path: RouteAction, state?: RouterMethodOptions): void;

  abstract pushDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void;

  abstract pushDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions): void;

  abstract pushAddSearchParam(params: [[string, string]], state?: RouterMethodOptions): void;

  abstract pushUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void;

  abstract replaceDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void;

  abstract replaceDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions): void;

  abstract replaceAddSearchParam(params: [[string, string]], state?: RouterMethodOptions): void;

  abstract replaceUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void;

  abstract getSearchParams(data?: { delete?: string[], append?: [[string, string]] }): URLSearchParams;

  abstract getHashSearchParams(data?: { delete?: string[], append?: [[string, string]] }): URLSearchParams;

  abstract getUrl(): string;

  abstract getHref(): string;

  abstract getPathName(): string;

  abstract getSearch(): string;

  reload(): void {
    const currentUrl = this.getUrl();
    this.replace(currentUrl);
  }
}
