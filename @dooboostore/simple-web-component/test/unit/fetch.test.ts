import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, fetch, fetchSettled, fetchManual, fetchGet, fetchPost, fetchPut, fetchDelete, fetchLatest
} from '../../src/index.ts';
import { isHttpResponseError } from '@dooboostore/core';

type Call = { url: string; method: string; headers: Record<string, string>; body: any; signal?: AbortSignal };

/** 요소 window 의 fetch 를 가로챈다. respond 로 응답을 정한다 */
const mockFetch = (w: any, respond: (c: Call) => Response | Promise<Response> = () => json({ ok: true })) => {
  const calls: Call[] = [];
  w.fetch = async (url: any, init: RequestInit = {}) => {
    const c: Call = { url: String(url), method: init.method ?? 'GET', headers: Object.fromEntries(new Headers(init.headers).entries()), body: init.body, signal: init.signal ?? undefined };
    calls.push(c);
    return respond(c);
  };
  return calls;
};
const json = (v: any, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'Content-Type': 'application/json' } });

test('before mode: settled result is injected via @fetchSettled', async () => {
  const { w, destroy } = createWindow();
  const calls = mockFetch(w, () => json({ title: 'post' }));
  const tag = uniqueTag('f-before');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/post/1') async load(@fetchSettled settled?: PromiseSettledResult<any>) { return settled; }
  }
  const el = await mount<any>(w, tag);
  const settled = await el.load();
  assert.deepStrictEqual(settled, { status: 'fulfilled', value: { title: 'post' } });
  assert.strictEqual(calls[0].method, 'GET');
  destroy();
});

// 회귀: headers 를 객체 spread 로 합쳐 Headers 인스턴스가 사라지던 문제 / 사용자 Content-Type 우선
test('after mode: process json encodes the return value; Headers instances and user Content-Type are kept', async () => {
  const { w, destroy } = createWindow();
  const calls = mockFetch(w);
  const tag = uniqueTag('f-after');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch({ url: '/api/a', trigger: 'after', process: 'json' }) async save() { return { a: 1 }; }
    @fetch({ url: '/api/b', trigger: 'after', process: 'json', request: () => ({ method: 'POST', headers: new Headers({ 'Content-Type': 'text/x-custom', 'X-A': '1' }) }) })
    async saveCustom() { return { b: 2 }; }
  }
  const el = await mount<any>(w, tag);
  await el.save();
  await el.saveCustom();
  assert.strictEqual(calls[0].method, 'POST');
  assert.strictEqual(calls[0].headers['content-type'], 'application/json');
  assert.strictEqual(calls[0].body, '{"a":1}');
  assert.strictEqual(calls[1].headers['content-type'], 'text/x-custom');
  assert.strictEqual(calls[1].headers['x-a'], '1');
  destroy();
});

// 회귀: Blob 을 JSON.stringify 해서 '{}' 가 전송되던 문제
test('process does not re-encode values that already are a BodyInit (Blob)', async () => {
  const { w, destroy } = createWindow();
  const calls = mockFetch(w);
  const tag = uniqueTag('f-blob');
  const blob = new Blob(['raw'], { type: 'text/plain' });
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch({ url: '/api/blob', trigger: 'after', process: 'json' }) async save() { return blob; }
  }
  const el = await mount<any>(w, tag);
  await el.save();
  assert.strictEqual(calls[0].body, blob);
  destroy();
});

// 회귀: 실패가 문자열 Error 라 status 를 꺼낼 수 없던 문제
test('a non-OK response rejects with HttpResponseError carrying the response and parsed body', async () => {
  const { w, destroy } = createWindow();
  mockFetch(w, () => json({ message: 'nope' }, 404));
  const tag = uniqueTag('f-404');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/missing') async load(@fetchSettled settled?: PromiseSettledResult<any>) { return settled; }
  }
  const el = await mount<any>(w, tag);
  const settled = await el.load();
  assert.strictEqual(settled.status, 'rejected');
  assert.ok(isHttpResponseError(settled.reason));
  assert.strictEqual(settled.reason.response.status, 404);
  assert.deepStrictEqual(settled.reason.body, { message: 'nope' });
  destroy();
});

