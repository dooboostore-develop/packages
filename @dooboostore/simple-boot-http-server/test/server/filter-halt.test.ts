import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

const calls: string[] = [];
void RequestResponse;

@Sim
class StopFilter {
  async onInit() {}
  async proceedBefore({ rr }: any) {
    calls.push('stop-before');
    rr.resStatusCode(401).resEnd('denied');
    return false;
  }
  async proceedAfter() {
    calls.push('stop-after');
    return true;
  }
}

@Sim
class PassFilter {
  async onInit() {}
  async proceedBefore() {
    calls.push('pass-before');
    return true;
  }
  async proceedAfter() {
    calls.push('pass-after');
    return true;
  }
}

@Sim
@Router({ path: '/t' })
class R {
  @Route({ path: '/x' })
  @GET()
  x() {
    calls.push('handler');
    return { ok: true };
  }
}

async function boot(filters: any[]) {
  const option = new HttpServerOption(
    { listen: { port: 0, hostname: '127.0.0.1' }, filters: filters.map((filter) => ({ filter, isSupport: true })) },
    { rootRouter: R }
  );
  const server = new SimpleBootHttpServer(option);
  await new Promise<void>((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
  return server;
}

describe('filter halt semantics (fastify#7090 class)', () => {
  test('async filter that responds + returns false stops the handler, with 1 or 2 filters', async () => {
    for (const filters of [[new StopFilter()], [new StopFilter(), new PassFilter()]]) {
      calls.length = 0;
      const server = await boot(filters as any);
      try {
        const address = server.server!.address() as any;
        const res = await fetch(`http://127.0.0.1:${address.port}/t/x`);
        const body = await res.text();
        assert.strictEqual(res.status, 401, 'filter response wins: ' + body);
        assert.ok(!calls.includes('handler'), 'handler must not run: ' + JSON.stringify(calls));
      } finally {
        const srv: any = server.server!;
        if (typeof srv.closeIdleConnections === 'function') srv.closeIdleConnections();
        await new Promise<void>((resolve) => srv.close(() => resolve()));
      }
    }
    assert.ok(calls.includes('stop-before'));
  });
});
