# @dooboostore/core

[![NPM version](https://img.shields.io/npm/v/@dooboostore/core.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/core)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


A zero-dependency TypeScript utility library providing 35+ modules for the @dooboostore ecosystem — a reactive messaging system (RxJS-like, but self-contained), DOM-oriented form validators, 2D/3D geometry, an extensible HTTP fetcher, cron-style scheduling, transaction coordination, and a large collection of array/object/string/date/math/convert/random helpers.

---

## ✨ Key Features

-   **🎯 RxJS-Like Reactive System**: `Observable`, `Subject`, `BehaviorSubject`, `ReplaySubject`, `AsyncSubject` with 25+ pipeable operators — without an RxJS dependency
-   **⚡ Advanced Async Utilities**: `Promises.sleep/settle/settles/retry/loop`, concurrency-limited batch execution, `AbortablePromise`
-   **📋 DOM-Bound Validation Framework**: composable `Validator` classes that read/write a DOM element's `value`/`checked` directly, plus checkbox-group combinators
-   **📐 2D/3D Geometry Engine**: `Point2D`/`Point3D`, `Rect`, `Polygon`, `Ellipse`, `Vector` (p5.js-style), with containment/overlap checks and percent/ratio layout helpers
-   **🌐 Extensible HTTP Client**: `Fetcher`/`HttpFetcher`/`HttpJsonFetcher` — a config-object request API with overridable lifecycle hooks, not a flat options bag
-   **📦 Data Utilities**: `ArrayUtils`, `ObjectUtils`, `StringUtils`, `DateUtils`, `MathUtil`, `ConvertUtils`, `RandomUtils`
-   **⏰ Cron-Shaped Scheduling**: `ScheduleBase` tracks run history/state/counts around your `execute()` implementation
-   **🛡️ Transaction Coordination**: `TransactionManager` cascades `catch()`/`finally()` across registered transactions
-   **🎨 Type-Safe**: full TypeScript support, strict typing throughout
-   **🪶 Zero Dependencies**: no external runtime dependencies (only a `reflect-metadata` peer dependency); ESM/CJS/UMD builds

## Installation

Install `@dooboostore/core` using your favorite package manager:

```bash
# pnpm
pnpm add @dooboostore/core

# npm
npm install @dooboostore/core

# yarn
yarn add @dooboostore/core
```

> **Import from the package root.** `src/index.ts` re-exports everything, and the package explicitly does **not** support arbitrary subpath imports like `@dooboostore/core/message` — `package.json`'s `exports` map only defines `.`, `./message/operators`, and `./bundle-entry`. Always `import { ... } from '@dooboostore/core'` (operators are the one exception — see below).

---

## 📚 Module Organization

`@dooboostore/core` is organized into **35+ modules**, all re-exported from the package root (`src/index.ts`).

### **Tier 1: Foundation (Data & Async)**

| Module | Description | Key Exports |
|--------|-------------|------------|
| **message** | RxJS-like reactive system | `Observable`, `Subject`, `BehaviorSubject`, `ReplaySubject`, `AsyncSubject` |
| **promise** | Advanced async utilities | `Promises`, `AbortablePromise` |
| **valid** | Type guards | `ValidUtils` (`isString`, `isNumber`, `isObject`, `isEmpty`, `isNullish`, …) |
| **array** | Array manipulation | `ArrayUtils` (`split`, `toShuffle`, `pick`, `has`/`hasAll`, `relation`, …) |
| **object** | Object introspection & path access | `ObjectUtils` (`keys`, `values`, `entries`, `deepCopy`, `ObjectUtils.Path.get/set`, …) |
| **string** | String utilities | `StringUtils` (`trim`, `lpad`/`rpad`, `ellipsis`, `appendPostposition`, …) |
| **date** | Date/time operations | `DateUtils` (`add`, `toSeconds`/`fromSeconds`, `relativeTime`, `formatDuration`, …) |
| **math** | Mathematical operations | `MathUtil` (`hypot`, `pythagorean`, `radians`/`degrees`, `bezier`, `rotatePoint`, …) |
| **convert** | Type conversion | `ConvertUtils` (`objToMap`/`mapToObj`, `toObject`, `toHexColor`, `escapeHTML`, …) |
| **random** | Randomization | `RandomUtils` (`int`, `float`, `uuid`/`uuid4`, `hex`, `rgb`/`rgba`, `alphabet`) |

### **Tier 2: Data Structures & Network**

| Module | Description | Key Exports |
|--------|-------------|------------|
| **validators** | DOM-bound validation framework | `Validator`, `FormValidator`, `RequiredValidator`, `RegExpTestValidator`, checkbox-array combinators |
| **fetch** | HTTP client framework | `HttpFetcher`, `HttpJsonFetcher`, `Fetcher` (base, for non-HTTP transports) |
| **entity** | 2D/3D geometry | `Point2D`, `Point3D`, `Polygon`, `Rect`, `Ellipse`, `Vector`, `Scalar` |
| **runs** | Runnable pattern | `Runnable<I, O>` interface |

### **Tier 3: Coordination & Async Patterns**

| Module | Description | Key Exports |
|--------|-------------|------------|
| **transaction** | Transaction coordination | `TransactionManager`, `Transaction` interface |
| **schedule** | Cron-shaped scheduling | `ScheduleBase` (tracks state/history/counts) |
| **store** | Store loader pattern | `StoreLoader` |

### **Tier 4: Utilities & Helpers**

| Module | Description | Key Exports |
|--------|-------------|------------|
| **url** | URL utilities | `UrlUtils` |
| **parser** | Parsing utilities | `CssParser`, `ObjectPathParser` |
| **logger** | Structured logging | `Logger` |
| **storage** | Storage abstraction | `Storage`, `MemoryStorage` |
| **reflect** | Metadata reflection | `ReflectUtils` |
| **function** | Function utilities | `FunctionUtils` (dynamic script execution) |
| **optional** | Optional/Maybe monad | `Optional<T>`, `OptionalUtils` |
| **iterators** | Range iterators | `Range` |
| **queues** | Async queues | `AsyncBlockingQueue<T>` |
| **advice** | AOP-style exception handling | `Advice` |
| **code** | Code constants | ISO3166-1 country codes (`IOS3166_1`) |
| **image** | Image utilities | `ImageUtils` |
| **expression** | Expression evaluation | `ActionExpression`, `Expression` |
| **hash** | Hashing | `HashUtils` |

---

## 🎯 Core Modules Deep Dive

### 1️⃣ **Message & Reactive System** (Observable, Subject)

The reactive messaging system provides an RxJS-like API **without the RxJS dependency**.

#### Core Classes

```typescript
// Base observable
Observable<T, E>
  .pipe(...operators): Observable
  .subscribe(observer | callback, errorCallback?, completeCallback?): Subscription
  .toPromise(): Promise<T | undefined>

// Subject variants
Subject<T, E>              // Multicast observable
BehaviorSubject<T, E>      // With current value
ReplaySubject<T, E>        // Replays historical values to new subscribers
ReplayForwardSubject<T, E> // Replay variant that forwards subsequent values
AsyncSubject<T, E>         // Emits only the last value, on complete
```

#### Pipeable Operators (`message/operators`)

Operators live in their own subpath export — `@dooboostore/core/message/operators` — since there are many of them and most consumers only need a handful:

```typescript
import { Subject } from '@dooboostore/core';
import { debounceTime, map, switchMap, filter, catchError } from '@dooboostore/core/message/operators';
```

Available operators (one file per operator under `src/message/operators/`): `map`, `filter`, `reduce`, `scan`, `switchMap`, `mergeMap`, `concatMap`, `tap`, `find`, `first`, `single`, `take`, `takeLast`, `takeUntil`, `takeWhile`, `skip`, `skipWhile`, `distinctUntilChanged`, `debounceTime`, `throttle`, `throttleTime`, `delay`, `bufferTime`, `timeout`, `catchError`, `retry`, `finalize`, `share`, `from`, `interval`.

Standalone creation/combination helpers (not `.pipe()` operators, imported from the package root) live under `src/message/internal/`: `of`, `range`, `fromArray`, `fromPromise`, `fromEvent`, `merge`, `concat`, `defer`, `empty`, `never`, `throwError`, `interval`, `timer`, `firstValueFrom`, `lastValueFrom`, `toPromise`.

#### Example: Reactive Search with Debounce

```typescript
import { Subject } from '@dooboostore/core';
import { debounceTime, map, filter, switchMap } from '@dooboostore/core/message/operators';

const searchInput$ = new Subject<string>();

searchInput$.pipe(
  debounceTime(300),                 // wait 300ms after the last keystroke
  map(q => q.trim()),
  filter(q => q.length > 0),
  switchMap(q => searchApi(q))       // your own async lookup
).subscribe({
  next: results => displayResults(results),
  error: err => showError(err)
});

searchInput$.next('typescript');
```

---

### 2️⃣ **Promise Utilities** (Advanced Async)

Everything lives on the `Promises` namespace, imported from the package root.

```typescript
import { Promises } from '@dooboostore/core';

Promises.sleep(ms: number): Promise<void>
Promises.sleepReject(ms: number): Promise<never>                 // rejects after ms
Promises.delayExecute<T>(value: (() => T) | (() => Promise<T>), delay?: number): Promise<T>

Promises.settle<T>(promise: Promise<T>): Promise<Promises.SettledResult<T>>
Promises.settles<T>(...promises: Promise<T>[]): Promise<Promises.SettledResult<T>[]>
Promises.isFulfilled(result) / Promises.isRejected(result)       // narrow a SettledResult

Promises.retry<T>(
  factory: (attempt: number, error?: any) => Promise<T>,
  config: { retry: number; delay?: { initialDelay?: number; retryDelay?: number }; onRetry?: (error, attempt) => void }
): Promise<T>

Promises.loop<T>(config: { factory: (loopInfo: { age: number }) => Promise<T>; delay?: number; loopDelay?: number }): {
  subscribe: (callback: { then?, catch?, delayThen? }) => Subscription  // unsubscribe() stops the loop
}

Promises.filterCatch(promise, errorTypeOrPredicate): Promise<Error | undefined>
Promises.abortable<T>(executor: (() => Promise<T>) | Promise<T>, signal?: AbortSignal): AbortablePromise<T>
Promises.withResolvers<T>(): { promise, resolve, reject }         // like the stage-4 Promise.withResolvers

// Batch execution helpers
Promises.executeInChunks<T>(factories, { chunkSize, sleepBetweenChunks }): Promise<T[]>
Promises.executeSettledInChunks<T>(factories, { chunkSize, sleepBetweenChunks }): Promise<Promises.SettledResult<T>[]>
Promises.executeWithConcurrency<T>(factories, concurrency = 10): Promise<T[]>   // fixed worker pool
Promises.executeWithLimit<T>(factories, limit = 5): Promise<T[]>               // starts a new one as soon as one finishes
```

#### Example: A cancellable polling loop

```typescript
import { Promises } from '@dooboostore/core';

const subscription = Promises.loop({
  factory: async ({ age }) => {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('not ready');
    return res.json();
  },
  loopDelay: 2000 // wait 2s between each attempt (loops forever until unsubscribed)
}).subscribe({
  then: (result, { age, duration }) => console.log(`attempt #${age} ok in ${duration}ms`, result),
  catch: (err, { age }) => console.error(`attempt #${age} failed`, err)
});

