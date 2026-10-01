import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, sleep } from './dom.ts';
import { elementDefine, onConnectedBodyShadow, attribute, event, SwcUtils } from '../../src/index.ts';

test('smoke: a swc element connects, renders shadow DOM, reads attributes and handles events', async () => {
  const { w, destroy } = await createWindow();
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

test('host lookup: findAllSwcHostsIncludingSelf includes self; $host stays the parent host', async () => {
  const { w, destroy } = await createWindow();
  @elementDefine('host-outer', { window: w })
  class Outer extends w.HTMLElement {}
  @elementDefine('host-inner', { window: w })
  class Inner extends w.HTMLElement {}
  w.document.body.innerHTML = '<host-outer><host-inner><span></span></host-inner></host-outer>';
  await sleep(30);
  const outer = w.document.querySelector('host-outer');
  const inner = w.document.querySelector('host-inner');
  const span = w.document.querySelector('span');
  assert.deepStrictEqual(SwcUtils.findAllSwcHostsIncludingSelf(inner), [outer, inner], 'swc element → self last');
  assert.deepStrictEqual(SwcUtils.findAllSwcHostsIncludingSelf(span), [outer, inner], 'plain element → hosts only');
  assert.deepStrictEqual(SwcUtils.getHosts(inner), [outer, inner]);
  const hs = SwcUtils.getHostSet(inner);
  assert.strictEqual(hs.$host, outer, '$host is the parent host, not self');
  assert.deepStrictEqual(hs.$hosts, [outer]);
  assert.strictEqual(SwcUtils.getHostSet(span).$host, inner);
  assert.strictEqual(SwcUtils.resolveWindow(inner), w);
  assert.strictEqual(SwcUtils.resolveWindow(span), w);
  destroy();
});
