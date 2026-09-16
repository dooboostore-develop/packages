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
-   **⚙️ Process & Environment Access**: PID, platform, architecture, environment variables, CLI argv
-   **💾 Memory Profiling & Monitoring**: Heap snapshots, memory usage tracking, SIGUSR2 debugging signal handler
-   **🛣️ Path Operations**: Thin, typed wrapper around Node.js's `path` module
-   **🔌 Node.js Built-ins Only**: Implemented on top of `fs`/`path`/`process`/`v8`/`os` — no third-party runtime deps
-   **🎯 TypeScript Support**: Full TypeScript definitions with generics and advanced types
-   **🪶 Tree-Shaking Friendly**: Only import what you need from the root entry point

---

## Installation

`@dooboostore/core-node` depends on `@dooboostore/core` (installed automatically) and peer-depends on `reflect-metadata`:

```bash
# pnpm (recommended)
pnpm add @dooboostore/core-node reflect-metadata

# npm
npm install @dooboostore/core-node reflect-metadata

# yarn
yarn add @dooboostore/core-node reflect-metadata
```

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
  get fileName(): string                  // Just the filename (substring after the last '/')
  get directory(): string                 // Directory path (substring before the last '/')
  get extension(): string | undefined     // File extension (undefined if there is no '.')
  get originalName(): string | undefined  // Original filename passed in when constructed
  size?: number                           // File size in bytes (populated by updateStats())
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

`PathParamType` accepted throughout is `string | string[]` — an array is joined via `path.join(...)`.

```typescript
// Write a Buffer to a file (auto-generates an OS temp path if config.path is omitted)
writeFile<E = any>(buffer: Buffer, config?: {
  path?: string              // defaults to `${os.tmpdir()}/${uuid4()}_${Date.now()}`
  originalName?: string      // original filename, stored as File.originalName
  etcData?: E                // generic metadata, stored as File.etcData
}): Promise<File<E>>

// Read
readSync(path: PathParamType, config?: { option?: fs.readFileSync 2nd arg }): Buffer
readAsync(path: PathParamType, config?: { option?: fs.promises.readFile 2nd arg }): Promise<Buffer>
read(path: PathParamType, config: { option: fs.readFile 2nd arg }): Promise<Buffer>   // callback-style fs.readFile, promisified by return
readJsonSync<T = any>(path: PathParamType): T
readJsonAsync<T = any>(path: PathParamType): Promise<T>
readStringSync(path: PathParamType): string            // reads as 'utf-8'
readStringAsync(path: PathParamType): Promise<string>   // reads as 'utf-8'

// Write
write(data: string | Buffer, config: { path: PathParamType, options?: fs.WriteFileOptions }): string   // returns the resolved path
writeAppend(data: string | Buffer, config: { path: PathParamType, options?: fs.WriteFileOptions }): string

// Delete
deleteSync(path: PathParamType, config?: { options?: fs.RmOptions }): void       // fs.rmSync, only if it exists
deleteDirSync(path: PathParamType, config?: { options?: fs.RmDirOptions }): void // fs.rmdirSync, only if it exists
deleteFileSync(path: PathParamType): void                                        // fs.unlinkSync, only if it exists

// Copy
copySync(source: PathParamType, destination: PathParamType, options?: fs.cpSync 3rd arg): void

// Directory operations
mkdirSync(path: PathParamType, config?: MakeDirectoryOptions): void
mkdir(path: PathParamType, config?: MakeDirectoryOptions): Promise<string>
// Note: the callback keys are spelled `existes`/`noExistes` (typo preserved from the source), not `exists`/`noExists`
existsSync(path: PathParamType, config?: { existes?: (path: string) => void, noExistes?: (path: string) => void }): boolean

// Path handling
path(pathParam: PathParamType): string    // joins an array with path.join(...), or returns the string as-is
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

A thin, directly-named wrapper around Node's global `process` object.

```typescript
// Runtime identity
ProcessUtils.getPid(): number                     // process.pid
ProcessUtils.getPlatform(): NodeJS.Platform       // process.platform ('darwin' | 'linux' | 'win32' | ...)
ProcessUtils.getArch(): string                    // process.arch
ProcessUtils.getNodeVersion(): string             // process.version
ProcessUtils.getVersions(): NodeJS.ProcessVersions // process.versions (node, v8, openssl, ...)
ProcessUtils.getTitle(): string                   // process.title
ProcessUtils.getCwd(): string                     // process.cwd()
ProcessUtils.getUptime(): number                  // process.uptime()
ProcessUtils.getCpuUsage(): NodeJS.CpuUsage        // process.cpuUsage()
ProcessUtils.getArgv(): string[]                  // process.argv (NOT sliced — includes the node binary and script path)