// later
subscription.unsubscribe();
```

#### Example: Retry with backoff

```typescript
import { Promises } from '@dooboostore/core';

const data = await Promises.retry(
  (attempt, prevError) => fetch(`/api/data?attempt=${attempt}`).then(r => r.json()),
  { retry: 3, delay: { retryDelay: 1000 }, onRetry: (e, attempt) => console.log('retrying', attempt, e) }
);
```

---

### 3️⃣ **Validation Framework** (DOM-bound Validators)

This is **not** an async `validate(value): Promise<Result>` framework — it's a synchronous, DOM-element-bound `Validator` hierarchy: each `Validator` optionally holds a `target` (a form element) and `event`, reads/writes `.value`/`.checked` on that target, and exposes a synchronous `valid(): boolean`.

```typescript
abstract class Validator<T = any, E = Element> {
  constructor(value?: T, target?: E, event?: Event, autoValid = true, autoValidAction = true);
  get/set value: T | undefined;      // falls back to target.value when unset
  get/set checked: boolean;          // reads/writes target.checked
  abstract valid(): boolean;
  validAction(): boolean;            // valid() + invokes the validAction callback set via setValidAction()
  // Composition: a Validator auto-discovers any of its OWN properties that are themselves Validators
  childValidators(): [string, Validator][];
  childValid(): boolean;             // true if every child validator is valid
}
```

`FormValidator<E = HTMLFormElement>` is the composite root: its `valid()` delegates to `childValid()`, so any `Validator`-typed property you assign on it is automatically included.

#### Built-in leaf validators

| Class | `valid()` semantics |
|---|---|
| `RequiredValidator` | value is not `undefined`/`null` |
| `EmptyValidator` / `NotEmptyValidator` | value is empty (`null`/`undefined`/`length <= 0`) / not empty |
| `RegExpTestValidator(regexp)` / `NotRegExpTestValidator(regexp)` | `regexp.test(value)` / its negation |
| `ValueEqualsValidator(equalsValue)` / `ValueNotEqualsValidator(equalsValue)` | `value === equalsValue` / `!==` |
| `CheckedValidator` / `UnCheckedValidator` | `target.checked` is `true` / `false` |
| `PassValidator` / `NonPassValidator` | always `true` / always `false` |
| `MultipleValidator(validators)` | all given validators are valid (AND) |
| `ValidMultipleValidator(callback, validators)` | valid()'s result comes from your own `callback(validators, value, target, event)` |
| `ValidatorArray` (abstract) | base for validators whose `value` is a `Validator[]` (e.g. a checkbox group) |
| `ValidValidatorArray(callback)` | `ValidatorArray` whose `valid()` delegates to your callback |
| `AllCheckedValidatorArray` / `AllUnCheckedValidatorArray` | every item in the array is checked / unchecked |
| `CountEqualsCheckedValidatorArray(count)`, `CountGreaterThanCheckedValidatorArray(count)`, `CountGreaterThanEqualsCheckedValidatorArray(count)`, `CountLessThanCheckedValidatorArray(count)`, `CountLessThanEqualsCheckedValidatorArray(count)`, `CountUnCheckedValidatorArray(count)`, and the matching `*UnCheckedValidatorArray` set | the number of checked/unchecked items compares against `count` as the name says |
| `IncludeCheckedValidatorArray` / `ExcludeCheckedValidatorArray` | at least one item checked / no items checked |

#### Example: Composite form validation

```typescript
import { FormValidator, RequiredValidator, RegExpTestValidator } from '@dooboostore/core';

