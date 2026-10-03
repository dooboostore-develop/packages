import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import { elementDefine, setInterval, setTimeout, requestAnimationFrame, setIntervalReturnValue, setTimeoutReturnValue, requestAnimationFrameReturnValue, around, eventMedia, eventMediaChange, SET_TIMEOUT_METADATA_KEY } from '../../src/index.ts';

test("@setInterval default 'onConnected': ticks with parameter, created gets the id, stops on disconnect", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('iv');
  const ticks: number[] = [];
  const created: number[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @setInterval(10, { parameter: () => [7], created: (_s, id) => created.push(id) })
    tick(n: number) { ticks.push(n); }
  }
  const el = await mount<any>(w, tag, {}, 60);
  assert.strictEqual(created.length, 1);
  assert.strictEqual(typeof created[0], 'number');
  assert.ok(ticks.length >= 2, `ticks=${ticks.length}`);
  assert.ok(ticks.every(n => n === 7));
  el.remove();
  const count = ticks.length;
  await sleep(40);
  assert.strictEqual(ticks.length, count);
  destroy();
});

test("@setIntervalReturnValue: nothing auto-starts; calling starts the returned fn, return passes through", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('iv-rv');
  const ids: number[] = [];
  let createdId = -1;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @setIntervalReturnValue(10, { created: (_s, id) => { createdId = id; } })
    start() { return (id: number) => { ids.push(id); }; }
  }
  const el = await mount<any>(w, tag, {}, 40);
  assert.strictEqual(createdId, -1);
  assert.deepStrictEqual(ids, []);
  const ret = el.start();
  assert.strictEqual(typeof ret, 'function');
  await sleep(45);
  assert.ok(ids.length >= 2, `ids=${ids.length}`);
  assert.ok(ids.every(id => id === createdId));
  el.remove();
  const count = ids.length;
  await sleep(30);
  assert.strictEqual(ids.length, count);
  destroy();
});

test("@setTimeout default 'onConnected': fires once; disconnect before the delay cancels it", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('to');
  let fired = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @setTimeout(10) once() { fired++; }
  }
  await mount(w, tag, {}, 50);
  assert.strictEqual(fired, 1);

  const early = w.document.createElement(tag);
  w.document.body.appendChild(early);
  await sleep(0);
  early.remove();
  await sleep(30);
  assert.strictEqual(fired, 1);
  destroy();
});

test("@setTimeoutReturnValue: callback under the default valueKey key fires once with its id", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('to-rv');
  const fired: number[] = [];
  let createdId = -1;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @setTimeoutReturnValue(10, { created: (_s, id) => { createdId = id; } })
    later() { return { other: 1, [SET_TIMEOUT_METADATA_KEY]: (id: number) => fired.push(id) }; }
  }
  const el = await mount<any>(w, tag);
  const ret = el.later();
  assert.strictEqual(ret.other, 1);
  await sleep(40);
  assert.deepStrictEqual(fired, [createdId]);
  destroy();
});

test('two instances: disconnecting one stops only its own interval', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('iv-two');
  const ticks = new Map<any, number>();
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @setInterval(10, { type: 'onConnected' }) tick() { ticks.set(this, (ticks.get(this) ?? 0) + 1); }
  }
  const a = await mount<any>(w, tag);
  const b = await mount<any>(w, tag);
  a.remove();
  const aCount = ticks.get(a) ?? 0;
  const bCount = ticks.get(b) ?? 0;
  await sleep(40);
  assert.strictEqual(ticks.get(a) ?? 0, aCount, 'a stopped');
  assert.ok((ticks.get(b) ?? 0) > bCount, 'b keeps ticking');
  b.remove();
  destroy();
});

test('bare @requestAnimationFrameReturnValue: returned frame fn loops with prevValue until it returns null', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('raf');
  const seen: (number | undefined)[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @requestAnimationFrameReturnValue
    animate() {
      return (ts: number, prev?: number) => {
        assert.strictEqual(typeof ts, 'number');
        seen.push(prev);
        const next = (prev ?? 0) + 1;
        return next <= 3 ? next : null;
      };
    }
  }
  const el = await mount<any>(w, tag, {}, 0);
  el.animate();
  await sleep(150);
  assert.deepStrictEqual(seen, [undefined, 1, 2, 3]);
  destroy();
});

