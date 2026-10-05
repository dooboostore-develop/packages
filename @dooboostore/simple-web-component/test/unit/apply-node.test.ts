import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, bootApp, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onConnectedBodyLight, applyNode, replaceChildren, replaceChildrenLight, innerHtml,
  innerHtmlLight, innerHtmlShadow, innerText, innerTextLight, innerTextShadow, insertBeforeEnd, insertBeforeEndLight,
  insertBeforeEndShadow, insertAfterBegin, insertAfterBeginLight, clearChildrenNode, clearChildrenLight, removeNode, applyAppHost,
  skipIfSameTagPresent, skipIfExists, skipIfEmpty, applyIfChanged
} from '../../src/index.ts';

const html = (n: any) => n.innerHTML.replace(/<!--.*?-->/g, '');

test('onConnectedBodyShadow renders into the shadow root, onConnectedBodyLight into the light DOM', async () => {
  const { w, destroy } = await createWindow();
  const shadowTag = uniqueTag('body-shadow');
  const lightTag = uniqueTag('body-light');
  @elementDefine(shadowTag, { window: w })
  class S extends w.HTMLElement {
    name = 'swc';
    @onConnectedBodyShadow render() { return `<div>Hello, <span>${this.name}</span>!</div>`; }
  }
  @elementDefine(lightTag, { window: w })
  class L extends w.HTMLElement {
    @onConnectedBodyLight render() { return `<p class="light">light</p>`; }
  }
  const s = await mount<any>(w, shadowTag);
  const l = await mount<any>(w, lightTag);
  assert.strictEqual(s.shadowRoot.querySelector('span').textContent, 'swc');
  assert.strictEqual(s.childNodes.length, 0);
  assert.strictEqual(l.shadowRoot, null);
  assert.strictEqual(l.querySelector('p.light').textContent, 'light');
  destroy();
});

test('bare @innerHtml targets $this (shadow root when present); @innerHtmlLight / @innerHtmlShadow pick the root', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('inner-html');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<div class="old"></div>`; }
    @innerHtml auto() { return `<b>auto</b>`; }
    @innerHtmlLight light() { return `<i>light</i>`; }
    @innerHtmlShadow shadow() { return `<u>shadow</u>`; }
  }
  const el = await mount<any>(w, tag);
  el.auto();
  assert.strictEqual(html(el.shadowRoot), '<b>auto</b>', 'replaces shadow children');
  el.light();
  assert.strictEqual(html(el), '<i>light</i>');
  el.shadow();
  assert.strictEqual(html(el.shadowRoot), '<u>shadow</u>');
  assert.strictEqual(html(el), '<i>light</i>', 'light DOM untouched');
  destroy();
});

test('@innerHtml(selector) writes into the matching element inside the shadow root', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('inner-html-sel');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<div class="box"><span>old</span></div><p>keep</p>`; }
    @innerHtml('.box') fill(v: string) { return `<em>${v}</em>`; }
  }
  const el = await mount<any>(w, tag);
  el.fill('new');
  assert.strictEqual(html(el.shadowRoot.querySelector('.box')), '<em>new</em>');
  assert.strictEqual(el.shadowRoot.querySelector('p').textContent, 'keep');
  destroy();
});

test('@innerText(+Light/Shadow) inserts text, not markup', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('inner-text');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<p>x</p>`; }
    @innerText auto() { return '<b>a</b>'; }
    @innerTextLight light() { return 'light'; }
    @innerTextShadow shadow() { return 'shadow'; }
  }
  const el = await mount<any>(w, tag);
  el.auto();
  assert.strictEqual(el.shadowRoot.textContent, '<b>a</b>');
  assert.strictEqual(el.shadowRoot.querySelector('b'), null);
  el.light();
  assert.strictEqual(el.textContent, 'light');
  el.shadow();
  assert.strictEqual(el.shadowRoot.textContent, 'shadow');
  destroy();
});

test('@replaceChildren / @replaceChildrenLight replace with a Node', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('replace');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<p>old</p>`; }
    @replaceChildren shadow() { const d = w.document.createElement('div'); d.textContent = 's'; return d; }
    @replaceChildrenLight light() { const d = w.document.createElement('section'); d.textContent = 'l'; return d; }
  }
  const el = await mount<any>(w, tag);
  el.innerHTML = '<span>light-old</span>';
  el.shadow();
  assert.strictEqual(html(el.shadowRoot), '<div>s</div>');
  el.light();
  assert.strictEqual(html(el), '<section>l</section>');
  assert.strictEqual(html(el.shadowRoot), '<div>s</div>');
  destroy();
});

