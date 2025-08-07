# Preface: Why Create a Server-Side Rendering Framework?

Modern web applications must simultaneously meet two important requirements: user experience and search engine optimization (SEO). While Single Page Applications (SPAs) provide a rich user experience, they can be disadvantageous in terms of initial loading speed and SEO. Server-Side Rendering (SSR) complements these shortcomings of SPAs, improving initial loading performance and helping search engine crawlers better understand the content.

This book covers the design and implementation process of a framework called `@dooboostore/simple-boot-http-server-ssr`. This framework integrates `@dooboostore/simple-boot-front` (a front-end framework) and `@dooboostore/simple-boot-http-server` (an HTTP server framework) to help efficiently build SSR applications in a Node.js environment.

## Key Features of `Simple-Boot-HTTP-SSR`

-   **Server-Side Rendering:** Pre-renders the client-side application on the server to generate the initial HTML.
-   **JSDOM Integration:** Provides a browser-like DOM environment on the server to enable the execution of front-end code.
-   **Component Pooling:** Manages `SimpleBootFront` instances in a pool to efficiently handle concurrent SSR requests.
-   **Data Hydration:** Transfers data fetched on the server to the client, allowing the UI to be activated on the client without duplicate API calls.
-   **Integrated Codebase:** Increases development efficiency by sharing routing, service, and component code between the server and the client.
-   **Intent-Based Communication:** Provides a flexible data communication mechanism between the client and server.

## Main Topics Covered in This Book

-   **SSR Basics:** The role of `SimpleBootHttpSSRServer` and building a server-side rendering environment using JSDOM.
-   **The SSR Filter:** The working principle of the core filter that performs SSR in the request processing pipeline.
-   **Data Hydration:** The mechanism for reusing server-rendered data on the client.
-   **Client-Server Communication:** How the client and server communicate in an SSR environment based on Intents.
-   **The Foundation of the Framework:** Integration with `Simple-Boot Core` and `Simple-Boot-Front` and optimized integration for the SSR environment.

Through this journey, you will explore the complex world of SSR applications and acquire the knowledge necessary to design high-performance, SEO-friendly web applications. Now, let's begin the journey of designing and implementing `Simple-Boot-HTTP-SSR`.
