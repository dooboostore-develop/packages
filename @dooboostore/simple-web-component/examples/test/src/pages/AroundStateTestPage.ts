import { elementDefine, onConnectedBodyShadow, onConnectedAfter, applyNode, addEventListener, around, state, HelperHostSet } from '@dooboostore/simple-web-component';

/**
 * @around / @state 테스트 페이지 (자가검증 — connect되면 자동 실행, 버튼으로 재실행)
 *
 * 확인 포인트:
 * 1. @around 메서드: before(인자 가공) + after(리턴 가공) + HelperHostSet 전달
 * 2. @around async 메서드: resolve값에 after 적용
 * 3. @around 프로퍼티(필드 이니셜라이저 있음): ensureInit이 초기값을 살려 setter 경유로 정리
 * 4. @state 인스턴스 격리: 같은 자식 2개의 count가 서로 오염 안 됨 (구 클로저 공유 버그 회귀 방지)
 */
export default (w: Window) => {
  const childTag = 'swc-example-state-child';
  if (!w.customElements.get(childTag)) {
    @elementDefine(childTag, { window: w })
    class StateChild extends w.HTMLElement {
      @state count: number = 0;

      @addEventListener('.btn-inc', 'click')
      onInc() {
        this.count = (this.count ?? 0) + 1;
        this.renderCount();
      }

      @applyNode('.count-val', { position: 'innerHtml' })
      renderCount() {
        return `${this.count}`;
      }

      @onConnectedBodyShadow
      render() {
        return `
          <div class="child">
            <span>count: <b class="count-val">0</b></span>
            <button class="btn-inc">+1</button>
          </div>
        `;
      }
    }
  }

  const tagName = 'swc-example-around-state-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class AroundStateTestPage extends w.HTMLElement {
    // 1. sync 메서드 — before에서 인자 배열 가공, after에서 리턴 가공
    @around({
      before: (h: HelperHostSet, args: [number, string]) => {
        (h.$this as any).__lastHhsOk = !!(h && h.$this);
        return [args[0], args[1].toUpperCase()];
      },
      after: (h: HelperHostSet, r: string) => `${r}!`
    })
    greet(a: number, b: string) {
      return `${a}:${b}`;
    }

    // 2. async 메서드 — resolve된 값에 after 적용
    @around({
      after: (h: HelperHostSet, r: string) => `${r}?`
    })
    async fetchIt(x: string) {
      return `got:${x}`;
    }

    // 2-1. async before + async 메서드 — before의 Promise가 풀린 인자로 원본 호출
    @around({
      before: async (h: HelperHostSet, args: [string]) => {
        await new Promise(r => setTimeout(r, 10));
        return [args[0].toUpperCase()];
      },
      after: async (h: HelperHostSet, r: string) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return `${r}~`;
      }
    })
    async shout(text: string) {
      return `said:${text}`;
    }

    // 2-2. async before + sync 메서드 — 래퍼는 Promise 반환, 풀린 값이 최종값
    @around({
      before: async (h: HelperHostSet, args: [number]) => [args[0] * 2]
    })
    doubleSync(n: number) {
      return n + 1;
    }

    // 2-3. after가 Promise 리턴 — resolve된 값이 최종값 (아래 버튼으로 수동 확인)
    @around({
      before: (h: HelperHostSet, args: [string]) => [args[0].trim()],
      after: async (h: HelperHostSet, r: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return `${r} ✓`;
      }
    })
    async slowEcho(text: string) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return `echo:${text}`;
    }

    @addEventListener('.btn-promise', 'click')
    async onPromiseClick() {
      this.renderPromise('⏳ pending... (after의 Promise 대기 중)');
      try {
        const v = await this.slowEcho('  hello ');
        this.renderPromise(`✅ resolved: ${v}`);
      } catch (e: any) {
        this.renderPromise(`❌ rejected: ${e?.message}`);
      }
    }

    @applyNode('.promise-out', { position: 'innerHtml' })
    renderPromise(msg: string) {
      return msg;
    }

    // 2-4. before가 Promise 리턴 — 풀린 인자로 원본 호출 (아래 버튼으로 수동 확인)
    @around({
      before: async (h: HelperHostSet, args: [number]) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [args[0] * 10];
      },
      after: (h: HelperHostSet, r: number) => r + 1
    })
    calc(n: number) {
      return n;
    }

    @addEventListener('.btn-async-before', 'click')
    async onAsyncBeforeClick() {
      this.renderAsyncBefore('⏳ pending... (before의 Promise 대기 중)');
      try {
        const v = await this.calc(5);
        this.renderAsyncBefore(`✅ resolved: ${v} (5 → ×10 → +1)`);
      } catch (e: any) {
        this.renderAsyncBefore(`❌ rejected: ${e?.message}`);
      }
    }

    @applyNode('.async-before-out', { position: 'innerHtml' })
    renderAsyncBefore(msg: string) {
      return msg;
    }

    // 3. 프로퍼티 + 필드 이니셜라이저 — ensureInit이 초기값 살려 setter 경유로 정리
    @around({
      get: (h: HelperHostSet, stored: string) => stored?.toUpperCase(),
      set: (h: HelperHostSet, incoming: string) => incoming?.trim()
    })
    nickname: string = '  bob ';

    results: string[] = [];

    @onConnectedAfter
    onReady() {
      this.runChecks();
    }

    @addEventListener('.btn-run', 'click')
    async onRunClick() {
      await this.runChecks();
    }

    async runChecks() {
      const out: string[] = [];
      const eq = (name: string, actual: any, expected: any) =>
        out.push(`${actual === expected ? '✅' : '❌'} ${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
      try {
        (this as any).__lastHhsOk = false;
        eq('@around sync', this.greet(1, 'ab'), '1:AB!');
        eq('HelperHostSet.$this 전달', (this as any).__lastHhsOk, true);
        eq('@around async', await this.fetchIt('x'), 'got:x?');
        eq('@around async-before/after', await this.shout('hey'), 'said:HEY~');
        eq('@around async-before+sync', await this.doubleSync(21), 43);
      } catch (e: any) {
        out.push(`❌ @around threw: ${e?.message}`);
      }
      try {
        eq('@around property (초기값)', this.nickname, 'BOB');
        this.nickname = '  alice  ';
        eq('@around property (set)', this.nickname, 'ALICE');
      } catch (e: any) {
        out.push(`❌ @around property threw: ${e?.message}`);
      }
      try {
        const kids = Array.from(this.shadowRoot?.querySelectorAll('swc-example-state-child') ?? []) as any[];
        if (kids.length < 2) {
          out.push(`❌ state child가 2개 필요: got ${kids.length}`);
        } else {
          kids[0].count = 10;
          kids[1].count = 20;
          kids[0].renderCount();
          kids[1].renderCount();
          eq('@state 격리 #1', kids[0].count, 10);
          eq('@state 격리 #2', kids[1].count, 20);
        }
      } catch (e: any) {
        out.push(`❌ @state threw: ${e?.message}`);
      }
      this.results = out;
      this.renderResults();
    }

    @applyNode('.results', { position: 'innerHtml' })
    renderResults() {
      return this.results.map(r => `<div>${r}</div>`).join('') || '대기 중...';
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host { display: block; padding: 24px; }
          .box { max-width: 600px; margin: 0 auto; padding: 20px; border: 2px dashed #8b5cf6; border-radius: 12px; background: #faf8ff; }
          h2 { margin-top: 0; }
          .results { margin-top: 16px; font-size: 14px; line-height: 1.8; padding: 12px 16px; background: #fff; border-radius: 8px; }
          .hint { margin-top: 16px; font-size: 12px; color: #888; line-height: 1.6; }
          .child-row { display: flex; gap: 12px; margin-top: 12px; }
          .child-row > * { flex: 1; padding: 10px; background: #fff; border: 1px solid #ddd6fe; border-radius: 8px; }
          .btn-run { padding: 8px 16px; background: #8b5cf6; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; margin-top: 12px; }
          .btn-run:hover { background: #7c3aed; }
        </style>
        <div class="box">
          <h2>🌀 @around / @state Test</h2>
          <p class="hint">connect되면 자동 실행됨. 버튼으로 재실행 가능. 자식 +1 버튼을 눌러도 서로 오염 안 되는지 확인.</p>
          <button class="btn-run">다시 실행</button>
          <div class="results">대기 중...</div>
          <h3>⏳ Promise 리턴 (after가 Promise) — 버튼으로 수동 확인</h3>
          <p class="hint" style="margin-top:6px;">after가 0.5초 뒤에 resolve됨. pending → resolved 순서로 바뀌어야 정상.</p>
          <button class="btn-run btn-promise">slowEcho 실행</button>
          <div class="results promise-out">대기 중...</div>
          <h3>⏳ async before (before가 Promise) — 버튼으로 수동 확인</h3>
          <p class="hint" style="margin-top:6px;">before가 0.5초 뒤에 인자 resolve. 5 → ×10 → +1 = 51 나와야 정상.</p>
          <button class="btn-run btn-async-before">calc 실행</button>
          <div class="results async-before-out">대기 중...</div>
          <h3>@state 격리 확인용 자식 2개</h3>          <div class="child-row">
            <swc-example-state-child></swc-example-state-child>
            <swc-example-state-child></swc-example-state-child>
          </div>
        </div>
      `;
    }
  }

  return tagName;
};
