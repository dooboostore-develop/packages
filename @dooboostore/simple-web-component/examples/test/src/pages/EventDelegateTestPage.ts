import { elementDefine, onConnectedBodyShadow, addEventListener, eventDelegateLight, eventDelegateShadow, eventMutation, eventObject, matchedElement, hostSet, helperHostSet, helperSet, eventClickThis } from '@dooboostore/simple-web-component';

/**
 * @addEventListener의 delegate 계열 테스트 페이지 — 핵심 확인 포인트:
 * "이벤트 바인딩 시점에 존재하지 않던, 나중에 동적으로 추가된 엘리먼트에도 이벤트가 걸리는가"
 *
 * 두 가지 서로 다른 메커니즘을 비교한다:
 * - `delegate: true` (eventDelegateLight/eventDelegateShadow): 루트 하나에만 리스너를 걸고
 *   버블링 + closest(selector)로 실제 대상을 찾는 진짜 이벤트 위임. 재바인딩이 전혀 필요
 *   없어서 나중에 추가된 요소도 자동으로 잡힌다 — 단, 버블링하는 이벤트에서만 동작한다.
 * - `delegate: 'mutation'` (eventMutation): MutationObserver로 추가/제거되는 요소를 감시해서
 *   매칭되는 요소마다 직접 addEventListener를 걸고/떼는 방식. 버블링 안 하는 이벤트(focus 등)도
 *   커버할 수 있다는 게 버블링 위임과의 실질적 차이.
 *
 * 대조군으로 버블링 안 하는 `focus` 이벤트에 순수 delegate(true)를 걸어보면 절대 안 잡히는 것도
 * 같이 확인한다 — 두 메커니즘이 왜 각각 필요한지 보여주는 지점.
 */
