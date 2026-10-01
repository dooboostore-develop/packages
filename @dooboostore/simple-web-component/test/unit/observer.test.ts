import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onConnectedBodyLight, mutationObserverLight, mutationObserverShadow,
  mutationObserverDelegateShadow, resizeObserverLight, resizeObserverShadow, resizeObserverDelegateShadow,
  intersectionObserverShadow, intersectionObserverDelegateShadow, mutationObserver
} from '../../src/index.ts';

// 실제 ResizeObserver / IntersectionObserver 는 레이아웃에 따라 콜백 시점이 달라 검증이 흔들린다 — 콜백을 직접 일으키는 가짜를 쓴다.
// swc 는 elementDefine 의 config window(w)에서 읽으므로 w 에 가짜를 심는다.
class FakeObserver {
  observed: Element[] = [];
  observeOptions: any[] = [];
  unobserved: Element[] = [];
  disconnected = false;
  constructor(public cb: (entries: any[], obs: any) => void, public options?: any) {}
  observe(el: Element, opts?: any) { this.observed.push(el); this.observeOptions.push(opts); }
  unobserve(el: Element) { this.unobserved.push(el); this.observed = this.observed.filter(e => e !== el); }
  disconnect() { this.disconnected = true; }
  fire(targets: Element[]) { this.cb(targets.map(target => ({ target })), this); }
}
const installFakes = (w: any) => {
  const resize: FakeObserver[] = [];
  const intersection: FakeObserver[] = [];
  w.ResizeObserver = class extends FakeObserver { constructor(cb: any, o?: any) { super(cb, o); resize.push(this); } };
  w.IntersectionObserver = class extends FakeObserver { constructor(cb: any, o?: any) { super(cb, o); intersection.push(this); } };
  return { resize, intersection };
};

test('bare @mutationObserver fires on childList changes of the element', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-this');
  const calls: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @mutationObserver onChange(els: HTMLElement[], muts: MutationRecord[], obs: MutationObserver) { calls.push({ els, muts, obs }); }
  }
  const el = await mount<any>(w, tag);
  const span = w.document.createElement('span');
  el.appendChild(span);
  await sleep(10);
  assert.strictEqual(calls.length, 1);
  // 자기 자신을 보므로 추가된 노드가 아니라 자기 자신 하나만 온다 (추가된 노드는 mutations 에 있다)
  assert.deepStrictEqual(calls[0].els, [el]);
  assert.deepStrictEqual([...calls[0].muts[0].addedNodes], [span]);
  assert.strictEqual(calls[0].muts[0].type, 'childList');
  assert.ok(calls[0].obs instanceof w.MutationObserver);
  destroy();
});

test('@mutationObserverLight({ attributes, subtree }) sees attribute changes deep in light DOM', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-light');
  const seen: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @mutationObserverLight({ attributes: true, subtree: true }) onAttr(_els: any, muts: MutationRecord[]) { muts.forEach(m => seen.push(`${m.type}:${m.attributeName}`)); }
    @onConnectedBodyLight render() { return '<div><p id="deep"></p></div>'; }
  }
  const el = await mount<any>(w, tag);
  el.querySelector('#deep').setAttribute('data-x', '1');
  await sleep(10);
  assert.deepStrictEqual(seen, ['attributes:data-x']);
  destroy();
});

test('non-delegate selector observes only the elements matched at connect time', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-sel');
  const seen: string[][] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @mutationObserverShadow('.box', { attributes: true }) onBox(els: HTMLElement[]) { seen.push(els.map(e => e.id)); }
    @onConnectedBodyShadow render() { return '<div class="box" id="b1"></div><div id="other"></div>'; }
  }
  const el = await mount<any>(w, tag);
  const sr = el.shadowRoot;
  sr.querySelector('#other').setAttribute('x', '1');
  const late = w.document.createElement('div');
  late.className = 'box';
  late.id = 'late';
  sr.appendChild(late);
  await sleep(10);
  late.setAttribute('x', '1'); // 연결 후에 생긴 .box 는 observe 대상이 아님
  sr.querySelector('#b1').setAttribute('x', '1');
  await sleep(10);
  assert.deepStrictEqual(seen, [['b1']]);
  destroy();
});

