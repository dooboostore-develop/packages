import { Filter } from './Filter';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { RequestResponse } from '../models/RequestResponse';
import { SimpleBootHttpServer } from '../SimpleBootHttpServer';
import { HttpHeaders } from '../codes/HttpHeaders';
import { Mimes } from '../codes/Mimes';
import { HttpStatus } from '../codes/HttpStatus';
import { Intent, PublishType } from '@dooboostore/simple-boot/intent/Intent';
import { IntentManager } from '@dooboostore/simple-boot/intent/IntentManager';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { FileUtils } from '@dooboostore/core-node/file/FileUtils';
import { MultipartData } from '../models/datas/MultipartData';
import * as fs from 'node:fs';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

type HttpTopicType = 'intent' | 'router';

type HttpTopicRequest<TBody = unknown> = {
  type?: HttpTopicType;
  target?: string;
  requestUUID?: string;
  body?: TBody;
  files?: Array<{ id: string }>;
};

type HttpTopicResponse<TBody = unknown> = {
  state: 'success' | 'error';
  target: string;
  requestUUID?: string;
  body: TBody;
};

type MultipartFormValue = string | FileUtils.File<MultipartData>;
type MultipartFormDataObject = Record<string, MultipartFormValue>;
type FileEntry = { id: string; name: string; mime: string; buffer: Buffer };
type BinaryLike = Buffer | Uint8Array | ArrayBuffer;
type BinaryPayload = { buffer: BinaryLike; name?: string; mime?: string };
type FilePayload = FileUtils.File<MultipartData> | BinaryLike | BinaryPayload;

@Sim
export class TopicProtocolFilter implements Filter {
  constructor(
    private intentManager: IntentManager,
    private routerManager: RouterManager
  ) {}

  async onInit(app: SimpleBootHttpServer) {}

  private isProtocolRequest(rr: RequestResponse) {
    const header = rr.reqHeaderFirst(HttpHeaders.XSimpleBootHttpTopicProtocol);
    const contentType = rr.reqHeaderFirst(HttpHeaders.ContentType);
    return header?.toLowerCase() === 'topic' && !!contentType && contentType.includes(Mimes.MultipartFormData);
  }

  private buildResponse(target: string, body: unknown, requestUUID?: string): HttpTopicResponse {
    return {
      state: 'success',
      target,
      requestUUID,
      body
    };
  }

  private buildErrorResponse(target: string, body: unknown, requestUUID?: string): HttpTopicResponse {
    return {
      state: 'error',
      target,
      requestUUID,
      body
    };
  }

  private isFileRef(value: unknown): value is { $file: string } {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const fileKey = (value as { $file?: unknown }).$file;
    return typeof fileKey === 'string';
  }

