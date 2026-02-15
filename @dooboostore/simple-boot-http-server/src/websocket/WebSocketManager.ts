import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { WebSocketEndPoint, WebSocketSet } from '../endpoints/WebSocketEndPoint';
import { RawData, WebSocket } from 'ws';
import { IntentManager } from '@dooboostore/simple-boot/intent/IntentManager';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { Intent, PublishType } from '@dooboostore/simple-boot/intent/Intent';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { Subject } from '@dooboostore/core/message/Subject';
export type WebSocketRequest = { webSocketSet: WebSocketSet; uuid: string; webSocketManager: WebSocketManager; sendEvent: <R>(event: string, body: any, config?: { responseTimeout?: number }) => Promise<R> };
export type TopicType = 'intent' | 'router';
export type SubscribeType = 'subscribe';
export type UnsubscribeType = 'unsubscribe';
export type TopicRequest<T = any> = {
  type?: TopicType;
  uuid: string;
  requestUUID: string;
  body?: T;
};
export type TopicSubscribeRequest<T = any> = {
  type: SubscribeType;
  target: string;
  uuid: string;
  body?: T;
};
export type TopicUnsubscribeRequest = {
  type: UnsubscribeType;
  uuid: string;
};

export type TopicResponse<T = any> = {
  state: 'success' | 'error';
  // type: TopicType | SubscribeType | UnsubscribeType;
  target: string;
  uuid: string;
  requestUUID?: string;
  body: T;
};

export type TopicServerEventRequest<T = any> = {
  type: 'event';
  uuid: string;
  eventUUID: string;
  event: string;
  body?: T;
};
export type TopicServerEventUnSubscribeRequest = {
  type: 'unsubscribe';
  uuid: string;
};
export type TopicServerEventResponse<T = any> = {
  type: 'event';
  uuid: string;
  eventUUID: string;
  body?: T;
};

export const isTopicRequest = <T = any>(obj: any): obj is TopicRequest<T> => {
  return typeof obj === 'object' && obj !== null && 'uuid' in obj && typeof obj.uuid === 'string' && (obj.type === undefined || obj.type === 'intent' || obj.type === 'router') && (obj.body === undefined || true);
};

export const isTopicSubscribeRequest = <T = any>(obj: any): obj is TopicSubscribeRequest<T> => {
  return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'subscribe' && 'target' in obj && typeof obj.target === 'string' && 'uuid' in obj && typeof obj.uuid === 'string' && (obj.body === undefined || true);
};

export const isTopicUnsubscribeRequest = (obj: any): obj is TopicUnsubscribeRequest => {
  return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'unsubscribe' && 'uuid' in obj && typeof obj.uuid === 'string';
};

export const isTopicResponse = <T = any>(obj: any): obj is TopicResponse<T> => {
  return typeof obj === 'object' && obj !== null && 'state' in obj && (obj.state === 'success' || obj.state === 'error') && 'target' in obj && typeof obj.target === 'string' && 'uuid' in obj && typeof obj.uuid === 'string' && 'body' in obj;
};

export const isTopicServerEventRequest = <T = any>(obj: any): obj is TopicServerEventRequest<T> => {
  return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'event' && 'uuid' in obj && typeof obj.uuid === 'string' && 'eventUUID' in obj && typeof obj.eventUUID === 'string' && 'event' in obj && typeof obj.event === 'string' && (obj.body === undefined || true);
};

export const isTopicServerEventResponse = <T = any>(obj: any): obj is TopicServerEventResponse<T> => {
  return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'event' && 'uuid' in obj && typeof obj.uuid === 'string' && 'eventUUID' in obj && typeof obj.eventUUID === 'string' && (obj.body === undefined || true);
};

export const isTopicServerEventUnSubscribeRequest = (obj: any): obj is TopicServerEventUnSubscribeRequest => {
  return typeof obj === 'object' && obj !== null && 'type' in obj && obj.type === 'unsubscribe' && 'uuid' in obj && typeof obj.uuid === 'string';
};

type EventResponseCallBack = <T>(data: T, wsSet: WebSocketSet) => void;

export type RegisteredClient<T = any> = { uuid: string; target: string; subscribeBody?: T };

type RegisteredClientSet<T = any> = RegisteredClient<T> & { webSocketSet: WebSocketSet };

@Sim
export class WebSocketManager implements WebSocketEndPoint {
  private clients: Map<WebSocketSet, RegisteredClient[]> = new Map();
  private eventSubscriptions: Map<string, Map<string, EventResponseCallBack>> = new Map();
  private subject = new Subject<TopicRequest | TopicUnsubscribeRequest | TopicSubscribeRequest | TopicServerEventResponse>();
  constructor(
    private intentManager: IntentManager,
    private routerManager: RouterManager
  ) {}

