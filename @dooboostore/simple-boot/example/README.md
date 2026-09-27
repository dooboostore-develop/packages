# @dooboostore/simple-boot Examples

Interactive examples demonstrating the key features of the `@dooboostore/simple-boot` framework.

## Features

- **Dependency Injection (DI)**: Manage object lifecycles with the `@Sim` decorator
- **Exception Handling**: Route thrown errors to `@ExceptionHandler` methods
- **Routing System**: Declare routes with `@Router` and `@Route`
- **Method Caching**: Cache expensive operations with the `@Cache` decorator
- **Intent-based Events**: Publish intents by URI, scheme, or symbol
- **Alert System**: `AlertType` and the `AlertService`/`AlertFactory` architecture

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Run Examples

```bash
# Build with webpack and run the interactive menu (@clack/prompts)
pnpm start

# Development mode (webpack --watch + nodemon restart on dist changes)
pnpm dev

# Production build
pnpm build
```

## Project Structure

```
example/
├── src/
│   ├── index.ts                     # Entry point with interactive menu
│   ├── alert/AlertExample.ts        # Alert types and architecture
│   ├── cache/CacheExample.ts        # Method caching
│   ├── decorators/DecoratorsExample.ts  # @ExceptionHandler, @PostConstruct
│   ├── intent/IntentExample.ts      # Intent publishing
│   ├── route/RouteExample.ts        # @Router / @Route
│   └── simstance/SimstanceExample.ts    # Dependency injection
├── package.json
├── tsconfig.json
└── webpack.config.cjs
```

## Examples Overview

### 1. Simstance (Dependency Injection)
- Singleton services (default): `@Sim`
- Transient services (new instance per resolve): `@Sim({ scope: Lifecycle.Transient })`
- Constructor injection (`NotificationService` receives `UserService`)
- Resolve instances with `app.sim(Type)`

### 2. Decorators (Exception Handling)
- `@ExceptionHandler({ type: PaymentError })`, `{ type: ValidationError }`, `{ type: Error }` on a global handler `@Sim`
- `@PostConstruct` for initialization after construction

### 3. Route (Router System)
- `@Router({ path: '/user' })` / `@Router({ path: '/product' })` for base paths
- `@Route({ path: '/list' })`, `@Route({ path: '/detail' })` for method routes
- Registered routes: `/user/list`, `/user/get`, `/product/list`, `/product/detail`

### 4. Method Caching
- `@Cache({ key: (userId: string) => `user-${userId}` })` for custom keys
- `ms` for TTL (e.g. `ms: 5000`)
- Repeated calls with the same arguments skip the method body

### 5. Intent (Event System)
Publishes through `app.getIntentManager().publish(...)`:
- URI-based: `new Intent('/user/created', data)`
- Scheme-based: `new Intent('myapp://order/placed', data)`
- Symbol-based: `new Intent({ symbol: Symbol.for('payment'), uri: '/processed' }, data)`
- Plain string: `intentManager.publish('/api/hello', data)`

### 6. Alert (Alert System)
- Lists `AlertType` values (`DANGER`, `SUCCESS`, `INFO`, `WARNING`, `ERROR`, `PROGRESS`)
- Explains how `AlertService`, `AlertFactory`, `Alert`, and `AlertAction` fit together

## Example Output

`pnpm start` shows a menu (`Select an example to run:`). Selecting the Simstance example prints, roughly:

```
 Simstance (DI Container) Example
==================================================

1️⃣  Singleton Pattern
   Getting UserService instances...
  [UserService] Created (singleton - only once)
   Are they the same instance? ✅ Yes (Singleton)

2️⃣  Transient Pattern
   ...
```

## Learn More

- **NPM Package**: [@dooboostore/simple-boot](https://www.npmjs.com/package/@dooboostore/simple-boot)
- **GitHub**: [dooboostore-develop/packages](https://github.com/dooboostore-develop/packages)

## Tips

- Each example is self-contained and demonstrates a specific feature
- Examples use console output to show what's happening
- Try modifying the examples to experiment with different configurations
- Check the inline comments for detailed explanations

## License

MIT
