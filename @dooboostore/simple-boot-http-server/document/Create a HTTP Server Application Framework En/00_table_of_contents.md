# 📖 Simple-Boot-HTTP-Server: Designing and Implementing a Node.js Web Server Framework

## [Preface: Why Create a Node.js Web Server Framework?](./01_introduction.md)

---

### [Chapter 1: Server Startup and Request Handling - SimpleBootHttpServer and RequestResponse](./02_chapter1_server_start_request_response.md)
- 1.1. The Role and Initialization of SimpleBootHttpServer
- 1.2. The RequestResponse Object: The Core of HTTP Transactions
- 1.3. Controlling the HTTP Request/Response Flow

### [Chapter 2: Declarative Routing - Mapping URLs and Methods](./03_chapter2_declarative_routing.md)
- 2.1. Routing with `@Router` and `@Route`
- 2.2. HTTP Method Decorators (`@GET`, `@POST`, etc.)
- 2.3. Request/Response Data Binding (Body, Header, Query)

### [Chapter 3: Intercepting Requests/Responses - Filters and Endpoints](./04_chapter3_filters_endpoints.md)
- 3.1. The Filter System: Pre- and Post-Request Processing Logic
- 3.2. Endpoints: Request Lifecycle Hooks
- 3.3. Global Exception Handling and Advice

### [Chapter 4: Session Management and File Uploads](./05_chapter4_session_file_upload.md)
- 4.1. Session Management System
- 4.2. Handling File Uploads

### [Chapter 5: The Foundation of the Framework - Integrating with Simple-Boot Core](./06_chapter5_simpleboot_core_integration.md)
- 5.1. Utilizing DI, AOP, and Exception Handling from Simple-Boot Core
- 5.2. Optimized Integration for the Server Environment

### [Appendix: Going Further](./07_appendix.md)
- A. Pros and Cons of the Simple-Boot-HTTP-Server Architecture
- B. Performance Optimization and Expansion Strategies
- C. The Future of Web Server Framework Development
