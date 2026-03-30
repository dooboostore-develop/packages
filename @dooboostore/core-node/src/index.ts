// ============================================================================
// @dooboostore/core-node - Root Exports
// ============================================================================
// This file exports Node.js-specific utilities for use via '@dooboostore/core-node' only.
// Subpath imports (e.g., '@dooboostore/core-node/src/file') are not supported.
// All imports must go through this root entry point.
// ============================================================================

// === File System Operations ===
export * from './file';           // FileUtils, File<E> class with operations

// === HTTP & Page Downloading ===
export * from './fetch';          // HttpPageDownloader for batch HTML downloads

// === Process & Environment ===
export * from './process';        // ProcessUtils (PID, platform, arch, env, args)

// === Memory Profiling & Monitoring ===
export * from './memory';         // Memory monitoring, heap snapshots, profiling

// === Path Utilities ===
export * from './path';           // Path operations (join, resolve, normalize)

// === Data Conversion ===
export * from './convert';        // Buffer ↔ String conversion, Base64 support

// ============================================================================
// Default Export
// ============================================================================
export default {
  // Node.js utilities are exported as named exports above
  // Use: import { FileUtils, ProcessUtils, ... } from '@dooboostore/core-node'
}