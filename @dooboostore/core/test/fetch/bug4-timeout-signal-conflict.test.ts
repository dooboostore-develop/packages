import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher';
import { startTestServer } from '../testServer.ts';

// Bug 4였던 것: config.fetch.timeout과 config.fetch.signal을 같이 쓰면, timeout 로직이
// 사용자 signal을 자기 자신(internal AbortController)의 걸로 덮어써서 사용자의 조기 abort가 씹혔다.
// 고친 방법: 상호배타로 막는 대신(그건 이 프로젝트에서 타입으로 안 막혔다), 네이티브
// AbortSignal.timeout()/AbortSignal.any()로 "둘 중 먼저 오는 쪽이 이긴다"를 제대로 구현했다.
test('signal alone: caller-supplied AbortSignal aborts the request early', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);

    const start = Date.now();
    await fetcher
      .get({ target: `${server.url}/slow?ms=1500`, config: { fetch: { signal: controller.signal } } })
      .catch(() => {});
    const elapsed = Date.now() - start;

    assert.ok(elapsed < 500, `expected early abort around ~100ms, but request ran for ${elapsed}ms`);
  } finally {
    await server.close();
  }
});

test('timeout alone: request is aborted once the timeout elapses', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();

    const start = Date.now();
    await fetcher
      .get({ target: `${server.url}/slow?ms=1500`, config: { fetch: { timeout: 100 } } })
      .catch(() => {});
    const elapsed = Date.now() - start;

    assert.ok(elapsed < 500, `expected timeout abort around ~100ms, but request ran for ${elapsed}ms`);
  } finally {
    await server.close();
  }
});

test('both together, signal fires first: signal wins (aborts before the longer timeout)', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);

    const start = Date.now();
    await fetcher
      .get({ target: `${server.url}/slow?ms=2000`, config: { fetch: { timeout: 5000, signal: controller.signal } } })
      .catch(() => {});
    const elapsed = Date.now() - start;

    assert.ok(elapsed < 500, `expected signal to win around ~100ms, but request ran for ${elapsed}ms`);
  } finally {
    await server.close();
  }
});

test('both together, timeout fires first: timeout wins (signal never aborts)', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    const controller = new AbortController(); // 절대 abort 안 함

    const start = Date.now();
    await fetcher
      .get({ target: `${server.url}/slow?ms=2000`, config: { fetch: { timeout: 100, signal: controller.signal } } })
      .catch(() => {});
    const elapsed = Date.now() - start;

    assert.ok(elapsed < 500, `expected timeout to win around ~100ms, but request ran for ${elapsed}ms`);
  } finally {
    await server.close();
  }
});