test("bare @requestAnimationFrame (default 'onConnected'): calls the method each frame, cancelled on disconnect", async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('raf-c');
  let frames = 0;
  let createdId = -1;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @requestAnimationFrame({ created: (_s, id) => { createdId = id; } })
    frame() { frames++; return true; }
  }
  const el = await mount<any>(w, tag, {}, 80);
  assert.ok(frames >= 2, `frames=${frames}`);
  assert.notStrictEqual(createdId, -1);
  el.remove();
  const count = frames;
  await sleep(60);
  assert.strictEqual(frames, count);
  destroy();
});

test('bare @requestAnimationFrame with no options auto-starts (default onConnected)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('raf-bare');
  let frames = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @requestAnimationFrame
    frame() { frames++; return frames < 3 ? true : null; }
  }
  await mount<any>(w, tag, {}, 80);
  assert.strictEqual(frames, 3, 'runs on its own, stops when it returns null');
  destroy();
});

test('@around on a method: before rewrites args, after rewrites result, finally sees both', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ar');
  const fin: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @around({
      before: (_h, args: [string]) => [args[0].trim()],
      after: (_h, r: string) => r + '!',
      finally: (_h, ctx) => { fin.push(ctx); }
    })
    greet(name: string) { return `hi ${name}`; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.greet('  bob '), 'hi bob!');
  assert.deepStrictEqual(fin, [{ args: ['  bob '], result: 'hi bob!' }]);
  destroy();
});

test('@around: finally runs on throw and the error still propagates; async hooks resolve', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ar-err');
  const fin: any[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @around({ finally: (_h, ctx) => { fin.push(ctx.error?.message); } })
    fail() { throw new Error('nope'); }

    @around({ before: async (_h, args: [number]) => [args[0] * 2], after: async (_h, r: number) => r + 1 })
    async calc(n: number) { return n * 10; }
  }
  const el = await mount<any>(w, tag);
  assert.throws(() => el.fail(), /nope/);
  assert.deepStrictEqual(fin, ['nope']);
  assert.strictEqual(await el.calc(2), 41);
  destroy();
});

test('@around on a field: set applies to the initializer and assignments, get maps reads', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('ar-field');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @around({ set: (_h, v: string) => v?.trim() }) label: string = '  init ';
    @around({ get: (_h, v: string) => v?.toUpperCase() }) shout: string = 'a';
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.label, 'init');
  el.label = '  x  ';
  assert.strictEqual(el.label, 'x');
  assert.strictEqual(el.shout, 'A');
  el.shout = 'b';
  assert.strictEqual(el.shout, 'B');
  destroy();
});

test('@eventMediaChange / @eventMedia: subscribe to w.matchMedia on connect, unsubscribe on disconnect', async () => {
  const { w, destroy } = await createWindow();
  // 실제 matchMedia 는 창 크기가 바뀌어야 change 가 나므로, EventTarget 으로 흉내내 직접 발생시킨다
  const mqls: any[] = [];
  w.matchMedia = (query: string) => {
    const mql = new w.EventTarget();
    mql.media = query;
    mql.matches = false;
    mqls.push(mql);
    return mql;
  };
  const tag = uniqueTag('media');
  const log: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @eventMediaChange('(max-width: 600px)')
    onMobile(e: any) { log.push(`mobile:${e.matches}`); }
    @eventMedia('(prefers-color-scheme: dark)', 'change', { filter: e => (e as any).matches })
    onDark(e: any, helper: any) { log.push(`dark:${helper.$this === this}`); }
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(mqls.map(m => m.media), ['(max-width: 600px)', '(prefers-color-scheme: dark)']);
  const fire = (mql: any, matches: boolean) => { const e: any = new w.Event('change'); e.matches = matches; mql.dispatchEvent(e); };
  fire(mqls[0], true);
  fire(mqls[1], false); // filter 로 스킵
  fire(mqls[1], true);
  await sleep(10);
  assert.deepStrictEqual(log, ['mobile:true', 'dark:true']);
  el.remove();
  fire(mqls[0], false);
  await sleep(10);
  assert.deepStrictEqual(log, ['mobile:true', 'dark:true']);
  destroy();
});
