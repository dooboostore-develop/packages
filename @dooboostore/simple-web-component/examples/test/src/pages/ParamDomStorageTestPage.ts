import {
  elementDefine, onConnectedAfter, onConnectedBodyShadow, addEventListener,
  querySelectorParam, querySelectorAllParam, attributeParam, localStorageParam, sessionStorageParam, cookieParam, fetchParam,
  localStorage, sessionStorage, cookie, persistRead
} from '@dooboostore/simple-web-component';

// FetchTestPage.ts와 같은 더미 서버 재사용 (examples/test/dummy-server.py, 127.0.0.1:8101)
const DUMMY_POST_URL = 'http://127.0.0.1:8101/api/post/1';
const DUMMY_MISSING_URL = 'http://127.0.0.1:8101/api/missing';
const DUMMY_ECHO_URL = 'http://127.0.0.1:8101/api/echo';

/**
 * parameter.ts에 새로 추가한 DOM/스토리지 파라미터 데코레이터 수동 검증 페이지.
 *
 * 확인 포인트:
 * - @querySelectorParam('#target')   — query.ts의 resolveQueryElements/pickElements 재사용, shadow DOM 요소 주입
 *   (URL의 query parameter와 헷갈리지 않게 "query"가 아니라 "querySelector"로 명명)
 * - @querySelectorAllParam + root:'light'/'shadow'/'all' — @query/@queryAll과 동일한 탐색 범위 옵션 지원
 * - @attributeParam('data-greeting') — 기본은 호스트 자신의 attribute, options.selector로 다른 요소도 지정 가능
 * - @localStorageParam/@sessionStorageParam/@cookieParam — persistState.ts의 persistRead 재사용, 스토리지 값 주입
 * - @onConnectedAfter(자동 트리거)와 @addEventListener(다른 트리거) 양쪽에서 동일한 kind가 똑같이 동작하는가
 * - persistParam 제거 후에도 @localStorage/@sessionStorage/@cookie 필드 데코레이터와 persistRead 직접 호출은 그대로 동작하는가
 */
