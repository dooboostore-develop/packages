import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, bootApp, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onConnectedBodyLight, event, eventDelegateLight, eventDelegateShadow, eventClick,
  eventClickDelegateLight, eventKeydownWindow, eventDocument, eventAppHost, eventObject, matchedElement, hostSet, helperHostSet,
  helperSet, eventBeforeReturn, emitCustomEvent, emitLight, EMIT_CUSTOM_EVENT_METADATA_KEY
} from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;
const click = (w: any, el: Element) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));

test('@event binds to shadow elements and passes the event as the first legacy argument', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev');
  const got: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<button class="b">x</button><button class="c">y</button>'; }
    @event('.b', 'click') onB(e: Event) { got.push(e.type, (e.target as Element).className); }
  }
  const el = await mount(w, tag);
  click(w, el.shadowRoot.querySelector('.c'));
  click(w, el.shadowRoot.querySelector('.b'));
  await sleep();
  assert.deepStrictEqual(got, ['click', 'b']);
  destroy();
});

test('@eventDelegateLight handles light children added later; @matchedElement/@eventObject in any order', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-dl');
  const got: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @eventDelegateLight('.item', 'click')
    onItem(@matchedElement item: Element, @eventObject e: Event) { got.push([item.getAttribute('data-id'), e.type]); }
  }
  const el = await mount(w, tag);
  el.innerHTML = '<div class="item" data-id="1"><span>in</span></div>';
  click(w, el.querySelector('span')); // 자식에서 클릭 → closest('.item') 매칭
  await sleep();
  assert.deepStrictEqual(got, [['1', 'click']]);
  destroy();
});

test('delegate light/shadow only react to clicks in their own root', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-root');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<button class="b">s</button><slot></slot>'; }
    @eventDelegateShadow('.b', 'click') onShadow() { log.push('shadow'); }
    @eventClickDelegateLight('.b') onLight() { log.push('light'); }
  }
  const el = await mount(w, tag);
  el.innerHTML = '<button class="b">l</button>';
  click(w, el.shadowRoot.querySelector('.b'));
  await sleep();
  click(w, el.querySelector('.b'));
  await sleep();
  assert.deepStrictEqual(log, ['shadow', 'light']);
  destroy();
});

test("@eventClick('.sel', options) targets the selector; bare / options-only target the element itself", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-typed-sel');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<button class="b">b</button><button class="other">o</button>'; }
    @eventClick('.b', { once: true }) onB() { log.push('b'); }
  }
  const el: any = await mount(w, tag);
  click(w, el.querySelector('.other'));
  click(w, el.querySelector('.b'));
  click(w, el.querySelector('.b'));
  await sleep();
  assert.deepStrictEqual(log, ['b'], 'only .b, and once');
  destroy();
});

test('bare @eventClick listens on the element itself; options form works too', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-this');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    locked = false;
    @eventClick onClick(e: Event) { log.push(`bare:${e.type}`); }
    @eventClick({ filter: (_e, meta) => !meta.currentThis.locked }) onFiltered() { log.push('filtered'); }
  }
  const el = await mount<any>(w, tag);
  click(w, el);
  await sleep();
  el.locked = true;
  click(w, el);
  await sleep();
  assert.deepStrictEqual(log, ['bare:click', 'filtered', 'bare:click']);
  destroy();
});

test("@eventClick on a shadow element: root 'auto' listens on the shadowRoot; root 'light' on the element itself", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-this-sh');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<p>x</p>'; }
    @eventClick onAuto() { log.push('auto'); }
    @eventClick({ root: 'light' }) onHost() { log.push('light'); }
  }
  const el: any = await mount(w, tag);
  click(w, el.shadowRoot.querySelector('p')); // shadow 안쪽 클릭 → shadowRoot 를 지나 요소까지 올라간다
  await sleep();
  assert.deepStrictEqual(log.splice(0).sort(), ['auto', 'light']);
  click(w, el); // 요소 자체에 보낸 이벤트는 안쪽 shadowRoot 로 내려가지 않는다
  await sleep();
  assert.deepStrictEqual(log, ['light']);
  destroy();
});