  private replaceFileRefs(value: unknown, fileMap: Map<string, FileUtils.File<MultipartData>>): unknown {
    if (this.isFileRef(value)) {
      const file = fileMap.get(value.$file);
      if (file) {
        return file;
      }
    }
    if (Array.isArray(value)) {
      return value.map(item => this.replaceFileRefs(item, fileMap));
    }
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      Object.keys(value).forEach(key => {
        result[key] = this.replaceFileRefs((value as Record<string, unknown>)[key], fileMap);
      });
      return result;
    }
    return value;
  }

  private isFileValue(value: unknown): value is FilePayload {
    if (value instanceof FileUtils.File) {
      return true;
    }
    if (Buffer.isBuffer(value)) {
      return true;
    }
    if (value instanceof Uint8Array) {
      return true;
    }
    if (value instanceof ArrayBuffer) {
      return true;
    }
    if (value && typeof value === 'object' && 'buffer' in value) {
      const bufferValue = (value as { buffer?: unknown }).buffer;
      return Buffer.isBuffer(bufferValue) || bufferValue instanceof Uint8Array || bufferValue instanceof ArrayBuffer;
    }
    return false;
  }

  private toBuffer(value: BinaryLike): Buffer {
    if (Buffer.isBuffer(value)) {
      return value;
    }
    if (value instanceof Uint8Array) {
      return Buffer.from(value);
    }
    return Buffer.from(value);
  }

  private async toFileEntry(value: FilePayload, id: string): Promise<FileEntry> {
    if (value instanceof FileUtils.File) {
      const meta = value.etcData as { contentType?: string } | undefined;
      const mime = meta?.contentType ?? 'application/octet-stream';
      const name = value.originalName ?? value.fileName ?? 'file';
      const buffer = await fs.promises.readFile(value.path);
      return { id, name, mime, buffer };
    }

    if (value && typeof value === 'object' && 'buffer' in value) {
      const payload = value as BinaryPayload;
      const buffer = this.toBuffer(payload.buffer);
      return {
        id,
        name: payload.name ?? 'file',
        mime: payload.mime ?? 'application/octet-stream',
        buffer
      };
    }

    const buffer = this.toBuffer(value as BinaryLike);
    return { id, name: 'file', mime: 'application/octet-stream', buffer };
  }

  private async buildMultipartResponse(body: unknown) {
    const fileEntries: FileEntry[] = [];
    let fileIndex = 0;

    const registerFile = async (value: FilePayload) => {
      const id = `f${++fileIndex}`;
      const entry = await this.toFileEntry(value, id);
      fileEntries.push(entry);
      return id;
    };

    const replaceFiles = async (value: unknown): Promise<unknown> => {
      if (this.isFileValue(value)) {
        return { $file: await registerFile(value) };
      }
      if (Array.isArray(value)) {
        const replaced = [];
        for (const item of value) {
          replaced.push(await replaceFiles(item));
        }
        return replaced;
      }
      if (value && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
          result[key] = await replaceFiles((value as Record<string, unknown>)[key]);
        }
        return result;
      }
      return value;
    };

    const payload = await replaceFiles(body);
    const boundary = `----simple-boot-topic-${RandomUtils.uuid4()}`;
    const parts: Buffer[] = [];

    const writePart = (headers: string[], content: Buffer) => {
      parts.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
      parts.push(Buffer.from(headers.join('\r\n') + '\r\n\r\n', 'utf8'));
      parts.push(content);
      parts.push(Buffer.from('\r\n', 'utf8'));
    };

    writePart(['Content-Type: application/json', 'Content-Disposition: form-data; name=\"body\"'], Buffer.from(JSON.stringify(payload), 'utf8'));

    for (const entry of fileEntries) {
      writePart([`Content-Type: ${entry.mime}`, `Content-Disposition: form-data; name=\"${entry.id}\"; filename=\"${entry.name}\"`], entry.buffer);
    }

    parts.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
    return { boundary, buffer: Buffer.concat(parts), hasFiles: fileEntries.length > 0 };
  }

  private parseRequest(meta: unknown): HttpTopicRequest | null {
    if (!meta || typeof meta !== 'object') {
      return null;
    }
    const typed = meta as Partial<HttpTopicRequest>;
    if (typed.type !== undefined && typed.type !== 'intent' && typed.type !== 'router') {
      return null;
    }
    if (typed.target !== undefined && typeof typed.target !== 'string') {
      return null;
    }
    if (typed.requestUUID !== undefined && typeof typed.requestUUID !== 'string') {
      return null;
    }
    if (typed.files !== undefined) {
      if (!Array.isArray(typed.files)) {
        return null;
      }
      for (const fileMeta of typed.files) {
        if (!fileMeta || typeof fileMeta !== 'object' || typeof (fileMeta as { id?: unknown }).id !== 'string') {
          return null;
        }
      }
    }
    return typed as HttpTopicRequest;
  }

  private getBodyString(formData: MultipartFormDataObject): string | undefined {
    const bodyValue = formData.body;
    return typeof bodyValue === 'string' ? bodyValue : undefined;
  }

  private getFileMap(request: HttpTopicRequest, formData: MultipartFormDataObject) {
    const fileMap = new Map<string, FileUtils.File<MultipartData>>();
    const fileEntries = Object.entries(formData).filter(([, value]) => value instanceof FileUtils.File);
    if (request.files && request.files.length > 0) {
      request.files.forEach(fileMeta => {
        const value = formData[fileMeta.id];
        if (value instanceof FileUtils.File) {
          fileMap.set(fileMeta.id, value);
        }
      });
      return fileMap;
    }
    fileEntries.forEach(([key, value]) => {
      fileMap.set(key, value as FileUtils.File<MultipartData>);
    });
    return fileMap;
  }

  async proceedBefore({ rr }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, unknown> }) {
    if (!this.isProtocolRequest(rr)) {
      return true;
    }

    try {
      const formData = await rr.reqBodyMultipartFormDataObject<MultipartFormDataObject>();
      const bodyString = this.getBodyString(formData);
      if (!bodyString) {
        rr.resStatusCode(HttpStatus.BadRequest);
        rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
        await rr.resEnd(JSON.stringify(this.buildErrorResponse('', { message: 'body not found' })));
        return false;
      }

      const meta = JSON.parse(bodyString) as unknown;
      const request = this.parseRequest(meta);
      if (!request) {
        rr.resStatusCode(HttpStatus.BadRequest);
        rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
        await rr.resEnd(JSON.stringify(this.buildErrorResponse('', { message: 'invalid body' })));
        return false;
      }
      if (!request.target) {
        rr.resStatusCode(HttpStatus.BadRequest);
        rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
        await rr.resEnd(JSON.stringify(this.buildErrorResponse('', { message: 'target not found' }, request.requestUUID)));
        return false;
      }

      const fileMap = this.getFileMap(request, formData);

      const body = this.replaceFileRefs(request.body, fileMap);
      let responseBody: unknown;

      if (request.type === 'router') {
        const intent = new Intent(request.target);
        intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
        intent.data = [body, rr];
        const routerModule = await this.routerManager.routing(intent);
        const moduleInstance = routerModule?.getModuleInstance?.();
        if (!routerModule || !moduleInstance || !routerModule.propertyKeys) {
          rr.resStatusCode(HttpStatus.NotFound);
          rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
          await rr.resEnd(JSON.stringify(this.buildErrorResponse(request.target, { message: 'Not found router target' }, request.requestUUID)));
          return false;
        }
        for (const key of routerModule.propertyKeys) {
          const handler = (moduleInstance as Record<string | symbol, unknown>)[key];
          if (typeof handler === 'function') {
            const result = (handler as (body: unknown, rr: RequestResponse) => unknown)(body, rr);
            responseBody = result instanceof Promise ? await result : result;
          }
          break;
        }
      } else {
        const intent = new Intent(request.target);
        intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
        intent.data = [body, rr];
        const result = await this.intentManager.publishMeta(intent);
        if (result.target.length <= 0) {
          rr.resStatusCode(HttpStatus.NotFound);
          rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
          await rr.resEnd(JSON.stringify(this.buildErrorResponse(request.target, { message: 'Not found intent target' }, request.requestUUID)));
          return false;
        }
        const rdata = result.return[0];
        responseBody = rdata instanceof Promise ? await rdata : rdata;
      }

      const response = this.buildResponse(request.target, responseBody, request.requestUUID);
      const multipart = await this.buildMultipartResponse(response);
      rr.resStatusCode(HttpStatus.Ok);
      if (multipart.hasFiles) {
        rr.resSetHeader(HttpHeaders.ContentType, [`multipart/mixed; boundary=${multipart.boundary}`]);
        await rr.resEnd(multipart.buffer);
      } else {
        rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
        await rr.resEnd(JSON.stringify(response));
      }
      return false;
    } catch (error) {
      rr.resStatusCode(HttpStatus.BadRequest);
      rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson]);
      const message = error instanceof Error ? error.message : 'Invalid request';
      await rr.resEnd(JSON.stringify(this.buildErrorResponse('', { message })));
      return false;
    }
  }

  async proceedAfter({ rr }: { rr: RequestResponse; app: SimpleBootHttpServer; carrier: Map<string, unknown> }) {
    return true;
  }
}