test('filter false skips the whole call (no fetch, no method)', async () => {
  const { w, destroy } = createWindow();
  const calls = mockFetch(w);
  const tag = uniqueTag('f-filter');
  let ran = false;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch({ url: '/api/x', filter: () => false }) async load() { ran = true; return 'ran'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(await el.load(), undefined);
  assert.strictEqual(ran, false);
  assert.strictEqual(calls.length, 0);
  destroy();
});

test('manual: gets params and signal; in after mode also the return value', async () => {
  const { w, destroy } = createWindow();
  const tag = uniqueTag('f-manual');
  let got: any;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual((_s, _h, p, signal) => { got = { p, isSignal: signal instanceof AbortSignal }; return p[0] * 2; })
    async load(_n: number, @fetchSettled settled?: PromiseSettledResult<number>) { return settled; }
    @fetchManual((_s, _h, _p, _sig, rv) => `sent:${rv}`, { trigger: 'after' })
    async save() { return 'body'; }
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(await el.load(21), { status: 'fulfilled', value: 42 });
  assert.deepStrictEqual(got.p, [21]);
  assert.strictEqual(got.isSignal, true);
  assert.strictEqual(await el.save(), 'sent:body');
  destroy();
});

// 회귀: 떨어진 요소의 DOM 을 건드리지 않게 — disconnect 되면 진행 중 호출은 조용히 끝나고 method/after 는 안 돈다
test('disconnect aborts an in-flight call: ends with undefined, method and after skipped, finally gets AbortError', async () => {
  const { w, destroy } = createWindow();
  const tag = uniqueTag('f-disconnect');
  const seen = { method: false, after: false, finallyError: '' };
  let signalAborted = false;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual((_s, _h, _p, signal) => new Promise(r => { signal.addEventListener('abort', () => { signalAborted = true; }); setTimeout(() => r('late'), 300); }), {
      after: () => { seen.after = true; },
      finally: (_c, _h, _p, ctx) => { seen.finallyError = ctx.error?.name ?? 'none'; }
    })
    async load() { seen.method = true; }
  }
  const el = await mount<any>(w, tag);
  const pending = el.load();
  await sleep(20);
  el.remove();
  const t0 = Date.now();
  assert.strictEqual(await pending, undefined);
  assert.ok(Date.now() - t0 < 200, 'should end right away, not after the slow manual (race)');
  await sleep(350);
  assert.deepStrictEqual(seen, { method: false, after: false, finallyError: 'AbortError' });
  assert.strictEqual(signalAborted, true);
  destroy();
});

// 회귀: 떠나기 직전 걸어둔 setTimeout 등, disconnect 뒤에 새로 시작하는 호출
test('a call that starts after disconnect is skipped; reconnecting re-enables it', async () => {
  const { w, destroy } = createWindow();
  const tag = uniqueTag('f-detached');
  let runs = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual(() => 'ok') async load(@fetchSettled s?: PromiseSettledResult<string>) { runs++; return s?.status; }
  }
  const el = await mount<any>(w, tag);
  el.remove();
  await sleep(10);
  assert.strictEqual(await el.load(), undefined);
  assert.strictEqual(runs, 0);
  w.document.body.appendChild(el);
  await sleep(20);
  assert.strictEqual(await el.load(), 'fulfilled');
  assert.strictEqual(runs, 1);
  destroy();
});

test('an element that was never connected can still call @fetch', async () => {
  const { w, destroy } = createWindow();
  const tag = uniqueTag('f-never');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual(() => 'ok') async load(@fetchSettled s?: PromiseSettledResult<string>) { return s?.status; }
  }
  const el: any = w.document.createElement(tag);
  assert.strictEqual(await el.load(), 'fulfilled');
  destroy();
});

test('abortPrevious / fetchLatest: an older in-flight call ends quietly, only the latest resolves', async () => {
  const { w, destroy } = createWindow();
  const tag = uniqueTag('f-latest');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchLatest({ manual: (_s, _h, p) => new Promise(r => setTimeout(() => r(p[0]), 50)) })
    async search(_q: string, @fetchSettled s?: PromiseSettledResult<string>) { return s?.status === 'fulfilled' ? s.value : s?.status; }
  }
  const el = await mount<any>(w, tag);
  const [a, b] = await Promise.all([el.search('a'), el.search('b')]);
  assert.strictEqual(a, undefined);
  assert.strictEqual(b, 'b');
  destroy();
});

test('method aliases fix the HTTP method and mode', async () => {
  const { w, destroy } = createWindow();
  const calls = mockFetch(w, c => json({ method: c.method }));
  const tag = uniqueTag('f-alias');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchGet('/g', { request: () => ({ method: 'POST', headers: { 'X-H': '1' } }) }) async get(@fetchSettled s?: PromiseSettledResult<any>) { return s; }
    @fetchPost('/p', { process: 'json' }) async post() { return { v: 1 }; }
    @fetchPut('/u', { process: 'json', valueKey: 'payload' }) async put() { return { payload: { v: 2 } }; }
    @fetchDelete((_c, _h, p) => `/d/${p[0]}`) async del(_id: number, @fetchSettled s?: PromiseSettledResult<any>) { return s; }
  }
  const el = await mount<any>(w, tag);
  await el.get();
  await el.post();
  await el.put();
  await el.del(3);
  assert.deepStrictEqual(calls.map(c => [c.method, c.url]), [['GET', '/g'], ['POST', '/p'], ['PUT', '/u'], ['DELETE', '/d/3']]);
  assert.strictEqual(calls[0].headers['x-h'], '1', 'request factory headers are kept, its method is overwritten');
  assert.strictEqual(calls[2].body, '{"v":2}');
  destroy();
});
