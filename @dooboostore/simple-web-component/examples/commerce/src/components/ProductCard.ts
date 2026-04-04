import { onConnectedSwcApp,elementDefine, onInitialize, onConnectedInnerHtml, addEventListener, attributeHost, emitCustomEventHost, changedAttributeHost, onAfterConnected } from '@dooboostore/simple-web-component';
import { ProductService} from '../services/ProductService';
import {applyNodeHost} from "../../../../src";
import {Inject} from "@dooboostore/simple-boot";

/**
 * Product Card Component Factory - Displays a single product
 */
export default (w: Window) => {
  const tagName = 'swc-example-commerce-product-card';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class ProductCard extends w.HTMLElement {
    #product?: ProductService.Product;
    #productService?: ProductService;

    @attributeHost('data-product-id')
    productId: string

    @onConnectedSwcApp
    ttt(@Inject({ symbol: ProductService.SYMBOL }) productService: ProductService) {
      this.#productService = productService;
      this.onProductIdChanged(this.productId, null, null, null);
    }

    @changedAttributeHost('data-product-id')
    @applyNodeHost({ position: 'innerHtml' })
    async onProductIdChanged(productId: string, h: any, a: any, b: any) {
      if (!productId || !this.#productService) return;
      this.#product = (await this.#productService.getProductById(productId)) || undefined;
      return this.#getTemplate();
    }

    #getTemplate(): string {
      if (!this.#product) return '';
      const p = this.#product;
      const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

      return `
      <style>
        :host {
          display: block;
        }

        .card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card:hover {
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          transform: translateY(-4px);
        }

        .image {
          height: 200px;
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
        }

        .image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff5252;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          z-index: 10;
        }

        .content {
          padding: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #333;
          min-height: 40px;
          line-height: 1.3;
        }

        .category {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
        }

        .price-section {
          margin: 8px 0;
          margin-bottom: auto;
        }

        .price {
          font-size: 20px;
          font-weight: 700;
          color: #1976d2;
        }

        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
          margin-left: 8px;
        }

        .rating {
          font-size: 12px;
          color: #ffb300;
          margin-top: 8px;
        }

        .stock {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .stock.low {
          color: #ff6b6b;
          font-weight: bold;
        }

        .btn-add-cart {
          background: #1976d2;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 12px;
          transition: background 0.3s;
        }

        .btn-add-cart:hover {
          background: #1565c0;
        }

        .btn-add-cart:active {
          transform: scale(0.98);
        }
      </style>

      <div class="card">
        <div class="image">
          <img src="${p.image}" alt="${p.name}">
          ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
        </div>
        <div class="content">
          <div class="category">${p.category}</div>
          <div class="name">${p.name}</div>
          <div class="price-section">
            <span class="price">$${p.price.toFixed(2)}</span>
            ${p.originalPrice ? `<span class="original-price">$${p.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <div class="rating">⭐ ${p.rating} (${p.reviews} reviews)</div>
          <div class="stock ${p.stock < 5 ? 'low' : ''}">
            ${p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
          </div>
          <button class="btn-add-cart" ${p.stock > 0 ? '' : 'disabled'}>
            Add to Cart
          </button>
        </div>
      </div>
    `;
    }

    // @onConnectedInnerHtml
    // render() {
    //   return this.#getTemplate();
    // }

    @addEventListener('.card', 'click', { delegate: true })
    @emitCustomEventHost('view-product', { bubbles: true, attributeName: 'on-view-product' })
    onCardClick(event: Event) {
      console.log('vv');
      return { productId: this.#product?.id };
    }

    @addEventListener('.btn-add-cart', 'click', { stopPropagation: true, delegate: true })
    @emitCustomEventHost('add-to-cart', { bubbles: true, attributeName: 'on-add-to-cart' })
    onAddToCart(event: Event) {
      return { product: this.#product };
    }

    // setProduct(product: Product): void {
    //   this.#product = product;
    //   this.innerHTML = this.#getTemplate();
    // }
  }

  return tagName;
};
