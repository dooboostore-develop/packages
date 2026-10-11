import 'reflect-metadata';
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { gunzipSync } from 'node:zlib';
import { request } from 'node:http';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, NotFoundError, ContentTypeGenerator } from '@dooboostore/simple-boot-http-server';

const CTG = ContentTypeGenerator;
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9]);
const GIF = Buffer.from('GIF89a....', 'latin1');
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const collect = async <T>(src: AsyncIterable<T>): Promise<T[]> => {
  const out: T[] = [];
  for await (const v of src) out.push(v);
  return out;
};
const text = (chunks: (string | Buffer)[]) => chunks.map(c => c.toString()).join('');

/** 원본 generator: 끝났는지(finally) 기록 */
const tracked = <T>(values: T[]) => {
  const log = { finished: false, yielded: 0 };
  async function* gen() {
    try {
      for (const v of values) {
        yield v;
        log.yielded++;
      }
    } finally {
      log.finished = true;
    }
  }
  return { gen: gen(), log };
};

// ───────────────────────── 서버 라우트 ─────────────────────────
const state = {
  channelClosed: false,
  pullFinished: false,
  sseChannel: undefined as ContentTypeGenerator.Channel<ContentTypeGenerator.SseEvent, string> | undefined,
  mjpegChannel: undefined as ContentTypeGenerator.Channel<ContentTypeGenerator.Part, Buffer> | undefined,
  ndjsonChannel: undefined as ContentTypeGenerator.Channel<unknown, string> | undefined,
  jsonArrayChannel: undefined as ContentTypeGenerator.Channel<unknown, string> | undefined,
  pushChannel: undefined as ContentTypeGenerator.Channel<any, string> | undefined
};

@Sim
@Router({ path: '/ctg' })
class CtgRouter {
  // 데코레이터에 contentType 없음 → Stream 이 boundary 까지 정함
  @Route({ path: '/mjpeg' })
  @GET
  mjpeg() {
    return CTG.multipartReplace((function* () { yield JPEG; yield PNG; })(), { boundary: 'frame' });
  }

  // 데코레이터 contentType 이 있어도 Stream 의 것(boundary 포함)이 이긴다
  @Route({ path: '/mjpeg-override' })
  @GET({ res: { contentType: 'multipart/x-mixed-replace; boundary=WRONG', header: { 'Cache-Control': 'no-cache' } } })
  mjpegOverride() {
    return CTG.multipartReplace([JPEG], { boundary: 'right' });
  }

  @Route({ path: '/mixed' })
  @GET
  mixed() {
    return CTG.multipartMixed([{ body: 'a', name: 'a.txt' }, PNG], { boundary: 'm' });
  }

  @Route({ path: '/ndjson' })
  @GET
  ndjson() {
    return CTG.ndjson([{ a: 1 }, { b: 'x\ny' }, 3]);
  }

  @Route({ path: '/sse' })
  @GET
  sse() {
    return CTG.sse(['one', { event: 'e', data: { n: 2 } }]);
  }

  // 데코레이터에 text/event-stream 을 같이 적어도 그대로 (헤더 중복·충돌 없음)
  @Route({ path: '/sse-declared' })
  @GET({ res: { contentType: 'text/event-stream', header: { 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } } })
  sseDeclared() {
    return CTG.sse([{ id: '1', data: 'declared' }]);
  }

  // 원본이 오래 조용해도 heartbeat 로 ping 이 먼저 나감
  @Route({ path: '/sse-heartbeat' })
  @GET
  sseHeartbeat(signal: AbortSignal) {
    async function* events() {
      yield 'first';
      await new Promise<void>(resolve => signal.addEventListener('abort', () => resolve(), { once: true }));
    }
    return CTG.sse(events(), { heartbeatMs: 40 });
  }

  // pull: 끝없는 원본 — 클라이언트가 끊으면 원본 finally 가 돌아야
  @Route({ path: '/pull-infinite' })
  @GET
  pullInfinite(signal: AbortSignal) {
    async function* frames() {
      try {
        while (!signal.aborted) {
          yield JPEG;
          await sleep(10);
        }
      } finally {
        state.pullFinished = true;
      }
    }
    return CTG.multipartReplace(frames());
  }

  // push: 다른 곳에서 넣음. 아무것도 안 넣고 기다리는 중에 끊겨도 onClose 가 불려야 함
  @Route({ path: '/sse-channel' })
  @GET
  sseChannel(signal: AbortSignal) {
    const out = CTG.sse.channel({ signal });
    out.onClose(() => (state.channelClosed = true));
    state.sseChannel = out;
    return out;
  }

  @Route({ path: '/mjpeg-channel' })
  @GET
  mjpegChannel(signal: AbortSignal) {
    state.mjpegChannel = CTG.multipartReplace.channel({ signal, keep: 'latest', boundary: 'live' });
    return state.mjpegChannel;
  }

  @Route({ path: '/ndjson-channel' })
  @GET
  ndjsonChannel(signal: AbortSignal) {
    state.ndjsonChannel = CTG.ndjson.channel({ signal });
    return state.ndjsonChannel;
  }

  @Route({ path: '/json-seq' })
  @GET
  jsonSeqRoute() {
    return CTG.jsonSeq([{ a: 1 }, 'b']);
  }

  @Route({ path: '/json-array' })
  @GET
  jsonArrayRoute() {
    return CTG.jsonArray((async function* () { yield { a: 1 }; yield [2]; yield 'x'; })());
  }

  @Route({ path: '/csv' })
  @GET({ res: { header: { 'Content-Disposition': 'attachment; filename="rows.csv"' } } })
  csvRoute() {
    return CTG.csv([{ name: '홍길동', memo: 'a,b' }, { name: 'kim', memo: 'say "hi"' }], { columns: ['name', 'memo'], bom: true });
  }

  @Route({ path: '/text' })
  @GET
  textRoute() {
    return CTG.text(['line 1', 'line 2']);
  }