test('filter false skips; before return is injected via @eventBeforeReturn; finally sees the result', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-opt');
  const log: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    allow = false;
    @eventClick({
      filter: (_e, { currentThis }) => currentThis.allow,
      before: () => 'B',
      finally: (_e, _m, ctx) => { log.push(['finally', ctx.result]); }
    })
    onClick(@eventBeforeReturn b: string) { log.push(['handler', b]); return 'R'; }
  }
  const el = await mount<any>(w, tag);
  click(w, el);
  await sleep();
  assert.deepStrictEqual(log, []);
  el.allow = true;
  click(w, el);
  await sleep();
  assert.deepStrictEqual(log, [['handler', 'B'], ['finally', 'R']]);
  destroy();
});

test('once / preventDefault / stopPropagation options', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-flags');
  let onceCount = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<a class="once">o</a><a class="stop">s</a>'; }
    @event('.once', 'click', { once: true }) onOnce() { onceCount++; }
    @event('.stop', 'click', { preventDefault: true, stopPropagation: true }) onStop() {}
  }
  const el = await mount(w, tag);
  let reachedBody = 0;
  w.document.body.addEventListener('click', () => reachedBody++);
  click(w, el.shadowRoot.querySelector('.once'));
  click(w, el.shadowRoot.querySelector('.once'));
  await sleep();
  assert.strictEqual(onceCount, 1);
  assert.strictEqual(reachedBody, 2);
  const e = new w.MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
  el.shadowRoot.querySelector('.stop').dispatchEvent(e);
  assert.strictEqual(e.defaultPrevented, true);
  assert.strictEqual(reachedBody, 2, 'stopPropagation keeps it from bubbling to body');
  destroy();
});

test('window/document listeners fire while connected and are removed on disconnect', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-win');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @eventKeydownWindow onKey(e: KeyboardEvent) { log.push(`win:${e.key}`); }
    @eventDocument('ping') onPing() { log.push('doc:ping'); }
  }
  const el = await mount(w, tag);
  w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'a' }));
  w.document.dispatchEvent(new w.Event('ping'));
  await sleep();
  el.remove();
  await sleep(10);
  w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'b' }));
  w.document.dispatchEvent(new w.Event('ping'));
  await sleep();
  assert.deepStrictEqual(log, ['win:a', 'doc:ping']);
  destroy();
});

test('@hostSet / @helperHostSet / @helperSet inject host tree and DOM helpers', async () => {
  const { w, destroy } = await createWindow();
  const outerTag = uniqueTag('ev-outer');
  const innerTag = uniqueTag('ev-inner');
  let got: any;
  @elementDefine(outerTag, { window: w })
  class Outer extends w.HTMLElement {}
  @elementDefine(innerTag, { window: w })
  class Inner extends w.HTMLElement {
    @eventClick
    onClick(@helperSet hp: any, @hostSet hs: any, @helperHostSet full: any) { got = { hp, hs, full }; }
  }
  w.document.body.innerHTML = `<${outerTag}><${innerTag}></${innerTag}></${outerTag}>`;
  await sleep(30);
  const outer = w.document.querySelector(outerTag);
  const inner = w.document.querySelector(innerTag);
  click(w, inner);
  await sleep();
  assert.strictEqual(got.hs.$host, outer);
  assert.deepStrictEqual(got.hs.$hosts, [outer]);
  assert.strictEqual(got.hp.$d, w.document);
  assert.strictEqual(got.hp.$w, w);
  assert.strictEqual('$host' in got.hp, false, 'helperSet has no host info');
  assert.strictEqual(got.full.$this, inner);
  assert.strictEqual(got.full.$host, outer);
  assert.strictEqual(got.full.$d, w.document);
  destroy();
});

test('@emitCustomEvent(type) dispatches on the element itself: a bubbling composed CustomEvent with the (async) return value as detail', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-emit');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @emitCustomEvent('saved') save(id: number) { return { id }; }
    @emitCustomEvent('loaded') async load() { await sleep(5); return 'L'; }
  }
  const el = await mount<any>(w, tag);
  const got: any[] = [];
  w.document.body.addEventListener('saved', (e: any) => got.push([e.detail, e.bubbles, e.composed]));
  w.document.body.addEventListener('loaded', (e: any) => got.push([e.detail]));
  assert.deepStrictEqual(el.save(3), { id: 3 }, 'return value passes through');
  assert.strictEqual(await el.load(), 'L');
  assert.deepStrictEqual(got, [[{ id: 3 }, true, true], ['L']]);
  destroy();
});

