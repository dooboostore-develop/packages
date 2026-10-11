import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, fetch, fetchPromise, fetchManual, fetchGet, fetchPost, fetchPut, fetchDelete, fetchLatest, attribute, eventClick, innerHtml, FetchLifeCycler
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

test('before mode: the request Promise is injected via @fetchPromise; the method is called right away', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w, () => json({ title: 'post' }));
  const tag = uniqueTag('f-before');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/post/1') load(@fetchPromise p: Promise<any>) { return p.then(v => v.title); }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(await el.load(), 'post');
  assert.strictEqual(calls[0].method, 'GET');
  destroy();
});

// 핵심: 반환 타입이 사용자가 쓴 그대로 — 동기 메서드는 동기로 남는다 (예전엔 래퍼가 항상 Promise 를 돌려줬다)
test('before mode keeps the declared return: a sync method stays sync', async () => {
  const { w, destroy } = await createWindow();
  mockFetch(w);
  const tag = uniqueTag('f-sync');
  let got: Promise<any> | undefined;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/x') load(@fetchPromise p: Promise<any>) { got = p; return 'now'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.load(), 'now', 'returned synchronously, not a Promise');
  assert.deepStrictEqual(await got, { ok: true });
  destroy();
});

// 회귀: headers 를 객체 spread 로 합쳐 Headers 인스턴스가 사라지던 문제 / 사용자 Content-Type 우선
test('after mode: process json encodes the return value; Headers instances and user Content-Type are kept', async () => {
  const { w, destroy } = await createWindow();
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
  const { w, destroy } = await createWindow();
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
  const { w, destroy } = await createWindow();
  mockFetch(w, () => json({ message: 'nope' }, 404));
  const tag = uniqueTag('f-404');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/missing') load(@fetchPromise p: Promise<any>) { return p.catch(e => e); }
  }
  const el = await mount<any>(w, tag);
  const error = await el.load();
  assert.ok(isHttpResponseError(error));
  assert.strictEqual(error.response.status, 404);
  assert.deepStrictEqual(error.body, { message: 'nope' });
  destroy();
});

test('filter false skips the whole call (no fetch, no method)', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w);
  const tag = uniqueTag('f-filter');
  let ran = false;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch({ url: '/api/x', filter: ({ args }) => args[0] !== 'skip' }) load(_q: string) { ran = true; return 'ran'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.load('skip'), undefined);
  assert.strictEqual(ran, false);
  assert.strictEqual(calls.length, 0);
  destroy();
});

test('manual: gets params and signal; in after mode also the return value', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('f-manual');
  let got: any;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual((_s, _h, p, signal) => { got = { p, isSignal: signal instanceof AbortSignal }; return p[0] * 2; })
    load(_n: number, @fetchPromise p: Promise<number>) { return p; }
    @fetchManual((_s, _h, _p, _sig, rv) => `sent:${rv}`, { trigger: 'after' })
    async save() { return 'body'; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(await el.load(21), 42);
  assert.deepStrictEqual(got.p, [21]);
  assert.strictEqual(got.isSignal, true);
  assert.strictEqual(await el.save(), 'sent:body');
  destroy();
});

// 회귀: 떨어진 요소의 DOM 을 건드리지 않게 — disconnect 되면 진행 중 요청을 끊고, 넘겨준 Promise 는 끝나지 않는다
test('disconnect aborts an in-flight request: the injected Promise never settles, the signal is aborted', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('f-disconnect');
  let signalAborted = false;
  let settled = false;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual((_s, _h, _p, signal) => new Promise(r => { signal.addEventListener('abort', () => { signalAborted = true; }); setTimeout(() => r('late'), 100); }))
    load(@fetchPromise p: Promise<string>) { p.then(() => { settled = true; }, () => { settled = true; }); }
  }
  const el = await mount<any>(w, tag);
  el.load();
  await sleep(20);
  el.remove();
  await sleep(200);
  assert.strictEqual(signalAborted, true);
  assert.strictEqual(settled, false, 'neither resolves nor rejects — nothing is drawn on a detached element');
  destroy();
});

