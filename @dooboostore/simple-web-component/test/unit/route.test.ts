import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, bootApp, sleep, uniqueTag } from './dom.ts';
import {
  elementDefine, onConnectedBodyShadow, subscribeSwcAppRouteChange, swcAppRouterEvent, swcAppRoute, swcAppRouteGo, event,
  swcAppRoutePush, swcAppRouteReplace, swcAppRoutePushDeleteSearchParam, swcAppRoutePushDeleteHashSearchParam,
  swcAppRoutePushAddSearchParam, swcAppRoutePushUpsertSearchParam, swcAppRouteReplaceDeleteSearchParam,
  swcAppRouteReplaceDeleteHashSearchParam, swcAppRouteReplaceAddSearchParam, swcAppRouteReplaceUpsertSearchParam,
  swcAppRouteQueryParam, swcAppRouteFirstQueryParam, swcAppRouteLastQueryParam, swcAppRouteQueryParams, swcAppRouteQueryParamObject,
  swcAppRouteFirstQueryParamObject, swcAppRouteLastQueryParamObject, swcAppRouteQueryParamsObject, swcAppRouteURLSearchParams,
  swcAppRoutePathVariable, swcAppRouteFirstPathVariable, swcAppRouteLastPathVariable, swcAppRoutePathVariables,
  swcAppRoutePathVariableObject, swcAppRouteFirstPathVariableObject, swcAppRouteLastPathVariableObject,
  swcAppRoutePathVariablesObject
} from '../../src/index.ts';

const appHtml = (inner: string) => `<!DOCTYPE html><html><body><div id="app" is="swc-app-div">${inner}</div></body></html>`;

/** 계속 붙어 있는 요소(헤더 같은) 하나를 띄우고 라우터를 돌려준다 */
const setup = async (define: (win: Window, tag: string) => void) => {
  const tag = uniqueTag('route');
  const { w, destroy } = await createWindow(appHtml(`<${tag}></${tag}>`));
  const app = await bootApp(w, [(win: Window) => { define(win, tag); return tag; }]);
  const go = async (path: string) => { await app.router.go(path); await sleep(40); };
  return { w, app, go, el: w.document.querySelector(tag), destroy };
};

test("on: 'match' (default) keeps the existing behavior — runs every time the path matches", async () => {
  const calls: string[] = [];
  const { go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/a/{id}') onA(route: any) { calls.push(route.pathData.id); }
    }
  });
  await go('/a/1');
  await go('/a/1');
  await go('/b');
  await go('/a/2');
  assert.deepStrictEqual(calls, ['1', '1', '2']);
  destroy();
});

test("on: 'enter' / 'update' / 'leave' fire on the matching transitions", async () => {
  const log: string[] = [];
  const { go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/a/{id}', { on: 'enter' }) enter(route: any) { log.push(`enter:${route.pathData.id}`); }
      @subscribeSwcAppRouteChange('/a/{id}', { on: 'update' }) update(route: any) { log.push(`update:${route.pathData.id}${route.search}`); }
      @subscribeSwcAppRouteChange('/a/{id}', { on: 'leave' }) leave(route: any) { log.push(`leave:${route.pathData.id}`); }
    }
  });
  await go('/a/1');      // enter
  await go('/a/1');      // 같은 경로·같은 query → 아무 것도 아님
  await go('/a/2');      // path 변수 변경 → update
  await go('/a/2?x=1');  // query 변경 → update
  await go('/b');        // leave (직전 pathData 로)
  await go('/a/3');      // 다시 enter
  assert.deepStrictEqual(log, ['enter:1', 'update:2', 'update:2?x=1', 'leave:2', 'enter:3']);
  destroy();
});

test("bare subscription: 'match' runs on every route change, 'update' on every url change, 'enter' once", async () => {
  const log: string[] = [];
  const { go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange match(route: any) { log.push(`match:${route.path}`); }
      @subscribeSwcAppRouteChange({ on: 'update' }) update(route: any) { log.push(`update:${route.path}${route.search}`); }
      @subscribeSwcAppRouteChange({ on: 'enter' }) enter(route: any) { log.push(`enter:${route.path}`); }
    }
  });
  await go('/x');
  await go('/y');      // 경로만 바뀜 (query 같음) → update
  await go('/y?q=1');  // query 바뀜 → update
  assert.deepStrictEqual(log, ['match:/', 'enter:/', 'match:/x', 'update:/x', 'match:/y', 'update:/y', 'match:/y', 'update:/y?q=1']);
  destroy();
});

