import { RouteAction, Router, RouterConfig } from './Router';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;

export class PathRouter extends Router {
  constructor(config: RouterConfig) {
    super(config);
  }

  getSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams {
    const searchParams =  (new URL(this.config.window.document.location.href)).searchParams;
    data?.delete?.forEach(it => {
      searchParams.delete(it);
    })

    data?.append?.forEach(it => {
      searchParams.append(it[0], it[1]);
    })
    return searchParams;

  }

  push(path: RouteAction, data?: any, title: string = ''): void {
    // console.log('pppppp?')
    super.pushState(data, title, this.toUrl(path));
  }

  replace(path: RouteAction, data?: any, title: string = ''): void {
    super.replaceState(data, title, this.toUrl(path));
  }

  pushDeleteSearchParam(name: string, data?: any, title?: string): void {
    const s = this.getSearchParams({delete: [name]});
    this.push({searchParams: s}, data, title);
  }

  pushDeleteHashSearchParam(name: string, data?: any, title?: string) {
    const s = this.getHashSearchParams({delete: [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(data, title, href);
  }

  pushAddSearchParam(params:[[string, string]], data?: any, title?: string): void {
    const s = this.getSearchParams({append: params});
    this.push({searchParams: s}, data, title);
  }
  replaceDeleteSearchParam(name: string | string[], data?: any, title?: string): void {
    const s = this.getSearchParams({delete: Array.isArray(name) ? name : [name]});
    this.replace({searchParams: s}, data, title);
  }

  replaceDeleteHashSearchParam(name: string | string[], data?: any, title?: string) {
    const s = this.getHashSearchParams({delete: Array.isArray(name) ? name : [name]});
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.replaceState(data, title, href);
  }

  replaceAddSearchParam(params:[[string, string]], data?: any, title?: string): void {
    const s = this.getSearchParams({append: params});
    this.replace({searchParams: s}, data, title);
  }


  getUrl(): string {
    const url = new URL(this.config.window.document.location.href);
    return url.pathname + url.search;
  }

  getPath(): string {
    return this.config.window.location.pathname;
  }

  getHashSearchParams(data?:{delete?:string[], append?:[[string, string]]}): URLSearchParams {
    // http://local.com/#wow=222&wow=bb&z=2
    const searchParams =  new URLSearchParams(this.config.window.location.hash.slice(1));

    data?.delete?.forEach(it => {
      searchParams.delete(it);
    })

    data?.append?.forEach(it => {
      searchParams.append(it[0], it[1]);
    })
    return searchParams;

    // return undefined;
  }


}
