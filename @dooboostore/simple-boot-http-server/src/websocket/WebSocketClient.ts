import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { TopicRequest, TopicResponse, TopicServerEventRequest, TopicServerEventResponse, TopicServerEventUnSubscribeRequest, TopicSubscribeRequest, TopicType, TopicUnsubscribeRequest } from './WebSocketManager';
import message, { Subject, ReplayForwardSubject, Observable } from '@dooboostore/core/message/index';
import { filter } from '@dooboostore/core/message/operators/filter';
export * from '@dooboostore/core/message/index';

type TopicObserverNextCallBack<T> = <R = any>(data: T, meta: { socket: WebSocket }) => void;
type TopicObserverEventCallBack = { [event: string]: <T, R = any>(data: T, meta: { socket: WebSocket }) => Promise<R> | void | any } | (<T, R = any>(event: string, data: T, meta: { socket: WebSocket }) => Promise<R> | void | any);
type TopicObserverErrorCallBack = <R = any>(err: any) => void;
export type TopicObserverCallBack<T> = { next: TopicObserverNextCallBack<T>; event?: TopicObserverEventCallBack; error?: TopicObserverErrorCallBack; complete?: () => void } | TopicObserverNextCallBack<T>;

export interface WebSocketClientConfig {
  retryConnectionCount?: number;
  retryConnectionDelay?: number;
  maxPendingMessages?: number;
  maxPendingBinaryMessages?: number;
}

type OnUnsubscribeCallback = (type: 'server' | 'manual') => void;
export type Subscription = {
  closed: boolean;
  unsubscribe: () => void;
};

export class WebSocketClient {
  private websocket: WebSocket;
  private topics = new Map<string, { observer: TopicObserverCallBack<any>; subscription: Subscription; onUnsubscribes: OnUnsubscribeCallback[]; target: string }>();
  private observer?: (data: TopicResponse | TopicServerEventRequest | TopicServerEventUnSubscribeRequest) => void;
  private pendingMessages: any[] = [];
  private pendingBinaryMessages: Array<ArrayBuffer | Blob | Uint8Array> = [];
  private isConnected = false;
  private onOpenCallback: () => void;
  private onCloseCallback: () => void;
  private _subject = new Subject<TopicResponse | TopicServerEventRequest | TopicServerEventUnSubscribeRequest>();
  // Reconnection properties
  private connectionUrl: string | URL;
  private connectionProtocols?: string | string[];
  private retryConnectionCount: number;
  private retryConnectionDelay: number;
  private currentRetryCount = 0;
  private reconnectTimeout?: number;
  private isManualClose = false;
  private isConnecting = false;
  private maxPendingMessages: number;
  private maxPendingBinaryMessages: number;

  constructor(connection: { url: string | URL; protocols?: string | string[] }, config?: WebSocketClientConfig);
  constructor(connection: string, config?: WebSocketClientConfig);
  constructor(connection: URL, config?: WebSocketClientConfig);
  constructor(connection: { url: string | URL; protocols?: string | string[] } | string | URL, config?: WebSocketClientConfig) {
    // Store connection info for reconnection
    if (typeof connection === 'string' || connection instanceof URL) {
      this.connectionUrl = connection;
    } else {
      this.connectionUrl = connection.url;
      this.connectionProtocols = connection.protocols;
    }

    // Set config with defaults
    this.retryConnectionCount = config?.retryConnectionCount ?? 0;
    this.retryConnectionDelay = config?.retryConnectionDelay ?? 1000;
    this.maxPendingMessages = config?.maxPendingMessages ?? 1000;
    this.maxPendingBinaryMessages = config?.maxPendingBinaryMessages ?? 100;

    this.connect();
  }

  private get observable() {
    return this._subject.asObservable();
  }