test("on: 'beforeLeave' returning false cancels router.go; true lets it through", async () => {
  let allow = false;
  const asked: string[] = [];
  const { w, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/edit/{id}', { on: 'beforeLeave' })
      confirmLeave(route: any) { asked.push(`${route.pathData.id}->${route.to.path}`); return allow; }
    }
  });
  await go('/edit/1');
  await go('/other');
  assert.strictEqual(w.location.pathname, '/edit/1', 'blocked');
  allow = true;
  await go('/other');
  assert.strictEqual(w.location.pathname, '/other', 'allowed');
  await go('/somewhere'); // /edit 를 떠나는 게 아니므로 가드 안 물어봄
  assert.deepStrictEqual(asked, ['1->/other', '1->/other']);
  destroy();
});

test("on: 'beforeLeave' blocks browser back by restoring the url", async () => {
  const { w, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/edit/{id}', { on: 'beforeLeave' }) confirmLeave() { return false; }
    }
  });
  await go('/list');
  await go('/edit/7');
  w.history.back();
  await sleep(80);
  assert.strictEqual(w.location.pathname, '/edit/7');
  destroy();
});

test('beforeLeave guard is removed when the element disconnects (no leak in the router)', async () => {
  const { w, app, el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/edit/{id}', { on: 'beforeLeave' }) confirmLeave() { return false; }
    }
  });
  await go('/edit/1');
  assert.strictEqual(app.router.hasLeaveGuards, true);
  el.remove();
  await sleep(20);
  assert.strictEqual(app.router.hasLeaveGuards, false, 'guard must be unregistered, not just skipped');
  await go('/other');
  assert.strictEqual(w.location.pathname, '/other');
  destroy();
});

test('route parameter decorators inject query/path values (first/last/all) alongside @swcAppRouterEvent', async () => {
  let got: any;
  const { go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/a/{id}/b/{id}')
      onRoute(
        @swcAppRouterEvent route: any,
        @swcAppRouteQueryParam('tag') q: string | null,
        @swcAppRouteFirstQueryParam('tag') qFirst: string | null,
        @swcAppRouteLastQueryParam('tag') qLast: string | null,
        @swcAppRouteQueryParams('tag') qAll: string[],
        @swcAppRouteQueryParam('missing') qMissing: string | null,
        @swcAppRouteQueryParamObject qObj: any,
        @swcAppRouteFirstQueryParamObject qFirstObj: any,
        @swcAppRouteLastQueryParamObject qLastObj: any,
        @swcAppRouteQueryParamsObject qAllObj: any,
        @swcAppRouteURLSearchParams sp: URLSearchParams,
        @swcAppRoutePathVariable('id') v: string,
        @swcAppRouteFirstPathVariable('id') vFirst: string,
        @swcAppRouteLastPathVariable('id') vLast: string,
        @swcAppRoutePathVariables('id') vAll: string[],
        @swcAppRoutePathVariableObject vObj: any,
        @swcAppRouteFirstPathVariableObject vFirstObj: any,
        @swcAppRouteLastPathVariableObject vLastObj: any,
        @swcAppRoutePathVariablesObject vAllObj: any
      ) {
        got = { path: route.path, q, qFirst, qLast, qAll, qMissing, qObj, qFirstObj, qLastObj, qAllObj, spTag: sp.getAll('tag'), v, vFirst, vLast, vAll, vObj, vFirstObj, vLastObj, vAllObj };
      }
    }
  });
  await go('/a/1/b/2?tag=x&tag=y&n=3');
  assert.deepStrictEqual(got, {
    path: '/a/1/b/2',
    q: 'x', qFirst: 'x', qLast: 'y', qAll: ['x', 'y'], qMissing: null,
    qObj: { tag: 'x', n: '3' }, qFirstObj: { tag: 'x', n: '3' }, qLastObj: { tag: 'y', n: '3' }, qAllObj: { tag: ['x', 'y'], n: ['3'] },
    spTag: ['x', 'y'],
    v: '1', vFirst: '1', vLast: '2', vAll: ['1', '2'],
    vObj: { id: '1' }, vFirstObj: { id: '1' }, vLastObj: { id: '2' }, vAllObj: { id: ['1', '2'] }
  });
  destroy();
});

