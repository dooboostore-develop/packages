import { DomRenderProxy } from '../DomRenderProxy';
import { EventManager } from '../events/EventManager';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
// import { ConvertUtils } from '@dooboostore/core-web/convert/ConvertUtils';
export type RouteData = {
  path: string;
  url: string;
  data?: any;
  searchParams: URLSearchParams;
  pathData?: any;
}
export type RouterConfig<T = any> = { rootObject?: T, window: Window, disableAttach?: boolean };

export abstract class Router {
  private attachCallbacks = new Set<(routeData: RouteData) => void>();
  private _config: RouterConfig<any>;

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

  addAttachCallback(callback: (routeData: RouteData) => void) {
    this.attachCallbacks.add(callback);
  }

  attach(): void {
    const proxy = (this.config.rootObject as any)._DomRender_proxy as DomRenderProxy<any>;
    if (proxy) {
      const key = `___${EventManager.ROUTER_VARNAME}`;
      proxy.render(key);
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
    const urls = currentUrl.split('?')[0].split('/');
    const urlExpressions = urlExpression.split('/');
    if (urls.length !== urlExpressions.length) {
      return;
    }
    const data: { [name: string]: string } = {};
    for (let i = 0; i < urlExpressions.length; i++) {
      const it = urlExpressions[i];
      // it = regexpMap.get(it) ?? it;

      const urlit = urls[i];
      // ex) {serialNo:[0-9]+} or {no}  ..
      const execResult = /^\{(.+)\}$/g.exec(it);
      if (!execResult) {
        if (it !== urlit) {
          return;
        }
        continue;
      }
      // regex check
      const [name, regex] = execResult[1].split(':'); // group1
      const regExp = RegExp(regex);
      if (regex && !regExp.test(urlit)) {
        return;
      }
      data[name] = urlit;
    }
    return data;
  }

  go(config: { path: string, data?: any, expression?: string, title?: string, disabledPopEvent?: boolean }): void {
    this.set(config.path, config.data, config.title);
    if (!this.config.disableAttach) {
      this.attach();
    }
    if (!config.disabledPopEvent) {
      this.dispatchPopStateEvent();
    }
  }

  abstract set(path: string, data?: any, title?: string): void;

  abstract getSearchParams(): URLSearchParams;

  abstract getUrl(): string;

  abstract getPath(): string;
}
