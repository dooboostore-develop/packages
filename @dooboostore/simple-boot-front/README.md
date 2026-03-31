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
npx @dooboostore/create-simple-boot-front my-app
cd my-app
npm start
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
	new SimpleBootFrontBundle.SimFrontOption({
		window,
		selector: '#app',
		urlType: SimpleBootFrontBundle.UrlType.path
	})
);
```

## Minimal App Example

```ts
import 'reflect-metadata';
import { Component, SimpleBootFront, SimFrontOption, UrlType } from '@dooboostore/simple-boot-front';

@Component({
	selector: 'home-page',
	template: '<h1>Hello SimpleBootFront</h1>'
})
class HomePage {}

const app = new SimpleBootFront(
	new SimFrontOption({
		window,
		selector: '#app',
		urlType: UrlType.path,
		using: [HomePage]
	})
);

app.run();
```

## Core API

- `SimpleBootFront`
	- Browser runtime bootstrap class.
	- Exposes routing observables and `goRouting(url)` helper.
- `SimFrontOption` / `UrlType`
	- Front runtime option object.
	- Configure `window`, root `selector`, and route strategy (`path` or `hash`).
- `@Component(config)`
	- Registers renderable component metadata (`selector`, `template`, `styles`, `using`, `proxy`).
- `@Script(config)`
	- Registers reusable script functions/classes for template context.
- `ComponentBase`
	- Extends dom-render component base and supports routing callbacks.

## Architecture Notes

- `SimpleBootFront` extends `SimpleApplication` from `@dooboostore/simple-boot`.
- A `DomRender` instance is created and stored in simstance storage.
- Router events from dom-render are translated into SimpleBoot routing flow.
- Root render object is managed by `DomRenderRootObject`.

## Troubleshooting

- `reflect-metadata` must be loaded before decorators are evaluated.
	- Ensure `import 'reflect-metadata'` appears in your app entry.
- Target selector must exist in the current document.
	- `SimFrontOption.selector` defaults to `#app`.
- If path routing does not behave as expected in static hosting, try hash mode.
	- Set `urlType: UrlType.hash`.

## Learn More

The detailed API documentation, including all decorators and usage examples, is available on the documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).