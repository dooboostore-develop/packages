# @dooboostore/simple-web-component (SWC) — Architecture

> This document covers internal design and implementation structure. For API usage, see [README.md](./README.md).

## 1. Overview

SWC is a lightweight framework for building SPAs with Web Components, **without a Virtual DOM**.

- **Declarative decorators** express component definition, rendering, events, state, DI, routing, and messaging.
- Decorators only **declare**; the actual execution is performed by `elementDefine`, which consumes the collected **metadata** — a **metadata-driven** design.
- A **dual-DOM rendering strategy**: static shell in the **shadow DOM**, dynamic content in the **light DOM**.
- Built on `@dooboostore/simple-boot` (DI) + `@dooboostore/core-web` (`ElementApply` / `Router`).

## 2. Module Layer Structure

```
src/
├── index.ts                  # barrel exports + default export (runs defineSwcAppAll)
├── config/config.ts          # HTML tag / event name / browser global lists (SSR detection)
├── types/index.ts            # shared types: HostSet/HelperSet/SpecialSelector/SwcRootType
├── utils/Utils.ts            # DOM creation utilities + SwcUtils (host resolution, marker preprocessing)
├── SwcAppEngine.ts           # simple-boot DI + Router integration engine
├── elements/
│   ├── SwcApp.ts             # defines swc-app / swc-app-body / swc-app-div ...
│   └── SwcAppMixin.ts        # Mixin granting SWC App capabilities to any HTMLElement
├── router/ElementRouter.ts   # element router with its own internal history stack
└── decorators/               # 17 metadata-collecting / execution-wrapping decorators
```

Dependency direction (top → bottom):

```
decorators/*  ──(declare: record via Reflect.metadata)──►  elementDefine.ts (execution engine)
elementDefine ──(consume: iterate metadata / lifecycle)──►  core-web's ElementApply / core's FunctionUtils
SwcAppEngine  ──(integrate)──►  simple-boot's SimpleApplication + core-web's Router
```

## 3. Core Design Principle: Metadata-Driven Decorators

### 3.1 Collecting (passive) vs Wrapping (active)

Decorators fall into two categories.

| Kind | Decorators | Behavior |
|---|---|---|
| **Collecting** | `@onInitialize`, `@onConnectedShadow`, `@addEventListener`, `@query`, `@changedAttribute`, `@state`, `@subscribe...`, `@emitCustomEvent`, etc. | Only push `{propertyKey, options}` into a list under `Symbol.for('simple-web-component:...')` on the constructor and return the original descriptor |
| **Wrapping** | `@applyNode` family (`@innerHtmlLight`, etc.), `@publishSwcAppMessage`, `@setProperty`, etc. | Replace the method **descriptor** to apply DOM changes / publish messages at call time |

All metadata keys are global symbols (`decorators/lifecycles.ts:3`), shared across
package versions/instances regardless of module instance.

```ts
// Collecting example: @addEventListener
export function addEventListener(selector, type, options) {
  return (target, propertyKey, descriptor) => {
    let list = ReflectUtils.getMetadata(ADD_EVENT_LISTENER_METADATA_KEY, target.constructor);
    list ??= [];
    list.push({ propertyKey, selector, type, options });   // record only
    return descriptor;                                      // keep original
  };
}
```

### 3.2 `@elementDefine` — The Execution Engine

`decorators/elementDefine.ts` is the heart of the framework. As a **class decorator** it runs once at
**definition time** in this exact linear order (`elementDefine.ts:318-813`):

