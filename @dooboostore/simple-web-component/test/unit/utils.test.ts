import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, bootApp, sleep, uniqueTag } from './dom.ts';
import { elementDefine, SwcUtils, createElement, eventWindow, eventDocument, subscribeSwcAppRouteChange } from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

// 회귀: 호스트를 찾을 때 조상 50단계에서 끊겨 깊은 화면에서 $host 와 window 를 잃었다
test('host lookup has no depth limit: $host / $appHost / window found 80 levels down', async () => {
  const outer = uniqueTag('deep-host');
  const { w, destroy } = await createWindow(appHtml(`<${outer}></${outer}>`));
  await bootApp(w, [(win: Window) => { @elementDefine(outer, { window: win }) class O extends (win as any).HTMLElement {} return outer; }]);
  const host: any = w.document.querySelector(outer);
  let cur: any = host;
  for (let i = 0; i < 80; i++) { const d = w.document.createElement('div'); cur.appendChild(d); cur = d; }
  const hs: any = SwcUtils.getHostSet(cur);
  assert.strictEqual(hs.$host, host);
  assert.strictEqual(hs.$appHost, w.document.querySelector('#app'));
  assert.strictEqual(SwcUtils.resolveWindow(cur), w, 'the host config window, not the top window');
  destroy();
});

// 회귀: 경로 패턴의 일반 글자가 정규식으로 해석됐다 — Spring PathPattern 처럼 {} 밖은 글자 그대로
test('path pattern: text outside {} is literal; {name:regex} keeps regex (with quantifier braces); capturing groups are rejected', () => {
  const P = SwcUtils.parsePathPattern;
  assert.deepStrictEqual(P('/v1.0/x', '/v1.0/x'), {});
  assert.strictEqual(P('/v1.0/x', '/v1a0/x'), null, "'.' is a dot, not any char");
  assert.deepStrictEqual(P('/c++', '/c++'), {}, 'no regex syntax error');
  assert.deepStrictEqual(P('/q?a', '/q?a'), {});
  assert.deepStrictEqual(P('/lit\\{x\\}', '/lit{x}'), {}, 'escaped braces outside a variable are literal');
  // 지금 쓰이는 형태 그대로
  assert.deepStrictEqual(P('/releases/{releaseSeq:\\d+}/tasks/{taskSeq:\\d+}', '/releases/12/tasks/3'), { releaseSeq: '12', taskSeq: '3' });
  assert.strictEqual(P('/releases/{seq:\\d+}', '/releases/abc'), null);
  assert.deepStrictEqual(P('/{tail:.*}', '/a/b/c'), { tail: 'a/b/c' });
  assert.deepStrictEqual(P('/a/{id}', '/a/x.y'), { id: 'x.y' });
  // 정규식 안 중괄호는 짝을 맞춰 읽는다
  assert.deepStrictEqual(P('/n/{n:\\d{3}}', '/n/123'), { n: '123' });
  assert.strictEqual(P('/n/{n:\\d{3}}', '/n/12'), null);
  assert.deepStrictEqual(P('/{kind:(?:a|b)}/{id}', '/a/7'), { kind: 'a', id: '7' }, 'non-capturing group is fine');
  assert.throws(() => P('/{kind:(a|b)}/{id}', '/a/7'), /capturing group/);
  assert.throws(() => P('/a/{id', '/a/1'), /not closed/);
  // 와일드카드 규칙은 그대로
  assert.deepStrictEqual(P(undefined, '/anything'), {});
  assert.deepStrictEqual(P('   ', '/anything'), {});
  assert.deepStrictEqual(SwcUtils.parsePathPatternAll('/a/{id}/b/{id}', '/a/1/b/2'), { id: ['1', '2'] });
  assert.strictEqual(SwcUtils.parsePathPatternAll('/v1.0/{id}', '/v1a0/1'), null);
});

test("route subscriber with a dotted path only fires for that exact path", async () => {
  const tag = uniqueTag('dot-route');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const hits: string[] = [];
  const app = await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/v1.0/docs') onDocs(route: any) { hits.push(route.path); }
    }
    return tag;
  }]);
  await app.router.go('/v1a0/docs'); await sleep(30);
  await app.router.go('/v1.0/docs'); await sleep(30);
  assert.deepStrictEqual(hits, ['/v1.0/docs']);
  destroy();
});

// 회귀: window / document 이벤트에 filter·before·finally 를 주면 helper 를 window/document 로 만들다 죽어 핸들러가 한 번도 안 돌았다
test('window / document listeners with filter / before / finally run; helper is built on the component', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('win-filter');
  const log: string[] = [];
  let helperThis: any, helperWin: any;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @eventWindow('swc-test-ping', { filter: (_e, meta) => { helperThis = meta.helper.$this; helperWin = meta.helper.$w; return true; }, finally: () => { log.push('window finally'); } })
    onWin() { log.push('window'); }
    @eventDocument('swc-test-ping', { before: () => 'b', filter: () => true }) onDoc() { log.push('document'); }
  }
  const el = await mount(w, tag);
  w.dispatchEvent(new w.Event('swc-test-ping'));
  w.document.dispatchEvent(new w.Event('swc-test-ping'));
  await sleep(20);
  assert.deepStrictEqual(log.sort(), ['document', 'window', 'window finally']);
  assert.strictEqual(helperThis, el);
  assert.strictEqual(helperWin, w);
  destroy();
});

test('getHostSet / getHelperAndHostSet accept window and document without throwing', async () => {
  const { w, destroy } = await createWindow();
  for (const target of [w, w.document]) {
    const hs: any = SwcUtils.getHostSet(target as any);
    assert.strictEqual(hs.$host, null);
    assert.deepStrictEqual(hs.$appHosts, []);
    assert.strictEqual(SwcUtils.getHelperAndHostSet(target as any, w).$w, w);
  }
  destroy();
});

// createElement 의 attrs 는 setAttribute 와 같게: 0 / '' / false 도 붙고, 값이 없는 undefined / null 만 건너뛴다
test("createElement attrs behave like setAttribute (0, '', false are set; undefined / null skipped)", async () => {
  const { w, destroy } = await createWindow();
  const el = createElement(w, 'div', { attrs: { tabindex: 0, title: '', 'data-off': false, 'data-x': 'y', 'data-u': undefined, 'data-n': null } });
  assert.deepStrictEqual(el.getAttributeNames().map(n => [n, el.getAttribute(n)]), [['tabindex', '0'], ['title', ''], ['data-off', 'false'], ['data-x', 'y']]);
  destroy();
});
