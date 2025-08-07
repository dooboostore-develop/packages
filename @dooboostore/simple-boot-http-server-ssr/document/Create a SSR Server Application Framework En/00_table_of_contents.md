# 📖 Simple-Boot-HTTP-SSR: Designing and Implementing a Server-Side Rendering Framework

## [Preface: Why Create a Server-Side Rendering Framework?](./01_introduction.md)

---

### [Chapter 1: SSR Basics - SimpleBootHttpSSRServer and JSDOM Integration](./02_chapter1_ssr_basics_jsdom.md)
- 1.1. The Need for SSR and the Role of SimpleBootHttpSSRServer
- 1.2. Building a Server-Side Virtual DOM Environment with JSDOM
- 1.3. Managing the SimpleBootFront Instance Pool

### [Chapter 2: The SSR Filter - The Core of the Request Processing Pipeline](./03_chapter2_ssr_filter.md)
- 2.1. How the SSRFilter Works
- 2.2. The SSR Request Processing Flow
- 2.3. The Data Hydration Mechanism

### [Chapter 3: Data Hydration - SaveAroundAfter and LoadAroundBefore](./04_chapter3_data_hydration.md)
- 3.1. Server-Side Data Saving (`SaveAroundAfter`)
- 3.2. Client-Side Data Loading (`LoadAroundBefore`)
- 3.3. Data Serialization and Deserialization

### [Chapter 4: Client-Server Communication - IntentSchemeFilter](./05_chapter4_client_server_communication.md)
- 4.1. Intent-Based Communication Protocol
- 4.2. The Role and Implementation of IntentSchemeFilter
- 4.3. Client-Side Intent Emission and Server-Side Processing

### [Chapter 5: The Foundation of the Framework - Integrating with Simple-Boot Core and Front](./06_chapter5_simpleboot_integration.md)
- 5.1. Utilizing DI, AOP, and Routing from Simple-Boot Core
- 5.2. Integration and Code Sharing with Simple-Boot-Front
- 5.3. Optimized Integration for the SSR Environment

### [Appendix: Going Further](./07_appendix.md)
- A. Pros and Cons of the Simple-Boot-HTTP-SSR Architecture
- B. Performance Optimization and Expansion Strategies
- C. The Future of SSR Framework Development
