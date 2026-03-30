// ============================================================================
// @dooboostore/core-web - Root Exports
// ============================================================================
// This file exports web-specific utilities for use via '@dooboostore/core-web' only.
// Subpath imports (e.g., '@dooboostore/core-web/src/element') are not supported.
// All imports must go through this root entry point.
// ============================================================================

// === DOM & Node Manipulation ===
export * from './element';         // ElementUtils (query, create, manipulate DOM elements)
export * from './node';            // NodeUtils (DOM tree traversal and filtering)
export * from './document';        // DocumentUtils (document-level operations)

// === Event Handling ===
export * from './event';           // EventUtils (HTMLElement events as Observables)
export * from './window';          // WindowUtils (window events as Observables)

// === Storage & Cookies ===
export * from './storage';         // StorageUtils (localStorage, sessionStorage with JSON)
export * from './cookie';          // CookieUtils (RFC-compliant cookie management)

// === Data Conversion & Clipboard ===
export * from './convert';         // ConvertUtils (Canvas, Blob, ImageBitmap, Base64 conversions)
export * from './clipboard';       // ClipBoardUtils (read/write clipboard)
export * from './download';        // DownloadUtils (file download, CSV export)

// === Resource Loading ===
export * from './fetch';           // HttpDomParserFetcher (auto-parsing HTML/XML/SVG)
export * from './script';          // ScriptUtils (dynamic script/stylesheet loading)
export * from './image';           // ImageUtils (image utilities)

// === Navigation & Routing ===
export * from './location';        // LocationUtils (hash/path-based URL parsing)
export * from './routers';         // Router implementations (PathRouter, HashRouter, LocationRouter)

// === Styling & CSS ===
export * from './stylecss';        // StyleCssUtils (CSS properties, variables)

// === Animation & Graphics ===
export * from './animation';       // AnimationFrameUtils (FPS monitoring, throttled animation)

// === Browser/Platform Detection ===
export * from './valid';           // ValidUtils (browser/platform detection)

// ============================================================================
// Default Export
// ============================================================================
export default {
  // Web utilities are exported as named exports above
  // Use: import { ElementUtils, EventUtils, StorageUtils, ... } from '@dooboostore/core-web'
}
