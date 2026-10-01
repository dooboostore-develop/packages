import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import { elementDefine, onConnectedBodyShadow, attribute, removeAttribute, changedAttribute, changedAttributeBeforeReturn } from '../../src/index.ts';

test('@removeAttribute(selector, name) removes the attribute and passes the return value through', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('rm-attr');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<a href="/x"></a><a href="/y"></a>'; }
    @removeAttribute('a', 'href') reset() { return 'kept'; }
    @removeAttribute('$this', 'data-on') off() { return undefined; }
  }
  const el = await mount<any>(w, tag, { 'data-on': '' });
  assert.strictEqual(el.reset(), 'kept');
  // 첫 매칭만이 아니라 매칭된 전부에서 제거
  assert.deepStrictEqual([...el.shadowRoot.querySelectorAll('a')].map((a: any) => a.hasAttribute('href')), [false, false]);
  assert.strictEqual(el.off(), undefined);
  assert.strictEqual(el.hasAttribute('data-on'), false);
  destroy();
});

test('@removeAttribute on an async method removes after the promise resolves', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('rm-attr-async');
  let seenDuring: boolean | undefined;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @removeAttribute('$this', 'busy') async load() { await sleep(5); seenDuring = this.hasAttribute('busy'); return 7; }
  }
  const el = await mount<any>(w, tag, { busy: '' });
  assert.strictEqual(await el.load(), 7);
  assert.strictEqual(seenDuring, true);
  assert.strictEqual(el.hasAttribute('busy'), false);
  destroy();
});

test('@changedAttribute(name) receives (newValue, oldValue, name)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('chg');
  const calls: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @changedAttribute('product-id') onId(nv: any, old: any, name: string) { calls.push([nv, old, name]); }
  }
  const el = await mount<any>(w, tag);
  el.setAttribute('product-id', '1');
  el.setAttribute('product-id', '2');
  el.removeAttribute('product-id');
  el.setAttribute('other', 'x'); // 다른 attribute 는 무시
  await sleep(10);
  assert.deepStrictEqual(calls, [['1', null, 'product-id'], ['2', '1', 'product-id'], [null, '2', 'product-id']]);
  destroy();
});

test('bare @changedAttribute uses the method name as the attribute name', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('chg-bare');
  const seen: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @changedAttribute status(nv: any) { seen.push(nv); }
  }
  const el = await mount<any>(w, tag);
  el.setAttribute('status', 'ready');
  await sleep(10);
  assert.deepStrictEqual(seen, ['ready']);
  destroy();
});

test('@changedAttribute type converts Number / Boolean', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('chg-type');
  const nums: any[] = [];
  const bools: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @changedAttribute('count', { type: Number }) onCount(nv: any) { nums.push(nv); }
    @changedAttribute('open', { type: Boolean }) onOpen(nv: any) { bools.push(nv); }
  }
  const el = await mount<any>(w, tag);
  el.setAttribute('count', '42');
  el.setAttribute('open', '');
  el.setAttribute('open', 'false');
  el.setAttribute('open', '0');
  await sleep(10);
  assert.deepStrictEqual(nums, [42]);
  assert.deepStrictEqual(bools, [true, false, false]);
  destroy();
});

test("while: 'connected' skips changes while disconnected and runs once on connect with the current value", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('chg-while');
  const seen: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @changedAttribute('mode', { while: 'connected' }) onMode(nv: any, old: any) { seen.push([nv, old]); }
  }
  const el = w.document.createElement(tag);
  el.setAttribute('mode', 'a'); // 아직 연결 전 → 스킵
  await sleep(10);
  assert.deepStrictEqual(seen, []);
  w.document.body.appendChild(el);
  await sleep(30);
  assert.deepStrictEqual(seen, [['a', null]]);
  el.setAttribute('mode', 'b');
  await sleep(10);
  assert.deepStrictEqual(seen, [['a', null], ['b', 'a']]);
  el.remove();
  el.setAttribute('mode', 'c');
  await sleep(10);
  assert.strictEqual(seen.length, 2);
  destroy();
});

test('@changedAttribute filter / before / finally hooks', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('chg-hooks');
  const log: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @changedAttribute('v', {
      filter: async (v) => v !== 'skip',
      before: (v) => `before:${v}`,
      finally: (v, _m, ctx) => { log.push(['finally', v, ctx.result]); }
    })
    onV(@changedAttributeBeforeReturn br: any) { log.push(['handler', br]); return 'r'; }
  }
  const el = await mount<any>(w, tag);
  el.setAttribute('v', 'skip');
  el.setAttribute('v', 'go');
  await sleep(20);
  assert.deepStrictEqual(log, [['handler', 'before:go'], ['finally', 'go', 'r']]);
  destroy();
});

test('{{= }} in an attribute is evaluated by the @attribute getter with this / helpers in scope', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('expr-get');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    base = 40;
    @attribute('sum') sum?: any;
    @attribute('same') same?: any;
    @attribute('num', { type: Number }) num?: any;
    @attribute('plain') plain?: any;
  }
  const el = await mount<any>(w, tag, { sum: '{{= this.base + 2 }}', same: '{{= $this === this && $d === this.ownerDocument }}', num: "{{= '7' }}", plain: 'just text' });
  assert.strictEqual(el.sum, 42);
  assert.strictEqual(el.same, true);
  assert.strictEqual(el.num, 7);
  assert.strictEqual(el.plain, 'just text');
  destroy();
});

test('{{= $host... }} resolves against the host component', async () => {
  const { w, destroy } = await createWindow();
  const outerTag = uniqueTag('expr-outer');
  const innerTag = uniqueTag('expr-inner');
  @elementDefine(innerTag, { window: w })
  class Inner extends w.HTMLElement {
    @attribute('product-id') productId?: any;
  }
  @elementDefine(outerTag, { window: w })
  class Outer extends w.HTMLElement {
    selectedId = 99;
    @onConnectedBodyShadow render() { return `<${innerTag} product-id="{{= $host.selectedId }}"></${innerTag}>`; }
  }
  const outer = await mount<any>(w, outerTag, {}, 60);
  assert.strictEqual(outer.shadowRoot.querySelector(innerTag).productId, 99);
  destroy();
});

test('{{= }} is evaluated before @changedAttribute and keeps its JS type', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('expr-chg');
  const seen: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @changedAttribute('data') onData(nv: any) { seen.push(nv); }
  }
  const el = await mount<any>(w, tag);
  el.setAttribute('data', '{{= ({ a: 1 }) }}');
  el.setAttribute('data', '{{= [1, 2] }}');
  await sleep(10);
  assert.deepStrictEqual(seen, [{ a: 1 }, [1, 2]]);
  destroy();
});

test('{{= }} that throws falls back to the raw string', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('expr-err');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute('bad') bad?: any;
  }
  const origError = console.error;
  console.error = () => {}; // 의도된 에러 로그 숨김
  try {
    const el = await mount<any>(w, tag, { bad: '{{= nope.x }}' });
    assert.strictEqual(el.bad, '{{= nope.x }}');
  } finally {
    console.error = origError;
  }
  destroy();
});

test('{{= false }} with type Boolean stays false', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('expr-bool');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute('flag', { type: Boolean }) flag?: any;
  }
  const el = await mount<any>(w, tag, { flag: '{{= false }}' });
  assert.strictEqual(el.flag, false);
  destroy();
});
