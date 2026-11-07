import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

void RequestResponse;

// Resolved by the slow handler once it is actually running on the server,
// so the test can close() with a request genuinely in flight.
let entered: () => void;
const enteredPromise = new Promise<void>((resolve) => { entered = resolve; });

@Sim
@Router({ path: '/t' })
class R {
  @Route({ path: '/slow' })
  @GET()
  async slow() {
    entered();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ok: true };
  }

  @Route({ path: '/fast' })
  @GET()
  fast() {
    return { ok: true };
  }
}

describe('graceful shutdown (fastify#7166 contract)', () => {
  test('close() drains in-flight requests and drops idle keep-alive sockets', async () => {
    const option = new HttpServerOption({ listen: { port: 0, hostname: '127.0.0.1' } }, { rootRouter: R });
    const server = new SimpleBootHttpServer(option);
    await new Promise<void>((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
    const address = server.server!.address() as any;
    const base = `http://127.0.0.1:${address.port}`;

    // Warm a keep-alive socket, then start an in-flight request and wait
    // until the server is actually executing it.
    const warm = await fetch(base + '/t/fast');
    assert.equal(warm.status, 200);
    await warm.text();

    const inFlight = fetch(base + '/t/slow');
    await enteredPromise;

    const started = Date.now();
    await server.close();
    const elapsed = Date.now() - started;

    const res = await inFlight;
    assert.equal(res.status, 200, 'in-flight request completed');
    assert.deepEqual(await res.json(), { ok: true }, 'in-flight body intact');
    assert.ok(elapsed >= 100, `close() waited for the in-flight request (${elapsed}ms)`);
    assert.equal(server.server!.listening, false, 'server stopped listening');
  });
});
