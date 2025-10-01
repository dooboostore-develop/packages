# Simple Boot HTTP Server SSR Templatesimple-boot-http-server-ssr default-template-webpack

A Server-Side Rendering (SSR) template for Simple Boot HTTP Server with integrated front-end SPA framework.

## 🚀 Quick Start

### Install Dependencies
```bash
pnpm install
```

### Development Mode

#### Option 1: Full Development (Frontend + Backend with Watch)
```bash
# Terminal 1: Frontend with webpack-dev-server
pnpm frontend:dev

# Terminal 2: Backend with hot reload
pnpm backend:build:watch
```

#### Option 2: Build and Run
```bash
# Build both frontend and backend
pnpm build

# Start the SSR server
pnpm start
```

### Production Build
```bash
# Build optimized bundles
pnpm build

# Start production server
pnpm backend:start
```

## 📁 Project Structure

```
.
├── back-end/              # Backend HTTP Server (Node.js)
│   ├── index.ts           # Server entry point with SSR configuration
│   ├── root.router.ts     # Root router configuration
│   ├── api/               # API endpoints
│   │   └── ApiRrouter.ts  # REST API routes
│   ├── advices/           # Global advice/middleware
│   │   └── GlobalAdvice.ts
│   ├── endpoints/         # Logging endpoints
│   ├── environments/      # Backend environment config
│   └── service/           # Backend services
│
├── front-end/             # Frontend SPA (Browser)
│   ├── index.html         # HTML template
│   ├── index.ts           # Frontend entry point
│   ├── assets/            # Static assets (images, css, etc)
│   ├── environments/      # Frontend environment config
│   └── service/           # Frontend services
│
├── src/                   # Shared Code (SSR + Client)
│   ├── bootfactory.ts     # SSR factory for creating SimpleBootFront instances
│   ├── component/         # Shared components
│   │   └── hello/         # Example component
│   ├── pages/             # Page components
│   │   ├── index.router.component.ts   # Main router
│   │   └── index.component.ts          # Home page
│   ├── service/           # Shared services (SSR + Client)
│   │   └── TalkService.ts
│   └── environments/      # Shared environment config
│
└── types/                 # TypeScript type definitions
```

## 🔑 Key Concepts

### 1. Server-Side Rendering (SSR)
The server pre-renders React-like components on the server and sends HTML to the client for faster initial load and better SEO.

**SSR Flow:**
```
Client Request → Backend Server → SSR Factory → Render HTML → Send to Client
```

**Configuration in `back-end/index.ts`:**
```typescript
const ssrOption: FactoryAndParams = {
  frontDistPath: environment.frontDistPath,
  frontDistIndexFileName: environment.frontDistIndexFileName,
  factorySimFrontOption: (window: any) => MakeSimFrontOption(window),
  factory: Factory as SimpleBootHttpSSRFactory,
  using: [...services],
  ssrExcludeFilter: (rr) => /^\/api\//.test(rr.reqUrl), // API routes bypass SSR
  poolOption: { max: 50, min: 5 }
};
```

### 2. Shared Code (`src/`)
Code in `src/` folder runs on **both server (SSR) and client (browser)**:
- **Components**: Rendered on server first, then hydrated on client
- **Services**: Business logic shared between server and client
- **Pages**: Route components with SSR support

### 3. Backend API (`back-end/api/`)
RESTful API endpoints that are **excluded from SSR**:
```typescript
@Router({ path: '/api' })
export class ApiRrouter {
  @Route({ path: '/hello' })
  @GET({ res: { header: { [HttpHeaders.ContentType]: Mimes.ApplicationJson } } })
  worlds(rr: RequestResponse): any {
    return { hello: 'hello api router', date: new Date().toISOString() }
  }
}
```

### 4. Frontend Assets (`front-end/assets/`)
Static files served by `ResourceFilter`:
- Images, CSS, JavaScript bundles
- robots.txt, favicon, etc.
- Bypasses SSR for performance

## 🛠️ Available Scripts

### Frontend
- `pnpm frontend:dev` - Start webpack-dev-server with hot reload
- `pnpm frontend:build` - Build frontend bundle
- `pnpm frontend:build:watch` - Build with watch mode
- `pnpm frontend:start` - Serve built frontend with http-server

### Backend
- `pnpm backend:build` - Build backend bundle
- `pnpm backend:build:watch` - Build with watch mode and auto-restart
- `pnpm backend:start` - Start backend server
- `pnpm backend:inspect:run` - Start with Node.js inspector