export default (w: Window) => {
  const tagName = 'swc-example-param-dom-storage-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class ParamDomStorageTestPage extends w.HTMLElement {
    // 스토리지 파라미터용 시드값 — 필드 데코레이터(기존 기능, persistParam 제거 이후에도 멀쩡한지 겸사겸사 확인)
    @localStorage('pdst-ls-key') lsSeed: string = 'local-seed';
    @sessionStorage('pdst-ss-key') ssSeed: string = 'session-seed';
    @cookie('pdst-ck-key') ckSeed: string = 'cookie-seed';

    @onConnectedAfter
    async onReady(
      @querySelectorParam('#target') target: HTMLElement,
      @querySelectorAllParam('.item', { root: 'all' }) allItems: HTMLElement[],
      @attributeParam('data-greeting') greeting: string,
      @attributeParam('#target', 'data-x', { root: 'shadow' }) childAttr: string,
      @localStorageParam('pdst-ls-key') ls: string,
      @sessionStorageParam('pdst-ss-key') ss: string,
      @cookieParam('pdst-ck-key') ck: string,
      @fetchParam(DUMMY_POST_URL) postPromise: Promise<any>
    ) {
      const post = await postPromise;
      this.report('onConnectedAfter', {
        queryOk: target?.id === 'target',
        allItemsIds: allItems?.map(e => e.id).sort(),
        greeting, childAttr, ls, ss, ck, post
      });
    }

    @addEventListener('#fetch-btn', 'click')
    async onFetchClick(@fetchParam(DUMMY_POST_URL) p: Promise<any>) {
      const data = await p;
      this.report('addEventListener(@fetchParam)', { data });
    }

    @addEventListener('#fetch-fail-btn', 'click')
    async onFetchFailClick(@fetchParam(DUMMY_MISSING_URL) p: Promise<any>) {
      try {
        await p;
      } catch (e: any) {
        this.report('addEventListener(@fetchParam, 404 예상)', { error: e.message });
      }
    }

    // url/init 자리에 콜백을 줘서 인스턴스 필드(this.bumpCount)로 body를 동적으로 만드는 예 —
    // 클릭할 때마다 바뀌는 bumpCount가 실제로 서버까지 전달되는지 /api/echo로 확인.
    @addEventListener('#fetch-callback-btn', 'click')
    async onFetchCallbackClick(
      @fetchParam(
        () => DUMMY_ECHO_URL,
        (self: any) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bumpCount: self.bumpCount }) })
      ) p: Promise<any>
    ) {
      const data = await p;
      this.report('addEventListener(@fetchParam 콜백, self.bumpCount 참조)', { data });
    }

    // 다른 트리거(addEventListener)에서도 같은 kind가 동작하는지 확인 — 클릭할 때마다 세션값을 바꾼 뒤 재조회
    bumpCount = 0;

    @addEventListener('#bump-btn', 'click')
    onBumpClick(
      @querySelectorParam('#target') target: HTMLElement,
      @attributeParam('data-greeting') greeting: string,
      @sessionStorageParam('pdst-ss-key') ss: string
    ) {
      this.bumpCount++;
      this.ssSeed = `bumped-${this.bumpCount}`; // 다음 클릭에서 ss 값이 바뀌어 보이도록
      this.report('addEventListener', { queryOk: target?.id === 'target', greeting, ss });
    }

    @addEventListener('#direct-read-btn', 'click')
    onDirectReadClick() {
      const direct = persistRead(this, 'pdst-ss-key', { storage: 'session' });
      this.report('persistRead(직접 호출)', { direct });
    }

    // persistState 필드에 undefined를 대입하면 persistWrite가 자동으로 persistRemove를 태워서
    // 실제로 스토리지에서 키가 지워지는지 — localStorage 글로벌 이름은 데코레이터가 가리고 있어서
    // persistRead로 직접 확인한다.
    @addEventListener('#remove-undefined-btn', 'click')
    onRemoveUndefinedClick() {
      this.lsSeed = 'before-remove'; // 지우기 전 값이 실제로 있었다는 걸 먼저 보여줌
      const before = persistRead(this, 'pdst-ls-key', { storage: 'local' });
      (this as any).lsSeed = undefined; // ← 이게 실제로 localStorage에서 키를 지우는지가 핵심
      const after = persistRead(this, 'pdst-ls-key', { storage: 'local' });
      this.report('undefined 대입 → 삭제 테스트', { before, afterSettingUndefined: after, 'this.lsSeed': this.lsSeed });
    }

    private report(label: string, data: Record<string, any>) {
      const el = this.shadowRoot?.querySelector('.status') as HTMLElement | null;
      if (!el) return;
      const line = `[${label}] ` + Object.entries(data).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ');
      el.textContent = (el.textContent === 'pending...' ? '' : el.textContent + '\n') + line;
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host { display:block; padding:20px; font-family:sans-serif; }
          #target { padding:12px; background:#eef2ff; border:1px solid #c7d2fe; border-radius:8px; width:fit-content; }
          button { margin:10px 8px 0 0; padding:8px 14px; border:none; border-radius:8px; background:#4f46e5; color:#fff; cursor:pointer; }
          button:hover { background:#4338ca; }
          .status { margin-top:16px; padding:12px; background:#111827; color:#d1fae5; border-radius:8px; white-space:pre-wrap; font-size:13px; }
        </style>
        <h2>Param DOM/Storage Test</h2>
        <p id="target" data-x="shadow-child">#target 요소 (@querySelectorParam이 찾아야 할 엘리먼트, data-x="shadow-child")</p>
        <p class="item" id="shadow-item">shadow .item</p>
        <button id="bump-btn">세션값 확인 (@addEventListener + @querySelectorParam/@attributeParam/@sessionStorageParam)</button>
        <button id="direct-read-btn">persistRead 직접 호출</button>
        <button id="fetch-btn">@fetchParam 호출 (더미서버 /api/post/1)</button>
        <button id="fetch-fail-btn">@fetchParam 404 테스트 (/api/missing)</button>
        <button id="fetch-callback-btn">@fetchParam 콜백 테스트 (self.bumpCount → body)</button>
        <button id="remove-undefined-btn">undefined 대입 → 삭제 테스트 (lsSeed)</button>
        <pre class="status">pending...</pre>
      `;
    }
  }

  return tagName;
};
