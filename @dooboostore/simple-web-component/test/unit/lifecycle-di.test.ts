import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, bootApp, mount, sleep, uniqueTag } from './dom.ts';
import { elementDefine, onConnectedAfter, onConnectedBodyShadow, fetchManual, fetchSettled, subscribeSwcAppRouteChange, query } from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

// 회귀: DI 앱에서 lifecycle 메서드의 swc 파라미터(@fetchSettled)를 DI 가 타입(Object)으로 resolve 하려다 SimNoSuch 로 죽던 문제
test('DI app: @onConnectedAfter + @fetchManual + @fetchSettled does not fall through to DI', async () => {
  const tag = uniqueTag('di-page');
  const { w, destroy } = createWindow(appHtml(`<${tag}></${tag}>`));
  const seen: { settled?: PromiseSettledResult<number> } = {};
  const errors: string[] = [];
  const onRejection = (e: any) => errors.push(String(e?.message ?? e));
  process.on('unhandledRejection', onRejection);
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
  process.off('unhandledRejection', onRejection);
  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(seen.settled, { status: 'fulfilled', value: 42 });
  destroy();
});

// trigger 'connectedDone': 첫 로드의 route replay 가 자기 렌더(@onConnectedBody*) 이후라 자기 DOM 을 찾을 수 있다
test("DI app: route subscriber with trigger 'connectedDone' sees the element's own rendered DOM", async () => {
  const tag = uniqueTag('di-route');
  const { w, destroy } = createWindow(appHtml(`<${tag}></${tag}>`));
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

// 알려진 버그 (아직 안 고침): bare @query 가 필드에 아무 것도 하지 않는다 (타입도 TS1271 이라 as any 로 우회)
test('bare @query on a field (known bug: currently a no-op)', { todo: 'bare @query branch returns a decorator instead of applying it' }, async () => {
  const { w, destroy } = createWindow();
  const tag = uniqueTag('q-bare');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @(query as any) box?: HTMLElement;
    @onConnectedBodyShadow render() { return '<div id="box"></div>'; }
  }
  const el = await mount<any>(w, tag);
  await sleep(10);
  assert.ok(el.box, 'expected bare @query to select by the field name');
  destroy();
});
