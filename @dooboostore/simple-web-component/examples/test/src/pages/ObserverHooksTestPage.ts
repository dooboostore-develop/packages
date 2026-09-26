import {
  elementDefine, onConnectedBodyShadow, addEventListener,
  mutationObserver, resizeObserver, changedAttribute, setInterval as swcSetInterval, setTimeout as swcSetTimeout,
  mutationObserverBeforeReturn, resizeObserverBeforeReturn, changedAttributeBeforeReturn, setIntervalBeforeReturn, setTimeoutBeforeReturn
} from '@dooboostore/simple-web-component';

/**
 * observer 3종 + changedAttribute + setTimeout/setInterval(onConnected)의
 * async filter / before / finally / @xxxBeforeReturn 검증 페이지.
 * 각 로그는 window.__obs[kind] 배열에 쌓는다.
 */
export default (w: Window) => {
  const tagName = 'swc-example-observer-hooks-test-page';
  if (w.customElements.get(tagName)) return tagName;

  const log = (k: string, v: string) => { const o = ((w as any).__obs ??= {}); (o[k] ??= []).push(v); };

  @elementDefine(tagName, { window: w })
  class ObserverHooksTestPage extends w.HTMLElement {
    intervalTicks = 0;

    // ── mutationObserver ── k
    @mutationObserver('.dyn', {
      childList: true, subtree: true, delegate: true,
      filter: async (els) => { log('mut', 'filter:' + els.length); return true; },
      before: async () => { log('mut', 'before'); return 'MUT_PREP'; },
      finally: async (_els, _m, ctx) => log('mut', `finally:err${!!ctx.error}`)
    })
    onMutation(@mutationObserverBeforeReturn prep: string) {
      log('mut', 'handler:' + prep);
    }

    // ── resizeObserver ──
    @resizeObserver('.box', {
      filter: async () => { log('rez', 'filter'); return true; },
      before: async () => { log('rez', 'before'); return 'REZ_PREP'; },
      finally: async (_els, _m, ctx) => log('rez', `finally:err${!!ctx.error}`)
    })
    onResize(@resizeObserverBeforeReturn prep: string) {
      log('rez', 'handler:' + prep);
    }

    // ── changedAttribute ──
    @changedAttribute('data-x', {
      filter: async () => { log('attr', 'filter'); return true; },
      before: async () => { log('attr', 'before'); return 'ATTR_PREP'; },
      finally: async (_v, _m, ctx) => log('attr', `finally:err${!!ctx.error}`)
    })
    onAttr(value: string, _old: string | null, _name: string, _hhs: any, prep: string) {
      // positional: value..hhs 뒤에 before 리턴(prep)이 붙는다
      log('attr', 'handler:' + value + ':' + prep);
    }

    // ── setInterval (onConnected) ──
    @swcSetInterval(250, {
      type: 'onConnected',
      filter: async (s) => { log('interval', 'filter'); return true; },
      before: async () => { log('interval', 'before'); return 'INT_PREP'; },
      finally: async (_s, ctx) => log('interval', `finally:err${!!ctx.error}`)
    })
    onInterval(@setIntervalBeforeReturn prep: string) {
      this.intervalTicks++;
      log('interval', 'handler:' + prep + ':tick' + this.intervalTicks);
    }

    // ── setTimeout (onConnected) ──
    @swcSetTimeout(200, {
      type: 'onConnected',
      filter: async () => { log('timeout', 'filter'); return true; },
      before: async () => { log('timeout', 'before'); return 'TO_PREP'; },
      finally: async (_s, ctx) => log('timeout', `finally:err${!!ctx.error}`)
    })
    onTimeout(@setTimeoutBeforeReturn prep: string) {
      log('timeout', 'handler:' + prep);
    }

    // 트리거 버튼들
    @addEventListener('.add-child', 'click')
    addChild() {
      const el = w.document.createElement('div');
      el.className = 'dyn';
      el.textContent = 'child';
      this.shadowRoot!.querySelector('.mut-container')!.appendChild(el);
    }

    @addEventListener('.resize-box', 'click')
    resizeBox() {
      const box = this.shadowRoot!.querySelector('.box') as HTMLElement;
      box.style.width = (100 + Math.floor(Math.random() * 200)) + 'px';
    }

    @addEventListener('.set-attr', 'click')
    setAttr() {
      this.setAttribute('data-x', 'v' + Date.now());
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host { display:block; padding:16px; font-family: system-ui, sans-serif; }
          .box { width:100px; height:40px; background:#cde; margin:8px 0; }
          button { margin:4px; padding:6px 12px; }
          pre { background:#f5f5f5; padding:8px; border-radius:4px; white-space:pre-wrap; }
        </style>
        <h2>observer / attr / timer hooks 테스트</h2>
        <button class="add-child">mutation: add child</button>
        <button class="resize-box">resize: box 크기 변경</button>
        <button class="set-attr">changedAttribute: data-x 변경</button>
        <div class="mut-container"></div>
        <div class="box"></div>
        <pre class="out">로그는 window.__obs 확인</pre>
      `;
    }
  }

  return tagName;
};