```
@elementDefine('my-comp', config) execution order (definition time)
  1. buildEnv(config.window) → { win, doc, BUILT_IN_TAG_MAP, domHelpers }
  2. metadata = { ...config, name, window: win }   (throws if no window)
  3. auto-detect extends: if not specified, walk the prototype chain through BUILT_IN_TAG_MAP
  4. collect decorator metadata:
       emitCustomEventList → emitHostCustomEventList (filtered by selector '$this' | '')
       addEventListenerList
       attrChangeMap  (@changedAttribute)
       attributeList  (@attribute)  /  applyAttributeMap  (@setAttribute)
  5. build swcLifecycleAttributes(swc-on-constructor/connected/disconnected/...)
     + swcOnEvents(swc-on-<DOM_EVENT_NAME> for every event name)
  6. merge observedAttributes (Set):
       metadata.observedAttributes
     + static observedAttributes (user-defined)
     + @changedAttribute keys  +  @setAttribute target names  +  @attribute($this) field names
     + @emitCustomEvent attributeName  +  swcLifecycleAttributes  +  swcOnEvents
  7. setupPrototype(proto, win) → inject into the prototype:
       _invokeLifecycleMethod / _resolveWindow / _executeSwcScript
       _bindAttributeEvent / __swc_executeAttributeEvent
  8. keep originals of the prototype's connectedCallback / disconnectedCallback / adoptedCallback
     / attributeChangedCallback (original*)
  9. override connectedCallback      → runtime pipeline (§4)
 10. override disconnectedCallback   → cleanup pipeline (§4)
 11. override adoptedCallback        → §4
 12. override attributeChangedCallback → §4
 13. Object.defineProperty(constructor, 'observedAttributes', { get: () => merged })  (:802)
 14. ReflectUtils.defineMetadata(ELEMENT_CONFIG_KEY, metadata, constructor)  (:807)
 15. customElements.define(name, constructor, { extends })  — only if not already registered  (:810)
 16. return constructor
```

### 3.3 `ensureInit` — One-Time Instance Initialization (`elementDefine.ts:41`)

- Assigns `_swcId` (reuses `swc-use-ssr` attribute value if present, otherwise random)
- **Deletes own properties** so prototype getters/setters drive DOM synchronization:
  - Deletes own properties of `@attribute` / `@query` / `@queryAll` / `@property` fields so prototype getters take over (`:76-113`)
  - For `@state`, saves the current value, deletes, then reassigns (`:115-122`)
- Runs the `swc-on-constructor` script + invokes `@onInitialize` lifecycle methods

## 4. Lifecycle Pipeline

The overridden `connectedCallback` in `elementDefine` (`:365`) defines execution order.
Steps marked `(finally)` always run even if an earlier step throws.

### 4.1 `connectedCallback` — connect time (runtime)

```
 1. ensureInit(this)                        # one-time init (§3.3)
 2. refresh helperHostSet = getHelperAndHostSet(win, this); resolve appHost / useSsr(isSSR)
 3. $appHost._connected(this)               # register child (else queue in Safari standby list)
 4. resolve current window via _resolveWindow(conf)
 5. run @onConnectedBefore methods (by order)   # findAllOnConnectedBeforeMetadata
 6. run swc-on-before-connected script
 7. targetConnectedList = useSsr ? [] : findAllOnConnectedMetadata (SSR skips rendering)
 8. attach shadow — shadowMode && !this.shadowRoot → attachShadow({mode})
 9. build stateContext = {...helperHostSet, ...each @state value}
10. invoke each @onConnectedShadow/@onConnectedLight method
     → collect shadowChildren / lightChildren nodes
11. projectProcessHtml(_swcId, nodes, doc) preprocesses markers, then
     shadowRoot.replaceChildren(...shadow)  /  this.replaceChildren(...light)
12. new ElementApply(this, {id}).apply({ context: stateContext, bind: this })
     (if no connected-body methods: exclude {html,text,attribute}, only expand markers)
13. register global delegate root — if getRootNode() not registered, addEventListener
     DOM_EVENT_NAMES each type with handleGlobalSwcEvent (globalDelegatedRoots WeakSet)
14. split @addEventListener list into delegate / non-delegate
15. [delegate] group by type:root → bind one unifiedHandler per bindRoots (auto/light/shadow/all)
      (stopPropagation sorted first, closest() matching, filter/preventDefault applied)
16. [non-delegate] resolve selectors ($window/$document/$host/..., function selectors)
      → bind individually + Observable operators (debounceTime/throttleTime/distinctUntilChanged)
      → record in _boundListeners
17. chain to (original) connectedCallback
18. run @onConnectedAfter methods (by order)
19. run swc-on-connected / swc-on-after-connected scripts
20. __swc_connected = true
21. invoke @changedAttributeThis entries with while:'connected' immediately
22. (finally) run @onConnectedCompleted methods + $appHost._connectedDone(this)
```

### 4.2 `disconnectedCallback` — disconnect time (runtime)

```
 1. $appHost._disconnected(this)            # unregister child
 2. run swc-on-before-disconnected script
 3. run @onDisconnectedBefore methods
 4. clean up every _boundListeners:
       removeEventListener + Observable subscription.unsubscribe
 5. new ElementApply(this, {id}).removeAllEventListener()
 6. chain to (original) disconnectedCallback
 7. run @onDisconnectedAfter methods
 8. run swc-on-disconnected / swc-on-after-disconnected scripts
 9. __swc_connected = false
```

