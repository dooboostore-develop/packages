# @dooboostore/core

`@dooboostore/core` is a comprehensive utility library for TypeScript/JavaScript projects. It provides a wide range of tools and helpers to streamline development, from basic data manipulation to complex asynchronous operations, rendering, and state management.

## Features

- **Rich Utilities**: A vast collection of utilities for arrays, objects, strings, dates, and mathematical operations.
- **Type-Safe**: Written in TypeScript with a focus on providing powerful and flexible utility types.
- **Asynchronous Toolkit**: Advanced tools for handling Promises, including loops, transactions, queues, and state wrappers.
- **Messaging System**: A simple yet powerful messaging system based on the Observer pattern (`Observable`, `Subject`), including a wide range of RxJS-like operators.
- **HTTP Fetcher**: A flexible and extensible HTTP client framework (`HttpFetcher`, `HttpJsonFetcher`).
- **2D/3D Geometry & Rendering**: Comprehensive set of classes for 2D/3D points, vectors, rectangles, ellipses, polygons, and a rendering engine with transaction-based animations.
- **Standardized Codes**: Includes common standards like `IOS3166_1` country codes.
- **Extensible Components**: Base classes and interfaces like `Runnable`, `Schedule`, `Storage`, and `Advice` to build upon.
- **CSS Parsing**: Utilities for parsing and manipulating CSS rules and declarations.
- **Reflection Utilities**: Tools for runtime type and metadata inspection.
- **OpenAPI Integration**: Type definitions and client generation helpers for OpenAPI specifications.
- **Function Utilities**: Helpers for function introspection and execution.
- **Image Utilities**: Tools for image loading and manipulation.

## Installation

```bash
# Using pnpm
pnpm add @dooboostore/core

# Using npm
npm install @dooboostore/core

# Using yarn
yarn add @dooboostore/core
```

## Modules Overview

### Utilities

- **`ArrayUtils`**: Functions for array manipulation like shuffling, picking random elements, creating 2D arrays, and performing set operations (intersection, union, etc.).
- **`ObjectUtils`**: Helpers for deep copying, inspecting prototypes, picking random properties, and manipulating object keys and values.
- **`StringUtils`**: A collection of string manipulation functions, including padding, trimming, unescaping HTML, and handling Korean postpositions.
- **`DateUtils`**: Tools for formatting, comparing, and performing calculations with dates. Includes relative time formatting.
- **`MathUtil`**: Advanced math functions including Pythagorean theorem, Bezier curve calculations, and various percentage/ratio helpers.
- **`RandomUtils`**: Generate random integers, decimals, UUIDs, hex colors, and more.
- **`ConvertUtils`**: A rich set of converters for JSON, `Map`, `Object`, `URLSearchParams`, `FormData`, colors (hex to RGBA), and more.
- **`ValidUtils`**: A suite of type-checking and validation functions (`isArray`, `isString`, `isObject`, `isNullOrUndefined`, etc.).

### Asynchronous & Messaging

- **`Promises`**: A powerful namespace for working with Promises. Includes `sleep`, `settle`, `settles`, `loop` for creating polling mechanisms, `delayExecute` for delayed execution, `transaction` for managing promise chains, and `Result.wrap` for handling promise states gracefully.
- **`message`**: Implements the Observer pattern with `Observable`, `Subject`, `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`. Also provides `debounce`, `throttle`, `throttleTime` functions.
  - **Operators**: A rich set of RxJS-like operators for transforming, filtering, and combining observables: `map`, `filter`, `debounceTime`, `distinctUntilChanged`, `switchMap`, `mergeMap`, `concatMap`, `catchError`, `retry`, `delay`, `timeout`, `scan`, `reduce`, `share`, `finalize`, `take`, `skip`, `takeWhile`, `startWith`.
  - **Creation Functions**: `of`, `fromArray`, `fromPromise`, `interval`, `timer`, `range`, `empty`, `never`, `throwError`, `defer`, `concat`, `merge`.
  - **Conversion Functions**: `firstValueFrom`, `lastValueFrom`.
- **`queues`**: `AsyncBlockingQueue` for managing a queue of asynchronous tasks.
- **`fetch`**: A robust HTTP client framework.
  - `HttpFetcher`: Base class for making HTTP requests.
  - `HttpJsonFetcher`: Extends `HttpFetcher` to simplify working with JSON APIs.
- **`transaction`**: `TransactionManager` and `Transaction` interface for managing a series of operations that can be rolled back.

### Core Entities & Rendering