// 회귀: 떠나기 직전 걸어둔 setTimeout 등, disconnect 뒤에 새로 시작하는 호출
test('a call that starts after disconnect is skipped; reconnecting re-enables it', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('f-detached');
  let runs = 0;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual(() => 'ok') load(@fetchPromise p: Promise<string>) { runs++; return p; }
  }
  const el = await mount<any>(w, tag);
  el.remove();
  await sleep(10);
  assert.strictEqual(el.load(), undefined);
  assert.strictEqual(runs, 0);
  w.document.body.appendChild(el);
  await sleep(20);
  assert.strictEqual(await el.load(), 'ok');
  assert.strictEqual(runs, 1);
  destroy();
});

test('an element that was never connected can still call @fetch', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('f-never');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual(() => 'ok') load(@fetchPromise p: Promise<string>) { return p; }
  }
  const el: any = w.document.createElement(tag);
  assert.strictEqual(await el.load(), 'ok');
  destroy();
});

test('abortPrevious / fetchLatest: an older in-flight call ends quietly, only the latest resolves', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('f-latest');
  const done: string[] = [];
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchLatest({ manual: (_s, _h, p) => new Promise(r => setTimeout(() => r(p[0]), 50)) })
    search(_q: string, @fetchPromise p: Promise<string>) { p.then(v => done.push(v), () => done.push('rejected')); }
  }
  const el = await mount<any>(w, tag);
  el.search('a');
  el.search('b');
  await sleep(120);
  assert.deepStrictEqual(done, ['b'], 'the superseded one never settles');
  destroy();
});

test('method aliases fix the HTTP method and mode', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w, c => json({ method: c.method }));
  const tag = uniqueTag('f-alias');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchGet('/g', { request: () => ({ method: 'POST', headers: { 'X-H': '1' } }) }) get(@fetchPromise p: Promise<any>) { return p; }
    @fetchPost('/p', { process: 'json' }) async post() { return { v: 1 }; }
    @fetchPut('/u', { process: 'json', valueKey: 'payload' }) async put() { return { payload: { v: 2 } }; }
    @fetchDelete((_c, _h, p) => `/d/${p[0]}`) del(_id: number, @fetchPromise p: Promise<any>) { return p; }
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

test('after mode on a sync method warns: the wrapper always returns a Promise', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w, () => json({ ok: true }));
  const tag = uniqueTag('f-sync-guard');
  const warns: string[] = [];
  const origWarn = console.warn;
  console.warn = (...a: any[]) => { warns.push(String(a[0])); };
  try {
    @elementDefine(tag, { window: w })
    class El extends w.HTMLElement {
      @fetch({ url: '/api/sync', trigger: 'after' }) save() { return 'plain'; }
    }
    const el = await mount<any>(w, tag);
    await el.save();
    assert.strictEqual(calls[0].body, 'plain');
    assert.ok(warns.some((m) => m.includes('always returns a Promise')), `expected Promise-mismatch guard, got: ${warns.join(' | ')}`);
  } finally { console.warn = origWarn; }
  destroy();
});

// ─── 필드 방식: declare 필드에 붙이면 프레임워크가 요청 함수를 만든다 (시그니처가 그대로 사실) ───

test('field: @fetchGet on a declare field becomes a request function — args build the url, returns the response', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w, c => json({ url: c.url }));
  const tag = uniqueTag('f-field-get');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchGet((_s, _h, [id]) => `/api/posts/${id}`) declare getPost: (id: number) => Promise<{ url: string }>;
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(await el.getPost(3), { url: '/api/posts/3' });
  assert.strictEqual(calls[0].method, 'GET');
  destroy();
});

