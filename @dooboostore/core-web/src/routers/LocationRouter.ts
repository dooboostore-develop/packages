import { ChangeStateResult, RouteAction, Router, RouterConfig, RouterMethodOptions } from './Router';
import { UrlUtils } from '@dooboostore/core';

export class LocationRouter extends Router {
  constructor(config: RouterConfig) {
    super(config);
  }

  getSearchParams(data?: { delete?: string[]; append?: [[string, string]] }): URLSearchParams {
    if (!this.config.window.document?.location?.href) {
      return new URLSearchParams();
    }
    const searchParams = new URL(this.config.window.document.location.href).searchParams;
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }

  push(path: RouteAction, state?: RouterMethodOptions): void {
    const url = this.toUrl(path);
    this.config.window.location.href = url;
  }

  replace(path: RouteAction, state?: RouterMethodOptions): void {
    const url = this.toUrl(path);
    this.config.window.location.replace(url);
  }

  pushDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({ delete: Array.isArray(name) ? name : [name] });
    this.push({ searchParams: s }, state);
  }

  pushDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getHashSearchParams({ delete: Array.isArray(name) ? name : [name] });
    const url = new URL(this.config.window.location.href);
    url.hash = s.toString() ? '?' + s.toString() : '';
    this.config.window.location.assign(url.href);
  }

  pushAddSearchParam(params: [[string, string]], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({ append: params });
    this.push({ searchParams: s }, state);
  }

  pushUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void {
    const s = this.getSearchParams();
    UrlUtils.upsertSearchParam(s, params);
    this.push({ searchParams: s }, state);
  }

  replaceDeleteSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({ delete: Array.isArray(name) ? name : [name] });
    this.replace({ searchParams: s }, state);
  }

  replaceDeleteHashSearchParam(name: string | string[], state?: RouterMethodOptions): void {
    const s = this.getHashSearchParams({ delete: Array.isArray(name) ? name : [name] });
    const url = new URL(this.config.window.location.href);
    url.hash = s.toString() ? '?' + s.toString() : '';
    this.config.window.location.replace(url.href);
  }

  replaceAddSearchParam(params: [[string, string]], state?: RouterMethodOptions): void {
    const s = this.getSearchParams({ append: params });
    this.replace({ searchParams: s }, state);
  }

  replaceUpsertSearchParam(params: Record<string, string | string[]>, state?: RouterMethodOptions): void {
    const s = this.getSearchParams();
    UrlUtils.upsertSearchParam(s, params);
    this.replace({ searchParams: s }, state);
  }

  getUrl(): string {
    if (!this.config.window.document?.location?.href) {
      return '/';
    }
    const url = new URL(this.config.window.document.location.href);
    return url.pathname + url.search;
  }

  getHref(): string {
    return this.config.window.location?.href ?? '/';
  }

  getPathName(): string {
    return this.config.window.location?.pathname ?? '/';
  }

  getSearch(): string {
    return this.config.window.location?.search ?? '';
  }

  getHashSearchParams(data?: { delete?: string[]; append?: [[string, string]] }): URLSearchParams {
    const hash = this.config.window.location?.hash ?? '';
    const queryIndex = hash.indexOf('?');
    const searchParams = queryIndex !== -1 ? new URLSearchParams(hash.slice(queryIndex + 1)) : new URLSearchParams();
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }
}
