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

# Start development server (opens at http://localhost:3002)
pnpm dev

# Or just serve without opening
pnpm serve

# Build for production
pnpm build
```

## Project Structure

```
example/
├── index.html              # Root HTML template
├── index.ts                # Application entry point (SimpleBootFront)
├── webpack.config.cjs      # Webpack configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── src/
    ├── components/        # Reusable components
│   │   ├── item/
│   │   │   ├── item.component.ts
│   │   │   ├── item.html
│   │   │   └── item.css
│   │   └── profile/
│   │       ├── profile.component.ts
│   │       ├── profile.html
│   │       └── profile.css
│   ├── pages/             # Route pages
│   │   ├── home/
│   │   │   ├── home.ts
│   │   │   ├── home.html
│   │   │   └── home.css
│   │   ├── user/
│   │   │   ├── user.ts
│   │   │   ├── user.html
│   │   │   └── user.css
│   │   └── about/
│   │       ├── about.ts
│   │       ├── about.html
│   │       └── about.css
│   ├── services/          # Business logic services
│   │   └── UserService.ts
│   └── types/             # TypeScript declarations
│       └── index.d.ts
├── webpack.config.cjs     # Webpack configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
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
- SPA navigation with `$router.go()`

### 🔄 Lifecycle Hooks
- `OnInitRender` - Called when component is rendered
- `OnDestroyRender` - Called when component is destroyed
- Cleanup and initialization patterns

### 🎨 Template Features
- Reactive data binding with `${@this@.property}$`
- Event handling with `dr-event-click`
- DOM manipulation with `dr-this`
- HTML and CSS module imports

## Project Structure

```
simple-boot-front/example/
├── src/
│   ├── index.html          # Main HTML file
│   ├── index.ts            # Entry point
│   └── examples/           # Example implementations
│       ├── ComponentExample.ts
│       ├── RouterExample.ts
│       ├── DIExample.ts
│       └── LifecycleExample.ts
├── package.json
├── tsconfig.json
└── webpack.config.cjs
```

## Technologies

- **@dooboostore/simple-boot**: Core DI and AOP framework
- **@dooboostore/simple-boot-front**: Web framework integration
- **@dooboostore/dom-render**: DOM rendering utilities
- **TypeScript**: Type-safe development
- **Webpack**: Module bundling and dev server
