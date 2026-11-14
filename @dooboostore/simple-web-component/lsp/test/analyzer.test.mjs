// pnpm test
import test from 'node:test';
import assert from 'node:assert/strict';
import analyzer from '../out/server/analyzer.js';

const { Index, complete, definition, hover, diagnostics, contextAt } = analyzer;

const CARD = `
import { elementDefine, state, attribute, appendHtmlSlot, clearSlot } from '@dooboostore/simple-web-component';
@elementDefine('product-card', { observedAttributes: ['size'] })
class ProductCard extends HTMLElement {
  @state('count') count = 0;
  @state title = '';
  @attribute('product-id') productId!: string;
  @attribute('.x', 'not-host') other!: string;
  @appendHtmlSlot('items') add() { return '<li></li>'; }
  @clearSlot('missing') clear() { return true; }
  increment() {}
  render() {
    return \`<div class="\${this.count}">
      <!--[[ items ]]-->
      <button e::click="@increment@()">@count@</button>
      <product-card product-id="{{= $host.id }}" swc-on-click="$event"></product-card>
    </div>\`;
  }
}
@elementDefine('fancy-button', { extends: 'button' })
class FancyButton extends HTMLButtonElement {}
export default (w) => {
  const tagName = 'factory-el';
  @elementDefine(tagName, { window: w })
  class FactoryEl extends w.HTMLElement {}
  return tagName;
};
`;

const setup = () => {
  const index = new Index();
  index.set('file:///app/card.ts', CARD);
  return index;
};
const at = (needle, delta = needle.length) => CARD.indexOf(needle) + delta;
const labels = res => res?.items.map(i => i.label) ?? [];

test('contextAt', () => {
  assert.deepEqual(contextAt('<div><pro'), { kind: 'tag', prefix: 'pro' });
  assert.deepEqual(contextAt('<div a="x > y" cl'), { kind: 'attr', tag: 'div', prefix: 'cl' });
  assert.deepEqual(contextAt('<div a::title="@co'), { kind: 'value', tag: 'div', attr: 'a::title', prefix: '@co' });
  assert.equal(contextAt('<!-- <div --> a < b').kind, 'text');
});

test('components are indexed', () => {
  const [card, fancy, factory] = setup().components();
  assert.equal(card.tag, 'product-card');
  assert.equal(factory.tag, 'factory-el');
  assert.equal(factory.builtIn, false);
  assert.deepEqual(card.attributes, ['size', 'product-id']);
  assert.equal(card.builtIn, false);
  assert.equal(fancy.builtIn, true);
  assert.deepEqual(card.members.filter(m => m.kind === 'state').map(m => m.stateName), ['count', 'title']);
});

test('completion', () => {
  const index = setup();
  const uri = 'file:///app/card.ts';
  // 태그: customized built-in 은 빠진다
  assert.deepEqual(labels(complete(index, uri, at('<product-card ', 4))), ['product-card', 'factory-el']);
  // product-card 의 attribute + 라이프사이클 swc-on-*
  const attrs = labels(complete(index, uri, at('<product-card ')));
  assert.ok(attrs.includes('product-id') && attrs.includes('size') && !attrs.includes('not-host'));
  assert.ok(attrs.includes('swc-on-connected') && !attrs.includes('swc-on-click'));
  // @멤버@
  const members = labels(complete(index, uri, at('@increment@', 4)));
  assert.ok(members.includes('count') && members.includes('increment') && members.includes('title'));
  // $helper — {{= }} 안, swc-on-click 안(이벤트 변수 포함)
  assert.ok(labels(complete(index, uri, at('$host', 2))).includes('$host'));
  assert.ok(labels(complete(index, uri, at('"$event', 3))).includes('$event'));
  // 슬롯 데코레이터 인자
  assert.deepEqual(labels(complete(index, uri, at("'items'", 1))), ['items']);
  // 템플릿 밖은 없음
  assert.equal(complete(index, uri, at('increment() {}', 2)), undefined);
});

test('definition / hover', () => {
  const index = setup();
  const uri = 'file:///app/card.ts';
  const tagDef = definition(index, uri, at('<product-card ', 3));
  assert.equal(CARD.slice(tagDef.start, tagDef.end), 'product-card');
  const memberDef = definition(index, uri, at('@increment@', 3));
  assert.equal(CARD.slice(memberDef.start, memberDef.end), 'increment');
  const slotDef = definition(index, uri, at("'items'", 2));
  assert.ok(CARD.slice(slotDef.start - 7, slotDef.end).startsWith('<!--[[ items'));
  assert.match(hover(index, uri, at('>@count@', 3)).markdown, /@state\('count'\) count/);
});

test('html file', () => {
  const index = setup();
  const html = '<!doctype html><body><button is="fa"></button><prod';
  index.set('file:///app/index.html', html);
  assert.deepEqual(labels(complete(index, 'file:///app/index.html', html.length)), ['product-card', 'factory-el']);
  assert.deepEqual(labels(complete(index, 'file:///app/index.html', html.indexOf('fa"') + 2)), ['fancy-button']);
  const def = definition(index, 'file:///app/index.html', html.length - 1);
  assert.equal(def, undefined, 'partial tag is not a definition');
});

test('diagnostics', () => {
  const index = setup();
  const msgs = () => diagnostics(index, 'file:///app/card.ts', (a, b) => a.split('/')[3] === b.split('/')[3]).map(d => d.message);
  assert.deepEqual(msgs(), [], '없는 슬롯은 동적으로 생길 수 있어 경고하지 않는다');
  index.set('file:///other/dup.ts', `@elementDefine('product-card') class Other extends HTMLElement {}`);
  assert.deepEqual(msgs(), [], 'other app scope is not a duplicate');
  index.set('file:///app/dup.ts', `@elementDefine('product-card') class Dup extends HTMLElement {}`);
  assert.ok(msgs().some(m => /also defined by Dup/.test(m)));
});
