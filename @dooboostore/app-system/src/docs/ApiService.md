# ApiService Architecture Documentation

## Overview

The ApiService is a well-structured, extensible HTTP client implementation that follows a layered architecture pattern. It provides a robust foundation for making API calls with built-in support for JSON handling, error management, progress tracking, and alert notifications.

## Inheritance Hierarchy

The ApiService follows a clean inheritance chain that separates concerns effectively:

```
Fetcher → HttpFetcher → HttpJsonFetcher → ApiService
```

Each layer adds specific functionality while building on the previous layer:

1. **Fetcher**: Base abstract class for all fetching operations
2. **HttpFetcher**: Adds HTTP-specific functionality
3. **HttpJsonFetcher**: Adds JSON-specific functionality
4. **ApiService**: Adds application-specific functionality (alerts, interceptors, etc.)

## Key Components

### HttpFetcher

The `HttpFetcher` class provides the foundation for HTTP requests with the following features:

- Standard HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD)
- URL and query parameter handling
- Request timeout management
- Request and response interception points
- Error handling for non-OK responses

### HttpJsonFetcher

The `HttpJsonFetcher` extends `HttpFetcher` to add JSON-specific functionality:

- Automatic JSON content-type headers
- JSON body serialization
- JSON-specific HTTP methods (postJson, patchJson, putJson)
- JSON response parsing
- Custom error handling for JSON responses
- Transform options for response handling

### ApiService

The `ApiService` extends `HttpJsonFetcher` to add application-specific functionality:

- Alert notifications for progress, success, and errors
- Interceptor pattern for request/response modification
- Observable pattern for monitoring request lifecycle events
- Callback hooks for various stages of the request lifecycle
- Error handling with configurable console logging

## Design Patterns

The ApiService architecture leverages several design patterns:

1. **Inheritance**: Clear separation of concerns through a well-defined inheritance hierarchy
2. **Template Method**: Base classes define the skeleton of operations while subclasses override specific steps
3. **Observer Pattern**: Using RxJS Subject to broadcast request lifecycle events
4. **Interceptor Pattern**: Allowing modification of requests and responses
5. **Dependency Injection**: Services are injected rather than created directly

## Extensibility

The ApiService architecture is highly extensible:

- **Interceptors**: Custom interceptors can be added to modify requests and responses
- **Configuration Options**: Extensive configuration options for each request
- **Callbacks**: Hooks for various stages of the request lifecycle
- **Observable Events**: Subscription to request lifecycle events
- **Error Handling**: Customizable error handling and reporting

## Usage Example

```typescript
@Sim
class UserService {
  constructor(private apiService: ApiService) {}

  async getUser(id: string): Promise<User> {
    return this.apiService.get({
      target: `https://api.example.com/users/${id}`,
      config: {
        config: {
          title: 'Get User',
          alertProgress: true,
          alertErrorMsg: true
        }
      }
    });
  }

  async createUser(userData: UserData): Promise<User> {
    return this.apiService.postJson({
      target: 'https://api.example.com/users',
      config: {
        fetch: {
          body: userData
        },
        config: {
          title: 'Create User',
          alertProgress: true,
          alertSuccessMsg: true,
          alertErrorMsg: true
        }
      }
    });
  }
}
```

## Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Code Reusability**: Common functionality is implemented once and reused
3. **Consistency**: Standardized approach to API calls across the application
4. **Testability**: Clean architecture makes testing easier
5. **Maintainability**: Well-organized code is easier to understand and modify
6. **Extensibility**: Easy to extend with new functionality

## Technical Details

### ApiService Configuration Options

The `ApiService` provides extensive configuration options for each request:

```typescript
export namespace ApiService {
  export type AlertConfig = {
    title?: string;                 // Title for alert messages
    alertProgress?: boolean;        // Show progress alert
    alertSuccessMsg?: boolean;      // Show success alert
    alertErrorMsg?: boolean;        // Show error alert
    enableErrorConsole?: boolean;   // Log errors to console
  };

