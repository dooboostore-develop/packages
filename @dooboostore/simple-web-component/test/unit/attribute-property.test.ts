import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, uniqueTag } from './dom.ts';
import { elementDefine, onConnectedBodyShadow, onConnectedBodyLight, attribute, property } from '../../src/index.ts';

// 회귀: 문자열 하나는 "자기 자신의 attribute 이름" (예전엔 셀렉터로 해석돼 null)
test('@attribute(name) on a field reads the attribute on $this', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('attr-self');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute('product-id') productId?: string;
  }
  const el = await mount<any>(w, tag, { 'product-id': '7' });
  assert.strictEqual(el.productId, '7');
  el.productId = '8';
  assert.strictEqual(el.getAttribute('product-id'), '8');
  destroy();
});

// 회귀: bare @attribute 가 필드에 적용되지 않던 문제
test('bare @attribute on a field uses the field name as the attribute name', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('attr-bare');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute title2?: string;
  }
  const el = await mount<any>(w, tag, { title2: 'hi' });
  assert.strictEqual(el.title2, 'hi');
  destroy();
});

// 회귀: 문자열 두 개(셀렉터, 이름) 필드 — 예전엔 오버로드 순서 때문에 TS1240, 3인자는 bare 분기로 빠짐
test('@attribute(selector, name, options) on a field reads from the selected element', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('attr-sel');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute('#u', 'data-id', { type: Number }) userId?: number;
    @onConnectedBodyLight render() { return `<span id="u" data-id="42"></span>`; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.userId, 42);
  destroy();
});

// 메서드: 리턴값을 셀렉터 대상 attribute 에 적용, null 이면 제거
test('@attribute(selector, name) on a method applies the return value; null removes it', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('attr-method');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    section: string | null = 'releases';
    @onConnectedBodyShadow render() { return `<nav></nav>`; }
    @attribute('nav', 'data-active') updateNav() { return this.section; }
  }
  const el = await mount<any>(w, tag);
  el.updateNav();
  assert.strictEqual(el.shadowRoot.querySelector('nav').getAttribute('data-active'), 'releases');
  el.section = null;
  el.updateNav();
  assert.strictEqual(el.shadowRoot.querySelector('nav').hasAttribute('data-active'), false);
  destroy();
});

// 회귀: 함수 셀렉터가 옵션으로 잘못 처리되던 문제
test('@attribute(fnSelector, name) on a method targets the element the function returns', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('attr-fn');
  const target = w.document.createElement('meta');
  w.document.head.appendChild(target);
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute(() => target as Element, 'content') setContent() { return 'desc'; }
  }
  const el = await mount<any>(w, tag);
  el.setContent();
  assert.strictEqual(target.getAttribute('content'), 'desc');
  destroy();
});

// 메서드: 문자열 하나면 $this 의 attribute
test('@attribute(name) on a method sets the attribute on $this', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('attr-method-self');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @attribute('data-name') setName() { return 'kim'; }
  }
  const el = await mount<any>(w, tag);
  el.setName();
  assert.strictEqual(el.getAttribute('data-name'), 'kim');
  destroy();
});

// @property: 첫 문자열은 항상 셀렉터. 메서드는 리턴값을 대상 프로퍼티에 대입
test('@property(selector, key) on a method assigns the return value to the target property', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('prop-method');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<button id="b"></button>`; }
    @property('#b', 'disabled') lock() { return true; }
  }
  const el = await mount<any>(w, tag);
  el.lock();
  assert.strictEqual(el.shadowRoot.querySelector('#b').disabled, true);
  destroy();
});

test('@property(selector, key) on a field proxies the target property', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('prop-field');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @property('#i', 'value') inputValue?: string;
    @onConnectedBodyShadow render() { return `<input id="i" />`; }
  }
  const el = await mount<any>(w, tag);
  el.inputValue = 'typed';
  assert.strictEqual(el.shadowRoot.querySelector('#i').value, 'typed');
  destroy();
});

// bare @property 는 getter/setter 없는 순수 필드 (하이드레이션 대상) — 값이 그대로 유지돼야 한다
test('bare @property on a field stays a plain own field', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('prop-bare');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @property declare rows: number[];
  }
  const el = await mount<any>(w, tag);
  el.rows = [1, 2];
  assert.deepStrictEqual(el.rows, [1, 2]);
  assert.ok(Object.prototype.hasOwnProperty.call(el, 'rows'));
  destroy();
});