test('@mutationObserverDelegateShadow catches dynamically added matching nodes', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-delegate');
  const seen: string[][] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @mutationObserverDelegateShadow('.item', { childList: true }) onItem(els: HTMLElement[]) { seen.push(els.map(e => e.id)); }
    @onConnectedBodyShadow render() { return '<ul></ul>'; }
  }
  const el = await mount<any>(w, tag);
  const ul = el.shadowRoot.querySelector('ul');
  const li = w.document.createElement('li');
  li.className = 'item';
  li.id = 'i1';
  ul.appendChild(li);
  await sleep(10);
  ul.appendChild(w.document.createElement('span')); // 매칭 안 됨
  await sleep(10);
  assert.deepStrictEqual(seen, [['i1']]);
  destroy();
});

test('mutation observer: filter gates the handler; disconnect stops it and calls removeObserver', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-cleanup');
  const calls: number[] = [];
  const removed: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @mutationObserverLight({ childList: true, filter: (els) => els.length > 0 && calls.length < 1, removeObserver: (t) => removed.push(t) })
    onChange() { calls.push(1); }
  }
  const el = await mount<any>(w, tag);
  el.appendChild(w.document.createElement('i'));
  await sleep(10);
  el.appendChild(w.document.createElement('i')); // filter 가 막음
  await sleep(10);
  assert.strictEqual(calls.length, 1);
  el.remove();
  assert.deepStrictEqual(removed, [el]);
  el.appendChild(w.document.createElement('i'));
  await sleep(10);
  assert.strictEqual(calls.length, 1);
  destroy();
});

test('bare @resizeObserverLight observes the element and passes (matchedEls, entries, observer)', async () => {
  const { w, destroy } = await createWindow();
  const fakes = installFakes(w);
  const tag = uniqueTag('ro-this');
  const calls: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @resizeObserverLight onResize(els: HTMLElement[], entries: any[], obs: any) { calls.push({ els, entries, obs }); }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(fakes.resize.length, 1);
  const ro = fakes.resize[0];
  assert.deepStrictEqual(ro.observed, [el]);
  ro.fire([el]);
  await sleep(5);
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0].els, [el]);
  assert.strictEqual(calls[0].entries[0].target, el);
  assert.strictEqual(calls[0].obs, ro);
  el.remove();
  assert.strictEqual(ro.disconnected, true);
  destroy();
});

test('@resizeObserverShadow(selector, { box }) observes matched elements with the box option', async () => {
  const { w, destroy } = await createWindow();
  const fakes = installFakes(w);
  const tag = uniqueTag('ro-sel');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @resizeObserverShadow('.card', { box: 'border-box' }) onResize() {}
    @onConnectedBodyShadow render() { return '<div class="card" id="c1"></div><div class="card" id="c2"></div><div id="x"></div>'; }
  }
  await mount<any>(w, tag);
  const ro = fakes.resize[0];
  assert.deepStrictEqual(ro.observed.map((e: any) => e.id), ['c1', 'c2']);
  assert.deepStrictEqual(ro.observeOptions, [{ box: 'border-box' }, { box: 'border-box' }]);
  destroy();
});