  get observable() {
    return this.subject.asObservable();
  }
  connect(wsSet: WebSocketSet) {
    this.clients.set(wsSet, []);
    console.log('WebSocket connected:', wsSet.request.url);
  }
  close(wsSet: WebSocketSet) {
    this.removeAllClientsByWebSocketSet(wsSet);
    this.clients.delete(wsSet);
    console.log('WebSocket disconnected:', wsSet.request.url);
  }

  setClientTopic(wsSet: WebSocketSet, uuid: string, target: string, subscribeBody?: any) {
    const clientTopics = this.clients.get(wsSet);
    if (clientTopics && !clientTopics.find(it => it.uuid === uuid)) {
      clientTopics.push({ uuid, target, subscribeBody });
      this.clients.set(wsSet, clientTopics);
    } else if (clientTopics) {
      throw { message: 'Already subscribed topic' };
    }
  }

  findAllClientsByTarget(target: string): RegisteredClientSet[] {
    const results: RegisteredClientSet[] = [];
    for (const [wsSet, topics] of Array.from(this.clients.entries())) {
      const find = topics.find(it => it.target === target);
      if (find) {
        results.push({ ...find, webSocketSet: wsSet });
      }
    }
    return results;
  }

  findClientsByTarget(target: string): RegisteredClientSet {
    for (const [wsSet, topics] of Array.from(this.clients.entries())) {
      const find = topics.find(it => it.target === target);
      if (find) {
        return { ...find, webSocketSet: wsSet };
      }
    }
  }

  removeClientByUUID(uuid: string) {
    for (const [wsSet, topics] of Array.from(this.clients.entries())) {
      const findIndex = topics.findIndex(it => it.uuid === uuid);
      if (findIndex >= 0) {
        topics.splice(findIndex, 1);
        this.clients.set(wsSet, topics);
        // 이벤트 구독도 함께 정리
        this.eventSubscriptions.delete(uuid);
        return true;
      }
    }
    return false;
  }

  findClientByUUID(uuid: string): RegisteredClientSet | undefined {
    for (const [wsSet, topics] of Array.from(this.clients.entries())) {
      const find = topics.find(it => it.uuid === uuid);
      if (find) {
        return { ...find, webSocketSet: wsSet };
      }
    }
    return undefined;
  }

  sendDataByUUID({ uuid, body }: { uuid: string; body?: any }) {
    const client = this.findClientByUUID(uuid);
    if (client) {
      const data: TopicResponse = {
        state: 'success',
        target: client.target,
        uuid: uuid,
        body: body
      };
      this.sendTopic(client.webSocketSet, data);
      return true;
    }
    return false;
  }

  sendUnSubscribeByUUID({ uuid }: { uuid: string }) {
    const client = this.findClientByUUID(uuid);
    if (client) {
      const data: TopicServerEventUnSubscribeRequest = {
        type: 'unsubscribe',
        uuid: uuid
      };
      this.removeClientByUUID(uuid);
      this.sendTopic(client.webSocketSet, data);
      return true;
    }
    return false;
  }

  sendAllDataByTarget({ target, body }: { target: string; body?: any }) {
    const clients = this.findAllClientsByTarget(target);
    clients.forEach(it => {
      const data: TopicResponse = {
        state: 'success',
        target: it.target,
        uuid: it.uuid,
        body: body
      };
      this.sendTopic(it.webSocketSet, data);
    });
    return clients.length;
  }
  sendAllUnSubscribeByTarget({ target }: { target: string }) {
    const clients = this.findAllClientsByTarget(target);
    clients.forEach(it => {
      const data: TopicUnsubscribeRequest = {
        type: 'unsubscribe',
        uuid: it.uuid
      };
      this.removeClientByUUID(it.uuid);
      this.sendTopic(it.webSocketSet, data);
    });
    return clients.length;
  }

  sendEventDataByUUID({ uuid, event, body }: { uuid: string; event: string; body?: any }, config?: { responseCallBack?: EventResponseCallBack }): string | undefined {
    const client = this.findClientByUUID(uuid);
    if (client) {
      const eventUUID = RandomUtils.uuid4();
      const eventTopic: TopicServerEventRequest = {
        type: 'event',
        uuid: uuid,
        // target: client.target,
        eventUUID: eventUUID,
        event: event,
        body: body
      };

      if (config.responseCallBack) {
        this.addEventSubscribes(uuid, eventUUID, config.responseCallBack);
      }
      this.sendTopic(client.webSocketSet, eventTopic);
      return eventUUID;
    }
    return undefined;
  }

