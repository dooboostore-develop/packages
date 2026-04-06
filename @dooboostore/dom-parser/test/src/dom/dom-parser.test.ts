import {describe, test} from 'node:test';
import assert from 'node:assert/strict';
import register, {elementDefine, onConnectedInnerHtml, SwcAppInterface, SwcUtils} from '@dooboostore/simple-web-component'
import {Router} from "@dooboostore/core-web";

describe('DomParser Template Parsing', () => {
  test('origin DomParserTest', async () => {
    const html = `<!DOCTYPE html>
     <html lang="ko">
     <head></head>
     <body id="app" is="swc-app-body">
     </body>
     </html>
    `;


    const doc = new DOMParser().parseFromString(html, 'text/html')


    console.log('Document body innerHTML:', doc);
    //
    // const routerTemplate = doc.body.querySelector('#router');
    // console.log('Router Template exists:', !!routerTemplate);
    // assert.ok(routerTemplate, 'Router template should exist in document');
    //
    // if (routerTemplate) {
    //   const childTemplates = (routerTemplate as any).content.querySelectorAll('template');
    //   console.log('Child templates count:', childTemplates.length);
    //   console.log('Content innerHTML:', (routerTemplate as any).content.innerHTML);
    // }
  });

});
