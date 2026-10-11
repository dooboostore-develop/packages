import { randomBytes } from 'crypto';
import mime from 'mime-types';
import { ValidUtils } from '@dooboostore/core';
import { Mimes } from '../codes/Mimes';

/**
 * Content-Type 별 스트리밍 응답 묶음.
 * 핸들러는 내용(payload)만 넘기고, 형식(SSE `data:`·multipart boundary·CRLF·Content-Type·Content-Length·NDJSON 줄바꿈)은 여기서 붙인다.
 *
 * 돌려주는 Stream 은 그대로 async generator 라서 핸들러에서 return 하면 프레임워크가 yield 마다 바로 body 로 쏜다.
 * Stream 이 contentType(boundary 포함)·compress 를 들고 있어 데코레이터에 contentType 을 따로 적지 않아도 된다.
 *
 * pull — 내 반복문이 만들어 yield 할 때:
 *   return ContentTypeGenerator.multipartReplace(this.frames(file, signal));
 * push — 콜백·이벤트로 올 때마다 넣을 때:
 *   const out = ContentTypeGenerator.multipartReplace.channel({ signal, keep: 'latest' });
 *   watcher.on('change', buf => out.push(buf));
 *   out.onClose(() => watcher.close());
 *   return out;
 */
export namespace ContentTypeGenerator {
  export type Source<T> = Iterable<T> | AsyncIterable<T>;

  /** 프레임워크가 받는 스트림: async generator + 응답 헤더 정보 */
  export type Stream<T = string | Buffer> = AsyncGenerator<T, void, undefined> & {
    readonly contentType: string;
    /** false 면 Accept-Encoding: gzip 이어도 압축 안 함 (JPEG 처럼 이미 압축된 내용) */
    readonly compress: boolean;
  };

  /** push 용: Stream + 넣기·닫기 */
  export type Channel<In, Out = string | Buffer> = Stream<Out> & {
    /** 넣기. 닫혔으면 false */
    push(value: In): boolean;
    /** 더 넣을 게 없음 — 쌓인 건 마저 보내고 끝냄 */
    close(): void;
    readonly closed: boolean;
    /** 끝날 때(클라이언트 끊김·close·signal abort) 한 번 — 감시자·리스너 정리용 */
    onClose(fn: () => void): void;
  };

  export type ChannelOption = {
    /** abort 되면 채널을 닫음 */
    signal?: AbortSignal;
    /** 'queue': 하나도 안 버리고 순서대로 (이벤트) · 'latest': 밀리면 최신 하나만 (영상 프레임) */
    keep?: 'queue' | 'latest';
    /** 'queue' 최대 개수 — 넘치면 가장 오래된 것부터 버림 (기본 1000) */
    max?: number;
  };

  export const isStream = (value: any): value is Stream =>
    ValidUtils.isAsyncGenerator(value) && typeof (value as any).contentType === 'string';

  // ───────────────────────── 형식 규칙 (순수 함수) ─────────────────────────

  export type SseEvent =
    | string
    | { data?: unknown; event?: string; id?: string; retry?: number; comment?: string };

  const oneLine = (v: string) => v.replace(/[\r\n]/g, ' ');

