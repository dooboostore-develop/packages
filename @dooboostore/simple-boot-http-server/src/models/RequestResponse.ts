import { IncomingMessage, OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from 'http';
import { HttpHeaders, HttpHeadersType } from '../codes/HttpHeaders';
import { Mimes } from '../codes/Mimes';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { URL, URLSearchParams } from 'url';
import { Buffer } from 'buffer';
import { MultipartData } from './datas/MultipartData';
import { ReqFormUrlBody } from './datas/body/ReqFormUrlBody';
import { ReqJsonBody } from './datas/body/ReqJsonBody';
import { ReqHeader } from './datas/ReqHeader';
import { ReqMultipartFormBody } from './datas/body/ReqMultipartFormBody';
import { HttpStatus } from '../codes/HttpStatus';
import { gzip } from 'node-gzip';
import { SessionManager } from '../session/SessionManager';
import { HttpServerOption } from '../option/HttpServerOption';
import { Blob } from 'node:buffer';
import * as fs from 'fs';
import * as os from 'os';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { FileUtils } from '@dooboostore/core-node/file/FileUtils';
import { ConvertUtils as CoreConvertUtils} from '@dooboostore/core/convert/ConvertUtils';
import { ConvertUtils } from '@dooboostore/core-node/convert/ConvertUtils';
// https://masteringjs.io/tutorials/node/http-request
type Config = { sessionManager?: SessionManager, option: HttpServerOption };

// https://nodejs.org/ko/docs/guides/anatomy-of-an-http-transaction/
export class RequestResponse {
  protected resWriteChunk: string | Buffer | undefined;
  protected reqBodyChunk?: Buffer;
  protected req: IncomingMessage;
  protected res: ServerResponse;
  protected config: Config;
  // protected sessionManager?: SessionManager;

  // constructor(req: IncomingMessage, res: ServerResponse);
  // constructor(req: RequestResponse);
  // constructor(req: IncomingMessage, res: ServerResponse, sessionManager?: SessionManager);
  // constructor(req: IncomingMessage | RequestResponse, res?: ServerResponse, sessionManager?: SessionManager) {
  //   // this.req = req;
  //   // this.res = res;
  //   if (req instanceof RequestResponse) {
  //     this.req = req.req;
  //     this.res = req.res;
  //     this.sessionManager = req.sessionManager;
  //   } else {
  //     this.req = req;
  //     this.res = res!;
  //     this.sessionManager = sessionManager;
  //   }
  // }
  constructor(req: IncomingMessage | RequestResponse, res: ServerResponse, config: Config) {
    // this.req = req;
    // this.res = res;
    if (req instanceof RequestResponse) {
      this.req = req.req;
      this.res = req.res;
      this.config = config;
    } else {
      this.req = req;
      this.res = res!;
      this.config = config;
    }
  }

  get reqSocket() {
    return this.req.socket;
  }

  get reqCookieMap() {
    let cookies = this.reqHeader(HttpHeaders.Cookie) ?? '';
    if (Array.isArray(cookies)) {
      cookies = cookies.join(';')
    }

    const map = new Map<string, string>();
    cookies.split(';').map(it => it.trim().split('=')).forEach(it => {
      map.set(it[0], it[1]);
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
    return new URL(this.reqUrl, `${this.reqSocket ? 'https://' : 'http'}${this.reqHost ?? 'localhost'}`);
  }

  get reqUrlPathName(): string {
    // parse(rr.reqUrl ?? '', true)
    return this.reqUrlObj().pathname ?? '';
  }

  get reqUrl(): string {
    return this.req.url ?? '';
  }

  reqUrlObj(config?:{scheme?: string, host?: string}): URL {
    return new URL(`${config?.scheme??'http' }://${config?.host ? config?.host : (this.reqHeaderFirst(HttpHeaders.Host) ?? 'localhost')}${this.req.url ?? ''}`);
  }

  get reqUrlSearchParamTuples(): [string, string][] {
    return Array.from(this.reqUrlObj().searchParams as any);
  }

  get reqUrlSearchParams(): URLSearchParams {
    return this.reqUrlObj().searchParams;
  }

  get reqUrlSearchParamsObj(): {[p: string]: string | string[]} {
    const entries = this.reqUrlObj().searchParams;
    return CoreConvertUtils.toObject(entries);
    // return obj;
    // return Object.fromEntries(entries as any)
  }

  get reqPathSearchParamUrl(): string {
    const reqUrlObj = this.reqUrlObj();
    return reqUrlObj.pathname + (reqUrlObj.searchParams.toString() ? '?' + reqUrlObj.searchParams.toString() : '')
  }

  get reqReadable() {
    return this.req.readable;
  }

  get reqIntent() {
    return new Intent(this.reqPathSearchParamUrl);
  }

  reqHasContentTypeHeader(mime: Mimes | string): boolean {
    return (this.reqHeaderFirst(HttpHeaders.ContentType) ?? '').toLowerCase().indexOf(mime.toLocaleLowerCase()) > -1;
  }

  reqHasAcceptHeader(mime: Mimes | string): boolean {
    return (this.reqHeaderFirst(HttpHeaders.Accept) ?? '').toLowerCase().indexOf(mime.toLocaleLowerCase()) > -1;
  }

  reqBodyData(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (this.reqReadable) {
        const data: Uint8Array[] = [];
        this.req.on('data', (chunk) => data.push(chunk));
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
  
  resBodyData(): string | Buffer | undefined{
    return this.resWriteChunk;
  }



  async reqBodyMultipartFormDataObject<T>(): Promise<T> {
    const m = await this.reqBodyMultipartFormData();
    const formData = {} as any;

    for (const it of m) {
      if (it.isFile) {
        formData[it.name] = await FileUtils.writeFile(it.value, {originalName: it.filename });
      } else {
        const target = formData[it.name];
        if (Array.isArray(target)) {
          target.push(it.value);
        } else if (typeof target === 'string') {
          formData[it.name] = [target, it.value]
        } else {
          formData[it.name] = it.value;
        }
      }
    };
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
      const boundary = boundaryMatch[1] || boundaryMatch[2]; // 따옴표 유무 처리
      if (!boundary) {
        return reject(new Error('Failed to extract boundary.'));
      }

      const boundaryBuffer = Buffer.from(`--${boundary}`);
      const crlfBuffer = Buffer.from('\r\n');
      const doubleCrlfBuffer = Buffer.from('\r\n\r\n'); // 헤더와 바디 구분자

      const chunks: Buffer[] = [];
      let totalLength = 0;

      this.req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        totalLength += chunk.length;
      });

      this.req.on('error', (err) => {
        reject(err);
      });

      this.req.on('end', () => {
        if (totalLength === 0) {
          return resolve([]); // 빈 요청 처리
        }

        const fullBuffer = Buffer.concat(chunks, totalLength);
        const parsedParts: MultipartData[] = [];
        let currentPosition = 0;

        // 첫 번째 boundary 찾기 (보통 시작 부분에 있음)
        let boundaryStartIndex = fullBuffer.indexOf(boundaryBuffer, currentPosition);
        if (boundaryStartIndex === -1) {
          return reject(new Error('Initial boundary not found.'));
        }
        // boundary 바로 다음 \r\n 건너뛰기
        currentPosition = boundaryStartIndex + boundaryBuffer.length;
        if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
          currentPosition += crlfBuffer.length;
        }


        while (currentPosition < fullBuffer.length) {
          // 다음 boundary 찾기 (파트의 끝)
          const nextBoundaryIndex = fullBuffer.indexOf(boundaryBuffer, currentPosition);
          if (nextBoundaryIndex === -1) {
            // 마지막 boundary (--)인지 확인 필요하나, 여기서는 단순하게 처리
            // console.warn('Next boundary not found, assuming end of data or malformed.');
            break;
          }

          // 현재 파트 데이터 추출 (boundary 이전까지)
          // 실제 파트 데이터는 다음 boundary 바로 앞의 \r\n을 제외해야 함
          let partEndIndex = nextBoundaryIndex;
          if (partEndIndex > crlfBuffer.length && fullBuffer.slice(partEndIndex - crlfBuffer.length, partEndIndex).equals(crlfBuffer)) {
            partEndIndex -= crlfBuffer.length;
          }
          const partBuffer = fullBuffer.slice(currentPosition, partEndIndex);

          // 헤더와 바디 분리
          const headerBodySeparatorIndex = partBuffer.indexOf(doubleCrlfBuffer);
          if (headerBodySeparatorIndex === -1) {
            console.warn('Skipping malformed part: no header/body separator found.');
            currentPosition = nextBoundaryIndex + boundaryBuffer.length;
            if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
              currentPosition += crlfBuffer.length;
            }
            if (fullBuffer.slice(currentPosition, currentPosition + 2).toString() === '--') break; // 마지막 boundary
            continue;
          }

          const headerBuffer = partBuffer.slice(0, headerBodySeparatorIndex);
          const bodyBuffer = partBuffer.slice(headerBodySeparatorIndex + doubleCrlfBuffer.length);
          const headersStr = headerBuffer.toString('utf-8'); // 헤더는 보통 ASCII/UTF-8

          // 헤더 파싱
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
            console.warn('Skipping part: no Content-Disposition header.');
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

            const isFile = !!filename;
            // @ts-ignore
            const multipartData:MultipartData = {
              name:name,
              isFile: isFile, // filename이 있으면 파일로 간주
              filename: filename,
              contentType: contentType,
              value: isFile ? bodyBuffer: bodyBuffer.toString('utf-8'),
            }
            parsedParts.push(multipartData);
          } else {
            console.warn("Skipping part: 'name' not found in Content-Disposition.");
          }

          // 다음 파트 시작 위치로 이동
          currentPosition = nextBoundaryIndex + boundaryBuffer.length;
          // boundary 바로 다음 \r\n 건너뛰기
          if (fullBuffer.slice(currentPosition, currentPosition + crlfBuffer.length).equals(crlfBuffer)) {
            currentPosition += crlfBuffer.length;
          }

          // 마지막 boundary (--)인지 확인하고 루프 종료
          if (fullBuffer.slice(currentPosition, currentPosition + 2).toString() === '--') {
            break;
          }
        }
        resolve(parsedParts);
      });
    })
    // const form = formidable({});
    // return  new Promise((resolve, reject) => {
    //   form.parse(this.req, (err, fields, files) => {
    //     if (err) {
    //       reject(err);
    //       return;
    //     }
    //
    //     console.log('----', files)
    //     // this.res.set('Content-Type', 'application/json');
    //     // ctx.status = 200;
    //     // ctx.state = { fields, files };
    //     // ctx.body = JSON.stringify(ctx.state, null, 2);
    //     resolve(' ' as any);
    //   });
    // });

    // return new Promise<MultipartData<any>[]>((resolve, reject) => {
    //
    //
    //   const contentType = this.req.headers['content-type'];
    //   const boundary = contentType.split('boundary=')[1];
    //
    //   let body: Uint8Array[] = [];
    //   this.req.on('data', chunk => body.push(chunk));
    //   this.req.on('end', async () => {
    //     const buffer = Buffer.concat(body);
    //     // Boundary로 파트 분리
    //     const parts = buffer.toString().split(`--${boundary}`).slice(1, -1);
    //     let jsonData = {};
    //     let fileData = null;
    //
    //     for (let part of parts) {
    //       const [headerPart, ...bodyParts] = part.split('\r\n\r\n');
    //       const headers = headerPart.split('\r\n').reduce((acc, line) => {
    //         const [key, value] = line.split(': ').map(s => s.trim().toLowerCase());
    //         if (key) acc[key] = value;
    //         return acc;
    //       }, {});
    //
    //       const content = bodyParts.join('\r\n\r\n').trim();
    //       const disposition = headers['content-disposition'];
    //       const name = disposition?.match(/name="([^"]+)"/)?.[1];
    //       const filename = disposition?.match(/filename="([^"]+)"/)?.[1];
    //
    //       if (filename) {
    //         // 파일 데이터 (Blob)
    //         fileData = { filename, contentType: headers['content-type'], data: Buffer.from(content, 'binary') };
    //       } else if (name) {
    //         // 텍스트 데이터
    //         if (name === 'metadata') jsonData = JSON.parse(content);
    //       }
    //     }
    //
    //     // 파일 저장
    //     if (fileData) {
    //
    //
    //
    //
    //       const uploadPath = this.config.option.fileUploadTempPath || os.tmpdir();
    //       fs.mkdirSync(uploadPath, { recursive: true }); // 폴더가 없으면 생성
    //       const saveTempPath = `${uploadPath}/${RandomUtils.uuid4()}${fileData.filename}`;
    //       console.log('saveTempPathsaveTempPath', saveTempPath)
    //       await fs.promises.writeFile(saveTempPath, fileData.data);
    //       this.res.writeHead(200, { 'Content-Type': 'application/json' });
    //       this.res.end(JSON.stringify({ message: '업로드 성공', jsonData, filename: fileData?.filename }));
    //       // const uploadPath = this.config.option.fileUploadTempPath ;
    //       // fs.mkdirSync(uploadPath, { recursive: true }); // 폴더가 없으면 생성
    //       // await fs.writeFile(`${uploadPath}/${fileData.filename}`, fileData.data);
    //     }
    //   });
    // });
  }

  async reqBodyStringData(): Promise<string> {
    const data = (await this.reqBodyData()).toString()
    return data;
  }

  async reqBodyJsonData<T>(): Promise<T> {
    return JSON.parse(await this.reqBodyStringData());
  }

  async reqBodyFormUrlData<T>(): Promise<T> {
    const data = (await this.reqBodyStringData())
    const formData = {} as any;
    Array.from(new URLSearchParams(data).entries()).forEach(([k, v]) => {
      const target = formData[k];
      if (Array.isArray(target)) {
        target.push(v);
      } else if (typeof target === 'string') {
        formData[k] = [target, v]
      } else {
        formData[k] = v;
      }
    });
    return formData;
  }

  async reqBodyReqFormUrlBody() {
    const data = await this.reqBodyFormUrlData()
    return Object.assign(new ReqFormUrlBody(), data);
  }

  async reqBodyReqJsonBody(): Promise<ReqJsonBody> {
    const data = (await this.reqBodyStringData());
    return Object.assign(new ReqJsonBody(), data ? JSON.parse(data) : {})
  }

  // reqBodyReqMultipartFormBody(): Promise<ReqMultipartFormBody> {
  //   return this.reqBodyMultipartFormData().then(it => new ReqMultipartFormBody(it))
  // }

  resBodyJsonData<T>(): (T | null) {
    const data = ConvertUtils.toString(this.resBodyData());
    return data ? JSON.parse(data) : null;
  }

  resBodyStringData() {
    return ConvertUtils.toString(this.resBodyData());
  }

  reqMethod() {
    return this.req.method?.toUpperCase();
  }

  reqHeader(key: keyof typeof HttpHeaders | string) {
    return this.req.headers[key.toLowerCase()];
  }

  get reqHost() {
    return this.reqHeaderFirst(HttpHeaders.Host)
  }

  get reqHeaderObj(): ReqHeader {
    const h = new ReqHeader();
    Object.entries(this.req.headers).forEach(([k, v]) => {
      h[k] = v;
    });
    return h;
  }

  reqHeaderFirst(key: HttpHeadersType | string, defaultValue?: string) {
    const header = this.req.headers[key.toLowerCase()];
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
  // eslint-disable-next-line no-dupe-class-members
  resStatusCode(code: number | HttpStatus): RequestResponseChain<number>;
  // eslint-disable-next-line no-dupe-class-members
  resStatusCode(code: number | undefined | HttpStatus): number | RequestResponseChain<number> {
    if (code) {
      this.res.statusCode = code;
      return new RequestResponseChain<number>(this.req, this.res, this.config, this.res.statusCode);
    } else {
      return this.res.statusCode;
    }
  }

  resHeader(key: HttpHeadersType | string) {
    return this.res.getHeader(key.toLowerCase());
  }

  resHeaderFirst(key: HttpHeadersType | string, defaultValue?: string) {
    const header = this.res.getHeader(key.toLowerCase());
    if (header && Array.isArray(header)) {
      return header[0] ?? defaultValue;
    } else {
      return (header as string) ?? defaultValue;
    }
  }

  async reqSession(): Promise<{ [key: string]: any }> {
    if (this.config.sessionManager) {
      return (await this.config.sessionManager.session(this)).dataSet.data;
    } else {
      return Promise.reject(new Error('Not SessionManager'));
    }
  }

  reqSessionSet(key: string, value: any): void {
    (this.reqSession as any)[key] = value;
  }

  reqSessionGet<T = any>(key: string): T | undefined {
    const session = this.reqSession as any;
    if (session) {
      return session[key] as T;
    }
  }

  resSetStatusCode(statusCode: number) {
    this.res.statusCode = statusCode;
    return this.createRequestResponseChain(this.res.statusCode);
  }

  // resEnd() {
  //     this.res.end();
  // }

  // eslint-disable-next-line no-undef
  resWrite(chunk: string | Buffer | any, encoding: BufferEncoding = 'utf8') {
    this.resWriteChunk = chunk;
    return this.createRequestResponseChain(this.resWriteChunk);
  }

  // eslint-disable-next-line no-undef
  resWriteJson(chunk: any, encoding: BufferEncoding = 'utf8') {
    return this.resWrite(JSON.stringify(chunk), encoding);
  }

  resSetHeader(key: HttpHeadersType | string, value: string | string[]) {
    return this.createRequestResponseChain(this.res.setHeader(key.toLowerCase(), value));
  }

  resAddHeader(key: HttpHeadersType | string, value: string | string[]) {
    const existingValue = this.res.getHeader(key.toLowerCase());
    const newValue = Array.isArray(existingValue)
      ? existingValue.concat(value)
      : existingValue
        ? [existingValue.toString(), ...[].concat(value)]
        : value;
    return this.createRequestResponseChain(this.res.setHeader(key.toLowerCase(), newValue));
  }

  resSetHeaders(headers: { [key: string]: string | string[] }) {
    Object.entries(headers).forEach(([key, value]) => this.resSetHeader(key, value));
    return this.createRequestResponseChain();
  }

  resAddHeaders(headers: { [key: string]: string | string[] }) {
      Object.entries(headers).forEach(([key, value]) => this.resAddHeader(key, value));
      return this.createRequestResponseChain();
  }

  // 마지막 종료될때 타는거.
  private async resEndChunk() {
    const encoding = this.reqHeaderFirst(HttpHeaders.AcceptEncoding);
    let data = this.resWriteChunk;
    if (encoding?.includes('gzip')) {
      data = await gzip(data);
      this.resSetHeader(HttpHeaders.ContentEncoding, 'gzip');
    }
    this.res.end(data);
  }

  async resEnd(chunk?: string | Buffer | Blob | ArrayBuffer | Response) {
    if (chunk instanceof Response) {
      // 헤더를 직접 설정하여 체이닝 오버헤드 제거
      chunk.headers.forEach((value, key) => {
        this.res.setHeader(`ORIGIN-${key}`, value);
      });
      if (!this.resHeader(HttpHeaders.ContentType)) {
        const contentType = chunk.headers.get(HttpHeaders.ContentType);
        if (contentType) {
          this.res.setHeader(HttpHeaders.ContentType, contentType);
        }
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

  // writeContinue(callback?: () => void) {
  //     this.res.writeContinue(callback);
  //     return new RequestResponseChain(this.req, this.res);
  // }

  // reqWrite(chunk?: any) {
  //     this.resWriteChunk = chunk;
  //     // this.res.write(chunk);
  //     return this.createRequestResponseChain();
  // }

  resWriteHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | { [key: string]: string | string[] }) {
    return this.createRequestResponseChain(this.res.writeHead(statusCode, headers));
  }
  resWriteHeadEnd(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | { [key: string]: string | string[] }) {
    this.createRequestResponseChain(this.res.writeHead(statusCode, headers));
    this.res.end();
  }

  resIsDone() {
    return this.res.finished || this.res.writableEnded || this.res.headersSent;
    // return new RequestResponseChain(this.req, this.res, this.res.finished || this.res.writableEnded);
  }

  createRequestResponseChain<T = any>(data?: T) {
    const requestResponseChain = new RequestResponseChain(this.req, this.res, this.config, data);
    requestResponseChain.resWriteChunk = this.resWriteChunk;
    requestResponseChain.reqBodyChunk = this.reqBodyChunk;
    return requestResponseChain;
  }

  // res.on("readable", () => {
  //     console.log('readable???')
  // });
  // res.on('complete', function (details) {
  //     var size = details.req.bytes;
  //     console.log('complete-->', size)
  // });
  // res.on('finish', function() {
  //     console.log('finish??');
  // });
  // res.on('end', () => {
  //     console.log('end--?')
  // });
}

export class RequestResponseChain<T> extends RequestResponse {
  constructor(req: IncomingMessage, res: ServerResponse, config: Config, public result?: T) {
    super(req, res, config);
  }
}