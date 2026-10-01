import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, bootApp, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onConnectedBodyLight, query, queryAll, queryLight, queryShadow, queryAllRoots, queryAllLight,
  queryAllShadow, queryAllAll, queryIn
} from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;
const ids = (els: any) => (els as HTMLElement[]).map(e => e.id);

test('bare @query / @queryAll point at the element itself', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-bare');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query self?: HTMLElement;
    @queryAll selves?: HTMLElement[];
    @onConnectedBodyShadow render() { return '<div id="box"></div>'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.self, el);
  assert.deepStrictEqual(el.selves, [el]);
  destroy();
});

test("root 'auto' prefers shadow; 'light' / 'shadow' / 'all' pick the scope", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-root');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query('.i') auto?: HTMLElement;
    @query('.i', { root: 'light' }) light?: HTMLElement;
    @query('.i', { root: 'shadow' }) shadow?: HTMLElement;
    @queryAll('.i', { root: 'all' }) all?: HTMLElement[];
    @onConnectedBodyShadow render() { return '<p class="i" id="s"></p>'; }
  }
  const el = w.document.createElement(tag);
  el.innerHTML = '<p class="i" id="l"></p>';
  w.document.body.appendChild(el);
  await sleep(30);
  assert.strictEqual(el.auto.id, 's');
  assert.strictEqual(el.light.id, 'l');
  assert.strictEqual(el.shadow.id, 's');
  assert.deepStrictEqual(ids(el.all), ['l', 's']);
  destroy();
});

test("root 'auto' falls back to light DOM when there is no shadow root", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-auto-light');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query('#x') x?: HTMLElement;
    @onConnectedBodyLight render() { return '<b id="x"></b>'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.x.id, 'x');
  assert.strictEqual(el.shadowRoot, null);
  destroy();
});

test("pick: 'first' / 'last' / number / 'all' / 'even' / 'odd'; no match → null / []", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-pick');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query('li') first?: HTMLElement;
    @query('li', { pick: 'last' }) last?: HTMLElement;
    @query('li', { pick: 2 }) third?: HTMLElement;
    @query('li', { pick: 9 }) none?: HTMLElement;
    @query('li', { pick: 'all' }) all?: HTMLElement[];
    @query('li', { pick: 'even' }) even?: HTMLElement[];
    @query('li', { pick: 'odd' }) odd?: HTMLElement[];
    @query('.missing') missing?: HTMLElement;
    @queryAll('.missing') missingAll?: HTMLElement[];
    @onConnectedBodyShadow render() { return '<li id="a"></li><li id="b"></li><li id="c"></li><li id="d"></li>'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.first.id, 'a');
  assert.strictEqual(el.last.id, 'd');
  assert.strictEqual(el.third.id, 'c');
  assert.strictEqual(el.none, null);
  assert.deepStrictEqual(ids(el.all), ['a', 'b', 'c', 'd']);
  assert.deepStrictEqual(ids(el.even), ['a', 'c']);
  assert.deepStrictEqual(ids(el.odd), ['b', 'd']);
  assert.strictEqual(el.missing, null);
  assert.deepStrictEqual(el.missingAll, []);
  destroy();
});

test('filter narrows the matches and receives currentThis', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-filter');
  let seenThis: any;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @queryAll('li', { filter: (el, { currentThis }) => { seenThis = currentThis; return el.hasAttribute('data-on'); } }) on?: HTMLElement[];
    @onConnectedBodyShadow render() { return '<li id="a" data-on></li><li id="b"></li><li id="c" data-on></li>'; }
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(ids(el.on), ['a', 'c']);
  assert.strictEqual(seenThis, el);
  destroy();
});

test('function selector: element, array and NodeList results', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-fn');
  const outside = w.document.createElement('div');
  outside.id = 'out';
  w.document.body.appendChild(outside);
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query(() => outside) one?: HTMLElement;
    @queryAll((self: any) => self.shadowRoot.querySelectorAll('li')) list?: HTMLElement[];
    @queryAll((self: any) => [self, outside]) arr?: HTMLElement[];
    @query(() => null) nothing?: HTMLElement;
    @onConnectedBodyShadow render() { return '<li id="a"></li><li id="b"></li>'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.one, outside);
  assert.deepStrictEqual(ids(el.list), ['a', 'b']);
  assert.deepStrictEqual(el.arr, [el, outside]);
  assert.strictEqual(el.nothing, null);
  destroy();
});

test('$window / $document / $this special selectors', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-special');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query('$window') win?: Window;
    @query('$document') doc?: Document;
    @query('$this') self?: HTMLElement;
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.win, w);
  assert.strictEqual(el.doc, w.document);
  assert.strictEqual(el.self, el);
  destroy();
});

