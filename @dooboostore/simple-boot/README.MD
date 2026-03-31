# @dooboostore/simple-boot

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


A decorator-driven application framework for TypeScript services with DI container, routing, intent events, lifecycle hooks, caching, and exception handling.

---

## Features

- Dependency injection with `@Sim` and runtime resolution through `SimpleApplication`.
- Constructor parameter injection with `@Inject`.
- Routing decorators (`@Router`, `@Route`) and route manager integration.
- Intent publish/subscribe architecture for decoupled workflows.
- Method-level caching with `@Cache` (key, delete, set, children-key strategies).
- Lifecycle/event/exception decorators for robust service orchestration.
- Root-first exports and explicit `bundle-entry` support.

## Quick Start

```bash
npm install @dooboostore/simple-boot
```

## Import Guide

### Root import (recommended)

```typescript
import { SimpleApplication, Sim, Inject, Router, Route } from '@dooboostore/simple-boot';
```

### Bundle entry import

```typescript
import { SimpleApplication } from '@dooboostore/simple-boot/bundle-entry';
```

## Core Architecture

simple-boot is centered around `SimpleApplication`.

- `SimpleApplication` owns container/runtime managers.
- `SimstanceManager` manages registered sims and proxies.
- `RouterManager` handles route resolution.
- `IntentManager` handles event-like intent publish/subscribe.

## Quick Start Example

```typescript
import 'reflect-metadata';
import {
	SimpleApplication,
	Sim,
	Inject,
	Router,
	Route,
	Cache
} from '@dooboostore/simple-boot';

@Sim()
class UserRepository {
	findById(id: string) {
		return { id, name: 'dooboostore' };
	}
}

@Sim()
class UserService {
	constructor(@Inject() private readonly repo: UserRepository) {}

	@Cache({ key: (id: string) => `user:${id}`, ms: 30000 })
	getUser(id: string) {
		return this.repo.findById(id);
	}
}

@Sim()
@Router({ path: '/users' })
class UserController {
	constructor(@Inject() private readonly userService: UserService) {}

	@Route({ path: '/:id' })
	detail(intent: any) {
		const id = intent?.pathVariable?.id ?? 'unknown';
		return this.userService.getUser(id);
	}
}

const app = new SimpleApplication();
app.run();

const userService = app.getInstance(UserService);
console.log(userService.getUser('100'));
```

## Public API Surface (Root)

- `SimpleApplication`, `SimOption`
- `alert/*`, `cache/*`, `decorators/*`, `errors/*`, `fetch/*`
- `intent/*`, `lifecycle/*`, `proxy/*`, `route/*`, `simstance/*`, `throwable/*`, `types/*`
- `Core` namespace re-export from `@dooboostore/core/bundle-entry`

## Common Patterns

### 1) Resolve instance from container

```typescript
const app = new SimpleApplication();
app.run();

const service = app.getInstance(MyService);
```

### 2) Intent publish

```typescript
await app.publishIntent({ path: '/domain/user/created' }, { id: 'u-1' });
```

### 3) Route invoke

```typescript
const result = await app.routing('/users/100');
console.log(result);
```

### 4) SimOption customization

```typescript
import { SimpleApplication, SimOption } from '@dooboostore/simple-boot';

const app = new SimpleApplication(
	new SimOption({
		cache: { enable: true, ms: 60000 }
	})
);

app.run();
```

## Best Practices

- Import `reflect-metadata` once at application bootstrap.
- Prefer root imports from `@dooboostore/simple-boot`.
- Register services with `@Sim` and resolve through `SimpleApplication`.
- Keep route handlers thin and delegate business logic to service sims.
- Use explicit cache keys in `@Cache` for predictable invalidation.

## Troubleshooting

**Issue:** DI target resolves as `undefined`  
**Solution:** verify class is decorated with `@Sim` and app has executed `run()`.

**Issue:** Decorators not working in runtime  
**Solution:** ensure `reflect-metadata` is imported before decorated classes are evaluated.

**Issue:** Cache not applied  
**Solution:** check `SimOption.cache.enable` and verify method is invoked through managed instance.

**Issue:** Routing not matched  
**Solution:** verify `@Router({ path })` + `@Route({ path })` path composition and run sequence.

## Learn More

The detailed API documentation, including all decorators and usage examples, is available on our documentation website.

## Related Packages

- [@dooboostore/core](https://www.npmjs.com/package/@dooboostore/core)
- [@dooboostore/core-node](https://www.npmjs.com/package/@dooboostore/core-node)
- [@dooboostore/simple-boot-http-server](https://www.npmjs.com/package/@dooboostore/simple-boot-http-server)
- [@dooboostore/simple-boot-front](https://www.npmjs.com/package/@dooboostore/simple-boot-front)

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
