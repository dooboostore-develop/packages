import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher.ts';
import { startTestServer } from '../testServer.ts';

// Bug 6 (HttpFetcher.ts:190-194): target.url이 이미 URL 인스턴스면 clone 안 하고 그대로
// mutate해서, 여러 요청에서 재사용하는 base URL 객체에 쿼리 파라미터가 누적된다.
test('bug6: reusing a shared URL object as target.url across calls should not leak params between calls', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    const base = new URL(`${server.url}/echo`);

    await fetcher.get({ target: { url: base, searchParams: { a: '1' } } });
    await fetcher.get({ target: { url: base, searchParams: { b: '2' } } });

    const secondReq = server.requests.at(-1);
    const secondUrl = new URL(secondReq!.url!, server.url);

    assert.strictEqual(
      secondUrl.searchParams.get('a'),
      null,
      `second request leaked param 'a' from the first call (full query: ${secondUrl.search}) - the shared URL object was mutated in place`
    );
    assert.strictEqual(secondUrl.searchParams.get('b'), '2');
  } finally {
    await server.close();
  }
});
