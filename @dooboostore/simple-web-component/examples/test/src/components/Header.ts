import {applyNode, addEventListenerThis, emitCustomEventThis, updateClass, applyNodeInnerHtml, addEventListener, applyNodeThis, attributeThis, query, applyNodeThisReplaceChildren, onConnected,elementDefine, onConnectedBefore, setProperty, subscribeSwcAppRouteChangeWhileConnected} from '@dooboostore/simple-web-component';
import {CartService} from "../services/CartService";
import {Subscription} from "@dooboostore/core";
import {inject} from "@dooboostore/simple-boot";

/**
import {CartService} from "../services/CartService";
import {Subscription} from "@dooboostore/core";
import {Inject} from "@dooboostore/simple-boot";

/**
 * Header Navigation Component Factory
 */
export default (w: Window) => {
  const tagName = 'swc-example-commerce-header';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class Header extends w.HTMLElement {
    #cartService: CartService;
    #cartUnsubscribe?:  Subscription;

    @onConnectedBefore
    async gg(@inject({symbol: CartService.SYMBOL})cartService: CartService) {
      this.#cartService = cartService;
      console.log('[Header] CartService injected:', cartService);
      // Wait for cart to load from storage
      await this.#cartService.load();
      // Subscribe to cart store for reactive updates
      this.#cartUnsubscribe = this.#cartService.store.subscribe(cart => {
        console.log('[Header] Cart updated:', cart);
        this.updateCartCount();
      });

      // Update cart count immediately after load
      this.updateCartCount();
    }

    @addEventListener('.logo', 'click')
    @emitCustomEventThis('navigate', { attributeName: 'on-navigate' })
    onLogoClick() {
      return { path: '/' };
    }

    @addEventListener('#home-link', 'click')
    @emitCustomEventThis('navigate', { attributeName: 'on-navigate' })
    onHomeClick(event: Event,h : any) {
      console.log('-!!', event, h)
      return { path: '/' };
    }

    @addEventListener('#orders-link', 'click')
    @emitCustomEventThis('navigate', { attributeName: 'on-navigate' })
    onOrdersClick() {
      return { path: '/orders' };
    }

    @addEventListener('.cart-icon', 'click')
    @emitCustomEventThis('navigate', { attributeName: 'on-navigate' })
    onCartClick() {
      return { path: '/cart' };
    }

    connectedCallback() {
      this.updateCartCount();
    }

    disconnectedCallback() {
      if (this.#cartUnsubscribe) {
        this.#cartUnsubscribe.unsubscribe();
      }
    }

    @onConnected({useShadow: true})
    render() {
      return `
        <style>
          * { box-sizing: border-box; }
          :host {
            display: block;
            background: white;
            border-bottom: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
            box-sizing: border-box;
          }

          nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin: 0 auto;
            padding: 0 40px;
            height: 70px;
            font-weight: 500;
          }

          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #1976d2;
            cursor: pointer;
            user-select: none;
          }

          .nav-center {
            display: flex;
            gap: 30px;
            flex: 1;
            justify-content: center;
          }

          nav a {
            color: #333;
            text-decoration: none;
            font-size: 15px;
            transition: color 0.3s;
            cursor: pointer;
          }

          nav a:hover {
            color: #1976d2;
          }

          .cart-section {
            display: flex;
            align-items: center;
            gap: 15px;
            position: relative;
          }

          .cart-icon {
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .cart-icon:hover {
            transform: scale(1.1);
          }

          .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff5252;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            min-width: 20px;
          }

          @media (max-width: 768px) {
            nav {
              padding: 0 10px;
              height: 60px;
            }

            .logo {
              font-size: 20px;
            }

            .nav-center {
              gap: 15px;
              font-size: 14px;
            }
          }
        </style>
        <nav>
          <div class="logo">🛍️ Store</div>
          <div class="nav-center">
            <a id="home-link">Home</a>
            <a id="orders-link">My Orders</a>
          </div>
          <div class="cart-section">
            <span class="cart-icon" id="cart-icon">🛒</span>
            <span class="cart-count" id="cart-count">0</span>
          </div>
        </nav>
      `;
    }

    @applyNode('#cart-count', {position: 'replaceChildren'})
    updateCartCount() {
      const cartCount = this.#cartService?.getItemCount?.() || 0;
      return cartCount;
    }
  }

  return tagName;
};

