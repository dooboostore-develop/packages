import bootfactory from '@swc-src/bootfactory';
import { SwcAttributeConfigType } from '@dooboostore/simple-web-component/elements/SwcAppEngine';
import { UrlUtils } from '@dooboostore/core';
import { serviceFactories } from './services';
import { SimpleApplication } from '@dooboostore/simple-boot';

console.log('🚀 Client-side App Starting with SwcApplication...');

const w = window;
const d = w.document;

// const simpleApplication = new SimpleApplication()
bootfactory(w, serviceFactories, UrlUtils.getUrlPath(w.location));