test('Router.addLeaveGuard: async false cancels, the returned function unregisters, no guards stays synchronous', async () => {
  const { w, app, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<p></p>'; }
    }
  });
  const router = app.router;
  router.go('/sync');
  assert.strictEqual(w.location.pathname, '/sync', 'without guards go() moves synchronously');
  const off = router.addLeaveGuard(async (to: any) => to.path !== '/blocked');
  await router.go('/blocked');
  assert.strictEqual(w.location.pathname, '/sync');
  await router.go('/fine');
  assert.strictEqual(w.location.pathname, '/fine');
  off();
  await router.go('/blocked');
  assert.strictEqual(w.location.pathname, '/blocked');
  destroy();
});

// ─── @swcAppRoute / @swcAppRouteGo: 메서드 리턴값으로 이동 (DI 로 router 를 받을 필요 없음) ───

test('@swcAppRouteGo: stacked on a click handler, navigates to the returned path; undefined does not navigate', async () => {
  let target: string | undefined = '/next';
  const { w, el, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @onConnectedBodyShadow render() { return '<button class="b">go</button>'; }
      @event('.b', 'click')
      @swcAppRouteGo
      onClick() { return target; }
    }
  });
  el.shadowRoot.querySelector('.b').click();
  await sleep(30);
  assert.strictEqual(w.location.pathname, '/next');
  target = undefined;
  el.shadowRoot.querySelector('.b').click();
  await sleep(30);
  assert.strictEqual(w.location.pathname, '/next', 'undefined → stay');
  destroy();
});

test('@swcAppRouteGo: async return, valueKey extraction, config object with replace, number for history', async () => {
  const { w, el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @swcAppRouteGo async later() { await sleep(10); return '/later'; }
      @swcAppRouteGo({ valueKey: 'go' }) picked() { return { go: '/picked', other: 1 }; }
      @swcAppRouteGo replaced() { return { path: '/replaced', replace: true }; }
      @swcAppRouteGo({ replace: true }) replacedByDefault() { return '/replaced-default'; }
      @swcAppRouteGo back() { return -1; }
    }
  });
  const ret = await el.later();
  assert.strictEqual(ret, '/later', 'the original return value passes through');
  await sleep(20);
  assert.strictEqual(w.location.pathname, '/later');

  el.picked();
  await sleep(20);
  assert.strictEqual(w.location.pathname, '/picked');

  const before = w.history.length;
  el.replaced();
  await sleep(20);
  assert.strictEqual(w.location.pathname, '/replaced');
  assert.strictEqual(w.history.length, before, 'replace must not add a history entry');
  el.replacedByDefault();
  await sleep(20);
  assert.strictEqual(w.location.pathname, '/replaced-default');
  assert.strictEqual(w.history.length, before);

  await go('/a');
  await go('/b');
  el.back();
  await sleep(80);
  assert.strictEqual(w.location.pathname, '/a');
  destroy();
});

test('@swcAppRouteGo goes through router.go, so beforeLeave guards apply', async () => {
  const { w, el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/edit', { on: 'beforeLeave' }) confirmLeave() { return false; }
      @swcAppRouteGo leave() { return '/elsewhere'; }
    }
  });
  await go('/edit');
  el.leave();
  await sleep(30);
  assert.strictEqual(w.location.pathname, '/edit');
  destroy();
});

