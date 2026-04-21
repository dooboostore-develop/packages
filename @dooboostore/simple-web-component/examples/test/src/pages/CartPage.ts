import {addEventListener, applyNode, elementDefine, onConnected, onConnectedBefore} from '@dooboostore/simple-web-component';
import {Inject} from '@dooboostore/simple-boot';
import {SubscriptionLike} from '@dooboostore/core';
import {CartService} from '../services/CartService';
import {OrderService} from '../services/OrderService';

export default (w: Window) => {
  const tagName = 'swc-example-commerce-cart-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class CartPage extends w.HTMLElement {
    cartService?: CartService;
    orderService?: OrderService;
    subscription?: SubscriptionLike;
    cart: CartService.Cart = {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0
    };

    @onConnectedBefore
    setupCart(@Inject({ symbol: CartService.SYMBOL }) cartService: CartService, @Inject({ symbol: OrderService.SYMBOL }) orderService: OrderService) {
      this.cartService = cartService;
      this.orderService = orderService;

      // Load cart from storage
      // cartService.load().then(() => {
      // Subscribe to reactive store
      this.subscription = cartService.store.subscribe(cart => {
        this.cart = cart;
        this.updateUI();
      });
      // });
    }

    updateUI() {
      this.updateCartContent();
      this.updateItemCount();
    }

    @applyNode('.cart-content', { position: 'innerHtml' })
    updateCartContent() {
      return this.renderCart();
    }

    @applyNode('#cart-item-count', { position: 'innerHtml' })
    updateItemCount() {
      const count = this.cart.itemCount || 0;
      return `${count} ${count === 1 ? 'item' : 'items'} in cart`;
    }

    @addEventListener('.btn-quantity-decrease', 'click', { delegate: true, stopPropagation: true })
    onQuantityDecrease(event: Event) {
      const btn = event.target as HTMLElement;
      const productId = btn.getAttribute('data-product-id');
      if (productId && this.cartService) {
        const item = this.cart.items.find(i => i.productId === productId);
        if (item && item.quantity > 1) {
          this.cartService.updateQuantity(productId, item.quantity - 1);
        }
      }
    }

    @addEventListener('.btn-quantity-increase', 'click', { delegate: true, stopPropagation: true })
    onQuantityIncrease(event: Event) {
      const btn = event.target as HTMLElement;
      const productId = btn.getAttribute('data-product-id');
      if (productId && this.cartService) {
        const item = this.cart.items.find(i => i.productId === productId);
        if (item) {
          this.cartService.updateQuantity(productId, item.quantity + 1);
        }
      }
    }

    @addEventListener('.btn-remove-item', 'click', { delegate: true, stopPropagation: true })
    onRemoveItem(event: Event) {
      const btn = event.target as HTMLElement;
      const productId = btn.getAttribute('data-product-id');
      if (productId && this.cartService) {
        this.cartService.removeItem(productId);
      }
    }

    @addEventListener('.btn-clear-cart', 'click', { stopPropagation: true, delegate: true })
    // @emitCustomEventThis('cart-cleared', { bubbles: true })
    onClearCart() {
      if (this.cartService && confirm('Clear all items from cart?')) {
        this.cartService.clear();
        return {};
      }
    }

    @addEventListener('.btn-checkout', 'click', { stopPropagation: true, delegate: true })
    onCheckout() {
      if (!this.cartService || !this.orderService || this.cartService.isEmpty()) {
        return;
      }

      // Create order from cart
      const order = this.orderService.createOrder(this.cart.items, this.cart.subtotal, this.cart.tax, this.cart.total, {
        firstName: 'Customer',
        lastName: 'Name',
        email: 'customer@example.com',
        phone: '+1234567890',
        street: '123 Main St',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        country: 'Country'
      });

      // Clear cart after successful order
      this.cartService.clear();

      // You can add navigation here if needed
      console.log('[CartPage] Order created:', order.id);
    }

    renderCart(): string {
      if (!this.cart.items || this.cart.items.length === 0) {
        return `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <a href="/" class="btn btn-primary">Continue Shopping</a>
          </div>
        `;
      }

      return `
        <div class="cart-items">
          ${this.cart.items.map(item => this.renderCartItem(item)).join('')}
        </div>

        <div class="cart-summary">
          <div class="summary-section">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>$${this.cart.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (8%):</span>
              <span>$${this.cart.tax.toFixed(2)}</span>
            </div>
          </div>

          <div class="summary-row total">
            <span>Total:</span>
            <span>$${this.cart.total.toFixed(2)}</span>
          </div>

          <div class="cart-actions">
            <button class="btn btn-primary btn-checkout">Proceed to Checkout</button>
            <button class="btn btn-secondary btn-clear-cart">Clear Cart</button>
          </div>
        </div>
      `;
    }

    renderCartItem(item: any): string {
      const price = item.product?.price || 0;
      const itemTotal = (price * item.quantity).toFixed(2);

      return `
        <div class="cart-item">
          <div class="item-image">
            <img src="${item.product?.image || '/placeholder.png'}" alt="${item.product?.name || 'Product'}" />
          </div>

          <div class="item-details">
            <h4>${item.product?.name || 'Unknown Product'}</h4>
            <p class="item-sku">SKU: ${item.productId}</p>
            <p class="item-price">$${price.toFixed(2)}</p>
          </div>

          <div class="item-quantity">
            <button class="btn-quantity btn-quantity-decrease" data-product-id="${item.productId}" type="button">−</button>
            <input type="number" class="quantity-input" value="${item.quantity}" readonly />
            <button class="btn-quantity btn-quantity-increase" data-product-id="${item.productId}" type="button">+</button>
          </div>

          <div class="item-total">
            $${itemTotal}
          </div>

          <button class="btn btn-icon btn-remove-item" data-product-id="${item.productId}" type="button" title="Remove item">
            ×
          </button>
        </div>
      `;
    }

    @onConnected({ useShadow: true })
    render() {
      return `
        <style>
          * { box-sizing: border-box; }
          :host {
            display: block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .cart-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .cart-header {
            margin-bottom: 40px;
            color: white;
          }

          .cart-header h1 {
            margin: 0 0 10px;
            font-size: 36px;
            font-weight: 700;
          }

          .cart-header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
          }

          .cart-content {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 30px;
          }

          .cart-items {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .cart-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            display: grid;
            grid-template-columns: 120px 1fr auto auto auto;
            gap: 20px;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: box-shadow 0.3s ease;
          }

          .cart-item:hover {
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          }

          .item-image {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            background: #f5f5f5;
          }

          .item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .item-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .item-details h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .item-sku {
            font-size: 12px;
            color: #999;
            margin: 0;
          }

          .item-price {
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
            margin: 0;
          }

          .item-quantity {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f5f5f5;
            border-radius: 6px;
            padding: 6px;
          }

          .btn-quantity {
            width: 32px;
            height: 32px;
            border: none;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-quantity:hover {
            background: #667eea;
            color: white;
            transform: scale(1.05);
          }

          .quantity-input {
            width: 40px;
            text-align: center;
            border: none;
            background: transparent;
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }

          .item-total {
            font-weight: 700;
            font-size: 18px;
            color: #333;
            min-width: 80px;
            text-align: right;
          }

          .btn-remove-item {
            width: 36px;
            height: 36px;
            border: none;
            background: #ffebee;
            color: #dc3545;
            border-radius: 6px;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-remove-item:hover {
            background: #dc3545;
            color: white;
            transform: scale(1.05);
          }

          .cart-summary {
            background: white;
            border-radius: 12px;
            padding: 30px;
            height: fit-content;
            position: sticky;
            top: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .summary-section {
            margin-bottom: 20px;
          }

          .summary-section h3 {
            margin: 0 0 15px;
            font-size: 14px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 14px;
            color: #666;
            border-bottom: 1px solid #f0f0f0;
          }

          .summary-row.total {
            border: none;
            padding: 15px 0 0;
            margin-top: 15px;
            font-weight: 700;
            font-size: 18px;
            color: #333;
            border-top: 2px solid #667eea;
          }

          .cart-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 30px;
          }

          .empty-cart {
            grid-column: 1 / -1;
            text-align: center;
            padding: 80px 20px;
            background: white;
            border-radius: 12px;
          }

          .empty-cart-icon {
            font-size: 80px;
            margin-bottom: 20px;
            opacity: 0.3;
          }

          .empty-cart p {
            font-size: 20px;
            color: #999;
            margin: 0 0 20px;
          }

          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            width: 100%;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }

          .btn-secondary {
            background: #f0f0f0;
            color: #333;
          }

          .btn-secondary:hover {
            background: #e0e0e0;
          }

          @media (max-width: 768px) {
            :host {
              padding: 20px 10px;
            }

            .cart-header h1 {
              font-size: 28px;
            }

            .cart-content {
              grid-template-columns: 1fr;
            }

            .cart-item {
              grid-template-columns: 100px 1fr auto;
              gap: 15px;
            }

            .item-total,
            .btn-remove-item {
              display: none;
            }

            .item-quantity {
              order: 2;
              grid-column: 2;
              justify-self: end;
            }

            .cart-summary {
              position: static;
              margin-top: 20px;
            }
          }
        </style>

        <div class="cart-container">
          <div class="cart-header">
            <h1>🛒 Shopping Cart</h1>
            <p id="cart-item-count">0 items in cart</p>
          </div>

          <div class="cart-content">
          </div>
        </div>
      `;
    }

    disconnectedCallback() {
      this.subscription?.unsubscribe();
    }
  }
  return tagName;
};
