import { ChangeStateConfig, ChangeStateResult, RouteAction, Router, RouterConfig, RouterMethodOptions } from '@dooboostore/core-web';
import { UrlUtils } from '@dooboostore/core';

export class ElementRouter extends Router {
  private _history: { url: string; data: any; title?: string }[] = [];
  private _currentIndex = -1;

  constructor(config: RouterConfig) {
    super(config);
  }

  // Override pushState to manage internal history
  pushState(data: any, title: string | undefined, path: string, config?: ChangeStateConfig): ChangeStateResult {
    const behaviorSubject = (this as any).behaviorSubject;
    if (!config?.noEventAndPublish && behaviorSubject) {
      behaviorSubject.next({ ...this.getRouteData({ pathOrUrl: path }), triggerPoint: 'start' });
    }

    // Ensure _history is initialized (defense for super calls)
    if (!this._history) this._history = [];

    this._history = this._history.slice(0, this._currentIndex + 1);
    this._history.push({ url: path, data, title });
    this._currentIndex++;

    if (!config?.noEventAndPublish && behaviorSubject) {
      behaviorSubject.next({ ...this.getRouteData({ pathOrUrl: path }), triggerPoint: 'end' });
    }
    return { data };
  }

  // Override replaceState to manage internal history
  replaceState(data: any, title: string | undefined, path: string, config?: ChangeStateConfig): ChangeStateResult {
    const behaviorSubject = (this as any).behaviorSubject;
    if (!config?.noEventAndPublish && behaviorSubject) {
      behaviorSubject.next({ ...this.getRouteData({ pathOrUrl: path }), triggerPoint: 'start' });
    }

    if (!this._history) this._history = [];
    if (this._currentIndex === -1) {
      this._history.push({ url: path, data, title });
      this._currentIndex = 0;
    } else {
      this._history[this._currentIndex] = { url: path, data, title };
    }

    if (!config?.noEventAndPublish && behaviorSubject) {
      behaviorSubject.next({ ...this.getRouteData({ pathOrUrl: path }), triggerPoint: 'end' });
    }
    return { data };
  }

  push(path: RouteAction, state?: RouterMethodOptions): void {
    this.pushState(state?.data, state?.title, this.toUrl(path), state?.config);
  }

  replace(path: RouteAction, state?: RouterMethodOptions): void {
    this.replaceState(state?.data, state?.title, this.toUrl(path), state?.config);
  }

  back(config?: ChangeStateConfig): void {
    if (this._currentIndex > 0) {
      this.go(-1, config);
    }
  }

  forward(config?: ChangeStateConfig): void {
    if (this._currentIndex < this._history.length - 1) {
      this.go(1, config);
    }
  }

  go(i: number, config?: ChangeStateConfig): void;
  async go(config: string | { path: RouteAction; state?: RouterMethodOptions; replace?: boolean; scrollToTop?: boolean }): Promise<void>;
  go(config: number | string | { path: RouteAction; state?: RouterMethodOptions; replace?: boolean; scrollToTop?: boolean }, changeStateConfig?: ChangeStateConfig): Promise<void> | void {
    if (typeof config === 'number') {
      const targetIndex = this._currentIndex + config;
      if (this._history && targetIndex >= 0 && targetIndex < this._history.length) {
        const behaviorSubject = (this as any).behaviorSubject;
        if (!changeStateConfig?.noEventAndPublish && behaviorSubject) {
          behaviorSubject.next({ ...this.getRouteData(), triggerPoint: 'start' });
        }

        this._currentIndex = targetIndex;
        const entry = this._history[this._currentIndex];

        if (!changeStateConfig?.noEventAndPublish && behaviorSubject) {
          behaviorSubject.next({ ...this.getRouteData({ pathOrUrl: entry.url }), triggerPoint: 'end' });
        }
      }
      return;
    }
    return super.go(config as any, changeStateConfig);
  }

  getData(): any {
    return this._history?.[this._currentIndex]?.data;
  }

  getUrl(): string {
    return this._history?.[this._currentIndex]?.url ?? this.config?.firstUrl ?? '/';
  }

  getHref(): string {
    return this.getUrl();
  }

  getPathName(): string {
    return this.getUrl().split('?')[0];
  }

  getSearch(): string {
    const parts = this.getUrl().split('?');
    return parts[1] ? `?${parts[1]}` : '';
  }

  getSearchParams(data?: { delete?: string[]; append?: [[string, string]] }): URLSearchParams {
    const search = this.getSearch();
    const searchParams = new URLSearchParams(search);
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }

  getHashSearchParams(data?: { delete?: string[]; append?: [[string, string]] }): URLSearchParams {
    const url = this.getUrl();
    const hashIdx = url.indexOf('#');
    const hash = hashIdx !== -1 ? url.slice(hashIdx + 1) : '';
    const searchParams = new URLSearchParams(hash);
    return UrlUtils.manipulateSearchParams(searchParams, data);
  }

  pushAddSearchParam(params: [[string, string]], state: RouterMethodOptions | undefined): void {
    const s = this.getSearchParams({ append: params });
    this.push({ searchParams: s }, state);
  }

  pushDeleteHashSearchParam(name: string | string[], state: RouterMethodOptions | undefined): void {
    const s = this.getHashSearchParams({ delete: Array.isArray(name) ? name : [name] });
    const url = this.getUrl().split('#')[0];
    const size = Array.from(s.entries()).length;
    this.push(url + (size > 0 ? '#' + s.toString() : ''), state);
  }

  pushDeleteSearchParam(name: string | string[], state: RouterMethodOptions | undefined): void {
    const s = this.getSearchParams({ delete: Array.isArray(name) ? name : [name] });
    this.push({ searchParams: s }, state);
  }

  pushUpsertSearchParam(params: Record<string, string | string[]>, state: RouterMethodOptions | undefined): void {
    const s = this.getSearchParams();
    UrlUtils.upsertSearchParam(s, params);
    this.push({ searchParams: s }, state);
  }

  replaceAddSearchParam(params: [[string, string]], state: RouterMethodOptions | undefined): void {
    const s = this.getSearchParams({ append: params });
    this.replace({ searchParams: s }, state);
  }

  replaceDeleteHashSearchParam(name: string | string[], state: RouterMethodOptions | undefined): void {
    const s = this.getHashSearchParams({ delete: Array.isArray(name) ? name : [name] });
    const url = this.getUrl().split('#')[0];
    const size = Array.from(s.entries()).length;
    this.replace(url + (size > 0 ? '#' + s.toString() : ''), state);
  }

  replaceDeleteSearchParam(name: string | string[], state: RouterMethodOptions | undefined): void {
    const s = this.getSearchParams({ delete: Array.isArray(name) ? name : [name] });
    this.replace({ searchParams: s }, state);
  }

  replaceUpsertSearchParam(params: Record<string, string | string[]>, state: RouterMethodOptions | undefined): void {
    const s = this.getSearchParamObject();
    UrlUtils.upsertSearchParam(s as any, params);
    this.replace({ searchParams: s as any }, state);
  }
}
