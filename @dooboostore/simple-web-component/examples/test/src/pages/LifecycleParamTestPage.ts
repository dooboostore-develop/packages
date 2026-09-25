import { elementDefine, onConnectedAfter, onConnectedBodyShadow, hostSet, helperHostSet, helperSet, subscribeSwcAppRouteChange, subscribeSwcAppMessage, routerEvent, appMessage } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { ProductService } from '../services/ProductService';

/**
 * elementDefine.ts의 _invokeLifecycleMethod에 @hostSet/@helperHostSet/@helperSet(parameter.ts)를
 * firstCheckMaker로 끼워넣은 것을 검증하는 페이지.
 *
 * 핵심 확인 포인트:
 * - SimpleApplication이 있을 때: 같은 메서드에서 simple-boot의 @Inject(symbol)와
 *   parameter.ts의 @hostSet/@helperHostSet/@helperSet을 섞어 써도 둘 다 정확히 해석되는가
 *   (firstCheckMaker가 자기 kind만 가로채고, 나머지는 기존 @Inject 해석으로 정상 흘러감).
 * - SimpleApplication이 없는 standalone 인스턴스일 때도(document.body에 직접 붙인 경우):
 *   @hostSet/@helperHostSet/@helperSet은 buildSwcParameterArgs로 여전히 주입되는가
 *   (이 페이지는 앱 라우터 트리 안에서 렌더되므로 app이 항상 존재 — standalone 케이스는
 *   Puppeteer에서 document.createElement로 별도 검증한다).
 */
export default (w: Window) => {
  const tagName = 'swc-example-lifecycle-param-test-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class LifecycleParamTestPage extends w.HTMLElement {
    mixedInjectOk = false;
    hostSetOk = false;
    helperHostSetOk = false;
    helperSetOk = false;
    routeChangedOk = false;
    messageOk = false;
    lastMessageData = '';

    @onConnectedAfter
    onConnectedCheck(
      @Inject({ symbol: ProductService.SYMBOL }) productService: ProductService | undefined,
      @hostSet hs: any,
      @helperHostSet full: any,
      @helperSet helpers: any
    ) {
      this.mixedInjectOk = !!productService && typeof productService.getAll === 'function';
      this.hostSetOk = !!hs && Array.isArray(hs.$hosts);
      this.helperHostSetOk = !!full && typeof full.$q === 'function' && Array.isArray(full.$hosts);
      this.helperSetOk = !!helpers && typeof helpers.$q === 'function' && helpers.$hosts === undefined;
      this.updateStatus();
    }

    // 라우트 변경 구독 — 일부러 순서를 뒤집어서(@helperSet이 먼저, @routerEvent가 나중) 선언.
    // 이 컴포넌트가 connect될 때 SwcAppMixin._connected가 마지막 라우터 이벤트로 즉시 호출해준다.
    @subscribeSwcAppRouteChange
    onRouteChangedV2(@helperSet helpers: any, @routerEvent re: any) {
      this.routeChangedOk = !!helpers && typeof helpers.$q === 'function' && !!re && typeof re.path === 'string';
      this.updateStatus();
    }

    // 메시지 구독 — 순서를 뒤집어서(@hostSet이 먼저, @appMessage가 나중) 선언.
    @subscribeSwcAppMessage
    onMessageV2(@hostSet hs: any, @appMessage msg: any) {
      this.messageOk = !!hs && Array.isArray(hs.$hosts) && !!msg && typeof msg.data === 'string';
      this.lastMessageData = msg?.data ?? '';
      this.updateStatus();
    }

    updateStatus() {
      const el = this.shadowRoot?.querySelector('.status') as HTMLElement | null;
      if (el) {
        el.textContent = `mixedInjectOk(@Inject+@hostSet 공존): ${this.mixedInjectOk} | hostSetOk: ${this.hostSetOk} | helperHostSetOk: ${this.helperHostSetOk} | helperSetOk: ${this.helperSetOk} | routeChangedOk(@helperSet+@routerEvent, reversed): ${this.routeChangedOk} | messageOk(@hostSet+@appMessage, reversed): ${this.messageOk} last="${this.lastMessageData}"`;
      }
    }

    @onConnectedBodyShadow
    render() {
      return `<pre class="status">pending...</pre>`;
    }
  }

  return tagName;
};