test('field: @fetchPost sends the last argument as the body', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w, () => json({ id: 1 }));
  const tag = uniqueTag('f-field-post');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchPost('/api/posts', { process: 'json' }) declare create: (body: { title: string }) => Promise<{ id: number }>;
  }
  const el = await mount<any>(w, tag);
  assert.deepStrictEqual(await el.create({ title: 'hi' }), { id: 1 });
  assert.strictEqual(calls[0].method, 'POST');
  assert.strictEqual(calls[0].body, '{"title":"hi"}');
  destroy();
});

test('field: failure rejects; abortPrevious / filter / disconnect leave the Promise unsettled', async () => {
  const { w, destroy } = await createWindow();
  mockFetch(w, c => (c.url.includes('missing') ? json({}, 404) : json({ ok: true })));
  const tag = uniqueTag('f-field-rules');
  const done: string[] = [];
  let aborted = false;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/missing') declare missing: () => Promise<any>;
    @fetchLatest({ manual: (_s, _h, [q]) => new Promise(r => setTimeout(() => r(q), 10)) }) declare search: (q: string) => Promise<string>;
    @fetch({ url: '/api/x', filter: ({ args }) => args[0] !== 'skip' }) declare gated: (q: string) => Promise<any>;
    @fetchManual((_s, _h, _p, signal) => new Promise(r => { signal.addEventListener('abort', () => { aborted = true; }); setTimeout(() => r('late'), 80); })) declare slow: () => Promise<any>;
  }
  const el = await mount<any>(w, tag);
  const track = (name: string, p: Promise<any>) => p.then(v => done.push(`${name}:${v}`), e => done.push(`${name}:rejected:${e?.response?.status}`));
  track('missing', el.missing());
  track('a', el.search('a'));
  track('b', el.search('b'));
  track('skip', el.gated('skip'));
  track('slow', el.slow());
  await sleep(40);   // search 는 끝났고 slow(80ms)는 아직
  el.remove();
  await sleep(150);
  assert.ok(done.includes('missing:rejected:404'), done.join());
  assert.ok(done.includes('b:b') && !done.some(d => d.startsWith('a:')), 'only the latest search settles');
  assert.ok(!done.some(d => d.startsWith('skip')), 'filtered call never settles');
  assert.ok(!done.some(d => d.startsWith('slow')) && aborted, 'disconnect aborts and the Promise never settles');
  destroy();
});

test('field: another decorator on the same @fetch field throws at class definition', async () => {
  const { w, destroy } = await createWindow();
  assert.throws(() => {
    @elementDefine(uniqueTag('f-field-attr'), { window: w })
    class A extends w.HTMLElement {
      @fetchGet('/x') @attribute('.x', 'title') declare a: () => Promise<any>;
    }
  }, /is a @fetch field/);
  assert.throws(() => {
    @elementDefine(uniqueTag('f-field-click'), { window: w })
    class B extends w.HTMLElement {
      @fetchGet('/x') @(eventClick('#b') as any) declare b: () => Promise<any>;
    }
  }, /is a @fetch field/);
  destroy();
});

// useDefineForClassFields(ES2022+ 기본)면 declare 없는 필드가 인스턴스에 직접 정의돼 프레임워크 값을 가린다
test('field: forgetting `declare` (an instance field shadows the generated value) is reported on connect', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('f-field-nodeclare');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchGet('/x') declare getX: () => Promise<any>;
  }
  const el: any = w.document.createElement(tag);
  Object.defineProperty(el, 'getX', { value: undefined, writable: true, configurable: true }); // define 시맨틱이 만드는 것과 같은 인스턴스 필드
  assert.throws(() => new FetchLifeCycler().onConnected({ $this: el } as any), /must be declared with `declare`/);
  destroy();
});

