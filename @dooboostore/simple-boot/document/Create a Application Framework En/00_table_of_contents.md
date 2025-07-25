# 📖 Simple-Boot Application Framework: Design and Implementation

## [Preface: Why Do We Create an Application Framework?](./01_introduction.md)

---

### [Chapter 1: Core Management System - DI and Lifecycle](./02_chapter1_di_lifecycle.md)
- 1.1. The Need for Dependency Injection (DI)
- 1.2. The `@Sim` Decorator and SimstanceManager
- 1.3. Object Lifecycle Callbacks

### [Chapter 2: Handling Cross-Cutting Concerns - AOP and Exception Handling](./03_chapter2_aop_exception.md)
- 2.1. Understanding Aspect-Oriented Programming (AOP)
- 2.2. `@Before`, `@After`, and `@Around` Decorators
- 2.3. A Robust Exception Handling System

### [Chapter 3: Controlling Application Flow - Routing and the Intent System](./04_chapter3_routing_intent.md)
- 3.1. Designing a Flexible Router System
- 3.2. The `@Router` and `@Route` Decorators
- 3.3. The Intent-Based Event System

### [Chapter 4: Performance and Validity - Caching and Validation](./05_chapter4_cache_validation.md)
- 4.1. Implementing Method-Level Caching
- 4.2. The `@Cache` Decorator
- 4.3. The Data Validation System
- 4.4. The `@Validation` Decorator

### [Chapter 5: The Foundation of the Framework - Core Architecture](./06_chapter5_core_architecture.md)
- 5.1. The Role of SimpleApplication
- 5.2. Metadata Management and the Reflect API
- 5.3. Dynamic Extension Using Proxies

### [Appendix: Going Further](./07_appendix.md)
- A. Pros and Cons of the Simple-Boot Architecture
- B. How to Extend and Contribute
- C. A Growth Roadmap for Framework Developers
