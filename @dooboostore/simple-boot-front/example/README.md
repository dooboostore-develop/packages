# Simple Boot Front Example

A complete example demonstrating the features of `@dooboostore/simple-boot-front` - a powerful web framework combining Simple Boot's DI system with Dom Render's reactive rendering.

## Features

- **Component System**: Create reusable components with dependency injection
- **Router Integration**: Simple-boot routing integrated with DOM rendering
- **Dependency Injection**: Full DI container in browser environment
- **Lifecycle Hooks**: Component lifecycle management

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the webpack dev server (http://localhost:3002, opens the browser)
pnpm dev        # or: pnpm start / pnpm serve

# Build for production
pnpm build
```

## Project Structure

```
example/
├── src/
│   ├── index.html                 # Root HTML template
│   ├── index.ts                   # Entry point (SimpleBootFront, rootRouter: IndexRouterComponent)
│   ├── components/                # Reusable components
│   │   ├── item/item.component.{ts,html,css}
│   │   └── profile/profile.component.{ts,html,css}
│   ├── pages/                     # Route pages
│   │   ├── index.router.component.{ts,html,css}   # @Router: '/', '/user', '/about'
│   │   ├── home/home.route.component.{ts,html,css}
│   │   ├── user/user.route.component.{ts,html,css}
│   │   └── about/about.route.component.{ts,html,css}
│   └── services/
│       └── UserService.ts         # Business logic service
├── package.json
├── tsconfig.json
└── webpack.config.cjs
```

## Features Demonstrated

### 🎯 Component System
- `@Component` decorator with template and styles
- Component-based architecture
- Reusable UI components (Item, Profile)

### 🚀 Dependency Injection
- `@Sim` decorator for service registration
- Constructor injection
- Singleton lifecycle management
- Service composition (UserService)

### 🛣️ Routing
- `@Router` decorator for route configuration
- Multiple route pages (Home, User, About)
- `ComponentRouterBase` for router-enabled components
- SPA navigation with `$router?.go({path: '/user'})`

### 🔄 Lifecycle Hooks
- `onInitRender(param, rawSet)` - Called when the component is rendered (call `super.onInitRender`)
- `onDestroyRender(metaData)` - Called when the component is destroyed
- Cleanup and initialization patterns

### 🎨 Template Features
- Reactive data binding with `${@this@.property}$`
- Event handling with `dr-event-click`
- Routed child rendering with `<dr-this value="${@this@.child}$">`
- HTML and CSS module imports

## Technologies

- **@dooboostore/simple-boot**: Core DI and AOP framework
- **@dooboostore/simple-boot-front**: Web framework integration
- **@dooboostore/dom-render**: DOM rendering utilities
- **TypeScript**: Type-safe development
- **Webpack**: Module bundling and dev server
