import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, bootApp, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onInitialize, onConnectedBefore, onConnectedAfter, onConnectedCompleted, onDisconnected,
  event, subscribeSwcAppMessage, publishSwcAppMessage, mutationObserver, changedAttribute, query, setTimeout, state
} from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

// 회귀: 부모 클래스에 붙인 데코레이터가 자식 클래스에서 일부(onInitialize / onDisconnected / 메시지 구독 …)만 동작하던 문제
test('decorators on a base class all work on a subclass that adds nothing', async () => {
  const tag = uniqueTag('inh-child');
  const { w, destroy } = await createWindow(appHtml(`<${tag} mode="a"></${tag}>`));
  const ran: string[] = [];
  await bootApp(w, [(win: Window) => {
    class Base extends (win as any).HTMLElement {
      @query('button') btn?: HTMLButtonElement;
      @onInitialize init() { ran.push('onInitialize'); }
      @onConnectedBefore before() { ran.push('onConnectedBefore'); }
      @onConnectedBodyShadow render() { ran.push('onConnectedBody'); return '<button>b</button><p><!--[text @label@ ]--></p>'; }
      @onConnectedAfter after() { ran.push(`onConnectedAfter:${!!this.btn}`); }
      @onConnectedCompleted done() { ran.push('onConnectedCompleted'); }
      @onDisconnected disc() { ran.push('onDisconnected'); }
      @event('click') click() { ran.push('@event'); }
      @subscribeSwcAppMessage('hello') onHello() { ran.push('subscribeSwcAppMessage'); }
      @publishSwcAppMessage('hello') say() { return 1; }
      @mutationObserver onMutation() { ran.push('mutationObserver'); }
      @changedAttribute('mode') onMode(v: string) { ran.push(`changedAttribute:${v}`); }
      @setTimeout(5, { type: 'onConnected' }) tick() { ran.push('setTimeout'); }
      @state label = 'x';
    }
    @elementDefine(tag, { window: win }) class Child extends Base {}
    return tag;
  }]);
  const el: any = w.document.querySelector(tag);
  el.btn.click(); await sleep(10);
  el.label = 'changed'; // @state 가 상속되면 템플릿이 다시 렌더된다
  if (el.shadowRoot.querySelector('p').textContent === 'changed') ran.push('@state');
  el.say(); await sleep(20);
  el.setAttribute('mode', 'b'); await sleep(10);
  el.shadowRoot.appendChild(w.document.createElement('i')); await sleep(30); // shadow 가 있으면 bare @mutationObserver 는 shadowRoot 를 본다
  el.remove(); await sleep(20);
  for (const name of ['onInitialize', 'onConnectedBefore', 'onConnectedBody', 'onConnectedAfter:true', 'onConnectedCompleted', '@event',
    'subscribeSwcAppMessage', 'changedAttribute:b', 'mutationObserver', 'setTimeout', '@state', 'onDisconnected']) {
    assert.ok(ran.includes(name), `${name} should run on the subclass (ran: ${ran.join(', ')})`);
  }
  destroy();
});

test('hooks on both base and subclass run parent first, then child', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('inh-both');
  const ran: string[] = [];
  class Base extends w.HTMLElement {
    @onInitialize baseInit() { ran.push('base:init'); }
    @onConnectedAfter baseAfter() { ran.push('base:after'); }
  }
  @elementDefine(tag, { window: w })
  class Child extends Base {
    @onInitialize childInit() { ran.push('child:init'); }
    @onConnectedAfter childAfter() { ran.push('child:after'); }
  }
  await mount(w, tag);
  assert.deepStrictEqual(ran, ['base:init', 'child:init', 'base:after', 'child:after']);
  destroy();
});

// 회귀: 자식에 붙인 훅이 부모의 목록에 들어가 부모와 다른 자식에서도 실행되던 문제
test("a subclass's own hooks do not leak into the base class or sibling subclasses", async () => {
  const { w, destroy } = await createWindow();
  const [baseTag, aTag, bTag] = [uniqueTag('inh-base'), uniqueTag('inh-a'), uniqueTag('inh-b')];
  const ran: string[] = [];
  @elementDefine(baseTag, { window: w })
  class Base extends w.HTMLElement {
    @onConnectedAfter baseAfter() { ran.push(`${this.localName}:base`); }
  }
  @elementDefine(aTag, { window: w })
  class A extends Base {
    @onConnectedAfter aAfter() { ran.push(`${this.localName}:a`); }
    @event('click') aClick() { ran.push(`${this.localName}:a-click`); }
  }
  @elementDefine(bTag, { window: w })
  class B extends Base {}
  const base: any = await mount(w, baseTag);
  const b: any = await mount(w, bTag);
  const a: any = await mount(w, aTag);
  base.click(); b.click(); a.click(); await sleep(10);
  assert.deepStrictEqual(ran.sort(), [`${aTag}:a`, `${aTag}:a-click`, `${aTag}:base`, `${baseTag}:base`, `${bTag}:base`].sort());
  destroy();
});
