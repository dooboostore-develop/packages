// ============================================================================
// @dooboostore/core - Root Exports
// ============================================================================
// This file exports core utilities for use via '@dooboostore/core' only.
// Subpath imports (e.g., '@dooboostore/core/src/message') are not supported.
// All imports must go through this root entry point.
// ============================================================================

// === TIER 1: Foundation Utilities ===
export * from './valid';           // Type guards (ValidUtils)
export * from './array';           // Array utilities (ArrayUtils)
export * from './object';          // Object utilities (ObjectUtils)
export * from './string';          // String utilities (StringUtils)
export * from './date';            // Date utilities (DateUtils)
export * from './math';            // Math utilities (MathUtil)
export * from './convert';         // Type conversion (ConvertUtils)
export * from './random';          // Randomization (RandomUtils)

// === TIER 1: Async/Reactive Core ===
export * from './message';         // Observable, Subject, Operators
export * from './promise';         // Promises, AbortablePromise

// === TIER 2: Domain-Specific ===
export * from './validators';      // Form validators (Validator, FormValidator, 30+ validators)
export * from './fetch';           // HTTP client (HttpFetcher, HttpJsonFetcher)
export * from './entity';          // Geometry (Point2D, Point3D, Polygon, Rect, Ellipse, Vector)
export * from './runs';            // Runnable pattern

// === TIER 3: Advanced Async Patterns ===
export * from './transaction';     // Transaction management (TransactionManager)
export * from './schedule';        // Cron scheduling (ScheduleBase)
export * from './store';           // Store loader pattern (StoreLoader)

// === TIER 4: Specialized Utilities ===
export * from './url';             // URL utilities (UrlUtils)
export * from './logger';          // Logging (Logger)
export * from './storage';         // Storage abstraction (Storage, MemoryStorage)
export * from './reflect';         // TypeScript reflection (ReflectUtils)
export * from './function';        // Function utilities (FunctionUtils)
export * from './optional';        // Optional monad (Optional)
export * from './iterators';       // Range iterators (Range)
export * from './queues';          // Async queues (AsyncBlockingQueue)
export * from './parser/css/CssParser';  // CSS parser
export * from './advice';          // AOP exception handling (Advice)
export * from './code';            // Code constants (ISO3166-1 country codes)
export * from './image';           // Image utilities (ImageUtils)
export * from './expression';      // Expression evaluation (Expression)

// === Type Exports ===
export type * from './types';

// ============================================================================
// Default Export
// ============================================================================
export default {
  // Core utilities are exported as named exports above
  // Use: import { Observable, Subject, Promises, ... } from '@dooboostore/core'
}