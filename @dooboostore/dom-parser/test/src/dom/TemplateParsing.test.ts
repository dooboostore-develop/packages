import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '../../../src/DomParser';

describe('DomParser Template Parsing', () => {
  test('should parse nested templates correctly', () => {
    const html = `
      <template id="router" is="swc-choose" skip-if-same="">
        <!-- Main Home -->
        <template is="swc-when" value="{{ ['','/'].includes($value?.path) }}" skip-if-same="">
          <center-main-page></center-main-page>
        </template>
        <template is="swc-when" value="{{ ['/user'].includes($value?.path) }}" skip-if-same="">
          <center-user-page></center-user-page>
        </template>
      </template>
    `;
    const parser = new DomParser(html);
    const doc = parser.document;

    const routerTemplate = doc.body.querySelector('#router');
    console.log('Router Template exists:', !!routerTemplate);
    assert.ok(routerTemplate, 'Router template should exist in document');

    if (routerTemplate) {
      const childTemplates = (routerTemplate as any).content.querySelectorAll('template');
      console.log('Child templates count:', childTemplates.length);
      console.log('Content innerHTML:', (routerTemplate as any).content.innerHTML);
    }
  });

  test('should parse templates correctly in SSR fragment', () => {
    const html = `
      <template is="swc-when" value="{{ ['','/'].includes($value?.path) }}" skip-if-same="">
        <index-route></index-route>
      </template>
      <template is="swc-when" value="{{ ['/user'].includes($value?.path) }}" skip-if-same="">
        <user-route></user-route>
      </template>
    `;
    const parser = new DomParser(html);
    const doc = parser.document;

    const templates = doc.body.querySelectorAll('template');
    console.log('Root templates count:', templates.length);
    console.log('Body innerHTML:', doc.body.innerHTML);

    assert.equal(templates.length, 2, 'Should find 2 template elements');
  });

  test('template in custom element ', () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Simple Web Component SSR Test</title>
    </head>
    <body id="app" is="swc-app-body" swc-connect-mode="direct">
        <index-router l="/user">
        </index-router>
    </body>
</html>
    `;
    const parser = new DomParser(html);
    const window = parser.window as any;
    const doc = parser.document;

    console.log('Before define - body.innerHTML:', doc.body.innerHTML);
    console.log('Before define - index-router exists:', !!doc.body.querySelector('index-router'));

    // Define the swc-app-body custom element
    class AppBodyEl extends window.HTMLBodyElement  {
      say(){
        console.log('say!!!!!!!!!')
      }
      connectedCallback() {
        console.log('AppBodyEl connectedCallback called');
      }
    }
    window.customElements.define('swc-app-body', AppBodyEl, {extends: 'body'});

    class TestEl extends window.HTMLElement  {
      static get observedAttributes() { return ['value']; }
      constructor() { super(); }


      connectedCallback() {
        console.log('TestEl connectedCallback called');
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <div>
                    <h1>Hello from Simple Web Component SSR!</h1>
                    <p>
                        <input id="title" type="text"/>
                    </p>
                    <p>
                        <input id="url-text" type="text" value="/user"/>
                    </p>
                    <nav>
                        <button swc-on-click="$host.go('/')">/</button>
                        <button swc-on-click="$host.go('/user')">/user</button>
                    </nav>
                    <section>
                        <slot></slot>
                    </section>
                </div>
        `
        this.innerHTML = `
        <template is="swc-when" value="{{ ['','/'].includes($value?.path) }}" skip-if-same="">
          <index-route></index-route>
        </template>
        <template is="swc-when" value="{{ ['/user'].includes($value?.path) }}" skip-if-same="">
          <user-route></user-route>
        </template>
        `;
      }
      attributeChangedCallback(name, oldValue, newValue) {
        // callback
      }
    }

    // Check what happens during define
    const routerBefore = doc.body.querySelector('index-router');
    console.log('Before define - index-router element:', routerBefore?.tagName, 'innerHTML:', routerBefore?.innerHTML);

    window.customElements.define('index-router', TestEl);

    const bodyApp = doc.querySelector('#app') as AppBodyEl;
    // const indexroute = doc.querySelector('index-route');
    // console.log('indexroute:', indexroute);
    const template = doc.body.querySelector('template');
    const templates = doc.body.querySelectorAll('template');

    assert.ok(bodyApp.say)
    assert.ok(doc.body.innerHTML);
    assert.equal(templates.length, 2, 'Should find 2 template elements');
  });
});
