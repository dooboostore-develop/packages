import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Route, Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';

// Example 1: Basic router
@Sim
@Router({ path: '/user' })
class UserController {
  constructor() {
    console.log('  [UserController] Created');
  }

  @Route({ path: '/list' })
  listUsers() {
    console.log('  📋 [Route] /user/list - Listing all users');
    return { users: ['Alice', 'Bob', 'Charlie'] };
  }

  @Route({ path: '/get' })
  getUser(id: string) {
    console.log(`  👤 [Route] /user/get - Getting user: ${id}`);
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  }
}

// Example 2: Router with nested paths
@Sim
@Router({ path: '/product' })
class ProductController {
  constructor() {
    console.log('  [ProductController] Created');
  }

  @Route({ path: '/list' })
  listProducts() {
    console.log('  📦 [Route] /product/list - Listing all products');
    return { products: ['Product A', 'Product B', 'Product C'] };
  }

  @Route({ path: '/detail' })
  getProduct(id: string) {
    console.log(`  📦 [Route] /product/detail - Getting product: ${id}`);
    return { id, name: `Product ${id}`, price: 99.99 };
  }
}

export class RouteExample implements Runnable {
  async run() {
    console.log('\n�️  Router System Example\n');
    console.log('='.repeat(50));

    const app = new SimpleApplication().run();

    console.log('\n1️⃣  User Routes');
    const userController = app.sim(UserController);
    userController.listUsers();
    userController.getUser('42');

    console.log('\n2️⃣  Product Routes');
    const productController = app.sim(ProductController);
    productController.listProducts();
    productController.getProduct('abc-123');

    console.log('\n3️⃣  Accessing Routes via RouterManager');
    const routerManager = app.getRouterManager();
    console.log('  📍 Registered routes:');
    console.log('     - /user/list');
    console.log('     - /user/get');
    console.log('     - /product/list');
    console.log('     - /product/detail');

    console.log('\n' + '='.repeat(50));
    console.log('✨ Example completed!\n');
  }
}
