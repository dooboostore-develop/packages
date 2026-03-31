# @dooboostore/core-node

[![NPM version](https://img.shields.io/npm/v/@dooboostore/core-node.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/core-node)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


A comprehensive Node.js-specific utility library extending `@dooboostore/core` with file system operations, process management, memory profiling, and batch HTTP downloading capabilities. Perfect for backend services, CLI tools, SSR applications, and DevOps workflows.

---

## ✨ Key Features

-   **📁 Rich File System Operations**: `File<E>` class with read/write/copy/move/delete/rename operations—no raw fs callbacks
-   **📄 Buffer & Data Conversion**: String ↔ Buffer conversions with Base64 support (data URLs compatible)
-   **🌐 Batch URL Processing**: `HttpPageDownloader` for SSR to static HTML generation (pre-rendering workflows)
-   **⚙️ Process & Environment Access**: PID, platform, architecture, environment variables, CLI arguments, signals
-   **💾 Memory Profiling & Monitoring**: Heap snapshots, memory usage tracking, SIGUSR2 debugging signals
-   **🛣️ Advanced Path Operations**: Wrapper around Node.js `path` module with type-safe handling
-   **🔌 Zero Dependencies**: Uses only Node.js built-ins (fs, path, process, v8, os)
-   **🎯 TypeScript Support**: Full TypeScript definitions with generics and advanced types
-   **🪶 Tree-Shaking Friendly**: Only import what you need from the root entry point

---

## Installation

Install `@dooboostore/core-node` and its peer dependency:

```bash
# pnpm (recommended)
pnpm add @dooboostore/core-node @dooboostore/core

# npm
npm install @dooboostore/core-node @dooboostore/core

# yarn
yarn add @dooboostore/core-node @dooboostore/core
```

**Peer Dependency:** `@dooboostore/core` (any version >= 1.0.0)

---

## 📚 Module Organization

`@dooboostore/core-node` includes **6 focused modules**:

| Module | Purpose | Key Exports |
|--------|---------|------------|
| **file** | File system operations | `FileUtils`, `File<E>` class |
| **fetch** | HTTP page downloading | `HttpPageDownloader` |
| **process** | Process information | `ProcessUtils` (PID, platform, env) |
| **memory** | Memory profiling | `MemoryUtils` (heap snapshots, monitoring) |
| **path** | Path operations | `PathUtils` (join, resolve, normalize) |
| **convert** | Data conversion | `ConvertUtils` (Buffer ↔ String, Base64) |

---

## 🎯 Core Modules Deep Dive

### 1️⃣ **File System Operations** (FileUtils)

Complete file system abstraction with an object-oriented `File<E>` class.

#### File Class

```typescript
class File<E = any> {
  // Properties
  get path(): string                      // Full file path
  get fileName(): string                  // Just the filename
  get directory(): string                 // Directory path
  get extension(): string | undefined     // File extension
  size?: number                           // File size in bytes
  etcData?: E                             // Generic metadata

  // Methods
  async updateStats(): Promise<void>      // Refresh file stats
  async delete(): Promise<void>           // Delete the file
  async copy(newPath: string): Promise<void>       // Copy to new location
  async move(newPath: string): Promise<void>       // Move (creates dirs if needed)
  async rename(newName: string): Promise<void>     // Rename file
}
```

#### FileUtils Namespace

```typescript
// Write buffer to file
writeFile<E>(buffer: Buffer, config?: {
  path?: string              // Auto-generates temp path if not provided
  originalName?: string      // Original filename for metadata
  etcData?: E               // Generic metadata (generic type E)
}): Promise<File<E>>

// Read file content
readSync(path: PathParam): Buffer              // Synchronous read
readAsync(path: PathParam): Promise<Buffer>    // Async read

// Read JSON
readJsonSync<T>(path: PathParam): T            // Parse JSON file
readJsonAsync<T>(path: PathParam): Promise<T>

// Read as string
readStringSync(path: PathParam): string
readStringAsync(path: PathParam): Promise<string>

// Directory operations
mkdirSync(path: PathParam, options?: MakeDirectoryOptions): void
mkdir(path: PathParam, options?: MakeDirectoryOptions): Promise<string>
existsSync(path: PathParam, callbacks?: { exists?, noExists? }): boolean

// Path handling
path(pathParam: string | string[]): string    // Join path array or return string
```

#### Example: File Upload Handler

```typescript
import { FileUtils } from '@dooboostore/core-node';

interface UploadMetadata {
  userId: string;
  uploadedAt: Date;
  mimeType?: string;
}

async function handleFileUpload(buffer: Buffer, metadata: UploadMetadata) {
  // Save file with metadata
  const file = await FileUtils.writeFile<UploadMetadata>(buffer, {
    path: './uploads/user-files/document.pdf',
    originalName: 'my-document.pdf',
    etcData: metadata
  });

  console.log(`File saved: ${file.path}`);
  console.log(`Size: ${file.size} bytes`);
  console.log(`User ID: ${file.etcData?.userId}`);

  // Copy to backup
  await file.copy('./backups/document.pdf');

  // Rename after processing
  await file.rename('document-processed.pdf');

  return file;
}
```

---

### 2️⃣ **HTTP Page Downloading** (fetch module)

Batch download HTML pages from a running server for SSR pre-rendering workflows.

#### HttpPageDownloader Class

```typescript
class HttpPageDownloader {
  constructor(
    baseUrl: string,                               // e.g., 'http://localhost:3000'
    httpFetcher?: HttpFetcher                      // Optional custom fetcher
  )

  // Methods
  async download(route: string): Promise<string>  // Fetch HTML for a route
  async downloadAndSave(outputDir: string, route: string): Promise<void>
  async downloadAndSaveAll(outputDir: string, routes: string[]): Promise<void>
}
```

#### Example: SSR Static Site Generation

```typescript
import { HttpPageDownloader } from '@dooboostore/core-node';

async function generateStaticSite() {
  const downloader = new HttpPageDownloader('http://localhost:3000');

  const routes = [
    '/',
    '/about',
    '/products',
    '/products/1',
    '/contact'
  ];

  // Generate all static HTML files
  await downloader.downloadAndSaveAll('./dist', routes);
  console.log('✅ Static site generated in ./dist');
}

generateStaticSite();
```

---

### 3️⃣ **Process & Environment** (ProcessUtils)

Access to Node.js process information and environment variables.

#### ProcessUtils Namespace

```typescript
// Get process ID
ProcessUtils.pid(): number                    // Current process PID

// Get runtime environment
ProcessUtils.platform(): NodeJS.Platform      // 'linux' | 'darwin' | 'win32'
ProcessUtils.arch(): string                   // 'x64' | 'arm64' | 'x32'
ProcessUtils.version(): string                // Node.js version

// Environment detection
ProcessUtils.isDev(): boolean                 // process.env.NODE_ENV === 'development'
ProcessUtils.isProd(): boolean                // process.env.NODE_ENV === 'production'
ProcessUtils.isTest(): boolean                // process.env.NODE_ENV === 'test'

// Environment variables
ProcessUtils.env(key: string): string | undefined
ProcessUtils.envRequired(key: string): string // Throws if missing
ProcessUtils.envBool(key: string): boolean    // Parse boolean env var
ProcessUtils.envInt(key: string): number      // Parse integer env var

// CLI arguments
ProcessUtils.argv(): string[]                 // process.argv.slice(2)
ProcessUtils.argvMap(): Record<string, string>  // Parse --key=value format

// Memory info
ProcessUtils.memoryUsage(): NodeJS.MemoryUsage  // Heap, external, RSS
ProcessUtils.uptime(): number                 // Process uptime in seconds

// Process control
ProcessUtils.exit(code?: number): void        // Graceful exit
ProcessUtils.restart(): void                  // Restart process
```

#### Example: Environment Configuration

```typescript
import { ProcessUtils } from '@dooboostore/core-node';

const config = {
  isDev: ProcessUtils.isDev(),
  port: ProcessUtils.envInt('PORT') || 3000,
  apiKey: ProcessUtils.envRequired('API_KEY'),
  debugMode: ProcessUtils.envBool('DEBUG'),
  database: ProcessUtils.env('DATABASE_URL') || 'localhost:5432'
};

console.log('🚀 Starting server...');
console.log(`  PID: ${ProcessUtils.pid()}`);
console.log(`  Platform: ${ProcessUtils.platform()} (${ProcessUtils.arch()})`);
console.log(`  Environment: ${ProcessUtils.isProd() ? 'Production' : 'Development'}`);
```

---

### 4️⃣ **Memory Profiling & Monitoring** (memory module)

Monitor heap usage and generate memory snapshots for debugging.

#### MemoryUtils Namespace

```typescript
// Memory monitoring
MemoryUtils.getCurrentMemoryUsage(): {
  rss: number,          // Resident set size (MB)
  heapTotal: number,    // Total heap (MB)
  heapUsed: number,     // Used heap (MB)
  external: number      // External memory (MB)
}

// Heap snapshots
MemoryUtils.writeHeapSnapshot(filename?: string): Promise<string>
  // Generates snapshot file (default: heap-${timestamp}.heapsnapshot)

// Memory threshold alerts
MemoryUtils.onMemoryThreshold(threshold: number, callback: () => void): void

// SIGUSR2 signal handler for profiling
MemoryUtils.enableUSR2Profiling(outputDir?: string): void
  // Dumps heap snapshot on SIGUSR2 signal
```

#### Example: Memory Monitoring

```typescript
import { MemoryUtils, ProcessUtils } from '@dooboostore/core-node';

// Monitor every 5 seconds
setInterval(() => {
  const { heapUsed, heapTotal, rss } = MemoryUtils.getCurrentMemoryUsage();
  
  console.log(`📊 Memory: ${heapUsed.toFixed(2)} / ${heapTotal.toFixed(2)}MB`);
}, 5000);

// Alert on high memory
MemoryUtils.onMemoryThreshold(500, () => {
  console.warn('⚠️ High memory! Dumping heap...');
  MemoryUtils.writeHeapSnapshot('./heaps/high.heapsnapshot');
});
```

---

### 5️⃣ **Path Operations** (PathUtils)

Wrapper around Node.js `path` module with type-safe handling.

#### PathUtils Namespace

```typescript
// Join paths (flexible input)
PathUtils.join(...paths: Array<string | string[]>): string

// Resolve to absolute path
PathUtils.resolve(path: string): string

// Normalize path
PathUtils.normalize(path: string): string

// Extract components
PathUtils.dirname(path: string): string      // Get directory
PathUtils.basename(path: string): string     // Get filename
PathUtils.extname(path: string): string      // Get extension
```

#### Example: Cross-Platform Paths

```typescript
import { PathUtils } from '@dooboostore/core-node';

// Works on Windows too
const configPath = PathUtils.join(['./config', 'env', 'production.json']);

// Parse file parts
const parsed = PathUtils.parse('/app/src/index.ts');
// { root: '/', dir: '/app/src', base: 'index.ts', ext: '.ts', name: 'index' }
```

---

### 6️⃣ **Data Conversion** (ConvertUtils)

Convert between Buffers, strings, and handle Base64 encoding/decoding.

#### ConvertUtils Namespace

```typescript
// Buffer to String
ConvertUtils.toString(buffer: Buffer, config?: {
  encoding?: BufferEncoding   // 'utf-8', 'base64', 'hex', etc. (default: 'utf-8')
  start?: number
  end?: number
}): string

// String to Buffer
ConvertUtils.toBuffer(data: string, config?: {
  encoding?: BufferEncoding   // 'utf-8', 'base64', 'hex', etc. (default: 'utf-8')
}): Buffer

// Handles Base64 Data URLs automatically
// Input: "data:image/png;base64,iVBORw0KGgo..."
```

#### Example: Image Processing

```typescript
import { ConvertUtils, FileUtils } from '@dooboostore/core-node';

async function saveBase64Image(dataUrl: string) {
  // Handle data URLs: "data:image/png;base64,iVBORw0KGgo..."
  const buffer = ConvertUtils.toBuffer(dataUrl, { encoding: 'base64' });

  const file = await FileUtils.writeFile(buffer, {
    path: './uploads/image.png',
    originalName: 'avatar.png'
  });

  return file.path;
}
```

---

## 📖 Usage Examples

### Example 1: Complete File Upload Workflow

```typescript
import { FileUtils } from '@dooboostore/core-node';

interface UploadMetadata {
  userId: string;
  uploadedAt: Date;
  fileSize: number;
}

async function handleUpload(buffer: Buffer, userId: string) {
  const file = await FileUtils.writeFile<UploadMetadata>(buffer, {
    path: `./uploads/${userId}/document.pdf`,
    originalName: 'resume.pdf',
    etcData: {
      userId,
      uploadedAt: new Date(),
      fileSize: buffer.length
    }
  });

  console.log(`✅ Saved: ${file.fileName} (${file.size} bytes)`);
  await file.copy(`./backups/${userId}-${Date.now()}.pdf`);
  
  return file;
}
```

### Example 2: SSR Static Generation

```typescript
import { HttpPageDownloader } from '@dooboostore/core-node';
import { ProcessUtils } from '@dooboostore/core-node';

async function buildStaticSite() {
  const baseUrl = ProcessUtils.env('BUILD_URL') || 'http://localhost:3000';

  const downloader = new HttpPageDownloader(baseUrl);
  const routes = ['/', '/about', '/products', '/contact'];

  await downloader.downloadAndSaveAll('./dist', routes);
  console.log(`✨ Generated ${routes.length} static pages`);
}
```

### Example 3: Environment-based Configuration

```typescript
import { ProcessUtils } from '@dooboostore/core-node';

const config = {
  environment: ProcessUtils.isProd() ? 'production' : 'development',
  port: ProcessUtils.envInt('PORT') || 3000,
  apiKey: ProcessUtils.envRequired('API_KEY'),
  debug: ProcessUtils.envBool('DEBUG'),
  ...ProcessUtils.argvMap()
};
```

### Example 4: Memory Monitoring

```typescript
import { MemoryUtils } from '@dooboostore/core-node';

// Enable SIGUSR2 heap profiling
MemoryUtils.enableUSR2Profiling('./heap-dumps');

// Monitor heap (kill -USR2 <pid> to capture snapshot)
setInterval(() => {
  const { heapUsed } = MemoryUtils.getCurrentMemoryUsage();
  console.log(`Heap: ${heapUsed.toFixed(2)}MB`);
}, 30000);
```

---

## 🔗 Integration with @dooboostore/core

| Feature | @dooboostore/core | @dooboostore/core-node |
|---------|---|---|
| Reactive/Observable | ✅ | Reuses |
| Validators | ✅ | Reuses |
| HTTP Client | ✅ | ✅ (Extended) |
| File I/O | ❌ | ✅ |
| Process/Env | ❌ | ✅ |
| Memory Profiling | ❌ | ✅ |
| Buffer Operations | ❌ | ✅ |
| Path Operations | ❌ | ✅ |

---

## 📊 Performance Characteristics

| Aspect | Details |
|--------|---------|
| **Dependencies** | 0 (Node.js only) |
| **Bundle Size** | ~15KB gzipped |
| **File Ops** | Native performance |
| **Heap Snapshots** | ~1-2s per 50MB |
| **Tree-Shaking** | ✅ Full support |
| **Node Versions** | 14.0+ |

---

## 🎓 Best Practices

1. **Use File<E> for type-safe metadata**
2. **Enable SIGUSR2 profiling in production**
3. **Use ProcessUtils for env configuration**
4. **Monitor heap in long-running processes**
5. **Use PathUtils for cross-platform compatibility**

---

## Learn More

The detailed API documentation is available on our documentation website.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).