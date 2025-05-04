import { DomRenderProxy } from '../DomRenderProxy';
import { EventManager } from '../events/EventManager';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;
import { Expression } from '@dooboostore/core/expression/Expression';
// import { ConvertUtils } from '@dooboostore/core-web/convert/ConvertUtils';
export type RouteData = {
  path: string;
  url: string;
  data?: any;
  searchParams: URLSearchParams;
  pathData?: any;
}
export type RouterConfig<T = any> = { rootObject?: T, window: Window, disableAttach?: boolean };

export abstract class Router<T=any> {
  private attachCallbacks = new Set<(routeData: RouteData) => void>();
  private _config: RouterConfig<T>;

  get searchParamObject() {
    return ConvertUtils.toObject(this.getSearchParams());
  }


  get config() {
    return this._config;
  }

  constructor(config: RouterConfig<any>) {
    this._config = config;
    // this.go({path:this.getUrl()});
  }

  public getSearchFirstParamsObject<T = any>()  {
    return ConvertUtils.toObject<T>(this.getSearchParams(),{firstValue: true});
  }
  public getHashSearchFirstParamsObject<T = any>()  {
    return ConvertUtils.toObject<T>(this.getHashSearchParams(),{firstValue: true});
  }

  addAttachCallback(callback: (routeData: RouteData) => void) {
    this.attachCallbacks.add(callback);
  }

  async attach(): Promise<void> {
    const proxy = (this.config.rootObject as any)._DomRender_proxy as DomRenderProxy<any>;
    if (proxy) {
      const key = `___${EventManager.ROUTER_VARNAME}`;
      await proxy.render(key);
    }
    this.attachCallbacks.forEach(it => {
      it(this.getRouteData());
    });
  }

  testRegexp(regexp: string): boolean {
    const b = RegExp(regexp).test(this.getPath());
    return b;
  }

  test(urlExpression: string): boolean {
    if (this.getPathData(urlExpression)) {
      return true;
    } else {
      return false;
    }
  }

  getRouteData(urlExpression?: string): RouteData {
    const newVar = {
      path: this.getPath(),
      url: this.getUrl(),
      searchParams: this.getSearchParams()
    } as RouteData;

    const data = this.getData();
    if (data) {
      newVar.data = data;
    }
    if (urlExpression) {
      const data = this.getPathData(urlExpression);
      if (data) {
        newVar.pathData = data;
      }
    }
    return Object.freeze(newVar);
  }

  pushState(data: any, title: string, path: string) {
    this.config.window.history.pushState(data, title, path);
  }

  dispatchPopStateEvent() {
    this.config.window.dispatchEvent(new Event('popstate'));
  }

  reload() {
    this.config.window.dispatchEvent(new Event('popstate'));
  }

  getData(): any {
    return this.config.window.history.state;
  }

  getPathData(urlExpression: string, currentUrl = this.getPath()): any {
    return Expression.Path.pathNameData(currentUrl, urlExpression);
  }

  async go(config: { path: string, data?: any, expression?: string, title?: string, disabledPopEvent?: boolean }): Promise<void> {
    this.set(config.path, config.data, config.title);
    if (!this.config.disableAttach) {
      await this.attach();
    }
    if (!config.disabledPopEvent) {
      this.dispatchPopStateEvent();
    }
  }

  abstract set(path: string | {path?: string, searchParams: ToURLSearchParamsParams}, data?: any, title?: string): void;

  abstract setDeleteSearchParam(name: string, data?: any, title?: string): void;

  abstract setAddSearchParam(name: string, value: string, data?: any, title?: string): void;

  abstract getSearchParams(): URLSearchParams;

  abstract getHashSearchParams(): URLSearchParams;

  abstract getUrl(): string;

  abstract getPath(): string;
}
