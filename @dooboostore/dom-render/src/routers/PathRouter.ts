import { Router, RouterConfig } from './Router';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;

export class PathRouter extends Router {
  constructor(config: RouterConfig) {
    super(config);
  }

  getSearchParams(): URLSearchParams {
    return (new URL(this.config.window.document.location.href)).searchParams;
  }

  push(path: string | { path?: string, searchParams: ToURLSearchParamsParams }, data?: any, title: string = ''): void {
    let targetPath: string;
    if (typeof path === 'string') {
      targetPath = path;
    } else {
      const tpath = path.path ?? this.getPath();
      const s = ConvertUtils.toURLSearchParams(path.searchParams).toString();
      targetPath = `${tpath}${s.length > 0 ? '?' : ''}${s}`;
    }
    super.pushState(data, title, targetPath);
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
