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

```html
<script>
  const ws = new WebSocketClient('http://localhost:8080', {
    retryConnectionCount: Number.MAX_SAFE_INTEGER,
    retryConnectionDelay: 1000
  });

  const subject = ws.subject('Symbol.for(UserService)://say', { type: 'intent' });

  subject.observable.subscribe({
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
</script>
```

## Server Usage

```ts
say(message: any) {
  console.log('UserService says:', message);
  return {
    m: 'ok',
    office: {
      photo: {
        name: 'favicon.png',
        mime: 'image/png',
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
