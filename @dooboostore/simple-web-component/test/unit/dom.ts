// swc 동작 테스트용 DOM. dom-parser 는 SSR 전용이라 사용자 이벤트(click 등)를 처리하지 않으므로
// 브라우저 동작(custom element, shadow DOM, 이벤트)을 흉내 내는 jsdom 을 쓴다.
import { JSDOM } from 'jsdom';

export const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));

/** 테스트마다 새 window. 끝나면 destroy() */
export const createWindow = (html = '<!DOCTYPE html><html><body></body></html>') => {
  const dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true });
  const w = dom.window as any;
  // swc 소스가 Node/HTMLElement 등을 전역으로 참조한다 (SSR 의 DomParserInitializer 와 같은 목록)
  const g = globalThis as any;
  for (const k of ['Event', 'CustomEvent', 'NodeFilter', 'Node', 'DocumentFragment', 'HTMLElement', 'HTMLMetaElement', 'Element', 'HTMLCanvasElement', 'ShadowRoot', 'Text', 'Comment', 'MutationObserver']) {
    if (w[k]) g[k] = w[k];
  }
  g.PopStateEvent = w.PopStateEvent ?? w.Event;
  w.scrollTo = () => {}; // jsdom 미구현 (라우터가 호출)
  return { w, destroy: () => w.close() };
};

/** 요소를 만들어 body 에 붙이고 연결 lifecycle 이 돌 때까지 기다린다 */
export const mount = async <T = any>(w: any, tag: string, attrs: Record<string, string> = {}, wait = 30): Promise<T> => {
  const el = w.document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  w.document.body.appendChild(el);
  await sleep(wait);
  return el as T;
};

/**
 * DI 컨테이너가 있는 SwcApp 을 부팅한다 (lifecycle 파라미터가 DI 경로를 타는 상황 재현용).
 * html 에 <div id="app" is="swc-app-div"> 가 있어야 한다.
 */
export const bootApp = async (w: any, factories: ((w: Window) => any)[], wait = 200) => {
  const { defineSwcAppAll } = await import('../../src/index.ts');
  await defineSwcAppAll(w);
  const app = w.document.querySelector('#app');
  app.connect({ path: '/', routeType: 'path', container: Symbol('test'), window: w, onStartedLazyDefineComponent: factories });
  await sleep(wait);
  return app;
};

let seq = 0;
/** 테스트마다 겹치지 않는 태그 이름 */
export const uniqueTag = (prefix = 'x') => `t-${prefix}-${++seq}`;
