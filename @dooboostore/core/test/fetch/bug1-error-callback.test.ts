import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher';
import { startTestServer } from '../testServer';

// Bug 1 (Fetcher.ts:55): config?.error?.() 가 인자 없이 호출됨 -> e가 항상 undefined.
test('bug1: request-level error callback should receive the error object', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    let receivedError: any = 'NEVER_CALLED';

    await fetcher.get({
      target: `${server.url}/fail`,
      error: (e) => {
        receivedError = e;
      },
    }).catch(() => {}); // 500이라 reject되는 게 정상 - 여기선 error 콜백 인자만 확인

    assert.notStrictEqual(receivedError, 'NEVER_CALLED', 'error callback should have been invoked');
    assert.notStrictEqual(receivedError, undefined, 'error callback should receive the error, not undefined');
  } finally {
    await server.close();
  }
});
