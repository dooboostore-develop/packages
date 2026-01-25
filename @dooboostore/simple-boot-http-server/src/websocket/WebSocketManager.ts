import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { WebSocketEndPoint, WebSocketSet } from '../endpoints/WebSocketEndPoint';
import { RawData, WebSocket } from 'ws';
import { IntentManager } from '@dooboostore/simple-boot/intent/IntentManager';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { Intent, PublishType } from '@dooboostore/simple-boot/intent/Intent';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { Subject } from '@dooboostore/core/message/Subject';
export type WebSocketRequest = {webSocketSet: WebSocketSet, uuid: string, webSocketManager: WebSocketManager, sendEvent: <R>(event: string, body: any, config?:{responseTimeout?: number})=>Promise<R>};
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
  return typeof obj === 'object' && obj !== null &&
    'uuid' in obj && typeof obj.uuid === 'string' &&
    (obj.type === undefined || obj.type === 'intent' || obj.type === 'router') &&
    (obj.body === undefined || true);
};

export const isTopicSubscribeRequest = <T = any>(obj: any): obj is TopicSubscribeRequest<T> => {
  return typeof obj === 'object' && obj !== null &&
    'type' in obj && obj.type === 'subscribe' &&
    'target' in obj && typeof obj.target === 'string' &&
    'uuid' in obj && typeof obj.uuid === 'string' &&
    (obj.body === undefined || true);
};

export const isTopicUnsubscribeRequest = (obj: any): obj is TopicUnsubscribeRequest => {
  return typeof obj === 'object' && obj !== null &&
    'type' in obj && obj.type === 'unsubscribe' &&
    'uuid' in obj && typeof obj.uuid === 'string';
};

export const isTopicResponse = <T = any>(obj: any): obj is TopicResponse<T> => {
  return typeof obj === 'object' && obj !== null &&
    'state' in obj && (obj.state === 'success' || obj.state === 'error') &&
    'target' in obj && typeof obj.target === 'string' &&
    'uuid' in obj && typeof obj.uuid === 'string' &&
    'body' in obj;
};

export const isTopicServerEventRequest = <T = any>(obj: any): obj is TopicServerEventRequest<T> => {
  return typeof obj === 'object' && obj !== null &&
    'type' in obj && obj.type === 'event' &&
    'uuid' in obj && typeof obj.uuid === 'string' &&
    'eventUUID' in obj && typeof obj.eventUUID === 'string' &&
    'event' in obj && typeof obj.event === 'string' &&
    (obj.body === undefined || true);
};

export const isTopicServerEventResponse = <T = any>(obj: any): obj is TopicServerEventResponse<T> => {
  return typeof obj === 'object' && obj !== null &&
    'type' in obj && obj.type === 'event' &&
    'uuid' in obj && typeof obj.uuid === 'string' &&
    'eventUUID' in obj && typeof obj.eventUUID === 'string' &&
    (obj.body === undefined || true);
};