// README: "Node, Node[] or HTML string" 를 받는다고 되어 있음
test('@replaceChildrenLight accepts an HTML string', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('replace-str');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @replaceChildrenLight render() { return `<div>New content</div>`; }
  }
  const el = await mount<any>(w, tag);
  el.innerHTML = '<p>old</p>';
  el.render();
  assert.strictEqual(html(el), '<div>New content</div>');
  destroy();
});

test('@replaceChildrenLight accepts a Node[]', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('replace-arr');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @replaceChildrenLight render() { return [w.document.createElement('a'), w.document.createElement('b')]; }
  }
  const el = await mount<any>(w, tag);
  el.innerHTML = '<p>old</p>';
  el.render();
  assert.strictEqual(html(el), '<a></a><b></b>');
  destroy();
});

test('@insertBeforeEndLight / @insertAfterBeginLight accept HTML strings and mixed arrays', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('insert-str');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @insertBeforeEndLight addEnd() { return '<i>end</i>'; }
    @insertAfterBeginLight addStart() { return ['<b>a</b>', w.document.createElement('u')]; }
  }
  const el = await mount<any>(w, tag);
  el.innerHTML = '<p>mid</p>';
  el.addEnd();
  el.addStart();
  assert.strictEqual(html(el), '<b>a</b><u></u><p>mid</p><i>end</i>');
  destroy();
});

test('@insertBeforeEnd(+Light/Shadow) appends, @insertAfterBegin(+Light) prepends', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('insert');
  const mk = (t: string) => w.document.createElement(t);
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<p></p>`; }
    @insertBeforeEnd end() { return mk('i'); }
    @insertBeforeEndShadow endShadow() { return mk('u'); }
    @insertAfterBegin begin() { return mk('b'); }
    @insertBeforeEndLight endLight() { return mk('em'); }
    @insertAfterBeginLight beginLight() { return mk('strong'); }
  }
  const el = await mount<any>(w, tag);
  el.end(); el.endShadow(); el.begin();
  assert.strictEqual(html(el.shadowRoot), '<b></b><p></p><i></i><u></u>');
  el.innerHTML = '<span></span>';
  el.endLight(); el.beginLight();
  assert.strictEqual(html(el), '<strong></strong><span></span><em></em>');
  destroy();
});

test('@clearChildrenNode / @clearChildrenLight empty the target regardless of the return value', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('clear');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<p>a</p><p>b</p>`; }
    @clearChildrenNode clear() { return true; }
    @clearChildrenLight clearLight() { return 'ignored'; }
  }
  const el = await mount<any>(w, tag);
  el.innerHTML = '<span>light</span>';
  el.clear();
  assert.strictEqual(el.shadowRoot.childNodes.length, 0);
  assert.strictEqual(el.childNodes.length, 1, 'light DOM untouched');
  el.clearLight();
  assert.strictEqual(el.childNodes.length, 0);
  destroy();
});

test('@removeNode: removes whatever is returned; only with valueKey does a falsy key keep it', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('remove');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<p class="a">a</p><p class="b">b</p><p class="c">c</p><p class="d">d</p>`; }
    @removeNode('.a') removeA(v: any) { return v; }
    @removeNode('.b', { valueKey: 'go' }) removeB(r: any) { return r; }
    @removeNode('.c') close() { }
    @removeNode('.d') async later() { await sleep(5); }
    @removeNode removeSelf() { }
  }
  const el = await mount<any>(w, tag);
  const has = (c: string) => !!el.shadowRoot.querySelector('.' + c);
  assert.strictEqual(el.removeA(false), false, 'removes even on false, return value passes through');
  assert.ok(!has('a'));
  el.close();
  assert.ok(!has('c'), 'no return value removes');
  await el.later();
  assert.ok(!has('d'), 'async with no return value removes after it resolves');
  for (const r of [{ other: 1 }, { go: undefined }, { go: null }, { go: false }]) el.removeB(r);
  assert.ok(has('b'), 'with valueKey: missing / undefined / falsy key keeps it');
  el.removeB({ go: true });
  assert.ok(!has('b'));
  el.removeSelf();
  assert.strictEqual(el.isConnected, false, 'bare @removeNode removes the element itself (not its shadow root)');
  destroy();
});

test('@clearChildrenNode clears even with no return value; with valueKey only when the key is truthy', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('clear-rule');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<ul class="a"><li>1</li></ul><ul class="b"><li>1</li></ul>`; }
    @clearChildrenNode('.a') clearA() { }
    @clearChildrenNode('.b', { valueKey: 'go' }) clearB(r: any) { return r; }
  }
  const el = await mount<any>(w, tag);
  const n = (c: string) => el.shadowRoot.querySelector('.' + c).childNodes.length;
  el.clearA(); assert.strictEqual(n('a'), 0, 'no return clears');
  el.clearB({ go: false }); assert.strictEqual(n('b'), 1, 'falsy key keeps');
  el.clearB({ go: true }); assert.strictEqual(n('b'), 0);
  destroy();
});

