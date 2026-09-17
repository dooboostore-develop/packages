import { elementDefine, onConnectedBodyShadow, applyNode, addEventListener, setInterval, setTimeout, requestAnimationFrame, SET_INTERVAL_METADATA_KEY, mutationObserverThis, propWindow, eventMediaChange, HelperHostSet } from '@dooboostore/simple-web-component';

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

    // 1. type:'onConnected' - connect 시 자동 시작, 인자 없이 1초마다 호출
    @setInterval(1000, { type: 'onConnected' })
    onTick() {
      this.intervalTickCount++;
      console.log('[setInterval onConnected] tick', this.intervalTickCount);
      this.renderStatus();
    }

    // 2. type:'onConnected' + parameter + created - 1.5초마다, 인자 2개 전달
    @setInterval(1500, {
      type: 'onConnected',
      parameter: (set: HelperHostSet) => [Date.now(), 'hello'],
      created: (set: HelperHostSet, id: number) => console.log('[setInterval created] timer id:', id)
    })
    onTickWithParam(timestamp: number, name: string) {
      this.intervalWithParamCount++;
      console.log('[setInterval with-param] tick', this.intervalWithParamCount, '| timestamp:', timestamp, '| name:', name);
      this.renderStatus();
    }

    // 3. type:'onConnected' - connect 3초 뒤 1회만 실행
    @setTimeout(3000, { type: 'onConnected' })
    onFire() {
      this.timeoutFired = true;
      console.log('[setTimeout onConnected] fired once');
      this.renderStatus();
    }

    // 4. type:'onConnected' + parameter + created - connect 2초 뒤 1회, 인자 1개 전달
    @setTimeout(2000, {
      type: 'onConnected',
      parameter: (set: HelperHostSet) => [42],
      created: (set: HelperHostSet, id: number) => console.log('[setTimeout created] timer id:', id)
    })
    onFireWithParam(answer: number) {
      this.timeoutWithParamFired = true;
      console.log('[setTimeout with-param] fired once | answer:', answer);
      this.renderStatus();
    }

    // 5. type:'onConnected' + valueKey - 리턴값이 객체이고 그 키가 함수면 매 tick마다 (id: number)로 호출
    valueKeyCallbackCount = 0;
    valueKeyLastId: number | null = null;

    @setInterval(900, { type: 'onConnected', valueKey: 'onTick' })
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

    // 6. type:'returnValue'(기본값) - 자동 시작 없음. 버튼 클릭으로 직접 호출해야 시작되고,
    //    리턴한 함수가 그대로 반복 실행될 tick 콜백이 된다 (호출할 때마다 새 타이머 생성).
    returnValueTickCount = 0;
    returnValueLastId: number | null = null;

    @setInterval(700)
    startReturnValueInterval() {
      console.log('[setInterval returnValue] armed - 이 시점엔 아직 tick 콜백이 실행 안 됨');
      return (id: number) => {
        this.returnValueTickCount++;
        this.returnValueLastId = id;
        console.log('[setInterval returnValue] tick | id:', id, '| count:', this.returnValueTickCount);
        this.renderStatus();
      };
    }

    @addEventListener('.btn-start-return-value', 'click')
    onStartReturnValueClick() {
      this.startReturnValueInterval(); // 누를 때마다 완전히 새로운 타이머가 하나씩 더 생김
    }

    // 6-1. valueKey를 안 줬을 때 SET_INTERVAL_METADATA_KEY로 폴백하는지 확인 (applyAttribute.ts/applyNode.ts와 동일 컨벤션)
    defaultKeyTickCount = 0;

    @setInterval(600)
    startDefaultKeyInterval() {
      console.log('[setInterval default-key] armed - valueKey 안 줬으니 SET_INTERVAL_METADATA_KEY로 폴백해야 함');
      return {
        [SET_INTERVAL_METADATA_KEY]: (id: number) => {
          this.defaultKeyTickCount++;
          console.log('[setInterval default-key] tick | id:', id, '| count:', this.defaultKeyTickCount);
          this.renderStatus();
        }
      };
    }

    @addEventListener('.btn-start-default-key', 'click')
    onStartDefaultKeyClick() {
      this.startDefaultKeyInterval();
    }

    // 6-2. bare 데코레이터(괄호 없음) 스모크 테스트 — mutationObserverThis / propWindow
    bareMutationCount = 0;

    @mutationObserverThis
    onBareMutation() {
      this.bareMutationCount++;
      console.log('[bare @mutationObserverThis] fired | count:', this.bareMutationCount);
      this.renderStatus();
    }

    @propWindow
    setBareWindowProp() {
      return { value: 'hello-bare', at: Date.now() };
    }

    // 6-3. @eventMediaChange — window.matchMedia 상태 변화 감지 (connect 시 자동 구독, disconnect 시 자동 해제)
    mediaMatchesNarrow = false;
    mediaChangeCount = 0;

    @eventMediaChange('(max-width: 600px)')
    onNarrowMediaChange(e: MediaQueryListEvent) {
      this.mediaMatchesNarrow = e.matches;
      this.mediaChangeCount++;
      console.log('[eventMediaChange] matches:', e.matches, '| count:', this.mediaChangeCount);
      this.renderStatus();
    }

    @addEventListener('.btn-bare-test', 'click')
    onBareTestClick() {
      // bare @mutationObserverThis 기본 root:'auto' + shadowRoot 있음 → shadow 쪽을 관찰하므로 shadowRoot에 자식을 추가해서 트리거
      const marker = document.createElement('span');
      marker.style.display = 'none';
      this.shadowRoot?.appendChild(marker);
      this.setBareWindowProp();
      console.log('[bare @propWindow] window.setBareWindowProp:', (window as any).setBareWindowProp);
    }

    // 7. requestAnimationFrame type:'onConnected' - connect 시 자동 시작, 리턴값으로 스스로 종료 제어
    //    (30프레임 채우면 null을 리턴해서 다음 프레임을 예약 안 함 - 개발자가 종료를 제어)
    rafOnConnectedFrameCount = 0;

    @requestAnimationFrame({ type: 'onConnected', created: (set: HelperHostSet, id: number) => console.log('[rAF onConnected] loop started | id:', id) })
    onAnimationFrame(timestamp: number, prevValue?: number) {
      const count = (prevValue ?? 0) + 1;
      this.rafOnConnectedFrameCount = count;
      if (count % 5 === 0) this.renderStatus();
      if (count >= 30) {
        console.log('[rAF onConnected] 30프레임 도달 - null 리턴으로 스스로 종료');
        return null; // 다음 프레임 예약 안 함
      }
      return count; // 다음 호출의 prevValue로 그대로 전달됨
    }

    // 8. requestAnimationFrame type:'returnValue'(기본값) - 버튼 클릭으로 시작, 누적 상태(count, startTime)를
    //    prevValue로 계속 실어나르다가 2초 지나면 스스로 종료
    rafReturnValueFrameCount = 0;
    rafReturnValueDone = false;

    @requestAnimationFrame
    startRafReturnValue() {
      console.log('[rAF returnValue] armed');
      return (timestamp: number, prevValue?: { count: number; startTime: number }) => {
        const startTime = prevValue?.startTime ?? timestamp;
        const count = (prevValue?.count ?? 0) + 1;
        this.rafReturnValueFrameCount = count;
        this.renderStatus();
        if (timestamp - startTime >= 2000) {
          this.rafReturnValueDone = true;
          console.log('[rAF returnValue] 2초 경과 - null 리턴으로 스스로 종료 | 총 프레임:', count);
          this.renderStatus();
          return null;
        }
        return { count, startTime };
      };
    }

    @addEventListener('.btn-start-raf', 'click')
    onStartRafClick() {
      this.rafReturnValueDone = false;
      this.startRafReturnValue();
    }

    // ─── 스택 순서 테스트: @setInterval(onConnected) + @applyNode(appendChild) ───
    appendCountA = 0;
    appendCountB = 0;

    // 순서 A: @setInterval이 위, @applyNode가 아래
    @setInterval(1200, { type: 'onConnected' })
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
    @setInterval(1300, { type: 'onConnected' })
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
        <div>returnValue tick count: <b>${this.returnValueTickCount}</b> (last timer id: <b>${this.returnValueLastId}</b>)</div>
        <div>default-key(valueKey 없음) tick count: <b>${this.defaultKeyTickCount}</b></div>
        <div>bare @mutationObserverThis count: <b>${this.bareMutationCount}</b></div>
        <div>@eventMediaChange('(max-width:600px)') matches: <b>${this.mediaMatchesNarrow}</b> (change count: <b>${this.mediaChangeCount}</b>)</div>
        <div>rAF onConnected frame count: <b>${this.rafOnConnectedFrameCount}</b> ${this.rafOnConnectedFrameCount >= 30 ? '(종료됨)' : ''}</div>
        <div>rAF returnValue frame count: <b>${this.rafReturnValueFrameCount}</b> ${this.rafReturnValueDone ? '(2초 경과 - 종료됨)' : ''}</div>
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
          .return-value-section { margin-top: 24px; padding: 16px 20px; border: 2px dashed #34d399; border-radius: 12px; background: #ecfdf5; }
          .btn-start-return-value { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; margin-top: 8px; }
          .btn-start-return-value:hover { background: #059669; }
          .btn-start-default-key { margin-left: 8px; }
          .raf-section { margin-top: 24px; padding: 16px 20px; border: 2px dashed #a78bfa; border-radius: 12px; background: #f5f3ff; }
          .btn-start-raf { padding: 8px 16px; background: #7c3aed; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; margin-top: 8px; }
          .btn-start-raf:hover { background: #6d28d9; }
        </style>
        <div class="box">
          <h2>⏱️ @setInterval / @setTimeout Test</h2>
          <p>콘솔을 열어서 로그를 확인하세요.</p>
          <div class="status">대기 중...</div>
          <p class="hint">
            헤더의 <b>Home</b> 링크를 눌러 이 페이지를 벗어나면(disconnect) 타이머가 자동으로 정리됩니다 —
            벗어난 뒤 콘솔에 더 이상 로그가 안 찍히는지 확인하세요.
          </p>

          <div class="return-value-section">
            <h3>🖱️ type:'returnValue'(기본값) 테스트</h3>
            <p class="hint" style="margin-top:6px;">버튼을 눌러야만 시작됨 (connect 시 자동 실행 안 됨). 여러 번 누르면 그때마다 별도의 새 타이머가 생겨서 tick count가 더 빨리 올라감.</p>
            <button class="btn-start-return-value">타이머 시작 (700ms)</button>
            <button class="btn-start-return-value btn-start-default-key">valueKey 없이 시작 (600ms, 기본 키로 폴백돼야 함)</button>
            <button class="btn-start-return-value btn-bare-test">bare 데코레이터 테스트 (@mutationObserverThis + @propWindow)</button>
          </div>

          <div class="raf-section">
            <h3>🎞️ @requestAnimationFrame 테스트</h3>
            <p class="hint" style="margin-top:6px;">onConnected: connect되면 자동으로 시작해서 30프레임 채우면 스스로 종료 (null 리턴). returnValue(기본값): 버튼 눌러야 시작, 2초 지나면 스스로 종료 - 누적 상태(count, startTime)가 매 프레임 prevValue로 전달됨.</p>
            <button class="btn-start-raf">requestAnimationFrame 시작 (2초 후 자동 종료)</button>
          </div>

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
