import { ChangeStateResult, RouteAction, Router, RouterConfig, ChangeStateConfig, RouterMethodOptions } from './Router';
import { UrlUtils } from '@dooboostore/core/url/UrlUtils';

export class PathRouter extends Router {
  constructor(config: RouterConfig) {
    super(config);
  }

  getSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams {
    if (!this.config.window.document?.location?.href) {
      return new URLSearchParams();
    }

    const searchParams = (new URL(this.config.window.document.location?.href)).searchParams;
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }

  push(path: RouteAction, state?: RouterMethodOptions): ChangeStateResult {
    return super.pushState(state?.data, state?.title, this.toUrl(path), state?.config);
  }

  replace(path: RouteAction, state?: RouterMethodOptions): ChangeStateResult {
    return super.replaceState(state?.data, state?.title, this.toUrl(path), state?.config);
  }

  pushDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({delete: Array.isArray(name) ? name : [name]});
    this.push({searchParams: s}, state);
  }

  pushDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions) {
    const s = this.getHashSearchParams({delete: Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location?.pathname??'/'}${this.config.window.location?.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(state?.data, state?.title, href, state?.config);
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

  replaceDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({delete: Array.isArray(name) ? name : [name]});
    this.replace({searchParams: s}, state);
  }

  replaceDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions) {
    const s = this.getHashSearchParams({delete: Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location?.pathname??'/'}${this.config.window.location?.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.replaceState(state?.data, state?.title, href, state?.config);
  }

  replaceAddSearchParam(params:[[string, string]], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({append: params});
    this.replace({searchParams: s}, state);
  }

  replaceUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void {
    const s = this.getSearchParams();
    UrlUtils.upsertSearchParam(s, params);
    this.replace({searchParams: s}, state);
  }

  getUrl(): string {
    if (!this.config.window.document?.location?.href) {
      //if ((!this.config.window.document?.location?.href) || (this.config.window.document?.location?.href === 'about:blank')) {
      return '/';
    }
    const url = new URL(this.config.window.document.location?.href);
    return url.pathname + url.search;
  }

  getHref(): string {
    return this.config.window.location?.href??'/';
  }

  getPathName(): string {
    return this.config.window.location?.pathname??'/';
  }

  getSearch(): string {
    return this.config.window.location?.search??'';
  }

  getHashSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams {
    // http://local.com/#wow=222&wow=bb&z=2
    const searchParams = new URLSearchParams(this.config.window.location?.hash.slice(1)??'');
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }
}