test('@emitCustomEvent attributeName lets the parent bind a handler script with event and $data', async () => {
  const { w, destroy } = await createWindow();
  const outerTag = uniqueTag('ev-parent');
  const innerTag = uniqueTag('ev-child');
  const got: any[] = [];
  @elementDefine(outerTag, { window: w })
  class Outer extends w.HTMLElement { onNav(e: Event, data: any) { got.push([e.type, data]); } }
  @elementDefine(innerTag, { window: w })
  class Inner extends w.HTMLElement {
    @emitCustomEvent('navigate', { attributeName: 'on-emit-navigate' }) go(path: string) { return { path }; }
  }
  w.document.body.innerHTML = `<${outerTag}><${innerTag} on-emit-navigate="$host.onNav(event, $data)"></${innerTag}></${outerTag}>`;
  await sleep(30);
  w.document.querySelector(innerTag).go('/a');
  await sleep(10);
  assert.deepStrictEqual(got, [['navigate', { path: '/a' }]]);
  destroy();
});

test('@emitLight dispatches on matching light children; filter can skip a target', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-emit2');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @emitLight('.t', 'hit', { filter: (t: any) => t.id !== 'skip' }) fire() { return 'A'; }
  }
  const el = await mount<any>(w, tag);
  el.innerHTML = '<i class="t" id="one"></i><i class="t" id="skip"></i>';
  const got: string[] = [];
  el.querySelectorAll('.t').forEach((t: Element) => t.addEventListener('hit', (e: any) => got.push(`${t.id}:${e.detail}`)));
  el.fire();
  assert.deepStrictEqual(got, ['one:A']);
  destroy();
});

test('@emitCustomEvent valueKey: sends that key when present, else the whole return; the method still returns everything', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-emit3');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @emitCustomEvent('$this', 'e1', { valueKey: 'a' })
    @emitCustomEvent('$this', 'e2', { valueKey: 'b' })
    fire() { return { a: 'A', b: 'B' }; }
    @emitCustomEvent('e3', { valueKey: 'missing' }) whole() { return { x: 1 }; }
    @emitCustomEvent('e4') byDefaultKey() { return { [EMIT_CUSTOM_EVENT_METADATA_KEY]: 'D', other: 1 }; }
  }
  const el = await mount<any>(w, tag);
  const got: any[] = [];
  for (const t of ['e1', 'e2', 'e3', 'e4']) el.addEventListener(t, (e: any) => got.push([t, e.detail]));
  assert.deepStrictEqual(el.fire(), { a: 'A', b: 'B' }, 'return value is passed through untouched');
  el.whole();
  el.byDefaultKey();
  assert.deepStrictEqual(got.sort(), [['e1', 'A'], ['e2', 'B'], ['e3', { x: 1 }], ['e4', 'D']]);
  destroy();
});

test('@eventAppHost receives events dispatched on the app host, with filter', async () => {
  const tag = uniqueTag('ev-apphost');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const log: string[] = [];
  await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @eventAppHost('user-action', { filter: (e: any) => e.detail?.type === 'login' }) onLogin(e: CustomEvent) { log.push(e.detail.name); }
    }
    return tag;
  }]);
  const app = w.document.querySelector('#app');
  app.dispatchEvent(new w.CustomEvent('user-action', { detail: { type: 'logout', name: 'x' } }));
  app.dispatchEvent(new w.CustomEvent('user-action', { detail: { type: 'login', name: 'kim' } }));
  await sleep();
  assert.deepStrictEqual(log, ['kim']);
  destroy();
});

// 회귀: debounce 뒤에 핸들러가 돌면 event.currentTarget 은 이미 null (dispatch 종료) → @matchedElement 가 null 이었다
test('@matchedElement survives debounceTime (captured at dispatch, not read later)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ev-debounce');
  const got: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<input class="q" />'; }
    @event('.q', 'input', { debounceTime: 30 }) onQ(@matchedElement input: HTMLInputElement) { got.push(input?.value); }
  }
  const el = await mount(w, tag);
  const input = el.shadowRoot.querySelector('.q');
  for (const v of ['a', 'ab', 'abc']) { input.value = v; input.dispatchEvent(new w.Event('input', { bubbles: true })); }
  await sleep(80);
  assert.deepStrictEqual(got, ['abc']);
  destroy();
});