  /**
   * SSE 이벤트 하나 → `field: value\n` 줄들 + 빈 줄(\n).
   * data 가 여러 줄이면 줄마다 `data: ` (그냥 넣으면 줄바꿈에서 이벤트가 끊김). 문자열이 아니면 JSON.
   */
  export const sseChunk = (e: SseEvent): string => {
    const ev = typeof e === 'string' ? { data: e } : e;
    let out = '';
    if (ev.comment !== undefined) out += ev.comment.split(/\r\n|\r|\n/).map(l => `: ${l}\n`).join('');
    if (ev.event !== undefined) out += `event: ${oneLine(ev.event)}\n`;
    if (ev.id !== undefined) out += `id: ${oneLine(ev.id)}\n`;
    if (ev.retry !== undefined) out += `retry: ${Math.max(0, Math.floor(ev.retry))}\n`;
    if (ev.data !== undefined) {
      const text = typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data);
      out += text.split(/\r\n|\r|\n/).map(l => `data: ${l}\n`).join('');
    }
    return out + '\n';
  };

  /** 연결 유지용 SSE 주석 (브라우저 EventSource 는 무시) */
  export const ssePing = (): string => ': ping\n\n';

  export type Part =
    | Buffer
    | Uint8Array
    | string
    | { body: Buffer | Uint8Array | string; type?: string; name?: string; headers?: Record<string, string> };

  /** 바이트 앞부분으로 흔한 이미지 판별 (mime-types 는 이름으로만 찾음) — 이름 없이 Buffer만 온 프레임용 */
  const sniff = (b: Buffer): string | undefined => {
    if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return Mimes.ImageJpeg;
    if (b.length >= 8 && b.readUInt32BE(0) === 0x89504e47 && b.readUInt32BE(4) === 0x0d0a1a0a) return Mimes.ImagePng;
    if (b.length >= 6 && b.toString('ascii', 0, 4) === 'GIF8') return Mimes.ImageGif;
    if (b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return undefined;
  };

  /**
   * 파트 MIME: type > mime-types(name) > 바이트 판별 > 문자열이면 text/plain;utf-8 > octet-stream
   */
  export const partType = (part: Part, fallback?: string): string => {
    const p = isPartObject(part) ? part : { body: part };
    if (p.type) return p.type;
    if (p.name) {
      const byName = mime.lookup(p.name);
      if (byName) return mime.contentType(byName) || byName;
    }
    if (typeof p.body === 'string') return fallback ?? Mimes.TextPlainUtf8;
    return sniff(Buffer.from(p.body.buffer, p.body.byteOffset, p.body.byteLength)) ?? fallback ?? Mimes.ApplicationOctetStream;
  };

  const isPartObject = (part: Part): part is Exclude<Part, Buffer | Uint8Array | string> =>
    typeof part === 'object' && !(part instanceof Uint8Array);

  const toBuffer = (body: Buffer | Uint8Array | string): Buffer =>
    typeof body === 'string' ? Buffer.from(body, 'utf8') : Buffer.isBuffer(body) ? body : Buffer.from(body.buffer, body.byteOffset, body.byteLength);

  /**
   * multipart 파트 하나: `--boundary\r\nContent-Type: …\r\nContent-Length: <바이트 수>\r\n[헤더…]\r\n\r\n<body>\r\n`
   * Content-Length 는 문자열도 글자 수가 아니라 UTF-8 바이트 수.
   */
  export const multipartPart = (part: Part, boundary: string, fallbackType?: string): Buffer => {
    const p = isPartObject(part) ? part : { body: part };
    const body = toBuffer(p.body);
    let head = `--${boundary}\r\nContent-Type: ${partType(part, fallbackType)}\r\nContent-Length: ${body.length}\r\n`;
    for (const [k, v] of Object.entries(p.headers ?? {})) head += `${oneLine(k)}: ${oneLine(v)}\r\n`;
    return Buffer.concat([Buffer.from(head + '\r\n', 'latin1'), body, Buffer.from('\r\n')]);
  };

  /** multipart 끝 표시 (multipart/mixed 처럼 끝이 있는 경우) */
  export const multipartEnd = (boundary: string): Buffer => Buffer.from(`--${boundary}--\r\n`);

  /** NDJSON 한 줄: JSON + \n (그냥 객체를 yield 하면 줄바꿈 없이 붙어서 받는 쪽이 못 나눔) */
  export const ndjsonLine = (value: unknown): string => json(value) + '\n';

  /** JSON.stringify(undefined) 는 undefined 라 그대로 붙이면 깨진 JSON — 배열 안처럼 null 로 */
  const json = (value: unknown): string => JSON.stringify(value) ?? 'null';

  /** RFC 7464 application/json-seq 레코드: RS(0x1E) + JSON + \n */
  export const jsonSeqRecord = (value: unknown): string => '\x1e' + json(value) + '\n';

  /** CSV 칸 하나 (RFC 4180): 쉼표·따옴표·줄바꿈·앞뒤 공백이 있으면 "…" 로 감싸고 " 는 "" */
  export const csvCell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const s = typeof value === 'string' ? value : value instanceof Date ? value.toISOString() : typeof value === 'object' ? json(value) : String(value);
    return /[",\r\n]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  /** CSV 한 줄: 칸들 + CRLF */
  export const csvRow = (cells: readonly unknown[]): string => cells.map(csvCell).join(',') + '\r\n';

  /** text/plain 한 줄: 문자열은 그대로, 나머지는 JSON + \n */
  export const textLine = (value: unknown): string => (typeof value === 'string' ? value : json(value)) + '\n';

  /** RFC 2046: 1~70자, 허용 문자만, 공백으로 끝나지 않게 */
  export const boundary = (value?: string): string => {
    const b = value ?? `boundary-${randomBytes(12).toString('hex')}`;
    if (!/^[0-9A-Za-z'()+_,\-./:=? ]{0,69}[0-9A-Za-z'()+_,\-./:=?]$/.test(b)) {
      throw new Error(`invalid multipart boundary: ${JSON.stringify(b)}`);
    }
    return b;
  };

  // ───────────────────────── pull: 원본 generator 감싸기 ─────────────────────────

  const toStream = <T>(gen: AsyncGenerator<T, void, undefined>, contentType: string, compress: boolean): Stream<T> =>
    Object.assign(gen, { contentType, compress });

  async function* encode<In, Out>(src: Source<In>, fn: (v: In) => Out): AsyncGenerator<Out, void, undefined> {
    // 바깥이 return 되면(클라이언트 끊김) for await 가 원본에도 return 을 불러 원본의 finally 가 돈다
    for await (const v of src as AsyncIterable<In>) yield fn(v);
  }

  /** 앞(start)·내용·뒤(end). 중간에 끊기면(return) end 는 안 나감 */
  async function* framed<In, Out>(src: Source<In>, fn: (v: In) => Out, start?: Out, end?: Out): AsyncGenerator<Out, void, undefined> {
    if (start !== undefined) yield start;
    yield* encode(src, fn);
    if (end !== undefined) yield end;
  }

  /** JSON 배열 항목: 첫 항목 말고는 앞에 쉼표 (스트림마다 하나씩 만들어 씀) */
  const jsonArrayItem = () => {
    let n = 0;
    return (v: unknown) => (n++ ? ',' : '') + json(v);
  };

  export type CsvRow = readonly unknown[] | Record<string, unknown>;
  export type CsvOption = {
    /** 헤더 줄 + 객체 행을 이 순서로 칸에 맞춤 (없으면 객체는 Object.values 순서, 헤더 없음) */
    columns?: string[];
    /** UTF-8 BOM — Excel 이 한글 CSV 를 깨지지 않게 열려면 필요 */
    bom?: boolean;
  };
  const csvEncoder = (opt: CsvOption) => (r: CsvRow) =>
    csvRow(Array.isArray(r) ? r : opt.columns ? opt.columns.map(c => (r as Record<string, unknown>)[c]) : Object.values(r));
  const csvStart = (opt: CsvOption): string | undefined =>
    opt.bom || opt.columns ? (opt.bom ? '﻿' : '') + (opt.columns ? csvRow(opt.columns) : '') : undefined;
  const CsvType = `${Mimes.TextCsv}; charset=utf-8`;

  /**
   * text/event-stream. heartbeatMs 를 주면 그동안 이벤트가 없을 때 `: ping` 을 끼워 연결 유지
   * (프록시·브라우저는 오래 조용한 연결을 끊는다).
   */
  export function sse(src: Source<SseEvent>, opt: { heartbeatMs?: number } = {}): Stream<string> {
    const contentType = Mimes.TextEventStream;
    if (!opt.heartbeatMs) return toStream(encode(src, sseChunk), contentType, true);
    const ms = opt.heartbeatMs;
    async function* withPing(): AsyncGenerator<string, void, undefined> {
      const it = (Symbol.asyncIterator in (src as any)
        ? (src as AsyncIterable<SseEvent>)[Symbol.asyncIterator]()
        : (src as Iterable<SseEvent>)[Symbol.iterator]()) as AsyncIterator<SseEvent> | Iterator<SseEvent>;
      let pending: Promise<IteratorResult<SseEvent>> | undefined;
      try {
        while (true) {
          pending ??= Promise.resolve(it.next());
          let timer: ReturnType<typeof setTimeout> | undefined;
          const tick = new Promise<'ping'>(r => (timer = setTimeout(() => r('ping'), ms)));
          const r = await Promise.race([pending, tick]);
          clearTimeout(timer);
          if (r === 'ping') {
            yield ssePing();   // 원본 next 는 그대로 기다림 (pending 유지)
            continue;
          }
          pending = undefined;
          if (r.done) return;
          yield sseChunk(r.value);
        }
      } finally {
        await it.return?.();
      }
    }
    return toStream(withPing(), contentType, true);
  }

  /** multipart/x-mixed-replace (MJPEG 등 — 파트가 올 때마다 앞 것을 갈아끼움). 이미 압축된 내용이라 gzip 안 함 */
  export function multipartReplace(src: Source<Part>, opt: { boundary?: string; type?: string } = {}): Stream<Buffer> {
    const b = boundary(opt.boundary);
    return toStream(encode(src, p => multipartPart(p, b, opt.type)), `multipart/x-mixed-replace; boundary=${b}`, false);
  }

  /** multipart/mixed (끝이 있는 여러 파트). 원본이 끝나면 `--boundary--` */
  export function multipartMixed(src: Source<Part>, opt: { boundary?: string; type?: string } = {}): Stream<Buffer> {
    const b = boundary(opt.boundary);
    return toStream(framed(src, p => multipartPart(p, b, opt.type), undefined, multipartEnd(b)), `multipart/mixed; boundary=${b}`, true);
  }

  /** application/x-ndjson (한 줄에 JSON 하나) */
  export function ndjson(src: Source<unknown>): Stream<string> {
    return toStream(encode(src, ndjsonLine), Mimes.ApplicationXndjson, true);
  }

  /** application/json-seq (RFC 7464, 레코드마다 RS 로 시작) */
  export function jsonSeq(src: Source<unknown>): Stream<string> {
    return toStream(encode(src, jsonSeqRecord), Mimes.ApplicationJsonSeq, true);
  }

  /**
   * application/json 배열을 항목마다 흘려보냄: `[` 항목 `,` 항목 … `]`.
   * 받는 쪽은 다 받은 뒤 평범한 JSON 으로 파싱 (끝까지 받아야 유효한 JSON — 중간에 끊기면 깨진 JSON)
   */
  export function jsonArray(src: Source<unknown>): Stream<string> {
    return toStream(framed(src, jsonArrayItem(), '[', ']'), Mimes.ApplicationJson, true);
  }

  /** text/csv; charset=utf-8 — 행은 배열 또는 객체(columns 순서). 줄바꿈 CRLF */
  export function csv(src: Source<CsvRow>, opt: CsvOption = {}): Stream<string> {
    return toStream(framed(src, csvEncoder(opt), csvStart(opt)), CsvType, true);
  }

  /** text/plain; charset=utf-8 — 한 줄에 하나 (로그 tail 등) */
  export function text(src: Source<unknown>): Stream<string> {
    return toStream(encode(src, textLine), Mimes.TextPlainUtf8, true);
  }

  // ───────────────────────── push: 채널 ─────────────────────────

  /**
   * push 한 값을 큐에 담았다가 yield 하는 스트림.
   * 직접 iterator 를 만드는 이유: 기다리는 중(await)에 클라이언트가 끊겨도 return() 이 바로 끝내고 onClose 를 부르게
   * (async generator 는 await 중의 return 을 다음 yield 까지 미뤄서, 조용한 채널이면 정리가 안 됨).
   */
  export function channel<In, Out>(
    encodeFn: (v: In) => Out,
    contentType: string,
    compress: boolean,
    opt: ChannelOption & { start?: () => Out; end?: () => Out; heartbeat?: { ms: number; chunk: () => Out } } = {}
  ): Channel<In, Out> {
    const keep = opt.keep ?? 'queue';
    const max = Math.max(1, opt.max ?? 1000);
    const queue: In[] = [];
    const closers: (() => void)[] = [];
    let closed = false;     // 더 안 받음 (쌓인 건 보냄)
    let finished = false;   // 완전히 끝남
    let startSent = false;
    let endSent = false;
    let wake: (() => void) | undefined;

    const finish = () => {
      if (finished) return;
      finished = closed = true;
      queue.length = 0;
      opt.signal?.removeEventListener('abort', onAbort);
      wake?.();
      for (const fn of closers.splice(0)) {
        try { fn(); } catch { /* 정리 실패가 응답을 깨지 않게 */ }
      }
    };
    const onAbort = () => finish();
    if (opt.signal?.aborted) closed = finished = true;
    else opt.signal?.addEventListener('abort', onAbort, { once: true });

    const next = async (): Promise<IteratorResult<Out, void>> => {
      while (!finished) {
        // 앞부분(JSON 배열 '[', CSV 헤더 등)은 첫 next 에 바로 — 아무것도 push 안 하고 close 해도 나감
        if (opt.start && !startSent) {
          startSent = true;
          return { value: opt.start(), done: false };
        }
        if (queue.length) return { value: encodeFn(queue.shift() as In), done: false };
        if (closed) {
          if (opt.end && !endSent) {
            endSent = true;
            return { value: opt.end(), done: false };
          }
          finish();
          break;
        }
        let timer: ReturnType<typeof setTimeout> | undefined;
        const ping = await new Promise<boolean>(resolve => {
          wake = () => resolve(false);
          if (opt.heartbeat) timer = setTimeout(() => resolve(true), opt.heartbeat.ms);
        });
        wake = undefined;
        clearTimeout(timer);
        if (ping && !finished && !queue.length && !closed) return { value: opt.heartbeat!.chunk(), done: false };
      }
      return { value: undefined, done: true };
    };

    const iterator: Channel<In, Out> = {
      contentType,
      compress,
      get closed() { return closed; },
      push(value: In) {
        if (closed) return false;
        if (keep === 'latest') queue.length = 0;
        else if (queue.length >= max) queue.shift();
        queue.push(value);
        wake?.();
        return true;
      },
      close() {
        closed = true;
        wake?.();
      },
      onClose(fn: () => void) {
        if (finished) fn();
        else closers.push(fn);
      },
      next,
      async return() {
        finish();
        return { value: undefined, done: true };
      },
      async throw(e?: unknown) {
        finish();
        throw e;
      },
      [Symbol.asyncIterator]() { return this; }
    } as unknown as Channel<In, Out>;
    // `await using` 정리 지원 (Symbol.asyncDispose 가 있는 런타임만 — AsyncGenerator 타입이 요구)
    const dispose = (Symbol as any).asyncDispose as symbol | undefined;
    if (dispose) (iterator as any)[dispose] = async () => finish();
    return iterator;
  }

  export namespace sse {
    /** push 로 SSE: out.push('hello') · out.push({ event: 'tick', data: { n: 1 } }) */
    export const channel = (opt: ChannelOption & { heartbeatMs?: number } = {}): Channel<SseEvent, string> =>
      ContentTypeGenerator.channel(sseChunk, Mimes.TextEventStream, true, {
        ...opt,
        heartbeat: opt.heartbeatMs ? { ms: opt.heartbeatMs, chunk: ssePing } : undefined
      });
  }

  export namespace multipartReplace {
    /** push 로 MJPEG 등: out.push(jpegBuffer) — 프레임은 보통 keep: 'latest' */
    export const channel = (opt: ChannelOption & { boundary?: string; type?: string } = {}): Channel<Part, Buffer> => {
      const b = boundary(opt.boundary);
      return ContentTypeGenerator.channel((p: Part) => multipartPart(p, b, opt.type), `multipart/x-mixed-replace; boundary=${b}`, false, opt);
    };
  }

  export namespace multipartMixed {
    export const channel = (opt: ChannelOption & { boundary?: string; type?: string } = {}): Channel<Part, Buffer> => {
      const b = boundary(opt.boundary);
      return ContentTypeGenerator.channel((p: Part) => multipartPart(p, b, opt.type), `multipart/mixed; boundary=${b}`, true, {
        ...opt,
        end: () => multipartEnd(b)
      });
    };
  }

  export namespace ndjson {
    export const channel = (opt: ChannelOption = {}): Channel<unknown, string> =>
      ContentTypeGenerator.channel(ndjsonLine, Mimes.ApplicationXndjson, true, opt);
  }

  export namespace jsonSeq {
    export const channel = (opt: ChannelOption = {}): Channel<unknown, string> =>
      ContentTypeGenerator.channel(jsonSeqRecord, Mimes.ApplicationJsonSeq, true, opt);
  }

  export namespace jsonArray {
    /** close 해야 `]` 가 나가서 유효한 JSON 이 됨 */
    export const channel = (opt: ChannelOption = {}): Channel<unknown, string> =>
      ContentTypeGenerator.channel(jsonArrayItem(), Mimes.ApplicationJson, true, { ...opt, start: () => '[', end: () => ']' });
  }

  export namespace csv {
    export const channel = (opt: ChannelOption & CsvOption = {}): Channel<CsvRow, string> => {
      const start = csvStart(opt);
      return ContentTypeGenerator.channel(csvEncoder(opt), CsvType, true, { ...opt, start: start === undefined ? undefined : () => start });
    };
  }

  export namespace text {
    export const channel = (opt: ChannelOption = {}): Channel<unknown, string> =>
      ContentTypeGenerator.channel(textLine, Mimes.TextPlainUtf8, true, opt);
  }
}
