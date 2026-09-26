import { elementDefine, onConnectedBodyShadow, eventDelegateShadow, eventObject, eventBeforeReturn, eventMediaChange, eventMediaBeforeReturn } from '@dooboostore/simple-web-component';

/**
 * 새로 추가한 3가지를 실제 브라우저에서 검증하는 페이지:
 *
 * 1) async filter — filter가 Promise<boolean>을 리턴해도 await되어 게이팅된다.
 *    "짝수번째 클릭만 통과" 필터를 100ms 지연 비동기로 걸어, 홀수 클릭은 핸들러가 안 도는지 확인.
 *
 * 2) before 훅 — filter 통과 후 핸들러 호출 "직전"에 실행되며 await된다.
 *    로그 순서가 before → (await 후) before-awaited → handler 로 찍히면 성공.
 *
 * 3) @eventBeforeReturn — 같은 핸들러의 "직전 호출 리턴값"을 누산 주입한다.
 *    핸들러가 async로 prev+1을 리턴하면, 다음 클릭의 prev로 "resolve된 숫자"가 들어와야 한다.
 */
export default (w: Window) => {
  const tagName = 'swc-example-before-filter-return-test-page';
  if (w.customElements.get(tagName)) return tagName;

  const delay = (ms: number) => new Promise<void>(r => w.setTimeout(r, ms));

  @elementDefine(tagName, { window: w })
  class BeforeFilterReturnTestPage extends w.HTMLElement {
    // 1) async filter
    filterAttempts = 0;
    filterPassed = 0;
    // 2) before 훅 순서 로그
    log: string[] = [];
    // 3) @eventBeforeReturn = before 훅의 리턴값 주입
    beforeCounter = 0;
    accumText = '(아직 클릭 안 함)';

    // ── 1) async filter: 100ms 지연 후 짝수번째 시도만 통과 ──────────────────
    @eventDelegateShadow('.filter-btn', 'click', {
      filter: async (_e, { currentThis }) => {
        const self = currentThis as BeforeFilterReturnTestPage;
        const attempt = self.filterAttempts++;
        self.paint();                // 시도 즉시 카운트 표시(핸들러 전)
        await delay(100);            // 비동기 판정
        return attempt % 2 === 0;    // 짝수 시도만 통과 → 홀수는 핸들러 스킵
      }
    })
    onFilterBtn() {
      this.filterPassed++;           // 통과했을 때만 증가
      this.paint();
    }

    // ── 2) before 훅: 핸들러 직전 실행 + await 순서 증명 ─────────────────────
    @eventDelegateShadow('.before-btn', 'click', {
      before: async (_e, { currentThis }) => {
        const self = currentThis as BeforeFilterReturnTestPage;
        self.log.push('before');
        self.paint();
        await delay(50);
        self.log.push('before-awaited');
        self.paint();
      }
    })
    onBeforeBtn(@eventObject _e: Event) {
      this.log.push('handler');
      if (this.log.length > 9) this.log = this.log.slice(-9);
      this.paint();
    }

    // ── 3) @eventBeforeReturn: before 훅이 리턴한 값이 핸들러에 주입 ──
    @eventDelegateShadow('.accum-btn', 'click', {
      // before가 async로 값을 준비해 리턴 → @eventBeforeReturn 으로 들어옴
      before: async (_e, { currentThis }) => {
        const self = currentThis as BeforeFilterReturnTestPage;
        await delay(30);
        return `prepared#${++self.beforeCounter}`;
      }
    })
    onAccum(@eventBeforeReturn fromBefore: string) {
      this.accumText = `@eventBeforeReturn = before가 리턴한 값: "${fromBefore}"`;
      this.paint();
    }

    // ── 4) finally + before args: 성공/throw 모두에서 finally 실행 + ctx 확인 ──
    finLog: string[] = [];

    @eventDelegateShadow('.fin-ok-btn', 'click', {
      before: (_e, { currentThis }, args) => { (currentThis as BeforeFilterReturnTestPage).finLog = [`before:args${args.length}`]; },
      // async finally — await 후 로그. Promise 리턴도 await되는지 확인.
      finally: async (_e, { currentThis }, ctx) => {
        const s = currentThis as BeforeFilterReturnTestPage;
        s.finLog.push('finally-start');
        await delay(40);
        s.finLog.push(`finally-end:args${ctx.args.length}:result=${ctx.result}:err=${!!ctx.error}`);
        s.paint();
      }
    })
    onFinOk(@eventObject _e: Event) {
      this.finLog.push('handler');
      this.paint();
      return 'RET';
    }

    @eventDelegateShadow('.fin-throw-btn', 'click', {
      // async finally + throw 경로 — await 후에도 error 전달되는지.
      finally: async (_e, { currentThis }, ctx) => {
        const s = currentThis as BeforeFilterReturnTestPage;
        s.finLog = ['finally(throw)-start'];
        await delay(40);
        s.finLog.push(`finally(throw)-end:err=${!!ctx.error}:msg=${ctx.error?.message}`);
        s.paint();
      }
    })
    onFinThrow() {
      throw new Error('boom');
    }

    // ── 5) eventMedia: 미디어쿼리 변화에도 filter/before/finally/@eventMediaBeforeReturn 동작 ──
    @eventMediaChange('(max-width: 700px)', {
      filter: async (_e, { currentThis }) => { (currentThis as any).__mediaLog = ['filter']; return true; },
      before: async (_e, { currentThis }) => { (currentThis as any).__mediaLog.push('before'); return 'MPREP'; },
      finally: async (_e, { currentThis }, ctx) => {
        const s = currentThis as BeforeFilterReturnTestPage;
        (s as any).__mediaLog.push(`finally:args${ctx.args.length}:err${!!ctx.error}`);
        s.mediaText = (s as any).__mediaLog.join(' → ');
        s.paint();
      }
    })
    onMedia(@eventObject e: MediaQueryListEvent, @eventMediaBeforeReturn prep: string) {
      (this as any).__mediaLog.push(`handler:${prep}:matches=${e.matches}`);
    }

    mediaText = '(리사이즈로 트리거)';

    paint() {
      const set = (sel: string, text: string) => {
        const el = this.shadowRoot?.querySelector(sel) as HTMLElement | null;
        if (el) el.textContent = text;
      };
      set('.filter-status', `async filter — 시도: ${this.filterAttempts}, 통과(핸들러 실행): ${this.filterPassed}  (홀수 시도는 통과 안 되어 차이가 벌어져야 정상)`);
      set('.before-status', `before 훅 로그(최근): [ ${this.log.join(' → ')} ]`);
      set('.accum-status', this.accumText);
      set('.fin-status', `finally 로그: [ ${this.finLog.join(' → ')} ]`);
      set('.media-status', `eventMedia 로그: [ ${this.mediaText} ]`);
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host { display: block; padding: 16px; font-family: system-ui, sans-serif; }
          section { margin: 16px 0; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
          h3 { margin: 0 0 8px; font-size: 15px; }
          button { margin: 4px 0; padding: 6px 12px; cursor: pointer; }
          pre { margin: 8px 0 0; padding: 8px; background: #f5f5f5; border-radius: 4px; white-space: pre-wrap; }
        </style>
        <h2>before / async filter / @eventBeforeReturn 테스트</h2>

        <section>
          <h3>1) async filter (Promise&lt;boolean&gt;)</h3>
          <button class="filter-btn">클릭 (짝수 시도만 통과, 100ms 비동기)</button>
          <pre class="filter-status">아직 클릭 안 함</pre>
        </section>

        <section>
          <h3>2) before 훅 (핸들러 직전, await 순서)</h3>
          <button class="before-btn">클릭 → 로그: before → before-awaited → handler</button>
          <pre class="before-status">아직 클릭 안 함</pre>
        </section>

        <section>
          <h3>3) @eventBeforeReturn (before 훅의 리턴값 주입)</h3>
          <button class="accum-btn">클릭 (before가 준비한 값이 핸들러로)</button>
          <pre class="accum-status">아직 클릭 안 함</pre>
        </section>

        <section>
          <h3>4) finally + before args</h3>
          <button class="fin-ok-btn">성공 (before args → handler → finally)</button>
          <button class="fin-throw-btn">throw (finally에 error 전달)</button>
          <pre class="fin-status">아직 클릭 안 함</pre>
        </section>

        <section>
          <h3>5) eventMedia (뷰포트 700px 경계로 트리거)</h3>
          <pre class="media-status">(리사이즈로 트리거)</pre>
        </section>
      `;
    }
  }

  return tagName;
};
