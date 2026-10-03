import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, mount, bootApp, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, onInitialize, onConnectedBefore, onConnectedAfter, onConnectedCompleted, onDisconnected,
  eventDelegateShadow, eventWindow, emitCustomEvent, subscribeSwcAppMessage, publishSwcAppMessage, subscribeSwcAppRouteChange,
  mutationObserver, changedAttribute, setInterval, fetchManual, fetchSettled, swcAppRouteGo, innerHtml
} from '../../src/index.ts';

// window 이벤트는 브라우저가 스스로 보내지 않는 이름(swc-test-ping)을 쓴다 — iframe 이 생길 때 진짜 resize 가 한 번 온다
// "한 번만 돌아야 하는 것이 한 번만 도는지" — 붙이기 / 다시 붙이기 / 옮기기 / 빠른 토글 / 겹친 데코레이터 / 앱 안 라우트·메시지
const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;
const counter = () => {
  const c: Record<string, number> = {};
  return { c, hit: (k: string) => { c[k] = (c[k] ?? 0) + 1; }, take: () => { const o = { ...c }; for (const k of Object.keys(c)) delete c[k]; return o; } };
};

test('mount / reconnect / move: every lifecycle hook once, every listener once, nothing left after remove', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('once');
  const { hit, take } = counter();
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onInitialize init() { hit('init'); }
    @onConnectedBefore before() { hit('before'); }
    @onConnectedBodyShadow render() { hit('render'); return '<button class="b">b</button>'; }
    @onConnectedAfter after() { hit('after'); }
    @onConnectedCompleted done() { hit('completed'); }
    @onDisconnected disc() { hit('disconnected'); }
    @eventDelegateShadow('.b', 'click') onB() { hit('click'); }
    @eventWindow('swc-test-ping') onResize() { hit('resize'); }
    @mutationObserver onMut() { hit('mutation'); }
    @changedAttribute('mode') onMode() { hit('changedAttribute'); }
  }
  const el: any = await mount(w, tag);
  const actions = async () => {
    el.shadowRoot.querySelector('.b').click();
    w.dispatchEvent(new w.Event('swc-test-ping'));
    el.setAttribute('mode', String(Math.random()));
    el.shadowRoot.appendChild(w.document.createElement('span'));
    await sleep(20);
    return take();
  };
  const listenersOnce = { click: 1, resize: 1, changedAttribute: 1, mutation: 1 };
  // bare @mutationObserver 는 렌더 전에 붙으므로 매 연결의 첫 렌더도 한 번 본다
  assert.deepStrictEqual(take(), { init: 1, before: 1, render: 1, mutation: 1, after: 1, completed: 1 }, 'first mount');
  assert.deepStrictEqual(await actions(), listenersOnce, 'after first mount');

  el.remove(); await sleep(10); w.document.body.appendChild(el); await sleep(40);
  assert.deepStrictEqual(take(), { disconnected: 1, before: 1, render: 1, mutation: 1, after: 1, completed: 1 }, 'reconnect (no second init)');
  assert.deepStrictEqual(await actions(), listenersOnce, 'after reconnect');

  const box = w.document.createElement('section'); w.document.body.appendChild(box); box.appendChild(el); await sleep(40);
  assert.deepStrictEqual(take(), { disconnected: 1, before: 1, render: 1, mutation: 1, after: 1, completed: 1 }, 'move');
  assert.deepStrictEqual(await actions(), listenersOnce, 'after move');

  el.remove(); await sleep(10); take();
  w.dispatchEvent(new w.Event('swc-test-ping')); await sleep(20);
  assert.deepStrictEqual(take(), {}, 'nothing fires after remove');
  destroy();
});

// 회귀: 연결 처리(await) 중에 떼었다 붙이면 끝나지 않은 연결이 이어서 리스너·타이머를 등록해 — 겹쳐 돌고, 떼어낸 뒤에도 남았다
test('rapid remove/append without waiting: one live connection, no leaked listeners or timers', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('toggle');
  const { hit, take } = counter();
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onInitialize init() { hit('init'); }
    @onConnectedBodyShadow async render() { await sleep(5); return '<p>x</p>'; }
    @onConnectedAfter after() { hit('after'); }
    @onConnectedCompleted done() { hit('completed'); }
    @eventWindow('swc-test-ping') onResize() { hit('resize'); }
    @setInterval(10, { type: 'onConnected' }) tick() { hit('tick'); }
  }
  const el: any = w.document.createElement(tag);
  w.document.body.appendChild(el);
  for (let i = 0; i < 3; i++) { el.remove(); w.document.body.appendChild(el); }
  await sleep(60);
  const life = take(); delete life.tick;
  assert.deepStrictEqual(life, { init: 1, after: 1, completed: 1 });
  w.dispatchEvent(new w.Event('swc-test-ping')); await sleep(55);
  const live = take();
  assert.strictEqual(live.resize, 1, 'one window listener');
  assert.ok(live.tick >= 3 && live.tick <= 7, `one 10ms interval in 55ms, got ${live.tick}`);
  el.remove(); await sleep(15); take(); await sleep(40);
  w.dispatchEvent(new w.Event('swc-test-ping'));
  assert.deepStrictEqual(take(), {}, 'no leaks after remove');
  destroy();
});

test('moving the element while it is still connecting runs onConnectedAfter once', async () => {
  const { w, destroy } = await createWindow();
  const tag = uniqueTag('move-connecting');
  const { hit, take } = counter();
  @elementDefine(tag, { window: w })
  class El extends w.HTMLElement {
    @onConnectedBodyShadow async render() { await sleep(10); return '<button class="b">b</button>'; }
    @onConnectedAfter after() { hit('after'); }
    @eventDelegateShadow('.b', 'click') onB() { hit('click'); }
  }
  const el: any = w.document.createElement(tag);
  const [a, b] = [w.document.createElement('div'), w.document.createElement('div')];
  w.document.body.append(a, b);
  a.appendChild(el); b.appendChild(el);
  await sleep(60);
  assert.strictEqual(take().after, 1);
  el.shadowRoot.querySelector('.b').click(); await sleep(5);
  assert.deepStrictEqual(take(), { click: 1 });
  destroy();
});

