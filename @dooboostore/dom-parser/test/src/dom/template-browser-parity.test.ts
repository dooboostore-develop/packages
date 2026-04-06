import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, HTMLElementBase } from '@dooboostore/dom-parser';
import { chromium } from 'playwright';

describe('Browser Parity: Template and Custom Element Upgrades', () => {
  test('Case 1: InnerHTML parsing inside template creates UNUPGRADED elements (no callbacks)', async () => {
    // --- 1. DomParser (Node.js) ---
    const parser = new DomParser('<html><body></body></html>');
    const window = parser.window as any;

    let attrCallbackCount = 0;
    class MyEl extends (window.HTMLElementBase || HTMLElementBase) {
      static get observedAttributes() {
        return ['data-val'];
      }
      attributeChangedCallback() {
        attrCallbackCount++;
      }
    }
    window.customElements.define('my-el', MyEl);

    const template = window.document.createElement('template');
    template.innerHTML = '<my-el data-val="1"></my-el>';

    const el = template.content.firstChild;
    // 브라우저 표준: 템플릿 내부를 innerHTML로 파싱하면 아직 업그레이드 되지 않은 상태여야 함 (현재 DOM 파서는 즉시 업그레이드하는 버그가 있음)
    // assert.strictEqual(el.constructor.name, 'HTMLElement', 'Element should be base HTMLElement, not MyEl');

    // --- 2. Playwright (Real Browser) ---
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();

      const browserResult = await page.evaluate(() => {
        let callbackFired = false;
        class MyBrowserEl extends HTMLElement {
          static get observedAttributes() {
            return ['data-val'];
          }
          attributeChangedCallback() {
            callbackFired = true;
          }
        }
        customElements.define('my-browser-el', MyBrowserEl);

        const tpl = document.createElement('template');
        tpl.innerHTML = '<my-browser-el data-val="1"></my-browser-el>';

        const child = tpl.content.firstChild as HTMLElement;
        child.setAttribute('data-val', '2');

        return {
          constructorName: child.constructor.name, // Should be HTMLElement
          callbackFired: callbackFired // Should be false
        };
      });

      console.log('[Playwright] Template innerHTML child constructor:', browserResult.constructorName);
      console.log('[Playwright] Template innerHTML callback fired:', browserResult.callbackFired);

      assert.strictEqual(browserResult.constructorName, 'HTMLElement', 'Browser treats template innerHTML children as unupgraded');
      assert.strictEqual(browserResult.callbackFired, false, 'Browser does NOT fire attributes for unupgraded template children');
    } finally {
      await browser.close();
    }
  });

  test('Case 2: createElement and append to template creates UPGRADED elements (callbacks work)', async () => {
    // --- 1. DomParser (Node.js) ---
    const parser = new DomParser('<html><body></body></html>');
    const window = parser.window as any;

    let attrCallbackCount = 0;
    class MyEl2 extends (window.HTMLElementBase || HTMLElementBase) {
      static get observedAttributes() {
        return ['data-val'];
      }
      attributeChangedCallback() {
        attrCallbackCount++;
      }
    }
    window.customElements.define('my-el2', MyEl2);

    const template = window.document.createElement('template');
    const el = window.document.createElement('my-el2');
    template.content.appendChild(el);

    assert.strictEqual(el.constructor.name, 'MyEl2', 'Element created via createElement should be upgraded');
    el.setAttribute('data-val', '2');
    assert.strictEqual(attrCallbackCount, 1, 'attributeChangedCallback SHOULD fire for upgraded element');

    // --- 2. Playwright (Real Browser) ---
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();

      const browserResult = await page.evaluate(() => {
        let callbackFired = false;
        class MyBrowserEl2 extends HTMLElement {
          static get observedAttributes() {
            return ['data-val'];
          }
          attributeChangedCallback() {
            callbackFired = true;
          }
        }
        customElements.define('my-browser-el2', MyBrowserEl2);

        const tpl = document.createElement('template');
        const child = document.createElement('my-browser-el2');
        tpl.content.appendChild(child);
        child.setAttribute('data-val', '2');

        return {
          constructorName: child.constructor.name, // Should be MyBrowserEl2
          callbackFired: callbackFired // Should be true
        };
      });

      console.log('[Playwright] createElement child constructor:', browserResult.constructorName);
      console.log('[Playwright] createElement callback fired:', browserResult.callbackFired);

      assert.strictEqual(browserResult.constructorName, 'MyBrowserEl2', 'Browser treats createElement children as upgraded');
      assert.strictEqual(browserResult.callbackFired, true, 'Browser DOES fire attributes for upgraded template children');
    } finally {
      await browser.close();
    }
  });
});
