import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, Router, Route, ExceptionHandler } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

// Throwing after the response was already sent must route to the error
// advice without crashing the process or leaking an unhandled rejection
// (expressjs/express#7560 class).
const seen: string[] = [];
void RequestResponse;

@Sim
class PostSendAdvice {
  @ExceptionHandler({ type: Error })
  onError(_rr: RequestResponse, e: Error) {
    seen.push('advice:' + ((e as any) || {}).code);
  }
}

@Sim
@Router({ path: '/t' })
class PostSendRouter {
  @Route({ path: '/sent' })
  @GET()
  sent(rr: RequestResponse) {
    rr.resEnd('already sent');
    throw Object.assign(new Error('boom-after-send'), { code: 'ERR_TEST' });
  }
}

describe('post-send throw (express#7560 class)', () => {
  test('routes to advice without crashing; client keeps the sent body', async () => {
    const crashes: string[] = [];
    const onUncaught = (e: any) => { crashes.push('UNCAUGHT:' + (e && (e.code || e.message))); };
    const onUnhandled = (e: any) => { crashes.push('UNHANDLED:' + (e && (e.code || e.message))); };
    process.on('uncaughtException', onUncaught);
    process.on('unhandledRejection', onUnhandled);
    try {
      const option = new HttpServerOption(
        { listen: { port: 0, hostname: '127.0.0.1' }, globalAdvice: PostSendAdvice },
        { rootRouter: PostSendRouter }
      );
      const server = new SimpleBootHttpServer(option);
      await new Promise<void>((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
      const address = server.server!.address() as any;
      try {
        const res = await fetch(`http://127.0.0.1:${address.port}/t/sent`);
        assert.strictEqual(await res.text(), 'already sent', 'client keeps the already-sent body');
        await new Promise((r) => setTimeout(r, 800));
        assert.deepStrictEqual(crashes, [], 'no crash or unhandled rejection: ' + JSON.stringify(crashes.concat(seen)));
        assert.ok(seen.includes('advice:ERR_TEST'), 'error advice still ran: ' + JSON.stringify(seen));
      } finally {
        const srv: any = server.server!;
        if (typeof srv.closeIdleConnections === 'function') srv.closeIdleConnections();
        await new Promise<void>((resolve) => srv.close(() => resolve()));
      }
    } finally {
      process.off('uncaughtException', onUncaught);
      process.off('unhandledRejection', onUnhandled);
    }
  });
});
