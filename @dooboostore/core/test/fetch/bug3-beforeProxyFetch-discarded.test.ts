import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher.ts';
import { startTestServer } from '../testServer.ts';

// Bug 3 (HttpFetcher.ts:206-215): 요청별 config.beforeProxyFetch가
//  1) BeforeProxyFetchParams가 아니라 raw config 객체를 인자로 받고
//  2) 그 리턴값이 다음 줄에서 무조건 덮어써져서 실제 요청에 반영이 안 된다.
test('bug3: request-level beforeProxyFetch should receive {requestInfo,init} and its result should reach the actual request', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpFetcher();
    let receivedArg: any;

    await fetcher.get({
      target: `${server.url}/echo`,
      config: {
        beforeProxyFetch: async (arg: any) => {
          receivedArg = arg;
          return { requestInfo: arg?.requestInfo, init: { headers: { 'x-injected': 'yes' } } };
        },
      },
    });

    assert.ok(
      receivedArg && 'requestInfo' in receivedArg,
      `beforeProxyFetch should receive a {requestInfo, init} object, got: ${JSON.stringify(receivedArg)}`
    );

    const lastReq = server.requests.at(-1);
    assert.strictEqual(
      lastReq?.headers['x-injected'],
      'yes',
      'beforeProxyFetch result was discarded - the injected header never reached the server'
    );
  } finally {
    await server.close();
  }
});
