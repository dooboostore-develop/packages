import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { Sim, inject } from '@dooboostore/simple-boot';
import { createWindow, bootApp, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onInitialize, onConnectedBefore, onConnectedAfter, onConnectedCompleted, onConnectedBodyShadow, onConnectedBodyLight, onConnectedSwcApp,
  onDisconnected, onDisconnectedBefore, onDisconnectedAfter, onAdopted, onAdoptedBefore, onAdoptedAfter
} from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

test('connect order: initialize → before → body → after → completed', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-order');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onInitialize init() { log.push('init'); }
    @onConnectedBefore before() { log.push('before'); }
    @onConnectedBodyShadow render() { log.push('body'); return '<p></p>'; }
    @onConnectedAfter after() { log.push('after:' + !!this.shadowRoot?.querySelector('p')); }
    @onConnectedCompleted done() { log.push('completed'); }
  }
  await mount(w, tag);
  assert.deepStrictEqual(log, ['init', 'before', 'body', 'after:true', 'completed']);
  destroy();
});

test('@onInitialize runs once across reconnects; connect hooks run every time', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-reconnect');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onInitialize init() { log.push('init'); }
    @onConnectedAfter after() { log.push('after'); }
  }
  const el = await mount<any>(w, tag);
  el.remove();
  w.document.body.appendChild(el);
  await sleep(30);
  assert.deepStrictEqual(log, ['init', 'after', 'after']);
  destroy();
});

test('options form { order } sorts hooks of the same kind', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-sort');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onInitialize({ order: 2 }) i2() { log.push('i2'); }
    @onInitialize({ order: 1 }) i1() { log.push('i1'); }
    @onConnectedBefore({ order: 2 }) b2() { log.push('b2'); }
    @onConnectedBefore({ order: 1 }) b1() { log.push('b1'); }
    @onConnectedAfter({ order: 2 }) a2() { log.push('a2'); }
    @onConnectedAfter({ order: 1 }) a1() { log.push('a1'); }
    @onConnectedCompleted({ order: 2 }) c2() { log.push('c2'); }
    @onConnectedCompleted({ order: 1 }) c1() { log.push('c1'); }
  }
  await mount(w, tag);
  assert.deepStrictEqual(log, ['i1', 'i2', 'b1', 'b2', 'a1', 'a2', 'c1', 'c2']);
  destroy();
});

test('@onConnectedCompleted still runs when @onConnectedAfter throws', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-finally');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedAfter after() { throw new Error('boom'); }
    @onConnectedCompleted done() { log.push('completed'); }
  }
  // body 에 붙이면 connectedCallback 의 reject 를 받을 곳이 없으므로 직접 호출해 받는다
  const el = w.document.createElement(tag);
  await assert.rejects(el.connectedCallback(), /boom/);
  assert.deepStrictEqual(log, ['completed']);
  destroy();
});

test('disconnect order: before → after; @onDisconnected is the after alias', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-disc');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onDisconnectedAfter after() { log.push('after'); }
    @onDisconnected alias() { log.push('alias'); }
    @onDisconnectedBefore before() { log.push('before:' + this.isConnected); }
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(log, []);
  el.remove();
  assert.deepStrictEqual(log, ['before:false', 'after', 'alias']);
  assert.strictEqual(onDisconnected, onDisconnectedAfter);
  destroy();
});

test('adopt order: before → after; @onAdopted is the after alias', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-adopt');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onAdoptedAfter after() { log.push('after'); }
    @onAdopted alias() { log.push('alias'); }
    @onAdoptedBefore before() { log.push('before'); }
  }
  const el = await mount<any>(w, tag);
  el.remove(); // 연결된 채로 adopt 하면 disconnect 쪽이 터진다 (아래 todo 참고)
  const other = w.document.implementation.createHTMLDocument('other');
  other.adoptNode(el);
  assert.deepStrictEqual(log, ['before', 'after', 'alias']);
  assert.strictEqual(onAdopted, onAdoptedAfter);
  destroy();
});

test('adopting a connected element into a window-less document still runs @onDisconnected', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-adopt-connected');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onDisconnected disc() { log.push('disconnected'); }
    @onAdopted adopted() { log.push('adopted'); }
  }
  const el = await mount<any>(w, tag);
  w.document.implementation.createHTMLDocument('other').adoptNode(el);
  assert.deepStrictEqual(log, ['disconnected', 'adopted']);
  destroy();
});

test('standalone element (no app): @onConnectedSwcApp is not called', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-noapp');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedSwcApp app() { log.push('app'); }
    @onConnectedAfter after() { log.push('after'); }
  }
  await mount(w, tag);
  assert.deepStrictEqual(log, ['after']);
  destroy();
});

