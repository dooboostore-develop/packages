import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher.ts';
import { startTestServer } from '../testServer.ts';

// Bug 8 (HttpFetcher.ts:65-115): get/post/put... 가 config.config.fetch를 in-place mutate한다.
// 같은 config 객체를 여러 호출이 공유하면, execute()가 실제로 도는(마이크로태스크 뒤) 시점엔
// 이미 나중 호출이 method를 덮어써버린 뒤라 앞선 요청까지 엉뚱한 메서드로 나간다.
test('bug8: concurrent calls sharing the same nested config object should not corrupt each other\'s HTTP method', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    const shared: any = {};

    await Promise.all([
      fetcher.get({ target: `${server.url}/echo`, config: shared }),
      fetcher.post({ target: `${server.url}/echo`, config: shared }),
    ]);

    const methods = server.requests.slice(-2).map((r) => r.method).sort();
    assert.deepStrictEqual(
      methods,
      ['GET', 'POST'],
      `expected one GET and one POST, got ${JSON.stringify(methods)} - shared config object's method field got clobbered`
    );
  } finally {
    await server.close();
  }
});
