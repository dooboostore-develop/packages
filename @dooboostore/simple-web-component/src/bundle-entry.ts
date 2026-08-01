import 'reflect-metadata';

// simple-web-component itself
export * from './index';

// Re-export peer dependencies so bundle consumers can access them
// without separately importing each package
export * as Core from '@dooboostore/core';
export * as CoreWeb from '@dooboostore/core-web';
export * as SimpleBoot from '@dooboostore/simple-boot';
