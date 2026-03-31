import { ProductService } from './ProductService';
import {Inject, Sim } from '@dooboostore/simple-boot';
import { BehaviorSubject, ConstructorType} from '@dooboostore/core';


export namespace CartService {
 export const SYMBOL = Symbol.for('CartService');
/**
 * Shopping cart item
 */
export interface CartItem {
  productId: string;
  product?: ProductService.Product;
  quantity: number;
  addedAt: Date;
}

/**
 * Shopping cart
 */
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}
}


export interface CartService {
  getCart(): CartService.Cart;
  addItem(product: ProductService.Product, quantity?: number): void;
  removeItem(productId: string): void;
  updateQuantity(productId: string, quantity: number): void;
  clear(): void;
  isEmpty(): boolean;
  getItemCount(): number;
  getItems(): CartService.CartItem[];
  load(): Promise<void>;
  store: BehaviorSubject<CartService.Cart>;
}

export default (container: symbol): ConstructorType<any> => {

  /**
   * Cart Service - Manages shopping cart operations
   */
  @Sim({symbol: CartService.SYMBOL, container})
  class CartServiceImp implements CartService {
    private cart: CartService.Cart = {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0
    };

    private readonly CART_STORAGE_KEY = 'commerce-app-cart';
    private readonly TAX_RATE = 0.08; // 8% tax

    // Store for reactive updates
    store = new BehaviorSubject<CartService.Cart>(this.cart);

    constructor(@Inject({symbol: ProductService.SYMBOL}) private productService: ProductService) {
      this.load();
    }

    async load(): Promise<void> {
      try {
        const stored = localStorage.getItem(this.CART_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          this.cart.items = (data.items || []).map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            addedAt: new Date(item.addedAt),
            product: item.product || this.productService.getProductById(item.productId)
          }));
          this.recalculate();
          console.log('[CartService] Loaded from storage');
        }
      } catch (error) {
        console.error('[CartService] Failed to load from storage:', error);
      }
    }

    private recalculate(): void {
      this.cart.subtotal = this.cart.items.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);
      this.cart.tax = Number((this.cart.subtotal * this.TAX_RATE).toFixed(2));
      this.cart.total = Number((this.cart.subtotal + this.cart.tax).toFixed(2));
      this.cart.itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      this.store.next({ ...this.cart });
      this.save();
    }

    private save(): void {
      try {
        const data = {
          items: this.cart.items.map(item => ({
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
            addedAt: item.addedAt?.toISOString?.()
          }))
        };
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('[CartService] Failed to save to storage:', error);
      }
    }

    getCart():CartService.Cart {
      return { ...this.cart };
    }

    addItem(product: ProductService.Product, quantity: number = 1): void {
      const existingItem = this.cart.items.find(item => item.productId === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.product = product;
      } else {
        this.cart.items.push({
          productId: product.id,
          product,
          quantity,
          addedAt: new Date()
        });
      }

      this.recalculate();
      console.log('[CartService] Added item:', product.name);
    }

    removeItem(productId: string): void {
      this.cart.items = this.cart.items.filter(item => item.productId !== productId);
      this.recalculate();
      console.log('[CartService] Removed item:', productId);
    }

    updateQuantity(productId: string, quantity: number): void {
      const item = this.cart.items.find(i => i.productId === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = quantity;
          this.recalculate();
          console.log('[CartService] Updated quantity for:', productId);
        }
      }
    }

    clear(): void {
      this.cart.items = [];
      this.recalculate();
      console.log('[CartService] Cart cleared');
    }

    isEmpty(): boolean {
      return this.cart.items.length === 0;
    }

    getItemCount(): number {
      return this.cart.itemCount;
    }

    getItems(): CartService.CartItem[] {
      return [...this.cart.items];
    }
  }
return CartServiceImp;
}