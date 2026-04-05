import { SwcAppInterface, HostSet, HelperSet, HelperHostSet } from '../types';
import {getElementConfig} from "../decorators";
import { getExpression, ExpressionResult, GetExpressionConfig, GetExpressionResult } from '@dooboostore/core';

export const SWC_NOT_FOUND = Symbol.for('simple-web-component:not-found');

// DOM Creation Utilities
export const htmlFragment = (html: string, doc?: Document): DocumentFragment => {
  const d = doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const template = d.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
};

export const textNode = (text: string | any, doc?: Document): Text => {
  const d = doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  return d.createTextNode(text !== undefined && text !== null ? String(text) : '');
};

export const commentNode = (comment: string | any, doc?: Document): Comment => {
  const d = doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  return d.createComment(comment !== undefined && comment !== null ? String(comment) : '');
};

export const createElement = <T extends HTMLElement>(
  tagName: string,
  options?: { html?: string; attrs?: Record<string, any>; doc?: Document }
): T => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement(tagName) as T;
  if (options?.html) el.innerHTML = options.html;
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

// Element factory functions
export const htmlDivElement = (html: string, options?: { doc?: Document; attrs?: Record<string, any> }): HTMLDivElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('div') as HTMLDivElement;
  el.innerHTML = html.trim();
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlSpanElement = (html: string, options?: { doc?: Document; attrs?: Record<string, any> }): HTMLSpanElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('span') as HTMLSpanElement;
  el.innerHTML = html.trim();
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlButtonElement = (html: string, options?: { doc?: Document; attrs?: Record<string, any> }): HTMLButtonElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('button') as HTMLButtonElement;
  el.innerHTML = html.trim();
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlUlElement = (options?: { doc?: Document; attrs?: Record<string, any> }): HTMLUListElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('ul') as HTMLUListElement;
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlLiElement = (html: string, options?: { doc?: Document; attrs?: Record<string, any> }): HTMLLIElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('li') as HTMLLIElement;
  el.innerHTML = html.trim();
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlAElement = (html: string, options?: { href?: string; doc?: Document; attrs?: Record<string, any> }): HTMLAnchorElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('a') as HTMLAnchorElement;
  el.innerHTML = html.trim();
  if (options?.href) el.href = options.href;
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlPElement = (html: string, options?: { doc?: Document; attrs?: Record<string, any> }): HTMLParagraphElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('p') as HTMLParagraphElement;
  el.innerHTML = html.trim();
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlHeadingElement = (level: 1 | 2 | 3 | 4 | 5 | 6, html: string, options?: { doc?: Document; attrs?: Record<string, any> }): HTMLHeadingElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement(`h${level}`) as HTMLHeadingElement;
  el.innerHTML = html.trim();
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlSectionElement = (options?: { doc?: Document; attrs?: Record<string, any> }): HTMLElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('section');
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export const htmlArticleElement = (options?: { doc?: Document; attrs?: Record<string, any> }): HTMLElement => {
  const d = options?.doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const el = d.createElement('article');
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  return el;
};

export namespace SwcUtils {


  export const parsePathPatternsSetAttributeString = (pathPattern: string[], path: string) => {
    return JSON.stringify(SwcUtils.parsePathPatternsSet(pathPattern, path)).replace(/"/g, "'");
  }

  export const parsePathPatternsSet = (pathPattern: string[], path: string) => {
    return {
      path: path,
      pathData: SwcUtils.parsePathPatterns(pathPattern, path)
    };
  };
  export const parsePathPatterns = (pathPattern: string[], path: string) => {
    for (const pattern of pathPattern) {
      const data = SwcUtils.parsePathPattern(pattern, path || '/');
      if (data !== null) {
        return data;
      }
    }
  };

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
      ...hostSet,
      $this: el,
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
    // if ((el as any).__swc_proto_setup) return (el as any).__swc_proto_setup;

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

  /**
   * Find parent app host by traversing DOM tree directly.
   * Only checks tagName and is attribute - no SWC host discovery.
   * Useful for Safari polyfill compatibility where is="" elements upgrade in child-first order.
   */
  export const findParentAppHostDirect = (el: HTMLElement): SwcAppInterface | null => {
    const appHosts = findAllParentAppHostsDirect(el);
    return appHosts.length > 0 ? appHosts[appHosts.length - 1] : null;
  };

  /**
   * Find all parent app hosts by traversing DOM tree directly.
   * Returns array of all parent app hosts in [closest-parent, ..., root] order.
   * Only checks tagName and is attribute - no SWC host discovery.
   * Useful for Safari polyfill compatibility where is="" elements upgrade in child-first order.
   */
  export const findAllParentAppHostsDirect = (el: HTMLElement): SwcAppInterface[] => {
    const appHosts: SwcAppInterface[] = [];
    
    // el 자체부터 시작 (el이 app host일 수도 있음)
    let current: HTMLElement | null = el;

    while (current) {
      const isAppHost =
        current.tagName.toLowerCase() === 'swc-app' ||
        current.getAttribute('is')?.startsWith('swc-app-');
      if (isAppHost) {
        appHosts.push(current as SwcAppInterface);
      }

      // 다음 부모 찾기
      if (current.parentElement) {
        // Light DOM: 정상적인 부모 요소
        current = current.parentElement;
      } else {
        // parentElement가 없음 = Shadow root의 직접 자식일 수 있음
        const root = current.getRootNode();
        if (root instanceof ShadowRoot) {
          // Shadow host로 올라가기
          current = root.host as HTMLElement;
        } else {
          // Document root 도달
          break;
        }
      }
    }
    return appHosts.reverse(); // [root, ..., closest-parent]
  };

  export const getHostSet = (el: HTMLElement): HostSet => {
    const ancestors = findAllSwcHosts(el); // [root, ..., parent]
    
    const $host = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;
    const $parentHost = ancestors.length > 1 ? ancestors[ancestors.length - 2] : null;
    const $hosts = ancestors;
    const $firstHost = ancestors.length > 0 ? ancestors[0] : null;

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

    const $appHosts = SwcUtils.findAllParentAppHostsDirect(el); //$hosts.filter(h => h.tagName.toLowerCase() === 'swc-app' || h.getAttribute('is')?.startsWith('swc-app-')) as SwcAppInterface[];
    // console.log('apphosts00000000', $appHosts)
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

  export const parsePathPattern = (pattern: string | undefined, currentPath: string): { [key: string]: string } | null => {
    // pattern이 null/undefined면 와일드카드 (모든 경로 매칭)
    if (pattern === null || pattern === undefined) return {};
    
    // 공백만 있는 패턴도 와일드카드
    const trimmedPattern = pattern.trim();
    if (trimmedPattern === '' && pattern !== '') return {}; // 공백 문자만 있는 경우
    
    // 패턴을 정규식으로 변환
    // 지원 형식:
    //   {id} → ([^/]+)  기본 (/ 제외한 모든 문자)
    //   {tail:.*} → (.*)  정규표현식 직접 지정
    //   {slug:[a-z0-9-]+} → ([a-z0-9-]+)
    const paramNames: string[] = [];
    const regexPattern = trimmedPattern.replace(/{(\w+)(?::(.+?))?}/g, (match, paramName, customRegex) => {
      paramNames.push(paramName);
      // customRegex가 있으면 사용, 없으면 기본값 ([^/]+)
      return `(${customRegex || '[^/]+'})`;
    });
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = currentPath.match(regex);
    
    if (!match) return null;
    
    const result: { [key: string]: string } = {};
    paramNames.forEach((name, index) => {
      result[name] = match[index + 1];
    });
    
    return result;
  };


};
