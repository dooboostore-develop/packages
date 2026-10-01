import {
  elementDefine, onConnectedBodyLight, fetch, fetchManual, fetchGet, fetchPost, fetchPut, fetchPatch, fetchDelete, fetchLatest, fetchBefore, fetchAfter, fetchSettled, event, eventObject, eventBeforeReturn
} from '@dooboostore/simple-web-component';

/**
 * @fetch before/after 검증 페이지.
 * - before: GET → settled를 @fetchSettled 자리에 주입받아 실행
 * - after: 메서드 리턴을 body로 POST → fetch 결과 표시
 */
export default (w: Window) => {
  const tagName = 'swc-example-fetch-test-page';
  if (w.customElements.get(tagName)) return tagName;

  // disconnect abort 검증용: 느린 요청 중에 제거되는 요소
  const probeTag = 'swc-example-fetch-abort-probe';
  const probe = { methodRan: false, afterRan: false, finallyError: '', hangMethodRan: false, hangFinallyError: '' };
  @elementDefine(probeTag, { window: w })
  class FetchAbortProbe extends w.HTMLElement {
    @fetch({
      url: 'http://127.0.0.1:8101/api/slow?n=probe',
      after: () => { probe.afterRan = true; },
      finally: (_c, _h, _p, ctx) => { probe.finallyError = ctx.error?.name ?? 'none'; }
    })
    async load(@fetchSettled settled?: PromiseSettledResult<any>) {
      probe.methodRan = true;
      return settled;
    }

    // signal 을 무시하고 3초 뒤에야 끝나는 사용자 manual — 그래도 abort 즉시 호출이 끝나야 한다
    @fetch({
      manual: () => new Promise(resolve => setTimeout(() => resolve('late'), 3000)),
      finally: (_c, _h, _p, ctx) => { probe.hangFinallyError = ctx.error?.name ?? 'none'; }
    })
    async hang(@fetchSettled settled?: PromiseSettledResult<any>) {
      probe.hangMethodRan = true;
      return settled;
    }
  }

  @elementDefine(tagName, { window: w })
  class FetchTestPage extends w.HTMLElement {
    @fetch('http://127.0.0.1:8101/api/post/1')
    async loadDefault(@fetchSettled settled: PromiseSettledResult<any>) {
      return settled;
    }

    @fetch({
      url: 'http://127.0.0.1:8101/api/post/1',
      request: () => ({ method: 'GET', headers: { 'X-Hook': 'before' } }),
      after: (_c, _h, _p, settled) => { (window as any).__fetchAfter = settled.status; },
      finally: (_c, _h, _p, ctx) => { (window as any).__fetchFinally = ctx.result.status; }
    })
    async loadHooks(@fetchSettled settled: PromiseSettledResult<any>) {
      return settled;
    }

    @fetch({
      url: 'http://127.0.0.1:8101/api/post/1',
      trigger: 'before',
      request: 'GET'
    })
    async loadBefore(@fetchSettled settled: PromiseSettledResult<any>) {
      return settled;
    }

    @fetch({
      url: 'http://127.0.0.1:8101/api/posts',
      trigger: 'after',
      process: 'json'
    })
    async saveAfter() {
      return { title: 'swc-fetch', body: 'hello', userId: 7 };
    }

    @fetch({
      url: 'http://127.0.0.1:8101/api/echo',
      trigger: 'after',
      process: 'form'
    })
    async saveForm() {
      return { title: 'multipart-check', userId: '7' };
    }

    @fetch({
      url: 'http://127.0.0.1:8101/api/echo',
      trigger: 'after',
      process: 'urlencoded'
    })
    async saveUrlencoded() {
      return { title: 'urlencoded-check', userId: '7' };
    }

    // 수동형: 요청을 직접 만든다. signal 을 넘기면 disconnect 때 네트워크까지 끊긴다
    @fetch({
      trigger: 'before',
      manual: async (_c, _h, _p, signal) => {
        const res = await window.fetch('http://127.0.0.1:8101/api/post/1', { headers: { 'X-Custom': 'fetch-test' }, signal });
        const data = await res.json();
        return { ...data, via: 'custom-fetching' };
      }
    })
    async loadCustom(@fetchSettled settled: PromiseSettledResult<any>) {
      return settled;
    }

    // filter false → 메서드도 fetch 도 실행 안 함
    @fetch({ url: 'http://127.0.0.1:8101/api/post/1', filter: () => false })
    async loadFiltered(@fetchSettled settled?: PromiseSettledResult<any>) {
      return 'method-ran';
    }

    // 404 → HttpResponseError (status 를 코드에서 꺼낼 수 있어야 함)
    @fetch('http://127.0.0.1:8101/api/missing')
    async load404(@fetchSettled settled?: PromiseSettledResult<any>) {
      return settled;
    }

    // Headers 인스턴스 보존 + 사용자 Content-Type 우선 (process:json 이어도)
    @fetch({
      url: 'http://127.0.0.1:8101/api/echo',
      trigger: 'after',
      process: 'json',
      request: () => ({ method: 'POST', headers: new Headers({ 'Content-Type': 'text/x-custom' }) })
    })
    async saveHeaders() {
      return { a: 1 };
    }

    // Blob 은 process:json 이어도 가공하지 않고 그대로
    @fetch({ url: 'http://127.0.0.1:8101/api/echo', trigger: 'after', process: 'json' })
    async saveBlob() {
      return new Blob(['blob-raw'], { type: 'text/x-blob' });
    }

    // abortPrevious: 연달아 부르면 이전 요청은 끊기고(undefined) 마지막 것만 결과
    @fetch({ url: (_c, _h, p) => `http://127.0.0.1:8101/api/slow?n=${p[0]}`, abortPrevious: true })
    async search(n: number, @fetchSettled settled?: PromiseSettledResult<any>) {
      return settled?.status === 'fulfilled' ? settled.value.n : settled?.status;
    }

    @event('#btn-abort', 'click')
    async onAbortClick() {
      this.say('#out-abort', 'loading...');
      const el = document.createElement(probeTag) as FetchAbortProbe;
      this.append(el);
      const pending = el.load();
      setTimeout(() => el.remove(), 100);
      const loadResult = await pending;

      const el2 = document.createElement(probeTag) as FetchAbortProbe;
      this.append(el2);
      const t0 = performance.now();
      const hanging = el2.hang();
      setTimeout(() => el2.remove(), 100);
      const hangResult = await hanging;
      const hangMs = Math.round(performance.now() - t0);
      await new Promise(r => setTimeout(r, 900)); // 서버 응답(0.8s) 이후까지 기다려도 메서드/after 가 안 돌아야 함
      const [first, second] = await Promise.all([this.search(1), this.search(2)]);
      const r = { loadResult: loadResult ?? 'undefined', ...probe, hangResult: hangResult ?? 'undefined', hangSettledFast: hangMs < 1000, first: first ?? 'undefined', second };
      this.say('#out-abort', `<pre id="abort-json">${JSON.stringify(r)}</pre>`);
    }

    // 수동형 after: 메서드 리턴값이 returnValue 로 들어온다
    @fetch({
      trigger: 'after',
      manual: async (_c, _h, _p, signal, returnValue) => {
        const res = await window.fetch('http://127.0.0.1:8101/api/echo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(returnValue), signal });
        return res.json();
      }
    })
    async saveManual() {
      return { manual: true, n: 3 };
    }

    // ─── 별칭 ───
    @fetchGet('http://127.0.0.1:8101/api/post/1')
    async aliasGet(@fetchSettled settled?: PromiseSettledResult<any>) { return settled?.status === 'fulfilled' ? settled.value.title : settled?.status; }

    @fetchPost('http://127.0.0.1:8101/api/posts', { process: 'json' })
    async aliasPost() { return { title: 'alias-post' }; }

    @fetchPut('http://127.0.0.1:8101/api/method', { process: 'json', valueKey: 'payload' })
    async aliasPut() { return { payload: { v: 'put' } }; }

    @fetchPatch('http://127.0.0.1:8101/api/method', { process: 'text' })
    async aliasPatch() { return 'patch-body'; }

    @fetchDelete((_c, _h, p) => `http://127.0.0.1:8101/api/method?id=${p[0]}`)
    async aliasDelete(_id: number, @fetchSettled settled?: PromiseSettledResult<any>) { return settled?.status === 'fulfilled' ? settled.value.method : settled?.status; }

    @fetchManual((self: FetchTestPage) => self.localEcho('manual'))
    async aliasManual(@fetchSettled settled?: PromiseSettledResult<any>) { return settled?.status === 'fulfilled' ? settled.value : settled?.status; }

    @fetchLatest({ manual: (_s, _h, p) => new Promise(r => setTimeout(() => r(p[0]), 200)) })
    async aliasLatest(_n: number, @fetchSettled settled?: PromiseSettledResult<any>) { return settled?.status === 'fulfilled' ? settled.value : settled?.status; }

    @fetchBefore({ url: 'http://127.0.0.1:8101/api/post/1', request: 'GET' })
    async aliasBefore(@fetchSettled settled?: PromiseSettledResult<any>) { return settled?.status === 'fulfilled' ? settled.value.id : settled?.status; }

    @fetchAfter({ manual: (_s, _h, _p, _sig, rv) => `after:${rv}` })
    async aliasAfter() { return 'rv'; }

    localEcho(v: string) { return Promise.resolve(`echo:${v}`); }

    @event('#btn-aliases', 'click')
    async onAliasesClick() {
      const r: any = {};
      r.get = await this.aliasGet();
      r.post = (await this.aliasPost() as any)?.title;
      r.put = await this.aliasPut();
      r.patch = await this.aliasPatch();
      r.delete = await this.aliasDelete(9);
      r.manual = await this.aliasManual();
      const [l1, l2] = await Promise.all([this.aliasLatest(1), this.aliasLatest(2)]);
      r.latest = [l1 ?? 'undefined', l2];
      r.before = await this.aliasBefore();
      r.after = await this.aliasAfter();
      this.say('#out-aliases', `<pre id="aliases-json">${JSON.stringify(r)}</pre>`);
    }

    @event('#btn-fixes', 'click')
    async onFixesClick() {
      const r: any = {};
      r.filtered = await this.loadFiltered();
      const s404: any = await this.load404();
      r.status404 = s404.status === 'rejected' ? s404.reason?.response?.status : 'fulfilled?';
      r.headers = (await this.saveHeaders() as any).contentType;
      const blob: any = await this.saveBlob();
      r.blob = `${blob.contentType} / ${blob.body}`;
      r.manualAfter = (await this.saveManual() as any).body;
      this.say('#out-fixes', `<pre id="fixes-json">${JSON.stringify(r)}</pre>`);
    }

    private say(id: string, html: string) {
      this.querySelector(id)!.innerHTML = html;
    }

    // 콜라보 1: event(before→FormData) + fetch(after, process:form) + eventBeforeReturn
    @event('form.collab-a', 'submit', {
      before: (e: Event) => new FormData(e.target as HTMLFormElement),
      preventDefault: true
    })
    @fetch({
      url: 'http://127.0.0.1:8101/api/echo',
      trigger: 'after',
      process: 'form',
      after: (_c, _h, _p, settled) => {
        const page = document.querySelector('swc-example-fetch-test-page');
        const out = page?.querySelector('#out-collab-a');
        if (out && settled.status === 'fulfilled') {
          out.innerHTML =
            `<b>collab-a:</b> ${settled.value.contentType} / ${String(settled.value.body).slice(0, 90)}`;
        }
      }
    })
    async submitCollabA(@eventBeforeReturn formData: FormData) {
      return formData;
    }

    // 콜라보 2: 첫 파라미터 자동 event
    @event('form.collab-b', 'submit', { preventDefault: true })
    async submitCollabB(event: Event) {
      const fd = new FormData(event.target as HTMLFormElement);
      this.say('#out-collab-b', `<b>collab-b:</b> title=${fd.get('title')}`);
    }

    // 콜라보 2-1: @eventObject 명시
    @event('form.collab-c', 'submit', { preventDefault: true })
    async submitCollabC(@eventObject event: Event) {
      const fd = new FormData(event.target as HTMLFormElement);
      this.say('#out-collab-c', `<b>collab-c:</b> title=${fd.get('title')}`);
    }

    @event('#btn-before', 'click')
    async onBeforeClick() {
      this.say('#out-before', 'loading...');
      try {
        const settled = await (this as any).loadBefore();
        this.say('#out-before', settled.status === 'fulfilled'
          ? `<b>before:</b> ${settled.value.title ?? JSON.stringify(settled.value).slice(0, 80)}`
          : `<b>before 실패:</b> ${String(settled.reason)}`);
      } catch (e) {
        this.say('#out-before', `<b>에러:</b> ${e}`);
      }
    }

    @event('#btn-default', 'click')
    async onDefaultClick() {
      this.say('#out-default', 'loading...');
      try {
        const settled = await (this as any).loadDefault();
        this.say('#out-default', settled.status === 'fulfilled'
          ? `<b>default:</b> ${settled.value.title ?? JSON.stringify(settled.value).slice(0, 80)}`
          : `<b>default 실패:</b> ${String(settled.reason)}`);
      } catch (e) {
        this.say('#out-default', `<b>에러:</b> ${e}`);
      }
    }

    @event('#btn-hooks', 'click')
    async onHooksClick() {
      this.say('#out-hooks', 'loading...');
      try {
        const settled = await (this as any).loadHooks();
        const v = settled.status === 'fulfilled' ? settled.value : null;
        this.say('#out-hooks', `<b>hooks:</b> title=${v?.title} after=${(window as any).__fetchAfter} finally=${(window as any).__fetchFinally}`);
      } catch (e) {
        this.say('#out-hooks', `<b>에러:</b> ${e}`);
      }
    }
    @event('#btn-after', 'click')
    async onAfterClick() {
      this.say('#out-after', 'loading...');
      try {
        const res = await (this as any).saveAfter();
        this.say('#out-after', `<b>after:</b> id=${res.id} (POST 결과)`);
      } catch (e) {
        this.say('#out-after', `<b>에러:</b> ${e}`);
      }
    }

    @event('#btn-custom', 'click')
    async onCustomClick() {
      this.say('#out-custom', 'loading...');
      try {
        const settled = await (this as any).loadCustom();
        this.say('#out-custom', settled.status === 'fulfilled'
          ? `<b>custom:</b> ${settled.value.title} / via=${settled.value.via}`
          : `<b>custom 실패:</b> ${String(settled.reason)}`);
      } catch (e) {
        this.say('#out-custom', `<b>에러:</b> ${e}`);
      }
    }

    @event('#btn-form', 'click')
    async onFormClick() {
      this.say('#out-form', 'loading...');
      try {
        const res = await (this as any).saveForm();
        this.say('#out-form', `<b>form:</b> ${res.contentType} / ${res.body.slice(0, 80)}`);
      } catch (e) {
        this.say('#out-form', `<b>에러:</b> ${e}`);
      }
    }

    @event('#btn-urlencoded', 'click')
    async onUrlencodedClick() {
      this.say('#out-urlencoded', 'loading...');
      try {
        const res = await (this as any).saveUrlencoded();
        this.say('#out-urlencoded', `<b>urlencoded:</b> ${res.contentType} / ${res.body.slice(0, 80)}`);
      } catch (e) {
        this.say('#out-urlencoded', `<b>에러:</b> ${e}`);
      }
    }

    @onConnectedBodyLight
    render() {
      return `
        <style>
          .wrap { max-width: 720px; margin: 0 auto; padding: 24px 16px 48px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          .sub { color: #6b7280; font-size: 13px; margin: 0 0 16px; }
          button { font-size: 14px; font-weight: 700; color: #fff; background: #111827; border: 0; border-radius: 10px; padding: 10px 20px; cursor: pointer; margin: 0 8px 16px 0; }
          #btn-after { background: #0369a1; }
          .out { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; font-size: 14px; margin-bottom: 12px; min-height: 48px; background: #fff; }
        </style>
        <div class="wrap">
          <h1>fetch test</h1>
          <p class="sub">before = GET 후 settled 주입받아 실행 / after = 리턴을 body로 POST / default = 옵션 없이</p>
          <button id="btn-before">before fetch</button>
          <button id="btn-after">after fetch</button>
          <button id="btn-custom">custom fetching</button>
          <button id="btn-form">form</button>
          <button id="btn-urlencoded">urlencoded</button>
          <button id="btn-default">default</button>
          <button id="btn-hooks">hooks</button>
          <button id="btn-fixes">fixes</button>
          <button id="btn-abort">abort</button>
          <button id="btn-aliases">aliases</button>
          <div class="out" id="out-before">-</div>
          <div class="out" id="out-after">-</div>
          <div class="out" id="out-custom">-</div>
          <div class="out" id="out-form">-</div>
          <div class="out" id="out-urlencoded">-</div>
          <div class="out" id="out-default">-</div>
          <div class="out" id="out-hooks">-</div>
          <div class="out" id="out-fixes">-</div>
          <div class="out" id="out-abort">-</div>
          <div class="out" id="out-aliases">-</div>
          <h1>collab test</h1>
          <p class="sub">event(before→FormData) + fetch(after, form) / 첫파라미터 event / @eventObject</p>
          <form class="collab-a">
            <input name="title" value="collab-title" />
            <input name="userId" value="7" />
            <button type="submit">collab-a submit</button>
          </form>
          <div class="out" id="out-collab-a">-</div>
          <form class="collab-b">
            <input name="title" value="auto-event" />
            <button type="submit">collab-b submit</button>
          </form>
          <div class="out" id="out-collab-b">-</div>
          <form class="collab-c">
            <input name="title" value="explicit-event" />
            <button type="submit">collab-c submit</button>
          </form>
          <div class="out" id="out-collab-c">-</div>
        </div>`;
    }
  }

  return tagName;
};
