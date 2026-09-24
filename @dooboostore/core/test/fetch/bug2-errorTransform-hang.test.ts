import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher.ts';
import { startTestServer, raceTimeout } from '../testServer.ts';

// Bug 2 (Fetcher.ts:59): 커스텀 errorTransform이 값을 안 리턴하면(흔한 실수) e가 undefined가 되고,
// 그다음 HttpFetcher.errorTransform이 e.message에 접근하다 throw -> reject()가 절대 안 불려서
// fetch()가 리턴한 Promise가 resolve도 reject도 안 되고 영원히 매달린다.
test('bug2: fetch() should settle (reject) even if a custom errorTransform forgets to return', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();

    const result = await raceTimeout(
      fetcher.get({
        target: `${server.url}/fail`,
        // 흔한 실수: return 빼먹음
        errorTransform: async (_e) => {
          /* return e; 를 깜빡함 */
        },
      }).then(
        () => 'resolved',
        () => 'rejected'
      ),
      1000
    );

    assert.notStrictEqual(result, 'timed-out', 'fetch() promise hung forever instead of settling');
  } finally {
    await server.close();
  }
});
