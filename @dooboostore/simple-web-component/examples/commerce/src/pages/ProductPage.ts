import { elementDefine, onConnectedInnerHtml, onInitialize, addEventListener, attributeHost } from '@dooboostore/simple-web-component';
import {Inject} from '@dooboostore/simple-boot';
import { ProductService  } from '../services/ProductService';
import { CartService } from '../services/CartService';
import { OrderService } from '../services/OrderService';

export default (w: Window) => {
  const tagName = 'swc-example-commerce-product-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @elementDefine(tagName, { window: w })
  class ProductPage extends w.HTMLElement {
    product: ProductService.Product | null = null;
    quantity: number = 1;
    
    @attributeHost('product-id')
    productId: string = '';
    
    private productService: ProductService;
    private cartService: CartService;
    private orderService: OrderService;

    @onInitialize
    onconstructor(
      @Inject({symbol: ProductService.SYMBOL})productService: ProductService,
      @Inject({symbol: CartService.SYMBOL})cartService: CartService,
      @Inject({symbol: OrderService.SYMBOL})orderService: OrderService,
    ) {
      this.productService = productService;
      this.cartService = cartService;
      this.orderService = orderService;
      
      // Load product if productId attribute is set
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    }



    async loadProduct(productId: string) {
      console.log('loadProduct called');
      // Get product ID from localStorage (set by router)
      // const productId = localStorage.getItem('selectedProductId') || this.productId;
      console.log('productId:', productId);
      if (productId) {
        this.product = await this.productService.getProductById(productId);
        console.log('product loaded:', this.product?.name);
        // Re-render when product is loaded
        setTimeout(() => this.rerender(), 0);
      }
    }

    rerender() {
      console.log('rerender called, product:', this.product?.name);
      const newContent = this.render();
      this.innerHTML = newContent;
      console.log('innerHTML set, attaching listeners');
      this.attachEventListeners();
    }

    attachEventListeners() {
      console.log('attachEventListeners called');
      const qtyInput = this.querySelector('.quantity-input') as HTMLInputElement;
      console.log('qtyInput:', qtyInput);
      if (qtyInput) {
        qtyInput.addEventListener('change', (e) => {
          this.quantity = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1);
        });
      }

      const addBtn = this.querySelector('.add-to-cart-btn') as HTMLButtonElement;
      console.log('addBtn:', addBtn);
      if (addBtn) {
        console.log('Adding click listener to addBtn');
        addBtn.addEventListener('click', () => {
          console.log('Button clicked!');
          this.addToCart();
        });
      }

      const backBtn = this.querySelector('.back-btn') as HTMLButtonElement;
      if (backBtn) {
        backBtn.addEventListener('click', () => window.history.back());
      }
    }

    addToCart() {
      if (this.product) {
        this.cartService.addItem(this.product, this.quantity);
        alert(`${this.product.name} x ${this.quantity} added to cart!`);
      }
    }

    @onConnectedInnerHtml
    render() {
      console.log('ProductPage render called, product:', this.product?.name);
      if (!this.product) {
        return `
          <div style="padding: 40px; text-align: center;">
            <p>Loading product...</p>
          </div>
        `;
      }

      const { name, image, price, originalPrice, description, category, stock, rating, reviews } = this.product;
      const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      return `
        <style>
          :host {
            display: block;
            background: #f5f5f5;
            min-height: 100vh;
          }

          .product-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .back-nav {
            margin-bottom: 20px;
          }

          .back-btn {
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
          }

          .back-btn:hover {
            background: #5568d3;
          }

          .product-detail {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            background: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 40px;
          }

          .product-image {
            background: #f9f9f9;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            height: 400px;
          }

          .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .product-info h1 {
            font-size: 32px;
            margin: 0 0 20px 0;
            color: #333;
          }

          .category-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 16px;
          }

          .price-section {
            margin: 24px 0;
          }

          .price-original {
            color: #999;
            text-decoration: line-through;
            font-size: 16px;
            margin-right: 12px;
          }

          .price-current {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
          }

          .discount-badge {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            margin-left: 12px;
          }

          .rating-section {
            margin: 20px 0;
            padding: 16px 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          }

          .rating-stars {
            font-size: 18px;
            color: #ffc107;
            margin-right: 12px;
          }

          .rating-text {
            color: #666;
            font-size: 14px;
          }

          .stock-status {
            margin: 16px 0;
            padding: 12px;
            background: #e8f5e9;
            border-radius: 6px;
            color: #2e7d32;
            font-weight: 500;
          }

          .description {
            margin: 24px 0;
            color: #666;
            line-height: 1.6;
            font-size: 16px;
          }

          .quantity-section {
            margin: 24px 0;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .quantity-label {
            font-weight: 500;
            color: #333;
          }

          .quantity-input {
            width: 80px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
          }

          .add-to-cart-btn {
            padding: 14px 32px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            width: 100%;
            margin-top: 24px;
          }

          .add-to-cart-btn:hover {
            background: #5568d3;
            transform: translateY(-2px);
          }

          .add-to-cart-btn:active {
            transform: translateY(0);
          }

          @media (max-width: 768px) {
            .product-detail {
              grid-template-columns: 1fr;
              gap: 24px;
            }

            .product-info h1 {
              font-size: 24px;
            }

            .price-current {
              font-size: 28px;
            }

            .product-image {
              height: 300px;
            }
          }
        </style>

        <div class="product-container">
          <div class="back-nav">
            <button class="back-btn">← Back to Products</button>
          </div>

          <div class="product-detail">
            <div class="product-image"><img src="${image}" alt="${name}"></div>
            
            <div class="product-info">
              <span class="category-badge">${category}</span>
              <h1>${name}</h1>

              <div class="price-section">
                ${originalPrice ? `<span class="price-original">$${originalPrice.toFixed(2)}</span>` : ''}
                <span class="price-current">$${price.toFixed(2)}</span>
                ${discount > 0 ? `<span class="discount-badge">-${discount}% OFF</span>` : ''}
              </div>

              <div class="rating-section">
                <span class="rating-stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}</span>
                <span class="rating-text">${rating} (${reviews} reviews)</span>
              </div>

              <div class="stock-status">
                ${stock > 0 ? `✓ In Stock (${stock} available)` : '✗ Out of Stock'}
              </div>

              <p class="description">${description}</p>

              <div class="quantity-section">
                <label class="quantity-label">Quantity:</label>
                <input type="number" class="quantity-input" value="1" min="1" max="${stock}">
              </div>

              <button class="add-to-cart-btn" ${stock === 0 ? 'disabled' : ''}>
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    }

    connectedCallback() {
      console.log('ProductPage connectedCallback');
      console.log('this.productService:', this.productService);
      console.log('this.cartService:', this.cartService);
    }

    disconnectedCallback() {
      console.log('ProductPage disconnectedCallback');
      this.product = null;
    }
  }
  return tagName;
};
