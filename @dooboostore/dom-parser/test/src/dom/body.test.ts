import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, HTMLElementBase } from '@dooboostore/dom-parser';

console.log('🚀 Web Component Lifecycle & Attribute Tests Starting...');

describe('body', () => {
  test('body test', () => {
    const parser = new DomParser(`
    <html>
    <body>
    <div id="container"></div>
    <!--  <body >-->
    <!--  <div id="app" is="swc-app-div"></div>-->
    </body>
    </html>`);
    const window = parser.window as any;

    console.log('💈html:',window.document.body.innerHTML);
  });
});