export default (w: Window) => {
  const tagName = 'swc-example-event-delegate-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class EventDelegateTestPage extends w.HTMLElement {
    lightClickCount = 0;
    lightLastLabel = '';
    shadowClickCount = 0;
    focusViaDelegateCount = 0; // focus는 버블링 안 해서 항상 0으로 남아야 정상
    focusViaMutationCount = 0;
    dynCounter = 0;
    // @eventObject/@matchedElement/@hostSet/@helperHostSet/@helperSet 검증용
    lightClickCountV2 = 0;
    lightLastLabelV2 = '';
    hostSetOk = false;
    helperHostSetOk = false;
    helperSetOk = false;
    // @eventClickThis 검증용 — 괄호 없는 bare 형태로도 동작하는지 확인
    thisClickCount = 0;

    // 라이트 DOM, 버블링 기반 delegate — root:'light'라서 this(호스트) 자체에 리스너 하나만 건다.
    // .dyn-light-btn은 connect 시점엔 하나도 없다가 버튼 클릭으로 나중에 생기는데도 잡힌다.
    // (기존 위치 인자 방식 — @eventObject/@matchedElement를 전혀 안 쓰는 레거시 핸들러, 하위호환 확인용)
    @eventDelegateLight('.dyn-light-btn', 'click')
    onLightBtnClick(event: Event, meta: { $matchedElement: Element }) {
      this.lightClickCount++;
      this.lightLastLabel = meta.$matchedElement.textContent ?? '';
      this.updateStatus();
    }

    // 같은 .dyn-light-btn/click에 걸리는 두 번째 핸들러 — 일부러 순서를 뒤집어서
    // (matchedElement가 먼저, event가 나중) 선언해도 정확한 값이 들어오는지 확인.
    @eventDelegateLight('.dyn-light-btn', 'click')
    onLightBtnClickV2(@matchedElement $matchedElement: Element, @eventObject event: Event) {
      this.lightClickCountV2++;
      this.lightLastLabelV2 = $matchedElement.textContent ?? '';
      this.updateStatus();
    }

    // 섀도우 DOM, 버블링 기반 delegate — root:'shadow'라서 shadowRoot에 리스너 하나만 건다.
    @eventDelegateShadow('.dyn-shadow-btn', 'click')
    onShadowBtnClick() {
      this.shadowClickCount++;
      this.updateStatus();
    }

    // 같은 .dyn-shadow-btn/click에 걸리는 세 번째 핸들러 — @hostSet 단독 사용 검증.
    // HostSet에는 $hosts 배열이 있고 $this/$q 같은 HelperSet 쪽 속성은 없다.
    @eventDelegateShadow('.dyn-shadow-btn', 'click')
    onShadowBtnClickWithHostSet(@hostSet hs: any) {
      this.hostSetOk = !!hs && Array.isArray(hs.$hosts);
      this.updateStatus();
    }

    // 네 번째 핸들러 — @helperHostSet(HelperSet+HostSet+$this 전체)과 @helperSet(순수 헬퍼만)의
    // 차이를 한 번에 검증한다: helperHostSet은 $hosts와 $q를 둘 다 갖고, helperSet은 $q는
    // 있지만 $hosts는 없어야 한다(호스트 트리 정보가 없는 순수 헬퍼이므로).
    @eventDelegateShadow('.dyn-shadow-btn', 'click')
    onShadowBtnClickWithHelpers(@helperHostSet full: any, @helperSet helpersOnly: any) {
      this.helperHostSetOk = !!full && Array.isArray(full.$hosts) && typeof full.$q === 'function' && full.$this === this;
      this.helperSetOk = !!helpersOnly && typeof helpersOnly.$q === 'function' && helpersOnly.$hosts === undefined;
      this.updateStatus();
    }

    // 대조군: focus는 버블링하지 않으므로 순수 delegate(버블링 기반)로는 절대 못 잡는다.
    @eventDelegateShadow('.dyn-input', 'focus')
    onInputFocusViaDelegate() {
      this.focusViaDelegateCount++;
      this.updateStatus();
    }

    // MutationObserver 기반 — 추가되는 .dyn-input마다 직접 addEventListener를 걸어주므로
    // focus처럼 버블링 안 하는 이벤트도 정상적으로 잡힌다.
    @eventMutation('.dyn-input', 'focus')
    onInputFocusViaMutation() {
      this.focusViaMutationCount++;
      this.updateStatus();
    }

    // @eventClickThis - 괄호 없는 bare 형태 (options 필요 없을 때). $this(shadowRoot)에 걸리므로
    // shadow 템플릿 안 어디를 클릭해도(버블링) 잡힌다.
    @eventClickThis
    onAnyClickInsideShadow() {
      this.thisClickCount++;
      this.updateStatus();
    }

    @addEventListener('.add-light-btn', 'click')
    onAddLightBtn() {
      this.dynCounter++;
      const btn = w.document.createElement('button');
      btn.className = 'dyn-light-btn';
      btn.textContent = `light-${this.dynCounter}`;
      // 라이트 DOM(this 자신)에 직접 붙인다 — shadow 템플릿이 아니라 진짜 light DOM 자식.
      this.appendChild(btn);
    }

    @addEventListener('.add-shadow-btn', 'click')
    onAddShadowBtn() {
      this.dynCounter++;
      const btn = w.document.createElement('button');
      btn.className = 'dyn-shadow-btn';
      btn.textContent = `shadow-${this.dynCounter}`;
      this.shadowRoot?.querySelector('.shadow-container')?.appendChild(btn);
    }

    @addEventListener('.add-input-btn', 'click')
    onAddInputBtn() {
      this.dynCounter++;
      const input = w.document.createElement('input');
      input.className = 'dyn-input';
      input.placeholder = `input-${this.dynCounter}`;
      this.shadowRoot?.querySelector('.input-container')?.appendChild(input);
    }

    updateStatus() {
      const el = this.shadowRoot?.querySelector('.status') as HTMLElement | null;
      if (el) {
        el.textContent = `light-click: count=${this.lightClickCount} last="${this.lightLastLabel}" | light-click-v2(@param, reversed): count=${this.lightClickCountV2} last="${this.lightLastLabelV2}" | shadow-click: count=${this.shadowClickCount} | hostSetOk: ${this.hostSetOk} | helperHostSetOk: ${this.helperHostSetOk} | helperSetOk: ${this.helperSetOk} | eventClickThis(bare): count=${this.thisClickCount} | focus-via-delegate(should stay 0): count=${this.focusViaDelegateCount} | focus-via-mutation: count=${this.focusViaMutationCount}`;
      }
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>:host { display: block; padding: 16px; } button, input { margin: 4px; }</style>
        <div>
          <button class="add-light-btn">add light-DOM button</button>
          <button class="add-shadow-btn">add shadow-DOM button</button>
          <button class="add-input-btn">add dynamic input (focus test)</button>
        </div>
        <div class="shadow-container"></div>
        <div class="input-container"></div>
        <pre class="status"></pre>
      `;
    }
  }

  return tagName;
};
