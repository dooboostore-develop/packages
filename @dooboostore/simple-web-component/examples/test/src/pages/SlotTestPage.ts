import { elementDefine, onConnectedBodyShadow, onConnectedAfter, addEventListener, appendHtmlSlot, replaceChildrenTextSlot, clearSlot } from '@dooboostore/simple-web-component';

/**
 * @applySlot(및 @appendSlot/@replaceChildrenTextSlot/@clearSlot) 데코레이터 테스트 페이지.
 *
 * 슬롯 마커는 직접 NodeSlot을 만들 필요 없이 템플릿에 예약 지시문 `<!--[[ id ]]-->`를 쓰면
 * @onConnected류 렌더 파이프라인(elementDefine.ts)이 SwcUtils.projectProcessHtml로 자동
 * 치환해준다 (내부적으로 NodeSlot.slot(swcId, id)를 호출하는 것과 동일).
 *
 * 발견된 버그: applySlot.ts의 applyToDom이 모듈 최상위 화살표 함수라서 그 안의 `this`가
 * 컴포넌트 인스턴스가 아니라 모듈 스코프의 this(컴파일 결과 `void 0`)로 고정되어 있었음 —
 * 그래서 NodeSlot 생성자가 매번 `Error('host node is required')`를 던졌음 (100% 재현).
 * host를 명시적으로 인자로 넘기게 고친 뒤, 이 페이지로 실제 브라우저에서 동작을 확인한다.
 */
export default (w: Window) => {
  const tagName = 'swc-example-slot-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class SlotTestPage extends w.HTMLElement {
    count = 0;

    @onConnectedAfter
    onconstructor() {
      // connect 직후 1회 자동 호출 — 초기 렌더 경로에서도 안 던지는지 확인
      this.addItem();
    }

    @appendHtmlSlot('items')
    addItem() {
      this.count++;
      return `<p class="item">item ${this.count}</p>`;
    }

    @replaceChildrenTextSlot('status')
    setStatus(text: string) {
      return text;
    }

    @clearSlot('items')
    clearItems() {
      this.count = 0;
    }

    // 리턴값이 undefined면 resToNodes가 빈 배열을 만든다 — NodeSlot의 오버로드 판별에서
    // targetId('empty')가 그대로 콘텐츠로 새는 버그가 있었는지 이 케이스로 확인한다.
    @appendHtmlSlot('empty')
    appendNothing() {
      return undefined as any;
    }

    @addEventListener('.add-btn', 'click')
    onAddClick() {
      this.addItem();
      this.setStatus(`count=${this.count}`);
    }

    @addEventListener('.empty-btn', 'click')
    onEmptyClick() {
      this.appendNothing();
    }

    @addEventListener('.clear-btn', 'click')
    onClearClick() {
      this.clearItems();
      this.setStatus('cleared');
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>:host { display: block; padding: 16px; }</style>
        <button class="add-btn">add item</button>
        <button class="clear-btn">clear</button>
        <button class="empty-btn">append nothing</button>
        <div class="status"><!--[[ status ]]-->initial</div>
        <div class="items"><!--[[ items ]]--></div>
        <div class="empty"><!--[[ empty ]]--></div>
      `;
    }
  }

  return tagName;
};
