import { Sim } from '@dooboostore/simple-boot';
import {ConstructorType} from "@dooboostore/core";

export namespace ProductService {
  export const SYMBOL = Symbol('ProductService');
  /**
 * Product domain model
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}


export const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://picsum.photos/300/300?random=1',
    category: 'Electronics',
    stock: 15,
    rating: 4.8,
    reviews: 342
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Advanced fitness tracker with heart rate monitor and sleep tracking',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://picsum.photos/300/300?random=2',
    category: 'Electronics',
    stock: 8,
    rating: 4.6,
    reviews: 256
  },
  {
    id: '3',
    name: 'USB-C Cable',
    description: 'Durable 2-meter USB-C charging cable with fast charging support',
    price: 12.99,
    image: 'https://picsum.photos/300/300?random=3',
    category: 'Accessories',
    stock: 100,
    rating: 4.9,
    reviews: 1245
  },
  {
    id: '4',
    name: 'Portable Power Bank',
    description: '20000mAh portable power bank with dual USB ports',
    price: 34.99,
    originalPrice: 49.99,
    image: 'https://picsum.photos/300/300?random=4',
    category: 'Accessories',
    stock: 42,
    rating: 4.7,
    reviews: 678
  },
  {
    id: '5',
    name: 'Phone Stand',
    description: 'Adjustable aluminum phone stand for desk, compatible with all phones',
    price: 19.99,
    image: 'https://picsum.photos/300/300?random=5',
    category: 'Accessories',
    stock: 67,
    rating: 4.5,
    reviews: 156
  },
  {
    id: '6',
    name: 'Webcam HD',
    description: '1080p HD webcam with auto-focus and built-in microphone',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://picsum.photos/300/300?random=6',
    category: 'Electronics',
    stock: 23,
    rating: 4.6,
    reviews: 412
  },
  {
    id: '7',
    name: 'Mouse Pad XXL',
    description: 'Large gaming mouse pad with non-slip base, 80x40cm',
    price: 24.99,
    image: 'https://picsum.photos/300/300?random=7',
    category: 'Accessories',
    stock: 55,
    rating: 4.8,
    reviews: 289
  },
  {
    id: '8',
    name: 'Keyboard RGB',
    description: 'Mechanical RGB gaming keyboard with customizable switches',
    price: 149.99,
    originalPrice: 199.99,
    image: 'https://picsum.photos/300/300?random=8',
    category: 'Electronics',
    stock: 19,
    rating: 4.9,
    reviews: 567
  },
  {
    id: '9',
    name: 'Screen Protector Pack',
    description: 'Tempered glass screen protector set, 3 pcs for maximum protection',
    price: 14.99,
    image: 'https://picsum.photos/300/300?random=9',
    category: 'Accessories',
    stock: 200,
    rating: 4.7,
    reviews: 892
  },
  {
    id: '10',
    name: 'Monitor Stand',
    description: 'Adjustable monitor stand with storage drawer, supports up to 30 inches',
    price: 59.99,
    originalPrice: 89.99,
    image: 'https://picsum.photos/300/300?random=10',
    category: 'Electronics',
    stock: 12,
    rating: 4.8,
    reviews: 334
  }
];
}
export interface ProductService{
  getProducts(): Promise<ProductService.Product[]>;
  searchProducts(query: string): Promise<ProductService.Product[]>;
  getProductById(id: string): Promise<ProductService.Product | null>;
  getProductsByCategory(category: string): Promise<ProductService.Product[]>;
  getCategories(): string[];
  getAll(): ProductService.Product[];
  checkStock(productId: string, quantity: number): Promise<boolean>;
}


export default (container: symbol): ConstructorType<any> => {
  // console.log('---->?', container)
  @Sim({symbol: ProductService.SYMBOL, container: container})
  class ProductServiceImp implements ProductService{
    private products: ProductService.Product[] = ProductService.dummyProducts;


    async getProducts(): Promise<ProductService.Product[]> {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.products);
        }, 50);
      });
    }

    async searchProducts(query: string): Promise<ProductService.Product[]> {
      const lowerQuery = query.toLowerCase();
      return new Promise(resolve => {
        setTimeout(() => {
          const results = this.products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
          );
          resolve(results);
        }, 100);
      });
    }

    async getProductById(id: string): Promise<ProductService.Product | null> {
      return new Promise(resolve => {
        setTimeout(() => {
          const product = this.products.find(p => p.id === id);
          resolve(product || null);
        }, 50);
      });
    }

    async getProductsByCategory(category: string): Promise<ProductService.Product[]> {
      return new Promise(resolve => {
        setTimeout(() => {
          const results = this.products.filter(p => p.category === category);
          resolve(results);
        }, 50);
      });
    }

    getCategories(): string[] {
      return [...new Set(this.products.map(p => p.category))];
    }

    getAll(): ProductService.Product[] {
      return [...this.products];
    }

    async checkStock(productId: string, quantity: number): Promise<boolean> {
      const product = await this.getProductById(productId);
      return product ? product.stock >= quantity : false;
    }
  }
  return ProductServiceImp;
}