class SignupFormValidator extends FormValidator {
  email = new RegExpTestValidator(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  password = new RequiredValidator<string>();
}

const form = new SignupFormValidator(document.querySelector('form')!);
form.email.set('user@example.com', emailInputEl);
form.password.set('secret123', passwordInputEl);

if (form.valid()) {
  submitForm();
} else {
  const [failedField] = form.childInValidValidator()[0] ?? [];
  console.log('first invalid field:', failedField);
}
```

---

### 4️⃣ **Geometry & Entity** (2D/3D Operations)

```typescript
// 2D point — just coordinates + copy(); no distance/angle/rotate methods on Point2D itself
Point2D { x: number, y: number }
  .copy(): Point2D

// 3D point extends Point2D, adds z
Point3D extends Point2D { z: number }
  .copy(): Point3D

// Axis-aligned rectangle — many constructor overloads (x,y,w,h / two points / a SizeType / …)
Rect
  .isIn(point | rect): boolean          // fully contains
  .isOut(point | rect): boolean
  .isOverlap(point | rect): boolean     // intersects
  .toRotate(angle, { rotatePoint?, type? }): Point2D[]  // rotated corner points
  // plus a large family of percent/ratio-based layout helpers: setWidth/height, addXPercent,
  // getXByPercent, toScaleByWidth/Height, copyByPercent/Ratio, and Rect-to-Rect size "linking"
  // via addLink()/unLink() so resizing one Rect can proportionally resize its linked Rects.

// Polygon — arbitrary point list, backed by Point2Ds
Polygon
  .isIn(point): boolean          // ray-casting
  .isOut(point): boolean
  .isOverlap(point | rect | ellipse | polygon): boolean
  .toRect(): Rect                // axis-aligned bounding box

// Ellipse extends Point2D (center) + radiusX/radiusY/rotation/startAngle/endAngle
Ellipse
  .isIn(point) / .isOut(point) / .isOverlap(point | rect | polygon | ellipse) / .toRect()

// p5.js-style vector — `to*` methods are non-destructive (return a new Vector),
// everything else (add/sub/mult/div/normalize/…) mutates the vector in place
Vector { x, y, z }

// A simple mutable numeric box
Scalar { get/set value: number }
```

#### Example: Collision Detection

```typescript
import { Rect, Point2D } from '@dooboostore/core';

const player = new Rect(100, 100, 50, 50);   // x, y, width, height
const enemy = new Rect(130, 120, 40, 40);
const projectile = new Point2D(140, 110);

if (player.isOverlap(enemy)) {
  console.log('Player hit enemy!');
}

if (enemy.isIn(projectile)) {
  console.log('Projectile hit enemy!');
}
```

---

### 5️⃣ **HTTP Fetcher** (Extensible Framework)

`Fetcher<TARGET, RESPONSE, CONFIG, PIPE>` is an abstract base whose single public entry point, `fetch(request)`, runs your `before` → `execute` → `afterSuccess`/`error` → `finally` hooks (all `protected`, meant to be overridden by subclassing) around one request. `HttpFetcher` implements `execute` on top of the native `fetch` API and adds `get`/`post`/`put`/`patch`/`head`/`delete` convenience methods — **each one still takes a single request-config object**, not `(url, options)`:

```typescript
import { HttpFetcher } from '@dooboostore/core';

const fetcher = new HttpFetcher();

const res = await fetcher.get({
  target: 'https://api.example.com/users',            // string | URL | { url, searchParams }
  config: { fetch: { headers: { Authorization: 'Bearer ...' }, timeout: 5000 } },
  transform: data => data as User[]                    // response is the raw fetch Response by default
});
```

`HttpJsonFetcher` extends it: it auto-sets JSON `Content-Type`/`Accept` headers, JSON-stringifies a non-string request body, and by default parses the response body as JSON (set `config.responseTransform` to `'text'` or `'response'` to opt out, or pass your own function). It also adds `postJson`/`patchJson`/`putJson`, which accept a raw (non-serialized) `body` and stringify it for you.

```typescript
import { HttpJsonFetcher } from '@dooboostore/core';

const api = new HttpJsonFetcher();

const user = await api.get<User>({ target: `/api/users/${id}` });
const created = await api.postJson<User>({ target: '/api/users', config: { fetch: { body: { name: 'Ada' } } } });
```

To customize cross-cutting behavior (auth headers, 401 handling, logging), subclass `HttpFetcher`/`HttpJsonFetcher` and override the protected hooks (`before`, `afterSuccess`, `error`, `finally`, `beforeProxyFetch`, `afterProxyFetch`, `errorTransform`) rather than passing a flat options object — there is no `FetcherOptions`-style `beforeRequest`/`afterResponse` callback bag.

---

### 6️⃣ **Transaction Coordination**

```typescript
interface Transaction<I = any, T = any, C = any, F = any> {
  try(data: I): Promise<T>;
  catch(e: any): Promise<C>;
  finally(): Promise<F>;
}

class TransactionManager {
  setTransaction(key: string | Symbol | ConstructorType<any>, transaction: Transaction): void;
  hasTransaction(key): boolean;
  deleteTransaction(key): boolean;
  getTransaction<T>(key): Transaction | undefined;   // marks it "active" for catch()/finally() below
  catch(e: any): Promise<void>;    // calls .catch(e) on every transaction retrieved via getTransaction()
  finally(): Promise<void>;        // calls .finally() on every transaction retrieved via getTransaction(), then clears the map
}
```

**Important**: `TransactionManager` does not call each transaction's `try()` for you — its own `try()` is a no-op. `catch()`/`finally()` only cascade to transactions that were actually fetched via `getTransaction()` (that call is what marks a transaction "in-flight"). The intended usage is: register with `setTransaction`, look each one up with `getTransaction` and run its own `try()` yourself (typically inside your own `try { }` block), then let the manager cascade `catch()`/`finally()` for coordinated rollback/cleanup:

```typescript
import { TransactionManager } from '@dooboostore/core';

const manager = new TransactionManager();
manager.setTransaction('payment', paymentTransaction);
manager.setTransaction('inventory', inventoryTransaction);

try {
  await manager.getTransaction('payment')!.try(order);
  await manager.getTransaction('inventory')!.try(order);
} catch (e) {
  await manager.catch(e);      // rolls back every transaction that was getTransaction()'d above
} finally {
  await manager.finally();     // cleans up the same set, then clears the registry
}
```

---

### 7️⃣ **Scheduling** (Cron-shaped)

`ScheduleBase<T, R>` doesn't parse or run cron expressions itself — `spec` is just a conventional cron-format string field you (or your own scheduler/host) read to decide when to call `run()`. What it actually provides is state/history/count tracking around your `execute()`:

```typescript
abstract class ScheduleBase<T = void, R = void> {
  abstract spec: string;              // conventional cron string, e.g. "0 2 * * *" — not parsed by this class
  abstract name?: string;
  abstract description?: string;
  get state(): 'INITIALIZE' | 'RUNNING' | 'DONE-AND-WAITING' | 'STOPPED' | 'ERROR' | 'SUCCESS';
  get history(): { state, date, input, result? }[] | undefined;
  get totalCount() / get successCount() / get errorCount(): number;

