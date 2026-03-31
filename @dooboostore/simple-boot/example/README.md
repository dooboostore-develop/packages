# @dooboostore/simple-boot Examples

Interactive examples demonstrating the key features of the `@dooboostore/simple-boot` framework.

## Features

- **Dependency Injection (DI)**: Manage object lifecycles with `@Sim` decorator  
- **Aspect-Oriented Programming (AOP)**: Add behavior with `@Before`, `@After`, `@Around`
- **Routing System**: Map URLs to controller methods with `@Router` and `@Route`
- **Method Caching**: Cache expensive operations with `@Cache` decorator
- **Intent-based Events**: Decouple components with pub-sub pattern
- **Data Validation**: Validate data with declarative decorators

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Run Examples

```bash
# Run all examples
pnpm start

# Development mode (auto-restart on changes)
pnpm dev
```

## Project Structure

```
src/
├── index.ts                    # Main entry point with interactive menu
├── alert/
│   └── AlertExample.ts        # Alert system demonstrations
├── cache/
│   └── CacheExample.ts        # Method caching examples
├── decorators/
│   └── DecoratorsExample.ts   # AOP with @Before, @After, @Around
├── intent/
│   └── IntentExample.ts       # Event-driven architecture
├── route/
│   └── RouteExample.ts        # Router and routing examples
└── simstance/
    └── SimstanceExample.ts    # Dependency injection examples
```

## Examples Overview

### 1. Simstance (Dependency Injection)
Demonstrates how to use the `@Sim` decorator to:
- Create singleton services (shared instance)
- Create transient services (new instance each time)
- Inject dependencies automatically

**Key Concepts:**
- `@Sim()` decorator for dependency injection
- `SimScope.SINGLETON` vs `SimScope.TRANSIENT`
- `Sim.get()` for retrieving instances

### 2. Decorators (Aspect-Oriented Programming)
Shows how to add behavior to methods without modifying code:
- `@Before`: Execute logic before method
- `@After`: Execute logic after method
- `@Around`: Wrap method execution

**Use Cases:**
- Validation
- Logging
- Performance measurement
- Security checks

### 3. Route (Router System)
Demonstrates URL-to-method mapping:
- `@Router('/path')` for base route
- `@Route('METHOD', '/path')` for endpoints
- Path variables (`:id`)
- Nested routes

**Features:**
- RESTful API design
- Path parameter extraction
- Multiple HTTP methods

### 4. Method Caching
Shows how to cache expensive operations:
- Basic caching with `@Cache()`
- TTL (Time-To-Live) configuration
- Custom cache keys
- Performance benefits

**Benefits:**
- Reduce database calls
- Speed up expensive calculations
- Automatic cache invalidation

### 5. Intent (Event System)
Demonstrates decoupled event system:
- `@IntentSendObserve(EventClass)` for listeners
- `Intent.send(event)` for publishing
- Multiple listeners per event

**Use Cases:**
- User registration workflows
- Order processing pipelines
- Notification systems
- Analytics tracking

### 6. Alert (Alert System)
Shows alert management:
- AlertService for basic alerts
- AlertFactory for custom alerts
- Multiple handlers (console, custom)
- Alert broadcasting and filtering

**Benefits:**
- Centralized alert management
- Custom alert types
- Flexible handler system
- Type-safe alerts

## Example Output

When you run the examples, you'll see:

```
╔════════════════════════════════════════════════════════════════╗
║        @dooboostore/simple-boot Examples                      ║
║  A powerful Node.js framework with DI, AOP, and more          ║
╚════════════════════════════════════════════════════════════════╝

======================================================================

📚 1. Basic Dependency Injection

======================================================================

🔹 Dependency Injection manages object lifecycles and dependencies

Example 1: Singleton Service (same instance everywhere)
  ✓ Added user: Alice
  ✓ Added user: Bob
  → UserService instances are same: true
  → Total users: 2

...
```

## Project Structure

```
example/
├── src/
│   ├── index.ts                    # Main entry point
│   └── examples/
│       ├── BasicDIExample.ts       # Dependency Injection
│       ├── AOPExample.ts           # Aspect-Oriented Programming
│       ├── RouterExample.ts        # Routing System
│       ├── CacheExample.ts         # Method Caching
│       ├── IntentExample.ts        # Event System
│       └── ValidationExample.ts    # Data Validation
├── package.json
├── tsconfig.json
├── webpack.config.cjs
└── README.md
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