// emitDecoratorMetadata 가 켜진 빌드면 선언 타입이 함수가 아닌 걸 런타임에도 잡는다 (반환 타입은 런타임에 없어 컴파일에서만)
test('field: a non-function field type is rejected at decoration time when design:type is available', async () => {
  const { w, destroy } = await createWindow();
  assert.throws(() => {
    @elementDefine(uniqueTag('f-field-type'), { window: w })
    class El extends w.HTMLElement {
      // @ts-expect-error 컴파일에서도 막히지만, 우회해도 런타임에서 잡힌다
      @fetchGet('/x') declare title: string;
    }
  }, /must be a function returning a Promise/);
  destroy();
});

// ─── 값 필드: declare x: Promise<T> — 읽으면 요청, 성공 기억, 실패면 다시, undefined/null 이면 잊음 ───

test('value field: read = request; success is remembered; failure re-requests; undefined / null forgets; a value can be set', async () => {
  const { w, destroy } = await createWindow();
  let n = 0;
  const calls = mockFetch(w, () => (++n === 2 ? json({}, 500) : json({ n })));
  const tag = uniqueTag('f-value');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/v') declare v: Promise<{ n: number }>;
  }
  const el = await mount<any>(w, tag);
  const p1 = el.v;
  assert.strictEqual(el.v, p1, 'same Promise while remembered');
  assert.deepStrictEqual(await p1, { n: 1 });
  assert.deepStrictEqual(await el.v, { n: 1 });
  assert.strictEqual(calls.length, 1, 'success is remembered — no second request');

  el.v = undefined;                                   // 잊기 → 다음 읽기에 다시 (이번엔 500)
  await assert.rejects(el.v);
  assert.deepStrictEqual(await el.v, { n: 3 }, 'failure is not remembered — next read re-requests');
  el.v = null;
  assert.deepStrictEqual(await el.v, { n: 4 });
  el.v = { n: 99 };                                   // 값 넣기 (예: SSR 로 받은 데이터)
  assert.deepStrictEqual(await el.v, { n: 99 });
  assert.strictEqual(calls.length, 4);
  destroy();
});

test('value field: disconnect aborts and forgets; reading after reconnect requests again', async () => {
  const { w, destroy } = await createWindow();
  let n = 0;
  const tag = uniqueTag('f-value-dc');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchManual(() => new Promise(r => setTimeout(() => r(++n), 40))) declare v: Promise<number>;
  }
  const el = await mount<any>(w, tag);
  let firstSettled = false;
  el.v.then(() => { firstSettled = true; });
  await sleep(10);
  el.remove();
  w.document.body.appendChild(el);
  await sleep(20);
  assert.strictEqual(await el.v, 2, 'a fresh request after reconnect');
  assert.strictEqual(firstSettled, false, 'the aborted one never settles');
  destroy();
});

test('value field: the body comes from the request factory', async () => {
  const { w, destroy } = await createWindow();
  const calls = mockFetch(w, () => json({ ok: 1 }));
  const tag = uniqueTag('f-value-body');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetchPost('/api/p', { request: () => ({ body: '{"a":1}', headers: { 'Content-Type': 'application/json' } }) }) declare created: Promise<any>;
  }
  const el = await mount<any>(w, tag);
  await el.created;
  assert.deepStrictEqual([calls[0].method, calls[0].body], ['POST', '{"a":1}']);
  destroy();
});

// 필드 값은 instanceof Promise 로도 Promise — 출력 데코레이터에 그대로 반환해도 기다렸다가 그린다
test('value field: returned as-is to an output decorator, it is awaited like a Promise', async () => {
  const { w, destroy } = await createWindow();
  mockFetch(w, () => json('hello'));
  const tag = uniqueTag('f-value-out');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @fetch('/api/greeting') declare greeting: Promise<string>;
    @innerHtml('$this') show() { return this.greeting; }
  }
  const el = await mount<any>(w, tag);
  assert.ok(el.greeting instanceof Promise);
  await el.show();
  assert.strictEqual(el.textContent, 'hello');
  destroy();
});
