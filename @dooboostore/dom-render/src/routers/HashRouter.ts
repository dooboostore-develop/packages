import { RouteAction, Router, RouterConfig } from './Router';
import { LocationUtils } from '@dooboostore/core-web/location/LocationUtils';


export class HashRouter extends Router {

  constructor(config: RouterConfig) {
    super(config);
  }

  pushDeleteHashSearchParam(name: string, data: any, title: string | undefined): void {
    const s = this.getHashSearchParams();
    s.delete(name);
    const size = Array.from(s.entries()).length;
    const href = `${this.config.window.location.pathname}${this.config.window.location.search}${size > 0 ? '#' + s.toString() : ''}`;
    super.pushState(data, title, href);
  }

  getSearchParams(): URLSearchParams {
    const hashSearch = LocationUtils.hashSearch(this.config.window);
    if (hashSearch) {
      return new URLSearchParams(hashSearch);
    } else {
      return (new URL(this.config.window.document.location.href)).searchParams;
    }
  }

  push(path: RouteAction, data?: any, title: string = ''): void {
    if (path === '/') {
      super.pushState(data, title, '/');
    } else {
      super.pushState(data, title, `#${this.toUrl(path)}`);
    }
  }

  replace(path: RouteAction, data?: any, title?: string) {
    if (path === '/') {
      super.replaceState(data, title, '/');
    } else {
      super.replaceState(data, title, `#${this.toUrl(path)}`);
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
