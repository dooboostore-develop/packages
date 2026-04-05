import CartPage from './CartPage';
import ProductPage from './ProductPage';
import CheckoutPage from './CheckoutPage';
import HomePage from './HomePage';
import OrdersPage from './OrdersPage';
import { type SwcAppMessage, subscribeSwcAppMessageWhileConnected, publishSwcAppMessage, onConnectedSwcApp, applyReplaceChildrenNodeHost, applyInnerHtmlNodeHost, subscribeSwcAppRouteChangeWhileConnected, onInitialize, elementDefine, onConnectedInnerHtml, setProperty } from '@dooboostore/simple-web-component';
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
      // setInterval(()=>{
      //   this.publishMessage('Hello from RootRouter at ' + new Date().toLocaleTimeString());
      // }, 1000)
    }

    @publishSwcAppMessage
    publishMessage(message: string) {
      return message;
    }

    // @subscribeSwcAppMessageWhileConnected
    // ttt(message: SwcAppMessage) {
    //   console.log('RootRouter received message:', message);
    // }

    @setProperty('#router', 'value')
    @subscribeSwcAppRouteChangeWhileConnected(['', '/', '/product/{id}', '/cart', '/checkout', '/orders'])
    routeChanged(re: RouterEventType) {
      return re;
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
          <template id="router" is="swc-choose" skip-if-same>
            <!-- Home -->
            <template is="swc-when" value="{{ ['', '/'].includes($value?.path) }}">
              <swc-example-commerce-home-page/>
            </template>
            
            <!-- Product Detail -->
            <template is="swc-when" value="{{ $value?.path.startsWith('/product/') }}">
              <swc-example-commerce-product-page product-id="{{$value.pathData.id}}"/>
            </template>
            
            <!-- Cart -->
            <template is="swc-when" value="{{ $value?.path === '/cart' }}">
              <swc-example-commerce-cart-page/>
            </template>
            
            <!-- Checkout -->
            <template is="swc-when" value="{{ $value?.path === '/checkout' }}">
              <swc-example-commerce-checkout-page/>
            </template>
            
            <!-- Orders -->
            <template is="swc-when" value="{{ $value?.path === '/orders' }}">
              <swc-example-commerce-orders-page/>
            </template>
            
            <!-- Not Found -->
            <template is="swc-otherwise">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 40px; text-align: center; color: #666;">
                <h2 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">404 - Page Not Found</h2>
                <p style="margin: 0 0 20px 0; color: #999;">The page you're looking for doesn't exist.</p>
                <a href="/" style="padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; transition: background 0.3s;">Go Home</a>
              </div>
            </template>
          </template>
        </main>
      `;
    }
  }

  return tagName;
};

export const pageFactories = [CartPage, ProductPage, CheckoutPage, HomePage, OrdersPage, rootRouterFactory];