test('stacked decorators on one method: the method body and each effect run once', async () => {
  const tag = uniqueTag('stack');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const { hit, take } = counter();
  await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<button class="go">go</button>'; }
      @eventDelegateShadow('.go', 'click')
      @swcAppRouteGo({ valueKey: 'to' })
      @publishSwcAppMessage('went', { valueKey: 'msg' })
      @emitCustomEvent('went', { valueKey: 'msg' })
      @fetchManual(() => 'f')
      async go(@fetchSettled s?: PromiseSettledResult<string>) { hit('body'); return { to: '/next', msg: s?.status }; }
      @subscribeSwcAppMessage('went') onWent() { hit('message'); }
      @subscribeSwcAppRouteChange('/next') onNext() { hit('route'); }
    }
    return tag;
  }]);
  const el: any = w.document.querySelector(tag);
  el.addEventListener('went', () => hit('customEvent'));
  take();
  el.shadowRoot.querySelector('.go').click(); await sleep(80);
  assert.deepStrictEqual(take(), { body: 1, customEvent: 1, message: 1, route: 1 });
  destroy();
});

test('app: each route change / message reaches a subscriber once; reconnect replays once and does not re-init', async () => {
  const tag = uniqueTag('app-once');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const { hit, take } = counter();
  const app = await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @onInitialize init() { hit('init'); }
      @subscribeSwcAppRouteChange onAnyRoute() { hit('route'); }
      @subscribeSwcAppRouteChange('/a/{id}', { on: 'enter' }) enterA() { hit('enterA'); }
      @subscribeSwcAppMessage('m', { subject: 'behavior' }) onM() { hit('message'); }
      @publishSwcAppMessage('m') send() { return 1; }
    }
    return tag;
  }]);
  assert.deepStrictEqual(take(), { init: 1, route: 1 }, 'boot');
  await app.router.go('/a/1'); await sleep(40);
  assert.deepStrictEqual(take(), { route: 1, enterA: 1 }, 'go /a/1');
  const el: any = w.document.querySelector(tag);
  el.send(); await sleep(30);
  assert.deepStrictEqual(take(), { message: 1 }, 'send');
  el.remove(); await sleep(20); app.appendChild(el); await sleep(80);
  assert.deepStrictEqual(take(), { route: 1, enterA: 1, message: 1 }, 'reconnect: route + behavior replay once, no init');
  el.send(); await sleep(30); await app.router.go('/a/2'); await sleep(40);
  assert.deepStrictEqual(take(), { message: 1, route: 1 }, 'after reconnect');
  destroy();
});

test('the same decorator twice on one method: each registration works, none is dropped or doubled', async () => {
  const tag = uniqueTag('twice');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const { hit, take } = counter();
  await bootApp(w, [(win: Window) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<button class="a">a</button><button class="b">b</button>'; }
      @eventDelegateShadow('.a', 'click')
      @eventDelegateShadow('.b', 'click')
      onButton(e: Event) { hit(`click.${(e.target as HTMLElement).className}`); }
      @subscribeSwcAppMessage('x')
      @subscribeSwcAppMessage('y')
      onXY() { hit('message'); }
      @publishSwcAppMessage('x') sendX() { return 1; }
      @publishSwcAppMessage('y') sendY() { return 1; }
      @onConnectedAfter
      @onConnectedCompleted
      both() { hit('after+completed'); }
    }
    return tag;
  }]);
  const el: any = w.document.querySelector(tag);
  assert.deepStrictEqual(take(), { 'after+completed': 2 }, 'one method as two hooks → called once per hook');
  el.shadowRoot.querySelector('.a').click(); el.shadowRoot.querySelector('.b').click();
  el.sendX(); el.sendY(); await sleep(30);
  assert.deepStrictEqual(take(), { 'click.a': 1, 'click.b': 1, message: 2 });
  destroy();
});

test('nested components: children connect once each; a parent re-render disconnects and connects them once each', async () => {
  const parent = uniqueTag('par'), child = uniqueTag('chi');
  const { w, destroy } = await createWindow(appHtml(`<${parent}></${parent}>`));
  const { hit, take } = counter();
  await bootApp(w, [(win: Window) => {
    @elementDefine(child, { window: win })
    class C extends (win as any).HTMLElement {
      @onInitialize init() { hit('init'); }
      @onConnectedAfter after() { hit('after'); }
      @onDisconnected disc() { hit('disc'); }
      @subscribeSwcAppMessage('n') onN() { hit('message'); }
    }
    @elementDefine(parent, { window: win })
    class P extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return `<div class="box"><${child}></${child}><${child}></${child}></div>`; }
      @innerHtml('.box') rerender() { return `<${child}></${child}><${child}></${child}>`; }
      @publishSwcAppMessage('n') send() { return 1; }
    }
    return parent;
  }]);
  await sleep(40);
  assert.deepStrictEqual(take(), { init: 2, after: 2 }, 'boot');
  const p: any = w.document.querySelector(parent);
  p.rerender(); await sleep(60);
  assert.deepStrictEqual(take(), { disc: 2, init: 2, after: 2 }, 're-render: old two out, new two in');
  p.send(); await sleep(30);
  assert.deepStrictEqual(take(), { message: 2 }, 'only the two live children receive');
  destroy();
});
