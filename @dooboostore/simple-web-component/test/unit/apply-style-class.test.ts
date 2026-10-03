import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, applyStyle, setStyle, updateStyle, removeStyle, applyClass, setClass, updateClass, addClass,
  removeClass, toggleClass, innerHtml
} from '../../src/index.ts';

// 옛 test/case(apply-style / apply-class / apply-advanced)의 *Host 데코레이터는
// 지금은 bare(@updateStyle, @setClass, @addClass … → $this) 로 쓴다.

test('style: applyStyle/setStyle replace, updateStyle merges (function values per element), removeStyle drops', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('style');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() {
      return `<div class="target" style="margin: 1px"></div><div class="box" data-i="1" style="width: 10px"></div><div class="box" data-i="2" style="width: 10px"></div>`;
    }
    @applyStyle('.target', 'set') universal(color: string) { return `background: ${color}; padding: 15px`; }
    @setStyle('.target') set(color: string) { return { color }; }
    @updateStyle('.box') grow(size: number) {
      return { height: `${size}px`, 'background-color': (el: HTMLElement) => (el.dataset.i === '1' ? 'red' : 'green') };
    }
    @removeStyle('.box') drop() { return { width: true, height: (el: HTMLElement) => el.dataset.i === '2' }; }
  }
  const el = await mount<any>(w, tag);
  const sr = el.shadowRoot;
  const target = sr.querySelector('.target');
  const [b1, b2] = sr.querySelectorAll('.box');

  el.universal('purple'); await sleep();
  assert.strictEqual(target.style.background, 'purple');
  assert.strictEqual(target.style.margin, '', "'set' replaces the existing inline style");

  el.set('red'); await sleep();
  assert.strictEqual(target.style.color, 'red');
  assert.strictEqual(target.style.background, '', 'setStyle replaces too');

  el.grow(150); await sleep();
  assert.strictEqual(b1.style.height, '150px');
  assert.strictEqual(b1.style.width, '10px', 'updateStyle keeps the other properties');
  assert.strictEqual(b1.style.backgroundColor, 'red');
  assert.strictEqual(b2.style.backgroundColor, 'green', 'function values are evaluated per element');

  el.drop(); await sleep();
  assert.strictEqual(b1.style.width, '');
  assert.strictEqual(b1.style.height, '150px', 'function false → kept');
  assert.strictEqual(b2.style.height, '');
  destroy();
});

test('style on the host: bare @updateStyle / @setStyle target the element itself', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('style-host');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @updateStyle fade(opacity: number) { return { opacity, display: 'block' }; }
    @updateStyle shadow() { return { 'box-shadow': 'none' }; }
    @updateStyle border(px: number) { return { border: `${px}px solid black` }; }
    @setStyle reset() { return 'color: blue'; }
  }
  const el = await mount<any>(w, tag);
  el.fade(0.5); el.shadow(); el.border(2); await sleep();
  assert.strictEqual(el.style.opacity, '0.5');
  assert.strictEqual(el.style.display, 'block');
  assert.strictEqual(el.style.boxShadow, 'none');
  assert.strictEqual(el.style.borderWidth, '2px');
  el.reset(); await sleep();
  assert.strictEqual(el.style.color, 'blue');
  assert.strictEqual(el.style.opacity, '', 'bare @setStyle replaces the host style');
  destroy();
});

test('class: setClass replaces, updateClass/applyClass merge (per-element functions), add/remove/toggle', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('class');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() {
      return `<div id="u" class="keep"></div><div id="s" class="old other"></div><div class="item" id="item1" data-index="0"></div><div class="item" id="item2" data-index="1"></div><div id="t"></div>`;
    }
    @applyClass('#u', 'update') universal(on: boolean) { return { 'universal-active': on }; }
    @setClass('#s') set(name: string) { return name; }
    @updateClass('.item') items(current: number) {
      return {
        even: (el: HTMLElement) => Number(el.dataset.index) % 2 === 0,
        odd: (el: HTMLElement) => Number(el.dataset.index) % 2 !== 0,
        highlight: (el: HTMLElement) => Number(el.dataset.index) === current
      };
    }
    @toggleClass('#t') toggle(name: string) { return name; }
    @addClass('#t') add(names: string[]) { return names; }
    @removeClass('#t') remove(name: string) { return name; }
  }
  const el = await mount<any>(w, tag);
  const sr = el.shadowRoot;
  const u = sr.querySelector('#u'), s = sr.querySelector('#s'), t = sr.querySelector('#t');
  const [i1, i2] = sr.querySelectorAll('.item');

  el.universal(true); await sleep();
  assert.strictEqual(u.className, 'keep universal-active');
  el.universal(false); await sleep();
  assert.strictEqual(u.className, 'keep');

  el.set('exclusive'); await sleep();
  assert.strictEqual(s.className, 'exclusive', 'setClass is destructive');

  el.items(1); await sleep();
  assert.deepStrictEqual([...i1.classList], ['item', 'even']);
  assert.deepStrictEqual([...i2.classList], ['item', 'odd', 'highlight']);
  el.items(0); await sleep();
  assert.ok(i1.classList.contains('highlight') && !i2.classList.contains('highlight'));

  el.toggle('on'); await sleep();
  assert.ok(t.classList.contains('on'));
  el.toggle('on'); await sleep();
  assert.ok(!t.classList.contains('on'));
  el.add(['a', 'b']); await sleep();
  el.remove('a'); await sleep();
  assert.strictEqual(t.className, 'b');
  destroy();
});

test('class on the host: bare @setClass / @updateClass / @addClass target the element itself', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('class-host');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @setClass loaded() { return 'is-loaded'; }
    @updateClass merged(on: boolean) { return { 'host-merged': on }; }
    @addClass mark() { return 'marked'; }
    @updateClass flag(on: boolean) { return { flagged: on }; }
  }
  const el = await mount<any>(w, tag);
  el.loaded(); await sleep();
  assert.strictEqual(el.className, 'is-loaded');
  el.merged(true); el.mark(); el.flag(true); await sleep();
  assert.deepStrictEqual([...el.classList].sort(), ['flagged', 'host-merged', 'is-loaded', 'marked']);
  el.merged(false); el.flag(false); await sleep();
  assert.deepStrictEqual([...el.classList].sort(), ['is-loaded', 'marked']);
  destroy();
});

// 회귀: @updateStyle / @updateClass 가 원래 반환값 대신 자기 몫(valueKey)만 돌려줘서,
// 그 위에 쌓인 @innerHtml(valueKey) 이 자기 키를 못 찾고 객체 통째로("[object Object]") 그렸다
test('stacked outputs: @updateStyle / @updateClass pass the original return value up to @innerHtml', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('stack-pass');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return '<p class="t"></p><div class="box"></div>'; }
    @innerHtml('.t', { valueKey: 'text' })
    @updateStyle('.box', { valueKey: 'style' })
    @updateClass('.box', { root: 'auto', valueKey: 'cls' })
    paint() { return { text: 'hello', style: { color: 'red' }, cls: { on: true } }; }
  }
  const el = await mount<any>(w, tag);
  const ret = el.paint();
  assert.deepStrictEqual(ret, { text: 'hello', style: { color: 'red' }, cls: { on: true } }, 'method still returns the whole object');
  assert.strictEqual(el.shadowRoot.querySelector('.t').textContent, 'hello');
  assert.strictEqual(el.shadowRoot.querySelector('.box').style.color, 'red');
  assert.ok(el.shadowRoot.querySelector('.box').classList.contains('on'));
  destroy();
});
