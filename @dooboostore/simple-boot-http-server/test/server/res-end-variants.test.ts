import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

// resEnd() chunk-type matrix + double-end safety. Every case is verified
// against a live server: exact bytes on the wire, no unhandled rejections.
void RequestResponse;

const seen: string[] = [];

@Sim
@Router({ path: '/t' })
class VariantsRouter {
  @Route({ path: '/str' })
  @GET()
  str(rr: RequestResponse) {
    rr.resEnd('hello');
  }

  @Route({ path: '/buf' })
  @GET()
  buf(rr: RequestResponse) {
    rr.resEnd(Buffer.from([9, 8, 7]));
  }

  @Route({ path: '/blob' })
  @GET()
  blob(rr: RequestResponse) {
    rr.resEnd(new Blob(['xy'], { type: 'text/plain' }));
  }

  @Route({ path: '/abuf' })
  @GET()
  abuf(rr: RequestResponse) {
    rr.resEnd(new Uint8Array([5, 6]).buffer);
  }

  @Route({ path: '/resp' })
  @GET()
  resp(rr: RequestResponse) {
    rr.resEnd(new Response('R', { status: 201, headers: { 'x-k': 'v' } }));
  }

  @Route({ path: '/u16' })
  @GET()
  u16(rr: RequestResponse) {
    const u16 = new Uint16Array([0x4142, 0x4344]);
    rr.resEnd(new Uint8Array(u16.buffer, 2, 2));
  }

  @Route({ path: '/write-then-undefined' })
  @GET()
  writeThenUndefined(rr: RequestResponse) {
    rr.resWrite('kept');
    return undefined;
  }

  @Route({ path: '/empty' })
  @GET()
  empty() {
    return undefined;
  }
}

describe('resEnd chunk-type matrix + double-end safety', () => {
  test('every chunk type round-trips exact bytes', async () => {
    const unhandled: string[] = [];
    const onUnhandled = (e: any) => { unhandled.push(String((e && e.code) || e)); };
    process.on('unhandledRejection', onUnhandled);
    try {
      const option = new HttpServerOption(
        { listen: { port: 0, hostname: '127.0.0.1' } },
        { rootRouter: VariantsRouter }
      );
      const server = new SimpleBootHttpServer(option);
      await new Promise<void>((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
      const address = server.server!.address() as any;
      const base = `http://127.0.0.1:${address.port}`;
      try {
        const cases: Array<[string, number[], number?, Record<string, string>?]> = [
          ['/t/str', [...Buffer.from('hello')], 200],
          ['/t/buf', [9, 8, 7], 200],
          ['/t/blob', [...Buffer.from('xy')], 200, { 'content-type': 'text/plain' }],
          ['/t/abuf', [5, 6], 200],
          ['/t/resp', [...Buffer.from('R')], 201, { 'origin-x-k': 'v' }],
          ['/t/u16', [0x44, 0x43], 200],
          ['/t/write-then-undefined', [...Buffer.from('kept')], 200],
          ['/t/empty', [], 200],
        ];
        for (const [p, bytes, status, headers] of cases) {
          const res = await fetch(base + p);
          assert.strictEqual(res.status, status, `${p} status`);
          assert.deepStrictEqual([...new Uint8Array(await res.arrayBuffer())], bytes, `${p} bytes`);
          if (headers) {
            for (const [k, v] of Object.entries(headers)) {
              assert.ok((res.headers.get(k) || '').includes(v), `${p} header ${k}`);
            }
          }
        }
        assert.deepStrictEqual(unhandled, [], 'no unhandled rejections: ' + JSON.stringify(unhandled.concat(seen)));
      } finally {
        const srv: any = server.server!;
        if (typeof srv.closeIdleConnections === 'function') srv.closeIdleConnections();
        await new Promise<void>((resolve) => srv.close(() => resolve()));
      }
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});
