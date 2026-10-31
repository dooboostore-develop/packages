import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Sim, Router, Route, ExceptionHandler } from '@dooboostore/simple-boot';
import {
  SimpleBootHttpServer,
  HttpServerOption,
  GET,
  RequestResponse,
  NotFoundError,
  HttpStatus
} from '@dooboostore/simple-boot-http-server';

// SPA fallback: unmatched non-API routes serve index.html (200 + text/html),
// unknown API routes stay JSON 404. Same composition elysia#1515 asks for.
// transpileModule(esbuild/tsx/ts-loader)은 타입 전용 import를 날려버려서
// design:paramtypes가 [Object, ...]으로 열화된다. 값 위치에서 한 번
// 참조해 import를 살려둔다 (bare `rr: RequestResponse` 바인딩용).
void RequestResponse;

const INDEX_HTML =
  '<!DOCTYPE html><html><head><title>app</title></head><body><div id="app"></div></body></html>';

class SpaFallback {}

@Sim
class SpaAdvice {
  @ExceptionHandler({ type: SpaFallback })
  fallback(rr: RequestResponse, _error: SpaFallback) {
    rr.resStatusCode(HttpStatus.Ok).resSetHeader('content-type', 'text/html; charset=utf-8');
    rr.resWrite(INDEX_HTML);
  }
}

@Sim
@Router({ path: '/api' })
class SpaApiRouter {
  @Route({ path: '/hello' })
  @GET()
  hello() {
    return { message: 'hello' };
  }
}

async function startSpaServer() {
  const option = new HttpServerOption(
    {
      listen: { port: 0, hostname: '127.0.0.1' },
      globalAdvice: SpaAdvice,
      noSuchRouteEndPointMappingThrow: (rr: RequestResponse) =>
        (rr.reqUrlPathName ?? '').startsWith('/api/')
          ? new NotFoundError({ message: 'no route' })
          : new SpaFallback()
    },
    { rootRouter: SpaApiRouter }
  );
  const server = new SimpleBootHttpServer(option);
  await new Promise<void>(resolve => {
    option.listen.listeningListener = () => resolve();
    server.run();
  });
  const address = server.server!.address();
  const port = typeof address === 'object' && address ? address.port : option.listen.port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve, reject) => server.server!.close(err => (err ? reject(err) : resolve())))
  };
}

describe('SPA fallback (unmatched routes serve index.html)', () => {
  test('API routes still return JSON', async () => {
    const { baseUrl, close } = await startSpaServer();
    try {
      const res = await fetch(`${baseUrl}/api/hello`);
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(await res.json(), { message: 'hello' });
    } finally {
      await close();
    }
  });

  test('deep link returns index.html, not JSON', async () => {
    const { baseUrl, close } = await startSpaServer();
    try {
      const res = await fetch(`${baseUrl}/app/dashboard`);
      assert.strictEqual(res.status, 200);
      assert.match(res.headers.get('content-type') ?? '', /text\/html/);
      assert.strictEqual(await res.text(), INDEX_HTML);
    } finally {
      await close();
    }
  });

  test('unknown API route stays 404', async () => {
    const { baseUrl, close } = await startSpaServer();
    try {
      const res = await fetch(`${baseUrl}/api/nope`);
      assert.strictEqual(res.status, 404);
    } finally {
      await close();
    }
  });
});