- **`entity`**: A collection of classes representing fundamental data structures and rendering primitives.
  - `Point2D`, `Point3D`: Represent coordinates in 2D and 3D space.
  - `Point2Ds`, `Point3Ds`: Collections of 2D/3D points for complex shapes.
  - `Vector`: A class for vector mathematics (magnitude, addition, subtraction, dot product, etc.).
  - `Rect`: Represents a rectangle with helper methods for collision detection and coordinate manipulation.
  - `Ellipse`: Represents an ellipse with methods for point containment and overlap.
  - `Polygon`: Represents a polygon with methods for point containment and overlap.
  - `Scalar`: A wrapper for primitive numbers to perform chained mathematical operations.
  - `SizeType`: A type definition for width and height.
  - `WrapPolygons`, `WrapRects`: Classes for managing collections of polygons and rectangles, including spatial queries and transformations.
  - `Obj`, `RenderDrawObj`, `RenderTransactionDrawObj`, `RenderTransactionRunnableDrawObj`: A suite of classes forming a mini-rendering engine. It supports objects with properties like position, rotation, and color, and includes a powerful transaction system for creating complex, chained animations.
  - `Drawable`, `DrawData`: Interfaces and types for drawing operations.
  - `LenGrid`, `SizeGrid`: Grid drawing utilities.

### Application Structure

- **`runs`**: `Runnable` interface and related helpers to define executable components. Includes `AroundRunnable`, `AutoStartRunner`, `RunnableLoader`, and `StoreRunnableLoader` for managing various execution patterns and loading states.
- **`schedule`**: A cron-like scheduler (`Schedule`, `ScheduleBase`) for running tasks at specified intervals.
- **`storage`**: A generic `Storage` interface with a `MemoryStorage` implementation and `StorageUtils` for easy data persistence.
- **`logger`**: A configurable `Logger` class with support for different log levels and custom formatting.
- **`optional`**: `Optional` class for safely handling nullable values, inspired by Java's Optional, along with `OptionalUtils` for common optional operations.
- **`advice`**: An `Advice` abstract class for implementing Aspect-Oriented Programming (AOP) patterns.

### Other Modules

- **`code`**: Provides standardized codes, including `IOS3166_1` for country codes.
- **`parser`**: Contains `CssParser` for parsing, manipulating, and stringifying CSS rules and declarations.
- **`reflect`**: Offers `ReflectUtils` for working with TypeScript's reflection metadata, enabling runtime type and decorator information retrieval.
- **`open-api`**: Includes types and utility functions for generating API clients from OpenAPI specifications, facilitating type-safe API interactions.
- **`image`**: Provides `ImageUtils` for loading and manipulating image data.
- **`function`**: Offers `FunctionUtils` for inspecting function parameter names and safely evaluating code snippets.

### Types

- **`types.ts`**: A rich file containing dozens of advanced utility types for TypeScript, such as `WithRequiredProperty`, `Optional<T, K>`, `KeysWithValsOfType`, `PropType`, `ArrayElementType`, `PickMix`, `ChangeArrayElement`, `ChangeArrayElementMix`, `ChangePickArrayElementMix`, `ConstructorType`, `Method`, `GenericClassDecorator`, `MethodParameter`, `UnionToTuple`, `FilterUndefined`, `FilterNever`, `Mutable`, `ExtractNotNullish`, `FilterNullish`, `ExtractNotFalsy`, `FilterFalsy`, `FieldType`, `FieldUnionType`, `Dictionary`, `FlattenObjectKeys`, `FlattenObjectType`, `FlattenObject`, `FilterTuple`, `MaybeArray`, `With`, `Nullable`, `Nullish`, `NullableObject`, `NullableProperty`, `NullOrUndefined`, `NotNullOrUndefined`, `NonNullable`, `NonNullableObject`, `NonNullableProperty`, `GroupBy`, `InferPromise`, `JoinKeys`, `FilteredFirstKeys`, `ExcludeFilteredFirstKeys`, `GetDotPath`, `FlatJoinKey`, `FlatJoinDotKey`, `FlatJoinDotKeyType`, `FlatJoinKeyType`, `FlatJoinDotKeyFieldType`, `FlatJoinDotKeyTypePartial`, `FlatJoinDotKeyExcludeStartWithUnderBar`, `FlatJoinSlashKey`, `FlatJoinSlashKeyExcludeStartWithUnderBar`, `StringValue`, `MethodOnlyFieldPostFix`, `MethodOnlyFieldPerFix`, and `isDefined`.

## Basic Usage

### ArrayUtils

```typescript
import { ArrayUtils } from '@dooboostore/core/array/ArrayUtils';

const myArray = [1, 2, 3, 4, 5];

// Shuffle the array
const shuffled = ArrayUtils.toShuffle(myArray);
console.log(shuffled);

// Pick a random element
const randomItem = ArrayUtils.pick(myArray);
console.log(randomItem); // e.g., 3

// Pick 3 random unique elements
const randomItems = ArrayUtils.pick(myArray, 3);
console.log(randomItems); // e.g., [5, 1, 3]
```

### DateUtils

```typescript
import { DateUtils } from '@dooboostore/core/date/DateUtils';

const now = new Date();

// Format a date
const formatted = DateUtils.format(now, 'yyyy-MM-dd HH:mm:ss');
console.log(formatted); // "2025-06-28 10:30:00"

// Get relative time
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
const relative = DateUtils.relativeTime(fiveMinutesAgo);
console.log(relative); // "5 minutes ago"
```

