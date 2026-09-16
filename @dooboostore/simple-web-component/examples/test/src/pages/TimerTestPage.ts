import { elementDefine, onConnectedBodyShadow, applyNode, setInterval, setTimeout, HelperHostSet } from '@dooboostore/simple-web-component';

/**
 * appendCount 두 개는 @setInterval을 다른 wrapping 데코레이터(@applyNode)와
 * 서로 반대 순서로 스택해서, 데코레이터 선언 순서에 상관없이 둘 다 정상 동작하는지 확인한다.
 */

/**
 * @setInterval / @setTimeout 데코레이터 테스트 페이지
 *
 * 확인 포인트:
 * 1. 옵션 없이 사용하면 connect 시 자동으로 시작되고, 인자 없이 호출되는지
 * 2. parameter 콜백으로 넘긴 인자가 메서드에 그대로 전달되는지
 * 3. created 콜백이 등록 직후 1회, timer id와 함께 호출되는지
 * 4. disconnect(다른 페이지로 이동) 시 콘솔에 더 이상 로그가 안 찍히는지 (자동 정리 확인)
 */
export default (w: Window) => {
  const tagName = 'swc-example-timer-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class TimerTestPage extends w.HTMLElement {
    intervalTickCount = 0;
    intervalWithParamCount = 0;
    timeoutFired = false;
    timeoutWithParamFired = false;

    // 1. 옵션 없이 - connect 시 자동 시작, 인자 없이 1초마다 호출
    @setInterval(1000)
    onTick() {
      this.intervalTickCount++;
      console.log('[setInterval no-option] tick', this.intervalTickCount);
      this.renderStatus();
    }

    // 2. parameter + created 옵션 - 1.5초마다, 인자 2개 전달
    @setInterval(1500, {
      parameter: (set: HelperHostSet) => [Date.now(), 'hello'],
      created: (set: HelperHostSet, id: number) => console.log('[setInterval created] timer id:', id)
    })
    onTickWithParam(timestamp: number, name: string) {
      this.intervalWithParamCount++;
      console.log('[setInterval with-param] tick', this.intervalWithParamCount, '| timestamp:', timestamp, '| name:', name);
      this.renderStatus();
    }

    // 3. 옵션 없이 - connect 3초 뒤 1회만 실행
    @setTimeout(3000)
    onFire() {
      this.timeoutFired = true;
      console.log('[setTimeout no-option] fired once');
      this.renderStatus();
    }

    // 4. parameter + created 옵션 - connect 2초 뒤 1회, 인자 1개 전달
    @setTimeout(2000, {
      parameter: (set: HelperHostSet) => [42],
      created: (set: HelperHostSet, id: number) => console.log('[setTimeout created] timer id:', id)
    })
    onFireWithParam(answer: number) {
      this.timeoutWithParamFired = true;
      console.log('[setTimeout with-param] fired once | answer:', answer);
      this.renderStatus();
    }

    // 5. valueKey 옵션 - 리턴값이 객체이고 그 키가 함수면 매 tick마다 (id: number)로 호출
    valueKeyCallbackCount = 0;
    valueKeyLastId: number | null = null;

    @setInterval(900, { valueKey: 'onTick' })
    onValueKeyTick() {
      return {
        onTick: (id: number) => {
          this.valueKeyCallbackCount++;
          this.valueKeyLastId = id;
          console.log('[setInterval valueKey] callback fired | id:', id, '| count:', this.valueKeyCallbackCount);
          this.renderStatus();
        }
      };
    }

    // ─── 스택 순서 테스트: @setInterval + @applyNode(appendChild) ───
    appendCountA = 0;
    appendCountB = 0;

    // 순서 A: @setInterval이 위, @applyNode가 아래
    @setInterval(1200)
    @applyNode('.append-log-a', { position: 'beforeEnd' })
    onTickAppendA() {
      this.appendCountA++;
      const div = document.createElement('div');
      div.className = 'append-item';
      div.textContent = `A #${this.appendCountA} @ ${new Date().toLocaleTimeString()}`;
      return div;
    }

    // 순서 B: @applyNode가 위, @setInterval이 아래 (반대 순서)
    @applyNode('.append-log-b', { position: 'beforeEnd' })
    @setInterval(1300)
    onTickAppendB() {
      this.appendCountB++;
      const div = document.createElement('div');
      div.className = 'append-item';
      div.textContent = `B #${this.appendCountB} @ ${new Date().toLocaleTimeString()}`;
      return div;
    }

    @applyNode('.status', { position: 'innerHtml' })
    renderStatus() {
      return `
        <div>interval (no option) tick count: <b>${this.intervalTickCount}</b></div>
        <div>interval (with param) tick count: <b>${this.intervalWithParamCount}</b></div>
        <div>timeout (no option) fired: <b>${this.timeoutFired}</b></div>
        <div>timeout (with param) fired: <b>${this.timeoutWithParamFired}</b></div>
        <div>valueKey callback count: <b>${this.valueKeyCallbackCount}</b> (last timer id: <b>${this.valueKeyLastId}</b>)</div>
      `;
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host { display: block; padding: 24px; }
          .box { max-width: 600px; margin: 0 auto; padding: 20px; border: 2px dashed #667eea; border-radius: 12px; background: #f8f9ff; }
          h2 { margin-top: 0; }
          .status { margin-top: 16px; font-size: 14px; line-height: 1.8; padding: 12px 16px; background: #fff; border-radius: 8px; }
          .hint { margin-top: 16px; font-size: 12px; color: #888; line-height: 1.6; }
          .stack-test-section { margin-top: 24px; padding: 16px 20px; border: 2px dashed #f59e0b; border-radius: 12px; background: #fffbeb; }
          .stack-cols { display: flex; gap: 16px; margin-top: 12px; }
          .stack-col { flex: 1; min-width: 0; }
          .stack-col h4 { margin: 0 0 6px 0; font-size: 13px; }
          .append-log-a, .append-log-b {
            max-height: 140px;
            overflow-y: auto;
            background: #fff;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 12px;
          }
          .append-item { padding: 2px 0; border-bottom: 1px dashed #f3f4f6; }
        </style>
        <div class="box">
          <h2>⏱️ @setInterval / @setTimeout Test</h2>
          <p>콘솔을 열어서 로그를 확인하세요.</p>
          <div class="status">대기 중...</div>
          <p class="hint">
            헤더의 <b>Home</b> 링크를 눌러 이 페이지를 벗어나면(disconnect) 타이머가 자동으로 정리됩니다 —
            벗어난 뒤 콘솔에 더 이상 로그가 안 찍히는지 확인하세요.
          </p>

          <div class="stack-test-section">
            <h3>🧩 데코레이터 스택 순서 테스트 (@setInterval + @applyNode appendChild)</h3>
            <p class="hint" style="margin-top:6px;">wrapping을 하지 않는 설계라 @setInterval/@applyNode 순서를 바꿔도 둘 다 동일하게 매 tick마다 항목이 추가되어야 함.</p>
            <div class="stack-cols">
              <div class="stack-col">
                <h4>A: @setInterval 위 / @applyNode 아래</h4>
                <div class="append-log-a"></div>
              </div>
              <div class="stack-col">
                <h4>B: @applyNode 위 / @setInterval 아래 (반대 순서)</h4>
                <div class="append-log-b"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  return tagName;
};
