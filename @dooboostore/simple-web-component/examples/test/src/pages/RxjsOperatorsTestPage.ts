import { elementDefine, onConnectedBodyShadow, addEventListener } from '@dooboostore/simple-web-component';

/**
 * @addEventListener의 RxJS 스타일 operator 옵션(debounceTime/throttleTime/distinctUntilChanged/filter)
 * 테스트 페이지. src/examples/RxJSOperatorsExample.ts(패키지 소스에 잘못 섞여 있던 문서용 예제 코드)를
 * 실제로 동작하는 라이브 테스트로 옮겨온 것 — @dooboostore/core/message/operators를 그대로 파이프라인에
 * 태우는 진짜 구현이라 문서/코드 스니펫만 존재하고 브라우저에서 검증된 적이 없었다.
 */
export default (w: Window) => {
  const tagName = 'swc-example-rxjs-operators-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  // distinctUntilChanged(prev, curr) 비교에서 prev는 이미 자신의 dispatch가 끝난 "죽은" Event라
  // prev.target을 읽을 수 없다(디바운스와 같은 이유). curr(지금 막 dispatch 중인, 살아있는 이벤트)만
  // 신뢰하고, 이전 값은 이 클로저 변수로 직접 추적한다.
  let lastDistinctValue: string | undefined;

  @elementDefine(tagName, { window: w })
  class RxjsOperatorsTestPage extends w.HTMLElement {
    debounceCount = 0;
    debounceLastValue = '';
    throttleCount = 0;
    distinctCount = 0;
    filteredCount = 0;
    allowFilteredClicks = false;

    // 300ms 동안 추가 입력이 없어야 발동 — 연속 타이핑 중에는 안 찍히고 멈추면 마지막 값 1번만 찍힘
    //
    // 주의: debounceTime은 네이티브 dispatch가 끝난 한참 뒤(setTimeout)에 핸들러를 재호출하는데,
    // shadow DOM을 넘나드는(composed) 이벤트는 dispatch가 끝나면 target이 shadow host로
    // retargeting되어버린다(composedPath()도 빈 배열이 됨) — 이건 DOM 스펙 동작이지 이 라이브러리의
    // 버그가 아니고, debounce/throttle처럼 처리를 지연시키는 구현이면 다 겪는 문제다. 그래서
    // event.target을 나중에 읽지 말고, 필요한 시점에 라이브 DOM을 직접 쿼리해야 한다.
    @addEventListener('.debounce-input', 'input', { debounceTime: 300 })
    onDebouncedInput(e: Event) {
      this.debounceCount++;
      this.debounceLastValue = (this.shadowRoot?.querySelector('.debounce-input') as HTMLInputElement)?.value ?? '';
      this.updateStatus();
    }

    // 500ms에 최대 1번만 발동 — 빠르게 여러 번 클릭해도 카운트는 훨씬 적게 올라감
    @addEventListener('.throttle-btn', 'click', { throttleTime: 500 })
    onThrottledClick() {
      this.throttleCount++;
      this.updateStatus();
    }

    // 이전 값과 같으면 스킵 — 같은 값을 연속으로 넣으면 카운트가 안 올라감.
    // distinctUntilChanged: true(기본 참조 비교)는 매번 새 Event 객체가 생기는 DOM 이벤트
    // 스트림에는 의미가 없다(절대 같은 참조가 될 수 없어서 항상 "다름"으로 판정됨) — 그렇다고
    // (prev, curr) => prev.target.value === curr.target.value 식으로 비교해도 안 된다. prev는
    // 이미 자기 dispatch가 끝난 이벤트라 target을 못 믿기 때문(디바운스와 동일한 이유). curr만
    // 신뢰하고 이전 값은 바깥 클로저 변수(lastDistinctValue)로 직접 추적해야 한다.
    @addEventListener('.distinct-input', 'input', {
      distinctUntilChanged: (prev: Event, curr: Event) => {
        const currentValue = (curr.target as HTMLInputElement)?.value;
        const isSame = currentValue === lastDistinctValue;
        lastDistinctValue = currentValue;
        return isSame;
      }
    })
    onDistinctInput(e: Event) {
      // distinctUntilChanged는 아주 첫 이벤트에서는 hasValue 게이트 때문에 comparator를
      // 아예 호출하지 않는다 — 그래서 lastDistinctValue가 첫 값으로 초기화될 기회가 없다.
      // 여기서도 시드해줘서 바로 다음 이벤트부터 정확히 비교되게 한다.
      lastDistinctValue = (e.target as HTMLInputElement)?.value;
      this.distinctCount++;
      this.updateStatus();
    }

    // filter 콜백이 false를 리턴하면 핸들러 자체가 호출 안 됨 (체크박스로 on/off)
    @addEventListener('.filtered-btn', 'click', {
      filter: (event, meta) => (meta.currentThis as RxjsOperatorsTestPage).allowFilteredClicks
    })
    onFilteredClick() {
      this.filteredCount++;
      this.updateStatus();
    }

    @addEventListener('.allow-checkbox', 'change')
    onToggleAllow(e: Event) {
      this.allowFilteredClicks = (e.target as HTMLInputElement).checked;
    }

    updateStatus() {
      const el = this.shadowRoot?.querySelector('.status') as HTMLElement | null;
      if (el) {
        el.textContent = `debounce: count=${this.debounceCount} last="${this.debounceLastValue}" | throttle: count=${this.throttleCount} | distinct: count=${this.distinctCount} | filtered: count=${this.filteredCount}`;
      }
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>:host { display: block; padding: 16px; } input, button { margin: 4px; }</style>
        <div>
          <label>debounce(300ms): <input class="debounce-input" type="text" /></label>
        </div>
        <div>
          <button class="throttle-btn">throttle click (500ms)</button>
        </div>
        <div>
          <label>distinct: <input class="distinct-input" type="text" /></label>
        </div>
        <div>
          <label><input class="allow-checkbox" type="checkbox" /> allow filtered clicks</label>
          <button class="filtered-btn">filtered click</button>
        </div>
        <pre class="status"></pre>
      `;
    }
  }

  return tagName;
};
