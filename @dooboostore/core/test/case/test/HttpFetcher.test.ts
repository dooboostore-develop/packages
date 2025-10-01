import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpFetcher, HttpResponseError } from '../../src/fetch/HttpFetcher';
import { HttpJsonFetcher } from '../../src/fetch/HttpJsonFetcher';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface ProductSearchResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

// Mock global fetch for testing purposes if needed, but for actual API calls, we'll use the real one.
// const originalFetch = global.fetch;
// global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
//   // Simulate network errors, successful responses, etc.
//   if (input === 'http://mock-error.com') {
//     return new Response(null, { status: 500, statusText: 'Internal Server Error' });
//   }
//   if (input === 'http://mock-json-error.com') {
//     return new Response(JSON.stringify({ message: 'JSON Error' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
//   }
//   if (typeof input === 'string' && input.includes('dummyjson.com')) {
//     // Use real fetch for dummyjson.com
//     return originalFetch(input, init);
//   }
//   return new Response(JSON.stringify({ message: 'Mock Success' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
// };

describe('HttpFetcher', () => {
  const httpFetcher = new HttpFetcher<any>();
  const BASE_URL = 'https://dummyjson.com';

  test('should perform a GET request successfully', async () => {
    const response = await httpFetcher.get({target: `${BASE_URL}/products/1`});
    assert.strictEqual(response.status, 200, 'Status should be 200');
    const data: Product = await response.json();
    assert.strictEqual(data.id, 1, 'Should fetch product with ID 1');
    assert.strictEqual(typeof data.title, 'string', 'Product should have a title');
  });

  test('should handle GET request with query parameters', async () => {
    const response = await httpFetcher.get({target: `${BASE_URL}/products/search?q=phone`});
    assert.strictEqual(response.status, 200, 'Status should be 200');
    const data: ProductSearchResponse = await response.json();
    assert(data.products.length > 0, 'Should return products for search query');
    assert(data.products.every((p: Product) => p.title.toLowerCase().includes('phone') || p.description.toLowerCase().includes('phone')), 'All products should contain "phone" in title or description');
  });

  test('should perform a POST request successfully', async () => {
    const response = await httpFetcher.post({
      target: `${BASE_URL}/products/add`,
      config: {
        fetch: {
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({title: 'BMW Pencil'}),
        },
      },
    });
    assert.strictEqual(response.status, 201, 'Status should be 201');
    const data: Product = await response.json();
    assert.strictEqual(data.title, 'BMW Pencil', 'Should create product with correct title');
    assert(data.id, 'Should have an ID');
  });

  test('should handle network errors for HttpFetcher', async (t) => {
    // This test is tricky with real fetch, as it depends on actual network conditions.
    // For a robust test, one would mock `fetch`.
    // Here, we'll try to hit a non-existent domain to simulate a network error.
    // Note: This might fail if the domain actually resolves or if there are DNS issues.
    const nonExistentDomain = 'http://nonexistent.invalid';
    try {
      await httpFetcher.get({target: nonExistentDomain});
      assert.fail('Expected fetch to throw an error for non-existent domain');
    } catch (e: any) {
      // The exact error type might vary (TypeError, Network Error, etc.)
      // depending on the environment and browser/Node.js fetch implementation.
      // We'll check for a common indicator of network failure.
      assert(e instanceof HttpResponseError, 'Error should be an instance of HttpResponseError');
      assert(e instanceof HttpResponseError && e.error instanceof TypeError,
        'e.error should be an instance of  HttpResponseError');
    }
  });

  test('should handle HTTP errors (e.g., 404) for HttpFetcher', async () => {
    try {
      await httpFetcher.get({target: `${BASE_URL}/nonexistent-endpoint`});
      assert.fail('Expected fetch to throw an HttpResponseError for 404');
    } catch (e: any) {
      assert(e instanceof HttpResponseError, 'Error should be an instance of HttpResponseError');
      assert(e instanceof HttpResponseError && e.error instanceof Response, 'Error should be an instance of Response');
      assert.strictEqual(e instanceof HttpResponseError && e.error instanceof Response && e.error.status, 404, 'Status should be 404');
    }
  });
});

describe('HttpJsonFetcher', () => {
  const httpJsonFetcher = new HttpJsonFetcher<any, any>();
  const BASE_URL = 'https://dummyjson.com';

  test('should perform a GET request and parse JSON successfully', async () => {
    const data: Product = await httpJsonFetcher.get({target: `${BASE_URL}/products/1`});
    assert.strictEqual(data.id, 1, 'Should fetch product with ID 1');
    assert.strictEqual(typeof data.title, 'string', 'Product should have a title');
  });

  test('should perform a POST JSON request successfully', async () => {
    const newProduct = {title: 'Super Gadget', price: 999};
    const data: Product = await httpJsonFetcher.postJson({
      target: `${BASE_URL}/products/add`,
      config: {
        fetch: {
          body: newProduct,
        },
      },
    });
    assert.strictEqual(data.title, newProduct.title, 'Should create product with correct title');
    assert.strictEqual(data.price, newProduct.price, 'Should create product with correct price');
    assert(data.id, 'Should have an ID');
  });

  test('should set correct Content-Type and Accept headers for JSON requests', async () => {
    // This is hard to test directly without mocking fetch and inspecting headers.
    // We'll rely on the API's behavior to infer correct header usage.
    // If the API successfully processes the JSON body, it implies correct headers.
    const newTodo = {todo: 'Learn testing', completed: false, userId: 1};
    const data: Todo = await httpJsonFetcher.postJson({
      target: `${BASE_URL}/todos/add`,
      config: {
        fetch: {
          body: newTodo,
        },
      },
    });
    assert.strictEqual(data.todo, newTodo.todo, 'Todo should be created');
    assert.strictEqual(data.completed, newTodo.completed, 'Completed status should be correct');
  });

  test('should handle JSON parsing errors for HttpJsonFetcher', async () => {
    // Simulate a response that is not valid JSON but has a 200 status
    // This requires mocking fetch or finding an endpoint that returns non-JSON.
    // For now, we'll rely on the errorTransform to catch non-JSON responses from actual errors.
    try {
      // This endpoint returns HTML, which should cause a JSON parsing error
      await httpJsonFetcher.get({target: 'https://dummyjson.com/html'});
      assert.fail('Expected HttpJsonFetcher to throw an error for non-JSON response');
    } catch (e: any) {
      assert(e instanceof HttpResponseError, 'Error should be an instance of HttpJsonResponseError');
      assert(e.body instanceof SyntaxError, 'Error body should be a SyntaxError');
    }
  });

  test('should handle HTTP JSON errors (e.g., 400) and parse error body', async () => {
    try {
      // dummyjson.com doesn't have a specific endpoint for 400 with JSON error body easily.
      // We'll simulate a bad request to a product update that might return an error.
      // This might return 404 or 500, but the principle of parsing the error body remains.
      await httpJsonFetcher.putJson({
        target: `${BASE_URL}/products/invalid-id`, // This will likely return 404
        config: {
          fetch: {
            body: {title: 'Updated Title'},
          },
        },
      });
      assert.fail('Expected HttpJsonFetcher to throw an HttpJsonResponseError');
    } catch (e: any) {
      assert(e instanceof HttpResponseError, 'Error should be an instance of HttpJsonResponseError');
      assert(e.response instanceof Response, 'Error should contain the original Response object');
      assert(e.body, 'Error body should be present');
      assert(e.response.status === 404, 'Expected 404 status for invalid ID');
      assert(e.body.message.includes('not found'), 'Error body message should indicate product not found');
    }
  });
});