### 4.3 `adoptedCallback` (runtime)

```
 1. run swc-on-before-adopted script
 2. run @onAdoptedBefore methods
 3. chain to (original) adoptedCallback
 4. run @onAdoptedAfter methods
 5. run swc-on-adopted / swc-on-after-adopted scripts
```

### 4.4 `attributeChangedCallback` (runtime)

```
 1. chain to (original) attributeChangedCallback
 2. if newVal has a {{= script }} directive, evaluate with ActionExpression → processedVal
 3. if swc-on-* and not a lifecycle attr → _bindAttributeEvent(swc-on-<eventName>)
 4. if matches an @emitCustomEvent attributeName → _bindAttributeEvent
 5. invoke matching @changedAttribute methods
       (skip if while:'connected' && !__swc_connected)
```

`_invokeLifecycleMethod` (`elementDefine.ts:230`) is the DI integration point.
If `$appHost.simpleApplication` exists, it resolves `@inject` parameters through
simple-boot's `simstanceManager`; otherwise it calls the method directly.

## 5. Dual-DOM Rendering Strategy

### 5.1 Shadow / Light Separation

```
<my-card>                                ← host (this)
  │   <template shadowroot>              ← shadow DOM (style isolation)
  │     <style> ...static styles... </style>
  │     <div class="shell">
  │       <slot></slot>                  ← projection point for light DOM content
  │     </div>
  │   </template>
  │
  └─ <div class="content">...</div>      ← light DOM (dynamic content)
```

- **shadow**: static shell + component-only styles → `@onConnectedShadow` (`useShadow: true`)
- **light**: dynamic content → `@innerHtmlLight` writes directly into the host's light DOM, projected via `<slot>`

### 5.2 Root Type (`SwcRootType`, `types/index.ts:18`)

The `root` option determines the target of DOM operations / event binding.

| Value | Target |
|---|---|
| `auto` | shadowRoot if present, otherwise host |
| `light` | host (light DOM) |
| `shadow` | shadowRoot |
| `all` | both host and shadowRoot |

**Caveat**: slotted content does **not** inherit shadow `<style>`, so light-content CSS must be
included inside the content markup (a `<style>` in the light DOM). The LottoPage `@innerHtmlLight`
pattern is an example.

## 6. DOM Application — applyNode and ElementApply

### 6.1 The `applyNode` Decorator (`decorators/applyNode.ts`)

Applies the method's return value to a specific position. Two overload forms:

```ts
@applyNode('.list', { position: 'replaceChildren', root: 'light' })
addList() { return '<li>...</li>'; }
```

- **Selector resolution**: string / function (receives HelperHostSet) / SpecialSelectors like `$this`, `$host`, `$appHost` (`:52-73`)
- **Position (`ApplyNodePosition`)**: `beforeBegin/afterBegin/beforeEnd/afterEnd/replace/replaceChildren/innerHtml/innerText/remove/clearChildren`
- **Async support**: if `res instanceof Promise`, applies after resolution; `fallback` option renders loading UI (`:248-266`)
- **`valueKey`**: extracts a specific key when the method returns an object (shared by multiple decorators) (`:226-232`)
- Derived convenience decorators: `@innerHtmlLight` (= innerHtml + light), `@innerHtmlShadow`, `@replaceChildrenLight`, `@clearChildrenLight`, `@insertBeforeEndLight`, etc.

### 6.2 `ElementApply` Marker System (core-web)

`SwcUtils.projectProcessHtml` (`utils/Utils.ts:284`) preprocesses template strings/nodes,
expanding markers into real DOM structures.

| Marker | Meaning |
|---|---|
| `<!--[[ script ]]-->` | slot binding |
| `<!--[html script]-->` | innerHTML patch |
| `<!--[text script]-->` | text patch |
| `a::name="script"` | attribute patch |
| `e::name="script"` | event patch |
| `p:name="script"` | property patch |

After preprocessing, `new ElementApply(target, {id}).apply({context, bind})` evaluates the
scripts with `@dooboostore/core`'s `FunctionUtils.execute`.

### 6.3 `@state` — Marker-Patch Approach (`decorators/state.ts:29`)

`@state` defines a setter that, on value change, calls:
`new ElementApply(this, {id}).apply({ context, targetVariableName, bind })` —
i.e. it partially updates only the marker for that variable.