  @Route({ path: '/json-array-channel' })
  @GET
  jsonArrayChannel(signal: AbortSignal) {
    state.jsonArrayChannel = CTG.jsonArray.channel({ signal });
    return state.jsonArrayChannel;
  }

  @Route({ path: '/json-seq-channel' })
  @GET
  jsonSeqChannel(signal: AbortSignal) {
    return (state.pushChannel = CTG.jsonSeq.channel({ signal }));
  }

  @Route({ path: '/csv-channel' })
  @GET
  csvChannel(signal: AbortSignal) {
    return (state.pushChannel = CTG.csv.channel({ signal, columns: ['n', 'memo'], bom: true }));
  }

  @Route({ path: '/text-channel' })
  @GET
  textChannel(signal: AbortSignal) {
    return (state.pushChannel = CTG.text.channel({ signal }));
  }
}

async function startServer() {
  const option = new HttpServerOption(
    { listen: { port: 0, hostname: '127.0.0.1' }, noSuchRouteEndPointMappingThrow: () => new NotFoundError({ message: 'no route' }) },
    { rootRouter: CtgRouter }
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
    port,
    close: () => new Promise<void>((resolve, reject) => server.server!.close(err => (err ? reject(err) : resolve())))
  };
}

async function readUntil(reader: ReadableStreamDefaultReader<Uint8Array>, pred: (text: string) => boolean) {
  const dec = new TextDecoder();
  let out = '';
  while (!pred(out)) {
    const { value, done } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  return out;
}

/** fetch 는 gzip 을 자동으로 풀어버려서, 압축 여부·원본 바이트를 보려면 http.request 로 */
const rawGet = (port: number, path: string, headers: Record<string, string> = {}) =>
  new Promise<{ headers: Record<string, any>; body: Buffer }>((resolve, reject) => {
    request({ host: '127.0.0.1', port, path, headers }, res => {
      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject).end();
  });

const waitFor = async (pred: () => boolean, ms = 1000) => {
  for (let i = 0; i < ms / 10 && !pred(); i++) await sleep(10);
  return pred();
};

// ───────────────────────── 형식 규칙 ─────────────────────────
describe('ContentTypeGenerator — sseChunk / ssePing (text/event-stream)', () => {
  test('문자열: data 한 줄 + 빈 줄', () => {
    assert.strictEqual(CTG.sseChunk('hello'), 'data: hello\n\n');
  });

  test('여러 줄 data는 줄마다 "data: " (\\n · \\r\\n · \\r 모두)', () => {
    assert.strictEqual(CTG.sseChunk('a\nb\r\nc\rd'), 'data: a\ndata: b\ndata: c\ndata: d\n\n');
  });

  test('빈 문자열도 이벤트 하나 (data: 빈 값)', () => {
    assert.strictEqual(CTG.sseChunk(''), 'data: \n\n');
  });

  test('data 가 문자열이 아니면 JSON (객체·숫자·boolean·null)', () => {
    assert.strictEqual(CTG.sseChunk({ data: { n: 1 } }), 'data: {"n":1}\n\n');
    assert.strictEqual(CTG.sseChunk({ data: 3 }), 'data: 3\n\n');
    assert.strictEqual(CTG.sseChunk({ data: false }), 'data: false\n\n');
    assert.strictEqual(CTG.sseChunk({ data: null }), 'data: null\n\n');
  });

  test('모든 필드: 주석 → event → id → retry → data 순서', () => {
    assert.strictEqual(
      CTG.sseChunk({ event: 'tick', id: '7', retry: 1500, data: 'ok', comment: 'hi' }),
      ': hi\nevent: tick\nid: 7\nretry: 1500\ndata: ok\n\n'
    );
  });

  test('event·id 안 줄바꿈은 공백으로 (이벤트가 깨지지 않게)', () => {
    assert.strictEqual(CTG.sseChunk({ event: 'a\nb', id: 'c\r\nd' }), 'event: a b\nid: c  d\n\n');
  });

  test('retry 는 0 이상 정수로', () => {
    assert.strictEqual(CTG.sseChunk({ retry: 12.9 }), 'retry: 12\n\n');
    assert.strictEqual(CTG.sseChunk({ retry: -5 }), 'retry: 0\n\n');
  });

  test('주석이 여러 줄이면 줄마다 ": "', () => {
    assert.strictEqual(CTG.sseChunk({ comment: 'x\ny' }), ': x\n: y\n\n');
  });

  test('data 없이 event 만 있어도 빈 줄로 끝남', () => {
    assert.strictEqual(CTG.sseChunk({ event: 'only' }), 'event: only\n\n');
  });

  test('ssePing 은 SSE 주석 (EventSource 가 무시)', () => {
    assert.strictEqual(CTG.ssePing(), ': ping\n\n');
  });
});

describe('ContentTypeGenerator — partType', () => {
  test('type 이 최우선', () => {
    assert.strictEqual(CTG.partType({ body: JPEG, type: 'image/x-custom', name: 'a.png' }), 'image/x-custom');
  });

  test('name 이 있으면 mime-types 로 (charset 이 있는 타입은 charset 포함)', () => {
    assert.strictEqual(CTG.partType({ body: Buffer.from('x'), name: 'photo.png' }), 'image/png');
    assert.strictEqual(CTG.partType({ body: Buffer.from('x'), name: '/some/dir/photo.JPG' }), 'image/jpeg');
    assert.strictEqual(CTG.partType({ body: Buffer.from('{}'), name: 'a.json' }), 'application/json; charset=utf-8');
    assert.strictEqual(CTG.partType({ body: 'x', name: 'a.html' }), 'text/html; charset=utf-8');
  });

  test('현재 순서: name 이 바이트 판별보다 우선 (PNG 내용 + .jpg 이름 → image/jpeg)', () => {
    assert.strictEqual(CTG.partType({ body: PNG, name: 'frame.jpg' }), 'image/jpeg');
  });

  test('모르는 확장자면 바이트 판별로 넘어감', () => {
    assert.strictEqual(CTG.partType({ body: PNG, name: 'frame.unknownext' }), 'image/png');
  });

  test('바이트 판별: JPEG · PNG · GIF · WEBP', () => {
    assert.strictEqual(CTG.partType(JPEG), 'image/jpeg');
    assert.strictEqual(CTG.partType(PNG), 'image/png');
    assert.strictEqual(CTG.partType(GIF), 'image/gif');
    assert.strictEqual(CTG.partType(WEBP), 'image/webp');
  });

  test('Uint8Array, 그리고 큰 버퍼의 일부(subarray)도 offset 맞게 판별', () => {
    assert.strictEqual(CTG.partType(new Uint8Array(PNG)), 'image/png');
    const big = Buffer.concat([Buffer.from('garbage!'), JPEG]);
    assert.strictEqual(CTG.partType(big.subarray(8)), 'image/jpeg');
    assert.strictEqual(CTG.partType(new Uint8Array(big.buffer, big.byteOffset + 8, JPEG.length)), 'image/jpeg');
  });

  test('너무 짧으면 판별 안 함', () => {
    assert.strictEqual(CTG.partType(Buffer.from([0xff, 0xd8])), 'application/octet-stream');
    assert.strictEqual(CTG.partType(Buffer.alloc(0)), 'application/octet-stream');
  });

  test('문자열 body 는 text/plain; charset=utf-8 (fallback 이 있으면 그것)', () => {
    assert.strictEqual(CTG.partType('hello'), 'text/plain; charset=utf-8');
    assert.strictEqual(CTG.partType('{}', 'application/json'), 'application/json');
  });

  test('판별 못 하면 fallback, 없으면 application/octet-stream', () => {
    assert.strictEqual(CTG.partType(Buffer.from([1, 2, 3])), 'application/octet-stream');
    assert.strictEqual(CTG.partType(Buffer.from([1, 2, 3]), 'image/jpeg'), 'image/jpeg');
  });
});

describe('ContentTypeGenerator — multipartPart / multipartEnd', () => {
  test('Buffer: --boundary · Content-Type · Content-Length · 빈 줄 · body · CRLF (바이트 그대로)', () => {
    const part = CTG.multipartPart(JPEG, 'b');
    const expected = Buffer.concat([
      Buffer.from('--b\r\nContent-Type: image/jpeg\r\nContent-Length: 7\r\n\r\n'),
      JPEG,
      Buffer.from('\r\n')
    ]);
    assert.ok(part.equals(expected), part.toString('latin1'));
  });

  test('문자열 body: Content-Length 는 글자 수가 아니라 UTF-8 바이트 수', () => {
    const part = CTG.multipartPart('한글', 'b');
    assert.strictEqual(part.toString('utf8'), '--b\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 6\r\n\r\n한글\r\n');
  });

  test('Uint8Array body 도 그대로', () => {
    const part = CTG.multipartPart(new Uint8Array([1, 2]), 'b', 'application/x-test');
    assert.ok(part.equals(Buffer.concat([Buffer.from('--b\r\nContent-Type: application/x-test\r\nContent-Length: 2\r\n\r\n'), Buffer.from([1, 2]), Buffer.from('\r\n')])));
  });

  test('추가 헤더는 Content-Length 뒤에, 줄바꿈은 공백으로 (헤더 주입 방지)', () => {
    const part = CTG.multipartPart({ body: 'x', headers: { 'X-Seq': '1', 'X-Bad\n': 'a\r\nInjected: yes' } }, 'b');
    assert.strictEqual(
      part.toString(),
      '--b\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 1\r\nX-Seq: 1\r\nX-Bad : a  Injected: yes\r\n\r\nx\r\n'
    );
  });

  test('빈 body 도 Content-Length: 0', () => {
    assert.strictEqual(CTG.multipartPart(Buffer.alloc(0), 'b').toString(), '--b\r\nContent-Type: application/octet-stream\r\nContent-Length: 0\r\n\r\n\r\n');
  });

  test('multipartEnd: --boundary--CRLF', () => {
    assert.strictEqual(CTG.multipartEnd('b').toString(), '--b--\r\n');
  });
});

describe('ContentTypeGenerator — ndjsonLine / boundary', () => {
  test('ndjsonLine: JSON + \\n (문자열 안 줄바꿈은 이스케이프돼서 한 줄 유지)', () => {
    assert.strictEqual(CTG.ndjsonLine({ b: 'x\ny' }), '{"b":"x\\ny"}\n');
    assert.strictEqual(CTG.ndjsonLine('s'), '"s"\n');
    assert.strictEqual(CTG.ndjsonLine(null), 'null\n');
    assert.strictEqual(CTG.ndjsonLine([1, { a: [2] }]), '[1,{"a":[2]}]\n');
  });

  test('boundary: 안 주면 무작위 (매번 다름)', () => {
    const a = CTG.boundary();
    assert.match(a, /^boundary-[0-9a-f]{24}$/);
    assert.notStrictEqual(a, CTG.boundary());
  });

  test("boundary: RFC 2046 허용 — 1자, 70자, 중간 공백, 특수문자 '()+_,-./:=?", () => {
    assert.strictEqual(CTG.boundary('f'), 'f');
    assert.strictEqual(CTG.boundary('x'.repeat(70)), 'x'.repeat(70));
    assert.strictEqual(CTG.boundary('a b'), 'a b');
    assert.strictEqual(CTG.boundary("'()+_,-./:=?"), "'()+_,-./:=?");
  });

  test('boundary: 거부 — 빈 값, 71자, 공백으로 끝남, 줄바꿈·따옴표 등', () => {
    for (const bad of ['', 'x'.repeat(71), 'ends ', 'has\nnewline', 'q"uote', 'semi;colon', '한글']) {
      assert.throws(() => CTG.boundary(bad), /invalid multipart boundary/, JSON.stringify(bad));
    }
  });
});

// ───────────────────────── pull ─────────────────────────
describe('ContentTypeGenerator — pull (원본 generator 감싸기)', () => {
  test('Stream 정보: contentType · compress', () => {
    assert.deepStrictEqual([CTG.sse([]).contentType, CTG.sse([]).compress], ['text/event-stream', true]);
    assert.deepStrictEqual([CTG.sse([], { heartbeatMs: 10 }).contentType, CTG.sse([], { heartbeatMs: 10 }).compress], ['text/event-stream', true]);
    assert.deepStrictEqual([CTG.ndjson([]).contentType, CTG.ndjson([]).compress], ['application/x-ndjson', true]);
    const r = CTG.multipartReplace([], { boundary: 'f' });
    assert.deepStrictEqual([r.contentType, r.compress], ['multipart/x-mixed-replace; boundary=f', false]);
    const m = CTG.multipartMixed([], { boundary: 'm' });
    assert.deepStrictEqual([m.contentType, m.compress], ['multipart/mixed; boundary=m', true]);
  });

  test('boundary 를 안 주면 무작위로 만들고 contentType 에도 같은 값', async () => {
    const r = CTG.multipartReplace([JPEG]);
    const b = r.contentType.split('boundary=')[1];
    assert.match(b, /^boundary-[0-9a-f]{24}$/);
    const [part] = await collect(r);
    assert.ok(part.toString('latin1').startsWith(`--${b}\r\n`));
  });

  test('잘못된 boundary 는 만들 때 바로 에러', () => {
    assert.throws(() => CTG.multipartReplace([], { boundary: 'bad\n' }));
    assert.throws(() => CTG.multipartMixed([], { boundary: '' }));
  });

  test('sync iterable(배열·function*) 과 async generator 모두 받음', async () => {
    assert.strictEqual(text(await collect(CTG.ndjson([1, 2]))), '1\n2\n');
    assert.strictEqual(text(await collect(CTG.ndjson((function* () { yield 'a'; })()))), '"a"\n');
    assert.strictEqual(text(await collect(CTG.ndjson((async function* () { yield { k: 1 }; })()))), '{"k":1}\n');
  });

  test('sse: 문자열·객체 이벤트를 차례로', async () => {
    assert.strictEqual(text(await collect(CTG.sse(['a', { event: 'e', data: [1] }]))), 'data: a\n\nevent: e\ndata: [1]\n\n');
  });

  test('multipartReplace: 파트마다 형식 + type 옵션은 판별 못 할 때의 기본값', async () => {
    const parts = await collect(CTG.multipartReplace([JPEG, Buffer.from([1])], { boundary: 'f', type: 'image/jpeg' }));
    assert.ok(parts[0].equals(CTG.multipartPart(JPEG, 'f')));
    assert.ok(parts[1].toString('latin1').startsWith('--f\r\nContent-Type: image/jpeg\r\nContent-Length: 1\r\n'));
  });

  test('multipartMixed: 끝나면 --boundary--, 원본이 비어도 끝 표시는 나감', async () => {
    const out = await collect(CTG.multipartMixed(['a', 'b'], { boundary: 'm' }));
    assert.strictEqual(out.length, 3);
    assert.strictEqual(out.at(-1)!.toString(), '--m--\r\n');
    const empty = await collect(CTG.multipartMixed([], { boundary: 'm' }));
    assert.deepStrictEqual(empty.map(b => b.toString()), ['--m--\r\n']);
  });

  test('바깥을 return() 하면(클라이언트 끊김) 원본의 finally 가 돎', async () => {
    const { gen, log } = tracked([1, 2, 3, 4]);
    const s = CTG.ndjson(gen);
    assert.deepStrictEqual(await s.next(), { value: '1\n', done: false });
    await s.return(undefined);
    assert.strictEqual(log.finished, true);
    assert.strictEqual(log.yielded, 0); // 두 번째로 넘어가기 전에 끝남
  });

  test('원본이 던진 에러는 그대로 전달', async () => {
    async function* bad() { yield 1; throw new Error('boom'); }
    const s = CTG.ndjson(bad());
    await s.next();
    await assert.rejects(() => s.next(), /boom/);
  });

  test('sse heartbeat: 원본이 조용한 동안 ping, 이벤트가 오면 그대로 (ping 이 이벤트를 삼키지 않음)', async () => {
    let release!: () => void;
    const gate = new Promise<void>(r => (release = r));
    async function* src() { yield 'a'; await gate; yield 'b'; }
    const s = CTG.sse(src(), { heartbeatMs: 20 });
    assert.strictEqual((await s.next()).value, 'data: a\n\n');
    assert.strictEqual((await s.next()).value, ': ping\n\n');
    assert.strictEqual((await s.next()).value, ': ping\n\n');
    release();
    let v = (await s.next()).value;
    while (v === ': ping\n\n') v = (await s.next()).value;
    assert.strictEqual(v, 'data: b\n\n');
    assert.strictEqual((await s.next()).done, true);
  });

  test('sse heartbeat: 중간에 return() 하면 원본도 정리', async () => {
    const { gen, log } = tracked(['x']);
    const s = CTG.sse(gen, { heartbeatMs: 10 });
    await s.next();
    await s.return(undefined);
    assert.strictEqual(log.finished, true);
  });

  test('sse heartbeat: 배열(sync iterable)도 받음', async () => {
    assert.strictEqual(text(await collect(CTG.sse(['p', 'q'], { heartbeatMs: 50 }))), 'data: p\n\ndata: q\n\n');
  });
});

// ───────────────────────── push ─────────────────────────
describe('ContentTypeGenerator — push 채널', () => {
  test('Stream 정보: 형식별 contentType · compress', () => {
    assert.deepStrictEqual([CTG.sse.channel().contentType, CTG.sse.channel().compress], ['text/event-stream', true]);
    assert.deepStrictEqual([CTG.ndjson.channel().contentType, CTG.ndjson.channel().compress], ['application/x-ndjson', true]);
    const r = CTG.multipartReplace.channel({ boundary: 'f' });
    assert.deepStrictEqual([r.contentType, r.compress], ['multipart/x-mixed-replace; boundary=f', false]);
    const m = CTG.multipartMixed.channel({ boundary: 'm' });
    assert.deepStrictEqual([m.contentType, m.compress], ['multipart/mixed; boundary=m', true]);
  });

  test('push 한 순서대로 나오고, push 는 true / close 후엔 false', async () => {
    const out = CTG.ndjson.channel();
    assert.strictEqual(out.push(1), true);
    assert.strictEqual(out.push(2), true);
    assert.strictEqual(out.closed, false);
    out.close();
    assert.strictEqual(out.closed, true);
    assert.strictEqual(out.push(3), false);
    assert.deepStrictEqual(await collect(out), ['1\n', '2\n']);
  });

  test('sse.channel: 문자열·이벤트 객체를 SSE 형식으로', async () => {
    const out = CTG.sse.channel();
    out.push('hi');
    out.push({ event: 'tick', id: '3', data: { n: 3 } });
    out.close();
    assert.strictEqual(text(await collect(out)), 'data: hi\n\nevent: tick\nid: 3\ndata: {"n":3}\n\n');
  });

  test('기다리는 중에 push 하면 바로 깨어남', async () => {
    const out = CTG.sse.channel();
    const pending = out.next();
    setTimeout(() => out.push('late'), 20);
    assert.deepStrictEqual(await pending, { value: 'data: late\n\n', done: false });
    out.close();
  });

  test("keep: 'latest' 는 밀린 것 중 최신 하나만", async () => {
    const out = CTG.multipartReplace.channel({ boundary: 'f', keep: 'latest' });
    out.push(Buffer.from('1'));
    out.push(Buffer.from('2'));
    out.push(JPEG);
    out.close();
    const parts = await collect(out);
    assert.strictEqual(parts.length, 1);
    assert.ok(parts[0].equals(CTG.multipartPart(JPEG, 'f')));
  });

  test("keep: 'latest' — 읽어 가는 사이사이 넣은 건 각각 나옴", async () => {
    const out = CTG.ndjson.channel({ keep: 'latest' });
    out.push('a');
    assert.strictEqual((await out.next()).value, '"a"\n');
    out.push('b');
    assert.strictEqual((await out.next()).value, '"b"\n');
    out.close();
  });

  test("keep: 'queue' max 넘치면 가장 오래된 것부터 버림, max 는 최소 1", async () => {
    const out = CTG.ndjson.channel({ max: 2 });
    [1, 2, 3].forEach(v => out.push(v));
    out.close();
    assert.deepStrictEqual(await collect(out), ['2\n', '3\n']);
    const one = CTG.ndjson.channel({ max: 0 });
    [1, 2].forEach(v => one.push(v));
    one.close();
    assert.deepStrictEqual(await collect(one), ['2\n']);
  });

  test('multipartMixed.channel: close 하면 쌓인 것 다음에 --boundary--', async () => {
    const out = CTG.multipartMixed.channel({ boundary: 'm' });
    out.push('x');
    out.close();
    const parts = (await collect(out)).map(b => b.toString());
    assert.deepStrictEqual(parts, ['--m\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 1\r\n\r\nx\r\n', '--m--\r\n']);
  });

  test('sse.channel heartbeat: 조용하면 ping, push 가 오면 이벤트', async () => {
    const out = CTG.sse.channel({ heartbeatMs: 20 });
    assert.strictEqual((await out.next()).value, ': ping\n\n');
    out.push('real');
    assert.strictEqual((await out.next()).value, 'data: real\n\n');
    out.close();
    assert.strictEqual((await out.next()).done, true);
  });

  test('signal abort: 기다리던 next 가 done, onClose 한 번 (늦게 등록해도 바로 불림)', async () => {
    const ac = new AbortController();
    const out = CTG.sse.channel({ signal: ac.signal });
    let closed = 0;
    out.onClose(() => closed++);
    const pending = out.next();
    ac.abort();
    assert.deepStrictEqual(await pending, { value: undefined, done: true });
    assert.strictEqual(closed, 1);
    out.onClose(() => closed++);
    assert.strictEqual(closed, 2);
    assert.strictEqual(out.push('x'), false);
  });

  test('이미 abort 된 signal 이면 처음부터 닫힘', async () => {
    const out = CTG.ndjson.channel({ signal: AbortSignal.abort() });
    assert.strictEqual(out.closed, true);
    assert.strictEqual(out.push(1), false);
    assert.strictEqual((await out.next()).done, true);
  });

  test('return(): 기다리는 중이어도 바로 끝내고 onClose (조용한 채널 정리)', async () => {
    const out = CTG.sse.channel();
    let closed = 0;
    out.onClose(() => closed++);
    const pending = out.next();
    assert.deepStrictEqual(await out.return(undefined), { value: undefined, done: true });
    assert.deepStrictEqual(await pending, { value: undefined, done: true });
    await out.return(undefined);
    assert.strictEqual(closed, 1); // 여러 번 끝나도 onClose 는 한 번
  });

  test('throw(): 닫고 에러를 다시 던짐', async () => {
    const out = CTG.ndjson.channel();
    let closed = false;
    out.onClose(() => (closed = true));
    await assert.rejects(() => out.throw(new Error('stop')), /stop/);
    assert.strictEqual(closed, true);
  });

  test('onClose 콜백 하나가 던져도 나머지는 불림', async () => {
    const out = CTG.ndjson.channel();
    let second = false;
    out.onClose(() => { throw new Error('cleanup failed'); });
    out.onClose(() => (second = true));
    await out.return(undefined);
    assert.strictEqual(second, true);
  });

  test('for await 가능 (자기 자신이 async iterator)', async () => {
    const out = CTG.ndjson.channel();
    assert.strictEqual(out[Symbol.asyncIterator](), out);
    out.push(1);
    out.close();
    assert.deepStrictEqual(await collect(out), ['1\n']);
  });

  test('Symbol.asyncDispose 가 있으면 await using 정리 지원', async () => {
    const dispose = (Symbol as any).asyncDispose;
    if (!dispose) return;
    const out = CTG.ndjson.channel();
    let closed = false;
    out.onClose(() => (closed = true));
    await (out as any)[dispose]();
    assert.strictEqual(closed, true);
  });
});

describe('ContentTypeGenerator — json-seq · JSON 배열 · CSV · text', () => {
  test('jsonSeqRecord: RS + JSON + \\n, undefined 는 null', () => {
    assert.strictEqual(CTG.jsonSeqRecord({ a: 1 }), '\x1e{"a":1}\n');
    assert.strictEqual(CTG.jsonSeqRecord(undefined), '\x1enull\n');
    assert.strictEqual(CTG.ndjsonLine(undefined), 'null\n');
  });

  test('csvCell: 필요할 때만 따옴표, " 는 "", null·undefined 는 빈 칸', () => {
    assert.deepStrictEqual(
      ['a', 'a,b', 'say "hi"', 'x\ny', ' pad', 1.5, true, null, undefined, { k: 1 }, new Date(0)].map(CTG.csvCell),
      ['a', '"a,b"', '"say ""hi"""', '"x\ny"', '" pad"', '1.5', 'true', '', '', '"{""k"":1}"', '1970-01-01T00:00:00.000Z']
    );
    assert.strictEqual(CTG.csvRow(['a', 'b,c', '']), 'a,"b,c",\r\n');
  });

  test('textLine: 문자열은 그대로, 나머지는 JSON', () => {
    assert.deepStrictEqual(['hi', { a: 1 }, 3].map(CTG.textLine), ['hi\n', '{"a":1}\n', '3\n']);
  });

  test('Stream 정보: contentType · compress', () => {
    const types = ['application/json-seq', 'application/json', 'text/csv; charset=utf-8', 'text/plain; charset=utf-8'];
    assert.deepStrictEqual([CTG.jsonSeq([]), CTG.jsonArray([]), CTG.csv([]), CTG.text([])].map(s => [s.contentType, s.compress]), types.map(t => [t, true]));
    assert.deepStrictEqual(
      [CTG.jsonSeq.channel(), CTG.jsonArray.channel(), CTG.csv.channel(), CTG.text.channel()].map(s => [s.contentType, s.compress]),
      types.map(t => [t, true])
    );
  });

  test('jsonArray: 항목 사이에만 쉼표, 비어도 [] — 합치면 유효한 JSON', async () => {
    assert.deepStrictEqual(await collect(CTG.jsonArray([{ a: 1 }, 2, undefined])), ['[', '{"a":1}', ',2', ',null', ']']);
    assert.strictEqual(text(await collect(CTG.jsonArray([]))), '[]');
    assert.deepStrictEqual(JSON.parse(text(await collect(CTG.jsonArray(['x', [1]])))), ['x', [1]]);
  });

  test('jsonArray: 중간에 끊기면 ] 없이 끝나고 원본 finally 가 돎', async () => {
    const { gen, log } = tracked([1, 2, 3]);
    const s = CTG.jsonArray(gen);
    assert.deepStrictEqual([(await s.next()).value, (await s.next()).value], ['[', '1']);
    assert.deepStrictEqual(await s.return(), { value: undefined, done: true });
    assert.strictEqual(log.finished, true);
  });

  test('csv: 배열 행, columns 로 헤더 + 객체 행, bom', async () => {
    assert.strictEqual(text(await collect(CTG.csv([[1, 'a,b'], [2, null]]))), '1,"a,b"\r\n2,\r\n');
    assert.strictEqual(text(await collect(CTG.csv([{ b: 2, a: 1 }, { a: 'x' }], { columns: ['a', 'b'] }))), 'a,b\r\n1,2\r\nx,\r\n');
    assert.strictEqual(text(await collect(CTG.csv([{ b: 2, a: 1 }]))), '2,1\r\n'); // columns 없으면 Object.values 순서
    assert.strictEqual(text(await collect(CTG.csv([], { columns: ['a'], bom: true }))), '﻿a\r\n'); // 행이 없어도 헤더
  });

  test('channel: jsonArray 는 [ 먼저, close 하면 ] — push 없이 close 해도 []', async () => {
    const out = CTG.jsonArray.channel();
    out.push({ a: 1 });
    out.push(2);
    out.close();
    assert.strictEqual(text(await collect(out)), '[{"a":1},2]');
    const empty = CTG.jsonArray.channel();
    empty.close();
    assert.strictEqual(text(await collect(empty)), '[]');
  });

  test('channel: 이미 abort 면 [ 도 안 나감', async () => {
    assert.deepStrictEqual(await collect(CTG.jsonArray.channel({ signal: AbortSignal.abort() })), []);
  });

  test('channel: csv 헤더·bom 먼저, jsonSeq · text 는 한 레코드씩', async () => {
    const c = CTG.csv.channel({ columns: ['n'], bom: true });
    c.push({ n: 1 });
    c.push([2]);
    c.close();
    assert.strictEqual(text(await collect(c)), '﻿n\r\n1\r\n2\r\n');

    const j = CTG.jsonSeq.channel();
    j.push({ a: 1 });
    j.close();
    assert.deepStrictEqual(await collect(j), ['\x1e{"a":1}\n']);

    const t = CTG.text.channel();
    t.push('log');
    t.close();
    assert.deepStrictEqual(await collect(t), ['log\n']);
  });
});

describe('ContentTypeGenerator — isStream', () => {
  test('contentType 을 가진 async generator 만 Stream', () => {
    assert.strictEqual(CTG.isStream(CTG.ndjson([])), true);
    assert.strictEqual(CTG.isStream(CTG.sse([])), true);
    assert.strictEqual(CTG.isStream(CTG.sse.channel()), true);
    assert.strictEqual(CTG.isStream((async function* () {})()), false);
    assert.strictEqual(CTG.isStream((function* () {})()), false);
    assert.strictEqual(CTG.isStream({ contentType: 'x' }), false);
    assert.strictEqual(CTG.isStream(null), false);
  });
});

// ───────────────────────── 서버 응답 ─────────────────────────
describe('ContentTypeGenerator — 서버 응답', () => {
  test('multipartReplace: Content-Type 은 Stream 이 정하고(boundary 포함), gzip 요청이어도 압축 안 함', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/mjpeg', { 'accept-encoding': 'gzip' });
      assert.strictEqual(res.headers['content-type'], 'multipart/x-mixed-replace; boundary=frame');
      assert.strictEqual(res.headers['content-encoding'], undefined);
      assert.ok(res.body.equals(Buffer.concat([CTG.multipartPart(JPEG, 'frame'), CTG.multipartPart(PNG, 'frame')])));
    } finally {
      await close();
    }
  });

  test('데코레이터 contentType 보다 Stream 이 우선, 다른 헤더는 그대로', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/mjpeg-override');
      assert.strictEqual(res.headers['content-type'], 'multipart/x-mixed-replace; boundary=right');
      assert.strictEqual(res.headers['cache-control'], 'no-cache');
    } finally {
      await close();
    }
  });

  test('multipartMixed: gzip 요청이면 압축되고, 풀면 끝 표시까지 그대로', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/mixed', { 'accept-encoding': 'gzip' });
      assert.strictEqual(res.headers['content-type'], 'multipart/mixed; boundary=m');
      assert.strictEqual(res.headers['content-encoding'], 'gzip');
      const body = gunzipSync(res.body);
      const expected = Buffer.concat([CTG.multipartPart({ body: 'a', name: 'a.txt' }, 'm'), CTG.multipartPart(PNG, 'm'), CTG.multipartEnd('m')]);
      assert.ok(body.equals(expected), body.toString('latin1'));
    } finally {
      await close();
    }
  });

  test('ndjson: 한 줄에 하나씩 나뉘어 옴', async () => {
    const { baseUrl, close } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/ctg/ndjson`);
      assert.strictEqual(res.headers.get('content-type'), 'application/x-ndjson');
      const lines = (await res.text()).trimEnd().split('\n').map(l => JSON.parse(l));
      assert.deepStrictEqual(lines, [{ a: 1 }, { b: 'x\ny' }, 3]);
    } finally {
      await close();
    }
  });

  test('text/event-stream: 압축 없이 받으면 이벤트 그대로', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/sse', { 'accept-encoding': 'identity' });
      assert.strictEqual(res.headers['content-type'], 'text/event-stream');
      assert.strictEqual(res.headers['content-encoding'], undefined);
      assert.strictEqual(res.body.toString(), 'data: one\n\nevent: e\ndata: {"n":2}\n\n');
    } finally {
      await close();
    }
  });

  test('text/event-stream: gzip 압축돼도 풀면 이벤트 그대로', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/sse', { 'accept-encoding': 'gzip' });
      assert.strictEqual(res.headers['content-type'], 'text/event-stream');
      assert.strictEqual(res.headers['content-encoding'], 'gzip');
      assert.strictEqual(gunzipSync(res.body).toString(), 'data: one\n\nevent: e\ndata: {"n":2}\n\n');
    } finally {
      await close();
    }
  });

  test('text/event-stream: 데코레이터에 같이 적어도 그대로, 다른 헤더(X-Accel-Buffering 등)도 나감', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/sse-declared', { 'accept-encoding': 'identity' });
      assert.strictEqual(res.headers['content-type'], 'text/event-stream');
      assert.strictEqual(res.headers['cache-control'], 'no-cache');
      assert.strictEqual(res.headers['x-accel-buffering'], 'no');
      assert.strictEqual(res.body.toString(), 'id: 1\ndata: declared\n\n');
    } finally {
      await close();
    }
  });

  test('text/event-stream: 브라우저 EventSource 처럼 파싱하면 event·id·data 가 나옴', async () => {
    const { baseUrl, close } = await startServer();
    try {
      const raw = await (await fetch(`${baseUrl}/ctg/sse`)).text();
      // EventSource 파싱 규칙(빈 줄로 이벤트 구분, field: value) 그대로
      const events = raw.split('\n\n').filter(Boolean).map(block => {
        const ev: Record<string, string> = { event: 'message', data: '' };
        for (const line of block.split('\n')) {
          const [field, ...rest] = line.split(': ');
          ev[field] = field === 'data' && ev.data ? ev.data + '\n' + rest.join(': ') : rest.join(': ');
        }
        return ev;
      });
      assert.deepStrictEqual(events, [{ event: 'message', data: 'one' }, { event: 'e', data: '{"n":2}' }]);
    } finally {
      await close();
    }
  });

  test('sse heartbeat: 원본이 조용해도 ": ping" 이 나감', async () => {
    const { baseUrl, close } = await startServer();
    try {
      const ac = new AbortController();
      const res = await fetch(`${baseUrl}/ctg/sse-heartbeat`, { signal: ac.signal });
      assert.strictEqual(res.headers.get('content-type'), 'text/event-stream');
      const got = await readUntil(res.body!.getReader(), t => t.includes(': ping\n\n'));
      assert.ok(got.startsWith('data: first\n\n'), got);
      ac.abort();
    } finally {
      await close();
    }
  });

  test('pull: 클라이언트가 끊으면 원본 generator 의 finally 가 돎', async () => {
    const { baseUrl, close } = await startServer();
    try {
      state.pullFinished = false;
      const ac = new AbortController();
      const res = await fetch(`${baseUrl}/ctg/pull-infinite`, { signal: ac.signal });
      await readUntil(res.body!.getReader(), t => t.includes('Content-Type: image/jpeg'));
      ac.abort();
      assert.strictEqual(await waitFor(() => state.pullFinished), true);
    } finally {
      await close();
    }
  });

  test('sse.channel: push 하면 바로 오고, 기다리는 중에 끊어도 onClose 가 불림', async () => {
    const { baseUrl, close } = await startServer();
    try {
      state.channelClosed = false;
      state.sseChannel = undefined;
      const ac = new AbortController();
      const res = await fetch(`${baseUrl}/ctg/sse-channel`, { signal: ac.signal });
      assert.strictEqual(res.headers.get('content-type'), 'text/event-stream');
      const reader = res.body!.getReader();
      await waitFor(() => !!state.sseChannel);
      state.sseChannel!.push({ event: 'hello', data: { n: 1 } });
      assert.strictEqual(await readUntil(reader, t => t.includes('\n\n')), 'event: hello\ndata: {"n":1}\n\n');
      ac.abort();
      assert.strictEqual(await waitFor(() => state.channelClosed), true);
    } finally {
      await close();
    }
  });

  test('multipartReplace.channel: push 한 프레임이 boundary 파트로, 압축 없이', async () => {
    const { baseUrl, close } = await startServer();
    try {
      state.mjpegChannel = undefined;
      const ac = new AbortController();
      const res = await fetch(`${baseUrl}/ctg/mjpeg-channel`, { signal: ac.signal, headers: { 'accept-encoding': 'gzip' } });
      assert.strictEqual(res.headers.get('content-type'), 'multipart/x-mixed-replace; boundary=live');
      assert.strictEqual(res.headers.get('content-encoding'), null);
      await waitFor(() => !!state.mjpegChannel);
      state.mjpegChannel!.push({ body: PNG, name: 'x.png' });
      const got = await readUntil(res.body!.getReader(), t => t.includes('\r\n\r\n'));
      assert.ok(got.startsWith('--live\r\nContent-Type: image/png\r\nContent-Length: 9\r\n\r\n'), got);
      ac.abort();
    } finally {
      await close();
    }
  });

  test('ndjson.channel: close 하면 응답이 끝남', async () => {
    const { baseUrl, close } = await startServer();
    try {
      state.ndjsonChannel = undefined;
      const res = fetch(`${baseUrl}/ctg/ndjson-channel`);
      await waitFor(() => !!state.ndjsonChannel);
      state.ndjsonChannel!.push({ i: 1 });
      state.ndjsonChannel!.push({ i: 2 });
      state.ndjsonChannel!.close();
      assert.strictEqual(await (await res).text(), '{"i":1}\n{"i":2}\n');
    } finally {
      await close();
    }
  });

  test('jsonSeq: 레코드마다 RS 로 나눌 수 있음', async () => {
    const { baseUrl, close } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/ctg/json-seq`);
      assert.strictEqual(res.headers.get('content-type'), 'application/json-seq');
      const records = (await res.text()).split('\x1e').filter(Boolean).map(r => JSON.parse(r));
      assert.deepStrictEqual(records, [{ a: 1 }, 'b']);
    } finally {
      await close();
    }
  });

  test('jsonArray: 받으면 그냥 res.json() 으로 파싱 (gzip 이어도)', async () => {
    const { baseUrl, close } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/ctg/json-array`, { headers: { 'accept-encoding': 'gzip' } });
      assert.strictEqual(res.headers.get('content-type'), 'application/json');
      assert.deepStrictEqual(await res.json(), [{ a: 1 }, [2], 'x']);
    } finally {
      await close();
    }
  });

  test('csv: BOM + 헤더 + 이스케이프, 한글은 UTF-8, 다른 헤더(Content-Disposition)도 나감', async () => {
    const { port, close } = await startServer();
    try {
      const res = await rawGet(port, '/ctg/csv');
      assert.strictEqual(res.headers['content-type'], 'text/csv; charset=utf-8');
      assert.strictEqual(res.headers['content-disposition'], 'attachment; filename="rows.csv"');
      assert.deepStrictEqual([...res.body.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
      assert.strictEqual(res.body.subarray(3).toString('utf8'), 'name,memo\r\n홍길동,"a,b"\r\nkim,"say ""hi"""\r\n');
    } finally {
      await close();
    }
  });

  test('text: 한 줄에 하나', async () => {
    const { baseUrl, close } = await startServer();
    try {
      const res = await fetch(`${baseUrl}/ctg/text`);
      assert.strictEqual(res.headers.get('content-type'), 'text/plain; charset=utf-8');
      assert.strictEqual(await res.text(), 'line 1\nline 2\n');
    } finally {
      await close();
    }
  });

  test('jsonArray.channel: push 하고 close 하면 res.json() 이 배열', async () => {
    const { baseUrl, close } = await startServer();
    try {
      state.jsonArrayChannel = undefined;
      const res = fetch(`${baseUrl}/ctg/json-array-channel`);
      await waitFor(() => !!state.jsonArrayChannel);
      state.jsonArrayChannel!.push({ i: 1 });
      state.jsonArrayChannel!.push({ i: 2 });
      state.jsonArrayChannel!.close();
      assert.deepStrictEqual(await (await res).json(), [{ i: 1 }, { i: 2 }]);
    } finally {
      await close();
    }
  });

  // jsonSeq · csv · text 채널: 서버에서 push → close 하면 응답이 끝나고 형식이 붙어 있음
  for (const c of [
    { path: 'json-seq-channel', type: 'application/json-seq', push: [{ i: 1 }, 'b'], body: '\x1e{"i":1}\n\x1e"b"\n' },
    { path: 'csv-channel', type: 'text/csv; charset=utf-8', push: [{ n: 1, memo: '한,글' }, [2, 'x']], body: '﻿n,memo\r\n1,"한,글"\r\n2,x\r\n' },
    { path: 'text-channel', type: 'text/plain; charset=utf-8', push: ['log 1', { a: 1 }], body: 'log 1\n{"a":1}\n' }
  ]) {
    test(`${c.path}: push 하고 close 하면 형식대로 끝까지 옴 (gzip 이어도)`, async () => {
      const { baseUrl, close } = await startServer();
      try {
        state.pushChannel = undefined;
        const res = fetch(`${baseUrl}/ctg/${c.path}`, { headers: { 'accept-encoding': 'gzip' } });
        await waitFor(() => !!state.pushChannel);
        for (const v of c.push) state.pushChannel!.push(v as any);
        state.pushChannel!.close();
        const r = await res;
        assert.strictEqual(r.headers.get('content-type'), c.type);
        assert.strictEqual(r.headers.get('content-encoding'), 'gzip');
        // res.text() 는 BOM 을 떼버려서 바이트로 확인
        assert.strictEqual(Buffer.from(await r.arrayBuffer()).toString('utf8'), c.body);
      } finally {
        await close();
      }
    });
  }
});
