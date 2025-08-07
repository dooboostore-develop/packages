# Appendix: Going Further

So far, we have implemented a powerful and flexible `ApiService`. However, in a real production environment, more complex requirements exist. This appendix briefly introduces some advanced topics that can further enhance the `ApiService`.

## A.1. Caching Strategy

When the same GET request occurs repeatedly within a short period, reusing a previously received response instead of sending an actual network request can significantly improve performance and reduce server load.

### Caching at the HTTP Layer: `CacheInterceptor`

-   **Implementation Idea**: Create a new interceptor and use the `beforeProxyFetch` hook.
-   **Generate Cache Key**: Combine the request URL and parameters to create a unique cache key.
-   **Check Cache**: In `beforeProxyFetch`, check if there is a cache corresponding to the request.
    -   **If Cache Exists**: Instead of calling the actual `fetch`, clone (`clone()`) the cached `Response` object and return it immediately. This completely bypasses the network request.
    -   **If Cache is Absent**: Proceed with the actual `fetch` request as usual.
-   **Store Cache**: In the `afterProxyFetch` hook, store the response of a successful GET request in the cache. At this point, the `Response` object can only be read once, so it must be cloned (`clone()`) before storing.
-   **Cache Storage**: For simplicity, an in-memory cache using a `Map` object can be used, or `sessionStorage` or `localStorage` can be utilized to implement browser session or persistent caching.

### Caching at the Service Layer: Utilizing the `@Cache` Decorator

While a `CacheInterceptor` operates at the HTTP request/response level, the `@Cache` decorator provided by the `simple-boot` framework allows you to easily implement caching at the method level in your service layer. This approach involves caching the service method that calls the `ApiService` itself.

- **How it works**: A method decorated with `@Cache` will have its result cached upon its first execution. Subsequent calls with the same arguments will return the cached result immediately, without executing the method logic (including the API call) again.
- **Advantages**: This is very simple to implement and can be more effective as it allows caching of the final, processed data, not just the raw API response.
- **Usage**: Simply add the `@Cache` decorator above the service method you wish to cache. It offers various options, such as dynamic cache key generation and time-to-live (TTL).

```typescript
// Example in PostService.ts

import { Cache } from '@dooboostore/simple-boot';

@Sim
export class PostService {
    constructor(private apiService: ApiService) {}

    // Apply cache with a 5-minute TTL
    @Cache({ ms: 300000 })
    getPosts() {
        console.log('Fetching posts from server...'); // This log won't appear on re-calls within 5 mins
        return this.apiService.get<Post[]>('/posts', {
            config: { title: 'Fetch Post List' }
        });
    }

    // Generate a dynamic cache key based on the user ID
    @Cache({ key: (id: number) => `post:${id}`, ms: 60000 })
    getPost(id: number) {
        console.log(`Fetching post ${id} from server...`);
        return this.apiService.get<Post>(`/posts/${id}`, {
            config: { title: `Fetch Post #${id}` }
        });
    }
}
```
These two methods (`CacheInterceptor` and the `@Cache` decorator) are complementary and can be chosen or combined to best fit the characteristics and requirements of your application.

## A.2. Request Cancellation

`ApiService` supports canceling ongoing network requests using an `AbortController`. When a user leaves a page or enters a new search term, making a previous request no longer necessary, you can cancel the request to prevent unnecessary resource waste.

### Implementation and Usage

When calling `ApiService` methods like `get` or `post`, you can provide a `signal` property, which is part of the standard `RequestInit` object for the `fetch` API.

1.  **Create `AbortController`**: The party that wants to control the request creates an instance of `AbortController`.
2.  **Pass `signal`**: When calling an `apiService` method, pass `controller.signal` as the `signal` property in the `config` object. `HttpJsonFetcher` will automatically pass this `signal` to the internal `fetch` call.
3.  **Cancel Request**: Call the `controller.abort()` method when you want to cancel.

When `abort()` is called, the `fetch` request is aborted, and a `DOMException` named `AbortError` is thrown. It is common practice to catch this specific error in the `ApiService`'s `error` hook and handle it by silently ignoring it, without showing a separate error message to the user.

### Code Example

```typescript
// A component or service that controls the request
class MyComponent {
    private controller = new AbortController();

    constructor(private apiService: ApiService) {}

    fetchData() {
        // Abort the previous request if it exists
        this.controller.abort();
        // Create a new AbortController for the new request
        this.controller = new AbortController();

        this.apiService.get('/some/data', {
            signal: this.controller.signal, // Pass the signal
            config: {
                title: 'Fetch Data'
            }
        }).catch(error => {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error('Fetch error:', error);
            }
        });
    }

    cleanup() {
        // Cancel any ongoing request when the component is destroyed
        this.controller.abort();
    }
}
```

## A.3. Handling Files and Binary Data

As its name suggests, `HttpJsonFetcher` is optimized for JSON processing, but it already has mechanisms to flexibly handle other data types like `FormData` or `Blob`.

### File Upload (`FormData`)

If the request `body` is an instance of `FormData`, `HttpJsonFetcher` automatically detects it and passes it directly to `fetch` without applying `JSON.stringify`. Therefore, file uploads are very simple.

-   Create a `FormData` object and append `File` objects and other data.
-   Simply pass the created `FormData` object as the `body` of the `post` or `put` method.
-   There is no need to manually set the `Content-Type` header. The browser automatically adds the correct `multipart/form-data` header and `boundary` based on the `FormData`.

```typescript
// Example of file upload using FormData
const formData = new FormData();
formData.append('profileImage', fileInput.files[0]);
formData.append('userName', 'John Doe');

apiService.post('/users/profile', {
    body: formData, // Pass FormData directly
    config: {
        title: 'Upload Profile Image'
    }
});
```

### File Download and Binary Response Handling

By default, `HttpJsonFetcher` attempts to parse all responses as JSON. To download binary data like images or PDF files, this behavior must be skipped. This is where the `bypassTransform` setting comes in.

-   Adding `bypassTransform: true` to the request `config` will make `HttpJsonFetcher` return the raw `Response` object directly without attempting JSON parsing.
-   You can then directly call methods like `.blob()`, `.arrayBuffer()`, or `.text()` on the returned `Response` object to process the data in the desired format.

```typescript
// Example of image download using bypassTransform
async function downloadImage() {
    const response = await apiService.get('/images/profile.png', {
        bypassTransform: true, // Skip JSON parsing
        config: {
            title: 'Download Image'
        }
    });

    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    // Now imageUrl can be used as the src for an <img> tag.
}
```

## A.4. Advanced Error Handling

Interceptors allow for very effective implementation of global error handling logic.

### Implementation Ideas

-   **Implement `ErrorInterceptor`**: Create a new interceptor that uses the `afterProxyFetch` hook.
-   **Check Response Status Code**: Check `response.status` to branch based on specific error codes.
    -   **401 (Unauthorized)**: This likely indicates an expired authentication token. You can implement logic to call a token refresh API, and if successful, retry the originally failed request with the new token. If multiple requests receive a 401 error simultaneously, a lock mechanism is also needed to ensure token refresh happens only once.
    -   **403 (Forbidden)**: Display a "permission denied" notification or redirect to a specific page.
    -   **5xx (Server Error)**: Display a common error message like "A temporary server issue has occurred" and send logs to an error reporting service (e.g., Sentry).
