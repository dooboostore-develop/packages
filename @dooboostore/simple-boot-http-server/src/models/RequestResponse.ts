import { IncomingMessage, OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from 'http';
import { HttpHeaders, HttpHeadersType } from '../codes/HttpHeaders';
import { Mimes } from '../codes/Mimes';
import { Intent } from '@dooboostore/simple-boot';
import { URL, URLSearchParams } from 'url';
import { Buffer } from 'buffer';
import { MultipartData } from './datas/MultipartData';
import { ReqFormUrlBody } from './datas/body/ReqFormUrlBody';
import { ReqJsonBody } from './datas/body/ReqJsonBody';
import { ReqHeader } from './datas/ReqHeader';
import { ReqMultipartFormBody } from './datas/body/ReqMultipartFormBody';
import { HttpStatus } from '../codes/HttpStatus';
import { gzip } from 'node-gzip';
import { createGzip, constants as zlibConstants } from 'zlib';
import { SessionManager } from '../session/SessionManager';
import { HttpServerOption } from '../option/HttpServerOption';
import { Blob } from 'node:buffer';
import * as fs from 'fs';
import * as os from 'os';
import { RandomUtils } from '@dooboostore/core';
import { FileUtils } from '@dooboostore/core-node';
import { ConvertUtils as CoreConvertUtils } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-node';
import {HttpMethod} from "../codes";

type Config = { sessionManager?: SessionManager; option: HttpServerOption };

export class RequestResponse {
  protected resWriteChunk: string | Buffer | undefined;
  protected reqBodyChunk?: Buffer;
  protected req: IncomingMessage;
  protected res: ServerResponse;
  protected config: Config;

  // [아키텍트님의 정석] RequestResponse 객체 고유의 속성 저장소 (트랜잭션 생명주기)
  protected attributes = new Map<string, any>();

  constructor(req: IncomingMessage | RequestResponse, res: ServerResponse, config: Config) {
    if (req instanceof RequestResponse) {
      this.req = req.req;
      this.res = req.res;
      this.config = config;
      this.attributes = req.attributes;
    } else {
      this.req = req;
      this.res = res!;
      this.config = config;
    }
  }

  // --- RequestResponse Attributes (Transaction Life-cycle) ---

  setAttribute(key: string, value: any): void {
    this.attributes.set(key, value);
  }

  getAttribute<T = any>(key: string): T | undefined {
    return this.attributes.get(key) as T;
  }

  get reqSocket() {
    return this.req.socket;
  }

  get reqCookieMap() {
    let cookies = this.reqHeader(HttpHeaders.Cookie) ?? '';
    if (Array.isArray(cookies)) {
      cookies = cookies.join(';');
    }

    const map = new Map<string, string>();
    cookies
      .split(';')
      .map(it => it.trim().split('='))
      .forEach(it => {
        if (it[0]) map.set(it[0], it[1]);
      });
    return map;
  }

  reqCookieGet(key: string) {
    return this.reqCookieMap.get(key);
  }

  get reqRemoteAddress(): string | undefined {
    const ipHeader = this.req.headers['x-forwarded-for'];
    let ip = this.req.socket.remoteAddress;
    if (Array.isArray(ipHeader)) {
      ip = ipHeader.join(',').split(',').shift();
    } else if (typeof ipHeader === 'string') {
      ip = ipHeader.split(',').shift();
    }
    return ip;
  }

  get reqUrlObject(): URL {
    return new URL(this.reqUrl, `${this.reqSocket ? 'https://' : 'http://'}${this.reqHost ?? 'localhost'}`);
  }

  get reqUrlPathName(): string {
    return this.reqUrlObj().pathname ?? '';
  }

  get reqUrl(): string {
    return this.req.url ?? '';
  }

  reqUrlObj(config?: { scheme?: string; host?: string }): URL {
    return new URL(`${config?.scheme ?? 'http'}://${config?.host ? config?.host : (this.reqHeaderFirst(HttpHeaders.Host) ?? 'localhost')}${this.req.url ?? ''}`);
  }

  get reqUrlSearchParamTuples(): [string, string][] {
    return Array.from(this.reqUrlObj().searchParams as any);
  }

  get reqUrlSearchParams(): URLSearchParams {
    return this.reqUrlObj().searchParams;
  }

  get reqUrlSearchParamsObj(): { [p: string]: string | string[] } {
    const entries = this.reqUrlObj().searchParams;
    return CoreConvertUtils.toObject(entries);
  }

  get reqPathSearchParamUrl(): string {
    const reqUrlObj = this.reqUrlObj();
    return reqUrlObj.pathname + (reqUrlObj.searchParams.toString() ? '?' + reqUrlObj.searchParams.toString() : '');
  }

  get reqReadable() {
    return this.req.readable;
  }

  get reqIntent() {
    return new Intent(this.reqPathSearchParamUrl);
  }

  reqHasContentTypeHeader(mime: Mimes | string): boolean {
    const contentType = this.reqHeader(HttpHeaders.ContentType);
    if (!contentType) return false;
    
    const targetMime = mime.toString().toLowerCase();
    const contentTypes = Array.isArray(contentType) ? contentType : [contentType];
    
    // 모든 Content-Type 헤더를 확인
    return contentTypes.some(ct => {
      // Content-Type은 보통 단일 값이지만, 파라미터가 붙을 수 있음 (charset=utf-8 등)
      // 세미콜론으로 split해서 앞 부분(MIME 타입)만 비교
      const [mimeType] = ct.split(';').map(m => m.trim());
      return mimeType.toLowerCase() === targetMime || mimeType.toLowerCase().includes(targetMime);
    });
  }

  reqHasAcceptHeader(mime: Mimes | string): boolean {
    const accept = this.reqHeader(HttpHeaders.Accept);
    if (!accept) return false;

    const targetMime = mime.toString().toLowerCase();
    const acceptHeaders = Array.isArray(accept) ? accept : [accept];

    return acceptHeaders.some(acceptHeader => {
      const acceptMimes = acceptHeader.split(',').map(m => m.split(';')[0].trim().toLowerCase());
      return acceptMimes.some(acceptMime => acceptMime.includes(targetMime));
    });
  }

  reqBodyData(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (this.reqReadable) {
        const data: Uint8Array[] = [];
        this.req.on('data', chunk => data.push(chunk));
        this.req.on('error', err => reject(err));
        this.req.on('end', () => {
          this.reqBodyChunk = Buffer.concat(data);
          resolve(this.reqBodyChunk);
        });
      } else {
        resolve(this.reqBodyChunk ?? Buffer.alloc(0));
      }
    });
  }

  resBodyData(): string | Buffer | undefined {
    return this.resWriteChunk;
  }

  async reqBodyMultipartFormDataObject<T>(): Promise<T> {
    const m = await this.reqBodyMultipartFormData();
    const formData = {} as any;

    for (const it of m) {
      if (it.isFile) {
        formData[it.name] = await FileUtils.writeFile(it.value, { originalName: it.filename, etcData: it });
      } else {
        const target = formData[it.name];
        if (Array.isArray(target)) {
          target.push(it.value);
        } else if (typeof target === 'string') {
          formData[it.name] = [target, it.value];
        } else {
          formData[it.name] = it.value;
        }
      }
    }
    return formData;
  }

  reqBodyMultipartFormData(): Promise<MultipartData[]> {
    return new Promise((resolve, reject) => {
      const contentTypeHeader = this.req.headers['content-type'];
      if (!contentTypeHeader || !contentTypeHeader.startsWith('multipart/form-data')) {
        return reject(new Error('Invalid Content-Type. Expected multipart/form-data.'));
      }

      const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      if (!boundaryMatch) {
        return reject(new Error('Boundary not found in Content-Type header.'));
      }
      const boundary = boundaryMatch[1] || boundaryMatch[2];
      if (!boundary) {
        return reject(new Error('Failed to extract boundary.'));
      }

      const boundaryBuffer = Buffer.from(`--${boundary}`);
      const crlfBuffer = Buffer.from('\r\n');
      const doubleCrlfBuffer = Buffer.from('\r\n\r\n');

      const chunks: Buffer[] = [];
      let totalLength = 0;

      this.req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        totalLength += chunk.length;
      });

      this.req.on('error', err => {
        reject(err);
      });

      this.req.on('end', () => {
        if (totalLength === 0) {
          return resolve([]);
        }

        const fullBuffer = Buffer.concat(chunks, totalLength);
        const parsedParts: MultipartData[] = [];
        let currentPosition = 0;

        let boundaryStartIndex = fullBuffer.indexOf(boundaryBuffer, currentPosition);
        if (boundaryStartIndex === -1) {
          return reject(new Error('Initial boundary not found.'));
        }
        currentPosition = boundaryStartIndex + boundaryBuffer.length;
        if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
          currentPosition += crlfBuffer.length;
        }

        while (currentPosition < fullBuffer.length) {
          const nextBoundaryIndex = fullBuffer.indexOf(boundaryBuffer, currentPosition);
          if (nextBoundaryIndex === -1) {
            break;
          }

          let partEndIndex = nextBoundaryIndex;
          if (partEndIndex > crlfBuffer.length && fullBuffer.slice(partEndIndex - crlfBuffer.length, partEndIndex).equals(crlfBuffer)) {
            partEndIndex -= crlfBuffer.length;
          }
          const partBuffer = fullBuffer.slice(currentPosition, partEndIndex);

          const headerBodySeparatorIndex = partBuffer.indexOf(doubleCrlfBuffer);
          if (headerBodySeparatorIndex === -1) {
            currentPosition = nextBoundaryIndex + boundaryBuffer.length;
            if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
              currentPosition += crlfBuffer.length;
            }
            if (fullBuffer.slice(currentPosition, currentPosition + 2).toString() === '--') break;
            continue;
          }

          const headerBuffer = partBuffer.slice(0, headerBodySeparatorIndex);
          const bodyBuffer = partBuffer.slice(headerBodySeparatorIndex + doubleCrlfBuffer.length);
          const headersStr = headerBuffer.toString('utf-8');

          const headers: { [key: string]: string } = {};
          headersStr.split('\r\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
              const key = line.substring(0, colonIndex).trim().toLowerCase();
              const value = line.substring(colonIndex + 1).trim();
              headers[key] = value;
            }
          });

          const contentDisposition = headers['content-disposition'];
          if (!contentDisposition) {
            currentPosition = nextBoundaryIndex + boundaryBuffer.length;
            if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
              currentPosition += crlfBuffer.length;
            }
            if (fullBuffer.slice(currentPosition, currentPosition + 2).toString() === '--') break;
            continue;
          }

          const nameMatch = contentDisposition.match(/name="([^"]+)"/i);
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

          const name = nameMatch ? nameMatch[1] : null;
          const filename = filenameMatch ? filenameMatch[1] : null;
          const contentType = headers['content-type'] || null;

          if (name) {
            if (filename) {
              parsedParts.push({
                isFile: true,
                name: name,
                filename: filename,
                contentType: contentType ?? 'application/octet-stream',
                value: bodyBuffer
              });
            } else {
              parsedParts.push({
                isFile: false,
                name: name,
                value: bodyBuffer.toString('utf-8')
              });
            }
          }

          currentPosition = nextBoundaryIndex + boundaryBuffer.length;
          if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
            currentPosition += crlfBuffer.length;
          }

          if (fullBuffer.slice(currentPosition, currentPosition + 2).toString() === '--') {
            break;
          }
        }
        resolve(parsedParts);
      });
    });
  }

  async reqBodyStringData(): Promise<string> {
    const data = (await this.reqBodyData()).toString();
    return data;
  }

  async reqBodyJsonData<T>(): Promise<T> {
    return JSON.parse(await this.reqBodyStringData());
  }

  async reqBodyFormUrlData<T>(): Promise<T> {
    const data = await this.reqBodyStringData();
    const formData = {} as any;
    Array.from(new URLSearchParams(data).entries()).forEach(([k, v]) => {
      const target = formData[k];
      if (Array.isArray(target)) {
        target.push(v);
      } else if (typeof target === 'string') {
        formData[k] = [target, v];
      } else {
        formData[k] = v;
      }
    });
    return formData;
  }

  async reqBodyReqFormUrlBody() {
    const data = await this.reqBodyFormUrlData();
    return Object.assign(new ReqFormUrlBody(), data);
  }

  async reqBodyReqJsonBody(): Promise<ReqJsonBody> {
    const data = await this.reqBodyStringData();
    return Object.assign(new ReqJsonBody(), data ? JSON.parse(data) : {});
  }

  resBodyJsonData<T>(): T | null {
    const data = ConvertUtils.toString(this.resBodyData());
    return data ? JSON.parse(data) : null;
  }

  resBodyStringData() {
    return ConvertUtils.toString(this.resBodyData());
  }

  reqMethod() {
    return this.req.method?.toUpperCase();
  }

  reqIsMethod(method: HttpMethod | string) {
    return this.reqMethod().toUpperCase() === (method as string).toUpperCase();
  }

  reqHeader(key: keyof typeof HttpHeaders | string) {
    return this.req.headers[(key as string).toLowerCase()];
  }

  get reqHost() {
    return this.reqHeaderFirst(HttpHeaders.Host);
  }

  get reqHeaderObj(): ReqHeader {
    const h = new ReqHeader();
    Object.entries(this.req.headers).forEach(([k, v]) => {
      h[k] = v;
    });
    return h;
  }

  reqHeaderFirst(key: HttpHeadersType | string, defaultValue?: string) {
    const header = this.req.headers[(key as string).toLowerCase()];
    if (header && Array.isArray(header)) {
      return header[0] ?? defaultValue;
    } else {
      return (header as string) ?? defaultValue;
    }
  }

  public reqAuthorizationHeader() {
    return this.reqHeaderFirst(HttpHeaders.Authorization);
  }

  reqRefreshTokenHeader() {
    return this.reqHeaderFirst(HttpHeaders.Authorization);
  }

  resStatusCode(code?: undefined): number;
  resStatusCode(code: number | HttpStatus): RequestResponseChain<number>;
  resStatusCode(code: number | undefined | HttpStatus): number | RequestResponseChain<number> {
    if (code) {
      this.res.statusCode = code;
      return new RequestResponseChain<number>(this.req, this.res, this.config, this.res.statusCode);
    } else {
      return this.res.statusCode;
    }
  }

  resHeader(key: HttpHeadersType | string) {
    return this.res.getHeader((key as string).toLowerCase());
  }

  resHeaderFirst(key: HttpHeadersType | string, defaultValue?: string) {
    const header = this.res.getHeader((key as string).toLowerCase());
    if (header && Array.isArray(header)) {
      return header[0] ?? defaultValue;
    } else {
      return (header as string) ?? defaultValue;
    }
  }

  async reqSession(): Promise<{ [key: string]: any }> {
    if (this.config.sessionManager) {
      const session = await this.config.sessionManager.session(this);
      session.dataSet.data ??= {};
      return session.dataSet.data;
    } else {
      return Promise.reject(new Error('Not SessionManager'));
    }
  }

  async reqSessionSet(key: string, value: any): Promise<void> {
    const sessionData = await this.reqSession();
    sessionData[key] = value;
  }

  async reqSessionGet<T = any>(key: string): Promise<T | undefined> {
    const sessionData = await this.reqSession();
    return sessionData[key] as T;
  }

  resSetStatusCode(statusCode: number) {
    this.res.statusCode = statusCode;
    return this.createRequestResponseChain(this.res.statusCode);
  }

  resWrite(chunk: string | Buffer | any, encoding: BufferEncoding = 'utf8') {
    this.resWriteChunk = chunk;
    return this.createRequestResponseChain(this.resWriteChunk);
  }

  resWriteJson(chunk: any, encoding: BufferEncoding = 'utf8') {
    return this.resWrite(JSON.stringify(chunk), encoding);
  }

  resSetHeader(key: HttpHeadersType | string, value: string | string[]) {
    this.res.setHeader((key as string).toLowerCase(), value);
    return this.createRequestResponseChain();
  }

  resAddHeader(key: HttpHeadersType | string, value: string | string[]) {
    const existingValue = this.res.getHeader((key as string).toLowerCase());
    const newValue = Array.isArray(existingValue) ? existingValue.concat(value) : existingValue ? [existingValue.toString(), ...[].concat(value as any)] : value;
    this.res.setHeader((key as string).toLowerCase(), newValue as any);
    return this.createRequestResponseChain();
  }

  resSetHeaders(headers: { [key: string]: string | string[] }) {
    Object.entries(headers).forEach(([key, value]) => this.resSetHeader(key, value));
    return this.createRequestResponseChain();
  }

  resAddHeaders(headers: { [key: string]: string | string[] }) {
    Object.entries(headers).forEach(([key, value]) => this.resAddHeader(key, value));
    return this.createRequestResponseChain();
  }

  private async resEndChunk() {
    const encoding = this.reqHeaderFirst(HttpHeaders.AcceptEncoding);
    let data = this.resWriteChunk;
    if (encoding?.includes('gzip') && data) {
      data = await gzip(data);
      this.resSetHeader(HttpHeaders.ContentEncoding, 'gzip');
    }
    this.res.end(data);
  }

  async resEnd(chunk?: string | Buffer | Blob | ArrayBuffer | Response) {
    if (chunk instanceof Response) {
      chunk.headers.forEach((value, key) => {
        this.res.setHeader(`ORIGIN-${key}`, value);
      });
      if (!this.resHeader(HttpHeaders.ContentType)) {
        const contentType = chunk.headers.get(HttpHeaders.ContentType);
        if (contentType) this.res.setHeader(HttpHeaders.ContentType, contentType);
      }
      this.res.statusCode = chunk.status;
      this.resWriteChunk = Buffer.from(await chunk.arrayBuffer());
    } else if (chunk instanceof Blob) {
      this.resWriteChunk = Buffer.from(await chunk.arrayBuffer());
      if (!this.resHeader(HttpHeaders.ContentType)) {
        this.res.setHeader(HttpHeaders.ContentType, chunk.type);
      }
    } else if (chunk instanceof ArrayBuffer) {
      this.resWriteChunk = Buffer.from(chunk);
    } else {
      this.resWriteChunk = chunk ?? this.resWriteChunk;
    }

    if (this.req.readable) {
      await this.reqBodyData();
      await this.resEndChunk();
    } else {
      await this.resEndChunk();
    }
  }

  resRedirect(statusCode: number, location: string) {
    this.res.statusCode = statusCode;
    this.res.setHeader(HttpHeaders.Location, location);
    this.res.end();
  }
  resWriteHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | { [key: string]: string | string[] }) {
    return this.createRequestResponseChain(this.res.writeHead(statusCode, headers as any));
  }
  resWriteHeadEnd(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | { [key: string]: string | string[] }) {
    this.createRequestResponseChain(this.res.writeHead(statusCode, headers as any));
    this.res.end();
  }

  /**
   * 헤더를 즉시 보내고, source 가 내놓는 값을 하나씩 바로 body 에 쓴 뒤 end.
   * (SSE / 스트리밍 응답용. resWrite 는 버퍼링 후 resEnd 에서 한 번에 보내므로 스트리밍 불가)
   * - 문자열/Buffer 는 그대로, 그 외는 JSON.stringify
   * - Accept-Encoding 에 gzip 이 있으면 gzip 스트림으로 압축하고, 청크마다 Z_SYNC_FLUSH 로 바로 내보낸다
   *   (flush 없이 쓰면 zlib 내부 버퍼에 모였다가 늦게 나가서 SSE 실시간성이 깨짐)
   * - 클라이언트가 끊으면 source.return() 으로 제너레이터를 종료시켜 finally 가 돌게 한다
   */
  async resStream(source: Iterable<any> | AsyncIterable<any>) {
    const res = this.res;
    const gz = this.reqHeaderFirst(HttpHeaders.AcceptEncoding)?.includes('gzip') ? createGzip() : undefined;
    if (gz) {
      res.setHeader(HttpHeaders.ContentEncoding, 'gzip');
      res.removeHeader(HttpHeaders.ContentLength);
      gz.pipe(res);
    }
    const out = gz ?? res;
    res.flushHeaders();
    let closed = false;
    const onClose = () => {
      closed = true;
      (source as any).return?.();
    };
    res.once('close', onClose);
    try {
      for await (const chunk of source) {
        if (closed) break;
        const data = typeof chunk === 'string' || Buffer.isBuffer(chunk) ? chunk : JSON.stringify(chunk);
        const ok = out.write(data);
        gz?.flush(zlibConstants.Z_SYNC_FLUSH);
        // backpressure: 버퍼가 차면 drain(또는 연결 종료)까지 대기
        if (!ok) await new Promise(resolve => { out.once('drain', resolve); res.once('close', resolve); });
      }
    } catch (e) {
      // 클라이언트가 끊긴 뒤의 에러(AbortSignal 로 대기를 푼 AbortError 등)는 받을 상대가 없으니 삼킨다
      if (!closed) throw e;
    } finally {
      res.off('close', onClose);
      if (closed) {
        gz?.destroy();
      } else if (!res.writableEnded) {
        // gzip 이면 gz.end() → pipe 가 res.end() 까지 해준다. 끝까지 흘려보낸 뒤 리턴
        const finished = new Promise(resolve => { res.once('finish', resolve); res.once('close', resolve); });
        out.end();
        await finished;
      }
    }
  }

  resIsDone() {
    return this.res.finished || this.res.writableEnded || this.res.headersSent;
  }

  createRequestResponseChain<T = any>(data?: T) {
    const requestResponseChain = new RequestResponseChain(this.req, this.res, this.config, data);
    requestResponseChain.resWriteChunk = this.resWriteChunk;
    requestResponseChain.reqBodyChunk = this.reqBodyChunk;
    return requestResponseChain;
  }
}

export class RequestResponseChain<T> extends RequestResponse {
  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    config: Config,
    public result?: T
  ) {
    super(req, res, config);
  }
}
