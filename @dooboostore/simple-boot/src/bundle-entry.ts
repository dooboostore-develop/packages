import 'reflect-metadata';

// simple-boot itself
export * from './index';

// Re-export peer dependency so bundle consumers can access it
// without separately importing each package
export * as Core from '@dooboostore/core';