// Environment
ProcessUtils.getEnv(key: string): string | undefined     // process.env[key]
ProcessUtils.setEnv(key: string, value: string): void     // process.env[key] = value
ProcessUtils.isProduction(): boolean   // process.env.NODE_ENV === 'production'
ProcessUtils.isDevelopment(): boolean  // process.env.NODE_ENV === 'development' || NODE_ENV is unset
ProcessUtils.isTest(): boolean         // process.env.NODE_ENV === 'test'

// Process control
ProcessUtils.exit(code: number = 0): void   // process.exit(code)
```

#### Example: Environment Configuration

```typescript
import { ProcessUtils } from '@dooboostore/core-node';

const config = {
  isDev: ProcessUtils.isDevelopment(),
  port: Number(ProcessUtils.getEnv('PORT')) || 3000,
  database: ProcessUtils.getEnv('DATABASE_URL') || 'localhost:5432'
};

console.log('🚀 Starting server...');
console.log(`  PID: ${ProcessUtils.getPid()}`);
console.log(`  Platform: ${ProcessUtils.getPlatform()} (${ProcessUtils.getArch()})`);
console.log(`  Environment: ${ProcessUtils.isProduction() ? 'Production' : 'Development'}`);
```

---

### 4️⃣ **Memory Profiling & Monitoring** (memory module)

Monitor heap usage and generate memory snapshots for debugging.

#### MemoryUtils Namespace

```typescript
// Raw memory usage (bytes — same shape as process.memoryUsage())
MemoryUtils.memoryUsage(): NodeJS.MemoryUsage   // { rss, heapTotal, heapUsed, external, arrayBuffers }

// Logs memory usage to the console, converted to MB
MemoryUtils.logMemoryUsage(): void

// Writes a V8 heap snapshot into `logPath` (a directory), filename is heap-<ISO timestamp>.heapsnapshot
// Returns the written file path, or null if v8.writeHeapSnapshot threw
MemoryUtils.writeHeapSnapshot(logPath: string): string | null

// Registers a SIGUSR2 handler that calls writeHeapSnapshot(logPath) when the process receives SIGUSR2
// (e.g. `kill -SIGUSR2 <pid>`, or `pm2 sendSignal SIGUSR2 <app-name>`)
MemoryUtils.registerHeapDumpSignal(logPath: string): void

// Starts a setInterval that calls logMemoryUsage() every `intervalMs`, and if `thresholdMB`
// is exceeded, warns and (if `logPath` is given) writes an automatic heap snapshot.
// Returns the interval handle so you can clearInterval() it later.
MemoryUtils.startMemoryMonitoring(intervalMs?: number /* default 5 min */, thresholdMB?: number, logPath?: string): NodeJS.Timeout
```

#### Example: Memory Monitoring

```typescript
import { MemoryUtils } from '@dooboostore/core-node';

// Log memory every 30s, and auto-dump a heap snapshot into ./heaps if usage exceeds 500MB
MemoryUtils.startMemoryMonitoring(30_000, 500, './heaps');

