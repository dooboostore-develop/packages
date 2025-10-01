# Simple Boot Front Template

A quick start template for Simple Boot Front applications.

## Project Structure

```
src/
├── index.ts                          # Application entry point
├── index.html                        # Main HTML template
├── pages/                            # Router and route pages
│   ├── index.router.component.ts     # Main router (Router + Component)
│   ├── home/
│   │   └── home.route.component.ts   # Home page (Route + Component)
│   └── user/
│       └── user.route.component.ts   # User page (Route + Component)
├── components/                       # Reusable components
│   └── hello.component.ts            # Example component
├── services/                         # Business logic and data services
│   └── UserService.ts                # User data service
└── utils/                            # Utility functions and helpers
    └── dateUtils.ts                  # Date formatting utilities
```

## File Naming Convention

### 1. Router Component (*.router.component.ts)
- **Router** + **Component** role
- Extends `ComponentRouterBase`
- Has `@Router` and `@Component` decorators
- Example: `index.router.component.ts`

### 2. Route Component (*.route.component.ts)
- **Route** + **Component** role  
- Extends `ComponentBase`
- Has `@Component` decorator only
- Used as route target in router
- Example: `home.route.component.ts`, `user.route.component.ts`

### 3. Pure Component (*.component.ts)
- **Component** role only
- Extends `ComponentBase`
- Has `@Component` decorator with selector
- Reusable across pages
- Example: `hello.component.ts`

## Key Concepts

### 1. Router Component (ComponentRouterBase)
Main application router that defines routes:
- `index.router.component.ts` - Main router with navigation
- Has `@Router` decorator to define route mappings
- Manages child route components

### 2. Route Components (ComponentBase)
Page components used as route targets:
- `home.route.component.ts` - Home page
- `user.route.component.ts` - User profile page
- Extends `ComponentBase` (not ComponentRouterBase)

### 3. Pure Components (ComponentBase)
Reusable UI components:
- `hello.component.ts` - Example reusable component
- Components can be used with custom selectors (e.g., `<hello-component>`)

### 3. Services
Business logic and data management:
- `UserService.ts` - Handles user data with DI support
- Use `@Sim({})` decorator for dependency injection

### 4. Scripts
Utility functions and helpers:
- `dateUtils.ts` - Date formatting functions
- Pure TypeScript functions without decorators

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Development Mode
```bash
pnpm dev
```
Runs the app at http://localhost:8081 with hot reload.

### Build for Production
```bash
pnpm build
```
Creates optimized bundle in `dist/` folder.

## Adding New Features

### Add a New Route Page
1. Create `src/pages/about/about.route.component.ts` extending `ComponentBase`
2. Create matching HTML and CSS files
3. Add route in `index.router.component.ts`:
```typescript
@Router({
  route: {
    '/about': AboutRouteComponent  // Add your route here
  }
})
```

### Add a New Pure Component
1. Create `src/components/my.component.ts` extending `ComponentBase`
2. Create matching HTML and CSS files with unique selector
3. Register in `index.router.component.ts`:
```typescript
@Sim({
  using: [MyComponent]  // Add your component here
})
```

### Add a Service
1. Create `src/services/MyService.ts`
2. Add `@Sim({})` decorator
3. Inject in constructor:
```typescript
constructor(private myService: MyService) {}
```

## Learn More

- [Simple Boot Documentation](https://github.com/visualkhh/simple-boot)
- [Simple Boot Front](https://github.com/visualkhh/simple-boot-front)