export const isTopicServerEventUnSubscribeRequest = (obj: any): obj is TopicServerEventUnSubscribeRequest => {
  return typeof obj === 'object' && obj !== null &&
    'type' in obj && obj.type === 'unsubscribe' &&
    'uuid' in obj && typeof obj.uuid === 'string';
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

  get observable () {
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

  findAllClientsByTarget(target: string):RegisteredClientSet[] {
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
      client.webSocketSet.socket.send(JSON.stringify(data), { binary: false });
      return true;
    }
    return false;
  }

  sendUnSubscribeByUUID({ uuid  }: { uuid: string }) {
    const client = this.findClientByUUID(uuid);
    if (client) {
      const data: TopicServerEventUnSubscribeRequest = {
        type: 'unsubscribe',
        uuid: uuid,
      };
      this.removeClientByUUID(uuid);
      client.webSocketSet.socket.send(JSON.stringify(data), { binary: false });
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
      it.webSocketSet.socket.send(JSON.stringify(data), { binary: false });
    });
    return clients.length;
  }
  sendAllUnSubscribeByTarget({ target }: { target: string; }) {
    const clients = this.findAllClientsByTarget(target);
    clients.forEach(it => {
      const data: TopicUnsubscribeRequest = {
        type: 'unsubscribe',
        uuid: it.uuid,
      };
      this.removeClientByUUID(it.uuid);
      it.webSocketSet.socket.send(JSON.stringify(data), { binary: false });
    });
    return clients.length;
  }

  sendEventDataByUUID(
    { uuid, event, body }: { uuid: string; event: string; body?: any },
    config?: { responseCallBack?: EventResponseCallBack }
  ) {
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
      client.webSocketSet.socket.send(JSON.stringify(eventTopic), { binary: false });
      return true;
    }
    return false;
  }

  sendEventDataByUUIDPromise<R>(
    { uuid, event, body }: { uuid: string; event: string; body?: any },
    config?: { responseTimeout?: number }
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;

      if (config?.responseTimeout !== undefined) {
        timeoutId = setTimeout(() => {
          reject(new Error('WebSocket event response timeout for UUID: ' + uuid));
        }, config.responseTimeout);
      }

      const success = this.sendEventDataByUUID(
        { uuid, event, body },
        {
          responseCallBack: (data: any) => {
            if (timeoutId) clearTimeout(timeoutId);
            resolve(data);
          }
        }
      );

      if (!success) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('WebSocket client not found for UUID: ' + uuid));
      }
    });
  }

  async sendEventDataByUUIDPromiseSettled<R>(
    { uuid, event, body }: { uuid: string; event: string; body?: any },
    config?: { responseTimeout?: number }
  ): Promise<PromiseSettledResult<R>> {
    try {
      const value = await this.sendEventDataByUUIDPromise<R>({ uuid, event, body }, config);
      return { status: 'fulfilled', value };
    } catch (reason) {
      return { status: 'rejected', reason };
    }
  }

  sendAllEventDataByTargetPromise<R>(
    { target, event, body }: { target: string; event: string; body?: any },
    config?: { responseTimeout?: number }
  ): Promise<{ body: R; uuid: string }[]> {
    const clients = this.findAllClientsByTarget(target);
    const promises: Promise<{ body: R; uuid: string }>[] = clients.map(it => {
      return this.sendEventDataByUUIDPromise<R>({ uuid: it.uuid, event, body }, config).then(result => ({
        body: result,
        uuid: it.uuid
      }));
    });
    return Promise.all(promises);
  }
  sendAllEventDataByTargetPromiseSettled<R>(
    { target, event, body }: { target: string; event: string; body?: any },
    config?: { responseTimeout?: number }
  ): Promise<PromiseSettledResult<{ body: R; uuid: string }>[]> {
    const clients = this.findAllClientsByTarget(target);
    const promises: Promise<{ body: R; uuid: string }>[] = clients.map(it => {
      return this.sendEventDataByUUIDPromise<R>({ uuid: it.uuid, event, body }, config).then(result => ({
        body: result,
        uuid: it.uuid
      }));
    });
    return Promise.allSettled(promises);
  }

  sendAllEventDataByTarget(
    { target, event, body }: { target: string; event: string; body?: any },
    config?: { responseCallBack?: EventResponseCallBack }
  ) {
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
      it.webSocketSet.socket.send(JSON.stringify(eventTopic), { binary: false });
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

  message(wsSet: WebSocketSet, data: { data: RawData; isBinary: boolean }): void {
    if (!data.isBinary) {
      let topic: TopicRequest | TopicUnsubscribeRequest | TopicSubscribeRequest | TopicServerEventResponse;
      try {
        topic = JSON.parse(data.data.toString());
      } catch (error) {
        console.warn('Invalid WebSocket payload:', error);
        return;
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
          // const responseTopic: TopicResponse = {
          //   state: 'error',
          //   uuid: topic.uuid,
          //   body: { message: 'WebSocket client not registered' }
          // };
          // wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
          return;
        }

        const intent = new Intent(clientTopics.target);
        intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
        const webSocketRequest: WebSocketRequest = {
          webSocketSet: wsSet,
          uuid: clientTopics.uuid,
          webSocketManager: this,
          sendEvent: <R>(event: string, body: any, config?: { responseTimeout?: number }) =>
            this.sendEventDataByUUIDPromise<R>({ uuid: clientTopics.uuid, event, body }, config)
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
              wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
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
              wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
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
                  wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
                }
              } else {
                const responseTopic: TopicResponse = {
                  state: 'error',
                  uuid: topic.uuid,
                  requestUUID: topic.requestUUID,
                  target: clientTopics.target,
                  body: { message: 'Not found router target' }
                };
                wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
              }
            } else {
              const responseTopic: TopicResponse = {
                state: 'error',
                uuid: topic.uuid,
                requestUUID: topic.requestUUID,
                target: clientTopics.target,
                body: { message: 'Not found router target' }
              };
              wsSet.socket.send(JSON.stringify(responseTopic), { binary: false });
            }
          });
        }
      }
    }
    // console.log('------h',wsSet.request.headers);
    // wsSet.socket.send(`Ecaho: ${data.data}`, { binary: data.isBinary });
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