> **Design caveat**: the `@state` setter's `ea.apply` only works when a marker (`@variable@`)
> exists in the DOM. If there are no markers, it is unnecessary — you can replace it with a plain field.

## 7. Event System

### 7.1 `@addEventListener` (`decorators/addEventListener.ts`)

Bound in `elementDefine`'s `connectedCallback` (`elementDefine.ts:464-653`).

- **delegate vs non-delegate**: decided by `options.delegate && string selector && not a SpecialSelector`
- **delegate**: attaches one `unifiedHandler` per `bindRoots` (per `root` option), matching via
  `event.target.closest(selector)` (`:509`). Listeners with `stopPropagation` sort first
- **non-delegate**: resolves the selector (`$window`/`$document`/`$host`/`$appHost`/..., function selectors)
  then binds individually. Supports **RxJS-style operators**:
  `debounceTime`, `throttleTime`, `distinctUntilChanged` (`:617-652`)
- Options: `filter`, `preventDefault`, `stopPropagation`, `stopImmediatePropagation`, `capture/once/passive`
- **Aliases**: `@event` = `@addEventListener`, `@eventDelegateLightDom` (= `{root:'light', delegate:true}`, etc.) (`:70-74`)
- All listeners are tracked in `_boundListeners` and cleaned up on disconnect

### 7.2 Attribute-Based Events — `swc-on-*`

- Attribute scripts such as `swc-on-click="...script..."` in templates are handled by
  `handleGlobalSwcEvent` (`:140`), registered once per root in `globalDelegatedRoots`.
  It walks `composedPath()` and invokes the nearest SWC host's `__swc_executeAttributeEvent`
- In `attributeChangedCallback`, `swc-on-` prefixes are detected and bound directly via `_bindAttributeEvent` (`:778-783`)

## 8. Host Resolution — HostSet/HelperSet (`utils/Utils.ts`, `types/index.ts`)

Sets injected as context when evaluating scripts/selectors.

- **HelperSet** (`$d/$w/$q/$qa/$qi`) — document/query helpers (`Utils.ts:205`)
- **HostSet** — result of resolving the SWC component tree (`Utils.ts:527`):
  - `$host` = nearest parent SWC component
  - `$hosts` = all ancestors in [root, ..., parent] order
  - `$appHost` = nearest `swc-app` ancestor (based on `tagName`/`is` attribute, Safari polyfill friendly)
  - `$firstHost/$lastHost/$parentHost/$appHosts/$firstAppHost/$lastAppHost`
  - merges `__swc_loop_context` values for loop-scope variables
- **`$this`** = the current instance (included in HelperHostSet)

The `InjectSituationType` enum also feeds these sets into simple-boot's `@inject`
situational injection (`elementDefine.ts:238-244`).

## 9. SWC App — DI + Router Integration

### 9.1 `SwcAppEngine` (`SwcAppEngine.ts`)

`connect(config: SwcConfigType)` boots the application.

```
routeType: 'path'   → PathRouter
          'hash'    → HashRouter
          'element' → ElementRouter (internal history)
new SimpleApplication(SimOption({ excludeProxys:[Node], container }))
  → register Router in otherInstanceSim → run()  ← simple-boot DI boot
onStartedLazyDefineComponent → register lazy-defined components
onEngineStarted(simpleApplication, host)
```

`SwcConfigType` callbacks: `onConnected/onDisconnected`, `onConnectedChildBefore/After`,
`onDisconnectedChildBefore/After`, `onChildrenRouteChanged`, `onChildrenConnectedDone`,
`onEngineStarted`, `ssr`, etc.

### 9.2 `SwcAppMixin` (`elements/SwcAppMixin.ts`)

Used as `@elementDefine('my-app', {window:w}) class App extends SwcAppMixin(w.HTMLElement)`.

- `__swc_engine = new SwcAppEngine(this)` — creates the engine (`:29`)
- `connectedCallback`: executes the `swc-get-application-config` attribute script to call `connect(config)` (`:265-288`)
  - Evaluated with `FunctionUtils.executeReturn`; supports Promises
- **Child connection tracking**: `_connected/_disconnected/_connectedDone`
  - Manages connected children in the `_swc_connected_instance` Set
  - Route-change / connect-done events are debounced with `debounceTimeIntervalLock`
- **Route change propagation**: subscribes to the router's `observable` → `_handleRouteChange` →
  runs `_invokeRouteChangeSubscribers` on every connected instance (`:221-258`)
