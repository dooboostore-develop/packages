# 🚀 @dooboostore: The Ultimate Isomorphic Full-Stack TypeScript Framework

[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**@dooboostore** is not just another utility library. It is a massive, highly-engineered **enterprise-grade full-stack framework** built entirely from scratch. Inspired by the architectural brilliance of **Spring Boot** and **Angular**, it brings powerful Dependency Injection (DI), Aspect-Oriented Programming (AOP), and Reactive DOM rendering into a single, unified TypeScript ecosystem.

Say goodbye to context switching between frontend and backend. With `@dooboostore`, you write your server, SPA (Single Page Application), and SSR (Server-Side Rendering) logic using the exact same Object-Oriented paradigm.

---

## ✨ Key Features

- 🌟 **True Isomorphic Architecture:** Share the same mental model across the entire stack. Use `@Sim` (our IoC container) and `@Inject` on both Node.js and the Browser.
- 💉 **Advanced DI & AOP Container (`simple-boot`):** A fully custom-built Dependency Injection container supporting Singleton/Transient lifecycles, Circular Dependency resolution, and ES6 Proxy-based AOP.
- ⚡ **Surgical Reactive DOM Engine (`dom-render`):** Forget Virtual DOM overhead. We use ES6 `Proxy` to detect state mutations and surgically patch only the exact affected DOM nodes in real-time.
- 🔌 **Next-Gen WebSocket RPC:** Built-in multiplexing protocol that seamlessly packs JSON and Binary data (Files/Blobs) together without Base64 overhead, supporting two-way Promises/RPC over WebSockets.
- 🛠️ **Zero-Compromise OOP:** Embrace robust Object-Oriented Programming principles with heavily utilized Decorators and Reflection metadata.

---

## 📦 Ecosystem Packages

| Package | Description |
|---|---|
| **`@dooboostore/core`** | Zero-dependency foundational utilities — RxJS-like `Observable`/`Subject`, validators, geometry, an HTTP fetcher, and array/object/string/date/math helpers. |
| **`@dooboostore/core-node`** | Node-only utilities extending `core` — filesystem helpers, process/env info, memory profiling, SSR page pre-rendering. |
| **`@dooboostore/core-web`** | Browser-only utilities extending `core` — DOM/event/storage helpers, client-side routers, canvas & animation utils. |
| **`@dooboostore/algorithm`** | Stock/trading domain algorithms — trend & indicator detection (SMA/EMA/MACD/RSI/OBV) and a `TradingSimulator` for backtesting strategies. |
| **`@dooboostore/dom-parser`** | A lightweight, dependency-free server-side DOM implementation (a jsdom alternative) for SSR environments. |
| **`@dooboostore/dom-editor`** | A standalone visual drag-and-drop DOM/HTML editor with JSON import/export. |
| **`@dooboostore/lib-node`** | A Node.js utility for generating random placeholder images via server-side `canvas`. |
| **`@dooboostore/lib-web`** | Canvas-based browser UI widgets — a multi-layer image editor, GPS marker visualization, and polygon image cropping. |
| **`@dooboostore/simple-boot`** | The heart of the framework. A powerful IoC/DI container, AOP proxy manager, and declarative routing decorators. |
| **`@dooboostore/dom-render`** | A reactive, Proxy-based view template engine for DOM manipulation without VDOM. |
| **`@dooboostore/simple-boot-front`** | SPA framework integrating `simple-boot` and `dom-render` (Angular-style development). |
| **`@dooboostore/simple-web-component`** | A lightweight, no-Virtual-DOM front-end framework built directly on native Web Components — reuses `simple-boot`'s DI container with its own decorator + lifecycle-plugin rendering model. |
| **`@dooboostore/simple-web-component-library`** | A UI component library built on `simple-web-component` — chart components (cartesian/stock/radar/bubble/3D) and a range slider. |
| **`@dooboostore/simple-boot-http-server`** | A high-performance Node.js HTTP web server framework with declarative routing and a WebSocket RPC layer. |
| **`@dooboostore/simple-boot-http-server-ssr`** | Seamless SSR (Server-Side Rendering) extension tying the front-end and HTTP server frameworks together. |

---

## 💻 Quick Showcase

Experience the unified DX (Developer Experience). Here is how you write both backend and frontend code using `@dooboostore`.

### 1. Backend: HTTP Server & Dependency Injection
Just like Spring Boot, but in pure TypeScript.

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router, Route } from '@dooboostore/simple-boot/decorators/route/Router';
import { GET } from '@dooboostore/simple-boot-http-server/decorators/MethodMapping';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';

@Sim({ symbol: Symbol.for('UserService') })
export class UserService {
  getUser(id: string) {
    return { id, name: 'John Doe' };
  }
}

@Sim({ using: [UserService] })
@Router({ path: '/api' })
export class UserController {
  // Constructor Injection
  constructor(private userService: UserService) {}

  @Route({ path: '/users' })
  @GET({ res: { contentType: 'application/json' } })
  getUsers(rr: RequestResponse) {
    return this.userService.getUser('1');
  }
}
```

### 2. Frontend: Reactive Component (No Virtual DOM)
Define your logic, HTML, and CSS. The `@dooboostore/dom-render` engine handles surgical DOM updates via Reactive Proxies.

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';

@Sim
@Component({
  selector: 'user-profile',
  template: `
    <div class="profile-card">
      <h2>Hello, \${@this@.user.name}\$!</h2>
      <button dr-event-click="@this@.save()">Save</button>
    </div>
  `,
  styles: [`.profile-card { padding: 20px; border: 1px solid #ccc; }`]
})
export class UserProfileComponent extends ComponentBase {
  // This state is automatically wrapped in a Reactive Proxy!
  user = { name: 'Guest' }; 

  save() {
    alert(`Saved: ${this.user.name}`);
  }
}
```

### 3. Advanced: WebSocket RPC & Binary Multiplexing
Send JSON and Binary Files together over WebSockets with ease. Wait for the server's response using standard `Promises`.

```typescript
// Client-side (Browser)
import { WebSocketClient } from '@dooboostore/simple-boot-http-server/websocket';

const ws = new WebSocketClient('ws://localhost:8080');
const topic = ws.subject('/api/upload');

// Send JSON + Native File Blob without Base64 encoding overhead!
const response = await topic.send({
  metadata: { userId: '123', action: 'upload_avatar' },
  avatar: fileInput.files[0] 
}).toPromise();

console.log('Server replied:', response);
```

---

## 🤝 Contribution
This is an ambitious project pushing the boundaries of what's possible with TypeScript. We welcome contributions, issue reports, and feature requests. 

## 📄 License
All packages in this repository are licensed under the [MIT License](https://opensource.org/licenses/MIT).