  sendEventDataByUUIDPromise<R>({ uuid, event, body }: { uuid: string; event: string; body?: any }, config?: { responseTimeout?: number }): Promise<R> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;
      let eventUUIDForCleanup: string | undefined;

      if (config?.responseTimeout !== undefined) {
        timeoutId = setTimeout(() => {
          if (eventUUIDForCleanup) {
            const subscriptions = this.eventSubscriptions.get(uuid);
            if (subscriptions) {
              subscriptions.delete(eventUUIDForCleanup);
              if (subscriptions.size <= 0) {
                this.eventSubscriptions.delete(uuid);
              }
            }
          }
          reject(new Error('WebSocket event response timeout for UUID: ' + uuid));
        }, config.responseTimeout);
      }

      const eventUUID = this.sendEventDataByUUID(
        { uuid, event, body },
        {
          responseCallBack: (data: any) => {
            if (timeoutId) clearTimeout(timeoutId);
            resolve(data);
          }
        }
      );
      eventUUIDForCleanup = eventUUID;

      if (!eventUUID) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('WebSocket client not found for UUID: ' + uuid));
      }
    });
  }

  async sendEventDataByUUIDPromiseSettled<R>({ uuid, event, body }: { uuid: string; event: string; body?: any }, config?: { responseTimeout?: number }): Promise<PromiseSettledResult<R>> {
    try {
      const value = await this.sendEventDataByUUIDPromise<R>({ uuid, event, body }, config);
      return { status: 'fulfilled', value };
    } catch (reason) {
      return { status: 'rejected', reason };
    }
  }

  sendAllEventDataByTargetPromise<R>({ target, event, body }: { target: string; event: string; body?: any }, config?: { responseTimeout?: number }): Promise<{ body: R; uuid: string }[]> {
    const clients = this.findAllClientsByTarget(target);
    const promises: Promise<{ body: R; uuid: string }>[] = clients.map(it => {
      return this.sendEventDataByUUIDPromise<R>({ uuid: it.uuid, event, body }, config).then(result => ({
        body: result,
        uuid: it.uuid
      }));
    });
    return Promise.all(promises);
  }
  sendAllEventDataByTargetPromiseSettled<R>({ target, event, body }: { target: string; event: string; body?: any }, config?: { responseTimeout?: number }): Promise<PromiseSettledResult<{ body: R; uuid: string }>[]> {
    const clients = this.findAllClientsByTarget(target);
    const promises: Promise<{ body: R; uuid: string }>[] = clients.map(it => {
      return this.sendEventDataByUUIDPromise<R>({ uuid: it.uuid, event, body }, config).then(result => ({
        body: result,
        uuid: it.uuid
      }));
    });
    return Promise.allSettled(promises);
  }

  sendAllEventDataByTarget({ target, event, body }: { target: string; event: string; body?: any }, config?: { responseCallBack?: EventResponseCallBack }) {
    const clients = this.findAllClientsByTarget(target);
    clients.forEach(it => {
      const eventUUID = RandomUtils.uuid4();
      const eventTopic: TopicServerEventRequest = {
        type: 'event',
        uuid: it.uuid,
        // target: it.target,
        eventUUID: eventUUID,
        event: event,
        body: body
      };
      if (config?.responseCallBack) {
        this.addEventSubscribes(it.uuid, eventUUID, config?.responseCallBack);
      }
      this.sendTopic(it.webSocketSet, eventTopic);
    });
    return clients.length;
  }

  private addEventSubscribes(uuid: string, eventUUID: string, eventResponseCallBack: EventResponseCallBack) {
    let eventMap = this.eventSubscriptions.get(uuid);
    if (eventMap) {
      eventMap.set(eventUUID, eventResponseCallBack);
    } else {
      eventMap = new Map();
      eventMap.set(eventUUID, eventResponseCallBack);
      this.eventSubscriptions.set(uuid, eventMap);
    }
  }

  getOpenClients() {
    return Array.from(this.clients.keys()).filter(it => it.socket.readyState === WebSocket.OPEN);
  }

  private isBinaryPayload(value: any) {
    if (!value) {
      return false;
    }
    if (Buffer.isBuffer(value)) {
      return true;
    }
    if (typeof Uint8Array !== 'undefined' && value instanceof Uint8Array) {
      return true;
    }
    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return true;
    }
    if (value && typeof value === 'object' && 'buffer' in value) {
      const bufferValue = (value as any).buffer;
      return Buffer.isBuffer(bufferValue) || bufferValue instanceof Uint8Array || bufferValue instanceof ArrayBuffer;
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

  private buildBinaryTopic(topic: any): Buffer {
    const fileRefs = new Map<any, string>();
    const fileEntries: Array<{ id: string; name: string; mime: string; buffer: Buffer }> = [];
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
      let buffer: Buffer = Buffer.alloc(0);

      if (Buffer.isBuffer(value)) {
        buffer = value;
      } else if (value instanceof Uint8Array) {
        buffer = Buffer.from(value);
      } else if (value instanceof ArrayBuffer) {
        buffer = Buffer.from(value);
      } else if (value && typeof value === 'object' && 'buffer' in value) {
        const fileLike = value as any;
        if (typeof fileLike.name === 'string') {
          name = fileLike.name || name;
        }
        if (typeof fileLike.mime === 'string') {
          mime = fileLike.mime || mime;
        }
        const innerBuffer = fileLike.buffer;
        if (Buffer.isBuffer(innerBuffer)) {
          buffer = innerBuffer;
        } else if (innerBuffer instanceof Uint8Array) {
          buffer = Buffer.from(innerBuffer);
        } else if (innerBuffer instanceof ArrayBuffer) {
          buffer = Buffer.from(innerBuffer);
        }
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

    const payload = replaceFiles(topic.body);
    let offset = 0;
    const files = fileEntries.map(entry => {
      const size = entry.buffer.length;
      const meta = {
        id: entry.id,
        name: entry.name,
        mime: entry.mime,
        size,
        offset
      };
      offset += size;
      return meta;
    });

    const meta = { ...topic, body: payload, files };
    const json = Buffer.from(JSON.stringify(meta), 'utf8');
    const header = Buffer.alloc(4);
    header.writeUInt32LE(json.length, 0);

    const buffers = [header, json, ...fileEntries.map(entry => entry.buffer)];
    return Buffer.concat(buffers);
  }

  private sendTopic(wsSet: WebSocketSet, topic: any) {
    if (this.hasBinaryPayload(topic?.body)) {
      const buffer = this.buildBinaryTopic(topic);
      wsSet.socket.send(buffer, { binary: true });
      return;
    }
    wsSet.socket.send(JSON.stringify(topic), { binary: false });
  }

  private parseBinaryTopic(data: RawData): TopicRequest | undefined {
    let buffer: Buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else if (Array.isArray(data)) {
      buffer = Buffer.concat(data.map(item => (Buffer.isBuffer(item) ? item : Buffer.from(item as any))));
    } else {
      return undefined;
    }

    if (buffer.length < 4) {
      return undefined;
    }

    const jsonLength = buffer.readUInt32LE(0);
    const jsonStart = 4;
    const jsonEnd = jsonStart + jsonLength;
    if (buffer.length < jsonEnd) {
      return undefined;
    }

    const jsonText = buffer.slice(jsonStart, jsonEnd).toString('utf8');
    let meta: any;
    try {
      meta = JSON.parse(jsonText);
    } catch (error) {
      console.warn('Invalid WebSocket binary payload:', error);
      return undefined;
    }

    const filesMeta = Array.isArray(meta.files) ? meta.files : [];
    const fileMap = new Map<string, { name: string; mime: string; size: number; buffer: Buffer }>();
    filesMeta.forEach((file: any) => {
      if (!file || typeof file.id !== 'string' || typeof file.size !== 'number' || typeof file.offset !== 'number') {
        return;
      }
      const start = jsonEnd + file.offset;
      const end = start + file.size;
      if (start < jsonEnd || end > buffer.length) {
        return;
      }
      const slice = buffer.slice(start, end);
      fileMap.set(file.id, {
        name: file.name || 'file',
        mime: file.mime || 'application/octet-stream',
        size: file.size,
        buffer: slice
      });
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

    const body = replaceFileRefs(meta.body);
    return {
      type: meta.type,
      uuid: meta.uuid,
      requestUUID: meta.requestUUID,
      body
    };
  }

  message(wsSet: WebSocketSet, data: { data: RawData; isBinary: boolean }): void {
    let topic: TopicRequest | TopicUnsubscribeRequest | TopicSubscribeRequest | TopicServerEventResponse | undefined;
    if (data.isBinary) {
      topic = this.parseBinaryTopic(data.data);
      if (!topic) {
        return;
      }
    } else {
      try {
        topic = JSON.parse(data.data.toString());
      } catch (error) {
        console.warn('Invalid WebSocket payload:', error);
        return;
      }
    }

    this.subject.next(topic);
    // console.log('WebSocket message received:', topic);
    const uuid = topic.uuid;
    // const client = this.findClientByUUID(uuid);
    // if (!client) return;

    // 구독
    if (topic.type === 'subscribe') {
      try {
        this.setClientTopic(wsSet, topic.uuid, topic.target, topic.body);
      } catch (err: any) {
        const responseTopic: TopicResponse = {
          state: 'error',
          // type: topic.type,
          target: topic.target,
          uuid: topic.uuid,
          body: { message: err.message || 'Error subscribing topic' }
        };
        wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
      }
      return;
      // 구독 해제
    } else if (topic.type === 'unsubscribe') {
      this.removeClientByUUID(uuid);
      return;
    } else if (topic.type === 'event') {
      const subscriptions = this.eventSubscriptions.get(topic.uuid);
      if (subscriptions) {
        const eventCallback = subscriptions.get(topic.eventUUID);
        if (eventCallback) {
          eventCallback(topic.body, wsSet);
          subscriptions.delete(topic.eventUUID);
        }
        if (subscriptions.size <= 0) {
          this.eventSubscriptions.delete(topic.uuid);
        }
      }
      return;
    } else {
      // 실행!!
      // 등록 체크
      const clientTopics = this.findClientByUUID(uuid);
      if (!clientTopics) {
        const responseTopic: TopicResponse = {
          state: 'error',
          uuid: topic.uuid,
          requestUUID: topic.requestUUID,
          target: '',
          body: { message: 'WebSocket client not registered' }
        };
        this.sendTopic(wsSet, responseTopic);
        return;
      }

      const intent = new Intent(clientTopics.target);
      intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
      const webSocketRequest: WebSocketRequest = {
        webSocketSet: wsSet,
        uuid: clientTopics.uuid,
        webSocketManager: this,
        sendEvent: <R>(event: string, body: any, config?: { responseTimeout?: number }) => this.sendEventDataByUUIDPromise<R>({ uuid: clientTopics.uuid, event, body }, config)
      };
      intent.data = [topic.body, webSocketRequest];
      if (topic.type === 'intent') {
        this.intentManager.publishMeta(intent).then(async it => {
          if (it.target.length <= 0) {
            const responseTopic: TopicResponse = {
              state: 'error',
              // type: topic.type,
              target: clientTopics.target,
              uuid: topic.uuid,
              requestUUID: topic.requestUUID,
              body: { message: 'Not found intent target' }
            };
            this.sendTopic(wsSet, responseTopic);
          } else {
            const rdata = it.return[0];
            const wdata = rdata instanceof Promise ? await rdata : rdata;
            const responseTopic: TopicResponse = {
              state: 'success',
              uuid: topic.uuid,
              requestUUID: topic.requestUUID,
              target: clientTopics.target,
              body: wdata
            };
            this.sendTopic(wsSet, responseTopic);
          }
        });
      } else if (topic.type === 'router') {
        this.routerManager.routing(intent).then(async routerModule => {
          const moduleInstance = routerModule.getModuleInstance?.();
          if (routerModule && moduleInstance) {
            if (routerModule.propertyKeys) {
              for (const it of routerModule.propertyKeys) {
                let r = moduleInstance[it]?.(topic.body, webSocketRequest);
                r = r instanceof Promise ? await r : r;
                const responseTopic: TopicResponse = {
                  state: 'success',
                  requestUUID: topic.requestUUID,
                  uuid: topic.uuid,
                  target: clientTopics.target,
                  body: r
                };
                this.sendTopic(wsSet, responseTopic);
              }
            } else {
              const responseTopic: TopicResponse = {
                state: 'error',
                uuid: topic.uuid,
                requestUUID: topic.requestUUID,
                target: clientTopics.target,
                body: { message: 'Not found router target' }
              };
              this.sendTopic(wsSet, responseTopic);
            }
          } else {
            const responseTopic: TopicResponse = {
              state: 'error',
              uuid: topic.uuid,
              requestUUID: topic.requestUUID,
              target: clientTopics.target,
              body: { message: 'Not found router target' }
            };
            this.sendTopic(wsSet, responseTopic);
          }
        });
      }
    }
  }

  private removeAllClientsByWebSocketSet(wsSet: WebSocketSet) {
    const topics = this.clients.get(wsSet);
    if (!topics) {
      return;
    }
    for (const topic of topics) {
      this.eventSubscriptions.delete(topic.uuid);
    }
    this.clients.set(wsSet, []);
  }
}