test('@resizeObserverDelegateShadow tracks dynamically added / removed matching elements', async () => {
  const { w, destroy } = await createWindow();
  const fakes = installFakes(w);
  const tag = uniqueTag('ro-delegate');
  const seen: string[][] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @resizeObserverDelegateShadow('.card') onResize(els: HTMLElement[]) { seen.push(els.map(e => e.id)); }
    @onConnectedBodyShadow render() { return '<section></section>'; }
  }
  const el = await mount<any>(w, tag);
  const ro = fakes.resize[0];
  assert.deepStrictEqual(ro.observed, []);
  const card = w.document.createElement('div');
  card.className = 'card';
  card.id = 'c1';
  el.shadowRoot.querySelector('section').appendChild(card);
  await sleep(10);
  assert.deepStrictEqual(ro.observed, [card]);
  ro.fire([card]);
  await sleep(5);
  assert.deepStrictEqual(seen, [['c1']]);
  card.remove();
  await sleep(10);
  assert.deepStrictEqual(ro.unobserved, [card]);
  destroy();
});

test('@intersectionObserverShadow passes threshold / rootMargin / intersectionRoot to the observer', async () => {
  const { w, destroy } = await createWindow();
  const fakes = installFakes(w);
  const tag = uniqueTag('io-sel');
  const scroller = w.document.createElement('div');
  const seen: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @intersectionObserverShadow('.lazy', { threshold: 0.5, rootMargin: '10px', intersectionRoot: scroller })
    onSeen(els: HTMLElement[], entries: any[]) { seen.push([els.map(e => e.id), entries.length]); }
    @onConnectedBodyShadow render() { return '<img class="lazy" id="a"><img class="lazy" id="b"><img id="c">'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(fakes.intersection.length, 1);
  const io = fakes.intersection[0];
  assert.deepStrictEqual(io.options, { root: scroller, rootMargin: '10px', threshold: 0.5 });
  assert.deepStrictEqual(io.observed.map((e: any) => e.id), ['a', 'b']);
  io.fire([el.shadowRoot.querySelector('#b')]);
  await sleep(5);
  assert.deepStrictEqual(seen, [[['b'], 1]]);
  el.remove();
  assert.strictEqual(io.disconnected, true);
  destroy();
});

test('intersection observers are grouped by options: different thresholds → separate observers', async () => {
  const { w, destroy } = await createWindow();
  const fakes = installFakes(w);
  const tag = uniqueTag('io-group');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @intersectionObserverShadow('.a', { threshold: 0 }) onA() {}
    @intersectionObserverShadow('.b', { threshold: 0 }) onB() {}
    @intersectionObserverShadow('.c', { threshold: 1 }) onC() {}
    @onConnectedBodyShadow render() { return '<i class="a"></i><i class="b"></i><i class="c"></i>'; }
  }
  await mount<any>(w, tag);
  assert.deepStrictEqual(fakes.intersection.map(o => [o.options.threshold, o.observed.map((e: any) => e.className)]), [[0, ['a', 'b']], [1, ['c']]]);
  destroy();
});

test('@intersectionObserverDelegateShadow observes added and unobserves removed matching elements', async () => {
  const { w, destroy } = await createWindow();
  const fakes = installFakes(w);
  const tag = uniqueTag('io-delegate');
  const seen: string[][] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @intersectionObserverDelegateShadow('.card') onSeen(els: HTMLElement[]) { seen.push(els.map(e => e.id)); }
    @onConnectedBodyShadow render() { return '<div id="list"></div>'; }
  }
  const el = await mount<any>(w, tag);
  const io = fakes.intersection[0];
  const wrap = w.document.createElement('div');
  wrap.innerHTML = '<p class="card" id="c1"></p><p id="no"></p>';
  el.shadowRoot.querySelector('#list').appendChild(wrap); // 하위에 있는 매칭 요소도 잡는다
  await sleep(10);
  assert.deepStrictEqual(io.observed.map((e: any) => e.id), ['c1']);
  io.fire([wrap.querySelector('#c1')!, wrap.querySelector('#no')!]);
  await sleep(5);
  assert.deepStrictEqual(seen, [['c1']]);
  wrap.remove();
  await sleep(10);
  assert.deepStrictEqual(io.unobserved.map((e: any) => e.id), ['c1']);
  destroy();
});
