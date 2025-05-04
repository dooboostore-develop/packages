# @dooboostore/core

`@dooboostore/core` is a comprehensive utility library for TypeScript/JavaScript projects. It provides a wide range of tools and helpers to streamline development, from basic data manipulation to complex asynchronous operations, rendering, and state management.

## Features

- **Rich Utilities**: A vast collection of utilities for arrays, objects, strings, dates, and mathematical operations.
- **Type-Safe**: Written in TypeScript with a focus on providing powerful and flexible utility types.
- **Asynchronous Toolkit**: Advanced tools for handling Promises, including loops, transactions, queues, and state wrappers.
- **Messaging System**: A simple yet powerful messaging system based on the Observer pattern (`Observable`, `Subject`).
- **HTTP Fetcher**: A flexible and extensible HTTP client framework (`HttpFetcher`, `HttpJsonFetcher`).
- **2D/3D Rendering Engine**: A set of base classes (`Obj`, `Vector`, `Rect`, `RenderTransactionDrawObj`) for building 2D/3D rendering applications with transaction-based animations.
- **Standardized Codes**: Includes common standards like `IOS3166_1` country codes.
- **Extensible Components**: Base classes and interfaces like `Runnable`, `Schedule`, `Storage`, and `Advice` to build upon.

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

- **`Promises`**: A powerful namespace for working with Promises. Includes `sleep`, `settle`, `loop` for creating polling mechanisms, and `Result.wrap` to handle promise states gracefully.
- **`message`**: Implements the Observer pattern with `Observable`, `Subject`, and `Subscription`. Also provides `debounce` and `throttle` functions.
- **`queues`**: `AsyncBlockingQueue` for managing a queue of asynchronous tasks.
- **`fetch`**: A robust HTTP client framework.
  - `HttpFetcher`: Base class for making HTTP requests.
  - `HttpJsonFetcher`: Extends `HttpFetcher` to simplify working with JSON APIs.
- **`transaction`**: `TransactionManager` and `Transaction` interface for managing a series of operations that can be rolled back.

### Core Entities & Rendering

- **`entity`**: A collection of classes representing fundamental data structures.
  - `Point2D`, `Point3D`: Represent coordinates in 2D and 3D space.
  - `Vector`: A class for vector mathematics (magnitude, addition, subtraction, dot product, etc.).
  - `Rect`: Represents a rectangle with helper methods for collision detection and coordinate manipulation.
  - `Scalar`: A wrapper for primitive numbers to perform chained mathematical operations.
  - `Obj`, `RenderDrawObj`, `RenderTransactionDrawObj`: A suite of classes forming a mini-rendering engine. It supports objects with properties like position, rotation, and color, and includes a powerful transaction system for creating complex, chained animations.

### Application Structure

- **`runs`**: `Runnable` interface and related helpers to define executable components.
- **`schedule`**: A cron-like scheduler (`Schedule`, `ScheduleBase`) for running tasks at specified intervals.
- **`storage`**: A generic `Storage` interface with a `MemoryStorage` implementation and `StorageUtils` for easy data persistence.
- **`logger`**: A configurable `Logger` class with support for different log levels and custom formatting.
- **`optional`**: `Optional` class for safely handling nullable values, inspired by Java's Optional.
- **`advice`**: An `Advice` abstract class for implementing Aspect-Oriented Programming (AOP) patterns.

### Types

- **`types.ts`**: A rich file containing dozens of advanced utility types for TypeScript, such as `WithRequiredProperty`, `Optional`, `FlattenObjectKeys`, `UnionToTuple`, and more, enabling highly flexible and type-safe code.

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
import { HttpJsonFetcher } from '@dooboostore/core/fetch/HttpJsonFetcher';

// Note: This is a conceptual example. HttpJsonFetcher is an abstract class.
class MyFetcher extends HttpJsonFetcher<any, any> {
    // Implementation of abstract methods
    beforeFetch(fetch) {}
    afterFetch(fetch, response) {}
    before(config, pipe) {}
    afterSuccess(config, pipe) {}
    afterSuccessTransform(config, pipe) {}
    finally(config, pipe) {}
    error(config, pipe, e) {}
}

const fetcher = new MyFetcher();

async function getUser() {
  try {
    const user = await fetcher.get({
      target: 'https://api.example.com/users/1'
    });
    console.log(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
}

getUser();
```
