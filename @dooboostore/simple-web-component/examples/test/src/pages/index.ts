import CartPage from './CartPage';
import ProductPage from './ProductPage';
import CheckoutPage from './CheckoutPage';
import HomePage from './HomePage';
import OrdersPage from './OrdersPage';
import TimerTestPage from './TimerTestPage';
import SlotTestPage from './SlotTestPage';
import RxjsOperatorsTestPage from './RxjsOperatorsTestPage';
import EventDelegateTestPage from './EventDelegateTestPage';
import LifecycleParamTestPage from './LifecycleParamTestPage';
import AroundStateTestPage from './AroundStateTestPage';
import BeforeFilterReturnTestPage from './BeforeFilterReturnTestPage';
import ObserverHooksTestPage from './ObserverHooksTestPage';
import MessageSubjectTestPage from './MessageSubjectTestPage';
import {replaceChildren, innerHtmlLight, subscribeSwcAppRouteChange, subscribeSwcAppMessage, publishSwcAppMessage, routeChangeBeforeReturn, appMessageBeforeReturn, onConnectedBodyLight, innerHtml, onConnectedAfter, onConnectedBody, updateClass, addEventListener, applyNode, elementDefine, emitCustomEvent, onConnectedBefore, onConnectedBodyShadow, addEventListenerThis, attribute } from '@dooboostore/simple-web-component';
import {Inject} from '@dooboostore/simple-boot';
import {Router, type RouterEventType} from '@dooboostore/core-web';
import {CartService} from '../services/CartService';
import {OrderService} from '../services/OrderService';
import {ProductService} from '../services/ProductService';

export { CartPage, ProductPage, CheckoutPage, HomePage, OrdersPage, TimerTestPage, SlotTestPage, RxjsOperatorsTestPage, EventDelegateTestPage, LifecycleParamTestPage, AroundStateTestPage, BeforeFilterReturnTestPage, ObserverHooksTestPage, MessageSubjectTestPage };

/**
 * Root Router Factory - Main routing hub
 */
