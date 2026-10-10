import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, bootApp, sleep, uniqueTag } from './dom.ts';
import { elementDefine, onConnectedAfter, onConnectedBodyShadow, addEventListener, fetchManual, fetchSettled, subscribeSwcAppRouteChange, querySelectorParam, querySelectorAllParam, attributeParam, localStorageParam, sessionStorageParam, indexedDbParam, persistWriteAsync, persistRemoveAsync, swcAppRouter, swcAppRouterEvent, swcAppSimpleApplication, swcAppHost } from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

// 회귀: DI 앱에서 lifecycle 메서드의 swc 파라미터(@fetchSettled)를 DI 가 타입(Object)으로 resolve 하려다 SimNoSuch 로 죽던 문제
test('DI app: @onConnectedAfter + @fetchManual + @fetchSettled does not fall through to DI', async () => {
  const tag = uniqueTag('di-page');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const seen: { settled?: PromiseSettledResult<number> } = {};
  const errors: string[] = [];
  const onRejection = (e: PromiseRejectionEvent) => { errors.push(String(e.reason?.message ?? e.reason)); e.preventDefault(); };
  addEventListener('unhandledrejection', onRejection);
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<p>x</p>'; }
      @onConnectedAfter
      @fetchManual(() => Promise.resolve(42))
      async load(@fetchSettled settled?: PromiseSettledResult<number>) { seen.settled = settled; }
    }
    return tag;
  };
  await bootApp(w, [factory]);
  removeEventListener('unhandledrejection', onRejection);
  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(seen.settled, { status: 'fulfilled', value: 42 });
  destroy();
});

// 회귀: DI 앱에서 @querySelectorParam/@attributeParam(키를 받는 kind)이 firstCheckMaker를 안 거치고
// 리졸버 함수 자체를 주입해버리던 문제 — value(key)로 해석해야 한다.
test('DI app: @onConnectedAfter + @querySelectorParam/@attributeParam resolve values, not the resolver function', async () => {
  const tag = uniqueTag('di-param');
  const { w, destroy } = await createWindow(appHtml(`<${tag} data-x="hi"></${tag}>`));
  const seen: { input?: any; attr?: any } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<input id="name">'; }
      @onConnectedAfter
      onReady(@querySelectorParam('#name') input: HTMLElement, @attributeParam('data-x') attr: string) {
        seen.input = input;
        seen.attr = attr;
      }
    }
    return tag;
  };
  await bootApp(w, [factory]);
  assert.strictEqual(seen.input?.id, 'name');
  assert.strictEqual(seen.attr, 'hi');
  destroy();
});

// 같은 회귀를 @querySelectorAllParam/@local·sessionStorageParam에서도 확인 — firstCheckMaker 수정이
// 키를 받는 kind 전체에 일반적으로 적용되는지, 특정 kind 하나에만 우연히 맞았던 건 아닌지 검증.
test('DI app: @onConnectedAfter + @querySelectorAllParam/@local·sessionStorageParam resolve values under DI too', async () => {
  const tag = uniqueTag('di-param2');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  w.localStorage.setItem('di-ls', '"ls-di-value"');
  w.sessionStorage.setItem('di-ss', '"ss-di-value"');
  const seen: { ids?: string[]; ls?: any; ss?: any } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<p class="i" id="a"></p><p class="i" id="b"></p>'; }
      @onConnectedAfter
      onReady(
        @querySelectorAllParam('.i') items: HTMLElement[],
        @localStorageParam('di-ls') ls: string,
        @sessionStorageParam('di-ss') ss: string
      ) {
        seen.ids = items?.map(e => e.id);
        seen.ls = ls;
        seen.ss = ss;
      }
    }
    return tag;
  };
  await bootApp(w, [factory]);
  assert.deepStrictEqual(seen.ids, ['a', 'b']);
  assert.strictEqual(seen.ls, 'ls-di-value');
  assert.strictEqual(seen.ss, 'ss-di-value');
  destroy();
});

// @indexedDbParam은 값이 아니라 Promise를 주입한다 — DI(firstCheckMaker) 경로에서도 Promise 그대로 전달되는지(
// 중간에 await 되거나 null로 깨지지 않는지) 확인.
test('DI app: @onConnectedAfter + @indexedDbParam injects a Promise under DI too', async () => {
  const tag = uniqueTag('di-param-idb');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const marker = { ownerDocument: w.document } as any;
  await persistRemoveAsync(marker, 'di-idb-key', { storage: 'indexeddb' }).catch(() => undefined);
  await persistWriteAsync(marker, 'di-idb-key', 'idb-di-value', { storage: 'indexeddb' });
  const seen: { isPromise?: boolean; value?: string } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<p>x</p>'; }
      @onConnectedAfter
      async onReady(@indexedDbParam('di-idb-key') wow: Promise<string>) {
        seen.isPromise = wow instanceof Promise;
        seen.value = await wow;
      }
    }
    return tag;
  };
  await bootApp(w, [factory]);
  assert.strictEqual(seen.isPromise, true);
  assert.strictEqual(seen.value, 'idb-di-value');
  destroy();
});

