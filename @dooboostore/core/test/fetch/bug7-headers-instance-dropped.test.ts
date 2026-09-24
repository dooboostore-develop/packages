import test from 'node:test';
import assert from 'node:assert';
import { HttpJsonFetcher } from '../../src/fetch/HttpJsonFetcher.ts';
import { startTestServer } from '../testServer.ts';

// Bug 7 (HttpJsonFetcher.ts:49): 헤더 병합이 객체 스프레드({...headers})라서, RequestInit.headers의
// 정당한 다른 형태(Headers 인스턴스, [string,string][] 튜플)를 넘기면 통째로 사라진다.
// 주의: 이 병합(updateJsonFetchConfigAndData)은 get/post/put/patch/delete/head가 아니라
// postJson/patchJson/putJson에서만 탄다 - 처음에 .get()으로 테스트해서 통과했었는데,
// 그건 애초에 문제의 코드 경로를 안 태운 것뿐이었음(내 첫 분석 실수, 이 테스트로 실제로 걸러짐).
test('bug7: passing headers as a Headers instance should not be dropped by JSON header merging', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new HttpJsonFetcher();

    await fetcher.postJson({
      target: `${server.url}/echo`,
      config: { fetch: { headers: new Headers({ Authorization: 'Bearer secret-token' }), body: { hi: 1 } } },
    });

    const lastReq = server.requests.at(-1);
    assert.strictEqual(
      lastReq?.headers['authorization'],
      'Bearer secret-token',
      `Authorization header never reached the server (received headers: ${JSON.stringify(lastReq?.headers)}) - Headers instance was dropped by {...headers} spread`
    );
  } finally {
    await server.close();
  }
});