// Also dump on demand via `kill -SIGUSR2 <pid>`
MemoryUtils.registerHeapDumpSignal('./heaps');
```

---

### 5️⃣ **Path Operations** (PathUtils)

Wrapper around Node.js `path` module with type-safe handling.

#### PathUtils Namespace

A direct, one-to-one wrapper around Node's `path` module (plus `processCwd()` for `process.cwd()`). Every function takes plain string arguments — unlike `FileUtils`'s `PathParamType`, it does **not** accept an array in place of the rest-args.

```typescript
PathUtils.processCwd(): string                                   // process.cwd()
PathUtils.join(...paths: string[]): string                       // path.join(...)
PathUtils.resolve(...paths: string[]): string                    // path.resolve(...)
PathUtils.normalize(path: string): string                        // path.normalize(path)
PathUtils.dirname(path: string): string                          // path.dirname(path)
PathUtils.basename(path: string, suffix?: string): string        // path.basename(path, suffix)
PathUtils.extname(path: string): string                          // path.extname(path)
PathUtils.isAbsolute(path: string): boolean                      // path.isAbsolute(path)
PathUtils.relative(from: string, to: string): string              // path.relative(from, to)
PathUtils.parse(path: string): path.ParsedPath                   // path.parse(path)
PathUtils.format(pathObject: path.FormatInputPathObject): string // path.format(pathObject)
```

#### Example: Path Handling

```typescript
import { PathUtils } from '@dooboostore/core-node';

const configPath = PathUtils.join('./config', 'env', 'production.json');

// Parse file parts
const parsed = PathUtils.parse('/app/src/index.ts');
// { root: '/', dir: '/app/src', base: 'index.ts', ext: '.ts', name: 'index' }
```

---

### 6️⃣ **Data Conversion** (ConvertUtils)

Convert between Buffers, strings, and handle Base64 encoding/decoding.

#### ConvertUtils Namespace

```typescript
// Buffer (or string, passed through unchanged) to String
ConvertUtils.toString(data: string | Buffer, config?: {
  encoding?: BufferEncoding   // default: 'utf-8'; forwarded to Buffer#toString(encoding, start, end)
  start?: number
  end?: number
}): string

// String to Buffer
ConvertUtils.toBuffer(data: string, config?: { encoding: BufferEncoding }): Buffer
```

`toBuffer` only special-cases `config.encoding === 'base64'`: it strips an optional Data URL prefix
(everything up to and including `;base64,`, e.g. `"data:image/png;base64,iVBORw0KGgo..."`) and decodes
the rest as base64. For any other (or missing) `encoding`, it returns `Buffer.from(data)` (UTF-8) —
other encoding values are not applied.

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
  const baseUrl = ProcessUtils.getEnv('BUILD_URL') || 'http://localhost:3000';

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
  environment: ProcessUtils.isProduction() ? 'production' : 'development',
  port: Number(ProcessUtils.getEnv('PORT')) || 3000,
  debug: ProcessUtils.getEnv('DEBUG') === 'true'
};
```

### Example 4: Memory Monitoring

```typescript
import { MemoryUtils } from '@dooboostore/core-node';

// Enable SIGUSR2 heap profiling — `kill -SIGUSR2 <pid>` dumps a snapshot into ./heap-dumps
MemoryUtils.registerHeapDumpSignal('./heap-dumps');

// Also log + auto-dump every 30s if heap usage exceeds 500MB
MemoryUtils.startMemoryMonitoring(30_000, 500, './heap-dumps');
```

---

## 🔗 Relationship to @dooboostore/core

`core-node` depends on `@dooboostore/core` for two things specifically: `HttpPageDownloader` uses `core`'s `HttpFetcher`/`HttpFetcherRequest` to perform the actual HTTP GET, and `FileUtils.writeFile` uses `core`'s `RandomUtils.uuid4()` to generate a temp file name when no `path` is given. Everything else in this package (file, process, memory, path, convert) is implemented directly on Node.js built-ins and has no further dependency on `core`.

| Feature | @dooboostore/core-node |
|---------|---|
| File I/O | ✅ |
| Process/Env | ✅ |
| Memory Profiling | ✅ |
| Buffer/Base64 Conversion | ✅ |
| Path Operations | ✅ |
| HTTP page fetching | ✅ (via `core`'s `HttpFetcher`) |

---

## 🎓 Best Practices

1. **Use `File<E>` for type-safe metadata** — `etcData` carries whatever metadata you need alongside the file.
2. **Register a SIGUSR2 heap dump handler in production** — `MemoryUtils.registerHeapDumpSignal(dir)` lets you trigger a heap snapshot on demand via `kill -SIGUSR2 <pid>`, without restarting the process.
3. **Use `ProcessUtils` for environment checks** — `isProduction()`/`isDevelopment()`/`isTest()` read `NODE_ENV` consistently.
4. **Use `PathUtils` for cross-platform path handling** instead of string concatenation.

---

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).