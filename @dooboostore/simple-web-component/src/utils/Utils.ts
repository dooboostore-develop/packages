import { SwcAppInterface, HostSet } from '../types';
import { getElementConfig } from '../decorators/elementDefine';

export const SWC_NOT_FOUND = Symbol('SWC_NOT_FOUND');

export class SwcUtils {
  static getValueByPath(obj: any, path: string, rootName: string) {
    if (!obj || !path) return SWC_NOT_FOUND;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return SWC_NOT_FOUND;
      current = current[part];
    }
    return current;
  }

  static findNearestSwcHost(el: HTMLElement | Node): HTMLElement | undefined {
    let current: any = el instanceof Node && !(el instanceof HTMLElement) ? (el as any).host : el;
    current = current?.parentElement || (current?.getRootNode() as any)?.host;

    while (current) {
      if (getElementConfig(current)) return current as HTMLElement;
      current = current.parentElement || (current?.getRootNode() as any)?.host;
    }
    return undefined;
  }

  /**
   * Returns all SWC ancestors (excluding self) in [root, ..., parent] order.
   */
  static findAllSwcHosts(el: HTMLElement | Node): HTMLElement[] {
    const hosts: HTMLElement[] = [];
    let current = this.findNearestSwcHost(el);
    while (current) {
      hosts.push(current);
      current = this.findNearestSwcHost(current);
    }
    return hosts.reverse();
  }

  static getHosts(el: HTMLElement): HTMLElement[] {
    return [...this.findAllSwcHosts(el), el];
  }

  static getHost(el: HTMLElement): HTMLElement | undefined {
    return el;
  }

  static getAppHosts(el: HTMLElement): SwcAppInterface[] {
    const hosts = this.getHosts(el);
    return hosts.filter(host => host.tagName.toLowerCase() === 'swc-app' || host.getAttribute('is')?.startsWith('swc-app-')) as SwcAppInterface[];
  }

  static getAppHost(el: HTMLElement): SwcAppInterface | undefined {
    const appHosts = this.getAppHosts(el);
    const appHostsWithoutSelf = appHosts.filter(h => h !== el);
    // Nearest app host is the last one in [root, ..., parent]
    return appHostsWithoutSelf.length > 0 ? appHostsWithoutSelf[appHostsWithoutSelf.length - 1] : undefined;
  }

  static getHostSet(el: HTMLElement): HostSet {
    const ancestors = this.findAllSwcHosts(el); // [root, ..., parent]
    const $host = el;
    const $hosts = [...ancestors, $host]; // [root, ..., parent, self]
    const $parentHost = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;
    const $firstHost = ancestors.length > 0 ? ancestors[0] : null;

    const $appHosts = $hosts.filter(h => h.tagName.toLowerCase() === 'swc-app' || h.getAttribute('is')?.startsWith('swc-app-')) as SwcAppInterface[];
    const $appHost = $appHosts.length > 0 ? ($appHosts[$appHosts.length - 1] === el ? ($appHosts.length > 1 ? $appHosts[$appHosts.length - 2] : null) : $appHosts[$appHosts.length - 1]) : null;
    const $firstAppHost = $appHosts.length > 0 ? $appHosts[0] : null;

    return {
      $host,
      $parentHost,
      $hosts,
      $firstHost,
      $lastHost: $parentHost,
      $appHost,
      $appHosts,
      $firstAppHost,
      $lastAppHost: $appHost
    };
  }
}