export const rootRouterFactory = (w: Window) => {
  const tagName = 'commerce-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private productService: ProductService;
    private cartService: CartService;
    private orderService: OrderService;
    private router: Router;

    @onConnectedAfter
    onconstructor(@Inject({ symbol: ProductService.SYMBOL }) productService: ProductService, @Inject({ symbol: CartService.SYMBOL }) cartService: CartService, @Inject({ symbol: OrderService.SYMBOL }) orderService: OrderService, router: Router) {
      this.productService = productService;
      this.cartService = cartService;
      this.orderService = orderService;
      this.router = router;
      // alert(1);
      // setInterval(()=>{
      //   this.publishMessage('Hello from RootRouter at ' + new Date().toLocaleTimeString());
      // }, 1000)
    }

    @publishSwcAppMessage
    publishMessage(message: string) {
      return message;
    }

    // ── async filter/before/finally 검증용 (route) ──
    @subscribeSwcAppRouteChange({
      path: '/hook-guard-test',
      filter: async () => { await new Promise(r => setTimeout(r, 20)); (w as any).__routeLog = ['filter']; return true; },
      before: async () => { (w as any).__routeLog.push('before'); return 'GUARD_OK'; },
      finally: async (_r: any, _m: any, ctx: any) => { (w as any).__routeLog.push('finally:' + ctx.result + ':args' + ctx.args.length); }
    })
    @innerHtmlLight
    hookGuardRoute(@routeChangeBeforeReturn guard: string) {
      (w as any).__routeLog.push('handler:' + guard);
      return `<div id="hook-guard">hook guard ok</div>`;
    }

    // ── async filter/before/finally 검증용 (message) ──
    @publishSwcAppMessage('hooktest')
    publishHookTest() {
      return 1;
    }

    @subscribeSwcAppMessage('hooktest', {
      filter: async () => { await new Promise(r => setTimeout(r, 20)); (w as any).__msgLog = ['filter']; return true; },
      before: async () => { (w as any).__msgLog.push('before'); return 'PREP'; },
      finally: async (_msg: any, _self: any, ctx: any) => { (w as any).__msgLog.push('finally:' + ctx.result + ':args' + ctx.args.length); }
    })
    onHookTest(@appMessageBeforeReturn prepared: string) {
      (w as any).__msgLog.push('handler:' + prepared);
      return 'done';
    }

    @subscribeSwcAppRouteChange(['', '/', '/product/{id}', '/cart', '/checkout', '/orders', '/timer-test', '/slot-test', '/rxjs-operators-test', '/event-delegate-test', '/lifecycle-param-test', '/around-state-test', '/before-filter-return-test', '/observer-hooks-test', '/message-subject-test'])
    @innerHtmlLight
    routeChanged(routerPathSet: RouterEventType) {
      if (['', '/'].includes(routerPathSet.path)) {
        return `<swc-example-commerce-home-page/>`;
      } else if (['/cart'].includes(routerPathSet.path)) {
        return `<swc-example-commerce-cart-page/>`;
      } else if (['/checkout'].includes(routerPathSet.path)) {
        return `<swc-example-commerce-checkout-page/>`;
      } else if (['/orders'].includes(routerPathSet.path)) {
        return `<swc-example-commerce-orders-page/>`;
      } else if (['/timer-test'].includes(routerPathSet.path)) {
        return `<swc-example-timer-test-page/>`;
      } else if (['/slot-test'].includes(routerPathSet.path)) {
        return `<swc-example-slot-test-page/>`;
      } else if (['/rxjs-operators-test'].includes(routerPathSet.path)) {
        return `<swc-example-rxjs-operators-test-page/>`;
      } else if (['/event-delegate-test'].includes(routerPathSet.path)) {
        return `<swc-example-event-delegate-test-page/>`;
      } else if (['/lifecycle-param-test'].includes(routerPathSet.path)) {
        return `<swc-example-lifecycle-param-test-page/>`;
      } else if (['/around-state-test'].includes(routerPathSet.path)) {
        return `<swc-example-around-state-test-page/>`;
      } else if (['/before-filter-return-test'].includes(routerPathSet.path)) {
        return `<swc-example-before-filter-return-test-page/>`;
      } else if (['/observer-hooks-test'].includes(routerPathSet.path)) {
        return `<swc-example-observer-hooks-test-page/>`;
      } else if (['/message-subject-test'].includes(routerPathSet.path)) {
        return `<swc-example-message-subject-test-page/>`;
      } else if (routerPathSet.path.startsWith('/product/')) {
        return `<swc-example-commerce-product-page product-id="${routerPathSet.pathData.id}"/>`;
      } else {
        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 40px; text-align: center; color: #666;">
       <h2 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">404 - Page Not Found</h2>
       <p style="margin: 0 0 20px 0; color: #999;">The page you're looking for doesn't exist.</p>
       <a href="/" style="padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; transition: background 0.3s;">Go Home</a>
       </div>`;
      }
    }

    @replaceChildren({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          * { box-sizing: border-box; }
          :host { display: flex; flex-direction: column; min-height: 100vh; width: 100%; background: #fff; }
          #page-container { flex: 1; display: flex; flex-direction: column; width: 100%; overflow-y: auto; }
        </style>
        <swc-example-commerce-header on-navigate="$host.navigate($data.path)"></swc-example-commerce-header>
        <main id="page-container">
          <slot></slot>
        </main>
      `;
    }
  }

  return tagName;
};

export const pageFactories = [CartPage, ProductPage, CheckoutPage, HomePage, OrdersPage, TimerTestPage, SlotTestPage, RxjsOperatorsTestPage, EventDelegateTestPage, LifecycleParamTestPage, AroundStateTestPage, BeforeFilterReturnTestPage, ObserverHooksTestPage, MessageSubjectTestPage, rootRouterFactory];