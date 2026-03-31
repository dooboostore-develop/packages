import { CartService } from './CartService';
import { Sim } from '@dooboostore/simple-boot';
import { BehaviorSubject, ConstructorType} from '@dooboostore/core';
import ShippingAddress = OrderService.ShippingAddress;

export namespace OrderService {
 export const SYMBOL = Symbol.for('OrderService');

  /**
   * Order model
   */
  export interface Order {
    id: string;
    items: CartService.CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    createdAt: Date;
    shippingAddress: ShippingAddress;
  }

  /**
   * Shipping address
   */
  export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
}

export interface OrderService {
  createOrder(
    items: CartService.CartItem[],
    subtotal: number,
    tax: number,
    total: number,
    shippingAddress: ShippingAddress
  ): OrderService.Order;
  getOrders(): OrderService.Order[];
  getOrderById(id: string): OrderService.Order | undefined;
  store: BehaviorSubject<OrderService.Order[]>;
}


export default (container: symbol): ConstructorType<any> => {
/**
 * Order Service - Manages order creation and history
 */
  @Sim({symbol: OrderService.SYMBOL, container: container})
   class OrderServiceImp {
    private orders: OrderService.Order[] = [];
    readonly store = new BehaviorSubject<OrderService.Order[]>([]);
    private readonly ORDERS_STORAGE_KEY = 'commerce-app-orders';

    constructor() {
      this.load();
    }
    async load(): Promise<void> {
      try {
        const stored = localStorage.getItem(this.ORDERS_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          this.orders = data.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt)
          })) || [];
          console.log('[OrderService] Loaded', this.orders.length, 'orders');
          this.store.next([...this.orders]);
        }
      } catch (error) {
        console.error('[OrderService] Failed to load from storage:', error);
      }
    }

    private save(): void {
      try {
        localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
        this.store.next([...this.orders]);
      } catch (error) {
        console.error('[OrderService] Failed to save to storage:', error);
      }
    }

    private generateOrderId(): string {
      return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    createOrder(
      items: CartService.CartItem[],
      subtotal: number,
      tax: number,
      total: number,
      shippingAddress: ShippingAddress
    ): OrderService.Order {
      const order: OrderService.Order = {
        id: this.generateOrderId(),
        items: [...items],
        subtotal,
        tax,
        total,
        status: 'pending',
        createdAt: new Date(),
        shippingAddress
      };

      this.orders.unshift(order);
      this.save();
      console.log('[OrderService] Created order:', order.id);

      // Simulate order processing
      setTimeout(() => {
        this.updateOrderStatus(order.id, 'processing');
      }, 3000);

      setTimeout(() => {
        this.updateOrderStatus(order.id, 'shipped');
      }, 8000);

      return order;
    }

    getOrders(): OrderService.Order[] {
      return [...this.orders];
    }

    getOrderById(id: string): OrderService.Order | undefined {
      return this.orders.find(order => order.id === id);
    }

    updateOrderStatus(orderId: string, status: OrderService.Order['status']): void {
      const order = this.getOrderById(orderId);
      if (order) {
        order.status = status;
        this.save();
        console.log('[OrderService] Updated order status:', orderId, '->', status);
      }
    }

    cancelOrder(orderId: string): boolean {
      const order = this.getOrderById(orderId);
      if (order && order.status === 'pending') {
        order.status = 'pending'; // Mark as cancelled (can add cancelled status if needed)
        this.save();
        console.log('[OrderService] Cancelled order:', orderId);
        return true;
      }
      return false;
    }

    getRecentOrders(limit: number = 5): OrderService.Order[] {
      return this.orders.slice(0, limit);
    }

    getTotalOrders(): number {
      return this.orders.length;
    }

    getTotalRevenue(): number {
      return this.orders.reduce((sum, order) => sum + order.total, 0);
    }
  }
return OrderServiceImp;
}