  export type CallBackConfig = {
    callBackProgress?: (config, pipe) => void;  // Called when request starts
    callBackSuccess?: (config, pipe) => void;   // Called on successful response
    callBackError?: (config, pipe, e?) => void; // Called on error
    callBackFinal?: (config, pipe, e?) => void; // Called when request completes
  };
}
```

### Lifecycle Methods

The `ApiService` implements several lifecycle methods that are called during the request process:

1. **before**: Called before the request is sent, sets up progress alerts
2. **afterSuccess**: Called after a successful response, shows success alerts
3. **error**: Called when an error occurs, shows error alerts
4. **finally**: Called when the request completes, cleans up resources

### Interceptor Pattern

The `ApiService` uses an interceptor pattern to allow modification of requests and responses:

```typescript
export interface ApiServiceInterceptor {
  afterProxyFetch?<T>(config: AfterProxyFetchParams<T>): Promise<Response>;
  beforeProxyFetch?<T>(config: BeforeProxyFetchParams<T>): Promise<BeforeProxyFetchParams<T>>;
  beforeProxyExecute?(config: BeforeProxyExecuteParams): Promise<BeforeProxyExecuteParams>;
}
```

Interceptors can be registered with the `SimstanceManager` and will be automatically applied to all requests.

### Observable Events

The `ApiService` exposes an observable that emits events during the request lifecycle:

```typescript
class ApiService {
  // Other properties and methods...

  get observable() {
    return this.subject.asObservable();
  }

  // More methods...
}
```

Events include:
- `beforeFetch`: Before the request is sent
- `afterFetch`: After the response is received
- `progress`: When the request starts
- `success`: When the request succeeds
- `error`: When an error occurs
- `final`: When the request completes

## Advanced Usage Patterns

### Error Handling

The ApiService provides multiple layers of error handling:

1. **HTTP-level errors**: Non-200 responses are caught and transformed into errors
2. **JSON parsing errors**: Invalid JSON responses are caught and reported
3. **Application-level errors**: Custom error handling through interceptors and callbacks

Example of custom error handling:

```typescript
apiService.get({
  target: 'https://api.example.com/data',
  errorTransform: async (error) => {
    // Custom error transformation
    if (error instanceof Response && error.status === 401) {
      // Handle unauthorized error
      authService.redirectToLogin();
    }
    return new CustomError('Failed to fetch data', error);
  }
});
```

### Request Cancellation

Requests can be cancelled using the standard `AbortController` mechanism:

```typescript
const abortController = new AbortController();

apiService.get({
  target: 'https://api.example.com/data',
  config: {
    fetch: {
      signal: abortController.signal
    }
  }
});

// Later, to cancel the request:
abortController.abort();
```

### Request Timeouts

The ApiService supports automatic request timeouts:

```typescript
apiService.get({
  target: 'https://api.example.com/data',
  config: {
    fetch: {
      timeout: 5000 // 5 seconds
    }
  }
});
```

### Batch Requests

For making multiple related requests, you can use the observable pattern:

```typescript
const subscription = apiService.observable.subscribe(event => {
  if (event.type === 'final') {
    // Process completed request
    console.log('Request completed:', event.config);
  }
});

// Make multiple requests
Promise.all([
  apiService.get({ target: 'https://api.example.com/users' }),
  apiService.get({ target: 'https://api.example.com/products' }),
  apiService.get({ target: 'https://api.example.com/orders' })
]);

// Don't forget to unsubscribe when done
subscription.unsubscribe();
```

### Best Practices

1. **Use Service Classes**: Create dedicated service classes for different API domains
2. **Consistent Error Handling**: Establish consistent error handling patterns
3. **Leverage Interceptors**: Use interceptors for cross-cutting concerns like authentication
4. **Type Safety**: Use TypeScript generics to ensure type safety in requests and responses
5. **Testing**: Mock the ApiService in tests to avoid actual network calls

## Conclusion

The ApiService architecture demonstrates excellent software design principles. It provides a robust, flexible foundation for making API calls while maintaining clean separation of concerns and high extensibility. The layered approach allows for easy understanding, maintenance, and extension of the codebase.

The combination of inheritance, interceptors, observables, and lifecycle hooks creates a powerful and flexible system for handling API requests in a consistent and maintainable way. By following the patterns and practices outlined in this document, developers can build reliable, maintainable API integrations that scale with their application's needs.