- **Message bus**: `publishMessage` → iterate `_swc_connected_instance` →
  invoke `@subscribeSwcAppMessageWhileConnected` handlers (`:324-355`)
- **Safari polyfill handling**: in environments where children upgrade first,
  instances are queued in `_connected_safari_and_standby` and reprocessed at `connect` (`:44, 239`)

### 9.3 `ElementRouter` (`router/ElementRouter.ts`)

Extends `Router` but routes using only an **internal history stack** (`_history` + `_currentIndex`),
without touching the URL.

- Overrides `pushState/replaceState` → emits `behaviorSubject.next({...route, triggerPoint:'start'|'end'})`
- `go/back/forward` — numeric index navigation + `super.go` delegation (object config)
- Search-parameter utilities: `pushAddSearchParam/pushUpsertSearchParam/replaceDeleteSearchParam`, etc.
- Subscribers of `@changedRoute` only run at `triggerPoint === 'end'` (`SwcAppMixin.ts:249`)

### 9.4 `@changedRoute` / `@subscribeSwcAppMessageWhileConnected` / `@publishSwcAppMessage`

- `@subscribeSwcAppRouteChangeWhileConnected(path | pattern[], options)` → alias `changedRoute`
  (`decorators/subscribeSwcAppRouteChangeWhileConnected.ts:78`)
  - `path` matching: `{id}`/`{tail:.*}`/`{slug:...}` patterns → `parsePathPattern` (`Utils.ts:565`)
  - sorted by `order`, optional `filter(router, meta)`; a handler returning a value stops the next handler
- `@publishSwcAppMessage('type', {valueKey})` → wraps the method and publishes its return value via
  `$appHost.publishMessage({publisher, data, type})` (Promise-aware, `valueKey` shared across multiple decorators)
- `@subscribeSwcAppMessageWhileConnected('type' | {filter})` → alias `receiveMessage`
  - invoked at `publishMessage` time when type/filter match

### 9.5 SwcApp-Wrapped Runtime — End-to-End Flow

When components are nested inside a `swc-app` (or `swc-app-*`), the Mixin orchestrates
boot, child tracking, route propagation, and messaging. Full linear flow:

```
A. App boot (definition + connection)
  1. defineSwcAppAll(w) → defines swc-app/swc-app-body/swc-app-div/... 
     (@elementDefine(swcAppTagName, {window: w}) + SwcAppMixin(w.HTMLElement))
  2. <swc-app> connects → SwcAppMixin.connectedCallback
  3. reads swc-get-application-config attribute script → FunctionUtils.executeReturn
     (Promise supported; userConfig resolved asynchronously)
  4. connect(config) → SwcAppEngine.connect
  5. SwcAppEngine:
       a. pick router by routeType: path→PathRouter / hash→HashRouter / element→ElementRouter
       b. new SimpleApplication(SimOption({ excludeProxys:[Node], container }))
       c. otherInstanceSim = user map + { Router: this.router }
       d. simpleApplication.run(otherInstanceSim)      # DI boot (injectables resolvable)
       e. run onStartedLazyDefineComponent factories   # lazy component definitions
       f. await onEngineStarted(simpleApplication, host)
  6. subscribe router.observable (triggerPoint 'end' → _handleRouteChange)
  7. reprocess _connected_safari_and_standby queue (Safari polyfill children)
  8. if config.path → navigate to initial path

B. Child connect inside SwcApp
  9. <my-page> (ordinary @elementDefine component) connects
      → elementDefine.connectedCallback (§4.1)
 10. step 3 of §4.1: helperHostSet.$appHost._connected(this)
 11. SwcAppMixin._connected:
       a. config.onConnectedChildBefore?.(this)
       b. _swc_connected_instance.add(this)            # register
       c. invoke @onConnectedSwcApp lifecycle methods
       d. debounce → config.onChildrenConnectedDone?.(app) when counter drains
       e. if router && _lastRouterEvent → run _invokeRouteChangeSubscribers immediately
 12. remainder of the normal §4.1 pipeline runs (render, events, ...)
 13. finally → $appHost._connectedDone(this)

C. Route change propagation
 14. router.push/replace/go → behaviorSubject emits triggerPoint 'start'/'end'
 15. SwcAppMixin subscribes (step 6); on 'end' → _handleRouteChange(route)
 16. store _lastRouterEvent = route
 17. for each instance in _swc_connected_instance (parallel, Promise.allSettled):
       _invokeRouteChangeSubscribers(instance, route)
       a. gather @changedRoute metadata (sorted by order)
       b. match path: no path → wildcard; array → first match wins;
          '{id}'/'{tail:.*}'/'{slug:...}' → parsePathPattern params
       c. apply optional filter(router, {helper, currentThis})
       d. invoke handler({...route, pathData}); if result != null/undefined → break (stop chain)
       e. SSR marking: swc-use-ssr set/removed based on browser + config.ssr
 18. debounce → config.onChildrenRouteChanged?.(re, app) when counter drains

D. Message bus (any time while connected)
 19. @publishSwcAppMessage-wrapped method runs → SwcUtils.getAppHost(this).publishMessage(...)
     (appHost = nearest swc-app ancestor; Promise return resolves first)
 20. SwcAppMixin.publishMessage(message):
       for each instance in _swc_connected_instance:
         _invokeMessageSubscribers(instance, message)
         a. match messageType (undefined → wildcard)
         b. apply optional filter(message, instance)
         c. invoke @subscribeSwcAppMessageWhileConnected handler

E. App disconnect
 21. <swc-app> disconnects → SwcAppMixin.disconnectedCallback
       a. unsubscribe router subscription
       b. __swc_engine.disconnect()
       c. config.onDisconnected?.(app)
       d. _disconnected(this)
```