  private connect() {
    if (this.isConnecting) {
      return;
    }
    if (this.websocket && (this.websocket.readyState === WebSocket.OPEN || this.websocket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.isConnecting = true;
    if (this.connectionProtocols) {
      this.websocket = new WebSocket(this.connectionUrl, this.connectionProtocols);
    } else {
      this.websocket = new WebSocket(this.connectionUrl);
    }

    this.websocket.binaryType = 'arraybuffer';

    this.websocket.addEventListener('open', () => {
      this.isConnecting = false;
      this.isConnected = true;
      this.currentRetryCount = 0; // Reset retry count on successful connection
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = undefined;
      }
      console.log('WebSocket connected');
      this.onOpenCallback?.();

      // Re-subscribe to all existing topics after reconnection
      this.topics.forEach((topicData, uuid) => {
        // closed된 subscription은 재구독하지 않음
        if (!topicData.subscription.closed) {
          const subscribeTopic: TopicSubscribeRequest = {
            type: 'subscribe',
            uuid,
            target: topicData.target
          };
          // console.log('????')
          this.websocket.send(JSON.stringify(subscribeTopic));
        }
      });

      // 대기 중인 모든 메시지 전송
      while (this.pendingMessages.length > 0) {
        const message = this.pendingMessages.shift();
        this.websocket.send(JSON.stringify(message));
      }

      while (this.pendingBinaryMessages.length > 0) {
        const message = this.pendingBinaryMessages.shift();
        if (message) {
          this.websocket.send(message);
        }
      }
    });

    this.websocket.addEventListener('close', event => {
      this.isConnecting = false;
      this.isConnected = false;
      console.log('WebSocket closed', event.code, event.reason);
      this.onCloseCallback?.();

      // Attempt reconnection if not manually closed
      if (!this.isManualClose) {
        this.attemptReconnect();
      }
    });

    this.websocket.addEventListener('error', error => {
      console.error('WebSocket error:', error);
    });

    this.websocket.addEventListener('message', async event => {
      const topic = await this.parseIncomingTopic(event.data);
      if (!topic) {
        return;
      }
      this._subject.next(topic);
      this.observer?.(topic);
      if (topic.uuid) {
        const topicData = this.topics.get(topic.uuid);
        if (topicData) {
          const observer = topicData.observer;
          const nextCallback = typeof observer === 'function' ? observer : observer.next;
          const errorCallback = typeof observer === 'function' ? undefined : observer.error;
          const eventCallback = typeof observer === 'function' ? undefined : observer.event;
          if ('state' in topic && topic.state === 'success') {
            await nextCallback(topic.body, { socket: this.websocket });
          } else if ('state' in topic && topic.state === 'error' && errorCallback) {
            await errorCallback(topic.body);
          } else if ('type' in topic && topic.type === 'unsubscribe') {
            topicData.subscription.closed = true;
            this.topics.delete(topic.uuid);
            topicData.onUnsubscribes.forEach(it => it('server'));
          } else if ('type' in topic && topic.type === 'event' && eventCallback) {
            /////////// event ///////////
            let eventResponse = typeof eventCallback === 'function' ? await eventCallback(topic.event, topic.body, { socket: this.websocket }) : await eventCallback[topic.event]?.(topic.body, { socket: this.websocket });

            if (eventResponse !== undefined && eventResponse !== null) {
              const value: TopicServerEventResponse = {
                uuid: topic.uuid,
                eventUUID: topic.eventUUID,
                type: topic.type,
                body: eventResponse
              };
              this.websocket.send(JSON.stringify(value));
            }
          }
        }
      }
    });
  }

  private attemptReconnect() {
    if (this.currentRetryCount >= this.retryConnectionCount) {
      console.error(`WebSocket reconnection failed after ${this.retryConnectionCount} attempts`);
      return;
    }
    if (this.reconnectTimeout) {
      return;
    }

    this.currentRetryCount++;
    console.log(`Attempting to reconnect... (${this.currentRetryCount}/${this.retryConnectionCount})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = undefined;
      this.connect();
      // Subscribe messages are already in pendingMessages and will be sent automatically
    }, this.retryConnectionDelay);
  }

  private sendMessage(message: TopicRequest | TopicUnsubscribeRequest | TopicSubscribeRequest) {
    if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
      return;
    }
    if (message.type === 'subscribe' || message.type === 'unsubscribe') {
      return;
    }
    if (this.maxPendingMessages <= 0) {
      return;
    }
    if (this.pendingMessages.length >= this.maxPendingMessages) {
      this.pendingMessages.shift();
    }
    this.pendingMessages.push(message);
  }

  sendBinary(data: ArrayBuffer | Blob | Uint8Array) {
    if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(data);
      return;
    }
    if (this.maxPendingBinaryMessages <= 0) {
      return;
    }
    if (this.pendingBinaryMessages.length >= this.maxPendingBinaryMessages) {
      this.pendingBinaryMessages.shift();
    }
    this.pendingBinaryMessages.push(data);
  }

  private async parseIncomingTopic(data: any): Promise<TopicResponse | TopicServerEventRequest | TopicServerEventUnSubscribeRequest | undefined> {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn('Invalid WebSocket payload:', error);
        return undefined;
      }
    }

    if (data instanceof ArrayBuffer) {
      return this.parseBinaryTopic(data);
    }

    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      const buffer = await data.arrayBuffer();
      return this.parseBinaryTopic(buffer);
    }

    return undefined;
  }

  private parseBinaryTopic(data: ArrayBuffer): TopicResponse | TopicServerEventRequest | TopicServerEventUnSubscribeRequest | undefined {
    if (data.byteLength < 4) {
      return undefined;
    }
    const view = new DataView(data);
    const jsonLength = view.getUint32(0, true);
    const jsonStart = 4;
    const jsonEnd = jsonStart + jsonLength;
    if (data.byteLength < jsonEnd) {
      return undefined;
    }

    const jsonBytes = new Uint8Array(data, jsonStart, jsonLength);
    let meta: any;
    try {
      const decoder = new TextDecoder();
      meta = JSON.parse(decoder.decode(jsonBytes));
    } catch (error) {
      console.warn('Invalid WebSocket binary payload:', error);
      return undefined;
    }

    const filesMeta = Array.isArray(meta.files) ? meta.files : [];
    const fileMap = new Map<string, any>();
    filesMeta.forEach((file: any) => {
      if (!file || typeof file.id !== 'string' || typeof file.size !== 'number' || typeof file.offset !== 'number') {
        return;
      }
      const start = jsonEnd + file.offset;
      const end = start + file.size;
      if (start < jsonEnd || end > data.byteLength) {
        return;
      }
      const slice = data.slice(start, end);
      const mime = file.mime || 'application/octet-stream';
      let fileValue: any;
      if (typeof File !== 'undefined') {
        fileValue = new File([slice], file.name || 'file', { type: mime });
      } else {
        fileValue = { name: file.name || 'file', mime, size: file.size, buffer: slice };
      }
      fileMap.set(file.id, fileValue);
    });

    const replaceFileRefs = (value: any): any => {
      if (value && typeof value === 'object' && '$file' in value && typeof value.$file === 'string') {
        const file = fileMap.get(value.$file);
        if (file) {
          return file;
        }
      }
      if (Array.isArray(value)) {
        return value.map(item => replaceFileRefs(item));
      }
      if (value && typeof value === 'object') {
        const result: Record<string, any> = {};
        Object.keys(value).forEach(key => {
          result[key] = replaceFileRefs(value[key]);
        });
        return result;
      }
      return value;
    };

    meta.body = replaceFileRefs(meta.body);
    return meta as TopicResponse | TopicServerEventRequest | TopicServerEventUnSubscribeRequest;
  }

  private isBinaryPayload(value: any) {
    if (!value) {
      return false;
    }
    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return true;
    }
    if (typeof Uint8Array !== 'undefined' && value instanceof Uint8Array) {
      return true;
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return true;
    }
    if (value && typeof value === 'object' && 'buffer' in value) {
      const bufferValue = (value as any).buffer;
      return this.isBinaryPayload(bufferValue);
    }
    return false;
  }

  private hasBinaryPayload(value: any): boolean {
    if (this.isBinaryPayload(value)) {
      return true;
    }
    if (Array.isArray(value)) {
      return value.some(item => this.hasBinaryPayload(item));
    }
    if (value && typeof value === 'object') {
      return Object.keys(value).some(key => this.hasBinaryPayload(value[key]));
    }
    return false;
  }

  private async buildBinaryMessage(body: any, meta: { type?: TopicType; uuid: string; requestUUID: string }) {
    const fileRefs = new Map<any, string>();
    const fileEntries: Array<{ id: string; name: string; mime: string; buffer: Promise<ArrayBuffer | SharedArrayBuffer> }> = [];
    let fileIndex = 0;

    const registerFile = (value: any) => {
      const existing = fileRefs.get(value);
      if (existing) {
        return existing;
      }
      const id = `f${++fileIndex}`;
      fileRefs.set(value, id);

      let name = 'file';
      let mime = 'application/octet-stream';
      let buffer: Promise<ArrayBuffer | SharedArrayBuffer>;

      if (typeof Blob !== 'undefined' && value instanceof Blob) {
        const fileLike = value as File | Blob;
        if ('name' in fileLike && typeof (fileLike as File).name === 'string') {
          name = (fileLike as File).name || name;
        }
        mime = fileLike.type || mime;
        buffer = fileLike.arrayBuffer();
      } else if (value && typeof value === 'object' && 'buffer' in value) {
        const fileLike = value as any;
        if (typeof fileLike.name === 'string') {
          name = fileLike.name || name;
        }
        if (typeof fileLike.mime === 'string') {
          mime = fileLike.mime || mime;
        }
        const innerBuffer = fileLike.buffer;
        if (typeof Blob !== 'undefined' && innerBuffer instanceof Blob) {
          buffer = innerBuffer.arrayBuffer();
        } else if (typeof Uint8Array !== 'undefined' && innerBuffer instanceof Uint8Array) {
          const sliced = innerBuffer.buffer.slice(innerBuffer.byteOffset, innerBuffer.byteOffset + innerBuffer.byteLength);
          buffer = Promise.resolve(sliced instanceof ArrayBuffer ? sliced : new Uint8Array(sliced).buffer);
        } else if (typeof ArrayBuffer !== 'undefined' && innerBuffer instanceof ArrayBuffer) {
          buffer = Promise.resolve(innerBuffer as ArrayBuffer);
        } else {
          buffer = Promise.resolve(new ArrayBuffer(0));
        }
      } else if (typeof Uint8Array !== 'undefined' && value instanceof Uint8Array) {
        const view = value as Uint8Array;
        const sliced = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
        buffer = Promise.resolve(sliced instanceof ArrayBuffer ? sliced : new Uint8Array(sliced).buffer);
      } else if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        buffer = Promise.resolve(value as ArrayBuffer);
      } else {
        buffer = Promise.resolve(new ArrayBuffer(0));
      }

      fileEntries.push({ id, name, mime, buffer });
      return id;
    };

    const replaceFiles = (value: any): any => {
      if (this.isBinaryPayload(value)) {
        const id = registerFile(value);
        return { $file: id };
      }
      if (Array.isArray(value)) {
        return value.map(item => replaceFiles(item));
      }
      if (value && typeof value === 'object') {
        const result: Record<string, any> = {};
        Object.keys(value).forEach(key => {
          result[key] = replaceFiles(value[key]);
        });
        return result;
      }
      return value;
    };

    const payload = replaceFiles(body);
    const buffers = await Promise.all(fileEntries.map(entry => entry.buffer));

    let offset = 0;
    const files = fileEntries.map((entry, index) => {
      const size = buffers[index].byteLength;
      const fileMeta = {
        id: entry.id,
        name: entry.name,
        mime: entry.mime,
        size,
        offset
      };
      offset += size;
      return fileMeta;
    });

    const json = JSON.stringify({
      type: meta.type,
      uuid: meta.uuid,
      requestUUID: meta.requestUUID,
      body: payload,
      files
    });

    const encoder = new TextEncoder();
    const jsonBytes = encoder.encode(json);
    const header = new Uint8Array(4);
    new DataView(header.buffer).setUint32(0, jsonBytes.byteLength, true);

    const totalSize = header.byteLength + jsonBytes.byteLength + offset;
    const combined = new Uint8Array(totalSize);
    combined.set(header, 0);
    combined.set(jsonBytes, header.byteLength);

    let cursor = header.byteLength + jsonBytes.byteLength;
    buffers.forEach(buffer => {
      const view = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
      combined.set(view, cursor);
      cursor += buffer.byteLength;
    });

    return combined.buffer;
  }

  subject(target: string, option?: { type?: TopicType; subScribeBody?: any; observer?: TopicObserverCallBack<any>; onUnsubscribe?: OnUnsubscribeCallback }) {
    const self = this;
    const uuid = RandomUtils.uuid4();
    const onUnsubscribes: OnUnsubscribeCallback[] = [];
    if (option?.onUnsubscribe) {
      onUnsubscribes.push(option.onUnsubscribe);
    }
    if (option?.observer && typeof option.observer !== 'function' && option.observer.complete) {
      onUnsubscribes.push(() => (option.observer as any).complete());
    }
    const topicSubject = new Subject<any>();
    onUnsubscribes.push(() => topicSubject.complete());

    let isClosed = false;
    let activeSubscription: Subscription | undefined;

    const unsubscribeLogic = () => {
      if (isClosed) return;
      const unSubscribeTopic: TopicUnsubscribeRequest = { type: 'unsubscribe', uuid };
      self.sendMessage(unSubscribeTopic);
      isClosed = true;
      self.topics.delete(uuid);
      onUnsubscribes.forEach(it => it('manual'));
      if (activeSubscription) {
        activeSubscription.closed = true;
      }
    };

    const doSubscribe = <T>(observer?: TopicObserverCallBack<T>) => {
      const subscription: Subscription = {
        closed: isClosed,
        unsubscribe: unsubscribeLogic
      };

      const wrappedObserver: TopicObserverCallBack<T> = {
        next: (data, meta) => {
          topicSubject.next(data);
          if (observer) {
            return typeof observer === 'function' ? observer(data, meta) : observer.next(data, meta);
          }
        },
        error: err => {
          topicSubject.error(err);
          if (observer && typeof observer !== 'function' && observer.error) {
            observer.error(err);
          }
        },
        event: observer && typeof observer !== 'function' ? observer.event : undefined
      };

      self.topics.set(uuid, { observer: wrappedObserver, target, subscription, onUnsubscribes });
      const subscribeTopic: TopicSubscribeRequest = { type: 'subscribe', uuid, target: target, body: option?.subScribeBody };

      self.sendMessage(subscribeTopic);
      // console.log('----------')
      activeSubscription = subscription;
      return subscription;
    };

    if (option?.observer) {
      doSubscribe(option.observer);
    }

    return {
      get closed() {
        return isClosed;
      },
      unsubscribe: unsubscribeLogic,
      get observable() {
        return new Observable<any>(subscriber => {
          if (!activeSubscription && !isClosed) {
            doSubscribe();
          }
          return topicSubject.subscribe({
            next: value => subscriber.next(value),
            error: err => subscriber.error(err),
            complete: () => subscriber.complete()
          });
        });
      },
      send: (body?: any) => {
        if (!activeSubscription && !self.topics.has(uuid) && !isClosed) {
          doSubscribe();
        }
        const requestUUID = RandomUtils.uuid4();
        if (self.hasBinaryPayload(body)) {
          self.buildBinaryMessage(body, { type: option?.type, uuid, requestUUID }).then(buffer => self.sendBinary(buffer));
        } else {
          const value: TopicRequest = { type: option?.type, uuid, requestUUID, body: body };
          self.sendMessage(value);
        }
        return topicSubject.pipe(filter(data => data && data.requestUUID === requestUUID));
      },
      onUnsubscribe: (callback: OnUnsubscribeCallback) => {
        onUnsubscribes.push(callback);
      }
    };
  }

  onOpen(callback: () => void) {
    this.onOpenCallback = callback;
  }

  onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  subscribe<T = any>(observer: (data: TopicResponse<T> | TopicServerEventRequest<T>) => void) {
    this.observer = observer;
  }

  close() {
    this.isManualClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    this.pendingMessages = [];
    this.pendingBinaryMessages = [];
    this.isConnecting = false;
    this.topics.forEach(topicData => {
      topicData.subscription.closed = true;
      topicData.onUnsubscribes.forEach(it => it('manual'));
    });
    this.topics.clear();
    this.websocket.close();
  }

  reconnect() {
    // 기존 연결 종료
    this.isManualClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // close 이벤트 후에 재연결하도록 설정
    const reconnectAfterClose = () => {
      console.log('close websocket');
      this.isManualClose = false;
      this.currentRetryCount = 0;
      this.connect();
    };

    // 이미 닫혀있으면 바로 재연결
    if (this.websocket.readyState === WebSocket.CLOSED || this.websocket.readyState === WebSocket.CLOSING) {
      reconnectAfterClose();
    } else {
      // 연결이 닫힐 때까지 기다렸다가 재연결
      this.websocket.addEventListener('close', reconnectAfterClose, { once: true });
      this.websocket.close();
    }
  }

  getReadyState(): number {
    return this.websocket.readyState;
  }

  isConnectionOpen(): boolean {
    return this.isConnected && this.websocket.readyState === WebSocket.OPEN;
  }
}
