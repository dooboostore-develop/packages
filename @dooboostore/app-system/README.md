# @dooboostore/app-system

## Overview

@dooboostore/app-system is a comprehensive framework for building single-page applications (SPAs). It provides a collection of utilities, services, and components that work together to simplify the development of modern web applications.

## Key Components

### ApiService

The ApiService is a well-structured, extensible HTTP client implementation that follows a layered architecture pattern. It provides a robust foundation for making API calls with built-in support for JSON handling, error management, progress tracking, and alert notifications.

[Detailed ApiService Documentation](./docs/ApiService.md)

### Alert System

A flexible alert system for displaying notifications, errors, and other messages to users. It includes:

- AlertService: Service for managing alerts
- AlertFactory: Factory for creating different types of alerts
- Various alert implementations (console, UI-based, etc.)

### UI Components

A collection of reusable UI components for building user interfaces:

- Checkbox components
- Details/summary components
- Input field components
- Radio button components
- Select dropdown components
- Promise-based components for handling asynchronous operations

### Proxy System

Proxy functionality for intercepting and modifying API requests, enhancing the capabilities of the ApiService.

### Store

State management functionality for managing application state in a predictable and efficient way.

## Installation

```bash
npm install @dooboostore/app-system
```

## Usage

```typescript
import { ApiService } from '@dooboostore/app-system';

// Use ApiService to make HTTP requests
const apiService = new ApiService(simstanceManager, alertService);

// Example GET request
apiService.get({
  target: 'https://api.example.com/data',
  config: {
    config: {
      title: 'Fetch Data',
      alertProgress: true,
      alertErrorMsg: true
    }
  }
}).then(data => {
  console.log('Data received:', data);
}).catch(error => {
  console.error('Error fetching data:', error);
});
```

## Dependencies

This package depends on several other @dooboostore packages:

- @dooboostore/core
- @dooboostore/core-node
- @dooboostore/core-web
- @dooboostore/dom-render
- @dooboostore/simple-boot
- @dooboostore/simple-boot-front
- @dooboostore/simple-boot-http-server
- @dooboostore/simple-boot-http-server-ssr

## License

MIT