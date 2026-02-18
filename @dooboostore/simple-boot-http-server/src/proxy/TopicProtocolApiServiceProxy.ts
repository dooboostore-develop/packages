import { getSim, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { HttpHeaders } from '../codes/HttpHeaders';
import { ApiService } from '@dooboostore/simple-boot/fetch/ApiService';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { HttpFetcherTarget } from '@dooboostore/core/fetch/HttpFetcher';

export type TopicProtocolConfig<TBody = unknown> = {
  bypassTransform?: boolean;
  transformText?: boolean;
  headers?: HeadersInit;
  body?: TBody;
  endpoint?: HttpFetcherTarget;
  type?: TopicProtocolType;
  config?: ApiService.ApiServiceConfig;
};

type TopicProtocolType = 'intent' | 'router';
type TopicProtocolRequest<TBody = unknown> = {
  type: TopicProtocolType;
  target: string;
  requestUUID: string;
  body?: TBody;
  files?: Array<{ id: string }>;
};

type FileEntry = { id: string; file: Blob; filename?: string };
type MixedPart = { headers: Record<string, string>; body: Uint8Array };

@Sim
export class TopicProtocolApiServiceProxy<T extends object> implements ProxyHandler<T> {
  constructor(private apiService: ApiService) {}

  private static isFileValue(value: unknown): value is File | Blob | ArrayBuffer | Uint8Array {
    if (typeof File !== 'undefined' && value instanceof File) {
      return true;
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return true;
    }
    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return true;
    }
    if (typeof Uint8Array !== 'undefined' && value instanceof Uint8Array) {
      return true;
    }
    return false;
  }

  private static toFileEntry(value: File | Blob | ArrayBuffer | Uint8Array, id: string): FileEntry | undefined {
    if (typeof Blob === 'undefined') {
      return undefined;
    }
    if (typeof File !== 'undefined' && value instanceof File) {
      const blob = new Blob([value], { type: value.type });
      return { id, file: blob, filename: value.name };
    }
    if (value instanceof Blob) {
      return { id, file: value };
    }
    const view = value instanceof Uint8Array ? value : new Uint8Array(value);
    const safe = value instanceof Uint8Array ? new Uint8Array(value) : new Uint8Array(view);
    const blob = new Blob([safe]);
    return { id, file: blob };
  }

  private static buildRequest<TBody>(target: string, body?: TBody, type: TopicProtocolType = 'intent') {
    const fileEntries: FileEntry[] = [];
    let fileIndex = 0;

    const registerFile = (value: File | Blob | ArrayBuffer | Uint8Array): string | undefined => {
      const id = `f${++fileIndex}`;
      const entry = TopicProtocolApiServiceProxy.toFileEntry(value, id);
      if (entry) {
        fileEntries.push(entry);
        return id;
      }
      return undefined;
    };

    const replaceFiles = (value: unknown): unknown => {
      if (TopicProtocolApiServiceProxy.isFileValue(value)) {
        const id = registerFile(value);
        if (id) {
          return { $file: id };
        }
        return value;
      }
      if (Array.isArray(value)) {
        return value.map(item => replaceFiles(item));
      }
      if (value && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        Object.keys(value).forEach(key => {
          result[key] = replaceFiles((value as Record<string, unknown>)[key]);
        });
        return result;
      }
      return value;
    };

    const payload = replaceFiles(body);
    const request: TopicProtocolRequest<TBody> = {
      type,
      target,
      requestUUID: RandomUtils.uuid4(),
      body: payload as TBody,
      files: fileEntries.length > 0 ? fileEntries.map(entry => ({ id: entry.id })) : undefined
    };

    return { request, fileEntries };
  }

  private static async parseMultipartMixed(response: Response) {
    const contentType = response.headers.get('Content-Type') ?? '';
    const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
    if (!boundaryMatch) {
      return undefined;
    }
    const boundary = boundaryMatch[1].replace(/^"|"$/g, '');
    const buffer = new Uint8Array(await response.arrayBuffer());
    const boundaryBytes = new TextEncoder().encode(`--${boundary}`);
    const endBoundaryBytes = new TextEncoder().encode(`--${boundary}--`);
    const separator = new TextEncoder().encode('\r\n\r\n');

    const indexOf = (source: Uint8Array, needle: Uint8Array, from = 0) => {
      for (let i = from; i <= source.length - needle.length; i++) {
        let matched = true;
        for (let j = 0; j < needle.length; j++) {
          if (source[i + j] !== needle[j]) {
            matched = false;
            break;
          }
        }
        if (matched) {
          return i;
        }
      }
      return -1;
    };

    const parts: MixedPart[] = [];
    let cursor = indexOf(buffer, boundaryBytes, 0);
    while (cursor !== -1) {
      const nextBoundary = indexOf(buffer, boundaryBytes, cursor + boundaryBytes.length);
      const endBoundary = indexOf(buffer, endBoundaryBytes, cursor + boundaryBytes.length);
      const isFinal = endBoundary !== -1 && (endBoundary < nextBoundary || nextBoundary === -1);
      const partStart = cursor + boundaryBytes.length;
      if (isFinal) {
        break;
      }
      let headerStart = partStart;
      if (buffer[headerStart] === 13 && buffer[headerStart + 1] === 10) {
        headerStart += 2;
      }
      const headerEnd = indexOf(buffer, separator, headerStart);
      if (headerEnd === -1) {
        break;
      }
      const headerText = new TextDecoder().decode(buffer.slice(headerStart, headerEnd));
      const headers: Record<string, string> = {};
      headerText.split('\r\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
          const key = line.slice(0, idx).trim().toLowerCase();
          headers[key] = line.slice(idx + 1).trim();
        }
      });
      const bodyStart = headerEnd + separator.length;
      const bodyEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2;
      const body = buffer.slice(bodyStart, bodyEnd);
      parts.push({ headers, body });
      cursor = nextBoundary;
    }

    return { boundary, parts };
  }

  private static parseDispositionFilename(disposition?: string) {
    if (!disposition) {
      return undefined;
    }
    const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
    return match ? match[1] : undefined;
  }

  private static parseDispositionName(disposition?: string) {
    if (!disposition) {
      return undefined;
    }
    const match = disposition.match(/name=\"?([^\";]+)\"?/i);
    return match ? match[1] : undefined;
  }

  private static replaceFileRefs(value: unknown, fileMap: Map<string, { name?: string; mime?: string; size: number; buffer: ArrayBuffer }>) {
    if (value && typeof value === 'object' && '$file' in value) {
      const fileKey = (value as { $file?: unknown }).$file;
      if (typeof fileKey === 'string') {
        const file = fileMap.get(fileKey);
        if (file) {
          return file;
        }
      }
    }
    if (Array.isArray(value)) {
      return value.map(item => TopicProtocolApiServiceProxy.replaceFileRefs(item, fileMap));
    }
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      Object.keys(value).forEach(key => {
        result[key] = TopicProtocolApiServiceProxy.replaceFileRefs((value as Record<string, unknown>)[key], fileMap);
      });
      return result;
    }
    return value;
  }

  private static normalizeResponse(value: unknown) {
    if (value && typeof value === 'object' && 'state' in value && 'body' in value) {
      const typed = value as { state?: string; body?: unknown };
      if (typed.state === 'error') {
        const message = typeof typed.body === 'object' && typed.body && 'message' in typed.body ? String((typed.body as { message?: unknown }).message) : 'TopicProtocol error';
        throw new Error(message);
      }
      return typed.body;
    }
    return value;
  }

  static createHandler<T extends object>(apiService: ApiService): ProxyHandler<T> {
    return {
      get(target: T, prop: string | symbol, receiver: unknown): unknown {
        const simConfig = getSim(target);
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function' && simConfig?.symbol) {
          return function (...args: unknown[]) {
            const f = value as Function;
            const p = (userConfig?: TopicProtocolConfig) => {
              const symbolValue = Array.isArray(simConfig.symbol) ? simConfig.symbol[0] : simConfig.symbol;
              const symbolName = (symbolValue as Symbol | undefined)?.description ?? String(symbolValue ?? simConfig.symbol);
              const targetPath = `Symbol.for(${symbolName}):/${String(prop)}`;
              const { request, fileEntries } = TopicProtocolApiServiceProxy.buildRequest(targetPath, userConfig?.body, userConfig?.type ?? 'intent');
              const formData = new FormData();
              formData.append('body', JSON.stringify(request));
              fileEntries.forEach(entry => {
                if (entry.filename) {
                  formData.append(entry.id, entry.file, entry.filename);
                } else {
                  formData.append(entry.id, entry.file);
                }
              });

              const headers = {
                ...(userConfig?.headers ?? {}),
                [HttpHeaders.XSimpleBootHttpTopicProtocol]: 'topic'
              };

              const endpoint = userConfig?.endpoint ?? '/';
              return apiService.post({
                target: endpoint,
                config: {
                  responseTransform: userConfig?.bypassTransform
                    ? 'response'
                    : userConfig?.transformText
                      ? 'text'
                      : async (response: Response) => {
                          const contentType = response.headers.get('Content-Type') ?? '';
                          if (contentType.toLowerCase().includes('multipart/mixed')) {
                            const parsed = await TopicProtocolApiServiceProxy.parseMultipartMixed(response);
                            if (!parsed) {
                              return undefined;
                            }
                            const fileMap = new Map<string, { name?: string; mime?: string; size: number; buffer: ArrayBuffer }>();
                            let jsonBody: unknown = undefined;
                            parsed.parts.forEach(part => {
                              const partType = part.headers['content-type'] ?? '';
                              const disposition = part.headers['content-disposition'];
                              const name = TopicProtocolApiServiceProxy.parseDispositionName(disposition);
                              if (partType.includes('application/json')) {
                                const text = new TextDecoder().decode(part.body);
                                jsonBody = text ? JSON.parse(text) : undefined;
                                return;
                              }
                              const filename = TopicProtocolApiServiceProxy.parseDispositionFilename(disposition);
                              if (name) {
                                const view = part.body;
                                const safe = new Uint8Array(view.byteLength);
                                safe.set(view);
                                fileMap.set(name, {
                                  name: filename,
                                  mime: partType || 'application/octet-stream',
                                  size: view.byteLength,
                                  buffer: safe.buffer
                                });
                              }
                            });
                            if (jsonBody) {
                              const replaced = TopicProtocolApiServiceProxy.replaceFileRefs(jsonBody, fileMap);
                              return TopicProtocolApiServiceProxy.normalizeResponse(replaced);
                            }
                            return undefined;
                          }
                          const text = await response.text();
                          const parsed = text ? JSON.parse(text) : undefined;
                          return TopicProtocolApiServiceProxy.normalizeResponse(parsed);
                        },
                  transformText: userConfig?.transformText,
                  config: userConfig?.config,
                  fetch: {
                    credentials: 'include',
                    headers,
                    body: formData
                  }
                } as any
              });
            };
            args.push(p);
            return Reflect.apply(f, target, args);
          };
        }
        return value;
      }
    };
  }

  get(target: T, prop: string | symbol, receiver: unknown): unknown {
    return TopicProtocolApiServiceProxy.createHandler<T>(this.apiService).get!(target, prop, receiver);
  }
}