### HttpJsonFetcher

```typescript
import { HttpJsonFetcher, HttpJsonFetcherConfig, HttpJsonResponseError } from '@dooboostore/core/fetch/HttpJsonFetcher';
import { FetcherRequest } from '@dooboostore/core/fetch/Fetcher';

interface User {
  id: number;
  name: string;
  email: string;
}

// Define a custom fetcher extending HttpJsonFetcher
class UserApiFetcher extends HttpJsonFetcher<any, any> {
  // Implement abstract methods (can be empty if no specific logic is needed)
  beforeFetch(fetch: any) {}
  afterFetch(fetch: any, response: any) {}
  before(config: any, pipe: any) {}
  afterSuccess(config: any, pipe: any) {}
  afterSuccessTransform(config: any, pipe: any) {}
  finally(config: any, pipe: any) {}
  error(config: any, pipe: any, e: any) {}
}

const userFetcher = new UserApiFetcher();

async function getUser(userId: number) {
  try {
    const user = await userFetcher.get<User>({
      target: `https://jsonplaceholder.typicode.com/users/${userId}`,
      // Optional: Add custom fetch config or error handling
      config: {
        fetch: { headers: { 'X-Custom-Header': 'Value' } },
        hasResponseErrorChecker: (response) => {
          if (response.status === 404) {
            return new Error('User not found');
          }
          return null;
        }
      },
      errorTransform: async (e) => {
        if (e instanceof HttpJsonResponseError) {
          console.error('HTTP JSON Error:', e.message, e.body);
        } else {
          console.error('Generic Error:', e);
        }
        throw e; // Re-throw to propagate the error
      }
    });
    console.log('Fetched User:', user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
}

getUser(1);
getUser(999); // Example of a non-existent user
```

### Message Module (Observable, Map, Filter)

```typescript
import { Observable } from '@dooboostore/core/message/Observable';
import { map } from '@dooboostore/core/message/operators/map';
import { filter } from '@dooboostore/core/message/operators/filter';

// Create a simple Observable that emits numbers
const source$ = new Observable<number>(subscriber => {
  let count = 0;
  const intervalId = setInterval(() => {
    subscriber.next(count++);
    if (count > 5) {
      subscriber.complete();
    }
  }, 100);

  return () => {
    clearInterval(intervalId);
    console.log('Observable unsubscribed');
  };
});

// Pipe operators to transform and filter the data
source$.pipe(
  filter(num => num % 2 === 0), // Only even numbers
  map(num => `Number: ${num * 10}`)
).subscribe({
  next: (data) => console.log(data),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('Completed!')
});

// Example with debounceTime
import { Subject } from '@dooboostore/core/message/Subject';
import { debounceTime } from '@dooboostore/core/message/operators/debounceTime';

const searchInput$ = new Subject<string>();

searchInput$.pipe(
  debounceTime(500) // Wait for 500ms of inactivity
).subscribe(searchText => {
  console.log('Searching for:', searchText);
  // In a real app, you would make an API call here
});

searchInput$.next('a');
searchInput$.next('ap');
searchInput$.next('app');
setTimeout(() => searchInput$.next('apple'), 600);
setTimeout(() => searchInput$.next('apple pie'), 700);

// Example with fromEvent
import { fromEvent } from '@dooboostore/core/message/internal/fromEvent';

const button = document.createElement('button');
button.textContent = 'Click Me';
document.body.appendChild(button);

fromEvent<MouseEvent>(button, 'click').subscribe({
  next: (event) => console.log('Button clicked:', event.type),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('Button event listener completed')
});
```

### CSS Parser (CssParser)

```typescript
import { CssParser, StyleRule, AtRule } from '@dooboostore/core/parser/css/CssParser';

// Parse a CSS string
const cssString = `
  /* Global styles */
  body {
    font-family: Arial, sans-serif;
    margin: 0;
  }

  @media (max-width: 600px) {
    .container {
      width: 100%;
    }
  }

  .header {
    background-color: #f0f0f0;
    padding: 10px;
  }
`;

const parser = new CssParser(cssString);

console.log('Parsed CSS:', parser.stringify());

// Accessing rules
const rules = parser.rules;
console.log('Number of top-level rules:', rules.length);

// Find a specific rule
const bodyRule = rules.find(rule => rule instanceof StyleRule && rule.selector === 'body') as StyleRule;
if (bodyRule) {
  console.log('Body rule declarations:', bodyRule.declarations);
  // Add a new declaration
  bodyRule.content.push({ type: 'declaration', property: 'color', value: '#333' });
}

// Find an at-rule and its children
const mediaRule = rules.find(rule => rule instanceof AtRule && rule.name === 'media') as AtRule;
if (mediaRule) {
  console.log('Media rule condition:', mediaRule.condition);
  console.log('Media rule children:', mediaRule.children.map(c => c.selector));
}

// Add a new rule
parser.append('.footer { text-align: center; padding: 20px; }');

console.log('\nModified CSS:', parser.stringify());
```
