import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { ServerResponse } from 'node:http';
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

// 스트리밍 테스트가 핸들러 진행을 제어/관찰하기 위한 상태
const stream = {
  releaseSecond: () => {},
  sseFinished: false,
  infiniteClosed: false,
  waitClosed: false,
  waitAborted: false,
  normalSignal: undefined as AbortSignal | undefined,
  releaseManual: () => {}
};

@Sim
@Router({ path: '/api' })
class TestRouter {
  // async 제너레이터 → SSE: 헤더 즉시 전송, yield 마다 바로 body 로
  @Route({ path: '/sse' })
  @GET({ res: { contentType: 'text/event-stream', header: { 'Cache-Control': 'no-cache' } } })
  async *sse() {
    try {
      yield 'data: 1\n\n';
      await new Promise<void>(resolve => (stream.releaseSecond = resolve));
      yield 'data: 2\n\n';
    } finally {
      stream.sseFinished = true;
    }
  }

  // sync 제너레이터: 문자열/Buffer 는 그대로, 객체는 JSON
  @Route({ path: '/stream-sync' })
  @GET({ res: { contentType: 'text/plain' } })
  *streamSync() {
    yield 'a';
    yield Buffer.from('b');
    yield { x: 1 };
  }

  // 오지 않는 이벤트를 기다리는 스트림: yield 가 아닌 await 에서 멈춰 있어도 끊기면 signal 로 풀려야 한다
  @Route({ path: '/sse-wait' })
  @GET({ res: { contentType: 'text/event-stream' } })
  async *sseWait(signal: AbortSignal) {
    try {
      yield 'data: ready\n\n';
      await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
      yield 'data: never\n\n';
    } finally {
      stream.waitClosed = true;
      stream.waitAborted = signal.aborted;
    }
  }

  // AbortSignal 이 다른 주입 파라미터와 섞여도 타입별로 제자리에 들어가야 한다 (순서 무관)
  @Route({ path: '/mixed-a' })
  @POST({ res: { contentType: 'application/json' } })
  mixedA(body: ReqJsonBody, rr: RequestResponse, signal: AbortSignal, search: ReqSearchParamsObj) {
    return { body, rr: rr instanceof RequestResponse, signal: signal instanceof AbortSignal && !signal.aborted, q: search.q };
  }

  @Route({ path: '/mixed-b' })
  @POST({ res: { contentType: 'application/json' } })
  mixedB(signal: AbortSignal, search: ReqSearchParamsObj, body: ReqJsonBody, rr: RequestResponse) {
    return { body, rr: rr instanceof RequestResponse, signal: signal instanceof AbortSignal && !signal.aborted, q: search.q };
  }

  // res: 'manual' — 프레임워크는 status/header/body 를 쓰지 않고, 핸들러가 ServerResponse 로 직접 제어
  @Route({ path: '/manual' })
  @GET({ res: 'manual' })
  async manual(res: ServerResponse) {
    res.writeHead(201, { 'Content-Type': 'text/plain', 'X-Manual': 'yes' });
    res.write('first;');
    await new Promise<void>(resolve => (stream.releaseManual = resolve));
    res.end('last');
    return { ignored: true }; // manual 이면 리턴값은 무시돼야 한다
  }

  // manual 인데 핸들러가 end 하지 않고 리턴: 프레임워크는 status 를 덮지 않고 리턴값도 쓰지 않은 채 end 만 한다
  @Route({ path: '/manual-status' })
  @GET({ res: 'manual' })
  manualStatus(res: ServerResponse) {
    res.statusCode = 202;
    res.setHeader('X-Manual', 'yes');
    return { ignored: true };
  }

  // 정상 완료된 요청의 signal 은 abort 되면 안 된다
  @Route({ path: '/signal-normal' })
  @GET({ res: { contentType: 'text/plain' } })
  signalNormal(signal: AbortSignal) {
    stream.normalSignal = signal;
    return 'ok';
  }

