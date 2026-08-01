import 'reflect-metadata';

// simple-boot-http-server itself
export * from './index';

// Re-export peer dependencies so bundle consumers can access them
// without separately importing each package
export * as Core from '@dooboostore/core';
export * as CoreNode from '@dooboostore/core-node';
export * as CoreWeb from '@dooboostore/core-web';
export * as DomRender from '@dooboostore/dom-render';
export * as SimpleBoot from '@dooboostore/simple-boot';
