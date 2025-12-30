import { ChangeStateResult, RouteAction, Router, RouterConfig, ChangeStateConfig, RouterMethodOptions } from './Router';
import { LocationUtils } from '@dooboostore/core-web/location/LocationUtils';
import { UrlUtils } from '@dooboostore/core/url/UrlUtils';


export class HashRouter extends Router {

  constructor(config: RouterConfig) {
    super(config);
  }


  getSearchParams(data?: { delete?: string[], append?: [[string, string]] }): URLSearchParams {
    const hashSearch = LocationUtils.hashSearch(this.config.window);
    const searchParams = hashSearch ? new URLSearchParams(hashSearch) : (new URL(this.config.window.document.location.href)).searchParams;
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }

  push(path: RouteAction, state?: RouterMethodOptions): ChangeStateResult {
    if (path === '/') {
      return super.pushState(state?.data, state?.title, '/', state?.config);
    } else {
      return super.pushState(state?.data, state?.title, `#${this.toUrl(path)}`, state?.config);
    }
  }

  replace(path: RouteAction, state?: RouterMethodOptions):ChangeStateResult {
    if (path === '/') {
      return super.replaceState(state?.data, state?.title, '/', state?.config);
    } else {
      return super.replaceState(state?.data, state?.title, `#${this.toUrl(path)}`, state?.config);
    }
  }

  setDeleteHashSearchParam(name: string, state?: RouterMethodOptions) {
  }

  pushDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getHashSearchParams({delete:Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(state?.data, state?.title, href, state?.config);
  }

  pushDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({delete:Array.isArray(name) ? name : [name]});
    this.push({searchParams: s}, state);
  }

  pushAddSearchParam(params:[[string, string]], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({append: params});
    this.push({searchParams: s}, state);
  }

  pushUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void {
    const s = this.getSearchParams();
    UrlUtils.upsertSearchParam(s, params);
    this.push({searchParams: s}, state);
  }

  replaceDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getHashSearchParams({delete: Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(state?.data, state?.title, href, state?.config);
  }

  replaceDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({delete: Array.isArray(name) ? name : [name]});
    this.push({searchParams: s}, state);
  }

  replaceAddSearchParam(params:[[string, string]], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({append: params});
    this.push({searchParams: s}, state);
  }

  replaceUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void {
    const s = this.getSearchParams();
    UrlUtils.upsertSearchParam(s, params);
    this.replace({searchParams: s}, state);
  }

  getUrl(): string {
    return LocationUtils.hash(this.config.window) || '/';
  }

  getHref(): string {
    return this.config.window.location.href;
  }

  getPathName(): string {
    return LocationUtils.hashPath(this.config.window) || '/';
  }

  getSearch(): string {
    return LocationUtils.hashSearch(this.config.window);
  }

  getHashSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams {
    const hash = this.config.window.location.hash;
    const queryIndex = hash.indexOf('?');
    const searchParams = (queryIndex !== -1) ? new URLSearchParams(hash.slice(queryIndex + 1)) :  new URLSearchParams();
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }

}
