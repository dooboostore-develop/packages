// swc 동작 테스트용 DOM — 실제 브라우저(playwright Chromium)에서 돈다. jsdom 은 쓰지 않는다.
// 테스트마다 iframe 하나 = window 하나 (customElements / history / location 이 테스트끼리 섞이지 않게).

export const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));

/** 테스트마다 새 window. 끝나면 destroy() */
export const createWindow = async (html = '<!DOCTYPE html><html><body></body></html>') => {
  // 같은 origin 의 실제 URL(/__frame, run.mjs 가 html 을 그대로 응답)로 연다 — 브라우저가 문서를 파싱하므로 <body is="..."> 도 그대로.
  // (document.write 로 만든 문서는 뒤로가기 때 popstate 없이 다시 로드돼서 쓰지 않는다)
  const frame = document.createElement('iframe');
  frame.src = `/__frame?html=${encodeURIComponent(html)}`;
  const loaded = new Promise(r => frame.addEventListener('load', r, { once: true }));
  document.body.appendChild(frame);
  await loaded;
  const w = frame.contentWindow as any;
  // swc 소스가 Node/HTMLElement 등을 전역으로 참조한다 — iframe 요소와 instanceof 가 맞도록 전역을 그 window 것으로
  const g = globalThis as any;
  for (const k of ['Event', 'CustomEvent', 'NodeFilter', 'Node', 'DocumentFragment', 'HTMLElement', 'HTMLMetaElement', 'Element', 'HTMLCanvasElement', 'ShadowRoot', 'Text', 'Comment', 'MutationObserver', 'PopStateEvent']) {
    if (w[k]) g[k] = w[k];
  }
  // iframe 안에서 난 잡히지 않은 에러는 그 window 로 보고된다 → 테스트 실패로 모은다 (runtime/node-test.ts)
  w.addEventListener('error', (e: ErrorEvent) => (globalThis as any).__swcTest?.uncaught.push(String(e.error?.stack ?? e.message)));
  w.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => (globalThis as any).__swcTest?.uncaught.push(String(e.reason?.stack ?? e.reason)));
  return { w, destroy: () => frame.remove() };
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