test('undefined return is a no-op; the original return value passes through', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('noop');
  let ret: string | undefined;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow render() { return `<p>keep</p>`; }
    @innerHtml set() { return ret; }
  }
  const el = await mount<any>(w, tag);
  assert.strictEqual(el.set(), undefined);
  assert.strictEqual(html(el.shadowRoot), '<p>keep</p>');
  ret = '<b>x</b>';
  assert.strictEqual(el.set(), '<b>x</b>');
  assert.strictEqual(html(el.shadowRoot), '<b>x</b>');
  destroy();
});

test('Promise return applies after resolve; fallback shows meanwhile and is removed', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('async');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return `<div class="t"></div>`; }
    @insertBeforeEndLight('.t', { fallback: () => { const s = w.document.createElement('i'); s.textContent = 'loading'; return s; } })
    async load() { await sleep(20); const b = w.document.createElement('b'); b.textContent = 'done'; return b; }
  }
  const el = await mount<any>(w, tag);
  const t = el.querySelector('.t');
  const p = el.load();
  assert.strictEqual(html(t), '<i>loading</i>');
  assert.strictEqual((await p).textContent, 'done');
  assert.strictEqual(html(t), '<b>done</b>');
  destroy();
});

test('applyNode options: position, valueKey, filter (filter false skips)', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('options');
  let allow = false;
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyLight render() { return `<div class="t"><p>mid</p></div>`; }
    @applyNode('.t', { position: 'afterBegin' }) first() { return w.document.createElement('b'); }
    @applyNode('.t', { position: 'innerHtml', valueKey: 'body' }) picked() { return { body: '<em>picked</em>', other: 1 }; }
    @applyNode('.t', { position: 'innerHtml', filter: () => allow }) guarded() { return '<u>guarded</u>'; }
  }
  const el = await mount<any>(w, tag);
  const t = el.querySelector('.t');
  el.first();
  assert.strictEqual(html(t), '<b></b><p>mid</p>');
  el.picked();
  assert.strictEqual(html(t), '<em>picked</em>');
  el.guarded();
  assert.strictEqual(html(t), '<em>picked</em>', 'filter false → skipped');
  allow = true;
  el.guarded();
  assert.strictEqual(html(t), '<u>guarded</u>');
  destroy();
});

test('filter helpers: skipIfSameTagPresent, skipIfExists, skipIfEmpty, applyIfChanged', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('filters');
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @insertBeforeEndLight({ filter: skipIfSameTagPresent }) addPage() { return w.document.createElement('my-page'); }
    @insertBeforeEndLight({ filter: skipIfExists('.only') }) addOnly() { const d = w.document.createElement('div'); d.className = 'only'; return d; }
    @innerHtmlLight('.e', { filter: skipIfEmpty }) setE(v: string) { return v; }
    @innerTextLight('.c', { filter: applyIfChanged }) setC(v: string) { return v; }
  }
  const el = await mount<any>(w, tag);
  el.addPage(); el.addPage();
  assert.strictEqual(el.querySelectorAll('my-page').length, 1);
  el.addOnly(); el.addOnly();
  assert.strictEqual(el.querySelectorAll('.only').length, 1);
  el.insertAdjacentHTML('beforeend', '<div class="e">keep</div><div class="c">same</div>');
  el.setE('  ');
  assert.strictEqual(el.querySelector('.e').textContent, 'keep');
  el.setE('<b>x</b>');
  assert.strictEqual(html(el.querySelector('.e')), '<b>x</b>');
  const before = el.querySelector('.c').firstChild;
  el.setC('same');
  assert.strictEqual(el.querySelector('.c').firstChild, before, 'unchanged text → not re-applied');
  el.setC('next');
  assert.strictEqual(el.querySelector('.c').textContent, 'next');
  destroy();
});

test('applyNode(options) targets the element itself; applyAppHost targets the swc app host', async () => {
  const tag = uniqueTag('app-host');
  const { w, destroy } = await createWindow(`<!DOCTYPE html><html><body><div id="app" is="swc-app-div"><${tag}></${tag}></div></body></html>`);
  await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @applyNode({ position: 'innerHtml' }) self() { return '<b>self</b>'; }
      @applyAppHost({ position: 'beforeEnd' }) toApp() { const d = (win as any).document.createElement('footer'); d.className = 'from-child'; return d; }
    }
    return tag;
  }]);
  const app = w.document.querySelector('#app');
  const el = w.document.querySelector(tag);
  el.self();
  assert.strictEqual(html(el), '<b>self</b>');
  el.toApp();
  assert.ok(app.querySelector(':scope > footer.from-child'), 'appended to the app host');
  destroy();
});