test('in an app: @onConnectedSwcApp runs before @onConnectedBefore', async () => {
  const tag = uniqueTag('lc-app');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const log: string[] = [];
  await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @onInitialize init() { log.push('init'); }
      @onConnectedSwcApp({ order: 1 }) app1() { log.push('app1'); }
      @onConnectedSwcApp app0() { log.push('app0'); }
      @onConnectedBefore before() { log.push('before'); }
      @onConnectedCompleted done() { log.push('completed'); }
    }
    return tag;
  }]);
  assert.deepStrictEqual(log, ['init', 'app0', 'app1', 'before', 'completed']);
  destroy();
});

test('in an app: @onInitialize resolves @inject parameters through DI', async () => {
  const tag = uniqueTag('lc-di');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const container = Symbol('lc-di');
  const SYMBOL = Symbol('GreetService');
  @Sim({ symbol: SYMBOL, container })
  class GreetService { hello() { return 'hello'; } }
  const seen: { service?: GreetService } = {};
  const { defineSwcAppAll } = await import('../../src/index.ts');
  await defineSwcAppAll(w);
  const app = w.document.querySelector('#app');
  await app.connect({
    path: '/', routeType: 'path', container, window: w,
    onStartedLazyDefineComponent: [(win: Window) => {
      @elementDefine(tag, { window: win })
      class El extends (win as any).HTMLElement {
        @onInitialize init(@inject(SYMBOL) service: GreetService) { seen.service = service; }
      }
      return tag;
    }]
  });
  await sleep(100);
  assert.ok(seen.service instanceof GreetService);
  assert.strictEqual(seen.service?.hello(), 'hello');
  destroy();
});

test('@onConnectedBody fallback shows while async render pends, then replaced', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('lc-fallback');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow({ fallback: '<p class="fb">loading…</p>' })
    async render() {
      await sleep(300);
      return '<p class="real">done</p>';
    }
  }
  const el = await mount<any>(w, tag, {}, 50);
  assert.ok(el.shadowRoot.querySelector('p.fb'), 'fallback visible while pending');
  await sleep(500);
  assert.strictEqual(el.shadowRoot.querySelector('p.fb'), null, 'fallback removed');
  assert.strictEqual(el.shadowRoot.querySelector('p.real')?.textContent, 'done');
  destroy();
});

test('@onConnectedBodyLight fallback shows while pending, then replaced', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('fb-light');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight({ fallback: '<p class="fb">loading</p>' }) async render() { await sleep(200); return '<p class="real">done</p>'; }
  }
  const el = await mount<any>(w, tag, {}, 50);
  assert.ok(el.querySelector('.fb'), 'fallback visible');
  await sleep(300);
  assert.strictEqual(el.querySelector('.fb'), null); assert.ok(el.querySelector('.real'));
  destroy();
});

test('@onConnectedBody fallback can be a function', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('fb-fn');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow({ fallback: () => '<p class="fb">fn</p>' }) async render() { await sleep(200); return '<p class="real">done</p>'; }
  }
  const el = await mount<any>(w, tag, {}, 50);
  assert.ok(el.shadowRoot.querySelector('.fb'));
  await sleep(300);
  assert.strictEqual(el.shadowRoot.querySelector('.fb'), null);
  destroy();
});

test('fallback stays until every render method is done (no blank gap)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('fb-two');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow({ fallback: '<p class="fb">loading</p>' }) async a() { await sleep(100); return '<p class="a">a</p>'; }
    @onConnectedBodyShadow async b() { await sleep(400); return '<p class="b">b</p>'; }
  }
  const el = await mount<any>(w, tag, {}, 250); // a 끝남, b 대기 중
  const html = el.shadowRoot.innerHTML;
  assert.ok(html.trim().length > 0, `something visible while b pends, got: "${html}"`);
  await sleep(400);
  assert.strictEqual(el.shadowRoot.querySelector('.fb'), null);
  destroy();
});

test('fallback removed when the element is detached while rendering, none left after re-attach', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('fb-abort');
  let n = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight({ fallback: '<p class="fb">loading</p>' }) async render() { n++; await sleep(150); return n === 1 ? '<p class="real">1</p>' : ''; }
  }
  const el = await mount<any>(w, tag, {}, 30);
  el.remove(); await sleep(10); w.document.body.appendChild(el);
  await sleep(400);
  assert.strictEqual(el.querySelectorAll('.fb').length, 0, `stale fallbacks: ${el.innerHTML}`);
  destroy();
});
