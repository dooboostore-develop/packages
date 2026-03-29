import { SwcAppInterface, HostSet, HelperSet, HelperHostSet } from '../types';
import {getElementConfig} from "../decorators";

export const SWC_NOT_FOUND = Symbol('SWC_NOT_FOUND');

export namespace SwcUtils {
  export const getHelperSet = (win: Window): HelperSet => {
    const doc: Document = win.document;
    return {
      $d: doc,
      $w: win,
      $q: (sel: string, root?: Element | Document | ShadowRoot) => (root ?? doc).querySelector(sel),
      $qa: (sel: string, root?: Element | Document | ShadowRoot) => Array.from((root ?? doc).querySelectorAll(sel)) as HTMLElement[],
      $qi: (id: string, root?: Document | ShadowRoot) => (root ?? doc).getElementById(id) as HTMLElement
    } as const;
  };

  export const getHelperAndHostSet = (win: Window, el: HTMLElement): HelperHostSet => {
    const helperSet = getHelperSet(win);
    const hostSet = getHostSet(el);
    return {
      ...helperSet,
      ...hostSet
    };
  };

  export const getValueByPath = (obj: any, path: string, rootName: string) => {
    if (!obj || !path) return SWC_NOT_FOUND;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return SWC_NOT_FOUND;
      current = current[part];
    }
    return current;
  };

  /**
   * Finds the nearest logical SWC host for an element.
   * Checks __swc_host property first, then climbs the DOM tree.
   */
  export const findNearestSwcHost = (el: HTMLElement | Node): HTMLElement | undefined => {
    if ((el as any).__swc_host) return (el as any).__swc_host;

    let current: any = el.parentElement || (el.getRootNode?.() as any)?.host;
    const doc = el.ownerDocument;
    const win = doc?.defaultView || ((typeof window !== 'undefined' ? window : undefined) as any);
    while (current && current !== doc && current !== win) {
      if (current.__swc_host) return current.__swc_host;
      if (getElementConfig(current)) return current as HTMLElement;
      current = current.parentElement || (current.getRootNode?.() as any)?.host;
    }
    return undefined;
  };

  /**
   * Returns all SWC ancestors (excluding self) in [root, ..., parent] order.
   */
  export const findAllSwcHosts = (el: HTMLElement | Node): HTMLElement[] => {
    const hosts: HTMLElement[] = [];
    let current = findNearestSwcHost(el);
    while (current) {
      hosts.push(current);
      // To find the next ancestor, we must start searching from the PARENT of the found host
      current = findNearestSwcHost(current);
    }
    return hosts.reverse();
  };

  export const getHosts = (el: HTMLElement): HTMLElement[] => {
    const ancestors = findAllSwcHosts(el);
    if (getElementConfig(el)) return [...ancestors, el];
    return ancestors;
  };

  export const getHost = (el: HTMLElement): HTMLElement | undefined => {
    if (getElementConfig(el)) return el;
    return findNearestSwcHost(el);
  };

  export const getAppHosts = (el: HTMLElement): SwcAppInterface[] => {
    const hosts = getHosts(el);
    return hosts.filter(host => host.tagName.toLowerCase() === 'swc-app' || host.getAttribute('is')?.startsWith('swc-app-')) as SwcAppInterface[];
  };

  export const getAppHost = (el: HTMLElement): SwcAppInterface | undefined => {
    const appHosts = getAppHosts(el);
    const appHostsWithoutSelf = appHosts.filter(h => h !== el);
    return appHostsWithoutSelf.length > 0 ? appHostsWithoutSelf[appHostsWithoutSelf.length - 1] : undefined;
  };

  export const getHostSet = (el: HTMLElement): HostSet => {
    const isSwc = !!getElementConfig(el);
    const ancestors = findAllSwcHosts(el); // [root, ..., parent]

    let $host: HTMLElement;
    let $parentHost: HTMLElement | null;

    if (isSwc) {
      $host = el;
      $parentHost = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;
    } else {
      $host = ancestors.length > 0 ? ancestors[ancestors.length - 1] : el;
      $parentHost = ancestors.length > 1 ? ancestors[ancestors.length - 2] : null;
    }

    const $hosts = isSwc ? [...ancestors, el] : ancestors;
    const $firstHost = $hosts.length > 0 ? $hosts[0] : null;

    // Collect loop contexts
    const loopContext: Record<string, any> = {};
    let curr: any = el;
    const rootEl = el.ownerDocument?.documentElement;
    while (curr && curr !== rootEl) {
      if (curr.__swc_loop_context) {
        Object.assign(loopContext, curr.__swc_loop_context);
      }
      curr = curr.parentElement || (curr.getRootNode() as any).host;
    }

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
      $lastAppHost: $appHost,
      ...loopContext
    } as any;
  };
}
