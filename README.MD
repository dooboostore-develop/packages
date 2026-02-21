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
| **`@dooboostore/simple-boot`** | The heart of the framework. A powerful IoC/DI container and AOP proxy manager. |
| **`@dooboostore/dom-render`** | A reactive, Proxy-based view template engine for DOM manipulation without VDOM. |
| **`@dooboostore/simple-boot-front`** | SPA framework integrating `simple-boot` and `dom-render` (Angular-style development). |
| **`@dooboostore/simple-boot-http-server`** | A high-performance Node.js HTTP web server framework with built-in Router & Intent system. |
| **`@dooboostore/simple-boot-http-server-ssr`** | Seamless SSR (Server-Side Rendering) extension for the HTTP server. |
| **`@dooboostore/core` / `core-node` / `core-web`** | Deep foundational utilities (Reflection, Observables, Byte manipulation) split by environment. |
| **`@dooboostore/dom-parser` / `dom-editor`** | Advanced tools for parsing HTML to AST and manipulating DOM structures natively. |

---

## 💻 Quick Showcase

Experience the unified DX (Developer Experience). Here is how you write both backend and frontend code using `@dooboostore`.

### 1. Backend: HTTP Server & Dependency Injection
Just like Spring Boot, but in pure TypeScript.

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { Route, Get } from '@dooboostore/simple-boot-http-server/decorators/Route';

@Sim()
export class UserService {
  getUser(id: string) {
    return { id, name: 'John Doe' };
  }
}

@Sim()
@Route({ path: '/api/users' })
export class UserController {
  // Constructor Injection
  constructor(private userService: UserService) {}

  @Get({ path: '/:id' })
  async getUserProfile(req: RequestResponse) {
    const userId = req.pathParams.id;
    return this.userService.getUser(userId);
  }
}
```

### 2. Frontend: Reactive Component (No Virtual DOM)
Define your logic, HTML, and CSS. The `@dooboostore/dom-render` engine handles surgical DOM updates via Reactive Proxies.

```typescript
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';

@Sim()
@Component({
  template: `
    <div class="profile-card">
      <h2>Hello, \${ this.user.name }\$!</h2>
      <input type="text" dr-value="@this@.user.name" />
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
