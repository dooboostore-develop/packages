import 'reflect-metadata';

// simple-boot-http-server-ssr itself
export * from './index';

// Re-export peer dependencies so bundle consumers can access them
// without separately importing each package
export * as Core from '@dooboostore/core';
export * as CoreNode from '@dooboostore/core-node';
export * as CoreWeb from '@dooboostore/core-web';
export * as DomParser from '@dooboostore/dom-parser';
export * as DomRender from '@dooboostore/dom-render';
export * as SimpleBoot from '@dooboostore/simple-boot';
export * as SimpleBootFront from '@dooboostore/simple-boot-front';
export * as SimpleBootHttpServer from '@dooboostore/simple-boot-http-server';
export * as SimpleWebComponent from '@dooboostore/simple-web-component';
