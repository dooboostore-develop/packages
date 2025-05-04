# @dooboostore/core-node

`@dooboostore/core-node` is a companion library to `@dooboostore/core`, providing utility functions and classes specifically for the Node.js environment. It extends the core functionalities with features that interact with the file system and Node.js processes.

## Features

- **File System Utilities**: A robust `File` class and helper functions for common file operations like writing, moving, renaming, and copying files.
- **Buffer Conversion**: `ConvertUtils` for handling `Buffer` conversions, including Base64 decoding.
- **Node.js Specific**: Designed to work seamlessly within the Node.js runtime.

## Installation

```bash
# Using pnpm
pnpm add @dooboostore/core-node

# Using npm
npm install @dooboostore/core-node

# Using yarn
yarn add @dooboostore/core-node
```

## Peer Dependencies

This package requires `@dooboostore/core` to be installed as a peer dependency.

```json
"peerDependencies": {
  "@dooboostore/core": "workspace:*"
}
```

## Modules Overview

### `file/FileUtils`

This module provides tools for file system interaction.

- **`File` class**: An object-oriented wrapper around a file path that provides methods to:
  - Get file information (name, directory, extension, size).
  - `delete()`: Delete the file.
  - `copy(newPath)`: Copy the file to a new location.
  - `move(newPath)`: Move the file to a new location, creating directories if necessary.
  - `rename(newName)`: Rename the file within its current directory.

- **`writeFile(buffer, config)`**: Asynchronously writes a `Buffer` to a file. It can automatically generate a unique temporary file path or use a specified path.

### `convert/ConvertUtils`

This module extends the core `ConvertUtils` with Node.js-specific conversions.

- **`toBuffer(data, config)`**: Converts a string to a `Buffer`. It supports different encodings, including `'base64'`. When using `'base64'`, it can automatically strip the `data:image/png;base64,` prefix.

### `process/ProcessUtils`

This module is intended to contain utilities related to Node.js process management. (Currently, it contains commented-out examples of process event handlers like `exit`, `beforeExit`, `SIGINT`, and `uncaughtException`.)

## Basic Usage

### FileUtils

```typescript
import { FileUtils } from '@dooboostore/core-node/file/FileUtils';
import { ConvertUtils } from '@dooboostore/core-node/convert/ConvertUtils';
import * as fs from 'fs/promises';

async function handleFileUpload(base64Data: string) {
  // 1. Convert Base64 string to a Buffer
  const imageBuffer = ConvertUtils.toBuffer(base64Data, { encoding: 'base64' });

  // 2. Write the buffer to a temporary file
  const tempFile = await FileUtils.writeFile(imageBuffer, {
    originalName: 'my-image.png'
  });

  console.log(`File created at: ${tempFile.path}`);
  console.log(`File size: ${tempFile.size} bytes`);

  // 3. Move the file to a permanent location
  const permanentPath = `./uploads/${tempFile.fileName}`;
  await tempFile.move(permanentPath);

  console.log(`File moved to: ${tempFile.path}`);

  // 4. Clean up (optional, as move already relocated it)
  // await tempFile.delete();
}

// Example usage with a dummy base64 string
const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
handleFileUpload(dummyBase64);
```