// @swcAppRouter: $appHost.router 단축 경로 — @Inject 없이 router.go() 등에 바로 접근.
// @swcAppSimpleApplication: $appHost.simpleApplication 단축 경로, @swcAppHost: $appHost 자신 — 같이 확인.
test('DI app: @onConnectedAfter + @swcAppRouter/@swcAppSimpleApplication/@swcAppHost inject the live instances (elementDefine dispatcher path)', async () => {
  const tag = uniqueTag('di-router');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const seen: { router?: any; simpleApp?: any; appHost?: any } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<p>x</p>'; }
      @onConnectedAfter
      onReady(@swcAppRouter router: any, @swcAppSimpleApplication simpleApp: any, @swcAppHost appHost: any) {
        seen.router = router;
        seen.simpleApp = simpleApp;
        seen.appHost = appHost;
      }
    }
    return tag;
  };
  const app = await bootApp(w, [factory]);
  assert.strictEqual(typeof seen.router?.go, 'function');
  assert.strictEqual(seen.router, (app as any).router);
  assert.strictEqual(seen.simpleApp, (app as any).simpleApplication);
  assert.strictEqual(typeof seen.simpleApp?.simstanceManager, 'object');
  assert.strictEqual(seen.appHost, app);
  destroy();
});

// 같은 kind들이 elementDefine의 lifecycle 디스패처가 아니라 addEventListener 쪽의(buildCommonKindValues) 경로로도 채워지는지 확인.
test('DI app: @swcAppRouter/@swcAppSimpleApplication/@swcAppHost also resolve on an @addEventListener handler (buildCommonKindValues path, not just lifecycle)', async () => {
  const tag = uniqueTag('di-router-event');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const seen: { router?: any; simpleApp?: any; appHost?: any } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<button id="btn"></button>'; }
      @addEventListener('#btn', 'click')
      onClick(@swcAppRouter router: any, @swcAppSimpleApplication simpleApp: any, @swcAppHost appHost: any) {
        seen.router = router;
        seen.simpleApp = simpleApp;
        seen.appHost = appHost;
      }
    }
    return tag;
  };
  const app = await bootApp(w, [factory]);
  w.document.querySelector(tag).shadowRoot.querySelector('#btn').click();
  await sleep(20);
  assert.strictEqual(typeof seen.router?.go, 'function');
  assert.strictEqual(seen.simpleApp, (app as any).simpleApplication);
  assert.strictEqual(seen.appHost, app);
  destroy();
});

// 라우트 핸들러에서 @swcAppRouterEvent(이번 변경 이벤트)와 @swcAppRouter/@swcAppSimpleApplication/@swcAppHost(인스턴스들)를 같이, 순서도 뒤집어서 써도 되는지.
test('DI app: route subscriber mixes @swcAppRouterEvent + @swcAppRouter + @swcAppSimpleApplication + @swcAppHost (reversed order)', async () => {
  const tag = uniqueTag('di-router-route');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const seen: { path?: string; routerOk?: boolean; simpleAppOk?: boolean; appHost?: any } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<p>x</p>'; }
      @subscribeSwcAppRouteChange
      onRoute(@swcAppHost appHost: any, @swcAppSimpleApplication simpleApp: any, @swcAppRouter router: any, @swcAppRouterEvent re: any) {
        seen.path = re?.path;
        seen.routerOk = typeof router?.go === 'function';
        seen.simpleAppOk = typeof simpleApp?.simstanceManager === 'object';
        seen.appHost = appHost;
      }
    }
    return tag;
  };
  const app = await bootApp(w, [factory]);
  assert.strictEqual(seen.path, '/');
  assert.strictEqual(seen.routerOk, true);
  assert.strictEqual(seen.simpleAppOk, true);
  assert.strictEqual(seen.appHost, app);
  destroy();
});

// trigger 'connectedDone': 첫 로드의 route replay 가 자기 렌더(@onConnectedBody*) 이후라 자기 DOM 을 찾을 수 있다
test("DI app: route subscriber with trigger 'connectedDone' sees the element's own rendered DOM", async () => {
  const tag = uniqueTag('di-route');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const seen: { path?: string; found?: boolean } = {};
  const factory = (win: Window) => {
    @elementDefine(tag, { window: win })
    class Page extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<nav class="links"></nav>'; }
      @subscribeSwcAppRouteChange({ trigger: 'connectedDone' })
      onRoute(route: any) {
        seen.path = route.path;
        seen.found = !!this.shadowRoot?.querySelector('.links');
      }
    }
    return tag;
  };
  await bootApp(w, [factory]);
  assert.strictEqual(seen.path, '/');
  assert.strictEqual(seen.found, true);
  destroy();
});
