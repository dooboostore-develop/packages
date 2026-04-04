import { onConnectedSwcApp, parentHost, removeStyleHost, setAttributeHost, queryHost, queryAllHost, emitCustomEventHost, changedAttributeHost, toggleClassHost, applyNodeHost, attributeHost, applyNode, elementDefine, onConnectedInnerHtml, onInitialize } from '@dooboostore/simple-web-component';
import {Inject} from '@dooboostore/simple-boot';
import { SubscriptionLike } from '@dooboostore/core';
import { OrderService } from '../services/OrderService';
import {ProductService} from "../services/ProductService";
import {CartService} from "../services/CartService";

export default (w: Window) => {
  const tagName = 'swc-example-commerce-orders-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class OrdersPage extends w.HTMLElement {
    orders: OrderService.Order[] = [];
    subscription?: SubscriptionLike;
    private productService: ProductService;
    private cartService: CartService;
    private orderService: OrderService;

    @attributeHost
    ra: string = '2';

    @onConnectedSwcApp
    onconstructor(@Inject({ symbol: ProductService.SYMBOL }) productService: ProductService, @Inject({ symbol: CartService.SYMBOL }) cartService: CartService, @Inject({ symbol: OrderService.SYMBOL }) orderService: OrderService) {
      this.productService = productService;
      this.cartService = cartService;
      this.orderService = orderService;
    }

    setupOrders() {
      // Load orders from storage
      // orderService.load().then(() => {
      // Subscribe to reactive store
      this.subscription = this.orderService.store.subscribe(orders => {
        this.orders = orders;
        this.updateUI();
      });
      // });
    }

    // @changedAttributeHost('')
    // test(){
    //
    // }
    // @queryHost
    // @queryAllHost
    // @parentHost
    // testzzs: HTMLElement | undefined;
    //
    // @setAttributeHost('vv')
    // testsvvs(){
    // }
    // @emitCustomEventHost('vv')
    // testss(){
    //
    // }
    // @applyNodeHost
    // test(){
    // }

    @applyNode('.orders-list', { position: 'innerHtml' })
    updateUI() {
      return this.renderOrders();
    }

    renderOrders(): string {
      if (!this.orders || this.orders.length === 0) {
        return `
          <div class="empty-state">
            <p>No orders yet</p>
            <a href="/" class="btn btn-primary">Continue Shopping</a>
          </div>
        `;
      }

      return this.orders.map(order => this.renderOrderCard(order)).join('');
    }

    renderOrderCard(order: OrderService.Order): string {
      const statusClass = `status-${order.status}`;
      const itemCount = order.items.length;
      const createdDate = new Date(order.createdAt).toLocaleDateString();

      return `
        <div class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #${order.id}</h3>
              <p class="order-date">${createdDate}</p>
            </div>
            <div class="order-status ${statusClass}">
              ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
          
          <div class="order-items">
            <h4>${itemCount} item${itemCount !== 1 ? 's' : ''}</h4>
            <ul>
              ${order.items
                .map(
                  item => `
                <li class="item">
                  <span class="item-name">${item.product?.name || 'Unknown'}</span>
                  <span class="item-qty">x${item.quantity}</span>
                  <span class="item-price">$${(item.product?.price || 0).toFixed(2)}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>

          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>$${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>$${order.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>$${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="order-shipping">
            <h4>Shipping To</h4>
            <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            <p>${order.shippingAddress.country}</p>
          </div>

          <div class="order-actions">
            <button class="btn btn-secondary btn-track" data-order-id="${order.id}">Track Order</button>
            ${order.status === 'pending' ? `<button class="btn btn-danger btn-cancel" data-order-id="${order.id}">Cancel Order</button>` : ''}
          </div>
        </div>
      `;
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
        <style>
          * { box-sizing: border-box; }
          :host {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            display: block;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .orders-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .orders-header {
            margin-bottom: 40px;
            animation: slideDown 0.5s ease;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .orders-header h1 {
            margin: 0;
            font-size: 36px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .orders-header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 8px 0 0;
            font-size: 16px;
          }

          .orders-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .order-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: fadeIn 0.5s ease;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .order-card:hover {
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f0f0f0;
          }

          .order-info h3 {
            margin: 0 0 6px;
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
          }

          .order-date {
            margin: 0;
            color: #888;
            font-size: 14px;
          }

          .order-status {
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-pending {
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            color: #856404;
          }

          .status-processing {
            background: linear-gradient(135deg, #d1ecf1, #bee5eb);
            color: #0c5460;
          }

          .status-shipped {
            background: linear-gradient(135deg, #cfe2ff, #b6d4fe);
            color: #084298;
          }

          .status-delivered {
            background: linear-gradient(135deg, #d1e7dd, #badbcc);
            color: #0f5132;
          }

          .order-items {
            margin-bottom: 24px;
          }

          .order-items h4 {
            margin: 0 0 12px;
            font-size: 14px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .order-items ul {
            list-style: none;
            padding: 0;
            margin: 0;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px;
          }

          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            font-size: 14px;
            color: #555;
          }

          .item:not(:last-child) {
            border-bottom: 1px solid #e9ecef;
          }

          .item-name {
            flex: 1;
            font-weight: 500;
          }

          .item-qty {
            margin: 0 16px;
            color: #999;
            min-width: 40px;
            text-align: center;
          }

          .item-price {
            font-weight: 600;
            color: #667eea;
            min-width: 60px;
            text-align: right;
          }

          .order-summary {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
            color: #555;
          }

          .summary-row.total {
            border-top: 2px solid #ddd;
            padding-top: 12px;
            margin-top: 12px;
            font-weight: 700;
            color: #1a1a1a;
            font-size: 16px;
          }

          .order-shipping {
            margin-bottom: 24px;
            padding: 16px;
            background: #ffffff;
            border-left: 4px solid #667eea;
            border-radius: 4px;
          }

          .order-shipping h4 {
            margin: 0 0 12px;
            font-size: 13px;
            color: #667eea;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .order-shipping p {
            margin: 4px 0;
            font-size: 13px;
            color: #555;
            line-height: 1.5;
          }

          .order-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .btn {
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .btn-secondary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
          }

          .btn-secondary:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transform: translateY(-2px);
          }

          .btn-danger {
            background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
            color: white;
          }

          .btn-danger:hover {
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
            transform: translateY(-2px);
          }

          .empty-state {
            text-align: center;
            padding: 80px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .empty-state p {
            font-size: 18px;
            color: #666;
            margin-bottom: 24px;
          }

          .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 28px;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s ease;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .btn-primary:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transform: translateY(-2px);
          }

          @media (max-width: 768px) {
            :host {
              padding: 20px 16px;
            }

            .orders-header h1 {
              font-size: 28px;
            }

            .order-card {
              padding: 16px;
            }

            .order-header {
              flex-direction: column;
              gap: 12px;
            }

            .order-actions {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        </style>

        <div class="orders-container">
          <div class="orders-header">
            <h1>📋 My Orders</h1>
            <p>Track and manage your purchases</p>
          </div>
          <div class="orders-list">
            ${this.renderOrders()}
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
