import bootfactory from "@swc-src/bootfactory";
import {SwcAttributeConfigType} from "@dooboostore/simple-web-component/elements/SwcAppEngine";
import {UrlUtils} from "@dooboostore/core/url";

console.log('🚀 Client-side App Starting with SwcApplication...');

const w = window;
const d = w.document;

bootfactory(w, UrlUtils.getUrlPath(w.location));
// If we want to check if it's already there (from SSR)
const helloEl = d.querySelector('hello-component');
if (helloEl) {
  console.log('✅ Found hello-component from SSR');
}
