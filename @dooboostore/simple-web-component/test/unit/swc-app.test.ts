import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { Sim, inject } from '@dooboostore/simple-boot';
import { createWindow, sleep, uniqueTag } from './dom.ts';
import { elementDefine, onConnectedBodyShadow, defineSwcAppAll, SwcAppMixin } from '../../src/index.ts';

test('defineSwcAppAll registers every SwcApp variant', async () => {
  const { w, destroy } = await createWindow();
  await defineSwcAppAll(w);
  for (const name of ['app', 'app-body', 'app-div', 'app-section', 'app-main', 'app-article', 'app-header', 'app-footer', 'app-nav', 'app-aside']) {
    assert.ok(w.customElements.get(`swc-${name}`), `swc-${name}`);
  }
  destroy();
});

test('is="swc-app-div": connect runs factories, onEngineStarted, and host onConnected/onDisconnected on re-attach', async () => {
  const tag = uniqueTag('app-div');
  const { w, destroy } = await createWindow(`<!DOCTYPE html><html><body><div id="app" is="swc-app-div"><${tag}></${tag}></div></body></html>`);
  await defineSwcAppAll(w);
  const app = w.document.querySelector('#app');
  const log: string[] = [];
  await app.connect({
    path: '/', routeType: 'path', container: Symbol('div'), window: w,
    onStartedLazyDefineComponent: [(win: Window) => {
      @elementDefine(tag, { window: win })
      class El extends (win as any).HTMLElement {
        @onConnectedBodyShadow render() { return '<p class="ok">ok</p>'; }
      }
      return tag;
    }],
    onEngineStarted: (sp: any, host: any) => { log.push(`engine:${!!sp}:${host === app}`); },
    onConnected: (host: any) => { log.push(`connected:${host === app}`); },
    onDisconnected: (host: any) => { log.push(`disconnected:${host === app}`); }
  });
  await sleep(50);
  assert.ok(w.customElements.get(tag));
  assert.ok(w.document.querySelector(tag).shadowRoot?.querySelector('.ok'));
  // 최초 attach 의 mixin connectedCallback 은 elementDefine 래퍼의 await 뒤로 밀려 connect() 이후에 돈다 → 'connected' 도 찍힌다
  assert.deepStrictEqual(log, ['engine:true:true', 'connected:true']);
  app.remove();
  w.document.body.appendChild(app);
  await sleep(30);
  assert.deepStrictEqual(log.slice(2), ['disconnected:true', 'connected:true']);
  destroy();
});

test('is="swc-app-body": the body itself boots as the app host', async () => {
  const tag = uniqueTag('app-body');
  const { w, destroy } = await createWindow(`<!DOCTYPE html><html><body id="app" is="swc-app-body"><${tag}></${tag}></body></html>`);
  await defineSwcAppAll(w);
  const app = w.document.querySelector('#app');
  assert.strictEqual(app, w.document.body);
  assert.strictEqual(typeof app.connect, 'function');
  let started = false;
  await app.connect({
    path: '/', routeType: 'path', container: Symbol('body'), window: w,
    onStartedLazyDefineComponent: [(win: Window) => {
      @elementDefine(tag, { window: win })
      class El extends (win as any).HTMLElement {
        @onConnectedBodyShadow render() { return '<i class="ok"></i>'; }
      }
      return tag;
    }],
    onEngineStarted: () => { started = true; }
  });
  await sleep(50);
  assert.strictEqual(started, true);
  assert.ok(w.document.querySelector(tag).shadowRoot?.querySelector('.ok'));
  destroy();
});

test('custom SwcAppMixin host: onSwcAppConnected resolves @inject after connect()', async () => {
  const { w, destroy } = await createWindow('<!DOCTYPE html><html><body></body></html>');
  const container = Symbol('mixin');
  const SYMBOL = Symbol('AuthService');
  @Sim({ symbol: SYMBOL, container })
  class AuthService { me() { return 'me'; } }
  const tag = uniqueTag('my-app');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class MyApp extends SwcAppMixin(w.HTMLElement) {
    onConnected() { log.push('connected'); }
    onSwcAppConnected(@inject(SYMBOL) auth: AuthService) { log.push(`swcApp:${auth?.me()}`); }
    onDisconnected() {}
  }
  const app: any = w.document.createElement(tag);
  w.document.body.appendChild(app);
  await sleep(10);
  await app.connect({ container, window: w });
  assert.deepStrictEqual(log, ['connected', 'swcApp:me']);
  destroy();
});