  // 끝나지 않는 스트림: 클라이언트가 끊으면 finally 가 돌아야 한다
  @Route({ path: '/sse-infinite' })
  @GET({ res: { contentType: 'text/event-stream' } })
  async *sseInfinite() {
    try {
      for (let i = 0; ; i++) {
        yield `data: ${i}\n\n`;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } finally {
      stream.infiniteClosed = true;
    }
  }

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

  test('async generator streams SSE (gzip): headers first, each yield flushed immediately', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      // fetch 는 gzip 응답을 알아서 풀어준다 — 압축된 상태로도 청크가 바로 도착해야 한다 (Z_SYNC_FLUSH)
      const res = await fetch(`${baseUrl}/api/sse`, { headers: { 'accept-encoding': 'gzip' } });
      // 여기까지 왔다 = 제너레이터가 두 번째 yield 앞에서 대기 중인데 헤더는 이미 도착
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'text/event-stream');
      assert.strictEqual(res.headers.get('cache-control'), 'no-cache');
      assert.strictEqual(res.headers.get('content-encoding'), 'gzip');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      const first = await reader.read();
      assert.strictEqual(decoder.decode(first.value), 'data: 1\n\n');
      assert.strictEqual(stream.sseFinished, false);

      stream.releaseSecond();
      let rest = '';
      for (let r = await reader.read(); !r.done; r = await reader.read()) rest += decoder.decode(r.value);
      assert.strictEqual(rest, 'data: 2\n\n');
      assert.strictEqual(stream.sseFinished, true);
    } finally {
      await close();
    }
  });

  test('sync generator streams strings/Buffers as-is and objects as JSON (no gzip without Accept-Encoding)', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/stream-sync`, { headers: { 'accept-encoding': 'identity' } });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-encoding'), null);
      assert.strictEqual(await res.text(), 'ab{"x":1}');
    } finally {
      await close();
    }
  });

  test('client disconnect stops the generator (finally runs)', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const controller = new AbortController();
      const res = await fetch(`${baseUrl}/api/sse-infinite`, { signal: controller.signal });
      const reader = res.body!.getReader();
      await reader.read();
      controller.abort();
      for (let i = 0; i < 50 && !stream.infiniteClosed; i++) await new Promise(r => setTimeout(r, 20));
      assert.strictEqual(stream.infiniteClosed, true);
    } finally {
      await close();
    }
  });

  test('AbortSignal releases a stream blocked on an event wait when the client disconnects', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const controller = new AbortController();
      const res = await fetch(`${baseUrl}/api/sse-wait`, { signal: controller.signal });
      const reader = res.body!.getReader();
      assert.strictEqual(new TextDecoder().decode((await reader.read()).value), 'data: ready\n\n');
      controller.abort();
      for (let i = 0; i < 50 && !stream.waitClosed; i++) await new Promise(r => setTimeout(r, 20));
      assert.strictEqual(stream.waitClosed, true);
      assert.strictEqual(stream.waitAborted, true);
    } finally {
      await close();
    }
  });

  test('AbortSignal is injected and stays un-aborted for a completed request', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/signal-normal`);
      assert.strictEqual(await res.text(), 'ok');
      await new Promise(r => setTimeout(r, 50));
      assert.ok(stream.normalSignal instanceof AbortSignal);
      assert.strictEqual(stream.normalSignal!.aborted, false);
    } finally {
      await close();
    }
  });

  test('AbortSignal is injected by type alongside other parameters, in any order', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      for (const path of ['mixed-a', 'mixed-b']) {
        const res = await fetch(`${baseUrl}/api/${path}?q=hi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ a: 1 })
        });
        assert.deepStrictEqual(await res.json(), { body: { a: 1 }, rr: true, signal: true, q: 'hi' }, path);
      }
    } finally {
      await close();
    }
  });

  test("res: 'manual' leaves status/headers/body to the handler and ignores the return value", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/manual`, { headers: { 'accept-encoding': 'identity' } });
      // 핸들러가 아직 대기 중인데 핸들러가 직접 쓴 헤더/첫 청크가 도착
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.headers.get('x-manual'), 'yes');
      assert.strictEqual(res.headers.get('content-type'), 'text/plain');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      assert.strictEqual(decoder.decode((await reader.read()).value), 'first;');

      stream.releaseManual();
      let rest = '';
      for (let r = await reader.read(); !r.done; r = await reader.read()) rest += decoder.decode(r.value);
      assert.strictEqual(rest, 'last');
    } finally {
      await close();
    }
  });

  test("res: 'manual' does not overwrite the handler's status or write its return value", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
      const res = await fetch(`${baseUrl}/api/manual-status`, { headers: { 'accept-encoding': 'identity' } });
      assert.strictEqual(res.status, 202);
      assert.strictEqual(res.headers.get('x-manual'), 'yes');
      assert.strictEqual(await res.text(), '');
    } finally {
      await close();
    }
  });
});
