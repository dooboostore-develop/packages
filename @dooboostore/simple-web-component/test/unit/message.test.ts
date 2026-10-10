import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, bootApp, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, publishSwcAppMessage, publishMessage, subscribeSwcAppMessage, subscribeSwcAppMessageBehavior, subscribeSwcAppMessageReplay, receiveMessage, appMessage,
  appMessageBeforeReturn, hostSet, swcAppRouter, swcAppSimpleApplication, swcAppHost
} from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

/** 앱을 띄운다. define 은 (win, tag) 마다 요소 정의, initial 은 처음부터 #app 안에 둘 태그 */
const setup = async (defs: Record<string, (win: any, tag: string) => void>, initial: string[] = Object.keys(defs)) => {
  const tags = Object.fromEntries(Object.keys(defs).map(k => [k, uniqueTag(`msg-${k}`)]));
  const { w, destroy } = await createWindow(appHtml(initial.map(k => `<${tags[k]}></${tags[k]}>`).join('')));
  const app = await bootApp(w, Object.entries(defs).map(([k, d]) => (win: Window) => { d(win, tags[k]); return tags[k]; }));
  const el = (k: string) => w.document.querySelector(tags[k]);
  /** 나중에 연결되는 요소 */
  const attach = async (k: string) => { const e = w.document.createElement(tags[k]); app.appendChild(e); await sleep(40); return e; };
  return { w, app, el, attach, destroy };
};

test('bare subscriber gets every message; typed subscriber only its type; publisher/data/type are set', async () => {
  const all: any[] = [];
  const typed: any[] = [];
  const { el, destroy } = await setup({
    pub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class P extends win.HTMLElement {
        @publishSwcAppMessage plain() { return 1; }
        @publishSwcAppMessage('login') login(name: string) { return { name }; }
      }
    },
    sub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class S extends win.HTMLElement {
        @subscribeSwcAppMessage onAny(m: any) { all.push(m.type ?? null); }
        @subscribeSwcAppMessage('login') onLogin(m: any) { typed.push(m); }
      }
    }
  });
  const pub = el('pub');
  assert.strictEqual(pub.plain(), 1, 'return value passes through');
  assert.deepStrictEqual(pub.login('kim'), { name: 'kim' });
  await sleep(10);
  assert.deepStrictEqual(all, [null, 'login']);
  assert.strictEqual(typed.length, 1);
  assert.strictEqual(typed[0].publisher, pub);
  assert.deepStrictEqual(typed[0].data, { name: 'kim' });
  assert.strictEqual(typed[0].type, 'login');
  destroy();
});

test('publish: async return, options-object form, stacked valueKey, publishMessage/receiveMessage aliases', async () => {
  const got: string[] = [];
  const { el, destroy } = await setup({
    pub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class P extends win.HTMLElement {
        @publishMessage('later') async later() { await sleep(5); return 'L'; }
        @publishSwcAppMessage({ messageType: 'obj' }) obj() { return 'O'; }
        @publishSwcAppMessage('e1', { valueKey: 'd1' })
        @publishSwcAppMessage('e2', { valueKey: 'd2' })
        both() { return { d1: 'one', d2: 'two' }; }
      }
    },
    sub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class S extends win.HTMLElement {
        @receiveMessage onAny(m: any) { got.push(`${m.type}:${m.data}`); }
      }
    }
  });
  const pub = el('pub');
  await pub.later();
  pub.obj();
  pub.both();
  await sleep(10);
  assert.deepStrictEqual(got.sort(), ['e1:one', 'e2:two', 'later:L', 'obj:O']);
  destroy();
});

test('filter / before (@appMessageBeforeReturn) / finally options', async () => {
  const log: any[] = [];
  const { app, destroy } = await setup({
    sub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class S extends win.HTMLElement {
        @subscribeSwcAppMessage('user', {
          filter: (m: any) => m.data === 'admin',
          before: (m: any) => `before:${m.data}`,
          finally: (_m: any, _t: any, ctx: any) => { log.push(['finally', ctx.result]); }
        })
        onAdmin(@appMessageBeforeReturn b: string) { log.push(['handler', b]); return 'done'; }
      }
    }
  });
  app.publishMessage({ type: 'user', data: 'guest' });
  app.publishMessage({ type: 'user', data: 'admin' });
  await sleep(10);
  assert.deepStrictEqual(log, [['handler', 'before:admin'], ['finally', 'done']]);
  destroy();
});

test('@appMessage and @hostSet are injected regardless of position', async () => {
  let got: any;
  const { app, el, destroy } = await setup({
    sub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class S extends win.HTMLElement {
        @subscribeSwcAppMessage('x') onX(@hostSet hs: any, @appMessage msg: any) { got = { hs, msg }; }
      }
    }
  });
  app.publishMessage({ type: 'x', data: 7 });
  await sleep(10);
  assert.strictEqual(got.msg.data, 7);
  assert.strictEqual(got.hs.$appHost, app);
  assert.ok(el('sub'));
  destroy();
});

test('@swcAppRouter/@swcAppSimpleApplication/@swcAppHost are also injected on a message subscriber', async () => {
  let got: any;
  const { app, destroy } = await setup({
    sub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class S extends win.HTMLElement {
        @subscribeSwcAppMessage('r') onR(@appMessage msg: any, @swcAppRouter router: any, @swcAppSimpleApplication simpleApp: any, @swcAppHost appHost: any) { got = { msg, router, simpleApp, appHost }; }
      }
    }
  });
  app.publishMessage({ type: 'r', data: 1 });
  await sleep(10);
  assert.strictEqual(got.msg.data, 1);
  assert.strictEqual(typeof got.router?.go, 'function');
  assert.strictEqual(got.simpleApp, (app as any).simpleApplication);
  assert.strictEqual(got.appHost, app);
  destroy();
});

