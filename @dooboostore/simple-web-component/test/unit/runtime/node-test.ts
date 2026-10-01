// 브라우저용 `node:test` 대체 — 테스트 파일은 그대로 두고 test(name, opts?, fn) 만 받는다.
// 실행 결과는 window.__swcTest 에 쌓이고, run.mjs(playwright)가 읽어 간다.

type Opts = { todo?: string | boolean; skip?: string | boolean };
type Result = { name: string; status: 'pass' | 'fail' | 'todo' | 'skip'; ms: number; error?: string; todo?: string };

const queue: { name: string; opts: Opts; fn: () => unknown }[] = [];
const state = { results: [] as Result[], done: false, current: null as string | null, uncaught: [] as string[] };
(globalThis as any).__swcTest = state;

const describeError = (e: any) => (e?.stack ? String(e.stack) : String(e));

// 테스트 도중 잡히지 않은 에러/거부는 그 테스트의 실패로 본다 (node:test 와 같은 취급)
const onUncaught = (msg: string) => { state.uncaught.push(msg); };
addEventListener('error', e => onUncaught(describeError((e as ErrorEvent).error ?? (e as ErrorEvent).message)));
addEventListener('unhandledrejection', e => onUncaught(describeError((e as PromiseRejectionEvent).reason)));

export function test(name: string, optsOrFn: Opts | (() => unknown), maybeFn?: () => unknown) {
  const opts = typeof optsOrFn === 'function' ? {} : optsOrFn;
  const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn!;
  const grep = (globalThis as any).__swcTestGrep as string | undefined; // run.mjs 의 SWC_TEST_GREP
  if (grep && !new RegExp(grep).test(name)) return;
  queue.push({ name, opts, fn });
}

// 테스트 파일의 모듈 평가(= test() 등록)가 끝난 뒤 순서대로 돌린다. 등록이 0개여도 done 이 된다
setTimeout(run, 0);

async function run() {
  for (const t of queue) {
    if (t.opts.skip) { state.results.push({ name: t.name, status: 'skip', ms: 0 }); continue; }
    state.current = t.name;
    if ((globalThis as any).__swcTestDebug) console.log(`▷ ${t.name}`);
    state.uncaught = [];
    const t0 = performance.now();
    let error: string | undefined;
    try {
      await t.fn();
      await new Promise(r => setTimeout(r, 0));
      if (state.uncaught.length) error = `uncaught during test:\n${state.uncaught.join('\n')}`;
    } catch (e) {
      error = describeError(e);
    }
    const ms = Math.round(performance.now() - t0);
    const todo = t.opts.todo ? (typeof t.opts.todo === 'string' ? t.opts.todo : 'todo') : undefined;
    // todo 는 실패해도 실패로 세지 않는다 (node:test 와 같음)
    state.results.push(todo ? { name: t.name, status: 'todo', ms, todo, error } : { name: t.name, status: error ? 'fail' : 'pass', ms, error });
  }
  state.current = null;
  state.done = true;
}

export default test;