  run(data: T): Promise<R>;           // wraps execute(), updates state/history/counts — call this, not execute()
  abstract execute(data: T): Promise<R>;
}
```

```typescript
import { ScheduleBase } from '@dooboostore/core';

class DailyBackupSchedule extends ScheduleBase<void, { fileCount: number }> {
  spec = '0 2 * * *';
  name = 'Daily Database Backup';

  async execute() {
    const backup = await performBackup();
    return { fileCount: backup.fileCount };
  }
}

const schedule = new DailyBackupSchedule();
await schedule.run();               // updates state/history/successCount|errorCount as a side effect
console.log(schedule.state, schedule.totalCount);
```

---

### 8️⃣ **Data Utilities**

#### ArrayUtils

```typescript
ArrayUtils.split(arr, length)                 // split into chunks of `length`
ArrayUtils.toShuffle(arr)                     // returns a shuffled copy
ArrayUtils.pick(arr, count?)                  // pick one (no count) or `count` random items
ArrayUtils.popPick(arr)                       // pick-and-remove a random item
ArrayUtils.chancePick(weightedArr)            // weighted random pick
ArrayUtils.has(arr, ...items) / hasAll(...) / hasNot(...) / hasAllNot(...)
ArrayUtils.relation(...arrays)                // set-relation info (intersection/etc.) between arrays
ArrayUtils.create2DArray(rows, cols, initialValueOrFactory)
ArrayUtils.maxLength(matrix)                  // { maxRows, maxCols, maxRowsCols, total }
```

#### ObjectUtils

```typescript
ObjectUtils.keys(obj) / values(obj) / entries(obj) / keyLength(obj)
ObjectUtils.deepCopy(obj)
ObjectUtils.pickRandomKey(obj) / pickRandomValue(obj) / pickRandomKeyValue(obj)
ObjectUtils.toDeleteUndefinedAndNull(obj, { deep? })
ObjectUtils.constructorName(target) / allProtoTypeName(target) / ownPropertyNames(target)
ObjectUtils.Path.get(obj, path, defaultValue?) / Path.set(obj, path, value) / Path.deletePath(obj, path)
ObjectUtils.Script.evaluate(script, thisTarget) / Script.evaluateReturn(script, thisTarget)
```

#### StringUtils

```typescript
StringUtils.trim(str)
StringUtils.lpad(fill, len, str) / rpad(fill, len, str)
StringUtils.lsubString(str, len) / rsubString(str, len)
StringUtils.ellipsis(text, length)              // truncate with "…"
StringUtils.deleteEnter(str)                    // strip newlines
StringUtils.pickEmoji(str)
StringUtils.appendPostposition(text, { vowel, consonant })   // Korean particle helper (은/는, 이/가, …)
StringUtils.escapeSpecialCharacterRegExp(str)
```

(camelCase/kebab-case/snake_case-style conversions live on `ConvertUtils`, not `StringUtils` — see below.)

#### DateUtils

```typescript
DateUtils.add({ years?, months?, days?, minutes?, seconds?, milliSecond? }, date?)
DateUtils.format(date, format = 'yyyy-MM-dd HH:mm:ss')
DateUtils.isSameDate(date1, date2) / compare(date1, date2)
DateUtils.toSeconds(date?) / fromSeconds(seconds) / toMilliseconds(date?) / fromMilliseconds(ms)
DateUtils.toISOString(date?) / fromISOString(isoString)
DateUtils.age(dateOfBirth, until?) / countingAge(dateOfBirth, until?)   // Korean "counting age" variant
DateUtils.relativeTime(date, ...)               // "3 minutes ago"-style string
DateUtils.formatDuration(seconds, locale?)
DateUtils.weekCountOfYear(date)
```

#### MathUtil

```typescript
MathUtil.hypot(...values) / pythagorean(a, b)
MathUtil.sum(arr) / avg(arr) / max(arr) / min(arr) / minMax(value, { min, max })
MathUtil.radians(deg, { type? }) / degrees(rad, { type? })
MathUtil.ratio(numerator, denominator, multiplier?)
MathUtil.getPercentByTotal(total, value) / getValueByTotalInPercent(total, percent)
MathUtil.getRatioByTotal(total, value) / getValueByTotalInRatio(total, ratio)
MathUtil.bezier(points, frame, idx) / beziers(points, frame) / cubicBezier(position, frameConfig, bezierConfig)
MathUtil.rotatePoint(point, center, angleInRadians)
MathUtil.distSqToLineSegment(point, segmentStart, segmentEnd)
```

#### ConvertUtils

```typescript
ConvertUtils.objToMap(obj) / mapToObj(map) / mapToJson(map) / jsonToMap(json)
ConvertUtils.toObject(urlSearchParamsOrFormDataOrEntries)
ConvertUtils.snakeToCamelCase(str) / camelToSnakeCase(str)
ConvertUtils.toHex(num) / hexToInt(hex) / toHexColor(rgba)
ConvertUtils.escapeHTML(html) / decodeHTMLEscape(html)
ConvertUtils.toArray(valueOrIterable) / flatArray(...values)
```

#### RandomUtils

```typescript
RandomUtils.int(min?, max?) / float(min?, max?)
RandomUtils.uuid(format = 'xxxx-xxxx-xxxx-xxxx') / uuid4()
RandomUtils.hex() / rgb() / rgba()
RandomUtils.alphabet(len)
RandomUtils.chance(percentage)               // boolean weighted coin-flip
RandomUtils.uniqueInts(min, max, count)
```

---

## 🔗 Type Guard Utilities (`ValidUtils`)

```typescript
import { ValidUtils } from '@dooboostore/core';

ValidUtils.isString(v) / isNumber(v) / isArray(v) / isObject(v) / isMap(v) / isSet(v)
ValidUtils.isNull(v) / isUndefined(v) / isNullish(v) / isNotNullish(v) / isDefined(v)
ValidUtils.isEmpty(v)
ValidUtils.isFunctionType(v)                 // is v a plain callback (not a class constructor)
ValidUtils.isClassType(v)                    // is v a `class`-declared constructor
ValidUtils.isPlainObject(v) / isUrl(str) / isStringNumber(v)
ValidUtils.isFrozen(v) / isSealed(v) / isFrozenOrSealed(v) / isFrozenAndSealed(v) (and the `isNot*` negations)
ValidUtils.isIterator(v)
ValidUtils.includeValue(obj, value)
```

---

## 📖 Usage Examples

### Example 1: Reactive search + validated form, together

```typescript
import { Subject, FormValidator, RegExpTestValidator, RequiredValidator, HttpJsonFetcher } from '@dooboostore/core';
import { debounceTime, map, filter, switchMap } from '@dooboostore/core/message/operators';

const fetcher = new HttpJsonFetcher();
const searchInput$ = new Subject<string>();

searchInput$.pipe(
  debounceTime(300),
  map(q => q.trim()),
  filter(q => q.length > 0),
  switchMap(q => fetcher.get<Item[]>({ target: `/api/search?q=${encodeURIComponent(q)}` }))
).subscribe(results => displayResults(results));

class SearchFormValidator extends FormValidator {
  query = new RequiredValidator<string>();
}
```

### Example 2: Coordinated batch requests

```typescript
import { Promises, HttpJsonFetcher } from '@dooboostore/core';

const api = new HttpJsonFetcher();

const results = await Promises.settles(
  api.get({ target: '/api/users' }),
  api.get({ target: '/api/posts' }),
  api.get({ target: '/api/comments' })
);

results.forEach((result, idx) => {
  if (Promises.isFulfilled(result)) {
    console.log(`request ${idx} ok:`, result.value);
  } else {
    console.log(`request ${idx} failed:`, result.reason);
  }
});
```

### Example 3: Geometry — collision detection

```typescript
import { Rect, Point2D, Polygon } from '@dooboostore/core';

const player = new Rect(100, 100, 50, 50);
const enemy = new Rect(200, 140, 40, 40);
const powerUp = new Point2D(150, 180);

if (player.isOverlap(enemy)) console.log('Game Over!');
if (player.isIn(powerUp)) console.log('Power Up Activated!');

const walls = new Polygon([
  new Point2D(0, 0), new Point2D(500, 0), new Point2D(500, 500), new Point2D(0, 500)
]);
if (walls.isIn(player.center)) console.log('Player is inside the walls');
```

### Example 4: Transaction rollback

```typescript
import { TransactionManager, Transaction } from '@dooboostore/core';

class PaymentTransaction implements Transaction<Order> {
  async try(order: Order) { await chargeCard(order.payment); }
  async catch(error: any) { await refundCard(error); }
  async finally() { await closePaymentConnection(); }
}

const manager = new TransactionManager();
manager.setTransaction('payment', new PaymentTransaction());

try {
  await manager.getTransaction('payment')!.try(order);
} catch (error) {
  await manager.catch(error);
} finally {
  await manager.finally();
}
```

### Example 5: A retried, cancellable poll

```typescript
import { Promises } from '@dooboostore/core';

const sub = Promises.loop({
  factory: () => Promises.retry(() => fetch('/api/status').then(r => r.json()), { retry: 2 }),
  loopDelay: 5000
}).subscribe({ then: status => console.log(status) });

// stop polling later
sub.unsubscribe();
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│       @dooboostore/core Modules             │
├─────────────────────────────────────────────┤
│  Tier 1 — Foundation                         │
│  • strings, arrays, objects, dates, math     │
│  • convert, random, valid (type guards)      │
│  • Observable/Subject (25+ operators)        │
│  • Promises (sleep, settle, retry, loop)     │
├─────────────────────────────────────────────┤
│  Tier 2 — Domain-Specific                    │
│  • Validators (DOM-bound composable checks)  │
│  • HttpFetcher (config-object HTTP client)   │
│  • Entity (2D/3D geometry)                   │
│  • Runs (Runnable pattern)                   │
├─────────────────────────────────────────────┤
│  Tier 3 — Async Coordination                 │
│  • Transaction (cascaded catch/finally)      │
│  • Schedule (state/history around execute)   │
│  • Store (dynamic loading)                   │
├─────────────────────────────────────────────┤
│  Tier 4 — Specialized Utilities              │
│  • URL/CSS parsing, Logger, Storage          │
│  • Reflect, Function, Optional, Iterators    │
└─────────────────────────────────────────────┘
```

---

## 📊 Characteristics

| Aspect | Characteristic |
|--------|---|
| **Runtime dependencies** | none (only a `reflect-metadata` peer dependency) |
| **Module formats** | ESM, CJS, and a UMD/ESM bundle (see `build.mjs` targets) |
| **TypeScript** | full native support, strict typing |
| **Import surface** | root import only — `.`, `./message/operators`, `./bundle-entry` are the only defined `exports` entries |

---

## 🎓 Best Practices

### 1. Use type guards for runtime safety
```typescript
import { ValidUtils } from '@dooboostore/core';

function processData(data: unknown) {
  if (ValidUtils.isObject(data) && 'id' in data) {
    // safe to access data.id
  }
}
```

### 2. Compose validators instead of hand-rolling checks
```typescript
import { MultipleValidator, RegExpTestValidator } from '@dooboostore/core';

const passwordValidator = new MultipleValidator([
  new RegExpTestValidator(/.{8,}/),   // at least 8 characters
  new RegExpTestValidator(/[A-Z]/),   // at least one uppercase
  new RegExpTestValidator(/[0-9]/)    // at least one digit
]);
```

### 3. Debounce UI-driven streams
```typescript
searchInput$.pipe(
  debounceTime(500),
  switchMap(q => searchApi(q))
).subscribe(results => updateUI(results));
```

### 4. Always unsubscribe
```typescript
const subscription = observable.subscribe(...);
subscription.unsubscribe();
```

### 5. Only transactions you `getTransaction()` participate in `catch()`/`finally()`
See the [Transaction Coordination](#6️⃣-transaction-coordination) section — `setTransaction` alone does not wire a transaction into the manager's rollback cascade.

---

## 📚 Learn More

The detailed API documentation, including all modules and usage examples, is available on our documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