### Combined
- `pnpm build` - Build both frontend and backend
- `pnpm start` - Build and start server

### Development Workflows
- `pnpm backend:build:no_sync:watch` - Backend only (no SSR sync)
- `pnpm backend:build:only_sync:watch` - SSR sync only

## 🎨 Creating New Features

### Add a New API Endpoint
1. Create `back-end/api/MyRouter.ts`:
```typescript
@Sim
@Router({ path: '/api/my' })
export class MyRouter {
  @Route({ path: '/data' })
  @GET()
  getData(rr: RequestResponse): any {
    return { data: 'my data' };
  }
}
```

2. Register in `back-end/root.router.ts`:
```typescript
@Router({
  routers: [ApiRrouter, MyRouter]  // Add your router
})
```

### Add a New Page Component
1. Create `src/pages/about.component.ts`:
```typescript
@Sim({ scope: Lifecycle.Transient })
@Component({ template, styles })
export class AboutComponent extends ComponentBase {
  constructor() {
    super();
  }
}
```

2. Add route in `src/pages/index.router.component.ts`:
```typescript
@Router({
  route: {
    '/': IndexComponent,
    '/about': AboutComponent  // Add your route
  }
})
```

### Add a Shared Service
1. Create `src/service/MyService.ts`:
```typescript
@Sim
export class MyService {
  static SYMBOL = Symbol('MyService');
  
  async fetchData() {
    // Works on both server and client
    return { data: 'shared data' };
  }
}
```

2. Inject in components:
```typescript
constructor(
  @Inject({ symbol: MyService.SYMBOL }) private myService: MyService
) {}
```

## 🌐 Environment Configuration

### Backend (`back-end/environments/environment.ts`)
```typescript
export const environment = {
  httpServerConfig: { listen: { port: 8080 } },
  frontDistPath: 'dist-front-end',
  frontDistIndexFileName: 'index.html'
};
```

### Frontend (`front-end/environments/environment.ts`)
```typescript
export const environment = {
  apiBaseUrl: '/api',
  production: false
};
```

### Shared (`src/environments/environment.ts`)
```typescript
export const environment = {
  appName: 'Simple Boot SSR App',
  version: '1.0.0'
};
```

## 🔍 SSR vs Client-Side Rendering

| Feature | SSR (Server) | CSR (Client) |
|---------|--------------|--------------|
| **Initial Load** | Fast (pre-rendered HTML) | Slow (JS download + render) |
| **SEO** | Excellent (crawlers see HTML) | Limited (needs JS execution) |
| **Interactivity** | After hydration | Immediate after load |
| **Server Load** | Higher (renders per request) | Lower (static files) |
| **Use Case** | Public pages, SEO-critical | Dashboards, apps |

## 📊 Performance Tips

1. **Exclude API routes from SSR** (already configured):
```typescript
ssrExcludeFilter: (rr) => /^\/api\//.test(rr.reqUrl)
```

2. **Use ResourceFilter for static assets** (already configured):
```typescript
const resourceFilter = new ResourceFilter(environment.frontDistPath, [
  '\.js$', '\.css$', '\.png$', '\.ico$'  // Bypass SSR
]);
```

3. **Configure SSR pool size** based on traffic:
```typescript
poolOption: { max: 50, min: 5 }  // Adjust for your needs
```

4. **Use Transient scope** for page components:
```typescript
@Sim({ scope: Lifecycle.Transient })  // Creates new instance per request
```

## 🐛 Debugging

### Backend Inspector
```bash
pnpm backend:inspect:run
```
Open `chrome://inspect` in Chrome to debug.

### Frontend Dev Tools
```bash
pnpm frontend:dev
```
Open browser DevTools (F12) as usual.

### SSR Debugging
Check server console for SSR rendering logs and errors.

## 📚 Learn More

- [Simple Boot Documentation](https://github.com/visualkhh/simple-boot)
- [Simple Boot Front](https://github.com/visualkhh/simple-boot-front)
- [Simple Boot HTTP Server](https://github.com/visualkhh/simple-boot-http-server)
- [Simple Boot HTTP Server SSR](https://github.com/visualkhh/simple-boot-http-server-ssr)

## 🎯 What's Included

✅ Server-Side Rendering (SSR) with pooling  
✅ RESTful API with decorators  
✅ Hot reload for both frontend and backend  
✅ Shared code between server and client  
✅ TypeScript with full type safety  
✅ Webpack bundling for all targets  
✅ Static asset serving  
✅ Environment configuration  
✅ Dependency injection  
✅ Component-based architecture  

---

**Happy Coding! 🚀**
