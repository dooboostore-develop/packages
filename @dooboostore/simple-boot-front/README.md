# @dooboostore/simple-boot-front

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-boot-front.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-boot-front)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


`@dooboostore/simple-boot-front` is the browser-side runtime for DoobooStore applications.
It combines:

- `@dooboostore/simple-boot` for DI, routing, modules, and lifecycle
- `@dooboostore/dom-render` for component rendering and template bindings
- `@dooboostore/core-web` routers for path/hash navigation

---

## Why This Package

- Component-first SPA runtime with decorator metadata.
- Root-level API exports for standard app usage.
- Bundle entry support for bundlers that prefer a single explicit subpath.
- Router lifecycle streams (`routingStartObservable`, `routingEndObservable`) for integration points.
- Compatibility with path and hash routing via `SimFrontOption`.

## Quick Start

```bash
npm init @dooboostore/simple-boot-front my-app
cd my-app
npm install
npm run dev
```

## Installation

```bash
pnpm add @dooboostore/simple-boot-front reflect-metadata
```

## Import Guide

Root import (recommended for normal library usage):

```ts
import {
	SimpleBootFront,
	SimFrontOption,
	UrlType,
	Component,
	Script,
	ComponentBase
} from '@dooboostore/simple-boot-front';
```

Bundle entry import (explicit bundle-style contract):

```ts
import * as SimpleBootFrontBundle from '@dooboostore/simple-boot-front/bundle-entry';

const app = new SimpleBootFrontBundle.SimpleBootFront(
	new SimpleBootFrontBundle.SimFrontOption(
		{ window, selector: '#app', urlType: SimpleBootFrontBundle.UrlType.path },
		{ rootRouter: IndexRouterComponent }
	)
);
```

## Minimal App Example

```ts
import 'reflect-metadata';
import { Sim, Router } from '@dooboostore/simple-boot';
import { Component, ComponentBase, ComponentRouterBase, SimpleBootFront, SimFrontOption, UrlType } from '@dooboostore/simple-boot-front';

@Sim
@Component({ template: '<h1>Hello SimpleBootFront</h1>' })
class HomePage extends ComponentBase {}

@Sim
@Router({ path: '', route: { '/': HomePage } })
@Component({ template: '<main><dr-this value="${@this@.child}$"></dr-this></main>' })
class IndexRouterComponent extends ComponentRouterBase {}

const app = new SimpleBootFront(
	new SimFrontOption(
		{ window, selector: '#app', urlType: UrlType.path },
		{ rootRouter: IndexRouterComponent } // 2nd arg: simple-boot InitOptionType
	)
);

app.run();
```

## Core API

- `SimpleBootFront`
	- Browser runtime bootstrap class (extends `SimpleApplication` from `@dooboostore/simple-boot`).
	- `run(otherInstanceSim?, url?)` bootstraps the app; `goRouting(url)` / `routingRouterModule(url)` navigate programmatically.
	- `routingObservable` / `routingStartObservable` / `routingEndObservable` — observe routing transitions (`{ triggerPoint, domRenderRouter, routerModule }`).
	- `getSimstanceManager()` exposes the underlying DI container.
	- SSR data hydration helpers used together with `@dooboostore/simple-boot-http-server-ssr`: `saveDataHydration(key, data)`, `getDataHydration(key)`, `cutDataHydration(key)` (read-and-remove), `deleteDataHydration(key)`, `clearDataHydration()`, `writeDataHydration()` (serializes pending hydration data into a `<script>` tag).
- `SimFrontOption` / `UrlType`
	- Front runtime option object.
	- `new SimFrontOption(config, initSimOption?)`: `config` sets `window`, root `selector` (default `#app`), route strategy (`urlType: UrlType.path | UrlType.hash`, default `path`), and `using`; `initSimOption` is simple-boot's `InitOptionType` (`rootRouter`, `advice`, `cache`, ...). `rootRouter` is the top-level `@Router` component.
- `@Component(config)` (alias: `@component`)
	- Registers renderable component metadata: `selector` (defaults to the lowercased class name), `template`, `styles`, `using`, `proxy`, and `noStrip` (keep the host element instead of stripping it).
	- Can also be used bare (`@Component` with no config).
- `@Script(config?)` (alias: `@script`)
	- Registers a class extending `ScriptRunnable` (implements `run(...args)`) under a name (defaults to the class name) so templates/other components can invoke it as a script function.
- `ComponentBase`
	- Extends dom-render's `ComponentBase` and implements `RouterAction.OnRouting` with a default no-op `onRouting`.
- `ComponentRouterBase`
	- Router-aware component base (extends dom-render's `ComponentRouterBase`). Implements `canActivate`/`onRouting` to swap in the routed child component, and exposes `getPathData<T>()` for the current route's path data.
- `ComponentSet`
	- Wraps an arbitrary object together with its `@Component` template/styles (extends dom-render's `ComponentSet`) — used internally when swapping routed components.
- Lifecycle interfaces: `OnInitedChild` (`onInitedChild(): void`), `OnFinish` (`onFinish(): void`), `onChangedRender` (`onChangedRender(): void`) — implement on a component to hook into these lifecycle points.
- Namespace re-exports: importing from the package root also gives you `Core`, `CoreWeb`, `DomRender`, `SimpleBoot` (namespaced re-exports of `@dooboostore/core`, `@dooboostore/core-web`, `@dooboostore/dom-render`, `@dooboostore/simple-boot`), so you don't need to add those as separate dependencies just to reach a type or utility.

## Architecture Notes

- `SimpleBootFront` extends `SimpleApplication` from `@dooboostore/simple-boot`.
- A `DomRender` instance is created and stored in simstance storage.
- Router events from dom-render are translated into SimpleBoot routing flow.
- Root render object is managed by `DomRenderRootObject`.

## Troubleshooting

- `reflect-metadata` must be loaded before decorators are evaluated.
	- The package root imports it, but add `import 'reflect-metadata'` to your entry when importing from subpaths.
- Target selector must exist in the current document.
	- `SimFrontOption.selector` defaults to `#app`.
- If path routing does not behave as expected in static hosting, try hash mode.
	- Set `urlType: UrlType.hash`.

## Learn More

The detailed API documentation, including all decorators and usage examples, is available on the documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).