test("late subscriber: 'behavior' replays the last message, 'replay' the whole buffer, default nothing", async () => {
  const log: string[] = [];
  const { app, attach, destroy } = await setup({
    late: (win, tag) => {
      @elementDefine(tag, { window: win })
      class L extends win.HTMLElement {
        @subscribeSwcAppMessage('a', { subject: 'behavior' }) onA(m: any) { log.push(`behavior:${m.data}`); }
        @subscribeSwcAppMessage('b', { subject: 'replay' }) onB(m: any) { log.push(`replay:${m.data}`); }
        @subscribeSwcAppMessage('c') onC(m: any) { log.push(`live:${m.data}`); }
      }
    }
  }, []);
  for (const t of ['a', 'b', 'c']) { app.publishMessage({ type: t, data: 1 }); app.publishMessage({ type: t, data: 2 }); }
  await attach('late');
  assert.deepStrictEqual(log, ['behavior:2', 'replay:1', 'replay:2']);
  app.publishMessage({ type: 'c', data: 3 });
  await sleep(10);
  assert.deepStrictEqual(log.at(-1), 'live:3', 'live messages reach it once connected');
  destroy();
});

test('subscribeSwcAppMessageBehavior / subscribeSwcAppMessageReplay = subject option in the name (options still pass through)', async () => {
  const log: string[] = [];
  const { app, attach, destroy } = await setup({
    late: (win, tag) => {
      @elementDefine(tag, { window: win })
      class L extends win.HTMLElement {
        @subscribeSwcAppMessageBehavior('a') onA(m: any) { log.push(`behavior:${m.data}`); }
        @subscribeSwcAppMessageReplay('b') onB(m: any) { log.push(`replay:${m.data}`); }
        @subscribeSwcAppMessageBehavior('d', { filter: (m: any) => m.data !== 2 }) onD(m: any) { log.push(`filtered:${m.data}`); }
      }
    }
  }, []);
  for (const t of ['a', 'b', 'd']) { app.publishMessage({ type: t, data: 1 }); app.publishMessage({ type: t, data: 2 }); }
  await attach('late');
  assert.deepStrictEqual(log, ['behavior:2', 'replay:1', 'replay:2']);
  app.publishMessage({ type: 'd', data: 3 });
  await sleep(10);
  assert.deepStrictEqual(log.at(-1), 'filtered:3');
  destroy();
});

test("trigger 'connectedDone' replays after the element rendered its own DOM", async () => {
  const seen: Record<string, boolean> = {};
  const { app, attach, destroy } = await setup({
    late: (win, tag) => {
      @elementDefine(tag, { window: win })
      class L extends win.HTMLElement {
        @onConnectedBodyShadow render() { return '<div class="wrap"></div>'; }
        @subscribeSwcAppMessage('auth', { subject: 'behavior', trigger: 'connectedDone' })
        onAuth() { seen.done = !!this.shadowRoot?.querySelector('.wrap'); }
        @subscribeSwcAppMessage('auth2', { subject: 'behavior' })
        onAuth2() { seen.connected = !!this.shadowRoot?.querySelector('.wrap'); }
      }
    }
  }, []);
  app.publishMessage({ type: 'auth', data: 'me' });
  app.publishMessage({ type: 'auth2', data: 'me' });
  await attach('late');
  assert.strictEqual(seen.done, true);
  assert.strictEqual(seen.connected, false, "default 'connected' replays before render");
  destroy();
});

test('a disconnected element stops receiving messages', async () => {
  let n = 0;
  const { app, el, destroy } = await setup({
    sub: (win, tag) => {
      @elementDefine(tag, { window: win })
      class S extends win.HTMLElement { @subscribeSwcAppMessage('t') onT() { n++; } }
    }
  });
  app.publishMessage({ type: 't' });
  await sleep(10);
  el('sub').remove();
  await sleep(20);
  app.publishMessage({ type: 't' });
  await sleep(10);
  assert.strictEqual(n, 1);
  destroy();
});

test('observeMessage: live / by type / behavior / options-object replay / unsubscribe', async () => {
  const { app, destroy } = await setup({});
  app.publishMessage({ type: 'k', data: 1 });
  app.publishMessage({ type: 'k', data: 2 });
  const live: any[] = [], typed: any[] = [], behavior: any[] = [], replay: any[] = [];
  const subs = [
    app.observeMessage().subscribe((m: any) => live.push(m.data)),
    app.observeMessage('j').subscribe((m: any) => typed.push(m.data)),
    app.observeMessage('k', { subject: 'behavior' }).subscribe((m: any) => behavior.push(m.data)),
    app.observeMessage({ type: 'k', subject: 'replay' }).subscribe((m: any) => replay.push(m.data))
  ];
  app.publishMessage({ type: 'j', data: 'J' });
  app.publishMessage({ type: 'k', data: 3 });
  subs.forEach(s => s.unsubscribe());
  app.publishMessage({ type: 'k', data: 4 });
  assert.deepStrictEqual(live, ['J', 3]);
  assert.deepStrictEqual(typed, ['J']);
  assert.deepStrictEqual(behavior, [2, 3]);
  assert.deepStrictEqual(replay, [1, 2, 3]);
  destroy();
});
