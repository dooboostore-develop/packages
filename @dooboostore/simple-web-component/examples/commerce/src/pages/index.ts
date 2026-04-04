import CartPage from './CartPage';
import ProductPage from './ProductPage';
import CheckoutPage from './CheckoutPage';
import HomePage from './HomePage';
import OrdersPage from './OrdersPage';
import { onConnectedSwcApp,applyReplaceChildrenNodeHost, applyInnerHtmlNodeHost, subscribeSwcAppRouteChange, onInitialize, elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { Router, type RouterEventType } from '@dooboostore/core-web';
import { CartService } from '../services/CartService';
import { OrderService } from '../services/OrderService';
import { ProductService } from '../services/ProductService';

export { CartPage, ProductPage, CheckoutPage, HomePage, OrdersPage };

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

    @onConnectedSwcApp
    onconstructor(@Inject({ symbol: ProductService.SYMBOL }) productService: ProductService, @Inject({ symbol: CartService.SYMBOL }) cartService: CartService, @Inject({ symbol: OrderService.SYMBOL }) orderService: OrderService, router: Router) {
      this.productService = productService;
      this.cartService = cartService;
      this.orderService = orderService;
      this.router = router;
      // alert(1);
    }

    @subscribeSwcAppRouteChange(['', '/'])
    @applyInnerHtmlNodeHost({ root: 'light' })
    homeRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-commerce-home-page/>`;
    }

    @subscribeSwcAppRouteChange('/product/{id}')
    @applyInnerHtmlNodeHost({ root: 'light' })
    productRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-commerce-product-page product-id="${pathData.id}"/>`;
    }

    @subscribeSwcAppRouteChange('/cart')
    @applyInnerHtmlNodeHost({ root: 'light' })
    cartRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-commerce-cart-page/>`;
    }

    @subscribeSwcAppRouteChange('/checkout')
    @applyInnerHtmlNodeHost({ root: 'light' })
    checkoutRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-commerce-checkout-page/>`;
    }

    @subscribeSwcAppRouteChange('/orders')
    @applyInnerHtmlNodeHost({ root: 'light' })
    ordersRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-commerce-orders-page/>`;
    }

    @applyReplaceChildrenNodeHost({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedInnerHtml({ useShadow: true })
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

export const pageFactories = [CartPage, ProductPage, CheckoutPage, HomePage, OrdersPage, rootRouterFactory];