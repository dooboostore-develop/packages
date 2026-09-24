import test from 'node:test';
import assert from 'node:assert';
import { HttpFetcher } from '../../src/fetch/HttpFetcher';
import { startTestServer } from '../testServer.ts';

// Bug 5 (HttpFetcher.ts:245-252): 요청별 config.afterProxyFetch가 response를 바꿔치기해도,
// 클래스 레벨 afterProxyFetch(예: ApiService의 인터셉터 체인)에 넘기는 afterProxyData.response는
// 처음 그 값 그대로라서 바뀐 걸 못 본다.
class CapturingFetcher extends HttpFetcher {
  public capturedStatuses: number[] = [];
  protected async afterProxyFetch(config: any) {
    this.capturedStatuses.push(config.response.status);
    return config.response;
  }
}

test('bug5: class-level afterProxyFetch should see the response already replaced by the request-level hook', async () => {
  const server = await startTestServer();
  try {
    const fetcher = new CapturingFetcher();

    await fetcher.get({
      target: `${server.url}/echo`,
      config: {
        afterProxyFetch: async () => {
          return new Response(JSON.stringify({ replaced: true }), { status: 201 })
        },
      },
    });

    assert.strictEqual(
      fetcher.capturedStatuses[0],
      201,
      `class-level afterProxyFetch saw status ${fetcher.capturedStatuses[0]}, expected 201 (the request-level hook's replacement) - it got the stale pre-replacement response instead`
    );
  } finally {
    await server.close();
  }
});
