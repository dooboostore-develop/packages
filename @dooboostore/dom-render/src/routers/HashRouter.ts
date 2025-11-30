import { ChangeStateResult, RouteAction, Router, RouterConfig } from './Router';
import { LocationUtils } from '@dooboostore/core-web/location/LocationUtils';


export class HashRouter extends Router {

  constructor(config: RouterConfig) {
    super(config);
  }


  getSearchParams(data?: { delete?: string[], append?: [[string, string]] }): URLSearchParams {
    const hashSearch = LocationUtils.hashSearch(this.config.window);
    const searchParams = hashSearch ? new URLSearchParams(hashSearch) : (new URL(this.config.window.document.location.href)).searchParams;


    data?.delete?.forEach(it => {
      searchParams.delete(it);
    })

    data?.append?.forEach(it => {
      searchParams.append(it[0], it[1]);
    })
    return searchParams;
  }

  push(path: RouteAction, data?: any, title: string = ''): ChangeStateResult {
    if (path === '/') {
      return super.pushState(data, title, '/');
    } else {
      return super.pushState(data, title, `#${this.toUrl(path)}`);
    }
  }

  replace(path: RouteAction, data?: any, title?: string):ChangeStateResult {
    if (path === '/') {
      return super.replaceState(data, title, '/');
    } else {
      return super.replaceState(data, title, `#${this.toUrl(path)}`);
    }
  }

  setDeleteHashSearchParam(name: string, data?: any, title?: string) {
  }

  pushDeleteHashSearchParam(name: string | string[], data: any, title: string | undefined): void {
    const s = this.getHashSearchParams({delete:Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(data, title, href);
  }

  pushDeleteSearchParam(name: string | string[], data?: any, title?: string): void {
    const s = this.getSearchParams({delete:Array.isArray(name) ? name : [name]});
    this.push({searchParams: s}, data, title);
  }

  pushAddSearchParam(params:[[string, string]], data?: any, title?: string): void {
    const s = this.getSearchParams({append: params});
    this.push({searchParams: s}, data, title);
  }

  replaceDeleteHashSearchParam(name: string | string[], data: any, title: string | undefined): void {
    const s = this.getHashSearchParams({delete: Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(data, title, href);
  }

  replaceDeleteSearchParam(name: string | string[], data?: any, title?: string): void {
    const s = this.getSearchParams({delete: Array.isArray(name) ? name : [name]});
    this.push({searchParams: s}, data, title);
  }

  replaceAddSearchParam(params:[[string, string]], data?: any, title?: string): void {
    const s = this.getSearchParams({append: params});
    this.push({searchParams: s}, data, title);
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
    const searchParams = (queryIndex !== -1) ? new URLSearchParams(hash.slice(queryIndex + 1)) :  new URLSearchParams();;
    data?.delete?.forEach(it => {
      searchParams.delete(it);
    })
    data?.append?.forEach(it => {
      searchParams.append(it[0], it[1]);
    })
    return searchParams;

  }

}
