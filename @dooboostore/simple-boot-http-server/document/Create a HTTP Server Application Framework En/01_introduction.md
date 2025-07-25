# Preface: Why Create a Node.js Web Server Framework?

The Node.js ecosystem already boasts excellent web server frameworks like Express, Koa, and NestJS. Nevertheless, the reason this book covers the design and implementation process of a new framework called `Simple-Boot-HTTP-Server` is to gain **insight into the fundamental workings of a web server and to build a framework tailored to one's own needs.**

`Simple-Boot-HTTP-Server` is based on `@dooboostore/simple-boot` (providing core features like DI, AOP, routing, etc.) and helps build HTTP servers in a declarative and modular way within the Node.js environment.

## Key Features of `Simple-Boot-HTTP-Server`

-   **Declarative Routing:** Maps URLs and HTTP methods to classes and methods using decorators.
-   **HTTP Method Mapping:** Provides dedicated decorators for standard HTTP methods like `@GET`, `@POST`, etc.
-   **Request/Response Handling:** Manages HTTP transactions in an integrated manner through the `RequestResponse` object.
-   **Middleware/Filters:** Intercepts requests in the request-response lifecycle to handle common concerns.
-   **Endpoints:** Defines logic to be executed at specific points in the request lifecycle.
-   **Session Management:** Offers built-in session management functionality.
-   **HTTPS Support:** Provides configuration options for secure communication.

## Main Topics Covered in This Book

-   **Server Startup and Request Handling:** Initialization of `SimpleBootHttpServer` and management of HTTP transactions through the `RequestResponse` object.
-   **Declarative Routing:** URL and method mapping using decorators.
-   **Intercepting Requests/Responses:** Controlling the request lifecycle through filters and endpoints.
-   **Session Management and File Uploads:** Implementing essential features for web applications.
-   **Integration with Simple-Boot Core:** Utilizing the DI and AOP features of the core framework.

Through this journey, you will explore the depths of a Node.js web server and acquire the knowledge necessary to design robust and scalable backend applications. Now, let's begin the journey of designing and implementing `Simple-Boot-HTTP-Server`.
