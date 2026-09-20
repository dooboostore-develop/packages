# WebSocket Guide

This document describes the WebSocket protocol used by `@dooboostore/simple-boot-http-server` and how to send/receive files.

## Concepts

- Topic subscription uses a `uuid` to identify a client topic.
- Request/response uses `requestUUID` for correlation.
- Server events use `type: "event"` and include an `eventUUID`.
- File transfer is supported by a binary frame format (JSON + raw bytes).

## Message Types

### Subscribe

```json
{
  "type": "subscribe",
  "uuid": "<uuid>",
  "target": "/api/test",
  "body": { "any": "data" }
}
```

### Unsubscribe

```json
{
  "type": "unsubscribe",
  "uuid": "<uuid>"
}
```

### Request

```json
{
  "type": "intent" | "router",
  "uuid": "<uuid>",
  "requestUUID": "<requestUUID>",
  "body": {"payload": true}
}
```

### Response

```json
{
  "state": "success" | "error",
  "uuid": "<uuid>",
  "requestUUID": "<requestUUID>",
  "target": "/api/test",
  "body": {"result": true}
}
```

### Event

```json
{
  "type": "event",
  "uuid": "<uuid>",
  "eventUUID": "<eventUUID>",
  "event": "event-name",
  "body": { "payload": true }
}
```

## Binary File Frame

Binary frames carry JSON metadata followed by one or more raw files.

```
[4 bytes jsonLength][json bytes][file1 bytes][file2 bytes]...
```

The JSON metadata format is:

```json
{
  "type": "intent" | "router" | "event",
  "uuid": "<uuid>",
  "requestUUID": "<requestUUID>",
  "body": {
    "office": {
      "photo": {"$file": "f1"}
    }
  },
  "files": [
    {"id": "f1", "name": "a.png", "mime": "image/png", "size": 12345, "offset": 0}
  ]
}
```

Server/client code expands `{"$file":"f1"}` into a file object:

- Client: `File` when available.
- Server: `{ name, mime, size, buffer }`.

## Client Usage

`WebSocketClient` ships as its own standalone browser bundle (not through the package's `exports` map), so it's loaded with a plain `<script>` tag rather than an import:

```html
<script src="./node_modules/@dooboostore/simple-boot-http-server/dist/umd-bundle/websocket-client.umd.js"></script>
<script>
  const { WebSocketClient } = dooboostoreSimpleBootHttpServerWebSocketClient;

  const ws = new WebSocketClient('http://localhost:8080', {
    retryConnectionCount: Number.MAX_SAFE_INTEGER,
    retryConnectionDelay: 1000
  });

  const subject = ws.subject('Symbol.for(UserService)://say', { type: 'intent' });

  const subscription = subject.observable.subscribe({
    next: data => {
      console.log('received', data);
    }
  });

  // Regular JSON payload
  subject.send({ ww: 'zz' });

  // Payload with file(s)
  const input = document.querySelector('input[type="file"]');
  const files = Array.from(input.files || []);
  subject.send({
    name: 'zz',
    office: { photo: files[0] },
    attachments: files
  });

  // subscription.unsubscribe() only tears down the LOCAL RxJS-style subscription
  // (it stops delivering to this particular `next`/`error` callback pair).
  // To actually unregister the topic on the server and free its uuid, call
  // the object returned by ws.subject(...) itself:
  subject.unsubscribe();
</script>
```

## Server Usage

```ts
say(message: any) {
  console.log('UserService says:', message);
  const buffer = Buffer.from('hello binary world', 'utf8');
  return {
    m: 'ok',
    office: {
      photo: {
        name: 'greeting.txt',
        mime: 'text/plain',
        size: buffer.length,
        buffer
      }
    }
  };
}
```

## Reconnect Behavior

- Auto reconnect is enabled by configuring `retryConnectionCount` and `retryConnectionDelay`.
- Pending queues are bounded by `maxPendingMessages` and `maxPendingBinaryMessages`.
- Reconnect re-subscribes active topics.