Notes:

- **Nested apps**: `findAllAppHostsIncludingSelfDirect` (`Utils.ts:486`) walks up both light DOM
  parents and shadow hosts, so `$appHost` resolves to the *nearest* `swc-app` in nested trees.
- **Child-first upgrade (Safari)**: children connecting before the app is booted are held in
  `_connected_safari_and_standby` and re-driven at `connect` (step 7).
- **`$appHost` null**: if a component connects outside any `swc-app`, `_invokeLifecycleMethod`
  falls back to a plain direct call (no DI), keeping lifecycle safe.

## 10. SSR Support

- `swc-use-ssr` attribute: SSR marker, detected via `isSSR()` (`SwcAppMixin.ts:8-16`)
- On the server (`!ValidUtils.isBrowser()` && `config.ssr`), after rendering the instance is re-marked
  with `swc-use-ssr` for client reuse (`SwcAppMixin.ts:141-146`)
- `config.ts`'s `BROWSER_GLOBALS` / `HTML_TAG_ENTRIES` supply the lists used to detect
  globals/tags in SSR contexts
- `_resolveWindow` (`elementDefine.ts:219`): resolves the window starting from ancestor
  components' `config.window`, avoiding reliance on the global `window`

## 11. Execution Flow Summary

For the full SwcApp-wrapped runtime sequence, see **§9.5** (boot → child connect → route
propagation → messaging → disconnect). Condensed view:

```
browser parses DOM → <my-app> upgrades
  SwcAppMixin.connectedCallback
    ├─ execute swc-get-application-config script → SwcAppEngine.connect()
    │    ├─ pick Router + boot SimpleApplication (inject Router)
    │    └─ define lazy components
    └─ child <my-page> connects
         elementDefine.connectedCallback
           ├─ ensureInit → @onInitialize (DI-resolved)
           ├─ $appHost._connected(this) (registered in _swc_connected_instance)
           ├─ attach shadow → @onConnectedShadow/@onConnectedLight render
           ├─ ElementApply applies (markers → real DOM)
           ├─ @addEventListener binding
           └─ @onConnectedAfter/@onConnectedCompleted
router navigation → behaviorSubject(triggerPoint:'end')
  → SwcAppMixin._handleRouteChange → each child's @changedRoute handler
message published → publishSwcAppMessage → $appHost.publishMessage → @subscribe... handler
```

## 12. Extending: Adding a New Decorator

1. Define a key with `Symbol.for('simple-web-component:<name>')`
2. (Collecting kind) push `{propertyKey, options}` into `ReflectUtils.getMetadata(key, constructor)` and return the descriptor
3. Export from `decorators/index.ts`
4. Consume it either in `elementDefine.ts`'s `connectedCallback` (at connect time) or in the decorator itself (at call time)
5. If behavior depends on the DOM, resolve `$host`/`$appHost` via `SwcUtils.getHelperAndHostSet(win, this)`
6. For marker-based updates, use `ElementApply(target, {id}).apply({context, bind})`
