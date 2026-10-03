import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onConnectedBodyLight, mutationObserverLight, mutationObserverShadow,
  mutationObserverDelegateShadow, resizeObserverLight, resizeObserverShadow, resizeObserverDelegateShadow,
  intersectionObserverShadow, intersectionObserverDelegateShadow, mutationObserver, resizeObserver, mutationObserverDelegate, resizeObserverDelegate
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

test('self observers attach at connect: bare @mutationObserver catches its own initial render', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-early');
  const seen: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight
    async render() {
      await sleep(50);
      return '<p class="r">hi</p>';
    }
    @mutationObserver onChange(els: HTMLElement[], muts: MutationRecord[]) {
      for (const m of muts) for (const n of Array.from(m.addedNodes)) {
        if (n.nodeType === 1 && (n as Element).matches?.('p.r')) seen.push('render-insert');
      }
    }
  }
  await mount<any>(w, tag, {}, 400);
  assert.ok(seen.includes('render-insert'), 'initial render insertion observed (attached before render)');
  destroy();
});

test('self observers do not double-fire: one post-render insertion, one call', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-once');
  let calls = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<p>hi</p>'; }
    @mutationObserver onChange() { calls++; }
  }
  const el = await mount<any>(w, tag, {}, 200);
  calls = 0;
  el.appendChild(w.document.createElement('span'));
  await sleep(50);
  assert.strictEqual(calls, 1, 'exactly one delivery (single observer, no duplicates)');
  const moCount = (el.__swc_observers ?? []).filter((o: any) => o instanceof w.MutationObserver).length;
  assert.strictEqual(moCount, 1, 'exactly one MutationObserver');
  destroy();
});

test('self observers attach at connect: bare @resizeObserver observes inst before render done', async () => {
  const { w, destroy } = await createWindow();
  const { resize } = installFakes(w);
  const tag = uniqueTag('ro-early');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight
    async render() {
      await sleep(200);
      return '<p>hi</p>';
    }
    @resizeObserver onResize() {}
  }
  const el = await mount<any>(w, tag, {}, 50);
  assert.ok(resize.length >= 1, 'single ResizeObserver created');
  assert.strictEqual(resize.length, 1, 'no duplicate ResizeObserver');
  assert.ok(resize[0].observed.includes(el), 'inst observed before render finished');
  destroy();
});

test('self + selector @resizeObserver on one element: each handler only gets its own targets', async () => {
  const { w, destroy } = await createWindow();
  const { resize } = installFakes(w);
  const tag = uniqueTag('ro-split');
  const self: any[] = [];
  const box: any[] = [];
  const boxEntryTargets: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<div class="box"></div>'; }
    @resizeObserver onSelf(els: HTMLElement[]) { self.push(...els); }
    @resizeObserver('.box') onBox(els: HTMLElement[], entries: any[]) { box.push(...els); boxEntryTargets.push(...entries.map(e => e.target)); }
  }
  const el = await mount<any>(w, tag);
  const boxEl = el.querySelector('.box');
  resize[0].fire([el]);
  resize[0].fire([el, boxEl]); // 한 배치에 둘 다
  await sleep(10);
  assert.deepStrictEqual(boxEntryTargets, [boxEl], 'selector handler entries exclude inst even in a mixed batch');
  self.length = 0; box.length = 0;
  resize[0].fire([el]);
  resize[0].fire([boxEl]);
  await sleep(10);
  assert.deepStrictEqual(self, [el], 'self handler sees only inst');
  assert.deepStrictEqual(box, [boxEl], 'selector handler never sees inst');
  destroy();
});

test('non-subtree $this @mutationObserver ignores records from a sibling selector observer', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-split');
  let selfCalls = 0;
  let watchedCalls = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<div class="watched"></div>'; }
    @mutationObserver({ childList: true }) onSelf() { selfCalls++; }
    @mutationObserver('.watched', { childList: true, subtree: true }) onWatched() { watchedCalls++; }
  }
  const el = await mount<any>(w, tag, {}, 100);
  selfCalls = 0; watchedCalls = 0;
  el.querySelector('.watched').appendChild(w.document.createElement('span'));
  await sleep(20);
  assert.strictEqual(watchedCalls, 1);
  assert.strictEqual(selfCalls, 0, 'self (non-subtree) handler must not fire for a deep .watched change');
  destroy();
});

