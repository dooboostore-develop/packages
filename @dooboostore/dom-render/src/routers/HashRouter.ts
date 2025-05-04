import { Router, RouterConfig } from './Router';
import { LocationUtils } from '@dooboostore/core-web/location/LocationUtils';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import ToURLSearchParamsParams = ConvertUtils.ToURLSearchParamsParams;


export class HashRouter extends Router {

  constructor(config: RouterConfig) {
    super(config);
  }

  getSearchParams(): URLSearchParams {
    const hashSearch = LocationUtils.hashSearch(this.config.window);
    if (hashSearch) {
      return new URLSearchParams(hashSearch);
    } else {
      return (new URL(this.config.window.document.location.href)).searchParams;
    }
  }

  push(path: string | { path?: string, searchParams: ToURLSearchParamsParams }, data?: any, title: string = ''): void {
    if (path === '/') {
      super.pushState(data, title, '/');
    } else {
      let targetPath: string;
      if (typeof path === 'string') {
        targetPath = path;
        // super.pushState(data, title, path);
      } else {
        const tpath = path.path ?? this.getPath();
        const s = ConvertUtils.toURLSearchParams(path.searchParams).toString();
        targetPath = `${tpath}${s.length > 0 ? '?' : ''}${s}`;
      }
      super.pushState(data, title, `#${targetPath}`);
    }
  }

  pushDeleteSearchParam(name: string, data?: any, title?: string): void {
    const s = this.getSearchParams();
    s.delete(name);
    this.push({searchParams: s}, data, title);
  }

  setDeleteHashSearchParam(name: string, data?: any, title?: string) {
  }

  pushAddSearchParam(name: string, value: string, data?: any, title?: string): void {
    const s = this.getSearchParams();
    s.append(name, value);
    this.push({searchParams: s}, data, title);
  }

  getUrl(): string {
    return LocationUtils.hash(this.config.window) || '/';
  }

  getPath(): string {
    return LocationUtils.hashPath(this.config.window) || '/';
  }

  getHashSearchParams(): URLSearchParams {
    const hash = this.config.window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      return new URLSearchParams(hash.slice(queryIndex + 1));
    }
    return new URLSearchParams();
  }

}