test('$host / $parentHost / $hosts / $firstHost resolve the swc host chain', async () => {
  const { w, destroy } = await createWindow();
  const outerTag = uniqueTag('q-outer');
  const midTag = uniqueTag('q-mid');
  const innerTag = uniqueTag('q-inner');
  @elementDefine(innerTag, { window: w })
  class Inner extends w.HTMLElement {
    @query('$host') host?: HTMLElement;
    @query('$parentHost') parentHost?: HTMLElement;
    @queryAll('$hosts') hosts?: HTMLElement[];
    @query('$firstHost') firstHost?: HTMLElement;
    @query('$lastHost') lastHost?: HTMLElement;
  }
  @elementDefine(midTag, { window: w })
  class Mid extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<${innerTag}></${innerTag}>`; }
  }
  @elementDefine(outerTag, { window: w })
  class Outer extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<${midTag}></${midTag}>`; }
  }
  const outer = await mount<any>(w, outerTag, {}, 60);
  const mid = outer.shadowRoot.querySelector(midTag);
  const inner = mid.shadowRoot.querySelector(innerTag);
  assert.strictEqual(inner.host, mid);
  assert.strictEqual(inner.parentHost, outer);
  assert.deepStrictEqual(inner.hosts, [outer, mid]);
  assert.strictEqual(inner.firstHost, outer);
  assert.strictEqual(inner.lastHost, mid);
  destroy();
});

test('$appHost resolves the swc-app host', async () => {
  const tag = uniqueTag('q-app');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const app = await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @query('$appHost') appHost?: HTMLElement;
      @queryAll('$appHosts') appHosts?: HTMLElement[];
    }
    return tag;
  }]);
  const el: any = w.document.querySelector(tag);
  assert.strictEqual(el.appHost, app);
  assert.deepStrictEqual(el.appHosts, [app]);
  destroy();
});

test('root shorthands: queryLight / queryShadow / queryAllRoots / queryAllLight / queryAllShadow / queryAllAll', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-short');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @queryLight('.i') light?: HTMLElement;
    @queryShadow('.i') shadow?: HTMLElement;
    @queryAllRoots('.i') rootsFirst?: HTMLElement;
    @queryAllLight('.i') allLight?: HTMLElement[];
    @queryAllShadow('.i') allShadow?: HTMLElement[];
    @queryAllAll('.i') allAll?: HTMLElement[];
    @onConnectedBodyShadow render() { return '<p class="i" id="s1"></p><p class="i" id="s2"></p>'; }
  }
  const el = w.document.createElement(tag);
  el.innerHTML = '<p class="i" id="l1"></p>';
  w.document.body.appendChild(el);
  await sleep(30);
  assert.strictEqual(el.light.id, 'l1');
  assert.strictEqual(el.shadow.id, 's1');
  assert.strictEqual(el.rootsFirst.id, 'l1'); // all 은 light 먼저 탐색
  assert.deepStrictEqual(ids(el.allLight), ['l1']);
  assert.deepStrictEqual(ids(el.allShadow), ['s1', 's2']);
  assert.deepStrictEqual(ids(el.allAll), ['l1', 's1', 's2']);
  destroy();
});

test('queryIn(root, pick) combines root and pick', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-in');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    // 호출 체인 데코레이터는 TS 에서 괄호 필수 (README 의 @queryIn(...)('.row') 표기는 TS1497)
    @(queryIn('shadow', 'even')('.row')) evenRows?: HTMLElement[];
    @(queryIn('shadow', 1)('.row')) second?: HTMLElement;
    @(queryIn('shadow')('.row')) first?: HTMLElement;
    @onConnectedBodyShadow render() { return '<i class="row" id="r0"></i><i class="row" id="r1"></i><i class="row" id="r2"></i>'; }
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(ids(el.evenRows), ['r0', 'r2']);
  assert.strictEqual(el.second.id, 'r1');
  assert.strictEqual(el.first.id, 'r0');
  destroy();
});

test('assigning null / undefined / [] removes the matched elements; other values are ignored', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('q-remove');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @query('.a') a?: HTMLElement | null;
    @query('.b') b?: HTMLElement;
    @queryAll('.c') cs?: HTMLElement[];
    @onConnectedBodyShadow render() { return '<p class="a"></p><p class="b"></p><p class="c"></p><p class="c"></p><p class="keep"></p>'; }
  }
  const el = await mount<any>(w, tag);
  const sr = el.shadowRoot;
  el.a = sr.querySelector('.keep'); // 요소 대입은 아무 일도 안 한다
  assert.ok(sr.querySelector('.a'));
  el.a = null;
  el.b = undefined;
  el.cs = [];
  assert.strictEqual(sr.querySelector('.a'), null);
  assert.strictEqual(sr.querySelector('.b'), null);
  assert.strictEqual(sr.querySelectorAll('.c').length, 0);
  assert.ok(sr.querySelector('.keep'));
  destroy();
});
