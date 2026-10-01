import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyLight, onConnectedBodyShadow, event, state, applySlot, clearSlot, prependHtmlSlot, prependTextSlot,
  appendHtmlSlot, appendTextSlot, replaceChildrenHtmlSlot, replaceChildrenTextSlot, replaceChildrenSlot
} from '../../src/index.ts';

const html = (n: any) => n.innerHTML.replace(/<!--.*?-->/g, '').replace(/\s+/g, ' ').trim();

// ─── @applySlot: <!--[[ id ]]--> 주석 마커 사이를 갈아끼운다 ───

test('slot: html/text append, prepend, replaceChildren and clear only touch the named slot', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('slot');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return `<main><!--[[ main ]]--></main><aside><!--[[ side ]]--></aside>`; }
    @appendHtmlSlot('main') addHtml() { return '<p>a</p>'; }
    @prependHtmlSlot('main') preHtml() { return '<p>first</p>'; }
    @appendTextSlot('side') addText() { return '<b>t</b>'; }
    @prependTextSlot('side') preText() { return 'pre-'; }
    @replaceChildrenHtmlSlot('main') replHtml() { return '<div>replaced</div>'; }
    @replaceChildrenTextSlot('side') replText() { return 'only text'; }
    @clearSlot('main') clear() { return true; }
  }
  const el = await mount<any>(w, tag);
  const main = el.querySelector('main'), side = el.querySelector('aside');
  el.addHtml(); el.addHtml(); el.preHtml();
  assert.strictEqual(html(main), '<p>first</p><p>a</p><p>a</p>');
  el.addText(); el.preText();
  assert.strictEqual(side.textContent, 'pre-<b>t</b>', 'text variants do not parse markup');
  assert.strictEqual(side.querySelector('b'), null);
  el.replHtml();
  assert.strictEqual(html(main), '<div>replaced</div>');
  el.replText();
  assert.strictEqual(side.textContent, 'only text');
  el.clear();
  assert.strictEqual(html(main), '');
  assert.strictEqual(side.textContent, 'only text');
  destroy();
});

