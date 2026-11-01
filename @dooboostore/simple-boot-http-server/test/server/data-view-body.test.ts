import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

// DataView (and offset views) must send exactly their byte range
// (expressjs/express#7510 class: Buffer.from(view) drops offset/length,
// and Node's res.end() rejects DataView outright).
void RequestResponse;

@Sim
@Router({ path: '/t' })
class DataViewRouter {
  @Route({ path: '/dv' })
  @GET()
  dv(rr: RequestResponse) {
    const bytes = new Uint8Array([0, 1, 2, 3, 4]);
    rr.resEnd(new DataView(bytes.buffer, 1, 3));
  }

  @Route({ path: '/u8' })
  @GET()
  u8(rr: RequestResponse) {
    rr.resEnd(new Uint8Array([0, 1, 2, 3, 4]).subarray(1, 4));
  }
}

describe('DataView / offset-view bodies (express#7510 class)', () => {
  test('sends the exact byte range', async () => {
    const option = new HttpServerOption(
      { listen: { port: 0, hostname: '127.0.0.1' } },
      { rootRouter: DataViewRouter }
    );
    const server = new SimpleBootHttpServer(option);
    await new Promise<void>((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
    const address = server.server!.address() as any;
    try {
      const base = `http://127.0.0.1:${address.port}`;
      for (const p of ['/t/dv', '/t/u8']) {
        const res = await fetch(base + p);
        assert.strictEqual(res.status, 200, p + ' status');
        assert.deepStrictEqual([...new Uint8Array(await res.arrayBuffer())], [1, 2, 3], p + ' bytes');
      }
    } finally {
      const srv: any = server.server!;
      if (typeof srv.closeIdleConnections === 'function') srv.closeIdleConnections();
      await new Promise<void>((resolve) => srv.close(() => resolve()));
    }
  });
});