test('many observer decorators (self/selector/fn/delegate) still share one MutationObserver and one ResizeObserver', async () => {
  const { w, destroy } = await createWindow();
  const { resize } = installFakes(w);
  const tag = uniqueTag('obs-one');
  const realMO = w.MutationObserver; let moCreated = 0;
  w.MutationObserver = class extends realMO { constructor(cb: any) { super(cb); moCreated++; } };
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<div class="a"></div><div class="b"></div>'; }
    @mutationObserver onSelf() {}
    @mutationObserver('.a', { childList: true, subtree: true }) onA() {}
    @mutationObserver((el: any) => el.querySelector('.b')) onB() {}
    @mutationObserverDelegate('.c') onC() {}
    @resizeObserver onSelfSize() {}
    @resizeObserver('.a') onASize() {}
    @resizeObserverDelegate('.c') onCSize() {}
  }
  const el = await mount<any>(w, tag, {}, 100);
  assert.strictEqual(moCreated, 1, 'one MutationObserver');
  assert.strictEqual(resize.length, 1, 'one ResizeObserver');
  assert.strictEqual(el.__swc_observers.length, 2);
  destroy();
});

test('fn-selector @mutationObserver still fires next to a bare subtree @mutationObserver', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-fn-self');
  let fnCalls = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<div class="box"></div>'; }
    @mutationObserver({ subtree: true }) onSelf() {}
    @mutationObserver((el: any) => el.querySelector('.box')) onBox() { fnCalls++; }
  }
  const el = await mount<any>(w, tag, {}, 100);
  el.querySelector('.box').appendChild(w.document.createElement('i'));
  await sleep(30);
  assert.strictEqual(fnCalls, 1);
  destroy();
});

test('shadow component: bare @mutationObserver attaches before render and sees its own initial render', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-shadow-early');
  let added = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow async render() { await sleep(50); return '<p class="r">hi</p>'; }
    @mutationObserver onSelf(_e: any, muts: MutationRecord[]) { for (const m of muts) added += m.addedNodes.length; }
  }
  await mount<any>(w, tag, {}, 300);
  assert.ok(added > 0, 'initial shadow render observed');
  destroy();
});

test('bare @mutationObserver watches the whole subtree by default', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('mo-bare-deep');
  const added: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return '<ul><li class="x"></li></ul>'; }
    @mutationObserver onSelf(_e: any, muts: MutationRecord[]) { for (const m of muts) for (const n of Array.from(m.addedNodes)) added.push((n as Element).className); }
  }
  const el = await mount<any>(w, tag, {}, 100);
  added.length = 0;
  const li = w.document.createElement('li'); li.className = 'deep';
  el.querySelector('ul').appendChild(li);
  await sleep(20);
  assert.deepStrictEqual(added, ['deep']);
  destroy();
});

// 회귀: 연결 처리 await 중에 떼었다 붙이면 끝나지 않은 연결이 옵저버를 만들어 두고 아무도 disconnect 하지 않았다
test('sync remove/append during connect leaves no live orphan observers', async () => {
  const { w, destroy } = await createWindow();
  const live = new Set<any>();
  for (const k of ['MutationObserver', 'ResizeObserver']) {
    const C = (w as any)[k];
    (w as any)[k] = class extends C { constructor(cb: any) { super(cb); live.add(this); } disconnect() { live.delete(this); return super.disconnect(); } };
  }
  const tag = uniqueTag('race');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight async render() { await sleep(20); return '<p>x</p>'; }
    @mutationObserver onM() {}
    @resizeObserver onR() {}
  }
  const el = await mount<any>(w, tag, {}, 100);
  for (let i = 0; i < 3; i++) { el.remove(); w.document.body.appendChild(el); }
  await sleep(200);
  assert.strictEqual(live.size, 2, `live observers: ${live.size}`);
  el.remove(); await sleep(20);
  assert.strictEqual(live.size, 0, `after remove: ${live.size}`);
  destroy();
});
