import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

// Sessions must be created only when a handler asks for one. Creating one per cookieless
// request made the session Map grow without bound under plain anonymous traffic.
@Sim
@Router({ path: '/t' })
class SessionRouter {
  @Route({ path: '/plain' })
  @GET()
  plain() { return 'ok'; }

  @Route({ path: '/count' })
  @GET()
  async count(rr: RequestResponse) {
    const n = ((await rr.reqSessionGet<number>('n')) ?? 0) + 1;
    await rr.reqSessionSet('n', n);
    return String(n);
  }
}

describe('lazy sessions', () => {
  test('anonymous requests create no session and no cookie; reqSession issues one and it round-trips', async () => {
    const option = new HttpServerOption({ listen: { port: 0, hostname: '127.0.0.1' } }, { rootRouter: SessionRouter });
    const server = new SimpleBootHttpServer(option);
    await new Promise<void>((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
    const base = `http://127.0.0.1:${(server.server!.address() as any).port}`;
    try {
      for (let i = 0; i < 20; i++) {
        const res = await fetch(`${base}/t/plain`);
        await res.text();
        assert.strictEqual(res.headers.get('set-cookie'), null, 'no cookie for a handler that never touches the session');
      }
      assert.strictEqual((server as any).sessionManager.sessions.size, 0, 'no session stored for anonymous requests');

      const first = await fetch(`${base}/t/count`);
      assert.strictEqual(await first.text(), '1');
      const cookie = first.headers.get('set-cookie')!;
      assert.match(cookie, /^SBSESSIONID=[0-9a-f]{32}; Path=\/; HttpOnly/);

      const second = await fetch(`${base}/t/count`, { headers: { cookie: cookie.split(';')[0] } });
      assert.strictEqual(await second.text(), '2', 'same cookie, same session');
      assert.strictEqual(second.headers.get('set-cookie'), null, 'existing session is not re-issued');
      assert.strictEqual((server as any).sessionManager.sessions.size, 1);
    } finally {
      await server.close();
    }
  });
});
