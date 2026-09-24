import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Sim, Router, Route, RouterModule } from '@dooboostore/simple-boot';
import {
  SimpleBootHttpServer,
  HttpServerOption,
  GET,
  POST,
  RequestResponse,
  ReqJsonBody,
  ReqSearchParamsObj,
  NotFoundError
} from '@dooboostore/simple-boot-http-server';

@Sim
@Router({ path: '/api' })
class TestRouter {
  @Route({ path: '/hello' })
  @GET({ res: { contentType: 'application/json' } })
  hello() {
    return { message: 'hello' };
  }

  @Route({ path: '/echo' })
  @POST({ res: { contentType: 'application/json' } })
  echo(body: ReqJsonBody) {
    return body;
  }

  @Route({ path: '/users/find' })
  @GET({ res: { contentType: 'application/json' } })
  findUser(searchParams: ReqSearchParamsObj) {
    if (searchParams.id !== '1') {
      throw new NotFoundError({ message: 'not found' });
    }
    return { id: 1, name: 'Alice' };
  }

  @Route({ path: '/text' })
  @GET({ res: { contentType: 'text/plain' } })
  text(rr: RequestResponse) {
    return 'plain text';
  }
}

async function startTestServer() {
  const option = new HttpServerOption(
    {
      listen: { port: 0, hostname: '127.0.0.1' },
      noSuchRouteEndPointMappingThrow: () => new NotFoundError({ message: 'no route' })
    },
    { rootRouter: TestRouter }
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

describe('SimpleBootHttpServer', () => {
  test('GET returns JSON from a @Router/@Route/@GET handler', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/hello`);
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(await res.json(), { message: 'hello' });
    } finally {
      await close();
    }
  });

  test('POST with JSON body is parsed into ReqJsonBody and echoed back', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 1, b: 'two' })
      });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(await res.json(), { a: 1, b: 'two' });
    } finally {
      await close();
    }
  });

  test('query params are parsed into ReqSearchParamsObj', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const found = await fetch(`${baseUrl}/api/users/find?id=1`);
      assert.strictEqual(found.status, 200);
      assert.deepStrictEqual(await found.json(), { id: 1, name: 'Alice' });

      const notFound = await fetch(`${baseUrl}/api/users/find?id=999`);
      assert.strictEqual(notFound.status, 404);
    } finally {
      await close();
    }
  });

  test('non-JSON contentType response is returned as-is, not JSON-stringified', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/text`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(await res.text(), 'plain text');
    } finally {
      await close();
    }
  });

  test('unmapped route triggers noSuchRouteEndPointMappingThrow', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/does-not-exist`);
      assert.strictEqual(res.status, 404);
    } finally {
      await close();
    }
  });
});
