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

    this.connect();
  }

  private get observable() {
    return this._subject.asObservable();
  }

  private connect() {
    if (this.connectionProtocols) {
      this.websocket = new WebSocket(this.connectionUrl, this.connectionProtocols);
    } else {
      this.websocket = new WebSocket(this.connectionUrl);
    }

    this.websocket.addEventListener('open', () => {
      this.isConnected = true;
      this.currentRetryCount = 0; // Reset retry count on successful connection
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
          this.websocket.send(JSON.stringify(subscribeTopic));
        }
      });

      // 대기 중인 모든 메시지 전송
      while (this.pendingMessages.length > 0) {
        const message = this.pendingMessages.shift();
        this.websocket.send(JSON.stringify(message));
      }
    });

    this.websocket.addEventListener('close', event => {
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
      const topic: TopicResponse | TopicServerEventRequest | TopicServerEventUnSubscribeRequest = JSON.parse(event.data.toString());
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

    this.currentRetryCount++;
    console.log(`Attempting to reconnect... (${this.currentRetryCount}/${this.retryConnectionCount})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
      // Subscribe messages are already in pendingMessages and will be sent automatically
    }, this.retryConnectionDelay);
  }

  private sendMessage(message: TopicRequest | TopicUnsubscribeRequest | TopicSubscribeRequest) {
    if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      this.pendingMessages.push(message);
    }
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
          return topicSubject.subscribe(subscriber);
        });
      },
      send: (body?: any) => {
        if (!self.topics.has(uuid) && !isClosed) {
          doSubscribe();
        }
        const requestUUID = RandomUtils.uuid4();
        const value: TopicRequest = { type: option?.type, uuid, requestUUID, body: body };
        self.sendMessage(value);
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
    }
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
