import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, sleep } from './dom.ts';
import { elementDefine, onConnectedBodyShadow, attribute, event } from '../../src/index.ts';

test('smoke: a swc element connects, renders shadow DOM, reads attributes and handles events', async () => {
  const { w, destroy } = createWindow();
  let clicked = 0;
  @elementDefine('smoke-el', { window: w })
  class SmokeEl extends w.HTMLElement {
    @attribute('product-id') productId?: string;
    @onConnectedBodyShadow render() { return `<button class="b">hi</button>`; }
    @event('.b', 'click') onClick() { clicked++; }
  }
  const el = w.document.createElement('smoke-el');
  el.setAttribute('product-id', '7');
  w.document.body.appendChild(el);
  await sleep(50);
  assert.strictEqual(el.productId, '7');
  assert.ok(el.shadowRoot?.querySelector('.b'));
  el.shadowRoot.querySelector('.b').dispatchEvent(new w.Event('click', { bubbles: true }));
  assert.strictEqual(clicked, 1);
  destroy();
});
