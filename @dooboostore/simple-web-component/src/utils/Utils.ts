import {SwcAppInterface, HostSet, HelperSet, HelperHostSet} from '../types';
import {getElementConfig} from "../decorators";
import {getExpression, ExpressionResult, GetExpressionConfig, GetExpressionResult, ActionExpression} from '@dooboostore/core';
import {ElementApply, NodeSlot, Router} from "@dooboostore/core-web";

export const SWC_NOT_FOUND = Symbol.for('simple-web-component:not-found');


export const html = (str: string, document: Document) => {
  return [...document.createRange().createContextualFragment(str).childNodes];
}
// DOM Creation Utilities
export const htmlFragment = (html: string | Node | Node[], doc?: Document): DocumentFragment => {
  const d = doc || (typeof document !== 'undefined' ? document : undefined);
  if (!d) throw new Error('Document is not available');
  const template = d.createElement('template');
  if (typeof html === 'string') {
    template.innerHTML = html.trim();
  } else if (html instanceof Node) {
    template.appendChild(html);
  } else if (Array.isArray(html)) {
    template.append(...html);
  }
  // template.innerHTML = html.trim();
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

export type CreateElementConfig = { innerHtml?: string; property?: Record<string, any>, attrs?: Record<string, string>; };
export const createElement = <T extends HTMLElement>(
  documentOrWindow: Document | Window,
  tagName: string,
  options?: CreateElementConfig
): T => {
  const doc = 'document' in documentOrWindow ? documentOrWindow.document : documentOrWindow;
  if (!doc) throw new Error('Document is not available');
  const el = doc.createElement(tagName) as T;
  if (options?.innerHtml) el.innerHTML = options.innerHtml;
  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  }
  if (options?.property) {
    Object.entries(options.property).forEach(([k, v]) => el[k] = v);
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


  export const getParentContainer = (e: Node) => {
    return e.parentElement ?? e.getRootNode() as any;
  }

  export const parsePathPatternsSetAttributeString = (pathPattern: string[], path: string) => {
    return JSON.stringify(SwcUtils.parsePathPatternsSet(pathPattern, path)).replace(/"/g, "'");
  }

  export const parsePathPatternsSet = (pathPattern: string[], urlAndRouter?: string | Router) => {
    // if (!path) {
    //   return;
    // }
    urlAndRouter ??= '/'
    const p = typeof urlAndRouter === 'string' ? urlAndRouter : urlAndRouter.value.url;
    const searchParams = new URLSearchParams();
    const qs = p.split('?')[1];
    qs?.split('&').forEach(it => {
      const [k, v] = it.split('=');
      searchParams.set(k, v);
    })
    return {
      path: p,
      searchParams,
      pathData: SwcUtils.parsePathPatterns(pathPattern, p)
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
  export const findNearestSwcHostIncludingSelf = (el: HTMLElement | Node): HTMLElement | undefined => {
    const el1 = el as any;
    if (el1.__swc_host) return el1.__swc_host;

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
  export const findAllSwcHostsIncludingSelf = (el: HTMLElement | Node): HTMLElement[] => {
    const hosts: HTMLElement[] = [];
    let current = findNearestSwcHostIncludingSelf(el);
    while (current) {
      hosts.push(current);
      // To find the next ancestor, we must start searching from the PARENT of the found host
      current = findNearestSwcHostIncludingSelf(current);
    }
    return hosts.reverse();
  };

  export const getHosts = (el: HTMLElement): HTMLElement[] => {
    const ancestors = findAllSwcHostsIncludingSelf(el);
    if (getElementConfig(el)) return [...ancestors, el];
    return ancestors;
  };

  export const getHost = (el: HTMLElement): HTMLElement | undefined => {
    if (getElementConfig(el)) return el;
    return findNearestSwcHostIncludingSelf(el);
  };


  export function projectProcessHtml(id: string, htmlOrNode: string, document: Document): string;
  export function projectProcessHtml(id: string, htmlOrNode: (Node)[], document: Document): (Node)[];
  export function projectProcessHtml(id: string, htmlOrNode: string | (Node)[], document: Document): string | (Node)[] {
    if (typeof htmlOrNode === 'string') {
      // slot
      let t = htmlOrNode;
      // if (!config?.excludeSlot) {
      t = SwcUtils.processHtml(id, t, {document: document, replaceWrap: {start: '<!--[[', end: ']]-->'}, replacer: (id, script) => NodeSlot.slot(`${id}-${script}`)});
      // }
      // if (!config?.excludeHtml) {
      // Ea html
      t = SwcUtils.processHtml(id, t, {document: document, replaceWrap: {start: '<!--[html', end: ']-->'}, replacer: (id, script) => ElementApply.html(id, script)});
      // }

      // if (!config?.excludeText) {
      // Ea text
      t = SwcUtils.processHtml(id, t, {document: document, replaceWrap: {start: '<!--[text', end: ']-->'}, replacer: (id, script) => ElementApply.text(id, script)});
      // }

      // if (!config.excludeAttribute) {
      // Ea attribute
      t = SwcUtils.processHtml(id, t, {
        document: document,
        replaceWrap: {start: /a::\w+=\s*"/, end: /"\s/}, replacer: (id, script, er) => {
          console.log('start: /a-->', er)
          const match = er.expressionStart.match(/^\w+::(\w+)="/)
          const name = match?.[1];
          return ElementApply.attribute(id, name, script)
        }
      });
      // }

      // if (!config.excludeEvent) {
      t = SwcUtils.processHtml(id, t, {
        document: document,
        replaceWrap: {start: /e::\w+=\s*"/, end: /"\s/}, replacer: (id, script, er) => {
          console.log('start: /e-->', er)
          const match = er.expressionStart.match(/^\w+::(\w+)="/)
          const name = match?.[1];
          return ElementApply.event(id, name, script)
        }
      });
      // }


      // if (!config.excludeProperty) {
      t = SwcUtils.processHtml(id, t, {
        document: document,
        replaceWrap: {start: /p:\w+=\s*"/, end: /"\s/}, replacer: (id, script, er) => {
          console.log('start: /p-->', er)
          const match = er.expressionStart.match(/^\w+:(\w+)="/)
          const name = match?.[1];
          return ElementApply.property(id, name, script)
        }
      });
      return t;
    } else if (Array.isArray(htmlOrNode)) {

      // 아래 node일떄도 처리하도록 만듬 아직테스트는 안해봄 테스트후 주석지울것.
      const nodes = htmlOrNode;
      const window = document.defaultView;
      nodes.forEach(node => {
        // TextNode 합치기
        node.normalize();
        const nodes = document.createTreeWalker(node, window.NodeFilter.SHOW_ELEMENT | window.NodeFilter.SHOW_COMMENT)

        const getSlotData = (s: string) => {
          return s.match(/^\[\[([\s\S]+)\]\]$/)?.[1];
        }
        const getHtmlData = (s: string) => {
          return s.match(/^\[html([\s\S]+)\]$/)?.[1];
          // return s.startsWith('[html') && s.endsWith(']');
        }
        const getTextData = (s: string) => {
          return s.match(/^\[text([\s\S]+)\]$/)?.[1];
          // return s.startsWith('[text') && s.endsWith(']');
        }
        while (nodes.nextNode()) {
          const currentNode = nodes.currentNode;
          if (currentNode.nodeType === window.Node.COMMENT_NODE) {
            const targetNode = currentNode as Comment;
            const v = targetNode.data.trim();
            const slotData = getSlotData(v);
            const htmlData = getHtmlData(v);
            const textData = getTextData(v);
            if (v && slotData) {
              const res = NodeSlot.slotIds(`${id}-${slotData}`)
              targetNode.data = res.start;
              const end = document.createComment(res.end)
              targetNode.parentNode?.insertBefore(end, targetNode.nextSibling);
              // document.createTe

            } else if (v && htmlData) {
              const s = ElementApply.htmlDataSet(id, htmlData);
              targetNode.data = s.start;
              const end = document.createComment(s.end)
              targetNode.parentNode?.insertBefore(end, targetNode.nextSibling);
            } else if (v && textData) {
              const s = ElementApply.textDataSet(id, textData);
              const end = document.createComment(s.end)
              targetNode.data = s.start;
              targetNode.parentNode?.insertBefore(end, targetNode.nextSibling);
            }

          } else if (currentNode.nodeType === window.Node.ELEMENT_NODE) {
            const targetNode = currentNode as Element;
            targetNode.getAttributeNames().forEach(it => {
              const e = it.match(/e::(\w+)$/);
              const eventName = e?.[1];
              const p = it.match(/p::(\w+)$/);
              const propertyName = p?.[1];
              const a = it.match(/a::(\w+)$/);
              const attributeName = a?.[1];

              const value = targetNode.getAttribute(it);
              if (eventName) {
                targetNode.setAttribute(ElementApply.eventName(id, eventName), value);
                targetNode.removeAttribute(it);
              } else if (propertyName) {
                targetNode.setAttribute(ElementApply.propertyName(id, propertyName), value);
                targetNode.removeAttribute(it);
              } else if (attributeName) {
                targetNode.setAttribute(ElementApply.attributeName(id, attributeName), value);
                targetNode.removeAttribute(it);
              }
            })
          }
        }

      })

      return htmlOrNode;
    }
    // }


  }

  // export function processHtml(id: string, htmlOrNode: string, config: { document: Document, replaceWrap: { start: string | RegExp, end: string | RegExp }, replacer: (id: string, script: string, er: ExpressionResult) => string }): string;
  // export function processHtml(id: string, htmlOrNode: (Node | string)[], config: { document: Document, replaceWrap: { start: string | RegExp, end: string | RegExp }, replacer: (id: string, script: string, er: ExpressionResult) => string }): (Node | string)[] ;
  export function processHtml(
    id: string,
    html: string,
    config: { document: Document, replaceWrap: { start: string | RegExp, end: string | RegExp }, replacer: (id: string, script: string, er: ExpressionResult) => string }
  ): string {
    const replaceStart = config.replaceWrap.start;
    const replaceEnd = config.replaceWrap.end;
    const callReturnStart = `${config.replaceWrap.start}=`;
    const callReturnEnd = `${config.replaceWrap.end}`;
    const callStart = `${config.replaceWrap.start}@`;
    const callEnd = `${config.replaceWrap.end}`;
    const hasPattern = (text: string | null | undefined, start: string, end: string) => {
      if (!text) return false;
      const s = text.indexOf(start);
      const e = text.indexOf(end, s + start.length);
      return s !== -1 && e !== -1 && s < e;
    };

    const actionConfig: GetExpressionConfig = {expression: {replace: {start: replaceStart, end: replaceEnd}, callReturn: {start: callReturnStart, end: callReturnEnd}, call: {start: callStart, end: callEnd}}};
    const runActionExpression = (source: string) => {
      const actionExpression = new ActionExpression(source, actionConfig);
      actionExpression.getExpressions().filter(it => it.type === 'replace').forEach(it => {
        actionExpression.replace(it, config.replacer(id, it.script, it));
      });
      return actionExpression.toResult();
    };

    return runActionExpression(html);
    // if (typeof html === 'string') {
    // } else {
    // }
  }

  export const getAppHosts = (el: HTMLElement): SwcAppInterface[] => {
    // const hosts = getHosts(el);
    // return hosts.filter(host => host.tagName.toLowerCase() === 'swc-app' || host.getAttribute('is')?.startsWith('swc-app-')) as SwcAppInterface[];
    const hosts = SwcUtils.findAllAppHostsIncludingSelfDirect(el);
    return hosts;
  };

  export const getAppHost = (el: HTMLElement): SwcAppInterface | undefined => {
    const appHosts = getAppHosts(el);
    const appHostsWithoutSelf = appHosts.filter(h => h !== el);
    return appHostsWithoutSelf.length > 0 ? appHostsWithoutSelf[appHostsWithoutSelf.length - 1] : undefined;
  };

  /**
   * Find the closest app host by traversing DOM tree directly, including the element itself.
   * Only checks tagName and is attribute - no SWC host discovery.
   * Useful for Safari polyfill compatibility where is="" elements upgrade in child-first order.
   */
  export const findAppHostIncludingSelfDirect = (el: HTMLElement): SwcAppInterface | null => {
    const appHosts = findAllAppHostsIncludingSelfDirect(el);
    return appHosts.length > 0 ? appHosts[appHosts.length - 1] : null;
  };

  /**
   * Find all app hosts by traversing DOM tree directly, including the element itself.
   * Returns array of all app hosts in [root, ..., closest-parent-or-self] order.
   * Only checks tagName and is attribute - no SWC host discovery.
   * Useful for Safari polyfill compatibility where is="" elements upgrade in child-first order.
   */
  export const findAllAppHostsIncludingSelfDirect = (el: HTMLElement): SwcAppInterface[] => {
    const appHosts: SwcAppInterface[] = [];

    const w = el.ownerDocument?.defaultView || ((typeof window !== 'undefined' ? window : undefined) as any);

    // Guard against SSR environment where window might be undefined
    if (!w) {
      return appHosts;
    }

    // console.log('------?',w.ShadowRoot);
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
        if (w.ShadowRoot && root instanceof w.ShadowRoot) {
          // Shadow host로 올라가기
          current = (root as ShadowRoot).host as HTMLElement;
        } else {
          // Document root 도달
          break;
        }
      }
    }
    return appHosts.reverse(); // [root, ..., closest-parent-or-self]
  };

  export const getHostSet = (el: HTMLElement): HostSet => {
    const ancestors = findAllSwcHostsIncludingSelf(el); // [root, ..., parent]

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

    const $appHosts = SwcUtils.findAllAppHostsIncludingSelfDirect(el);
    const $appHost = $appHosts.length > 0 ? ($appHosts[$appHosts.length - 1] === el ? ($appHosts.length > 1 ? $appHosts[$appHosts.length - 2] : null) : $appHosts[$appHosts.length - 1]) : null;
    const $firstAppHost = $appHosts.length > 0 ? $appHosts[0] : null;

    return {
      $host,
      $parentHost,
      $hosts,
      $firstHost,
      $lastHost: $host,
      // $templateHost: (el as any).__swc_template_host,
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


}
;
