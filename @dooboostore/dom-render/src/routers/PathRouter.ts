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

  set(path: string | { path?: string, searchParams: ToURLSearchParamsParams }, data?: any, title: string = ''): void {
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

  setDeleteSearchParam(name: string, data?: any, title?: string): void {
    const s = this.getSearchParams();
    s.delete(name);
    this.set({searchParams: s}, data, title);
  }

  setAddSearchParam(name: string, value: string, data?: any, title?: string): void {
    const s = this.getSearchParams();
    s.append(name, value);
    this.set({searchParams: s}, data, title);
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