test('router method aliases (push/replace + search param variants) call the matching Router method', async () => {
  const { w, el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @swcAppRoutePush push() { return '/pushed'; }
      @swcAppRouteReplace replace() { return '/replaced'; }
      @swcAppRoutePushUpsertSearchParam upsert() { return { q: 'x', tag: ['a', 'b'] }; }
      @swcAppRoutePushAddSearchParam add() { return [['tag', 'c']]; }
      @swcAppRoutePushDeleteSearchParam del() { return 'q'; }
      @swcAppRouteReplaceUpsertSearchParam rUpsert() { return { page: '2' }; }
      @swcAppRouteReplaceAddSearchParam rAdd() { return [['page', '3']]; }
      @swcAppRouteReplaceDeleteSearchParam rDel() { return ['tag', 'page']; }
      @swcAppRoutePushDeleteHashSearchParam hDel() { return 'h'; }
      @swcAppRouteReplaceDeleteHashSearchParam rhDel() { return 'k'; }
      @swcAppRoute({ type: 'push', valueKey: 'to' }) viaType() { return { to: '/via-type' }; }
    }
  });
  const url = () => w.location.pathname + w.location.search + w.location.hash;
  const len = () => w.history.length;

  let n = len();
  el.push(); await sleep(20);
  assert.strictEqual(url(), '/pushed'); assert.strictEqual(len(), n + 1);
  n = len();
  el.replace(); await sleep(20);
  assert.strictEqual(url(), '/replaced'); assert.strictEqual(len(), n, 'replace keeps the history length');

  el.upsert(); await sleep(20);
  assert.strictEqual(url(), '/replaced?q=x&tag=a&tag=b');
  el.add(); await sleep(20);
  assert.strictEqual(url(), '/replaced?q=x&tag=a&tag=b&tag=c');
  el.del(); await sleep(20);
  assert.strictEqual(url(), '/replaced?tag=a&tag=b&tag=c');

  n = len();
  el.rUpsert(); await sleep(20);
  assert.strictEqual(url(), '/replaced?tag=a&tag=b&tag=c&page=2');
  el.rAdd(); await sleep(20);
  assert.strictEqual(url(), '/replaced?tag=a&tag=b&tag=c&page=2&page=3');
  el.rDel(); await sleep(20);
  assert.strictEqual(url(), '/replaced');
  assert.strictEqual(len(), n, 'replace* variants keep the history length');

  await go('/h#h=1&k=2');
  el.hDel(); await sleep(20);
  assert.strictEqual(url(), '/h#k=2');
  el.rhDel(); await sleep(20);
  assert.strictEqual(url(), '/h');

  el.viaType(); await sleep(20);
  assert.strictEqual(url(), '/via-type');
  destroy();
});

test('@swcAppRoutePush / @swcAppRouteReplace respect beforeLeave guards like go', async () => {
  const { w, el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/edit', { on: 'beforeLeave' }) confirmLeave() { return false; }
      @swcAppRoutePush push() { return '/elsewhere'; }
      @swcAppRouteReplace replace() { return '/elsewhere'; }
      @swcAppRoutePushUpsertSearchParam query() { return { tab: '2' }; }
    }
  });
  await go('/edit');
  el.push(); await sleep(30);
  assert.strictEqual(w.location.pathname, '/edit');
  el.replace(); await sleep(30);
  assert.strictEqual(w.location.pathname, '/edit');
  el.query(); await sleep(30);
  assert.strictEqual(w.location.search, '?tab=2', 'query-only changes stay on the route, so no guard');
  destroy();
});

test('swcAppRoute filter: gets the Router and the extracted value; false skips the navigation (aliases too)', async () => {
  const seen: any[] = [];
  const { w, app, el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      // 같은 경로면 이동 안 함
      @swcAppRouteGo({ valueKey: 'to', filter: (router, to, meta) => { seen.push({ isRouter: router === meta.currentThis.__router, to }); return to !== router.value.path; } })
      move(to: string) { return { to }; }
      @swcAppRoutePushUpsertSearchParam({ filter: (_r, v) => !!v.q }) query(q: string) { return { q }; }
    }
  });
  el.__router = app.router;
  await go('/here');
  el.move('/here'); await sleep(20);
  el.move('/there'); await sleep(20);
  assert.strictEqual(w.location.pathname, '/there');
  assert.deepStrictEqual(seen, [{ isRouter: true, to: '/here' }, { isRouter: true, to: '/there' }]);
  el.query(''); await sleep(20);
  assert.strictEqual(w.location.search, '', 'filter false → no query change');
  el.query('x'); await sleep(20);
  assert.strictEqual(w.location.search, '?q=x');
  destroy();
});


test('subscribeSwcAppRouteChange filter: helper is built on the subscribing element (match and beforeLeave)', async () => {
  const seen: string[] = [];
  const { el, go, destroy } = await setup((win, tag) => {
    @elementDefine(tag, { window: win })
    class El extends (win as any).HTMLElement {
      @subscribeSwcAppRouteChange('/a', { filter: (_r, { helper, currentThis }) => { seen.push(`match:${helper.$this === currentThis}`); return true; } })
      onA() {}
      @subscribeSwcAppRouteChange('/a', { on: 'beforeLeave', filter: (_r, { helper, currentThis }) => { seen.push(`beforeLeave:${helper.$this === currentThis}`); return true; } })
      leaveA() { return true; }
    }
  });
  await go('/a');
  await go('/b');
  assert.ok(el);
  assert.deepStrictEqual(seen, ['match:true', 'beforeLeave:true']);
  destroy();
});
