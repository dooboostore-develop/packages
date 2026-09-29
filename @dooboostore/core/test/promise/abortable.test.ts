import test from 'node:test';
import assert from 'node:assert';
import { Promises } from '../../src/promise/Promises.ts';

const within = <T>(p: PromiseLike<T>, ms = 500): Promise<T | 'TIMEOUT'> =>
  Promise.race([Promise.resolve(p), new Promise<'TIMEOUT'>(r => setTimeout(() => r('TIMEOUT'), ms))]);

// Bug: then() 이 실행 없이 새 인스턴스만 돌려줘서 await 가 영원히 안 끝났다
test('abortable: can be awaited directly (no toPromise needed)', async () => {
  assert.strictEqual(await within(Promises.abortable(Promise.resolve('ok'))), 'ok');
  assert.strictEqual(await within(Promises.abortable(async () => 'factory')), 'factory');
});

// Bug: new Error(reason) 로 감싸서 AbortError 이름이 사라졌다
test('abortable: abort rejects with the signal reason itself (AbortError kept)', async () => {
  const c = new AbortController();
  const p = Promises.abortable(new Promise(r => setTimeout(() => r('late'), 1000)), c.signal);
  setTimeout(() => c.abort(), 20);
  await assert.rejects(within(p), (e: any) => e === c.signal.reason && e.name === 'AbortError');
});

test('abortable: an already-aborted signal never calls the factory', async () => {
  const c = new AbortController();
  c.abort();
  let called = false;
  await assert.rejects(within(Promises.abortable(async () => { called = true; return 1; }, c.signal)), (e: any) => e.name === 'AbortError');
  assert.strictEqual(called, false);
});

test('abortable: abort between chain steps skips the remaining steps', async () => {
  const c = new AbortController();
  let second = false;
  const p = Promises.abortable(Promise.resolve(1), c.signal)
    .then(v => { c.abort(); return v + 1; })
    .then(v => { second = true; return v + 1; });
  await assert.rejects(within(p), (e: any) => e.name === 'AbortError');
  assert.strictEqual(second, false);
});

test('abortable: the factory runs once even when chained', async () => {
  let runs = 0;
  const base = Promises.abortable(async () => { runs++; return 1; });
  const a = base.then(v => v + 1);
  const b = base.then(v => v + 2);
  assert.deepStrictEqual(await within(Promise.all([a, b, base])), [2, 3, 1]);
  assert.strictEqual(runs, 1);
});

test('abortable: catch/finally work, and the abort listener is removed once settled', async () => {
  const c = new AbortController();
  let added = 0;
  let removed = 0;
  const add = c.signal.addEventListener.bind(c.signal);
  const remove = c.signal.removeEventListener.bind(c.signal);
  (c.signal as any).addEventListener = (...a: any[]) => { added++; return (add as any)(...a); };
  (c.signal as any).removeEventListener = (...a: any[]) => { removed++; return (remove as any)(...a); };

  let finallyRan = false;
  const v = await within(Promises.abortable(Promise.reject(new Error('boom')), c.signal).catch((e: any) => e.message).finally(() => { finallyRan = true; }));
  assert.strictEqual(v, 'boom');
  assert.strictEqual(finallyRan, true);
  assert.ok(added > 0);
  assert.strictEqual(removed, added, 'every abort listener should be removed after settling');
});
