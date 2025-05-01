import { IncomingMessage, OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from 'http';
import { HttpHeaders } from '../codes/HttpHeaders';
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
// https://masteringjs.io/tutorials/node/http-request
// https://nodejs.org/ko/docs/guides/anatomy-of-an-http-transaction/
export class RequestResponse {
    protected resWriteChunk: any;
    protected reqBodyChunk?: Buffer;
    protected req: IncomingMessage;
    protected res: ServerResponse;
    protected sessionManager?: SessionManager;

    // constructor(req: IncomingMessage, res: ServerResponse);
    constructor(req: RequestResponse);
    constructor(req: IncomingMessage, res: ServerResponse, sessionManager?: SessionManager);
    constructor(req: IncomingMessage | RequestResponse, res?: ServerResponse, sessionManager?: SessionManager) {
        // this.req = req;
        // this.res = res;
        if (req instanceof RequestResponse) {
            this.req = req.req;
            this.res = req.res;
            this.sessionManager = req.sessionManager;
        } else {
            this.req = req;
            this.res = res!;
            this.sessionManager = sessionManager;
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
        return this.reqUrlObj.pathname ?? '';
    }
    get reqUrl(): string {
        return this.req.url ?? '';
    }

    get reqUrlObj(): URL {
        return new URL('http://' + (this.reqHeaderFirst(HttpHeaders.Host) ?? 'localhost') + (this.req.url ?? ''));
    }

    get reqUrlSearchParams(): [string, string][] {
        return Array.from(this.reqUrlObj.searchParams as any);
    }

    get reqUrlSearchParamsType(): URLSearchParams {
        return this.reqUrlObj.searchParams;
    }

    get reqUrlSearchParamsObj(): { [p: string]: { [p: string]: any } } {
        const entries = this.reqUrlObj.searchParams;
        return Object.fromEntries(entries as any)
    }

    get reqPathSearchParamUrl(): string {
        const reqUrlObj1 = this.reqUrlObj;
        return reqUrlObj1.pathname + (reqUrlObj1.searchParams.toString() ? '?' + reqUrlObj1.searchParams.toString() : '')
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

    reqBodyMultipartFormData(): Promise<MultipartData<any>[]> {
        return new Promise<MultipartData<any>[]>((resolve, reject) => {
            let data = '';
            this.req.on('data', (chunk) => { data += chunk; });
            this.req.on('error', err => reject(err));
            this.req.on('end', () => {
                if (this.reqHasContentTypeHeader(Mimes.MultipartFormData)) {
                    const contentType = this.reqHeaderFirst(HttpHeaders.ContentType)?.toString();
                    const boundary = contentType?.split(';')[1]?.split('=')[1];
                    if (boundary) {
                        const datas = data.split('--' + boundary.trim() + '--\r\n')[0].split('--' + boundary.trim() + '\r\n').slice(1);
                        const mDatas = datas.map(it => {
                            const header = {} as any
                            const [headerRaw, body] = it.split('\r\n\r\n');
                            headerRaw.split('\r\n').filter(sit => sit).forEach(sit => {
                                const [k, v] = sit.split(':');
                                if (k && v) {
                                    header[k.trim()] = header[k.trim()] ? header[k.trim()] : [];
                                    header[k.trim()].push(v.trim());
                                }
                            })
                            return new MultipartData(boundary, header, body);
                        });
                        resolve(mDatas);
                    } else {
                        reject(new Error('Not MultipartFormData boundary'));
                    }
                } else {
                    reject(new Error('Not MultipartFormData'));
                }
            });
        });
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

    reqBodyReqMultipartFormBody(): Promise<ReqMultipartFormBody> {
        return this.reqBodyMultipartFormData().then(it => new ReqMultipartFormBody(it))
    }

    async resBodyJsonData<T>(): Promise<T | null> {
        const data = (await this.reqBodyData()).toString();
        return data ? JSON.parse(data) : null;
    }

    async resBodyStringData() {
        return (await this.reqBodyData()).toString();
    }

    reqMethod() {
        return this.req.method?.toUpperCase();
    }

    reqHeader(key: HttpHeaders | string) {
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

    reqHeaderFirst(key: HttpHeaders | string, defaultValue?: string) {
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
            return new RequestResponseChain<number>(this.req, this.res, this.sessionManager, this.res.statusCode);
        } else {
            return this.res.statusCode;
        }
    }

    resHeaderFirst(key: HttpHeaders | string, defaultValue?: string) {
        const header = this.res.getHeader(key.toLowerCase());
        if (header && Array.isArray(header)) {
            return header[0] ?? defaultValue;
        } else {
            return header ?? defaultValue;
        }
    }

    async reqSession(): Promise<{ [key: string]: any }> {
        if (this.sessionManager) {
        return (await this.sessionManager.session(this)).dataSet.data;
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

    resSetHeader(key: HttpHeaders | string, value: string | string[]) {
        return this.createRequestResponseChain(this.res.setHeader(key.toLowerCase(), value));
    }

    resSetHeaders(headers: { [key: string]: string | string[] }) {
        Object.entries(headers).forEach(([key, value]) => this.resSetHeader(key, value));
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

    async resEnd(chunk?: any) {
        this.resWriteChunk = chunk ?? this.resWriteChunk;
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

    resIsDone() {
        return this.res.finished || this.res.writableEnded || this.res.headersSent;
        // return new RequestResponseChain(this.req, this.res, this.res.finished || this.res.writableEnded);
    }

    createRequestResponseChain<T = any>(data?: T) {
        const requestResponseChain = new RequestResponseChain(this.req, this.res, this.sessionManager, data);
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
    constructor(req: IncomingMessage, res: ServerResponse, sessionManager?: SessionManager, public result?: T) {
        super(req, res, sessionManager);
    }
}