test('slot: Node returns, slots inside shadow DOM, click handler stacked on top', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('slot-node');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<section><!--[[ list ]]--></section><button class="add">add</button>`; }
    n = 0;
    @event('.add', 'click')
    @applySlot('list', { position: 'append' })
    add() { const li = w.document.createElement('li'); li.textContent = String(++this.n); return li; }
    @replaceChildrenSlot('list') reset() { return w.document.createElement('hr'); }
  }
  const el = await mount<any>(w, tag);
  const btn = el.shadowRoot.querySelector('.add');
  btn.click(); btn.click();
  await sleep();
  assert.strictEqual(html(el.shadowRoot.querySelector('section')), '<li>1</li><li>2</li>');
  el.reset();
  assert.strictEqual(html(el.shadowRoot.querySelector('section')), '<hr>');
  destroy();
});

test('slot: async return replaces the fallback; valueKey picks from an object', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('slot-async');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return `<div class="a"><!--[[ a ]]--></div><div class="b"><!--[[ b ]]--></div>`; }
    @applySlot('a', { position: 'replaceChildrenHtml', fallback: () => '<i>loading</i>' })
    async load() { await sleep(20); return '<b>done</b>'; }
    @applySlot('b', { position: 'replaceChildrenText', valueKey: 'text' }) picked() { return { text: 'picked', other: 1 }; }
  }
  const el = await mount<any>(w, tag);
  const p = el.load();
  assert.strictEqual(html(el.querySelector('.a')), '<i>loading</i>');
  await p;
  assert.strictEqual(html(el.querySelector('.a')), '<b>done</b>');
  el.picked();
  assert.strictEqual(el.querySelector('.b').textContent, 'picked');
  destroy();
});

// ─── @state: 값이 바뀌면 템플릿의 @name@ 표현식이 다시 평가된다 ───

// README 의 `<!--[text Count: @count@ ]-->` 는 JS 식이 아니라 SyntaxError — 실제로는 식을 써야 한다
test('state: text/html directives render the initial value and re-render on assignment', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('state');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @state('count') count = 0;
    @state('message') message = '<b>hi</b>';
    @onConnectedBodyLight render() {
      return `<p class="t"><!--[text 'Count: ' + @count@ ]--></p><div class="h"><!--[html @message@ ]--></div>`;
    }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.querySelector('.t').textContent, 'Count: 0');
  assert.strictEqual(el.querySelector('.h b').textContent, 'hi');
  el.count++;
  el.message = '<i>bye</i>';
  assert.strictEqual(el.querySelector('.t').textContent, 'Count: 1');
  assert.strictEqual(el.querySelector('.h b'), null);
  assert.strictEqual(el.querySelector('.h i').textContent, 'bye');
  destroy();
});

test('state: a:: attribute binding updates, e:: event binding calls a method via @$this@ (bare @state = field name)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('state-attr');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @state count = 0;
    @state('isActive') active = false;
    increment() { this.count++; }
    @onConnectedBodyLight render() {
      return `<div class="d" a::title="'Count is '+@count@" a::style="@isActive@ ? 'color: green' : 'color: red'"></div><button e::click="@$this@.increment()">inc</button>`;
    }
  }
  const el = await mount<any>(w, tag);
  const d = el.querySelector('.d');
  assert.strictEqual(d.getAttribute('title'), 'Count is 0');
  assert.strictEqual(d.style.color, 'red');
  el.querySelector('button').click();
  assert.strictEqual(el.count, 1);
  assert.strictEqual(d.getAttribute('title'), 'Count is 1');
  el.active = true;
  assert.strictEqual(d.style.color, 'green');
  destroy();
});

test('state: e::click="@increment@()" calls the method (README form)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('state-method');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @state count = 0;
    increment() { this.count++; }
    @onConnectedBodyLight render() { return `<button e::click="@increment@()">inc</button>`; }
  }
  const el = await mount<any>(w, tag);
  el.querySelector('button').click();
  assert.strictEqual(el.count, 1);
  destroy();
});

test('state: values are per instance and update inside shadow DOM', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('state-shadow');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @state('name') name = 'Alice';
    @onConnectedBodyShadow render() { return `<h2><!--[text @name@ ]--></h2>`; }
  }
  const a = await mount<any>(w, tag);
  const b = await mount<any>(w, tag);
  b.name = 'Bob';
  assert.strictEqual(a.name, 'Alice');
  assert.strictEqual(a.shadowRoot.querySelector('h2').textContent, 'Alice');
  assert.strictEqual(b.shadowRoot.querySelector('h2').textContent, 'Bob');
  destroy();
});

test('state: nested path @user.name@ re-renders when user is reassigned', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('state-nested');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @state('user') user = { name: 'Alice' };
    @onConnectedBodyShadow render() { return `<h2><!--[text @user.name@ ]--></h2>`; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.shadowRoot.querySelector('h2').textContent, 'Alice');
  el.user = { name: 'Bob' };
  assert.strictEqual(el.shadowRoot.querySelector('h2').textContent, 'Bob');
  destroy();
});

// README 3.6 예제 그대로: text 지시문은 JS 식, 이벤트에서 메서드 호출, 값이 바뀌면 다시 렌더
test('state: README example — text directive expression, e::click method call, re-render', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('state-readme');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @state count = 0;
    increment() { this.count++; }
    @onConnectedBodyShadow render() {
      return `<p><!--[text 'Count: ' + @count@ ]--></p><button e::click="@increment@()">Increment</button>`;
    }
  }
  const el = await mount<any>(w, tag);
  const p = () => el.shadowRoot.querySelector('p').textContent;
  assert.strictEqual(p(), 'Count: 0');
  el.shadowRoot.querySelector('button').click();
  el.shadowRoot.querySelector('button').click();
  assert.strictEqual(el.count, 2);
  assert.strictEqual(p(), 'Count: 2');
  destroy();
});
