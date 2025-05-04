import { RouteAction, Router, RouterConfig } from './Router';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;

export class PathRouter extends Router {
  constructor(config: RouterConfig) {
    super(config);
  }

  getSearchParams(): URLSearchParams {
    return (new URL(this.config.window.document.location.href)).searchParams;
  }

  push(path: RouteAction, data?: any, title: string = ''): void {
    super.pushState(data, title, this.toUrl(path));
  }

  replace(path: RouteAction, data?: any, title: string = ''): void {
    super.replaceState(data, title, this.toUrl(path));
  }

  pushDeleteSearchParam(name: string, data?: any, title?: string): void {
    const s = this.getSearchParams();
    s.delete(name);
    this.push({searchParams: s}, data, title);
  }

  pushDeleteHashSearchParam(name: string, data?: any, title?: string) {
    const s = this.getHashSearchParams();
    s.delete(name);
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(data, title, href);
  }

  pushAddSearchParam(name: string, value: string, data?: any, title?: string): void {
    const s = this.getSearchParams();
    s.append(name, value);
    this.push({searchParams: s}, data, title);
  }


  getUrl(): string {
    const url = new URL(this.config.window.document.location.href);
    return url.pathname + url.search;
  }

  getPath(): string {
    return this.config.window.location.pathname;
  }

  getHashSearchParams(): URLSearchParams {
    // http://local.com/#wow=222&wow=bb&z=2
    return new URLSearchParams(this.config.window.location.hash.slice(1));
    // return undefined;
  }


}
